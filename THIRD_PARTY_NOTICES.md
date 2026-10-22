# Third-party notices

The MIT licence in [LICENSE](LICENSE) covers this project's own code and its app icon
(`public/icon.png`, `public/largeIcon.png`). The following material belongs to others and
is **not** covered by that licence.

## Bundled software

| Component | Licence | Where |
|---|---|---|
| [Preact](https://preactjs.com) | MIT, © Jason Miller | retained dependency and legacy components; licence text in [public/licenses/preact-MIT.txt](public/licenses/preact-MIT.txt) |
| [Inter](https://rsms.me/inter/) typeface | SIL Open Font License 1.1, © The Inter Project Authors | `src/assets/inter-latin-wght.woff2`; licence text in [public/licenses/Inter-OFL.txt](public/licenses/Inter-OFL.txt) |

Both licence texts are included in the installed app under `licenses/`.

## App and input icons

`public/icons/apps/` contains the icons of third-party TV apps, and `public/icons/inputs/`
contains input-type icons from LG's webOS software. They are trademarks or copyright of
their respective owners. This project is not affiliated with, endorsed by or sponsored by
any of them.

They are included in good faith, only so the launcher can show recognisable tiles for apps
and inputs already installed on the user's own TV. Rights holders who would like an icon
removed can open an issue on this repository and it will be removed. Every app tile falls
back to a plain text tile without its icon, so removal doesn't break anything.

"LG" and "webOS" are trademarks of LG Electronics.
# Additional artwork in the personal redesign

Brand SVG marks are sourced from Simple Icons 11.15.0 under CC0. See `icons/brands/SOURCES.md` in packaged assets, or `public/icons/brands/SOURCES.md` in source, for origin and color adaptations. Brand trademarks remain with their respective owners.

The Night Dock adaptation uses the night-lake wallpaper supplied through the owner's local reference assets. Its original photographer and license are not established in this project, so it is not represented as original launcher code or covered by the MIT code license. It is retained for this private personal TV build. Inter retains its bundled OFL notice. Brand artwork remains the existing launcher artwork; the Stremio icon was copied from the installed TV app for this personal launcher.
