# Soft full-screen profile question

The user rejected the letter-A zoom as abrupt and emotionally unpleasant. After
“Третьего сбивает чужая эмоция”, the existing full-screen “А как это происходит
у вас?” should simply appear. Desktop animated stories should require 20% more
scroll travel relative to the current release; mobile travel stays unchanged.

Bounded design: retain the blue palette, map, three phrases and full-screen
question typography. Fade the camera/map over .7 timeline units starting at3.45,
with only -12px vertical movement. Fade the full-screen question over .9 units
starting at3.75, from18px to0px. Both ease sine.inOut; no camera, glyph or question
scaling. Retain total timeline5.7 and a readable question hold at its end.
Remove the letter-specific HTML/CSS and camera-centering calculations.

Desktop travel: hero2000→2400; pressure4320→5184; profile2800→3360;
skills3000→3600. Values are exactly previous travel*1.2. Native mouse/touch input
and existing scrub catch-up are preserved; mobile pressure remains1800.

The new transition test failed against the previous zoom (camera scaled at3.4),
then passed after implementation at1440x960,1440x640 and1024x768. It checks a
readable third phrase, no scale during transition, gradual partial opacity,
full-scene final bounds and reverse-scroll restoration. Existing zoom-handoff
regression is retired because its required behavior was explicitly removed;
profile-story checks keep text bounds, accessibility, pin placement and fallbacks.
