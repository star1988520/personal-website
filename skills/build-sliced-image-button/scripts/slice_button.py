#!/usr/bin/env python3
"""Create content-hashed five-slice assets for a two-state image button."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import sys
from pathlib import Path

from PIL import Image


SEGMENT_NAMES = ("left-cap", "left-rail", "center", "right-rail", "right-cap")


def positive_int(value: str) -> int:
    number = int(value)
    if number <= 0:
        raise argparse.ArgumentTypeError("must be a positive integer")
    return number


def skill_name(value: str) -> str:
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", value):
        raise argparse.ArgumentTypeError("must contain only lowercase letters, digits, and hyphens")
    return value


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Slice aligned default/selected button images into five horizontal regions."
    )
    parser.add_argument("--default", required=True, type=Path, dest="default_image")
    parser.add_argument("--selected", required=True, type=Path, dest="selected_image")
    parser.add_argument("--out-dir", required=True, type=Path)
    parser.add_argument("--name", required=True, type=skill_name)
    parser.add_argument("--target-width", required=True, type=positive_int)
    parser.add_argument("--target-height", required=True, type=positive_int)
    parser.add_argument("--left-end", required=True, type=positive_int)
    parser.add_argument("--center-start", required=True, type=positive_int)
    parser.add_argument("--center-end", required=True, type=positive_int)
    parser.add_argument("--right-start", required=True, type=positive_int)
    return parser.parse_args()


def load_rgba(path: Path) -> Image.Image:
    if not path.is_file():
        raise ValueError(f"image not found: {path}")
    with Image.open(path) as image:
        image.load()
        return image.convert("RGBA")


def content_hash(image: Image.Image) -> str:
    digest = hashlib.sha256()
    digest.update(image.mode.encode("ascii"))
    digest.update(str(image.size).encode("ascii"))
    digest.update(image.tobytes())
    return digest.hexdigest()[:10]


def rounded(value: float) -> float:
    return round(value, 4)


def main() -> int:
    args = parse_args()

    default_image = load_rgba(args.default_image)
    selected_image = load_rgba(args.selected_image)
    if default_image.size != selected_image.size:
        raise ValueError(
            "default and selected images must have identical dimensions: "
            f"{default_image.size} != {selected_image.size}"
        )

    source_width, source_height = default_image.size
    guides = (args.left_end, args.center_start, args.center_end, args.right_start)
    if not (0 < guides[0] < guides[1] < guides[2] < guides[3] < source_width):
        raise ValueError(
            "slice guides must satisfy 0 < left-end < center-start < center-end "
            f"< right-start < source width ({source_width})"
        )

    bounds = (
        (0, guides[0]),
        (guides[0], guides[1]),
        (guides[1], guides[2]),
        (guides[2], guides[3]),
        (guides[3], source_width),
    )
    source_widths = {name: end - start for name, (start, end) in zip(SEGMENT_NAMES, bounds)}
    scale = args.target_height / source_height
    fixed_display = {
        "left_cap_px": source_widths["left-cap"] * scale,
        "center_px": source_widths["center"] * scale,
        "right_cap_px": source_widths["right-cap"] * scale,
    }
    fixed_total = sum(fixed_display.values())
    minimum_rail_width = max(1.0, scale)
    minimum_target_width = math.ceil(fixed_total + (2 * minimum_rail_width))
    if args.target_width < minimum_target_width:
        raise ValueError(
            f"target width {args.target_width}px is too small; minimum width is "
            f"{minimum_target_width}px at target height {args.target_height}px"
        )

    build_digest = hashlib.sha256()
    build_digest.update(args.default_image.read_bytes())
    build_digest.update(args.selected_image.read_bytes())
    build_digest.update(json.dumps({"guides": guides}, separators=(",", ":")).encode("ascii"))
    build_id = build_digest.hexdigest()[:10]

    output_root = args.out_dir.resolve()
    asset_dir = output_root / f"{args.name}-{build_id}"
    asset_dir.mkdir(parents=True, exist_ok=True)

    assets: dict[str, dict[str, str]] = {}
    for state, image in (("default", default_image), ("selected", selected_image)):
        state_assets: dict[str, str] = {}
        for segment, (start, end) in zip(SEGMENT_NAMES, bounds):
            piece = image.crop((start, 0, end, source_height))
            piece_hash = content_hash(piece)
            filename = f"{args.name}-{state}-{segment}-{piece_hash}.png"
            destination = asset_dir / filename
            piece.save(destination, format="PNG", optimize=True)
            state_assets[segment.replace("-", "_")] = destination.relative_to(output_root).as_posix()
        assets[state] = state_assets

    remaining_width = args.target_width - fixed_total
    manifest = {
        "schema_version": 1,
        "name": args.name,
        "build_id": build_id,
        "source": {
            "width_px": source_width,
            "height_px": source_height,
            "default": str(args.default_image.resolve()),
            "selected": str(args.selected_image.resolve()),
        },
        "target": {
            "width_px": args.target_width,
            "height_px": args.target_height,
            "height_scale": rounded(scale),
        },
        "guides_px": {
            "left_end": guides[0],
            "center_start": guides[1],
            "center_end": guides[2],
            "right_start": guides[3],
        },
        "layout": {
            "left_cap_px": rounded(fixed_display["left_cap_px"]),
            "left_rail_fr": source_widths["left-rail"],
            "center_px": rounded(fixed_display["center_px"]),
            "right_rail_fr": source_widths["right-rail"],
            "right_cap_px": rounded(fixed_display["right_cap_px"]),
            "remaining_rail_width_px": rounded(remaining_width),
            "minimum_target_width_px": minimum_target_width,
        },
        "assets": assets,
        "style_defaults": {
            "box_shadow": "0 0 4px rgba(255,255,255,.72)",
            "transform": "none",
        },
    }

    manifest_path = output_root / f"{args.name}-button-slices.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        json.dumps(
            {
                "manifest": str(manifest_path),
                "asset_dir": str(asset_dir),
                "build_id": build_id,
                "minimum_target_width_px": minimum_target_width,
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(2)
