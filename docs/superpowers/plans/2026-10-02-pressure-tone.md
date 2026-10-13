# Pressure Hook and Landing Flow Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline.

**Goal:** Give the hook a clear psychological-pressure feeling within the existing palette and simplify the route to enrollment.

**Architecture:** Use the site's light blue background, navy/teal typography, cream surfaces and restrained yellow accents. Closing rectangular edges, fragments of demanding speech and displaced echoes convey pressure. Keep the scroll length; release the constrained space smoothly for rumination and explanation/CTA. Decorative content is aria-hidden. Static fallback remains readable.

**Tech Stack:** Existing HTML/CSS/GSAP and local fonts.

**Spec:** Latest user feedback. No red palette, clover or orbit motifs in the pressure hook. Retain hero and ordinary blue/yellow site style.

## Global Constraints

- Remove introduction and outcome cards. Keep the training headline/summary in the band directly before program.
- Keep the 70% statistic only inside program, remove the earlier duplicate.
- Restore color in actual expert photographs.
- After experts: opinion/reviews, certificate, enrollment, additional programs, then existing FAQ/contact/footer.
- Keep exact pitch copy, four reading beats, shorter scroll distance and all responsive fallbacks.

## Review Focus

- Decorative pressure edges/quotes must not obstruct words or CTA.
- Light/dark text and background transition remain readable in both palettes.
- Reordered anchor navigation still reaches existing targets.
- No duplicate 70% statistic or orphan program/review links.
- Reverse scroll and reduced motion restore complete readable copy.

### Task 1

- [x] Add order/color/decorative-content assertions, observe old page fail.
- [x] Simplify/reorder sections and restore portrait color.
- [x] Replace playful decor with pressure frames, demanding-speech fragments and echoes; inspect the proposed tone.
- [x] Run motion/editorial/smoke checks, review and capture desktop/mobile proof.

Inline iteration is authorized by the user's requested changes. User selected the stronger tone: tighter frames, angular shapes and sharper displacements.

The following feedback superseded the dark color treatment: keep the stronger spatial compression but soften the mood, use the main site's colors, and smooth the transition to rumination.

## Execution record

Implemented the dark ink hook, agreement stamp, outlined response, tightening frames, pressure rails and demanding-speech fragments. Rumination gains repeating background echoes. The explanation returns to the light blue palette. All decorative copy is aria-hidden. Original hero and shorter 1800/1500 scroll distance remain.

Removed the introduction/outcomes and duplicate practice statistic. The training headline and three-day summary now lead directly into the program. Actual expert portraits are in color. Lower sections follow opinion → certificate → enrollment → additional programs → FAQ/contact.

Independent review found one P2: metadata color changed from raw ScrollTrigger progress ahead of the scrubbed background. Reproduced with a failing assertion at 62% scroll, then moved the color switch and a brief metadata fade into the same timeline. Forward/reverse assertions now pass. No deferred review findings.

Verification: scroll-motion.cjs, editorial-flow.cjs and design-smoke.cjs all pass. Includes desktop/mobile, short screens, reverse scroll, dynamic reduced motion, no-JS reading, section order, portrait color, menu and CTA behavior. JavaScript syntax check passes. Visually checked the dark hook, pale explanation and color portraits; screenshots saved in .preview. Local user preview refreshed. No deployment performed.

## Light palette refinement

Removed the dark background, grain and separate color-release overlay. The entire hook now uses the page's blue/cream/yellow tokens. Softened stamp shadow, corners, quote fragments and typography; restored Caveat in the rumination line to connect with the other sections.

Frames contract more strongly in width and fit vertically around the title with responsive breathing room. Side rails move inward while the title compresses, then expand together. Removed frame jolts, oversized exit sweeps and the sudden color change. Short crossfades and small movements connect the four reading beats. Updated the motion regression's palette expectations and observed the old dark version fail before implementation.

Validation: all three regression scripts passed after the palette/timeline changes. After the final responsive frame-height adjustment, scroll-motion.cjs passed again, including reverse scroll and static fallbacks. Desktop and mobile screenshots at peak compression were visually checked. Syntax check passed. No deployment performed.
