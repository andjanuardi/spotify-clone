#!/bin/bash
# Start the Spotify Clone application
# Backend: FastAPI on port 8000
# Frontend: Vite dev server on port 3000 (optional, only for development)

echo "=== Spotify Clone ==="
echo ""

# Install backend deps
pip install -r backend/requirements.txt -q && echo "[OK] Backend deps installed"

# Install frontend deps
cd frontend && npm install --silent && cd .. && echo "[OK] Frontend deps installed"

# Build frontend (production mode serves from backend)
cd frontend && npm run build --silent && cd .. && echo "[OK] Frontend built"

echo ""
echo "Starting backend server on http://localhost:8000"
echo ""

cd backend && python main.py
