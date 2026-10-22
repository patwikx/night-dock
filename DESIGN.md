# Night Dock

The user's approved reference is the latest Night Dock design in the prior `launcher-design-review/index.html`, also represented by `/tmp/opencode/nightdock.js`. Its night-lake photograph, large light clock at top left, labeled utility pills at top right, and two compact rows of labeled app tiles at the bottom define this update. Keep its cream focus fill and outer focus ring.

This is an Operate surface for a television. App art, the clock format, saved ordering, hidden apps and sources, and real launch targets come from the TV. Extra enabled apps scroll in five-column rows. Settings uses a larger scrollable panel for sofa-distance legibility and the complete installed catalogue. There is no review-page chrome or simulated launch handoff on the TV.

## Settings and sources update

Sources is a top-right utility beside Settings. Its dropdown always lists every input reported by the TV, including disconnected ports and Live TV, with connection status. Prior source visibility choices remain stored but no longer filter the menu. There is no bottom source strip.

Settings restores the prior full-screen Apps / Sources / Options tabs and six-column app grid. OK toggles app checkmarks, Re-order apps or holding OK enters reorder mode, and Back cancels a held move. Sources in Settings switches inputs directly. Night Dock supplies the photograph, dark panels, cream focus fill, and amber checkmarks.

Selection uses a single filled surface without an extra outline or enlargement. Both grids include internal scroll padding so focused containers stay fully visible. The clock remains unchanged at the user's request.

Launch feedback uses a centered dark panel with a clear input icon, larger text, and a single Back to dock button. The orange accent rule is removed. Browser previews describe input switching accurately. TV loading and error feedback use the same panel.

All overlay surfaces now use night-tinted glass with translucent fill and a shared 22px backdrop blur. Settings uses only the landscape behind the glass; the Home dock and controls are hidden while Settings is open. Sources and launch feedback use the same material. The cream focus fill remains unchanged, without an extra ring.

Home-only motion adds short focus-color transitions, a 2px artwork lift inside the fixed selection container, and smooth vertical dock scrolling. Transitions run only while Home is active and stop at rest. Reduced-motion preferences disable the artwork lift and smooth scroll while keeping brief color feedback. Settings, Sources, and launch-panel motion are unchanged.

Performance version 1.1.2 preserves the rendered design and motion. Removed only obsolete styles and duplicate bundled assets. Focus updates touch only changed nodes; unchanged grids and menus are reused. Home's selected apps are verified before remaining Settings entries, and the clock pauses in the background. Performance evidence is in the workspace's performance/REPORT.md.
