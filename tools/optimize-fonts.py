"""Build Cyrillic/Latin web fonts from the preserved OFL source fonts.

Run with fonttools[woff] installed. Keeps default shaping/kerning features.
Preserves both fonts' complete variable weight ranges.
"""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1] / "v2/assets/fonts"
ranges = [(0x20, 0xFF), (0x300, 0x36F), (0x400, 0x52F),
          (0x2000, 0x206F), (0x20A0, 0x20CF), (0x2190, 0x21FF),
          (0x25A0, 0x25FF), (0xFFFD, 0xFFFD)]
chars = {code for start, end in ranges for code in range(start, end + 1)}

for name in ["Montserrat", "Caveat"]:
    font = TTFont(root / f"{name}-Variable.ttf")
    options = subset.Options()
    sub = subset.Subsetter(options=options)
    sub.populate(unicodes=chars)
    sub.subset(font)
    font.flavor = "woff2"
    target = root / f"{name}-site.woff2"
    font.save(target)
    print(f"{target.name}: {target.stat().st_size:,} bytes")
