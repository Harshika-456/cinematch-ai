from __future__ import annotations

import ast
import json
import re
import sys
import traceback
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity


MODEL_PATH = (
    Path(__file__).resolve().parent
    / "models"
    / "cinematch_recommender_v3_2.joblib"
)

MAX_RECOMMENDATIONS = 12
ENGINE_VERSION = "3.2"


# ============================================================
# BASIC HELPERS
# ============================================================

def clean(value) -> str:
    if value is None:
        return ""

    if isinstance(value, (dict, list, tuple, set, np.ndarray)):
        return str(value)

    try:
        if pd.isna(value):
            return ""
    except (TypeError, ValueError):
        pass

    return str(value).strip()


def normalize(value) -> str:
    return (
        clean(value)
        .lower()
        .replace("-", " ")
        .replace("_", " ")
        .strip()
    )


def parse_list(value) -> list[str]:
    """Parse lists, comma-separated values and malformed legacy genres."""

    if value is None:
        return []

    if isinstance(value, (list, tuple, set, np.ndarray)):
        result = []

        for item in value:
            if isinstance(item, dict):
                item = (
                    item.get("name")
                    or item.get("english_name")
                    or item.get("iso_639_1")
                    or ""
                )

            result.extend(parse_list(item))

        return list(dict.fromkeys(x for x in result if x))

    text = clean(value).strip()

    if not text:
        return []

    try:
        parsed = ast.literal_eval(text)

        if isinstance(parsed, (list, tuple, set)):
            result = []

            for item in parsed:
                result.extend(parse_list(item))

            return list(dict.fromkeys(result))

        if isinstance(parsed, str) and parsed != text:
            return parse_list(parsed)

    except (ValueError, SyntaxError, TypeError):
        pass

    text = text.strip("[](){} ")

    parts = re.split(
        r"""['"]\s+['"]|[,;|]""",
        text
    )

    result = []

    for part in parts:
        item = part.strip().strip("'\"[] ")

        if item:
            result.append(item)

    return list(dict.fromkeys(result))


def as_string_list(value) -> list[str]:
    if value is None:
        return []

    if isinstance(value, str):
        return [value.strip()] if value.strip() else []

    if isinstance(value, (list, tuple, set, np.ndarray)):
        return [
            clean(x)
            for x in value
            if clean(x)
        ]

    return [clean(value)] if clean(value) else []


def numeric(movie: dict, *keys, default=0.0) -> float:
    for key in keys:
        value = movie.get(key) if isinstance(movie, dict) else None

        if value is None:
            continue

        try:
            if pd.isna(value):
                continue
        except (TypeError, ValueError):
            pass

        try:
            number = float(value)

            if np.isfinite(number):
                return number

        except (TypeError, ValueError, OverflowError):
            pass

    return default


def first_nonempty(movie: dict, *keys, default=""):
    if not isinstance(movie, dict):
        return default

    for key in keys:
        value = movie.get(key)

        if value is None:
            continue

        try:
            if pd.isna(value):
                continue
        except (TypeError, ValueError):
            pass

        if clean(value):
            return value

    return default


def get_tmdb_id(movie: dict) -> int:
    value = first_nonempty(
        movie,
        "tmdb_id",
        "tmdbId",
        default=0
    )

    try:
        number = float(value)

        return (
            int(number)
            if np.isfinite(number)
            else 0
        )

    except (TypeError, ValueError, OverflowError):
        return 0


# ============================================================
# LANGUAGE MATCHING
# ============================================================

LANGUAGE_ALIASES = {

    # Hindi
    "hindi": {"hindi", "hi", "hin"},
    "hi": {"hindi", "hi", "hin"},
    "hin": {"hindi", "hi", "hin"},

    # Marathi
    "marathi": {"marathi", "mr", "mar"},
    "mr": {"marathi", "mr", "mar"},
    "mar": {"marathi", "mr", "mar"},

    # English
    "english": {"english", "en", "eng"},
    "en": {"english", "en", "eng"},
    "eng": {"english", "en", "eng"},

    # Tamil
    "tamil": {"tamil", "ta", "tam"},
    "ta": {"tamil", "ta", "tam"},
    "tam": {"tamil", "ta", "tam"},

    # Telugu
    "telugu": {"telugu", "te", "tel"},
    "te": {"telugu", "te", "tel"},
    "tel": {"telugu", "te", "tel"},

    # Kannada
    "kannada": {"kannada", "kn", "kan"},
    "kn": {"kannada", "kn", "kan"},
    "kan": {"kannada", "kn", "kan"},

    # Malayalam
    "malayalam": {"malayalam", "ml", "mal"},
    "ml": {"malayalam", "ml", "mal"},
    "mal": {"malayalam", "ml", "mal"},

    # Bengali
    "bengali": {"bengali", "bn", "ben"},
    "bn": {"bengali", "bn", "ben"},
    "ben": {"bengali", "bn", "ben"},

    # Odia
    "odia": {"odia", "or", "ori"},
    "or": {"odia", "or", "ori"},
    "ori": {"odia", "or", "ori"},
}


def language_values(value) -> list[str]:
    """
    Extract language names/codes from:
    - strings
    - lists
    - dictionaries
    - TMDB-style language objects
    """

    values = []

    if isinstance(value, dict):

        values.extend([
            value.get("iso_639_1", ""),
            value.get("english_name", ""),
            value.get("name", ""),
        ])

    elif isinstance(
        value,
        (list, tuple, set, np.ndarray)
    ):

        for item in value:
            values.extend(
                language_values(item)
            )

    else:
        values.extend(
            parse_list(value)
        )

    return [
        normalize(value)
        for value in values
        if normalize(value)
    ]


def get_movie_languages(movie: dict) -> list[str]:
    """
    Get every available language field from a movie.
    """

    values = []

    for key in (
        "language",
        "original_language",
        "languages",
        "spoken_languages",
    ):

        value = (
            movie.get(key)
            if isinstance(movie, dict)
            else None
        )

        if value is not None:
            values.extend(
                language_values(value)
            )

    return list(
        dict.fromkeys(values)
    )


def language_matches(
    movie: dict,
    requested_languages: list
) -> bool:
    """
    Strict language matching.

    Example:
        requested = ["Marathi"]

    Movie:
        original_language = "mr"

    => True

    Movie:
        original_language = "en"

    => False
    """

    requested_languages = as_string_list(
        requested_languages
    )

    # No language selected = don't filter.
    if not requested_languages:
        return True

    requested_codes = set()

    for language in requested_languages:

        language = normalize(language)

        requested_codes.update(
            LANGUAGE_ALIASES.get(
                language,
                {language}
            )
        )

    # --------------------------------------------------------
    # FIRST PRIORITY:
    # original_language
    # --------------------------------------------------------

    original = normalize(
        movie.get(
            "original_language",
            ""
        )
    )

    if original:

        original_codes = LANGUAGE_ALIASES.get(
            original,
            {original}
        )

        return bool(
            requested_codes.intersection(
                original_codes
            )
        )

    # --------------------------------------------------------
    # FALLBACK:
    # Other language metadata
    # --------------------------------------------------------

    movie_languages = get_movie_languages(
        movie
    )

    for value in movie_languages:

        movie_codes = LANGUAGE_ALIASES.get(
            value,
            {value}
        )

        if requested_codes.intersection(
            movie_codes
        ):
            return True

    return False


# ============================================================
# CALIBRATION
# ============================================================

def normalize_calibration(
    calibration
) -> dict:
    """
    Normalize frontend calibration data.

    IMPORTANT:

    Frontend can send:

        audioLanguages: ["Marathi"]
        audioLanguage: "Marathi"

    Backend internally uses:

        languages: ["Marathi"]

    This function connects those fields.
    """

    if not isinstance(
        calibration,
        dict
    ):
        return {}

    result = dict(calibration)

    # --------------------------------------------------------
    # Standard fields
    # --------------------------------------------------------

    for key in (
        "moods",
        "genres",
        "narrativeVectors",
    ):

        result[key] = as_string_list(
            calibration.get(
                key,
                []
            )
        )

    # --------------------------------------------------------
    # LANGUAGE FIX
    # --------------------------------------------------------

    raw_languages = (
        calibration.get("languages")
        or calibration.get("audioLanguages")
        or calibration.get("audioLanguage")
        or []
    )

    result["languages"] = as_string_list(
        raw_languages
    )

    # Keep frontend fields synchronized.

    result["audioLanguages"] = (
        result["languages"]
    )

    result["audioLanguage"] = (
        result["languages"][0]
        if result["languages"]
        else ""
    )

    # --------------------------------------------------------
    # Other fields
    # --------------------------------------------------------

    result["socialDynamic"] = clean(
        calibration.get(
            "socialDynamic",
            ""
        )
    )

    return result


# ============================================================
# HARD FILTERS
# ============================================================

def passes_hard_filters(
    movie: dict,
    calibration: dict
) -> bool:

    # Movie must have valid TMDB ID.
    if get_tmdb_id(movie) <= 0:
        return False

    # --------------------------------------------------------
    # LANGUAGE
    # --------------------------------------------------------

    languages = calibration.get(
        "languages",
        []
    )

    if languages:

        if not language_matches(
            movie,
            languages
        ):
            return False

    # --------------------------------------------------------
    # RUNTIME
    # --------------------------------------------------------

    max_duration = calibration.get(
        "maxDuration"
    )

    if max_duration not in (
        None,
        ""
    ):

        try:

            maximum = float(
                max_duration
            )

            runtime = numeric(
                movie,
                "runtime",
                "durationMinutes",
                "duration"
            )

            if runtime <= 0:
                return False

            if runtime > maximum:
                return False

        except (
            TypeError,
            ValueError,
            OverflowError
        ):
            pass

    # --------------------------------------------------------
    # RATING
    # --------------------------------------------------------

    threshold = calibration.get(
        "ratingThreshold"
    )

    if threshold not in (
        None,
        ""
    ):

        try:

            minimum = float(
                threshold
            )

            rating = numeric(
                movie,
                "rating",
                "vote_average"
            )

            if rating <= 0:
                return False

            if rating < minimum:
                return False

        except (
            TypeError,
            ValueError,
            OverflowError
        ):
            pass

    return True


# ============================================================
# QUERY BUILDING
# ============================================================

def build_query_text(
    calibration: dict
) -> str:

    parts = []

    for key in (
        "moods",
        "genres",
        "narrativeVectors"
    ):

        parts.extend(
            as_string_list(
                calibration.get(
                    key,
                    []
                )
            )
        )

    social = clean(
        calibration.get(
            "socialDynamic",
            ""
        )
    )

    if social:
        parts.append(
            social
        )

    # Language is intentionally NOT
    # included in the semantic query.
    #
    # It is a HARD FILTER.

    return " ".join(
        parts
    ).strip()


# ============================================================
# SCORING
# ============================================================

def calculate_score(
    similarity: float,
    movie: dict,
    calibration: dict
) -> float:

    # Base neural similarity.
    score = max(
        0.0,
        float(similarity)
    )

    # --------------------------------------------------------
    # Rating bonus
    # --------------------------------------------------------

    rating = numeric(
        movie,
        "rating",
        "vote_average"
    )

    if rating > 0:

        score += (
            min(
                rating,
                10.0
            ) / 10.0
        ) * 0.04

    # --------------------------------------------------------
    # Genre bonus
    # --------------------------------------------------------

    requested_genres = {
        normalize(x)
        for x in calibration.get(
            "genres",
            []
        )
    }

    movie_genres = {
        normalize(x)
        for x in parse_list(
            movie.get("genres")
        )
    }

    if requested_genres:

        overlap = (
            requested_genres
            .intersection(
                movie_genres
            )
        )

        score += 0.12 * (
            len(overlap)
            / len(requested_genres)
        )

    # --------------------------------------------------------
    # Mood bonus
    # --------------------------------------------------------

    requested_moods = {
        normalize(x)
        for x in calibration.get(
            "moods",
            []
        )
    }

    movie_moods = set()

    for key in (
        "mood",
        "emotion",
        "moods"
    ):

        movie_moods.update(
            normalize(x)
            for x in parse_list(
                movie.get(key)
            )
        )

    if (
        requested_moods
        and requested_moods.intersection(
            movie_moods
        )
    ):

        score += 0.05

    # --------------------------------------------------------
    # Theme bonus
    # --------------------------------------------------------

    requested_themes = {
        normalize(x)
        for x in calibration.get(
            "narrativeVectors",
            []
        )
    }

    movie_themes = set()

    for key in (
        "narrative",
        "narrative_vectors"
    ):

        movie_themes.update(
            normalize(x)
            for x in parse_list(
                movie.get(key)
            )
        )

    if (
        requested_themes
        and requested_themes.intersection(
            movie_themes
        )
    ):

        score += 0.05

    return score


# ============================================================
# MODEL LOADING
# ============================================================

def _load_artifact_uncached():

    if not MODEL_PATH.exists():

        raise FileNotFoundError(
            f"Model not found: {MODEL_PATH}"
        )

    artifact = joblib.load(
        MODEL_PATH
    )

    if not isinstance(
        artifact,
        dict
    ):

        raise ValueError(
            "Model artifact must be a dictionary."
        )

    required = (
        "vectorizer",
        "tfidf_matrix",
        "movies"
    )

    missing = [
        key
        for key in required
        if key not in artifact
    ]

    if missing:

        raise ValueError(
            f"Model missing keys: {missing}"
        )

    movies = artifact[
        "movies"
    ]

    matrix = artifact[
        "tfidf_matrix"
    ]

    if isinstance(
        movies,
        pd.DataFrame
    ):

        records = movies.to_dict(
            orient="records"
        )

    elif isinstance(
        movies,
        (list, tuple)
    ):

        records = list(
            movies
        )

    else:

        raise ValueError(
            "Unsupported movies format: "
            f"{type(movies).__name__}"
        )

    if matrix.shape[0] != len(
        records
    ):

        raise ValueError(
            f"Matrix rows ({matrix.shape[0]}) "
            f"do not match movie records "
            f"({len(records)})."
        )

    if any(
        not isinstance(movie, dict)
        for movie in records
    ):

        raise ValueError(
            "Some movie records are not dictionaries."
        )

    artifact[
        "movies"
    ] = records

    print(
        f"Loaded CineMatch V3.2: "
        f"{len(records)} movies",
        file=sys.stderr
    )

    return artifact


_ARTIFACT_CACHE = None


def load_artifact():
    """Load the V3.2 model once per process and reuse it."""
    global _ARTIFACT_CACHE

    if _ARTIFACT_CACHE is None:
        _ARTIFACT_CACHE = _load_artifact_uncached()

    return _ARTIFACT_CACHE


# ============================================================
# RECOMMENDATIONS
# ============================================================

def recommend(
    calibration: dict,
    artifact: dict
) -> dict:

    movies = artifact[
        "movies"
    ]

    vectorizer = artifact[
        "vectorizer"
    ]

    matrix = artifact[
        "tfidf_matrix"
    ]

    # --------------------------------------------------------
    # Build semantic query
    # --------------------------------------------------------

    query_text = build_query_text(
        calibration
    )

    if not query_text:

        return {
            "success": False,
            "error": (
                "No recommendation "
                "preferences supplied."
            ),
            "recommendations": [],
        }

    # --------------------------------------------------------
    # Generate query vector
    # --------------------------------------------------------

    query_vector = vectorizer.transform(
        [query_text]
    )

    similarities = cosine_similarity(
        query_vector,
        matrix
    ).flatten()

    if len(similarities) != len(
        movies
    ):

        raise ValueError(
            "Similarity and movie counts "
            "do not match."
        )

    # --------------------------------------------------------
    # Candidate filtering
    # --------------------------------------------------------

    # Language is ALWAYS a hard filter. Rating and runtime limits are
    # relaxed step by step if they leave too few movies, so a narrow
    # catalogue (e.g. Marathi) does not produce an empty result.
    MIN_CANDIDATES = 5

    def build_relaxation_levels(cal: dict) -> list:
        levels = [("none", dict(cal))]

        try:
            rating_min = float(cal.get("ratingThreshold"))
        except (TypeError, ValueError):
            rating_min = None

        try:
            runtime_max = float(cal.get("maxDuration"))
        except (TypeError, ValueError):
            runtime_max = None

        if rating_min is not None and rating_min > 6.0:
            c = dict(cal)
            c["ratingThreshold"] = 6.0
            levels.append(("minimum rating lowered to 6.0", c))

        if rating_min is not None and rating_min > 0:
            c = dict(cal)
            c["ratingThreshold"] = None
            levels.append(("minimum rating removed", c))

        if runtime_max is not None:
            c = dict(cal)
            c["ratingThreshold"] = None
            c["maxDuration"] = max(runtime_max, 180.0)
            levels.append(
                ("minimum rating removed, max duration raised to "
                 + str(int(c["maxDuration"])) + " min", c)
            )

        return levels

    def collect_candidates(filter_cal: dict) -> list:
        found = []

        for index, movie in enumerate(movies):

            # HARD FILTERS FIRST.
            if not passes_hard_filters(movie, filter_cal):
                continue

            similarity = float(similarities[index])

            score = calculate_score(similarity, movie, calibration)

            found.append({
                "movie": movie,
                "similarity": similarity,
                "score": score,
            })

        return found

    candidates = []
    filters_relaxed = "none"

    for label, filter_cal in build_relaxation_levels(calibration):
        found = collect_candidates(filter_cal)

        if len(found) > len(candidates) or not candidates:
            candidates = found
            filters_relaxed = label

        if len(found) >= MIN_CANDIDATES:
            break

    # --------------------------------------------------------
    # Sort
    # --------------------------------------------------------

    candidates.sort(
        key=lambda item: (
            item["score"],
            item["similarity"],
            numeric(
                item["movie"],
                "rating",
                "vote_average"
            ),
        ),
        reverse=True
    )

    # --------------------------------------------------------
    # Build recommendations
    # --------------------------------------------------------

    recommendations = []

    seen_tmdb = set()

    for candidate in candidates:

        movie = candidate[
            "movie"
        ]

        tmdb_id = get_tmdb_id(
            movie
        )

        if (
            tmdb_id <= 0
            or tmdb_id in seen_tmdb
        ):
            continue

        seen_tmdb.add(
            tmdb_id
        )

        recommendations.append({

            "id": (
                f"tmdb-{tmdb_id}"
            ),

            "title": clean(
                first_nonempty(
                    movie,
                    "title",
                    "movie_name",
                    default=""
                )
            ),

            "year": clean(
                first_nonempty(
                    movie,
                    "year",
                    "release_date",
                    default=""
                )
            ),

            "rating": numeric(
                movie,
                "rating",
                "vote_average"
            ),

            "runtime": numeric(
                movie,
                "runtime",
                "durationMinutes",
                "duration"
            ),

            "language": clean(
                first_nonempty(
                    movie,
                    "original_language",
                    "language",
                    default="Unknown"
                )
            ) or "Unknown",

            "tmdb_id": tmdb_id,

            "neuralSimilarity": round(
                candidate[
                    "similarity"
                ],
                4
            ),

            "neuralScore": round(
                candidate[
                    "score"
                ],
                4
            ),

            "director": clean(
                first_nonempty(
                    movie,
                    "director",
                    "directors",
                    default=""
                )
            ),

            "cast": clean(
                first_nonempty(
                    movie,
                    "cast",
                    default=""
                )
            ),

            "genres": parse_list(
                movie.get(
                    "genres"
                )
            ),

            "overview": clean(
                first_nonempty(
                    movie,
                    "overview",
                    "synopsis",
                    default=""
                )
            ),

            "poster_path": clean(
                movie.get(
                    "poster_path",
                    ""
                )
            ),

            "source": (
                "python-neural-engine"
            ),
        })

        if len(
            recommendations
        ) >= MAX_RECOMMENDATIONS:

            break

    # ========================================================
    # PROFILE
    # ========================================================

    profile = []

    if calibration.get(
        "moods"
    ):

        profile.append(
            "mood: "
            + ", ".join(
                calibration[
                    "moods"
                ]
            )
        )

    if calibration.get(
        "genres"
    ):

        profile.append(
            "genres: "
            + ", ".join(
                calibration[
                    "genres"
                ]
            )
        )

    if calibration.get(
        "narrativeVectors"
    ):

        profile.append(
            "themes: "
            + ", ".join(
                calibration[
                    "narrativeVectors"
                ]
            )
        )

    if calibration.get(
        "socialDynamic"
    ):

        profile.append(
            "social dynamic: "
            + calibration[
                "socialDynamic"
            ]
        )

    if calibration.get(
        "languages"
    ):

        profile.append(
            "language: "
            + ", ".join(
                calibration[
                    "languages"
                ]
            )
        )

    # ========================================================
    # RETURN
    # ========================================================

    return {

        "success": True,

        "filtersRelaxed": filters_relaxed,

        "engine": (
            "cinematch-v3.2"
        ),

        "modelVersion": str(
            artifact.get(
                "version",
                ENGINE_VERSION
            )
        ),

        "weightedFeatures": bool(
            artifact.get(
                "weighted_features",
                True
            )
        ),

        "profileHypothesis": (
            " | ".join(profile)
        ),

        "userTensor": {

            "moods": calibration.get(
                "moods",
                []
            ),

            "genres": calibration.get(
                "genres",
                []
            ),

            "narrativeVectors": (
                calibration.get(
                    "narrativeVectors",
                    []
                )
            ),

            "socialDynamic": (
                calibration.get(
                    "socialDynamic",
                    ""
                )
            ),

            "languages": (
                calibration.get(
                    "languages",
                    []
                )
            ),

            "audioLanguages": (
                calibration.get(
                    "audioLanguages",
                    []
                )
            ),

            "audioLanguage": (
                calibration.get(
                    "audioLanguage",
                    ""
                )
            ),

            "maxDuration": (
                calibration.get(
                    "maxDuration"
                )
            ),

            "ratingThreshold": (
                calibration.get(
                    "ratingThreshold"
                )
            ),

            "queryText": query_text,
        },

        "recommendations": (
            recommendations
        ),
    }


# ============================================================
# MAIN REQUEST PROCESSING
# ============================================================

def process_request(
    request
) -> dict:

    if not isinstance(
        request,
        dict
    ):

        return {
            "success": False,
            "error": (
                "Request must be "
                "a JSON object."
            ),
            "recommendations": [],
        }

    calibration = request.get(
        "calibration",
        request
    )

    if not isinstance(
        calibration,
        dict
    ):

        return {
            "success": False,
            "error": (
                "Invalid calibration object."
            ),
            "recommendations": [],
        }

    normalized_calibration = (
        normalize_calibration(
            calibration
        )
    )

    # Debug information to stderr.
    # This will NOT break JSON output.

    print(
        "Calibration:",
        json.dumps(
            normalized_calibration,
            ensure_ascii=False
        ),
        file=sys.stderr
    )

    print(
        "Requested languages:",
        normalized_calibration.get(
            "languages",
            []
        ),
        file=sys.stderr
    )

    return recommend(
        normalized_calibration,
        load_artifact()
    )


# ============================================================
# PROGRAM ENTRY
# ============================================================

def serve():
    """
    Persistent worker mode: python neural_engine.py --server

    Loads the model once, then answers one JSON request per stdin line
    with one JSON response per stdout line.
    """

    try:
        sys.stdin.reconfigure(encoding="utf-8")
    except Exception:
        pass

    load_artifact()

    print(json.dumps({"ready": True}), flush=True)

    for line in sys.stdin:

        line = line.strip()

        if not line:
            continue

        try:
            result = process_request(json.loads(line))
        except Exception as error:
            traceback.print_exc(file=sys.stderr)
            result = {
                "success": False,
                "error": str(error),
                "recommendations": [],
            }

        # ensure_ascii=True keeps stdout safe on any Windows code page.
        print(json.dumps(result, ensure_ascii=True), flush=True)


def main():

    if "--server" in sys.argv:
        serve()
        return

    raw = sys.stdin.read()

    if not raw.strip():

        print(
            json.dumps({
                "success": False,
                "error": (
                    "No JSON input received."
                ),
                "recommendations": [],
            })
        )

        return

    try:

        request = json.loads(
            raw
        )

        result = process_request(
            request
        )

        print(
            json.dumps(
                result,
                ensure_ascii=False
            )
        )

    except Exception as error:

        traceback.print_exc(
            file=sys.stderr
        )

        print(
            json.dumps({
                "success": False,
                "error": str(error),
                "recommendations": [],
            },
            ensure_ascii=False)
        )


if __name__ == "__main__":
    main()