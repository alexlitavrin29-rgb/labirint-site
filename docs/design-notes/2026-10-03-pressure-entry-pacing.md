# Pressure scene first-entry and pacing

User supplied a mobile screenshot of outlined letters and a demand phrase visible
before the animation starts, and requested slower playback while scrolling.

Reproduced at 390x844: pitch story progress 0, range 900px. Only the first
staggered letter was hidden; all subsequent letters were visible. Desktop
initial letters were hidden in the same probe. The new first-entry regression
failed before implementation. Explicit initial state must cover all staggered
children, including the pressure-demand phrases in the screenshot.

Mobile scroll travel changes from 900 to 1800px; desktop from 3200 to 4000px.
A 600px movement advances at most one third of the mobile story and 15% of the
desktop story. This adds reading time without intercepting native wheel/touch
input or increasing touch catch-up lag. Mobile CSS sticky travel uses the same
custom property as the ScrollTrigger range to keep the CTA within its section.
Reduced-motion, short-height and no-JavaScript fallbacks remain natural text.

First targeted verification passed first-entry and rewind letter hiding,
word appearance and pacing; continuity passed CTA visibility/navigation after
viewport-height changes. Full scene verification subsequently found a hidden
statement at 320x640 after refresh. The initial failing evidence is retained:
progress .65, timeline .647403, statement opacity 0/visibility hidden.

Entrance tweens now state both opacity endpoints for demand phrases and the
first explanation statement. A dedicated demand-appearance assertion failed
when the seeded hidden state was used with a from-only tween, then was corrected
with explicit from/to endpoints. Full scroll-motion verification passed after
the statement fix. Separate Chrome launches timed out twice before any page
loaded; these launch failures are distinct from animation assertions and are
retained as a test-environment limitation.

Final first-entry/pacing test passed in installed Chromium headless shell after
Chrome's launch timeout. It verifies letters and demand phrases hidden before
entry and after rewind, both becoming readable during their beat, and a 600px
movement staying within the pacing limit. Screenshots:
`.preview/pressure-clean-entry-mobile.png` and `.preview/pressure-paced-mobile.png`.
Published release 20261002233121Z; all 64 remote file hashes passed. The in-app
browser loaded that exact release with document complete and 1800px mobile travel.
