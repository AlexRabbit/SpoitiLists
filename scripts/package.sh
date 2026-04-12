#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
mkdir -p extensions
rm -f spoiti-lists.spotiflac-ext extensions/spoiti-lists.spotiflac-ext
zip -j spoiti-lists.spotiflac-ext manifest.json index.js
cp spoiti-lists.spotiflac-ext extensions/spoiti-lists.spotiflac-ext
echo "Created $ROOT/spoiti-lists.spotiflac-ext"
echo "Published copy: $ROOT/extensions/spoiti-lists.spotiflac-ext"
