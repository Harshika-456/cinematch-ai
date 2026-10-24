import pandas as pd
import re

INPUT_FILE = "hindi_marathi_tmdb_enriched.csv"
OUTPUT_FILE = "hindi_marathi_cinematch_ready.csv"


def text(row):
    return " ".join([
        str(row.get("movie_name", "")),
        str(row.get("genre", "")),
        str(row.get("overview", "")),
        str(row.get("tmdb_overview", "")),
        str(row.get("cast", "")),
        str(row.get("director", ""))
    ]).lower()


def has_any(s, words):
    return any(word in s for word in words)


def get_mood(row):
    s = text(row)
    genre = str(row.get("genre", "")).lower()

    if has_any(s, ["horror", "ghost", "haunted", "murder", "death", "fear"]):
        return "Scared"

    if has_any(s, ["romance", "romantic", "love", "lover", "marriage", "relationship"]):
        return "Romantic"

    if has_any(s, ["comedy", "funny", "humor", "comic"]):
        return "Funny"

    if has_any(s, ["thriller", "crime", "detective", "revenge", "mystery"]):
        return "Excited"

    if has_any(s, ["sad", "loss", "grief", "death", "separation", "emotional"]):
        return "Emotional"

    if has_any(s, ["family", "friendship", "village", "journey", "life"]):
        return "Relaxed"

    if has_any(s, ["war", "politics", "social", "struggle", "justice"]):
        return "Thoughtful"

    return "Happy"


def get_emotion(row):
    s = text(row)

    if has_any(s, ["love", "romance", "happy", "joy", "celebration"]):
        return "Joy"

    if has_any(s, ["death", "loss", "grief", "sad", "separation"]):
        return "Sadness"

    if has_any(s, ["anger", "revenge", "violence", "fight"]):
        return "Anger"

    if has_any(s, ["fear", "ghost", "horror", "danger", "terror"]):
        return "Fear"

    if has_any(s, ["surprise", "mystery", "unexpected", "secret"]):
        return "Surprise"

    return "Neutral"


def get_narrative(row):
    s = text(row)

    if has_any(s, ["love", "lover", "romance", "marriage", "relationship"]):
        return "Love Story"

    if has_any(s, ["family", "father", "mother", "brother", "sister"]):
        return "Family"

    if has_any(s, ["friend", "friendship", "college", "school"]):
        return "Friendship"

    if has_any(s, ["crime", "murder", "detective", "police"]):
        return "Crime"

    if has_any(s, ["war", "army", "soldier", "battle"]):
        return "War"

    if has_any(s, ["journey", "travel", "adventure"]):
        return "Adventure"

    if has_any(s, ["village", "farmer", "rural", "agriculture"]):
        return "Rural Life"

    if has_any(s, ["business", "company", "money", "career"]):
        return "Career"

    return "Life Story"


def get_social_context(row):
    s = text(row)

    if has_any(s, ["family", "father", "mother", "brother", "sister", "marriage"]):
        return "Family"

    if has_any(s, ["friend", "friendship", "college", "school", "party"]):
        return "Friends"

    if has_any(s, ["couple", "lover", "romance", "relationship"]):
        return "Partner"

    if has_any(s, ["community", "village", "society", "social"]):
        return "Community"

    return "Solo"


def get_interest(row):
    s = text(row)

    interests = []

    mapping = {
        "Music": ["music", "singer", "song", "band"],
        "Sports": ["sport", "cricket", "football", "wrestling"],
        "Travel": ["travel", "journey", "trip", "tour"],
        "Food": ["food", "restaurant", "chef", "cooking"],
        "History": ["history", "historical", "king", "empire"],
        "Politics": ["politics", "politician", "government", "election"],
        "Crime": ["crime", "murder", "police", "detective"],
        "Family": ["family", "mother", "father", "brother", "sister"],
        "Romance": ["love", "romance", "lover", "relationship"],
        "Adventure": ["adventure", "journey", "treasure", "exploration"],
    }

    for interest, keywords in mapping.items():
        if has_any(s, keywords):
            interests.append(interest)

    if not interests:
        interests.append("General")

    return ", ".join(interests)


# -----------------------------
# LOAD
# -----------------------------

df = pd.read_csv(INPUT_FILE)

print("Movies loaded:", len(df))

# -----------------------------
# ADD CINE-MATCH FEATURES
# -----------------------------

df["mood"] = df.apply(get_mood, axis=1)
df["emotion"] = df.apply(get_emotion, axis=1)
df["narrative"] = df.apply(get_narrative, axis=1)
df["social_context"] = df.apply(get_social_context, axis=1)
df["interest"] = df.apply(get_interest, axis=1)

# -----------------------------
# SAVE
# -----------------------------

df.to_csv(
    OUTPUT_FILE,
    index=False,
    encoding="utf-8-sig"
)

print("\n==============================")
print("CINEMATCH FEATURES COMPLETE")
print("==============================")

print("Output:", OUTPUT_FILE)
print("Movies:", len(df))

print("\nMood distribution:")
print(df["mood"].value_counts())

print("\nEmotion distribution:")
print(df["emotion"].value_counts())

print("\nLanguage distribution:")
print(df["language"].value_counts())