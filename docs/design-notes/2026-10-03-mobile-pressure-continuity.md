# Mobile pressure scene continuity

The user's screenshot showed the CTA clipped by the next section. Reproduced in
Chrome touch emulation: viewport 564x640, pressure progress .97, then grow height
to750 without reload. ScrollTrigger's transform pin retained a 564px section while
the 100svh child grew. CTA bottom684.77px exceeded parent bottom639.83px; hit testing
returned false. The new continuity regression failed before the change.

Mobile now uses CSS sticky for the scene, with parent height equal to the shared
clamped viewport scene height plus 900px scroll travel. GSAP pinning remains only
on desktop. overflow:clip avoids creating an ancestor scroll container;
see https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow .
The CTA has an extra16px bottom inset. Mobile text/frame/rail appearance is faded
and eased; incoming word opacity preserves its place in the reading tree. Smaller
statement movement and .5s catch-up keep touch response closer to gestures.
Desktop ranges/choreography and both approved palettes are preserved.

Public inspection of the interim release also found the CTA shifted right:
GSAP's y animation replaced the CSS translateX centering. The regression was
extended to check both viewport axes and horizontal centering; it failed before
the correction. Auto inline margins now center the button independently of its
animated transform. The final published release is 20261002225906Z.

Continuity checks passed at564,390,320px widths, including height grow/shrink,
CTA hit testing and real link navigation, progressive frame opacity, reverse
scroll and static/reduced-motion fallbacks. Native touch performance used390x844,
DPR3 and4x CPU slowdown, eight real forward/reverse CDP touch gestures:

{
  "cpuSlowdown": 4,
  "dpr": 3,
  "frameCount": 122,
  "p95Ms": 33.400000000000546,
  "stalls": 0,
  "maxStickyDriftPx": 0,
  "pin": false
}

These are Chromium laboratory measurements, not a physical iPhone rendering
trace. No wheel interception, artificial scroll slowdown, mobile WebGL or new
runtime dependency was added. Narrow code review found no substantive issue.

A CPU-budget run launched concurrently with four other browser tests failed its
aggregate main-thread threshold (tasks307,127,64,100,52,236,123,51,169,111ms).
It is retained here rather than silently omitted; the isolated rerun is recorded
in the deployment report. Timing tests need an otherwise idle test machine.
