
import pandas as pd

df = pd.read_csv("combined_cinematch_dataset.csv", low_memory=False)

print("Total movies:", len(df))
print("\nAvailable columns:")
print(df.columns.tolist())

for col in [
    "title", "tmdb_id", "rating", "runtime",
    "poster_path", "backdrop_path",
    "languages", "spoken_languages", "original_language"
]:
    if col in df.columns:
        print(f"\n--- {col} ---")
        print("Missing:", df[col].isna().sum())
        print(df[col].head(5).tolist())
    else:
        print(f"\n--- {col}: COLUMN NOT FOUND ---")
