#!/usr/bin/env bash
set -e

# Change directory to the api folder containing this script
cd "$(dirname "$0")"

PORT="${PORT:-8000}"
HOST="${HOST:-0.0.0.0}"

echo "Starting Summa AI API on http://${HOST}:${PORT} (reload enabled)..."
exec uvicorn app.main:app --host "${HOST}" --port "${PORT}" --reload
