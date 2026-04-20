import pandas as pd
df = pd.read_csv("dataset/US_youtube_trending_data.csv")
df[["publishedAt", "categoryId", "view_count", "likes", "comment_count"]].to_csv("dataset/US_youtube_trending_data.csv", index=False)