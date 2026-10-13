# From susceptibility to a practical response

The user requested the final reading order: pressure hook → susceptibility map → fullscreen personal question → premise about practicing rather than memorizing → four animated skills → training result → existing three-day program.

Moved the profile section immediately after the pressure hook. Its final question is now an overlay spanning the pinned viewport; the map and scene heading fade away as it arrives. All text remains in semantic document order and in the accessibility tree.

The premise places “Заучивать ответы бессмысленно. Учимся оставаться собой под давлением” on the left and the manipulator's haste, intimidation and confusion on the right. A separate GSAP scene presents 0.1 Распознать, 0.2 Дистанцироваться, 0.3 Вернуть себе контроль and 0.4 Нейтрализовать, one at a time. Words move into place while a frame opens to give them space. The scroll distance is 1050 px on desktop and 850 px on mobile. Reduced motion, low screens and no-JS show the full sequence in natural flow.

“Под давлением срабатывает то, что натренировано” follows the skills and leads into the existing wave transition and program. The program's CTA is now a yellow “Обсудить свою ситуацию”, opening the existing prototype dialog. No remote form transmission or deployment was introduced.

Verification: skills-story.cjs failed against the old flow before implementation, then passed for desktop, short desktop, mobile and 320×600; covers four readable transitions, reverse scrolling, accessibility, static fallbacks and the CTA. Updated profile-story.cjs passed with the fullscreen ending. Screenshots are in .preview/profile-question-desktop.png and .preview/skills-1-desktop.png through skills-4-desktop.png, plus skills-mobile.png. All six project scripts passed, along with JS syntax and HTML nesting checks.

Independent review confirmed correct trigger ordering, live resizing, reverse scrolling and reduced-motion handling. It identified a 1000 px scene-height cap that exposed the next section on a 2560×1440 monitor. Added tall-screen regressions to both scene tests, observed their failures, removed the cap and verified both scripts passed. The fullscreen question and skills now fill the available viewport height on tall screens. Final copy/transition screenshots inspected; local user preview reloaded.
