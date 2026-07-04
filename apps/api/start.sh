#!/bin/bash

# Summa AI Backend Startup Script for Render
set -e

echo "🚀 Starting Summa AI Backend on Render..."

# Create necessary directories
mkdir -p db

# Set default environment if not provided
export ENVIRONMENT=${ENVIRONMENT:-production}

echo "📦 Environment: $ENVIRONMENT"
echo "🏃 Starting server on 0.0.0.0:${PORT:-8000}"

# Start the application with gunicorn
exec gunicorn app.main:app \
  --host 0.0.0.0 \
  --port ${PORT:-8000} \
  --workers 1 \
  --worker-class uvicorn.workers.UvicornWorker \
  --timeout 120 \
  --keep-alive 5 \
  --max-requests 1000 \
  --max-requests-jitter 100 \
  --log-level info \
  --access-logfile - \
  --error-logfile -