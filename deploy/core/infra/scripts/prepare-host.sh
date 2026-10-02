#!/usr/bin/env bash
set -euo pipefail
[[ $(id -u) = 0 ]] || { echo 'Deployment requires root on the target' >&2; exit 1; }
if ! command -v docker >/dev/null; then
  command -v curl >/dev/null || { apt-get update; apt-get install -y curl ca-certificates; }
  curl -fsSL https://get.docker.com -o /tmp/aist-install-docker.sh
  sh /tmp/aist-install-docker.sh
  rm -f /tmp/aist-install-docker.sh
fi
systemctl enable --now docker
# Installing the official plugin is needed on hosts with an older Docker install.
if ! docker compose version >/dev/null 2>&1; then
  apt-get update
  apt-get install -y docker-compose-plugin
fi
bash /opt/aist-infra/bootstrap.sh
docker exec nginx-proxy nginx -t
