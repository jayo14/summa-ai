#!/usr/bin/env bash
set -eo pipefail

echo "Running secret check..."

# Check for hardcoded postgres URLs with passwords
if git grep -E "postgresql://[^ ]+:[^ ]+@" -- ':!api/app/config.py' ':!.env.example' ':!scripts/check-secrets.sh'; then
    echo "ERROR: Hardcoded postgresql connection string with password found!"
    exit 1
fi

# Check for JWT token pattern in tracked code files
if git grep -E "eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}" -- ':!api/tests/' ':!scripts/check-secrets.sh'; then
    echo "ERROR: Hardcoded JWT secret/token found in tracked non-test files!"
    exit 1
fi

echo "Secret check passed cleanly."
