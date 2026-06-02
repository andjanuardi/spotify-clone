import time
from datetime import datetime
from scraper import search_youtube_url

CACHE_TTL = 21600
_cache = {"data": None, "timestamp": 0}

async def get_trending():
    now = time.time()
    if _cache["data"] and (now - _cache["timestamp"]) < CACHE_TTL:
        return _cache["data"]

    year = datetime.now().year
    query = f"lagu indonesia {year}"
    url = f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}&sp=CAASAhgF"

    results = await search_youtube_url(url, 50)

    _cache["data"] = results[:20]
    _cache["timestamp"] = now
    return _cache["data"]
