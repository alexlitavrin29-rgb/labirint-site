# Quiet first screen and sequential introduction

Published the user-approved first-screen revision to
http://a0091381.xsph.ru/v2/?theme=blue .

The main hero now contains only the heading, short product label and the
hover/focus-responsive object. It scrolls normally. Below it, a real portrait
introduces Lykov, followed by the shorter practice description, 70% practice
and the enquiry CTA. Text appears letter by letter from right to left.
Both specialists remain in the team section. Skill headings answer the question
«Что будем тренировать?» using noun phrases. Influence travel is 15% longer;
pressure and skills have smaller extensions, matching the user's request.

Passed: hero-sequence, design-smoke, editorial-flow, profile-story, skills-story,
scroll-motion, scroll-comfort, mobile-performance, history-rendering.
The final isolated mobile budget passes (4× CPU, throttled network, cold cache):
LCP 2320ms, CLS 0, blocking 83ms, tap latency 120ms, frame P95 16.8ms,
zero scroll stalls. This is a browser emulation, not a real-device field study.

Independent source review findings about screen-reader text and live reduced
motion cleanup were fixed and verified. Per-letter initial layout work was
removed: one GSAP ScrollTrigger now starts CSS character animation.

19 changed files passed staged and published SHA256 verification, and all 19
public HTTP responses matched the local manifest. The server-only files were
preserved. Recovery archive:
/home/a0091381/.codex-deployments/20261006-clean-hero/v2-before.tar.gz

No form delivery backend was added in this visual revision.
