# HTML/CSS Pattern

Use this pattern after reading the generated `button-slices.json`. Replace the component class, dimensions, grid columns, colors, and every asset URL with manifest values and project-relative paths.

## Contents

- [Markup](#markup)
- [Component CSS](#component-css)
- [Integration rules](#integration-rules)

## Markup

```html
<a class="button sliced-image-button profile-image-button" href="#target">
  <span class="sliced-image-button__skin" aria-hidden="true">
    <span class="sliced-image-button__slice sliced-image-button__left-cap"></span>
    <span class="sliced-image-button__slice sliced-image-button__left-rail"></span>
    <span class="sliced-image-button__slice sliced-image-button__center"></span>
    <span class="sliced-image-button__slice sliced-image-button__right-rail"></span>
    <span class="sliced-image-button__slice sliced-image-button__right-cap"></span>
  </span>
  <span class="sliced-image-button__label">Button label <span aria-hidden="true">→</span></span>
</a>
```

Keep the project's existing semantic element, destination, accessible name, and event hooks. Add only the skin structure required by this component.

## Component CSS

```css
.profile-image-button {
  --button-width: 300px;
  --button-height: 62px;
  --left-cap-width: 35px;
  --left-rail-flex: 170fr;
  --center-width: 60px;
  --right-rail-flex: 170fr;
  --right-cap-width: 35px;

  --slice-left-cap: url("generated/profile-default-left-cap-HASH.png");
  --slice-left-rail: url("generated/profile-default-left-rail-HASH.png");
  --slice-center: url("generated/profile-default-center-HASH.png");
  --slice-right-rail: url("generated/profile-default-right-rail-HASH.png");
  --slice-right-cap: url("generated/profile-default-right-cap-HASH.png");

  position: relative;
  display: inline-flex;
  width: var(--button-width);
  height: var(--button-height);
  align-items: center;
  justify-content: center;
  padding: 0 28px;
  overflow: hidden;
  border: 0;
  background: transparent;
  box-shadow: 0 0 4px rgba(255,255,255,.72);
  transform: none;
}

.profile-image-button:hover,
.profile-image-button:focus-visible,
.profile-image-button:active {
  --slice-left-cap: url("generated/profile-selected-left-cap-HASH.png");
  --slice-left-rail: url("generated/profile-selected-left-rail-HASH.png");
  --slice-center: url("generated/profile-selected-center-HASH.png");
  --slice-right-rail: url("generated/profile-selected-right-rail-HASH.png");
  --slice-right-cap: url("generated/profile-selected-right-cap-HASH.png");
  width: var(--button-width);
  height: var(--button-height);
  box-shadow: 0 0 4px rgba(255,255,255,.72);
  transform: none;
}

.sliced-image-button__skin {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns:
    var(--left-cap-width)
    minmax(0, var(--left-rail-flex))
    var(--center-width)
    minmax(0, var(--right-rail-flex))
    var(--right-cap-width);
  pointer-events: none;
}

.sliced-image-button__slice {
  min-width: 0;
  background-position: center;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.sliced-image-button__left-cap { background-image: var(--slice-left-cap); }
.sliced-image-button__left-rail { background-image: var(--slice-left-rail); }
.sliced-image-button__center { background-image: var(--slice-center); }
.sliced-image-button__right-rail { background-image: var(--slice-right-rail); }
.sliced-image-button__right-cap { background-image: var(--slice-right-cap); }

.sliced-image-button__label {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  white-space: nowrap;
}
```

## Integration rules

- Use a unique component class in addition to `sliced-image-button`; never overwrite a shared `.button` selector.
- Copy numeric grid values directly from `manifest.layout`. Append `px` to fixed widths and `fr` to rail weights.
- Keep the same width, height, shadow, padding, and transform in all interaction states.
- Set state-specific text and text-shadow colors on the component selectors without moving the label.
- Preserve the native focus outline or add a visible project-appropriate focus ring.
- Update the stylesheet URL cache key after CSS changes. Do not add query strings to hashed slice filenames.
- If the button cannot fit at 390px, ask for a responsive target size instead of compressing protected slices.
