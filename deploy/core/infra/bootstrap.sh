#!/usr/bin/env bash
#
# aist-infra — one-shot host bootstrap.
#
# Creates the shared edge network (idempotent) and brings up the neutral edge
# proxy. Safe to re-run: it never recreates the network if it already exists and
# `compose up -d` only touches what changed. Run once per VPS, before (or
# alongside) the first app deploy.
#
#   ./bootstrap.sh
#
set -euo pipefail

NET="ai-toolkit-network"
HERE="$(cd "$(dirname "$0")" && pwd)"

command -v docker >/dev/null 2>&1 || { echo "✗ docker not installed" >&2; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "✗ 'docker compose' plugin missing" >&2; exit 1; }

if docker network inspect "$NET" >/dev/null 2>&1; then
  echo "✓ shared network '$NET' already exists"
else
  echo "→ creating shared network '$NET'"
  docker network create "$NET"
fi

echo "→ starting edge proxy"
cd "$HERE/edge-proxy"
docker compose up -d
docker compose ps

cat <<'EOF'

✓ edge proxy up.

To put an app behind it, in the app's compose give its public-facing container:
    environment:
      VIRTUAL_HOST: app.example.com
      VIRTUAL_PORT: "<internal port>"     # default 80
      LETSENCRYPT_HOST: app.example.com
      LETSENCRYPT_EMAIL: you@example.com
    networks: [ default, edge ]
and add at the bottom:
    networks:
      edge:
        external: true
        name: ai-toolkit-network
The proxy auto-discovers it and fetches a Let's Encrypt cert. No config here.
EOF
