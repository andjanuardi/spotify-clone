import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
import httpx
from database import init_db, get_db

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')
from scraper import search_youtube, get_audio_url, get_video_info
from trending import get_trending


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Spotify Clone API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/trending")
async def trending():
    results = await get_trending()
    return {"results": results}


@app.get("/api/search")
async def search(q: str = Query(..., min_length=1), max: int = Query(10, le=50)):
    results = await search_youtube(q, max_results=max)
    return {"results": results}


@app.get("/api/info/{video_id}")
async def info(video_id: str):
    data = await get_video_info(video_id)
    if not data:
        raise HTTPException(status_code=404, detail="Video not found")
    return data


@app.get("/api/stream/{video_id}")
async def stream(video_id: str, request: Request):
    audio_url = await get_audio_url(video_id)
    if not audio_url:
        raise HTTPException(status_code=404, detail="Could not fetch audio stream")

    req_headers = {}
    range_header = request.headers.get("range")
    if range_header:
        req_headers["Range"] = range_header

    client = httpx.AsyncClient()
    resp = await client.send(
        client.build_request("GET", audio_url, headers=req_headers),
        stream=True,
    )

    resp_headers = {}
    for h in ["content-range", "content-length", "accept-ranges", "content-type"]:
        v = resp.headers.get(h)
        if v:
            resp_headers[h] = v

    async def generate():
        try:
            async for chunk in resp.aiter_bytes():
                yield chunk
        finally:
            await resp.aclose()
            await client.aclose()

    return StreamingResponse(
        generate(),
        status_code=resp.status_code,
        headers=resp_headers,
    )


@app.get("/api/favorites")
def get_favorites():
    db = get_db()
    rows = db.execute(
        "SELECT * FROM favorites ORDER BY added_at DESC"
    ).fetchall()
    db.close()
    return {"favorites": [dict(r) for r in rows]}


@app.post("/api/favorites")
def add_favorite(data: dict):
    db = get_db()
    try:
        db.execute(
            """INSERT OR REPLACE INTO favorites
               (video_id, title, artist, thumbnail, duration)
               VALUES (?, ?, ?, ?, ?)""",
            (
                data["video_id"],
                data["title"],
                data.get("artist", "Unknown"),
                data.get("thumbnail", ""),
                data.get("duration", 0),
            ),
        )
        db.commit()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


@app.delete("/api/favorites/{video_id}")
def remove_favorite(video_id: str):
    db = get_db()
    db.execute("DELETE FROM favorites WHERE video_id = ?", (video_id,))
    db.commit()
    db.close()
    return {"status": "ok"}


@app.get("/api/playlists")
def get_playlists():
    db = get_db()
    playlists = db.execute("SELECT * FROM playlists ORDER BY created_at DESC").fetchall()
    result = []
    for pl in playlists:
        pl_dict = dict(pl)
        song_count = db.execute(
            "SELECT COUNT(*) as count FROM playlist_songs WHERE playlist_id = ?",
            (pl["id"],),
        ).fetchone()["count"]
        pl_dict["song_count"] = song_count
        result.append(pl_dict)
    db.close()
    return {"playlists": result}


@app.post("/api/playlists")
def create_playlist(data: dict):
    db = get_db()
    try:
        cur = db.execute(
            "INSERT INTO playlists (name, description) VALUES (?, ?)",
            (data["name"], data.get("description", "")),
        )
        db.commit()
        return {"id": cur.lastrowid, "name": data["name"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


@app.delete("/api/playlists/{playlist_id}")
def delete_playlist(playlist_id: int):
    db = get_db()
    db.execute("DELETE FROM playlists WHERE id = ?", (playlist_id,))
    db.commit()
    db.close()
    return {"status": "ok"}


@app.get("/api/playlists/{playlist_id}/songs")
def get_playlist_songs(playlist_id: int):
    db = get_db()
    rows = db.execute(
        "SELECT * FROM playlist_songs WHERE playlist_id = ? ORDER BY position",
        (playlist_id,),
    ).fetchall()
    db.close()
    return {"songs": [dict(r) for r in rows]}


@app.post("/api/playlists/{playlist_id}/songs")
def add_song_to_playlist(playlist_id: int, data: dict):
    db = get_db()
    try:
        max_pos = db.execute(
            "SELECT COALESCE(MAX(position), -1) as m FROM playlist_songs WHERE playlist_id = ?",
            (playlist_id,),
        ).fetchone()["m"]
        db.execute(
            """INSERT INTO playlist_songs
               (playlist_id, video_id, title, artist, thumbnail, duration, position)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                playlist_id,
                data["video_id"],
                data["title"],
                data.get("artist", "Unknown"),
                data.get("thumbnail", ""),
                data.get("duration", 0),
                max_pos + 1,
            ),
        )
        db.commit()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


@app.delete("/api/playlists/{playlist_id}/songs/{song_id}")
def remove_song_from_playlist(playlist_id: int, song_id: int):
    db = get_db()
    db.execute(
        "DELETE FROM playlist_songs WHERE id = ? AND playlist_id = ?",
        (song_id, playlist_id),
    )
    db.commit()
    db.close()
    return {"status": "ok"}


if os.path.exists(FRONTEND_DIR) and os.path.isdir(FRONTEND_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        index_path = os.path.join(FRONTEND_DIR, "index.html")
        if os.path.exists(index_path):
            with open(index_path) as f:
                return HTMLResponse(f.read())
        return HTMLResponse("<h1>Build frontend first: cd frontend && npm run build</h1>")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
