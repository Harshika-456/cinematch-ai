
import os
import time
import re
from pathlib import Path
from difflib import SequenceMatcher

import pandas as pd
import requests
from dotenv import load_dotenv

# ==========================================
# CONFIGURATION
# ==========================================

ROOT = Path.cwd()
load_dotenv(ROOT / ".env", override=True)

TMDB_ACCESS_TOKEN = os.getenv("TMDB_ACCESS_TOKEN", "").strip()

if not TMDB_ACCESS_TOKEN:
    raise ValueError(
        "TMDB_ACCESS_TOKEN not found in .env. "
        "Add your TMDB API Read Access Token."
    )

INPUT_FILE = ROOT / "Hindi-Marathi_movies.csv"
OUTPUT_FILE = ROOT / "hindi_marathi_tmdb_enriched.csv"

BASE_URL = "https://api.themoviedb.org/3"
CHECKPOINT_EVERY = 25
REQUEST_DELAY = 0.25

if not INPUT_FILE.exists():
    raise FileNotFoundError(f"Input file not found: {INPUT_FILE}")

# ==========================================
# TMDB SESSION
# ==========================================

session = requests.Session()
session.headers.update({
    "Authorization": f"Bearer {TMDB_ACCESS_TOKEN}",
    "accept": "application/json"
})

def normalize_title(title):
    """Normalize titles for comparison."""
    if pd.isna(title):
        return ""
    title = str(title).lower().strip()
    return re.sub(r"[^a-z0-9]+", "", title)

def valid_year(year):
    try:
        if pd.isna(year):
            return None
        year = int(float(year))
        return year if 1800 <= year <= 2100 else None
    except (ValueError, TypeError, OverflowError):
        return None

def get_json(url, params=None):
    """Make a TMDB request with basic retry handling."""
    for attempt in range(3):
        try:
            response = session.get(
                url, params=params, timeout=30
            )

            if response.status_code == 429:
                wait = int(response.headers.get("Retry-After", 3))
                print(f"Rate limited. Waiting {wait} seconds...")
                time.sleep(wait)
                continue

            response.raise_for_status()
            return response.json()

        except requests.RequestException as error:
            if attempt == 2:
                print("Request failed:", error)
                return None
            time.sleep(2 * (attempt + 1))

    return None

# ==========================================
# SEARCH AND MATCH
# ==========================================

def search_movie(title, year=None, language=None):
    if not str(title).strip() or pd.isna(title):
        return None

    year = valid_year(year)

    params = {
        "query": str(title).strip(),
        "include_adult": "false",
        "region": "IN",
        "page": 1
    }

    if year:
        params["year"] = year

    data = get_json(f"{BASE_URL}/search/movie", params)
    time.sleep(REQUEST_DELAY)

    # If the year-specific search found nothing, try without year.
    if data is None:
        return None

    candidates = data.get("results", [])

    if not candidates and year:
        params.pop("year", None)
        data = get_json(f"{BASE_URL}/search/movie", params)
        time.sleep(REQUEST_DELAY)
        if data is None:
            return None
        candidates = data.get("results", [])

    if not candidates:
        return None

    target = normalize_title(title)
    wanted_language = str(language).strip().lower()

    language_codes = {
        "hindi": "hi",
        "marathi": "mr"
    }
    wanted_code = language_codes.get(wanted_language)

    ranked = []

    for movie in candidates:
        candidate_title = normalize_title(movie.get("title", ""))
        original_title = normalize_title(
            movie.get("original_title", "")
        )

        title_score = max(
            SequenceMatcher(None, target, candidate_title).ratio(),
            SequenceMatcher(None, target, original_title).ratio()
        )

        release_date = movie.get("release_date", "")
        movie_year = valid_year(
            release_date[:4] if release_date else None
        )

        if year and movie_year:
            year_difference = abs(year - movie_year)
            year_score = 1.0 if year_difference == 0 else (
                0.65 if year_difference == 1 else
                0.25 if year_difference <= 3 else 0.0
            )
        elif year:
            year_score = 0.0
        else:
            year_score = 0.5

        original_language = movie.get(
            "original_language", ""
        ).lower()

        language_score = (
            1.0 if wanted_code and original_language == wanted_code
            else 0.5 if not wanted_code
            else 0.0
        )

        score = (
            0.70 * title_score
            + 0.20 * year_score
            + 0.10 * language_score
        )

        ranked.append((score, movie))

    ranked.sort(key=lambda item: item[0], reverse=True)
    best_score, best_movie = ranked[0]

    # Avoid attaching metadata from a clearly different movie.
    if best_score < 0.50:
        return None

    return best_movie

# ==========================================
# GET FULL MOVIE DETAILS
# ==========================================

def get_movie_details(tmdb_id):
    details = get_json(
        f"{BASE_URL}/movie/{tmdb_id}",
        {"append_to_response": "credits"}
    )
    time.sleep(REQUEST_DELAY)
    return details

def empty_metadata(row):
    return {
        **row.to_dict(),
        "tmdb_id": None,
        "tmdb_title": None,
        "tmdb_rating": None,
        "tmdb_vote_count": None,
        "tmdb_runtime": None,
        "tmdb_overview": None,
        "tmdb_original_language": None,
        "tmdb_release_date": None,
        "poster_path": None,
        "backdrop_path": None,
        "tmdb_match_score": None,
        "tmdb_match_status": "not_found"
    }

# ==========================================
# LOAD DATA AND RESUME CHECKPOINT
# ==========================================

df = pd.read_csv(INPUT_FILE, low_memory=False)

required = {"movie_name", "year", "language"}
missing = required - set(df.columns)

if missing:
    raise ValueError(f"Missing required input columns: {missing}")

print("Input movies:", len(df))
print("Languages:")
print(df["language"].value_counts(dropna=False))
print("Access token loaded successfully.")

# Reuse prior checkpoint only if it has the same row count.
if OUTPUT_FILE.exists():
    previous = pd.read_csv(OUTPUT_FILE, low_memory=False)

    if len(previous) == len(df) and "tmdb_id" in previous.columns:
        enriched = previous.to_dict("records")
        print("Resuming from existing output checkpoint.")
    else:
        enriched = [empty_metadata(row) for _, row in df.iterrows()]
else:
    enriched = [empty_metadata(row) for _, row in df.iterrows()]

# ==========================================
# ENRICH MOVIES
# ==========================================

for index, row in df.iterrows():
    current = enriched[index]

    # Skip a successfully enriched row when resuming.
    if pd.notna(current.get("tmdb_id")):
        continue

    title = row["movie_name"]
    year = row["year"]
    language = row["language"]

    print(
        f"[{index + 1}/{len(df)}] "
        f"{title} ({language}, {year})",
        flush=True
    )

    result = search_movie(title, year, language)

    if result is None:
        enriched[index] = empty_metadata(row)
    else:
        details = get_movie_details(result["id"])

        if details is None:
            details = result

        expected = normalize_title(title)
        found = max(
            SequenceMatcher(
                None, expected,
                normalize_title(details.get("title", ""))
            ).ratio(),
            SequenceMatcher(
                None, expected,
                normalize_title(details.get("original_title", ""))
            ).ratio()
        )

        enriched[index] = {
            **row.to_dict(),
            "tmdb_id": details.get("id"),
            "tmdb_title": details.get("title"),
            "tmdb_rating": details.get("vote_average"),
            "tmdb_vote_count": details.get("vote_count"),
            "tmdb_runtime": details.get("runtime"),
            "tmdb_overview": details.get("overview"),
            "tmdb_original_language": details.get(
                "original_language"
            ),
            "tmdb_release_date": details.get("release_date"),
            "poster_path": details.get("poster_path"),
            "backdrop_path": details.get("backdrop_path"),
            "tmdb_match_score": round(found, 3),
            "tmdb_match_status": (
                "matched" if found >= 0.70
                else "review"
            )
        }

    if (index + 1) % CHECKPOINT_EVERY == 0:
        pd.DataFrame(enriched).to_csv(
            OUTPUT_FILE, index=False, encoding="utf-8-sig"
        )
        print(f"Checkpoint saved at row {index + 1}.")

# ==========================================
# SAVE FINAL OUTPUT
# ==========================================

result_df = pd.DataFrame(enriched)
result_df.to_csv(
    OUTPUT_FILE, index=False, encoding="utf-8-sig"
)

matched = result_df["tmdb_id"].notna().sum()

print("\n========== ENRICHMENT COMPLETE ==========")
print("Output:", OUTPUT_FILE)
print("Total movies:", len(result_df))
print("TMDB matches:", matched)
print("TMDB missing:", len(result_df) - matched)
print("Needs review:", (result_df["tmdb_match_status"] == "review").sum())
print("\nLanguage distribution:")
print(result_df["language"].value_counts(dropna=False))
print("\nSample enriched movies:")
print(
    result_df[
        ["movie_name", "tmdb_title", "tmdb_id",
         "tmdb_rating", "tmdb_runtime", "tmdb_match_status"]
    ].head(10).to_string(index=False)
)
