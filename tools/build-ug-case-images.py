#!/usr/bin/env python3
"""Web images for the undergrad 案例卡 (undergrad/data/cases.json → thumb / full).

Source: _suppltement-1001/ba案例卡-命名方式-国家-bacc-字符串/<CODE>.png (3840×2368)
Output: undergrad/assets/img/cases/<code>.webp        full card, 2400px wide
        undergrad/assets/img/cases/<code>-thumb.webp  crop of the card's Project 01 image

PRIVACY: the offer letters in the 部分Offer展示 panel show students' full names
and sometimes home addresses. Every light (letter-like) block inside that panel
is Gaussian-blurred before export, so the published card keeps the visual
"offer received" cue but none of the letter text is legible. Never publish the
source PNGs directly.

Run from dad_demo/:  python3 tools/build-ug-case-images.py [CODE …]
"""
import sys, json
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
Image.MAX_IMAGE_PIXELS = None

SRC = Path('_suppltement-1001/ba案例卡-命名方式-国家-bacc-字符串')
OUT = Path('undergrad/assets/img/cases')
REF = 1400                                  # layout coordinates below are in a 1400px-wide frame
OFFER_PANEL = (1003, 180, 1345, 518)        # x0, y0, x1, y1 — 部分Offer展示 letters
THUMB = (431, 312, 668, 526)                # Project 01 image inside the 作品展示 grid

def letter_boxes(img):
    """Bounding boxes (REF coords) of light blocks inside the offer panel."""
    small = img.resize((REF, round(img.height * REF / img.width)), Image.BILINEAR)
    x0, y0, x1, y1 = OFFER_PANEL
    a = np.asarray(small.crop(OFFER_PANEL).convert('RGB')).min(axis=2) > 150
    a = np.asarray(Image.fromarray(a.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(9))) > 0
    seen, boxes = np.zeros_like(a), []
    H, W = a.shape
    for sy, sx in zip(*np.nonzero(a)):
        if seen[sy, sx]: continue
        stack, ys, xs = [(sy, sx)], [], []
        seen[sy, sx] = True
        while stack:
            y, x = stack.pop(); ys.append(y); xs.append(x)
            for ny, nx in ((y+1, x), (y-1, x), (y, x+1), (y, x-1)):
                if 0 <= ny < H and 0 <= nx < W and a[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True; stack.append((ny, nx))
        if len(ys) > 400:
            boxes.append((x0 + min(xs) - 3, y0 + min(ys) - 3, x0 + max(xs) + 4, y0 + max(ys) + 4))
    return boxes

def build(code):
    img = Image.open(SRC / f'{code}.png').convert('RGB')
    k = img.width / REF
    # whole letter area under the 部分Offer展示 heading (catches dark-themed
    # offer emails the light-block detection misses), plus any light block
    # that starts above it (cards whose panel sits higher)
    for b in [(1003, 197, 1345, 518)] + letter_boxes(img):
        box = tuple(round(v * k) for v in b)
        img.paste(img.crop(box).filter(ImageFilter.GaussianBlur(22 * k / 2.74)), box)
    OUT.mkdir(parents=True, exist_ok=True)
    full = img.resize((2400, round(img.height * 2400 / img.width)), Image.LANCZOS)
    full.save(OUT / f'{code.lower()}.webp', 'WEBP', quality=80, method=6)
    th = img.crop(tuple(round(v * k) for v in THUMB))
    th = th.resize((640, round(th.height * 640 / th.width)), Image.LANCZOS)
    th.save(OUT / f'{code.lower()}-thumb.webp', 'WEBP', quality=78, method=6)

if __name__ == '__main__':
    codes = sys.argv[1:] or [c['card'] for c in json.load(open('undergrad/data/cases.json'))]
    for c in codes:
        build(c); print('ok', c)
