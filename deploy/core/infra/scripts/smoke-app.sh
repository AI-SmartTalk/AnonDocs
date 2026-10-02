#!/usr/bin/env bash
# Functional checks use synthetic fixtures only, never application documents.
set -euo pipefail
app=${1:?app}
case "$app" in
  md-to-pdf)
    docker exec "${SMOKE_CONTAINER:-md-to-pdf}" sh -ec '
      curl -fsS --max-time 150 -H "X-API-Key: $API_KEY" -H "Content-Type: application/json" \
        -d "{\"markdown\":\"# Core deployment fixture\"}" \
        http://127.0.0.1:8000/api/convert -o /tmp/core-deploy-smoke.pdf
      test "$(head -c 4 /tmp/core-deploy-smoke.pdf)" = "%PDF"
      rm -f /tmp/core-deploy-smoke.pdf
    '
    ;;
  anondocs)
    docker exec -i "${SMOKE_CONTAINER:-anondocs-api-prod}" node <<'JS'
(async () => {
  const payload = {text: 'Contact Jean Dupont at jean.dupont@example.com.'};
  const options = {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload), signal: AbortSignal.timeout(120000)};
  const response = await fetch('http://127.0.0.1:3000/api/anonymize', options);
  if (!response.ok) throw new Error('Anonymization request failed');
  const result = await response.json();
  const text = result.data?.anonymizedText;
  if (!result.success || typeof text !== 'string' || !text.trim() || text.includes('jean.dupont@example.com')) {
    throw new Error('Anonymization contract or synthetic email redaction failed');
  }
  const stream = await fetch('http://127.0.0.1:3000/api/stream/anonymize', {...options, signal: AbortSignal.timeout(120000)});
  if (!stream.ok || !stream.headers.get('content-type')?.includes('text/event-stream')) throw new Error('SSE response failed');
  const events = await stream.text();
  if (!events.includes('[DONE]') || events.includes('"type":"error"') || !events.includes('"type":"completed"')) throw new Error('SSE processing failed');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
JS
    ;;
  anondocs-website)
    docker exec "${SMOKE_CONTAINER:-anondocs-website}" sh -ec '
      for route in health / fr/ es/ de/; do
        wget -q -O /dev/null "http://127.0.0.1:8080/$route"
      done
    '
    ;;
  *) exit 2;;
esac
echo 'Functional synthetic checks passed.'
