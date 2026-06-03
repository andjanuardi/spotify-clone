# Spotify Clone — AGENTS.md

## Stack
- **Backend**: Python FastAPI + SQLite (`backend/`). Entrypoint: `backend/main.py`.
- **Frontend**: React 18 + Vite + zustand + React Router + Framer Motion (`frontend/`). Entrypoint: `frontend/src/main.jsx`.
- **YouTube scraping**: `yt-dlp` via `asyncio.to_thread` in `backend/scraper.py`.
- **No tests, no CI, no linters, no formatters**, no TypeScript.

## Running
```sh
# Production — builds frontend, serves from backend on :8000
./start.sh

# Dev backend only
pip install -r backend/requirements.txt -q
cd backend && python main.py     # uvicorn on :8000

# Dev frontend only (proxies /api -> :8000)
cd frontend && npm install && npm run dev   # Vite on :3000
```

## Architecture
- Frontend is built into `frontend/dist/`, served statically by FastAPI at `/assets` and catch-all `/{path}`.
- API routes are all prefixed `/api/*` — no versioning.
- SQLite DB at `backend/data/spotify.db` (gitignored, auto-created).
- Zustand store (`playerStore.js`) persists to `localStorage` under key `spotify-clone-storage`.
- Vite proxy in dev: `/api` -> `http://localhost:8000`.
- `backend/trending.py` — trending songs (Indonesian music) with 6h in-memory cache via the URL-based search.
- `backend/scraper.py` has two search functions: `search_youtube(query)` for user search and `search_youtube_url(url)` for scraping playlists/trending.
- `spotify_clone.ipynb` at repo root — experimental notebook, not part of the app.

## Conventions
- React: functional components, no TypeScript (plain JSX), no CSS modules (one big `global.css`).
- Backend: no async for DB calls (sqlite3 is sync, FastAPI sync endpoints for DB work).
- Route pages lazy-loaded via `React.lazy` + `Suspense` in `App.jsx`.
- Audio playback uses a direct `<audio>` element managed in `NowPlayingBar.jsx`.
