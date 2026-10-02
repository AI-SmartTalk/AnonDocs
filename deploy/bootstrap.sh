#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
[[ -s .env ]] || { echo 'Missing production configuration' >&2; exit 1; }
chmod 600 .env
docker network inspect ai-toolkit-network >/dev/null
docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --wait --wait-timeout 180
