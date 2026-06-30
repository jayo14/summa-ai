#!/usr/bin/env python3
"""Extract colors and typography from the SummaStudy CSS file."""
import re
import json
from collections import Counter

with open('/home/z/my-project/scripts/main.css', 'r', encoding='utf-8') as f:
    css = f.read()

result = {}

# 1. CSS custom properties (variables) from :root
root_match = re.search(r':root\s*\{([^}]+)\}', css)
css_vars = {}
if root_match:
    body = root_match.group(1)
    for m in re.finditer(r'(--[\w-]+)\s*:\s*([^;]+);', body):
        css_vars[m.group(1)] = m.group(2).strip()
result['cssVariables'] = css_vars

# 2. All hex colors used
hex_colors = Counter(re.findall(r'#[0-9a-fA-F]{3,8}\b', css))
result['hexColors'] = [{'color': c, 'count': n} for c, n in hex_colors.most_common()]

# 3. All rgb/rgba colors used
rgba_colors = Counter(re.findall(r'rgba?\([^)]+\)', css))
result['rgbaColors'] = [{'color': c, 'count': n} for c, n in rgba_colors.most_common()]

# 4. HSL colors
hsl_colors = Counter(re.findall(r'hsla?\([^)]+\)', css))
result['hslColors'] = [{'color': c, 'count': n} for c, n in hsl_colors.most_common()]

# 5. Tailwind theme colors (look for known color names like lime, green, etc.)
tw_palette = {}
for m in re.finditer(r'--([\w-]+):\s*(#[0-9a-fA-F]{3,8})', css):
    tw_palette[m.group(1)] = m.group(2)
result['tailwindVars'] = tw_palette

# 6. Font-family declarations
font_families = Counter(re.findall(r'font-family\s*:\s*([^;]+);', css))
result['fontFamilies'] = [{'family': f, 'count': n} for f, n in font_families.most_common()]

# 7. Font sizes
font_sizes = Counter(re.findall(r'font-size\s*:\s*([^;]+);', css))
result['fontSizes'] = [{'size': s, 'count': n} for s, n in font_sizes.most_common()]

# 8. Font weights
font_weights = Counter(re.findall(r'font-weight\s*:\s*([^;]+);', css))
result['fontWeights'] = [{'weight': w, 'count': n} for w, n in font_weights.most_common()]

# 9. Line heights
line_heights = Counter(re.findall(r'line-height\s*:\s*([^;]+);', css))
result['lineHeights'] = [{'lh': lh, 'count': n} for lh, n in line_heights.most_common()]

# 10. Letter spacings
letter_spacings = Counter(re.findall(r'letter-spacing\s*:\s*([^;]+);', css))
result['letterSpacings'] = [{'ls': ls, 'count': n} for ls, n in letter_spacings.most_common()]

# 11. Tailwind utility prefixes used (to identify brand colors)
brand_color_classes = re.findall(r'\.(bg|text|border|fill|stroke|from|to|via|ring|shadow)-([a-z]+)-(\d+)', css)
brand_counter = Counter()
for prefix, color, shade in brand_color_classes:
    brand_counter[f'{color}-{shade}'] += 1
result['tailwindColorUtilities'] = [{'util': u, 'count': n} for u, n in brand_counter.most_common(30)]

# 12. Look at body, h1-h6 rules specifically
key_rules = {}
for sel in ['body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'button']:
    # Match selector followed by { ... }
    pattern = re.compile(r'(^|[^.\w])(' + re.escape(sel) + r')\s*\{([^}]+)\}', re.MULTILINE)
    matches = pattern.findall(css)
    if matches:
        # Take the first non-prefixed match
        for _, s, body in matches:
            # Skip if body looks like a complex selector
            decls = {}
            for decl in body.split(';'):
                if ':' in decl:
                    k, v = decl.split(':', 1)
                    decls[k.strip()] = v.strip()
            if decls:
                key_rules[sel] = decls
                break
result['keyRules'] = key_rules

# 13. Heading font size utility classes
heading_sizes = {}
for tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
    sizes = re.findall(r'\.' + tag + r'\s*\{[^}]*font-size:\s*([^;]+);', css)
    if sizes:
        heading_sizes[tag] = sizes
result['headingFontSizes'] = heading_sizes

print(json.dumps(result, indent=2))
