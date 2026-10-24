from __future__ import annotations

import ast
import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors


ROOT = Path(__file__).resolve().parents[1]

DATASET_PATH = ROOT / "combined_cinematch_dataset.csv"
MODEL_DIR = ROOT / "models"
MODEL_DIR.mkdir(exist_ok=True)

OUTPUT_MODEL = MODEL_DIR / "cinematch_recommender_v2.joblib"


def parse_list(value):
    if value is None:
        return []

    if isinstance(value, list):
        return value

    text = str(value).strip()

    if not text:
        return []

    try:
        parsed = ast.literal_eval(text)

        if isinstance(parsed, list):
            return [str(x).strip() for x in parsed if str(x).strip()]
    except Exception:
        pass

    return [
        x.strip()
        for x in text.split(",")
        if x.strip()
    ]


def clean(value):
    if pd.isna(value):
        return ""

    return str(value).strip()


def build_feature_text(row):

    title = clean(row.get("title"))
    overview = clean(row.get("overview"))

    genres = parse_list(row.get("genres"))
    moods = parse_list(row.get("moods"))
    narrative = parse_list(row.get("narrative_vectors"))
    social = parse_list(row.get("social_dynamics"))
    languages = parse_list(row.get("languages"))
    keywords = parse_list(row.get("keywords"))

    # New Hindi/Marathi feature fields
    mood = clean(row.get("mood"))
    emotion = clean(row.get("emotion"))
    narrative_new = clean(row.get("narrative"))
    social_new = clean(row.get("social_context"))
    interest = clean(row.get("interest"))

    cast = clean(row.get("cast"))
    directors = clean(row.get("directors"))

    mooduel = row.get("mooduel")

    mooduel_text = ""

    if mooduel:

        if isinstance(mooduel, str):
            try:
                mooduel = ast.literal_eval(mooduel)
            except Exception:
                mooduel = {}

        if isinstance(mooduel, dict):

            mooduel_text = " ".join([
                clean(mooduel.get("pacing")),
                clean(mooduel.get("emotional_arc")),
                clean(mooduel.get("ending_type")),
                clean(mooduel.get("vibe_sentence")),
            ])

    parts = [
        title,
        overview,

        # Old CineMatch features
        " ".join(genres),
        " ".join(moods),
        " ".join(narrative),
        " ".join(social),
        " ".join(languages),
        " ".join(keywords),

        # New Hindi/Marathi features
        mood,
        emotion,
        narrative_new,
        social_new,
        interest,

        cast,
        directors,

        mooduel_text,
    ]

    return " ".join(
        part for part in parts if part
    )


def main():

    print("=" * 60)
    print("CINEMATCH V2 TRAINING")
    print("=" * 60)

    # --------------------------------------------------
    # Load combined dataset
    # --------------------------------------------------

    if not DATASET_PATH.exists():

        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH}"
        )

    print("\nLoading combined dataset...")

    df = pd.read_csv(DATASET_PATH)

    print(f"Rows loaded: {len(df)}")

    # --------------------------------------------------
    # Build feature text
    # --------------------------------------------------

    print("\nBuilding feature text...")

    df["feature_text"] = df.apply(
        build_feature_text,
        axis=1
    )

    # Remove rows with no useful text
    df = df[
        df["feature_text"].str.strip().ne("")
    ].copy()

    df = df.reset_index(drop=True)

    print(f"Usable movies: {len(df)}")

    # --------------------------------------------------
    # TF-IDF
    # --------------------------------------------------

    print("\nTraining TF-IDF...")

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        min_df=2,
        max_features=60000,
    )

    X = vectorizer.fit_transform(
        df["feature_text"]
    )

    print(f"TF-IDF shape: {X.shape}")

    # --------------------------------------------------
    # Nearest Neighbors
    # --------------------------------------------------

    print("\nTraining NearestNeighbors...")

    knn = NearestNeighbors(
        metric="cosine",
        algorithm="brute",
        n_neighbors=min(50, len(df)),
    )

    knn.fit(X)

    # --------------------------------------------------
    # Save model
    # --------------------------------------------------

    movies = df.to_dict(
        orient="records"
    )

    artifact = {

        "version": 2,

        "source_datasets": [
            "Original CineMatch dataset: 30610 movies",
            "Hindi-Marathi dataset: 2501 movies",
        ],

        "vectorizer": vectorizer,

        "knn": knn,

        "movies": movies,

        "stats": {
            "total_movies": len(movies),
            "tfidf_features": X.shape[1],
            "old_movies": 30610,
            "new_hindi_marathi_movies": 2501,
        },
    }

    print("\nSaving V2 model...")

    joblib.dump(
        artifact,
        OUTPUT_MODEL,
        compress=3,
    )

    stats_path = (
        MODEL_DIR /
        "training_stats_v2.json"
    )

    stats_path.write_text(
        json.dumps(
            artifact["stats"],
            indent=2,
        ),
        encoding="utf-8",
    )

    print("\n" + "=" * 60)
    print("CINEMATCH V2 TRAINING COMPLETE")
    print("=" * 60)

    print(f"\nMovies trained: {len(movies)}")

    print(
        f"TF-IDF features: {X.shape[1]}"
    )

    print(
        f"\nModel saved to:\n{OUTPUT_MODEL}"
    )

    print(
        "\nOLD MODEL WAS NOT TOUCHED."
    )


if __name__ == "__main__":
    main()