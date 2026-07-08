#!/usr/bin/env bash
# Builds the plugin, syncs the built assets from build/ into the plugin
# root (wp-av-mirador-iiif.php loads index.js/css/blocks from the plugin
# root, not from build/ — wp-scripts build only writes to build/), and zips
# a distributable package named after the version in the plugin header.
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build

cp build/index.js build/index.css build/index-rtl.css build/index.asset.php .
rsync -a --delete build/blocks/ blocks/

VERSION=$(grep -m1 "Version:" wp-av-mirador-iiif.php | sed -E 's/.*Version:[[:space:]]*//')
ZIP_NAME="wp-av-mirador-iiif-${VERSION}.zip"

rm -f wp-av-mirador-iiif-*.zip
zip -rX "$ZIP_NAME" wp-av-mirador-iiif.php index.js index.css index-rtl.css index.asset.php blocks -x '*/._*' -x '._*'

echo "Packaged: $ZIP_NAME"
