# Landing-page performance budget

Published release: `20261002213216Z`, 2026-10-03 (Europe/Moscow).
URL: http://a0091381.xsph.ru/v2/?theme=blue

## Budget and protocol

Cold Chrome, new browser per sample, 390×844 touch/mobile viewport, DPR 3,
4× CPU slowdown, 200,000 bytes/s download (1.6 Mbps), 150 ms latency.
The hero must successfully decode and paint before capturing LCP and tapping.
Native touch gestures cover more than 85% of the document, including the pressure
scene. CLS includes the entire observed session, with the standard session-window
calculation and recent-input exclusion. Failures and completed samples are retained.

| Metric | Budget | Three completed published IPv4 samples |
|---|---:|---:|
| LCP | ≤2,500 ms | 1,660 / 1,536 / 1,560 ms |
| Maximum measured tap latency | ≤200 ms | 112 / 48 / 88 ms |
| CLS over loading and scrolling | ≤0.1 | 0.000393 / 0.000393 / 0.017722 |
| Initial blocking time | ≤200 ms | 101 / 68 / 150 ms |
| Scroll frame interval p95 | ≤33.5 ms | 16.8 / 16.7 / 16.7 ms |
| Scroll frame intervals >100 ms | 0 | 0 / 0 / 0 |

Initial resource transfer fell from 722,338 to 365,917 bytes (about 49% less).
The earlier public baseline LCP was 2,924 ms. Baseline CLS was measured during
loading only; it must not be compared directly with final whole-session CLS.

LCP/CLS targets follow [web.dev's thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds).
Tap latency is a limited laboratory Event Timing measurement, not field INP.
Blocking time is the sum of long-task time exceeding 50 ms from FCP through the
initial settled window, not an official Lighthouse TBT result. Its 200 ms target
is informed by [Chrome's mobile TBT guidance](https://developer.chrome.com/docs/lighthouse/performance/lighthouse-total-blocking-time).
RAF intervals are a laboratory proxy for scrolling smoothness, not a physical
phone's GPU presentation trace. Real iOS Safari has not been measured.

## Changes

- Cyrillic/Latin WOFF2 subsets retain both variable weight ranges, shaping,
  kerning and original OFL source fonts/licenses. Runtime font bytes fell from
  514,000 to 229,076; both preload early.
- The hero uses a 61,212-byte AVIF with the existing WebP codec fallback.
- `landing.css` and `landing.js` bundle six stylesheets and six classic scripts
  in their original order. Source files and vendor license comments remain.
  Rebuild with `python3 tools/build-landing-assets.py` after editing a source.
- Mobile pressure pinning uses transforms. Full-scroll measurements exposed
  a CLS of 1.8199 when fixed pinning entered/exited; transform pinning removed it.
- Disabled browser scroll anchoring on the landing page to avoid conflicting
  with responsive GSAP pin rebuilding. Desktop choreography remains intact.
- Both releases were staged separately, backed up and checked against SHA-256
  manifests; the final release's 64 files matched the server. Cache revision
  queries and dynamic module revision are updated.

All nine local browser scripts passed after bundling, including mobile layout,
reverse scrolling, letter zoom, skills spacing and history restoration.
Public desktop smoke checks passed. The in-app browser's normal hostname loaded
the final release with decoded hero, no horizontal overflow and complete document.

## Unresolved transport limitation

Three consecutive IPv4 samples passed, but repeated ordinary-hostname Chrome
series encountered 30-second navigation timeouts. A subsequent public mobile
smoke navigation also timed out despite using IPv4. Therefore an IPv6/DNS cause
is not established, and IPv4 is not a proven cure.

A captured failed CSS request established TCP to 141.8.193.173, sent its HTTP GET,
then received no response headers before cancellation at 30 seconds. In other
failed runs the document request itself received no response. Six separate curl
checks with no-cache headers and a browser User-Agent returned HTTP 200 with
first byte in 0.094–0.369 seconds. This does not identify whether the intermittent
problem is hosting, network transport, or the test environment.

The ordinary connection stability requirement remains unverified. Do not report
the entire optimization/connection task as unconditionally complete. Requested
a phone/mobile-network check from the user to distinguish visitor impact from
the test environment. No network, DNS, certificate or hosting-security settings
were changed. No message was sent to the hosting provider.

Raw baseline, three successful IPv4 samples, partial runs and navigation errors
are preserved in `docs/performance/`. Detailed request logs and diagnostic CLS
sources are in the ignored `.preview/` directory. Tests do not retry or omit
failures automatically.
