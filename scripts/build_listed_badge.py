"""Build the Listed on WrenchStack badge from public/logo.png (scale only, no redraw).

Run from site/: python -I scripts/build_listed_badge.py
Added 2026-11-14 (trust batch). The same SVG is written to the old badge file
names too, so every existing embed of the retired badges now shows this one.
The image uses xlink:href only: every current browser reads it, older SVG
renderers need it, and carrying the data URI twice would double the file.
"""
import base64, io
from pathlib import Path
from PIL import Image

SRC = Path('public/logo.png')
OUTS = [Path('public/badges/listed-on-wrenchstack.svg'),
        Path('public/badges/rated-on-wrenchstack.svg'),   # old embeds show the new badge
        Path('public/badges/wrenchstack-2026-pick.svg')]  # retired pick badge, same reason
DISPLAY_W = 152                                       # px inside the 240x64 badge
logo = Image.open(SRC).convert('RGBA')
w = DISPLAY_W * 2                                     # 2x for sharp rendering
h = round(w * logo.height / logo.width)               # 304 x 72
scaled = logo.resize((w, h), Image.LANCZOS)
buf = io.BytesIO()
scaled.save(buf, format='PNG', optimize=True)
b64 = base64.b64encode(buf.getvalue()).decode('ascii')
disp_h = round(DISPLAY_W * logo.height / logo.width)  # 36
uri = f'data:image/png;base64,{b64}'
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="240" height="64" viewBox="0 0 240 64" role="img" aria-label="Listed on WrenchStack">
  <title>Listed on WrenchStack</title>
  <rect x="0.75" y="0.75" width="238.5" height="62.5" rx="10" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="120" y="17" text-anchor="middle" font-family="system-ui,'Segoe UI',Arial,sans-serif" font-size="9" font-weight="700" letter-spacing="2" fill="#475569">LISTED ON</text>
  <image x="{(240 - DISPLAY_W) // 2}" y="22" width="{DISPLAY_W}" height="{disp_h}" preserveAspectRatio="xMidYMid meet" xlink:href="{uri}"/>
</svg>
'''
for p in OUTS:
    p.write_text(svg, encoding='utf-8', newline='\n')   # LF, not CRLF
    print(p, p.stat().st_size, 'bytes')
print('embedded PNG', scaled.size, len(buf.getvalue()), 'bytes')
