#!/usr/bin/env bash
# Read-only source export. Never print configuration or document contents.
set -euo pipefail
umask 077
app=${1:?app}; source_path=${2:?source path}
case "$app" in md-to-pdf) container=md-to-pdf;; anondocs) container=anondocs-api-prod;; *) exit 2;; esac
[[ "$source_path" = /* && "$source_path" != / ]] || exit 2
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
[[ -f "$source_path/.env" ]] || { echo 'Source .env missing' >&2; exit 1; }
cp "$source_path/.env" "$work/.env"
if [[ -d "$source_path/secrets" ]]; then cp -a "$source_path/secrets" "$work/secrets"; fi
if [[ "$app" = md-to-pdf ]]; then
  # docker cp works with either volume or bind mounts, including stopped containers.
  mkdir "$work/pdf-storage"
  docker cp "$container:/home/rocket/public/pdf/." "$work/pdf-storage/"
  if docker exec "$container" test -d /home/rocket/public/cache 2>/dev/null; then
    mkdir "$work/pdf-cache"
    docker cp "$container:/home/rocket/public/cache/." "$work/pdf-cache/"
  fi
fi
# AnonDocs uploads are temporary processing inputs, not durable application state.
tar -C "$work" -czf - .
