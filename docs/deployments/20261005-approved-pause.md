# Deployment 20261005-approved-pause

Published 2026-10-05 (Europe/Moscow) to
http://a0091381.xsph.ru/v2/?theme=blue using the existing hosting destination.

All 66 staged and published files passed SHA256 checks. Public HTTP checks also
matched index.html, landing.css, landing.js and course.html against the local
manifest. Server-only files were preserved. Recovery archive:
`/home/a0091381/.codex-deployments/20261005-approved-pause/v2-before.tar.gz`.
The release directory also contains the package, manifest and verification reports.

Changes: approved landing copy, four revised skills, real leading teacher portrait,
purposeful pending demonstration/review/conditions slots, optional name and format
selection in the landing dialog, aligned course-page format field and pending-price
typography, an interactive GSAP pause diagram, subtle entrance/arrow motion and
responsive typography. Existing palettes, 3D, native scrolling, mobile loading mode,
soft profile question and prior desktop scroll travel remain.

All 17 browser test files passed after fixing reduced-motion initialization,
response-text contrast and short-screen skill spacing. Two text/navigation assertions
were updated to the newly approved skill names and same-page skills destination.
Checks cover motion continuity, reverse scrolling, keyboard, responsive bounds,
no-JavaScript and reduced-motion fallbacks, BFCache, mobile touch scrolling,
performance budgets, palette/navigation/dialog behaviour, course layout at 320px,
and the new exercise interaction. node --check passed for both changed source and bundle.

Independent source review findings (response contrast, missing course format field,
and oversized pending-price text) were corrected and verified. Public in-app browser
confirmed the new copy and toggled the exercise to its paused state.

The existing application form remains explicitly a demonstration and does not send
contact data. Real quotes, training footage and confirmed terms remain pending slots.
No Git push was performed: this repository has no commits or remote, and the user
provided the established hosting access for publication instead.
