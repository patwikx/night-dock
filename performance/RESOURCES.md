# CPU, memory, and startup measurements

Measured on an LG 55UT8050PSB, firmware 33.31.75 / webOS 10.3.2, with a 1920 × 1080 launcher surface. Version 1.1.5 retains the navigation implementation and visuals from 1.1.4. [Numerical results](resources/summary.json) include the individual samples.

## CPU and memory

A 36.955-second sample containing 90 physical Left/Right events measured:

| Process | Average CPU, one core | Share of four-core capacity |
| --- | ---: | ---: |
| Night Dock renderer | 21.59% | 5.40% |
| Shared web engine | 31.90% | 7.98% |
| Shared compositor | 7.28% | 1.82% |
| Startup watcher | 0.00% | 0.00% |

The shared engine and compositor also serve webOS; their full costs cannot be attributed exclusively to Night Dock. Renderer memory observed around this test was 47.3 MiB RSS, 42.8 MiB PSS and 5.5 MiB proportional swap. PSS apportions shared pages; swap is reported separately, and JavaScript heap must not be added to these process totals.

In subsequent eight-second samples on 1.1.5, foreground renderer CPU was initially 10.74% of one core and later 0.25% when settled. Backgrounded behind YouTube, it was initially 0.37% and later zero at the sampling resolution. Foreground PSS changed from 59.8 to 26.7 MiB; the settled sample also had 5.1 MiB proportional swap. These are observations, not a fixed memory budget or peak-memory guarantee. Page reclamation, startup work, debugging and other TV activity affect the results.

The implementation schedules no continuous rendering loop. Navigation shares one pending animation-frame callback; repeated presses at a row edge schedule no redraw. Clock updates align to minute boundaries and stop while hidden. Previous lifecycle checks verified that the background clock timeout is cancelled and resumes on return.

## Reduced CPU availability

CDP renderer CPU throttling at 4× slowdown retained correct Home and Settings selection and unchanged saved preferences. Each rapid multi-key burst made one focus update; 300 repeated Left presses at the edge made zero focus calls and zero observed attribute mutations in either view. CPU throttling was reset to 1× after the test.

For 40 synthetic events per rate, dispatch to the next animation-frame callback measured:

| Renderer rate | Median | 95th percentile | Maximum |
| --- | ---: | ---: | ---: |
| Normal | 18.9 ms | 27.9 ms | 113.4 ms |
| 4× slowdown | 40.4 ms | 50.8 ms | 52.5 ms |

This simulates reduced renderer CPU availability. It does not simulate GPU contention, memory pressure, the remote's delivery path or simultaneous 4K playback. Correct selection and bounded work do not establish a screen frame-rate guarantee.

During the physical-key session, event timestamp to JavaScript capture was 1.65 ms median / 10.4 ms p95; capture to the next animation-frame callback was 2.05 ms median / 11.1 ms p95. These exclude earlier remote delivery and later compositor/panel presentation. The physical and synthetic tests have different event timing and workloads, so their callback delays are not directly comparable. The reported on-screen lag remains unresolved.

## Launch indication and startup

Version 1.1.5 preloads the existing wallpaper and font from the HTML head, allowing their requests to start before the JavaScript creates the UI. It sets `noSplashOnLaunch: true` and `spinnerOnLaunch: false`. The TV's application manager confirmed both values after installation. These are undocumented webOS options described in the [webOS Homebrew metadata reference](https://www.webosbrew.org/pages/appinfojson); behavior may vary across firmware. Disabling an indicator does not itself make startup faster.

Two fresh-app-process launches on an already running TV measured 2.20 / 1.35 seconds before the change and 1.76 / 1.38 seconds afterward, from issuing the launch request to observing Home ready and foreground through CDP. SSH, connection and polling overhead are included. The samples overlap and are too few to establish a reliable improvement. These are not unplug-to-power-on measurements, and the change does not remove the separate webOS boot delay.

The glass material, artwork, cream focus, Home animation durations and smooth scrolling are unchanged. Build, packaging, four navigation tests and 42 browser runtime assertions passed. The installed JavaScript and HTML hashes matched the build, and saved TV preferences were preserved.
