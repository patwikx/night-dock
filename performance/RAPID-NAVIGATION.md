# Rapid navigation update

Version 1.1.4 addresses rapid left/right input in Home and Settings. Measurements compare the installed 1.1.3 and 1.1.4 builds on an LG 55UT8050PSB running webOS 10.3.2 at 1920 × 1080. The same four selected Home apps and Settings catalogue were used. Raw results are in [rapid-navigation.json](rapid-navigation.json).

Every key updates the logical selection immediately. Focus painting is combined into one animation-frame callback, so multiple keys received before a frame do not each force a style/layout update. OK flushes the selection before activation; pointer input takes over immediately. Presses that cannot move beyond a row edge schedule no rendering. Hidden pages cancel pending navigation paints.

Settings caches tile geometry until its grid changes. Home reads scroll geometry before changing focus styles and avoids restarting a smooth scroll to the same destination. No animation CSS, artwork, glass material, geometry, storage format, or system configuration changed in this update.

## TV measurements

Two warm runs per build used three synthetic workloads per surface: 300 left-edge presses, 100 alternating right/left events dispatched in one task, and 60 alternating events requested at 8 ms intervals. These are stress tests, not estimates of physical remote speed.

| Workload | Before | After |
| --- | --- | --- |
| Home, 100-event burst dispatch | 408–421 ms | 8–14 ms |
| Settings, 100-event burst dispatch | 328–649 ms | 8–20 ms |
| Home, 60 spaced events, focus calls | 60 | 12–22 |
| Settings, 60 spaced events, focus calls | 60 | 10–12 |
| Home or Settings, 300 left-edge events, focus calls | 300 | 0 |
| Whole workload, style recalculations | 1,302–1,303 | 116–152 |
| Whole workload, layouts | 325–326 | 29–41 |

The alternating synchronous burst ends on the original tile. Combining its paints can eliminate every intermediate focus write, while retaining all logical moves. Work still required for the final visual state runs on the next animation frame; dispatch time alone is not end-to-end display latency. Total script/task durations and frame timings varied considerably with TV system load, including an isolated long frame. These results do not establish a 60 FPS guarantee or a fixed improvement for every remote press.

## Verification

All 42 browser interaction assertions passed at the TV viewport size, including four-row smooth scrolling, rapid movement, row-edge input, immediate OK after arrows, fast tab changes, pointer takeover, Settings cancellation, launch/error behavior, saved ordering, and reordering cancellation. The four existing navigation tests and production build also passed.

On the TV, rapid Home movement ended on the expected app and Settings movement ended on the expected tile. Three hundred Settings edge presses produced no focus calls or DOM mutations. Saved preferences remained identical across installation and testing. Home and Settings captures were visually checked; 22px glass blur and the existing Home animation durations were retained. The installed JavaScript hash matches the build recorded in the raw results.
