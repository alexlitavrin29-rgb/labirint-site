# Erickson Refinement Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline. Steps use checkbox syntax.

**Goal:** Speed up the scroll story, replace its ending with two centered statements, and make the lower homepage readable and expressive like the supplied Erickson reference.

**Architecture:** Keep semantic static content and local GSAP. Two sequential statement layers share a bottom CTA. Use locally hosted Montserrat and Caveat; retain warm/blue palette selection. Program becomes a warm section with animated SVG wave boundaries, a sticky intro and three readable module cards.

**Tech Stack:** HTML, CSS, SVG, GSAP/ScrollTrigger, Google Fonts under OFL, existing Playwright checks.

**Spec:** Latest user feedback; live Erickson reference visually inspected. Ignore unrelated conversation picked up in the dictated message.

## Global Constraints

- Scroll story needs significantly less scrolling than previous 3000px desktop / 2350px mobile.
- Center the pressure/illusion-of-choice statements, show them sequentially and put the course CTA below.
- Remove authority/haste/emotion/uncertainty/trust diagram.
- Render the three-module program directly; remove the redundant «Посмотреть программу» CTA.
- Increase lower-homepage body text, simplify typography and add organic colored section transitions.
- Keep short-height, no-JS and reduced-motion versions readable, and retain the hero object.

## Review Focus

- Cyrillic font loads correctly and long opening word fits at 320px.
- Long second statement fits under the sticky header at 600px height.
- Text remains readable during fast scrolling and reverse scroll.
- Sticky program intro is disabled on small/short screens; waves never cover copy.
- Enlarged navigation/cards/footer don't cause horizontal overflow.

### Task 1: Copy, type and flow

**Files:** `v2/index.html`, `v2/redesign.js`, `v2/redesign.css`, `v2/assets/fonts/`, `tests/scroll-motion.cjs`, `tests/editorial-flow.cjs`.

- [x] Update motion checks for four reading beats and shorter scroll distance; add lower typography/program regression checks. Observe old version fail.
- [x] Add local fonts, centered sequential statements, faster timeline and SVG decoration.
- [x] Rebuild program and lower typography, animate the wave boundary on ordinary scrolling.
- [x] Verify desktop/mobile/short/reduced-motion and existing buttons/menu/themes; visually inspect and save proof.

No production publishing or new content claims. Continue within the user's requested prototype scope.


## Execution record

Implemented local Montserrat/Caveat with OFL licenses, 1800px/1500px pitch story, sequential centered statements, shared bottom CTA, custom SVG flower and orbit. Removed factor diagram and redundant program-link button. Program now has two GSAP-morphed SVG waves, warm peach backgrounds, a sticky intro and three module cards. Enlarged lower-body text to 18–20px and unified headings/accents.

RED→GREEN: old editorial check failed on factor diagram; new code passes. Narrow 320px regression exposed a 10px practice statistic overflow; mobile statistic now stacks vertically and passes.

Independent review found no confirmed defects. Candidate sticky-intro clipping at 1440×768 was explicitly tested: CTA stays fully visible while modules scroll. Also checked 1024×768, 390×844, 320×640 and 844×390.

Ruling: Use Montserrat for primary text and Caveat for expressive accents, matching the reference's observed font families. Keep the existing model and psychological copy. No deferred findings.

Screenshots: `.preview/erickson-program-updated.png`, `.preview/pressure-centered-updated.png`, `.preview/pressure-choice-updated.png` visually inspected.

Final verification: scroll-motion (including bottom CTA bounds), editorial-flow and design-smoke all pass. JS syntax and whitespace checks pass. Mobile program screenshot `.preview/erickson-program-mobile.png` also inspected. Preview returned to normal viewport and left open.
