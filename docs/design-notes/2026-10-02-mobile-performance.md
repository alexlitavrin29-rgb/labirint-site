# Mobile landing-page adaptation

User intent: make the existing pressure-course landing page comfortable and responsive on phones, without the desktop choreography overwhelming reading or causing freezes. Preserve the desktop design and its approved pressure hook, letter zoom and skills sequence.

## Mobile rendering and flow

- `visual-runtime.js` imports the two desktop WebGL modules only above 760 px width, with at least 600 px height, normal motion preferences and no data-saving/2G connection. Initial mobile loads make no WebGL contexts and fetch neither Three.js nor the GLB model.
- A transparent WebP render of the existing model replaces the hero's live 3D. It moves with one scroll-bound rotation/scale transform, with no continuous GPU loop. It is 123 KiB. Retained original source model and its license.
- Removed mobile hero pinning. The pressure hook remains animated with a 900 px scroll distance, down from 1500 px. On low screens or reduced-motion settings it reads in normal flow.
- Profile and skills read as sequential blocks on mobile. The full letter zoom and four pinned skills remain on desktop. The profile uses its existing CSS volume and SVG network on mobile.
- Disabled mobile backdrop blur and animated SVG wave morphing, retained the waves' shape and colors. Improved touch targets, form scrolling on small/landscape screens and 16 px input text to avoid focus zoom.
- Both GPU loops stop for light mode, mobile layouts, hidden documents and reduced motion, and resume when appropriate. `visualmodechange` covers connection changes after an initial desktop load.

## Download reductions

The portrait's original 2.1 MiB PNG is retained; the page uses a 45 KiB WebP derivative with lazy loading and asynchronous decoding. Fonts retain identical tables, glyphs, variable weights and OFL licenses in compressed WOFF containers: Montserrat 744,936 → 297,880 bytes; Caveat 403,648 → 216,120 bytes. Original TTF sources remain. Font display uses swap, and ScrollTrigger refreshes once fonts finish loading.

## Verification

All nine browser scripts passed: design-smoke, scroll-motion, profile-story, profile-zoom-handoff, skills-story, skills-spacing, editorial-flow, history-rendering and the new mobile-performance check. The new check first reproduced two initial mobile WebGL contexts, then passed after the light rendering path was implemented. It verifies no 3D downloads/contexts, natural reading flow, width, menu/form, input sizing, short hook and a main-thread long-task budget under 4× CPU slowdown at 320×600, 390×844, 430×932 and 844×390, DPR 3 with touch/mobile enabled.

A separate cold-load check at 150 ms latency, 200,000 bytes/s download and 4× CPU slowdown measured the first CTA available after 2,959 ms and both compressed fonts loaded after 4,936 ms. These are local Chrome emulation measurements, not guarantees for a physical phone or production hosting. WebKit runtime was unavailable; real iOS Safari has not been tested.

Independent review verified initial mobile → desktop initialization, desktop → mobile restoration of readable text, reduced-motion transitions, and zero GPU draw calls during data-saver/2G/mobile states followed by correct resumption. Screenshots of the hero, profile and skills were inspected. The local user's preview was refreshed and confirmed in light mode.
