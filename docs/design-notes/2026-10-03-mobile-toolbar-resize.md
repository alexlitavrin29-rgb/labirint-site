# Mobile browser toolbar resize stability

User reports jerks when the Google application's address bar hides or returns
while scrolling, and requests desktop story travel +35% from the original length.

Reproduced the page-side defect in mobile Chromium: 390px width, start height
650px, pressure scene at .88; cycle height through 610/590/570px. The existing
min-height:600px GSAP media condition destroyed the story when the height crossed
600px. The regression failed with same:false, exists:false, animated:false.
This is evidence of a page-side layout reset; it is not a physical iPhone trace.

All three story height media conditions are now scoped to desktop width. The
mobile pressure story makes its short-screen choice on initial setup. Height-only
changes therefore retain its context; a debounced real width change within mobile
re-evaluates the fallback via gsap.matchMediaRefresh. Crossing desktop breakpoints
remains handled by existing media conditions. This covers rotation without
rebuilding on toolbar/keyboard height changes. The existing native mobile sticky
layout and ignoreMobileResize configuration remain intact.

Official references:
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.config()/ explains the
  touch-only vertical resize opt-out, which does not replace our application
  media-query activation rule.
- https://gsap.com/docs/v3/GSAP/gsap.matchMediaRefresh()/ documents re-running
  matching contexts when a real layout change requires adaptation.

Desktop pressure travel is 4320px = 3200px * 1.35. Mobile travel remains 1800px.
No artificial scroll interception or new rendering loop was added.

Checks passed: eight height-only cycles preserve the exact scene instance and
scroll position, with zero ScrollTrigger refresh events; true width/orientation
change switches to a short landscape static layout and restores portrait; an
initially short screen remains static. Full scroll-motion and first-entry/pacing
regressions passed. Physical Google app on iPhone remains unverified.
