#!/usr/bin/env bash
# Apply a staged release. Does not remove data, stop other apps, or roll back.
set -euo pipefail
umask 077
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
app=${1:?app}; release=${2:?release directory}; image=${3:?immutable image}; domain=${4:?domain}
case "$app" in
  md-to-pdf) path=/opt/md-to-pdf; container=md-to-pdf; domain_var=PDF_DOMAIN;;
  anondocs) path=/opt/anondocs; container=anondocs-api-prod; domain_var=ANONDOCS_DOMAIN;;
  *) exit 2;;
esac
[[ "$domain" =~ ^[A-Za-z0-9][A-Za-z0-9.-]+[A-Za-z0-9]$ ]] || { echo 'Invalid domain' >&2; exit 2; }
[[ "$image" =~ @sha256:[a-f0-9]{64}$ ]] || { echo 'An immutable image digest is required' >&2; exit 2; }
# Lock all releases of this app, including invocations outside GitHub Actions.
exec 9>"/var/lock/aist-$app.lock"
flock -w 600 9
mkdir -p "$path"
# Copy only deployment files, preserving .env, secrets and runtime data.
cp "$release/app/docker-compose.prod.yml" "$path/docker-compose.prod.yml"
mkdir -p "$path/deploy"
cp -a "$release/app/deploy/." "$path/deploy/"
import="$release/import"
if [[ -d "$import" && ! -f "$path/.migration-imported" ]]; then
  # A migration must never overwrite an already provisioned installation.
  [[ ! -f "$path/.env" || -f "$path/.migration-in-progress" ]] || { echo 'Target already configured; refusing initial import' >&2; exit 1; }
  touch "$path/.migration-in-progress"
  if [[ ! -f "$path/.env" ]]; then cp "$import/.env" "$path/.env"; fi
  if [[ -d "$import/secrets" ]]; then cp -a "$import/secrets" "$path/secrets"; fi
fi
if [[ -s "$release/app.env" ]]; then
  cp "$release/app.env" "$path/.env.incoming"
  DEPLOY_PATH="$path" bash "$SCRIPT_DIR/merge-env.sh"
fi
[[ -s "$path/.env" ]] || { echo 'Supply application env or a source migration' >&2; exit 1; }
# CI owns these keys; application credentials are preserved.
printf '
APP_IMAGE=%s
%s=%s
' "$image" "$domain_var" "$domain" > "$path/.env.incoming"
DEPLOY_PATH="$path" bash "$SCRIPT_DIR/merge-env.sh"
chmod 600 "$path/.env"
cd "$path"
compose=(docker compose -f docker-compose.prod.yml)
"${compose[@]}" config --quiet
if [[ "$app" = md-to-pdf && -d "$import" && ! -f .migration-imported ]]; then
  # Create volume mount points without starting application writers.
  "${compose[@]}" pull
  "${compose[@]}" create md-to-pdf
  docker cp "$import/pdf-storage/." "$container:/home/rocket/public/pdf/"
  if [[ -d "$import/pdf-cache" ]]; then docker cp "$import/pdf-cache/." "$container:/home/rocket/public/cache/"; fi
  # Ownership is corrected in a one-shot container before the non-root app starts.
  "${compose[@]}" run --rm --no-deps --user root --entrypoint sh md-to-pdf     -c 'chown -R rocket:rocket /home/rocket/public/pdf /home/rocket/public/cache'
fi
if [[ -d "$import" ]]; then
  touch .migration-imported
  rm -f .migration-in-progress
fi
bash "$SCRIPT_DIR/install-vhost.sh" "$app" "$domain"
if [[ "$app" = md-to-pdf ]]; then bash deploy/bootstrap-core.sh; else bash deploy/bootstrap.sh; fi
bash "$SCRIPT_DIR/smoke-app.sh" "$app"
printf 'Application ready: %s (%s)
' "$app" "$domain"
