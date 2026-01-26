# Game Recommendation App Demo

- Use the recommender: https://vid7-game-recommend-demo.onrender.com/
- Created a **content-based game recommender system** which provides interactive recommendations based on game metadata, descriptions, developers, publishers, and tags.
- This is a simple flask web app demo that lets users get game recommendations based on any game they enter.

## Recommender system features:

- Curated **popular games (~15k rows)** from multiple datasets (2019 & 2025)
- **NLP preprocessing**: HTML cleaning, tokenization, lemmatization, and stemming
- **Feature engineering**: ~10k textual features from tags, developer, publisher, and descriptions
- **Content-based recommendations** using CountVectorizer and cosine similarity
- **Flask web interface** for interactive exploration of recommended games
- Validated recommendations qualitatively to ensure relevance