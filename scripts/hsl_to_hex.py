#!/usr/bin/env python3
"""Convert HSL CSS vars to hex and produce a clean design tokens summary."""
import colorsys
import json

# HSL values from the CSS :root (format: "H S% L%")
hsl_vars = {
    "--summa-deep-green":     "92 64% 22%",
    "--summa-green":          "92 62% 36%",
    "--summa-yellow":         "48 96% 58%",
    "--summa-beige":          "39 71% 86%",
    "--background":           "140 20% 97%",
    "--foreground":           "220 45% 10%",
    "--card":                 "0 0% 100%",
    "--card-foreground":      "220 45% 10%",
    "--primary":              "92 62% 36%",
    "--primary-foreground":   "0 0% 100%",
    "--secondary":            "140 16% 92%",
    "--secondary-foreground": "220 35% 16%",
    "--muted":                "140 16% 94%",
    "--muted-foreground":     "216 17% 44%",
    "--accent":               "220 35% 16%",
    "--accent-foreground":    "0 0% 100%",
    "--destructive":          "0 84% 55%",
    "--border":               "214 24% 88%",
    "--ring":                 "92 62% 36%",
    "--surface":              "140 18% 95%",
    "--primary-container":    "92 58% 90%",
    "--secondary-container":  "140 18% 88%",
    "--on-surface-variant":   "216 17% 44%",
    "--sidebar-background":   "140 18% 96%",
    "--sidebar-foreground":   "220 45% 10%",
    "--sidebar-primary":      "92 62% 36%",
    "--sidebar-accent":       "140 18% 92%",
    "--sidebar-border":       "214 24% 88%",
}

def hsl_to_hex(hsl_str):
    parts = hsl_str.replace('%', '').split()
    h = float(parts[0]) / 360.0
    s = float(parts[1]) / 100.0
    l = float(parts[2]) / 100.0
    r, g, b = colorsys.hls_to_rgb(h, l, s)
    return f"#{int(r*255):02X}{int(g*255):02X}{int(b*255):02X}"

print(f"{'Token':<28} {'HSL':<20} {'HEX':<10}")
print("-" * 60)
for k, v in hsl_vars.items():
    print(f"{k:<28} {v:<20} {hsl_to_hex(v):<10}")
