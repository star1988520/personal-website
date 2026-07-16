---
name: build-sliced-image-button
description: Build or replace raster-backed HTML/CSS buttons with separate default and selected images while preserving corner ornaments and a protected center emblem through horizontal five-slice scaling. Use when Codex needs to resize an image button to requested dimensions, prevent hover/focus/active background zoom or layout shifts, keep only the side rails horizontally stretchable, apply the standard soft white shadow, or reuse this button treatment in another webpage.
---

# Build Sliced Image Button

Create a two-state `<a>` or `<button>` whose caps and center emblem scale uniformly with height while only the two side rails stretch horizontally.

## Required inputs

- Ask for target width and height every time they are not both explicit.
- Require a default-state image and a selected-state image. If either is missing, ask for it; do not generate or redraw one by default.
- Locate the target element, its component selector, its stylesheet, and the destination asset directory.

## Workflow

1. Inspect both images visually and read their pixel dimensions. Require identical dimensions and aligned artwork.
2. Identify four vertical guides in source pixels: end of left cap, start and end of protected center, and start of right cap. Place the two rail slices in quiet, horizontally stretchable regions. Ask for confirmation only when a safe guide is ambiguous.
3. Load the bundled workspace Python runtime when available and use its Pillow installation. Run `scripts/slice_button.py` with absolute paths for both images, the requested size, and the four guides.
4. Read the generated manifest and `references/html-css-pattern.md`. Copy the five-slice markup and substitute the manifest's dimensions and hashed asset paths.
5. Scope every rule to the target component. Do not change a shared `.button` rule or unrelated controls.
6. Update the page stylesheet cache key after editing CSS. Hashed slice filenames already invalidate image caches.
7. Verify the normal, hover, focus-visible, and active states at desktop width and 390px width.

## Command

```bash
python /absolute/path/to/build-sliced-image-button/scripts/slice_button.py \
  --default /path/default.png \
  --selected /path/selected.png \
  --out-dir /path/to/project/assets/generated-button \
  --name profile-button \
  --target-width 300 \
  --target-height 62 \
  --left-end 70 \
  --center-start 240 \
  --center-end 360 \
  --right-start 530
```

Treat guide values as image-specific measurements, not universal defaults.

## Guardrails

- Preserve the source images; write generated slices to a separate output directory.
- Never stretch the caps or protected center horizontally. Scale them from `target height / source height` only.
- Stop when the requested width is below the manifest's minimum width. Ask for a wider target or a smaller height; do not crop, squash, or overlap protected artwork.
- Keep button width, height, shadow, and transform identical across states. Use `transform: none` unless the user explicitly requests motion.
- Default to `box-shadow: 0 0 4px rgba(255,255,255,.72)` in every state.
- Switch state images for `:hover`, `:focus-visible`, and `:active`; do not use a `background` shorthand that can reset `background-size`.
- Keep text and arrow layers above the skin and stationary.
- Do not suppress a keyboard focus indicator unless an equally visible replacement exists.

## Validation

- Confirm ten slice PNGs and one JSON manifest were produced.
- Confirm fixed slice display widths equal source slice widths multiplied by the height scale.
- Confirm only rail columns absorb extra width.
- Confirm the rendered button matches the requested dimensions with no horizontal overflow, state jump, enlarged artwork, missing corners, console errors, or broken asset requests.
