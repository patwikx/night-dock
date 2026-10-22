# Night Dock performance update

Version 1.1.2 was measured on the rooted LG 55UT8050PSB at its 1920 × 1080 application resolution. Measurements use the same saved app selection and a repeatable CDP workload. No system memory policies, startup scripts, Home mappings, or privileged app-discovery preferences were changed.

- JavaScript plus embedded CSS: 56,225 → 44,971 bytes, 20.0% smaller.
- Bundled app assets: 1,037,519 → 839,074 bytes, 19.1% smaller. Duplicate assets were removed; the wallpaper, font, and retained brand artwork were not recompressed or changed.
- Median warm reload to Home ready, three runs per build: 521.8 → 386.4 ms, 25.9% lower. Individual timings are in summary.json.
- 500 repeated pointer events over an unchanged tile: 4,000 → 0 DOM mutations. Captured JavaScript execution for that workload fell from 72.8 to 9.6 ms. This is a synthetic input workload, not a claim about every interaction.

Home and Sources screenshots are pixel-identical. Settings retains identical measured tile positions, colors and backdrop blur. Its captures differ by an average of less than 0.01 per 8-bit color channel, with a maximum difference of 13, consistent with small compositing differences. Captures, image differences, and computed-style snapshots are retained under baseline/ and optimized/.

The implementation removes 156 obsolete selectors, avoids repeated DOM queries and unchanged focus writes, reuses Settings and Sources nodes, batches dock creation, and rebuilds a changed dock only when Settings closes. Startup verifies selected Home apps first and discovers remaining catalogue entries after Home's first frame. Each catalogue entry is still verified, without a stale persisted app-list cache or duplicate queries. The optional Homebrew path retains its existing behavior.

Clock formatting and DOM writes now happen only when the displayed minute changes. Its timeout aligns to the next minute and is cancelled while hidden. Real-TV lifecycle checks confirmed zero queued timers while backgrounded, a scheduled timer after returning, successful YouTube launching, and the reduced-motion alternative. Sixteen isolated runtime interaction checks cover selection, persisted ordering, cancellation, four-row scrolling, source launch IDs, cached nodes and pointer coalescing. These checks use fixture data and do not change the TV's saved selections.

The glass material, artwork, geometry, cream focus, YouTube focus colors, animation durations, easing, artwork lift and smooth scrolling are preserved. The design detector's only finding was the existing Inter font, retained intentionally.

Warm-reload measurements are not cold power-on timings. Background system load affects the TV; this does not establish a universal 60 FPS guarantee or a reduction in overall TV RAM. Retained JavaScript caches trade a small amount of heap for fewer allocations and less repeated work. The original Luna bridge request counts were unavailable through the early profiling hook and are omitted from the capture.

The pre-update app archive is on the TV at `/var/lib/webosbrew/launcher-before-performance-20261023.tar.gz`. The local baseline retains the original source and built assets. The final JavaScript SHA-256 is `886a6e4e82e738ed2a4af7b51b64b4c83c3e6a2942fc59177045eba16caf2068`. The installable package is `build/works.partridge.webos-launcher_1.1.2_all.ipk`.
