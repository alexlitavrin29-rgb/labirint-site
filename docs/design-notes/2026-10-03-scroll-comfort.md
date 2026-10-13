# Mobile comfort, browser dark conversion and scroll pacing

User-approved desktop composition remains the same. The phone pressure hook
now uses shorter travel, lighter squeeze and .7-second catch-up. Both approved
light palettes remain light under Chromium automatic dark conversion through an
early HTML `color-scheme` meta and a root `color-scheme: only light` declaration.
All linked HTML pages receive the early meta too.

The user's subsequent request was to slow all landing-page scroll animation so
a short mouse-wheel action cannot consume a whole scene. Desktop scene ranges:

| Scene | Previous pixels | Current pixels | Catch-up seconds |
|---|---:|---:|---:|
| Hero pin and intro | 1150 | 2000 | .85 (intro) |
| Pressure story | 1800 | 3200 | .85 |
| Personal susceptibility and A zoom | 1100 | 2800 | .9 |
| Four skills | 1050 | 3000 | .85 |

Program waves use .8-second smoothing and one-off reveals use .9-second sine
out easing. Touch scrolling remains native. Mobile pressure remains 900 pixels,
profile/skills remain in normal flow, and no wheel handler, extra dependency,
permanent RAF loop or mobile 3D renderer was introduced. Reduced-motion and
short-screen fallbacks still show all text without pinning.

The new native-wheel test first failed on the prior hero range. After changes,
a 600-pixel mouse wheel gesture consumes 30%, 18.75%, 21.43% and 20% of the four
scenes respectively. Actual forward and reverse gestures, settling, and native
End-key bottom navigation passed. Huge deliberate gestures can still skip a
scene; wheel input is not trapped or capped.

Final local checks: design-smoke, editorial-flow, scroll-motion,
mobile-performance (4x CPU slowdown), profile-story, profile-zoom-handoff,
skills-story, skills-spacing, history-rendering, mobile-comfort and
scroll-comfort. All 11 passed. The dark regression first captured [30,29,25]
instead of the cream [255,253,248] background; after the fix both blue and warm
palette screenshots preserve their cream backgrounds. Bundles match source.
Narrow review found no substantive regression.

Actual Google app on iPhone remains unverified. Desktop Chromium touch emulation
and forced-dark painting are covered. A preceding public Chrome check loaded the
HTML but timed out waiting for the hero image to decode; this does not overturn
the previous unresolved intermittent transport finding in the performance report.
