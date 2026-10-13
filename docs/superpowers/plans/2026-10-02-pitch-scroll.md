# Pitch Scroll Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan inline. Steps use checkbox syntax for tracking.

**Goal:** Replace the horizontal strip with an expressive three-beat scroll story using the first pitch slide's exact text.

**Architecture:** Semantic HTML remains readable without animation. A scoped GSAP timeline pins the scene and choreographs words, a rolling circle and an orbit. Existing hero animation stays in place.

**Tech Stack:** Static HTML/CSS, local GSAP and ScrollTrigger, Playwright regression checks.

**Spec:** User request and first slide of `Питч_1.pdf`; GSAP homepage visually inspected. User selected expressive rotation and composition changes, blue/yellow palette.

## Global Constraints

- Scene follows the nearest-program announcement; hero object continues unfolding on scroll.
- Exact copy: «Согласились. Оправдывались. А потом полвечера продолжали разговор у себя в голове.»
- Keep both first-slide supporting sentences and the five pressure factors.
- All copy readable on mobile, with reduced motion and without JavaScript.
- Local prototype only; no hosting changes.

## Review Focus

- Long Russian word fits at 390px and desktop sizes.
- Pinned scene leaves room under the sticky header at short viewport heights.
- Reverse scroll reverses motion without losing words.
- Resizing and reduced-motion changes restore the readable static layout.
- Inactive scenes don't hide focused course links.

### Task 1: Story choreography

**Files:** Modify `v2/index.html`, `v2/redesign.css`, `v2/redesign.js`, `tests/scroll-motion.cjs`.

**Interfaces:** Keep `#pressure` and `#pressure-title`; scope timeline queries to the section. ScrollTrigger `pitch-story` owns pinning; `hero-turn` is unchanged.

- [x] Replace old strip assertions with exact-copy, readable-beat and reverse-scroll checks; run to see the old implementation fail.
- [x] Build three beats: rolling «Согласились.», staggered «Оправдывались.»; inner-dialogue orbit; pressure explanation and factors.
- [x] Run scroll-motion and existing design-smoke checks. Inspect desktop and mobile scenes visually.
- [x] Record verification and leave the local preview ready for the user.

## Execution record

Inline execution authorized by the user's request to add the story and explicit expressive-style answer. No additional design approval needed. No commit requested; preserve the existing untracked prototype workspace.


Verification complete: `tests/scroll-motion.cjs` and `tests/design-smoke.cjs` pass; `node --check v2/redesign.js` passes. Visual inspection covered desktop and mobile opening, orbit and explanation beats. Screenshot: `.preview/pitch-scroll-desktop.jpg`.

Independent review found one P2: short landscape scenes exceeded the available viewport. Reproduced with 844×390 (scene 460px + header 97px), then disabled pitch pinning below 600px. Regression test now passes for 844×390 and 390×500. The same check exposed 13px of overflow from the existing hero orbit; horizontal clipping on the hero fixes it without changing its scroll timeline.

Resize test waits for the newly rebuilt ScrollTrigger before sampling, to avoid asserting against the outgoing desktop timeline. Actual phrase bounds, CTA bounds and reverse scroll are checked at 1440×960, 1440×640, 390×844 and 320×640, plus dynamic desktop/mobile changes. Static versions checked with reduced motion and JavaScript disabled.

Ruling: Below 600px window height, show the full pitch in ordinary document flow. This favors legibility in landscape; the expressive pinned story remains available in taller windows. No deferred review findings.
