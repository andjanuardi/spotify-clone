import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
import httpx
from database import init_db
from routes.favorites import router as favorites_router
from routes.playlists import router as playlists_router

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

app.include_router(favorites_router, prefix="/api")
app.include_router(playlists_router, prefix="/api")


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
    uvicorn.run(app, host="0.0.0.0", port=3333)
