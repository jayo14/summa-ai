#!/bin/bash
cd /home/codegallantx/moi/summa-ai/apps/api
exec /home/codegallantx/moi/summa-ai/apps/api/venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
