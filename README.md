# Night Dock

patwikx's personal launcher for an LG 55UT8050PSB, customized from [partridgeworks/webos-launcher](https://github.com/partridgeworks/webos-launcher).

Night Dock uses a night-lake background, translucent glass panels, a compact app dock, and remote-first navigation. The current build is version 1.1.2 and has been tested on this TV running webOS 10.3.2.

- Home has saved app selection and ordering, a 12/24-hour clock, Magic Remote pointer support, and short focus animations.
- Sources opens beside Settings and lists Live TV and all reported HDMI inputs with connection status.
- Settings uses Apps, Sources, and Options tabs, app checkmarks, and a separate re-order mode.
- The focused YouTube tile changes to red with a white play symbol against the cream selection background.
- Startup verifies Home's selected apps first. Cached UI nodes, selective focus updates, a minute-aligned clock, and removal of unused styles/assets reduce repeated work.

The app keeps the ID `works.partridge.webos-launcher` for compatibility with the existing TV installation, saved preferences, and configured Home integration. This repository does not install or change system-level Home mappings, boot services, or memory policies.

## Develop and build

Use Node.js 22 or newer with npm.

```sh
npm ci
npm run dev
npm run build
npm run package
```

The browser preview uses sample catalogue data. Real app launching and input switching require the TV. The build produces a classic script targeting Chrome 79, while the current visual interface is tested on the TV and firmware listed above.

The installable package is written to `build/works.partridge.webos-launcher_1.1.2_all.ipk`. Build output and installed dependencies are local and are not tracked in Git.

## Install on the TV

For the existing rooted-TV SSH workflow, copy `tv.env.example` to the ignored `tv.env` file and set `TV_HOST` to your SSH target. Keep private keys outside this repository. Then run:

```sh
npm run deploy
```

For an already paired Developer Mode device:

```sh
npm run build
npm run package
sh scripts/install-dev.sh
```

Set `TV_DEVICE` to use a pairing name other than `lg-tv`. The optional Homebrew app-list provider stays off by default and requires a rooted TV with Homebrew Channel.

## Controls

On Home, arrows move focus and OK opens the selected item. Up from the first app row reaches the utility buttons. Back returns focus to the first app. Pointer movement and clicking are supported.

In Settings, OK shows or hides an app. Hold OK or choose Re-order apps to change order, then use OK, arrows, and OK to pick up, move, and drop an app. Back cancels a held move or returns Home.

## Tests and measurements

Run `npm run build` for type checking and the production build. With `npm run dev` running, open `/tests/performance-runtime.html` for the isolated interaction checks. Their results are available as `window.__performanceTests` in the browser console.

The [performance report](performance/REPORT.md) and [measurement summary](performance/summary.json) contain the before/after TV results and their limits. Local screenshots, snapshots, device state and rollback copies remain in the copied project but are excluded from Git.

TV profiling scripts under `scripts/` require `TV_HOST`. Optional settings include `TV_DEBUG_HOST`, `TV_DEBUG_PORT`, and `TV_SSH_KEY`. For example:

```sh
TV_HOST=root@192.0.2.10 node scripts/profile-launcher.mjs .local/performance-run
```

Profiling reloads the launcher and performs short navigation checks. `check-tv-lifecycle.mjs` also launches YouTube and returns to the launcher. These scripts require the TV's existing SSH/debug access and do not include credentials.

## Attribution

This is a customized project derived from an MIT-licensed launcher, not a claim that every component was written from scratch. The original Git history and MIT notice are retained, with patwikx credited for modifications. See [UPSTREAM.md](UPSTREAM.md), [LICENSE](LICENSE), and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

App logos, LG input icons, the Inter font, and the supplied wallpaper retain their respective ownership and license terms. The project is not affiliated with LG, YouTube, or the other app publishers.
