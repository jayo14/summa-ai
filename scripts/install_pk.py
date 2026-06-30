#!/usr/bin/env python3
"""Install prompt-kit components from their JSON manifests into src/components/prompt-kit/."""
import json
import os
import re
from pathlib import Path

SRC_DIR = Path('/home/z/my-project/scripts/pk-components')
DEST_DIR = Path('/home/z/my-project/src/components/prompt-kit')
DEST_DIR.mkdir(parents=True, exist_ok=True)

# Collect tailwind config (keyframes) and css vars to merge
all_keyframes = {}
all_css_vars_light = {}
all_css_vars_dark = {}

for src in sorted(SRC_DIR.glob('*.json')):
    try:
        spec = json.loads(src.read_text())
    except Exception as e:
        print(f"!! {src.name}: invalid JSON: {e}")
        continue

    name = spec.get('name') or src.stem
    deps = spec.get('registryDependencies', [])
    pkg_deps = spec.get('dependencies', [])
    files = spec.get('files', [])

    print(f"-- {name}  deps={deps}  pkg={pkg_deps}  files={len(files)}")

    # Capture tailwind keyframes
    tw = spec.get('tailwind', {}).get('config', {})
    if isinstance(tw, dict):
        kf = tw.get('theme', {}).get('keyframes', {})
        if isinstance(kf, dict):
            all_keyframes.update(kf)

    css_vars = spec.get('cssVars', {}) or {}
    if isinstance(css_vars, dict):
        all_css_vars_light.update(css_vars.get('light', {}) or {})
        all_css_vars_dark.update(css_vars.get('dark', {}) or {})

    for f in files:
        rel_path = f.get('path', '')
        content = f.get('content', '')
        if not rel_path or not content:
            continue
        # Place all files under DEST_DIR; preserve just the basename to keep things flat
        basename = Path(rel_path).name
        target = DEST_DIR / basename
        target.write_text(content)
        print(f"   wrote {target.relative_to('/home/z/my-project')}")

# Write a combined tailwind keyframes/css vars file for reference
summary = {
    'keyframes': all_keyframes,
    'cssVarsLight': all_css_vars_light,
    'cssVarsDark': all_css_vars_dark,
}
(DEST_DIR / '.pk-summary.json').write_text(json.dumps(summary, indent=2))
print(f"\nSummary written to {DEST_DIR / '.pk-summary.json'}")
print(f"Keyframes: {list(all_keyframes.keys())}")
print(f"CSS vars light: {list(all_css_vars_light.keys())}")
print(f"CSS vars dark: {list(all_css_vars_dark.keys())}")
