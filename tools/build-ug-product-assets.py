#!/usr/bin/env python3
"""Rebuild the undergrad product assets (报价单 viewers + 课程介绍 galleries)
from _suppltement-1001/{美本产品解读,英联邦产品解读}.

Output follows the graduate site's convention exactly, so the shared
renderers in assets/js/product-sections.js find them with no extra config:
  undergrad/assets/img/course-products/<market>/pdf-<id>/NN.webp   ← comparePdf.dir
  undergrad/assets/img/course-products/<market>/core/<slug>/NN.webp ← module gallery
Run from dad_demo/:   python3 tools/build-ug-product-assets.py [job-id …]
(no args = every job; pass ids to rebuild only some, e.g. `cw-core-coventry-12`).
Prints each job's page count — copy it into site.json if it changed.
"""
import subprocess, sys, tempfile, shutil
from pathlib import Path
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

SRC = Path('_suppltement-1001')
US, CW = SRC / '美本产品解读', SRC / '英联邦产品解读'
FT = CW / '全日制产品'
OUT = Path('undergrad/assets/img/course-products')
WIDTH, QUALITY = 1600, 75         # same as graduate course-products assets

def ft(term):                       # A-Level 定制班: 总对比 sheet first, then TOP5 → TOP1
    d = FT / term
    return [d / f'全日制学院ALevel定制班-{term}2603{s}.jpg' for s in ('', '-TOP5', '-TOP3', '-TOP1')]

# id: (output dir, [sources], max width)
JOBS = {
    # ── 报价单 / 总对比 (PdfViewer) ──
    'us-pdf-pro':        ('us/pdf-pro',        [US / '美本—艺术【专业爬藤】定制方案-总对比.pdf'], WIDTH),
    'us-pdf-talent':     ('us/pdf-talent',     [US / '美本—【艺术特长】爬藤定制方案-总对比.pdf'], WIDTH),
    'us-pdf-mix':        ('us/pdf-mix',        [US / '美本—【艺术综合】混申计划-总对比.pdf'], WIDTH),
    'cw-pdf-direct':     ('cw/pdf-direct',     [CW / '英联邦经典产品/英国本科名校直录计划-总对比-多元版.pdf'], WIDTH),
    'cw-pdf-ivy-multi':  ('cw/pdf-ivy-multi',  [CW / '英联邦经典产品/英联邦本科爬藤计划 【G5 港三 新二】-多元版（1门alevel-A）-总对比.pdf'], WIDTH),
    'cw-pdf-ivy-classic':('cw/pdf-ivy-classic',[CW / '英联邦经典产品/英联邦本科爬藤计划 【G5 港三 新二】-经典版-(两门alevel-A)总对比.pdf'], WIDTH),
    'cw-pdf-p12':        ('cw/pdf-p12',        [FT / '1+2/全日制学院-1+2国际本科项目-考文垂终版.pdf'], WIDTH),
    'cw-pdf-ft-short':   ('cw/pdf-ft-short',   ft('短期'), WIDTH),
    'cw-pdf-ft-mid':     ('cw/pdf-ft-mid',     ft('中期'), WIDTH),
    'cw-pdf-ft-long':    ('cw/pdf-ft-long',    ft('长期'), WIDTH),
    'shared-pdf-masterclass': ('shared/pdf-masterclass', [CW / '大师课报价单-总.pdf'], WIDTH),
    # ── 课程介绍图片 (GalleryViewer) ──
    'shared-core-vc-foundation': ('shared/core/vc-foundation', [CW / '视传基础课.jpg'], 1280),
    'shared-core-dm-foundation': ('shared/core/dm-foundation', [CW / '数媒本科生课单.jpg'], WIDTH),
    'shared-core-dm-software':   ('shared/core/dm-software',   [CW / '数媒软件课单.jpg'], WIDTH),
    'cw-core-coventry-12':   ('cw/core/coventry-12',   [FT / '1+2/考文垂大学国际本科1+2课程.pdf'], 1280),
    'cw-core-goldsmiths-12': ('cw/core/goldsmiths-12', [FT / '1+2/金史密斯国际本科1+2课程.pdf'], 1280),
}

def pages(src, tmp):
    if src.suffix.lower() != '.pdf':
        return [src]
    base = tmp / src.stem[:20]
    dpi = '110' if src.stat().st_size > 5e6 else '150'   # big slide decks: 110dpi already ≥ 1280px
    subprocess.run(['pdftoppm', '-r', dpi, '-png', str(src), str(base)], check=True)
    return sorted(tmp.glob(base.name + '-*.png'))

def build(job):
    rel, srcs, width = JOBS[job]
    out = OUT / rel
    if out.exists(): shutil.rmtree(out)
    out.mkdir(parents=True)
    n = 0
    with tempfile.TemporaryDirectory() as t:
        for src in srcs:
            if not src.exists(): sys.exit(f'missing source: {src}')
            for p in pages(src, Path(t)):
                im = Image.open(p).convert('RGB')
                if im.width > width:
                    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
                n += 1
                im.save(out / f'{n:02d}.webp', 'WEBP', quality=QUALITY, method=6)
    kb = sum(f.stat().st_size for f in out.iterdir()) // 1024
    print(f'{job:28s} {n:3d} pages  {kb:6d} KB  → {out}')

if __name__ == '__main__':
    for j in (sys.argv[1:] or JOBS):
        build(j)
