#!/bin/sh
# Uses an existing LG Developer Mode pairing. No root or firmware changes.
set -eu
cd "$(dirname "$0")/.."
DEVICE="${TV_DEVICE:-lg-tv}"
APP_ID="works.partridge.webos-launcher"
set -- build/*.ipk
[ -f "$1" ] || { echo 'Build the package with npm run build and npm run package first.' >&2; exit 1; }
npx ares-install --device "$DEVICE" "$1"
npx ares-launch --device "$DEVICE" "$APP_ID"
