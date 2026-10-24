# CineMatch AI — Train the real recommendation model

This training pipeline uses two Hugging Face datasets:

1. `HenryWaltson/TMDB-IMDB-Movies-Dataset` — movie metadata, languages, spoken languages, genres, keywords, ratings, runtime, posters, cast and directors.
2. `fractalintelligence/mooduel-v1.0` — mood, emotions, watch context, pacing and psychological dimensions.

The datasets are joined on `tmdb_id`. The resulting content-based model is a TF-IDF + cosine nearest-neighbour recommender. User preferences are converted into the same feature space, while rating, runtime and language are applied as hard/soft constraints.

## Windows PowerShell

From the project root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r training\requirements.txt
python training\train_recommender.py
npm install
npm run dev
```

Training downloads the datasets from Hugging Face. The 435K-row TMDB-IMDB CSV is about 278 MB; Mooduel is about 37.5 MB. The trained artifact is written to `models/cinematch_recommender.joblib`. citeturn0search1turn1search0

## What the trained database contains

The merged records include:

- title, TMDB id, year, runtime and rating
- original and spoken languages
- poster/backdrop paths
- genres and keywords
- 8 CineMatch mood labels
- 10 CineMatch narrative vectors
- solo/family/friends/partner viewing context
- Mooduel affective dimensions, pacing, emotional arc and comfort

### Language note

`spoken_languages` describes languages associated with the movie metadata. It is **not a guarantee of current dubbed audio availability on a streaming service**. Current availability should be checked separately through a provider/streaming source.

## Licensing

Check the license of each source before public/commercial deployment. Mooduel v1.0 is CC-BY-NC-4.0, intended for research, education and non-commercial use. citeturn1search0
