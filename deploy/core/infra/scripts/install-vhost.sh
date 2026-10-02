#!/usr/bin/env bash
set -euo pipefail
app=${1:?}; domain=${2:?}
[[ "$domain" =~ ^[A-Za-z0-9][A-Za-z0-9.-]+[A-Za-z0-9]$ ]] || exit 2
case "$app" in
 md-to-pdf) body=12m; timeout=180s;;
 anondocs) body=27m; timeout=600s;;
 *) exit 2;;
esac
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
cat > "$work/vhost" <<EOF
client_max_body_size $body;
proxy_connect_timeout 10s;
proxy_send_timeout $timeout;
proxy_read_timeout $timeout;
proxy_buffering off;
# Application logs cover operations; do not log signed URLs or document inputs.
access_log off;
EOF
docker cp "$work/vhost" "nginx-proxy:/etc/nginx/vhost.d/$domain"
docker exec nginx-proxy nginx -t
docker exec nginx-proxy nginx -s reload
