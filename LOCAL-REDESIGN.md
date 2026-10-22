> Historical notes for the earlier design. The current Night Dock implementation is documented in README.md and DESIGN.md.

# Personal launcher redesign

This checkout adds an Apple TV inspired app grid to the upstream webOS Launcher. It retains the upstream application ID so Developer Mode can update the existing installation. It does not replace the physical Home button or change firmware.

Build with `npm ci`, `npm run build`, then `npm run package`. Install using `sh scripts/install-dev.sh` after pairing `lg-tv` with the LG webOS CLI. Set `TV_DEVICE` to use a different paired device. This script uses Developer Mode rather than the upstream root-based `install:tv` script.

The home screen uses six columns with spatial arrow navigation. Up from the first row reaches the LG Home and Settings buttons. Back returns to the first app. Settings still controls selection and ordering. The app canvas fits browser previews; the TV uses the original 1920 by 1080 geometry.

The untouched original v1.0.0 package is at `/tmp/webos-launcher-setup/works.partridge.webos-launcher_1.0.0_all.ipk`. This directory also contains the existing local Developer Mode pairing helper. Pairing credentials stay outside this repository.

Brand artwork provenance is recorded in `public/icons/brands/SOURCES.md`. Other artwork and licenses remain those shipped by the upstream project. Disney+ and HBO Max tiles use official publisher assets. This personal build is not affiliated with Apple, LG, or the app publishers.
