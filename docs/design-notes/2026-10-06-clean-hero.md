# Quiet hero and sequential introduction

The user supplied and approved a concrete revision of the existing landing:
keep only the main heading and a hover-reactive object in the first screen;
remove its scroll pin and scroll-driven object rotation. In normal page flow,
introduce Lykov and his real photo, then a shorter account of practice, then
70% exercises and the enquiry CTA. Reveal introductory text letter by letter
from right to left. Preserve native scrolling, two palettes and both experts.

The copy now says: «Практикуем, как замечать давление, брать паузу и выбирать
ответ в своих интересах». Four skill headings are noun phrases that answer
«Что будем тренировать?». The influence scene has 15% more scroll travel;
the pressure and skills scenes receive smaller extensions (6% and 5%).
This follows the user's explicit pacing correction after the prior audit.

New standalone CSS/JS source files join the existing bundles. Introduction
entrances reveal once and remain readable. Full phrases stay available to
assistive technology; reduced motion and no JavaScript show native text.
Desktop hover or keyboard focus turns the actual 3D model, with a lightweight
image fallback. Phones keep the lightweight rendering path.

Verification: native hero scrolling, sequential content, hover and focus,
responsive widths, actual portrait load, letter readability, new skill bounds,
CTA, existing story progression, reduced motion and static content.

Review found two issues (screen-reader access to the animated paragraph and
event-created hover tween cleanup). Both are corrected and covered by the new
sequence test. A pageshow refresh after native scroll restoration prevents
transiently wrong ScrollTrigger coordinates during reload/viewport changes.

The mobile budget exposed a long initial task from per-letter GSAP reads.
A single GSAP ScrollTrigger now starts a CSS letter stagger; CSS performs the
individual character transitions. The visual order remains right to left,
with no per-letter layout reads and no additional scroll pin.
