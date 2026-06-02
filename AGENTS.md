# Spotify Clone — AGENTS.md

## Stack
- **Backend**: Python FastAPI + SQLite (`backend/`). Entrypoint: `backend/main.py`.
- **Frontend**: React 18 + Vite + zustand + React Three Fiber + React Router + Framer Motion (`frontend/`). Entrypoint: `frontend/src/main.jsx`.
- **YouTube scraping**: `yt-dlp` (blocking calls offloaded via `run_in_executor`).
- **No tests, no CI, no linter/formatter config**.
- **No 3D/Three.js — visualizer system has been removed**.

## Running
```sh
# Production — builds frontend then serves from backend on :8000
./start.sh

# Dev backend only
pip install -r backend/requirements.txt -q
cd backend && python main.py     # uvicorn on :8000

# Dev frontend only (proxies /api -> :8000)
cd frontend && npm install && npm run dev   # Vite on :3000
```

## Architecture notes
- Frontend is built into `frontend/dist/`, served statically by FastAPI at `/assets` and catch-all `/{path}`.
- API routes are all prefixed `/api/*` — no versioning.
- SQLite DB at `backend/data/spotify.db` (gitignored, auto-created).
- Zustand store (`playerStore.js`) persists to `localStorage` under key `spotify-clone-storage`.
- Vite proxy in dev: `/api` -> `http://localhost:8000`.

## Conventions
- React: functional components, no TypeScript (plain JSX), no CSS modules (one big `global.css`).
- Backend: no async for DB calls (sqlite3 is sync, FastAPI sync endpoints for DB work).
- Route pages lazy-loaded via `React.lazy` + `Suspense` in `App.jsx`.
- Audio playback uses direct `<audio>` element with `audioRef` — not Web Audio API (the Web Audio `AnalyserNode` is used only for visualization).
