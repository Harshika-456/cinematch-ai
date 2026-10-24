
from __future__ import annotations

import ast
import json
import re
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel


ROOT = Path(__file__).resolve().parents[1]
DATASET_PATH = ROOT / "combined_cinematch_dataset_v3.csv"
MODEL_DIR = ROOT / "models"
OUTPUT_MODEL = MODEL_DIR / "cinematch_recommender_v3_2.joblib"
STATS_PATH = MODEL_DIR / "training_stats_v3_2.json"


def clean(value) -> str:
    if value is None:
        return ""
    try:
        if pd.isna(value):
            return ""
    except (TypeError, ValueError):
        pass
    return str(value).strip()


def parse_list(value) -> list[str]:
    """Parse valid lists and repair common malformed list strings."""
    if value is None:
        return []

    if isinstance(value, (list, tuple, set)):
        items = list(value)
    else:
        text = clean(value)
        if not text or text.lower() in {"nan", "none", "null", "[]"}:
            return []

        try:
            parsed = ast.literal_eval(text)
            if isinstance(parsed, (list, tuple, set)):
                items = list(parsed)
            elif isinstance(parsed, str):
                items = [parsed]
            else:
                items = [text]
        except (ValueError, SyntaxError):
            # Repair strings like:
            # ["Comedy' 'Drama' 'Romance"]
            # ['Comedy' 'Drama']
            repaired = text.strip().strip("[]")
            repaired = re.sub(r"""['"]\s+['"]""", ",", repaired)
            try:
                parsed = ast.literal_eval("[" + repaired + "]")
                items = parsed if isinstance(parsed, list) else [repaired]
            except (ValueError, SyntaxError):
                items = re.split(r"[,;|]", repaired)

    result = []
    seen = set()

    for item in items:
        item = clean(item).strip("[]'\" ")
        if not item:
            continue

        # Some malformed values still contain several quoted items.
        parts = re.split(r"""['"]\s+['"]""", item)
        for part in parts:
            part = clean(part).strip("[]'\" ")
            if part and part.lower() not in seen:
                result.append(part)
                seen.add(part.lower())

    return result


def build_feature_text(row) -> str:
    # Build features from raw columns, never from the old feature_text.
    fields = [
        ("title", 2),
        ("overview", 3),
        ("genres", 3),
        ("moods", 2),
        ("narrative_vectors", 2),
        ("social_dynamics", 1),
        ("languages", 1),
        ("keywords", 2),
        ("mood", 2),
        ("emotion", 2),
        ("narrative", 2),
        ("social_context", 1),
        ("interest", 1),
        ("cast", 1),
        ("directors", 1),
    ]

    parts = []

    for column, weight in fields:
        value = row.get(column, "")

        if column in {
            "genres", "moods", "narrative_vectors",
            "social_dynamics", "languages", "keywords"
        }:
            text = " ".join(parse_list(value))
        else:
            text = clean(value)

        if text:
            parts.extend([text] * weight)

    mooduel = row.get("mooduel", "")
    if isinstance(mooduel, str) and mooduel.strip():
        try:
            mooduel = ast.literal_eval(mooduel)
        except (ValueError, SyntaxError):
            mooduel = {}

    if isinstance(mooduel, dict):
        for key in ("pacing", "emotional_arc", "ending_type", "vibe_sentence"):
            value = clean(mooduel.get(key))
            if value:
                parts.append(value)

    # Include original language as a feature but use it separately
    # for hard filtering at recommendation time.
    original_language = clean(row.get("original_language"))
    if original_language:
        parts.append(original_language)

    return re.sub(r"\s+", " ", " ".join(parts)).strip()


def main():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATASET_PATH}")

    print("Loading:", DATASET_PATH)
    df = pd.read_csv(DATASET_PATH, low_memory=False)
    print("Rows loaded:", len(df))

    required = {"title", "tmdb_id"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")

    # Keep rows with usable titles; preserve row order after filtering.
    df["title"] = df["title"].map(clean)
    df = df[df["title"].ne("")].copy()
    df.reset_index(drop=True, inplace=True)

    print("Rebuilding clean feature text...")
    df["feature_text_v3_2"] = df.apply(build_feature_text, axis=1)
    df = df[df["feature_text_v3_2"].str.len() > 0].copy()
    df.reset_index(drop=True, inplace=True)

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        min_df=2,
        max_features=60000,
        sublinear_tf=True,
    )

    print("Training TF-IDF...")
    tfidf_matrix = vectorizer.fit_transform(df["feature_text_v3_2"])
    print("TF-IDF shape:", tfidf_matrix.shape)

    # Store a DataFrame to retain the metadata columns used by neural_engine.py.
    # Keep the cleaned feature text available for diagnostics.
    df["feature_text"] = df["feature_text_v3_2"]
    df.drop(columns=["feature_text_v3_2"], inplace=True)

    artifact = {
        "vectorizer": vectorizer,
        "tfidf_matrix": tfidf_matrix,
        "movies": df,
        "feature_columns": [
            "title", "overview", "genres", "moods",
            "narrative_vectors", "social_dynamics",
            "languages", "keywords", "mood", "emotion",
            "narrative",
        ],
        "version": "3.2",
        "weighted_features": True,
    }

    print("Saving separate V3.2 model...")
    joblib.dump(artifact, OUTPUT_MODEL, compress=3)

    stats = {
        "version": "3.2",
        "total_movies": len(df),
        "tfidf_features": int(tfidf_matrix.shape[1]),
        "dataset": DATASET_PATH.name,
        "model": OUTPUT_MODEL.name,
        "original_v3_1_preserved": True,
    }
    STATS_PATH.write_text(
        json.dumps(stats, indent=2),
        encoding="utf-8",
    )

    print("\nTraining complete!")
    print(json.dumps(stats, indent=2))
    print("\nV3.1 has not been modified.")


if __name__ == "__main__":
    main()
