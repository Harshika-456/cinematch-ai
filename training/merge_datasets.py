import os
import json
import joblib
import pandas as pd

MODEL_PATH = "models/cinematch_recommender.joblib"
NEW_DATA_PATH = "hindi_marathi_cinematch_ready.csv"
OUTPUT_PATH = "combined_cinematch_dataset.csv"


# ---------------------------------------------------------
# 1. Load OLD dataset from existing trained model
# ---------------------------------------------------------
print("Loading old CineMatch model...")

artifact = joblib.load(MODEL_PATH)
old_movies = artifact["movies"]

print(f"Old movies: {len(old_movies)}")


# ---------------------------------------------------------
# 2. Load NEW Hindi + Marathi dataset
# ---------------------------------------------------------
print("\nLoading Hindi + Marathi dataset...")

new_df = pd.read_csv(NEW_DATA_PATH)

print(f"New movies: {len(new_df)}")


# ---------------------------------------------------------
# 3. Helper functions
# ---------------------------------------------------------
def safe_str(value):
    if pd.isna(value):
        return ""
    return str(value)


def make_list(value):
    if not value:
        return []

    if isinstance(value, list):
        return value

    return [x.strip() for x in str(value).split(",") if x.strip()]


def make_mooduel(row):
    """
    Create a compatible Mooduel-style structure
    for the newly added movies.
    """

    mood = safe_str(row.get("mood", ""))
    emotion = safe_str(row.get("emotion", ""))
    narrative = safe_str(row.get("narrative", ""))
    social = safe_str(row.get("social_context", ""))
    interest = safe_str(row.get("interest", ""))

    # Approximate values based on categorical features.
    # These are NOT trained Mooduel labels.
    values = {
        "valence": 0.0,
        "arousal": 0.5,
        "dominance": 0.0,
        "absorption": 0.5,
        "hedonic": 0.5,
        "eudaimonic": 0.5,
        "psych_rich": 0.5,
        "comfort_level": 0.5,
        "conversation_potential": 0.5,
        "pacing": "moderate",
        "emotional_arc": narrative,
        "ending_type": "",
        "vibe_sentence": (
            f"{mood} {emotion} {narrative} "
            f"{social} {interest}"
        ).strip()
    }

    return values


# ---------------------------------------------------------
# 4. Convert OLD records
# ---------------------------------------------------------
old_records = []

for movie in old_movies:

    if not isinstance(movie, dict):
        continue

    record = dict(movie)

    # Mark source
    record["dataset_source"] = "original_cinematch"

    old_records.append(record)


print(f"Valid old records: {len(old_records)}")


# ---------------------------------------------------------
# 5. Convert NEW records to compatible structure
# ---------------------------------------------------------
new_records = []

for _, row in new_df.iterrows():

    title = safe_str(row.get("movie_name", ""))
    overview = safe_str(row.get("overview", ""))

    genres = make_list(row.get("genre", ""))
    cast = make_list(row.get("cast", ""))

    language = safe_str(row.get("language", "")).lower()

    mood = safe_str(row.get("mood", ""))
    emotion = safe_str(row.get("emotion", ""))
    narrative = safe_str(row.get("narrative", ""))
    social = safe_str(row.get("social_context", ""))
    interest = safe_str(row.get("interest", ""))

    mooduel = make_mooduel(row)

    feature_text = " ".join([
        title,
        overview,
        " ".join(genres),
        " ".join(cast),
        language,
        mood,
        emotion,
        narrative,
        social,
        interest,
        mooduel["vibe_sentence"]
    ])

    record = {
        "id": safe_str(row.get("tmdb_id", row.get("movie_id", ""))),
        "title": title,
        "overview": overview,
        "genres": genres,
        "cast": cast,
        "spoken_languages": [language] if language else [],

        "mooduel": mooduel,

        "mood": mood,
        "emotion": emotion,
        "narrative": narrative,
        "social_context": social,
        "interest": interest,

        "feature_text": feature_text,

        "release_date": safe_str(row.get("release_date", "")),
        "year": safe_str(row.get("year", "")),
        "runtime": row.get("tmdb_runtime", 0),
        "vote_average": row.get("tmdb_rating", 0),
        "vote_count": row.get("tmdb_vote_count", 0),

        "poster_path": safe_str(row.get("poster_path", "")),
        "backdrop_path": safe_str(row.get("backdrop_path", "")),

        "dataset_source": "hindi_marathi_2501"
    }

    new_records.append(record)


print(f"New records prepared: {len(new_records)}")


# ---------------------------------------------------------
# 6. Combine
# ---------------------------------------------------------
combined_records = old_records + new_records

print("\n================================")
print("COMBINED DATASET")
print("================================")
print(f"Total before duplicate removal: {len(combined_records)}")


# ---------------------------------------------------------
# 7. Remove duplicate TMDB IDs
# ---------------------------------------------------------
seen_ids = set()
final_records = []

for movie in combined_records:

    movie_id = str(movie.get("id", "")).strip()

    if movie_id and movie_id in seen_ids:
        continue

    if movie_id:
        seen_ids.add(movie_id)

    final_records.append(movie)


print(f"Total after duplicate removal: {len(final_records)}")


# ---------------------------------------------------------
# 8. Save
# ---------------------------------------------------------
df = pd.DataFrame(final_records)

df.to_csv(
    OUTPUT_PATH,
    index=False,
    encoding="utf-8-sig"
)

print("\n================================")
print("MERGE COMPLETE")
print("================================")
print(f"Output: {OUTPUT_PATH}")
print(f"Final movies: {len(df)}")
print(f"Old movies: {len(old_records)}")
print(f"New movies: {len(new_records)}")