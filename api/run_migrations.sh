#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

# Use virtualenv alembic if present, otherwise system/active alembic
if [ -f "../.venv/bin/alembic" ]; then
    ALEMBIC="../.venv/bin/alembic"
elif [ -f "./venv/bin/alembic" ]; then
    ALEMBIC="./venv/bin/alembic"
else
    ALEMBIC="alembic"
fi

exec "$ALEMBIC" upgrade head
