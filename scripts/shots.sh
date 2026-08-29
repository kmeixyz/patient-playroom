#!/usr/bin/env bash
# Captures a screenshot of the running dev server with headless Chrome.
# Usage: scripts/shots.sh <url> <out.png> [width] [height]
set -uo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
URL="${1:?url required}"
OUT="${2:?output path required}"
W="${3:-390}"
H="${4:-844}"

rm -f "$OUT"

"$CHROME" \
  --headless=old \
  --disable-gpu \
  --no-sandbox \
  --no-first-run \
  --no-default-browser-check \
  --disable-extensions \
  --disable-sync \
  --hide-scrollbars \
  --force-device-scale-factor=2 \
  --window-size="$W,$H" \
  --virtual-time-budget=3000 \
  --timeout=15000 \
  --user-data-dir="$(mktemp -d)" \
  --screenshot="$OUT" \
  "$URL" >/dev/null 2>&1 &

CHROME_PID=$!
for _ in $(seq 1 40); do
  if [ -s "$OUT" ]; then break; fi
  sleep 0.5
done
kill "$CHROME_PID" 2>/dev/null

if [ -s "$OUT" ]; then echo "wrote $OUT"; else echo "FAILED $OUT"; exit 1; fi
