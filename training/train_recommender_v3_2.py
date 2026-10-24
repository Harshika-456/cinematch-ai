
from __future__ import annotations

import ast
import json
import re
from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer


ROOT = Path(__file__).resolve().parents[1]

DATASET_PATH = ROOT / "combined_cinematch_dataset_v3.csv"
MODEL_DIR = ROOT / "models"

OUTPUT_MODEL = (
    MODEL_DIR / "cinematch_recommender_v3_2.joblib"
)

STATS_PATH = (
    MODEL_DIR / "training_stats_v3_2.json"
)


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
    """Parse list-like dataset values safely."""

    if value is None:
        return []

    if isinstance(value, (list, tuple, set)):
        items = list(value)

    else:
        text = clean(value)

        if not text or text.lower() in {
            "nan",
            "none",
            "null",
            "[]",
        }:
            return []

        try:
            parsed = ast.literal_eval(text)

            if isinstance(
                parsed,
                (list, tuple, set),
            ):
                items = list(parsed)

            elif isinstance(parsed, str):
                items = [parsed]

            else:
                items = [text]

        except (ValueError, SyntaxError):

            repaired = text.strip().strip("[]")

            repaired = re.sub(
                r"""['"]\s+['"]""",
                ",",
                repaired,
            )

            try:
                parsed = ast.literal_eval(
                    "[" + repaired + "]"
                )

                if isinstance(parsed, list):
                    items = parsed
                else:
                    items = [repaired]

            except (ValueError, SyntaxError):

                items = re.split(
                    r"[,;|]",
                    repaired,
                )

    result = []
    seen = set()

    for item in items:

        item = clean(item).strip(
            "[]'\" "
        )

        if not item:
            continue

        parts = re.split(
            r"""['"]\s+['"]""",
            item,
        )

        for part in parts:

            part = clean(part).strip(
                "[]'\" "
            )

            key = part.lower()

            if part and key not in seen:
                result.append(part)
                seen.add(key)

    return result


def build_feature_text(row) -> str:

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

        value = row.get(
            column,
            "",
        )

        if column in {
            "genres",
            "moods",
            "narrative_vectors",
            "social_dynamics",
            "languages",
            "keywords",
        }:

            text = " ".join(
                parse_list(value)
            )

        else:

            text = clean(value)

        if text:
            parts.extend(
                [text] * weight
            )

    mooduel = row.get(
        "mooduel",
        "",
    )

    if (
        isinstance(mooduel, str)
        and mooduel.strip()
    ):

        try:
            mooduel = ast.literal_eval(
                mooduel
            )

        except (
            ValueError,
            SyntaxError,
        ):

            mooduel = {}

    if isinstance(
        mooduel,
        dict,
    ):

        for key in (
            "pacing",
            "emotional_arc",
            "ending_type",
            "vibe_sentence",
        ):

            value = clean(
                mooduel.get(key)
            )

            if value:
                parts.append(value)

    original_language = clean(
        row.get(
            "original_language"
        )
    )

    if original_language:
        parts.append(
            original_language
        )

    return re.sub(
        r"\s+",
        " ",
        " ".join(parts),
    ).strip()


def main():

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    if not DATASET_PATH.exists():

        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH}"
        )

    # =========================================================
    # LOAD DATASET
    # =========================================================

    print(
        "Loading:",
        DATASET_PATH,
    )

    df = pd.read_csv(
        DATASET_PATH,
        low_memory=False,
    )

    print(
        "Rows loaded:",
        len(df),
    )

    # =========================================================
    # VALIDATE REQUIRED COLUMNS
    # =========================================================

    required = {
        "title",
        "tmdb_id",
    }

    missing = (
        required
        - set(df.columns)
    )

    if missing:

        raise ValueError(
            f"Missing required columns: {sorted(missing)}"
        )

    # =========================================================
    # REMOVE DAMAN
    # =========================================================

    before = len(df)

    df = df[
        pd.to_numeric(
            df["tmdb_id"],
            errors="coerce",
        ).ne(1024350)
    ].copy()

    daman_removed = (
        before - len(df)
    )

    print(
        "Daman rows removed:",
        daman_removed,
    )

    # =========================================================
    # REPAIR MISSING TMDB ID
    # =========================================================
    #
    # Taare Zameen Par (2007)
    # Correct TMDB ID = 7508
    #
    # This is done BEFORE duplicate removal so that
    # the movie participates correctly in TMDB-ID
    # deduplication.
    # =========================================================

    title_series = (
        df["title"]
        .astype(str)
        .str.strip()
        .str.lower()
    )

    year_series = pd.to_numeric(
        df["year"],
        errors="coerce",
    ) if "year" in df.columns else pd.Series(
        [None] * len(df),
        index=df.index,
    )

    missing_tmdb_mask = (
        df["tmdb_id"].isna()
        & title_series.eq(
            "taare zameen par"
        )
        & year_series.eq(2007)
    )

    repaired_tmdb_rows = int(
        missing_tmdb_mask.sum()
    )

    df.loc[
        missing_tmdb_mask,
        "tmdb_id",
    ] = 7508

    print(
        "Missing TMDB IDs repaired:",
        repaired_tmdb_rows,
    )

    # =========================================================
    # REMOVE OTHER MISSING TMDB IDS
    # =========================================================
    #
    # Any remaining missing TMDB ID cannot participate
    # reliably in TMDB-based deduplication.
    # Remove those rows rather than creating an invalid model.
    # =========================================================

    before = len(df)

    missing_tmdb_mask = (
        df["tmdb_id"].isna()
    )

    missing_tmdb_removed = int(
        missing_tmdb_mask.sum()
    )

    if missing_tmdb_removed > 0:

        print(
            "WARNING: Removing remaining rows with missing TMDB IDs:",
            missing_tmdb_removed,
        )

        df = df[
            ~missing_tmdb_mask
        ].copy()

    # =========================================================
    # NORMALIZE TMDB IDS
    # =========================================================
    #
    # Convert values such as 7508.0 -> 7508.
    # This prevents numeric/string representation issues
    # from creating duplicate IDs.
    # =========================================================

    numeric_tmdb = pd.to_numeric(
        df["tmdb_id"],
        errors="coerce",
    )

    df["tmdb_id"] = numeric_tmdb.astype(
        "Int64"
    )

    # =========================================================
    # REMOVE DUPLICATE TMDB IDS
    # =========================================================
    #
    # Keep the first occurrence.
    #
    # Same title + different TMDB ID is NOT removed.
    # =========================================================

    before = len(df)

    df = df.drop_duplicates(
        subset=["tmdb_id"],
        keep="first",
    ).copy()

    duplicate_rows_removed = (
        before - len(df)
    )

    print(
        "Duplicate TMDB rows removed:",
        duplicate_rows_removed,
    )

    df.reset_index(
        drop=True
    )

    print(
        "Rows after cleaning:",
        len(df),
    )

    # =========================================================
    # CLEAN TITLES
    # =========================================================

    df["title"] = df[
        "title"
    ].map(clean)

    df = df[
        df["title"].ne("")
    ].copy()

    df.reset_index(
        drop=True,
        inplace=True,
    )

    print(
        "Rows after title cleaning:",
        len(df),
    )

    # =========================================================
    # BUILD FEATURE TEXT
    # =========================================================

    print(
        "Rebuilding clean feature text..."
    )

    df[
        "feature_text_v3_2"
    ] = df.apply(
        build_feature_text,
        axis=1,
    )

    df = df[
        df[
            "feature_text_v3_2"
        ].str.len()
        > 0
    ].copy()

    df.reset_index(
        drop=True,
        inplace=True,
    )

    print(
        "Rows with usable features:",
        len(df),
    )

    # =========================================================
    # FINAL SAFETY CHECK
    # =========================================================

    final_missing_tmdb = int(
        df["tmdb_id"].isna().sum()
    )

    final_unique_tmdb = int(
        df["tmdb_id"].nunique()
    )

    final_rows = len(df)

    if final_missing_tmdb != 0:

        raise ValueError(
            "Final dataset still contains missing TMDB IDs."
        )

    if final_unique_tmdb != final_rows:

        raise ValueError(
            "Final dataset still contains duplicate TMDB IDs."
        )

    print(
        "Final TMDB validation: PASS"
    )

    print(
        "Final movie count:",
        final_rows,
    )

    print(
        "Final unique TMDB IDs:",
        final_unique_tmdb,
    )

    # =========================================================
    # TF-IDF
    # =========================================================

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        min_df=2,
        max_features=60000,
        sublinear_tf=True,
    )

    print(
        "Training TF-IDF..."
    )

    tfidf_matrix = (
        vectorizer.fit_transform(
            df[
                "feature_text_v3_2"
            ]
        )
    )

    print(
        "TF-IDF shape:",
        tfidf_matrix.shape,
    )

    # =========================================================
    # FINAL MODEL DATAFRAME
    # =========================================================

    df["feature_text"] = df[
        "feature_text_v3_2"
    ]

    df.drop(
        columns=[
            "feature_text_v3_2"
        ],
        inplace=True,
    )

    # =========================================================
    # CREATE MODEL ARTIFACT
    # =========================================================

    artifact = {

        "vectorizer": vectorizer,

        "tfidf_matrix": tfidf_matrix,

        "movies": df,

        "feature_columns": [
            "title",
            "overview",
            "genres",
            "moods",
            "narrative_vectors",
            "social_dynamics",
            "languages",
            "keywords",
            "mood",
            "emotion",
            "narrative",
        ],

        "version": "3.2",

        "weighted_features": True,
    }

    # =========================================================
    # SAVE MODEL
    # =========================================================

    print(
        "Saving separate V3.2 model..."
    )

    joblib.dump(
        artifact,
        OUTPUT_MODEL,
        compress=3,
    )

    # =========================================================
    # SAVE TRAINING STATS
    # =========================================================

    stats = {

        "version": "3.2",

        "total_movies": len(df),

        "unique_tmdb_ids": int(
            df["tmdb_id"].nunique()
        ),

        "tfidf_features": int(
            tfidf_matrix.shape[1]
        ),

        "dataset": DATASET_PATH.name,

        "model": OUTPUT_MODEL.name,

        "original_v3_1_preserved": True,

        "daman_removed": True,

        "daman_tmdb_id": 1024350,

        "daman_rows_removed": daman_removed,

        "missing_tmdb_ids_repaired": repaired_tmdb_rows,

        "taare_zameen_par_tmdb_id": 7508,

        "remaining_missing_tmdb_rows_removed":
            missing_tmdb_removed,

        "duplicate_tmdb_ids_removed": True,

        "duplicate_rows_removed":
            duplicate_rows_removed,
    }

    STATS_PATH.write_text(
        json.dumps(
            stats,
            indent=2,
        ),
        encoding="utf-8",
    )

    # =========================================================
    # FINAL OUTPUT
    # =========================================================

    print(
        "\nTraining complete!"
    )

    print(
        json.dumps(
            stats,
            indent=2,
        )
    )

    print(
        "\nV3.1 has not been modified."
    )


if __name__ == "__main__":
    main()
