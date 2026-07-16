# Video Banner Design QA

- Source visual truth: user selected the third revised option, C2 “轻卷草角框”, for the video-page scrolling frame.
- Final asset: `assets/video-reel-frame-integrated-v1.png`, copied from `assets/frame-option-c2-asset-2026-07-07.png`.
- Implementation screenshots:
  - `设计审查-2026-07-05/调整后验证/video-banner-c2-frame-desktop-2026-07-07.png`
  - `设计审查-2026-07-05/调整后验证/video-banner-c2-frame-tablet-2026-07-07.png`
  - `设计审查-2026-07-05/调整后验证/video-banner-c2-frame-mobile-2026-07-07.png`
  - `设计审查-2026-07-05/调整后验证/video-banner-c2-board-restored-desktop-2026-07-07.png`
  - `设计审查-2026-07-05/调整后验证/video-banner-c2-board-restored-tablet-2026-07-07.png`
  - `设计审查-2026-07-05/调整后验证/video-banner-c2-board-restored-mobile-2026-07-07.png`
  - `设计审查-2026-07-05/调整后验证/video-banner-c2-local-mat-desktop-2026-07-07.png`
  - `设计审查-2026-07-05/调整后验证/video-banner-c2-local-mat-tablet-2026-07-07.png`
  - `设计审查-2026-07-05/调整后验证/video-banner-c2-local-mat-mobile-2026-07-07.png`
- Viewports: 1440 × 900, 768 × 900, and 390 × 844.
- State: video archive masthead while the film track is moving.

**Full-view comparison evidence**

- The scrolling frame now uses the C2 simplified frame: warm cream paper, antique-gold lines, a small softened star medallion, and very small corner curl ornaments.
- The dense corner linework and stacked/repeated line structure from prior options are removed.
- The top and bottom frame borders are visibly slimmer, giving the photo window more space.
- The warm paper backing under the scrolling photos was restored after the C2 replacement made the image opening too dominant.
- The frame container's solid color backing was removed; the paper backing is now limited to a smaller inner mat behind the photo window.
- The static mural behind the scrolling album now uses `background-size: cover` on desktop/tablet so it fills wide fullscreen layouts horizontally.
- The central title plaque, background mural, copy, film strips, scrolling order, speed, and hover pause behavior remain unchanged.

**Focused region comparison evidence**

- Restored backing check: desktop frame measures about 380 × 384px; tablet about 222 × 226px; mobile about 246 × 252px.
- Inner image placement was adjusted to reveal the backing board again: `inset: 9.4% auto auto 6.2%`, `width: 87.7%`, `height: 79.8%`.
- Backing board is visible around the photo window: desktop roughly 36px top / 42px bottom, tablet roughly 21px / 25px, mobile roughly 24px / 27px.
- The scrolling frame container now reports transparent background; the local paper mat is rendered with the `:after` layer only inside the frame.
- Static mural fit: desktop/tablet use `background-size: cover`; the existing mobile override keeps `background-size: auto 100%`.
- Film-strip pseudo-elements still report `opacity: 1`, so the top and bottom film strips remain opaque.
- The middle photos continue using `object-fit: cover`; no visible stretching was observed.

**Required fidelity surfaces**

- Fonts and typography: unchanged.
- Spacing and layout rhythm: masthead layout and scrolling rhythm remain stable.
- Colors and visual tokens: frame keeps the approved warm cream / antique-gold direction; surrounding film palette unchanged.
- Image quality and asset fidelity: final frame remains a real integrated transparent-window PNG asset, not CSS-drawn line art.
- Copy and content: unchanged.

**Findings**

- No actionable P0/P1/P2 findings within the approved C2 scrolling-frame scope.

**Implementation Checklist**

- 1440px responsive check: passed on 2026-07-13; frame about 379.5 × 384.4px, mural uses `cover`.
- 768px responsive check: passed on 2026-07-13; frame about 221.4 × 225.9px, mural uses `cover`.
- 390px responsive check: passed on 2026-07-13; frame about 245.7 × 251.5px, mobile mural keeps `auto 100%`.
- Horizontal overflow: none at 1440 / 768 / 390px.
- Local page console errors: none during live browser confirmation.

final result: passed after live browser confirmation on 2026-07-13

---

# Social Follow Card Design QA

- Source visual truth: browser comment requested the video-page `section.social-follow` bottom card to keep the supplied landscape background and keyed compass mark, then remove the supplied decorative frame linework entirely.
- Generated assets:
  - `assets/social-follow-bg-v1.png`
  - `assets/social-follow-frame-v1.png` (kept in assets but no longer rendered)
  - `assets/social-follow-compass-v1.png`
- Implementation screenshots:
  - `设计审查-2026-07-05/调整后验证/social-follow-no-frame-desktop-2026-07-07.png`
  - `设计审查-2026-07-05/调整后验证/social-follow-no-frame-tablet-2026-07-07.png`
  - `设计审查-2026-07-05/调整后验证/social-follow-no-frame-mobile-2026-07-07.png`

**Comparison evidence**

- The decorative frame layer has been disabled; `section.social-follow:after` now renders no frame image.
- The supplied pale landscape background remains clipped inside the card and uses `cover` with `center 58%` positioning, allowing top whitespace to crop while preserving bottom mountain/temple detail.
- The compass mark remains at the top center above `FOLLOW THE JOURNEY`.
- The card height is restored close to the earlier compact block: 440px at 1440px, 410px at 768px, and 500px at 390px.
- Layout keeps the same content order: top emblem, eyebrow, main title, lead line, copy, then two centered action buttons.

**Implementation Checklist**

- 1440px responsive check: passed on local preview port 4174.
- 768px responsive check: passed on local preview port 4174.
- 390px responsive check: passed on local preview port 4174.
- Horizontal overflow: none.
- Local page console errors: none.

final result: passed
