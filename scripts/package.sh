#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
mkdir -p extensions
rm -f SpotiLists-temp.zip SpotiLists.spotiflac-ext \
  extensions/SpotiLists.spotiflac-ext extensions/spoiti-lists.spotiflac-ext
zip -j SpotiLists.spotiflac-ext manifest.json index.js
cp SpotiLists.spotiflac-ext extensions/SpotiLists.spotiflac-ext
cp SpotiLists.spotiflac-ext extensions/spoiti-lists.spotiflac-ext
echo "Created $ROOT/SpotiLists.spotiflac-ext"
echo "Published: $ROOT/extensions/SpotiLists.spotiflac-ext"
echo "Legacy copy (same bytes): $ROOT/extensions/spoiti-lists.spotiflac-ext"
