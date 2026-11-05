# Undergrad site data

All page content is data-driven; the JS in `assets/js/` only renders it.

| File | What it holds | How to update |
|---|---|---|
| `site.json` | nav (1st-level pages + 2nd-level tracks with `icon` / `theme` / `sub`), the three heroes, page heads, the block list for every tab (`tabs["us/dad"]` …), 特长爬藤 directions | edit by hand |
| `products.json` | 产品解读 (from `_suppltement-1001/美本产品解读`, `英联邦产品解读`): `us-pro` `us-talent` `us-mix` `us-risd` `cw-ft` `cw-p12` `cw-classic` — see **Products** below | edit by hand |
| `rankings.json` | target-school lists per country / direction from the 数艺设 排名文件 (`lists["uk"]`, `us-dm`, `us-vc`, `hk`, `mo`, `sg`, `au`, `ca`); `rank` is a tier used **only for ordering**, never shown | **generated** — `python3 tools/ug-rankings.py "<排名文件 .xlsx>"`; also writes a cleaned copy `<name> · 清洗版.xlsx` next to the source (专业明细 / 院校排名 / 修正记录) |
| `offers.json` | 26 季 offers: `meta`, `schools` (per-school counts + `rid`/`rank` from rankings.json, `cases`, UAL `colleges`), `cities` (生源地), `wall` (one anonymised row per offer; `s` = school key, `case` = linked 案例卡 id) | **generated** — run **after** ug-rankings.py: `python3 tools/ug-offers.py "<path to 录取 export .xlsx>"` from `dad_demo/` |
| `cases.json` | 26 案例卡, transcribed from `_suppltement-1001/ba案例卡-命名方式-国家-bacc-字符串/<CODE>.png`. Each: `id` / `card` (file code), `student`, `country`, `city` (生源地 from the export match, may be empty), `tags`, `decision` (ED/RD), `profile[{k,v}]`, `directions` (5 产业方向 highlighted on the card), `workType` (works.json category id), `tracks` (`us-dad` `us-mix` `risd` `cw-ft` `cw-uk` `hk` `sgau` `kr`), `projects[]`, `notes[{label, items}]`, `offers[{abbr, zh, en, major, top, link?}]` — `link {zh, major}` is the export row it matches, used by ug-offers.py; `thumb` / `full` | edit by hand; images: `python3 tools/build-ug-case-images.py [CODE …]` |
| `works.json` | 作品案例: `categories`, `ages`, `works[]` | edit by hand |
| `professors.json` | 冬夏校 合作教授 | edit by hand |

## Rebuilding data (order matters)
```
python3 tools/ug-rankings.py "_suppltement-1001/数艺设排名文件27f 10.10最新-英美港澳澳洲新加坡加拿大.xlsx"
python3 tools/ug-offers.py   "_suppltement-1001/数字艺术与设计-26录取本科.xlsx"
```
ug-offers.py matches offer schools to the ranking by English name (+ a small `ALIAS` table for renamed schools) and groups every 伦艺-xxx college as 伦敦艺术大学 (UAL). It prints how many schools are ranked — unranked schools are listed after ranked ones. Case links: a 案例卡 offer with `link {zh, major}` tags the export row with the same student + city + school + major (export spelling); card offers without `link` (not found in the export) are shown but not linked.

**New 案例卡:** add the PNG to the ba案例卡 folder, add the record to cases.json (code = file name), run `build-ug-case-images.py <CODE>`, then re-run ug-offers.py. The image script blurs the 部分Offer展示 panel (offer letters carry full names / addresses) — never publish the source PNGs.

## Products (products.json)
Same field names as the graduate product pages (`assets/js/course-demo.js`), rendered by the **shared** helpers in `../assets/js/product-sections.js` — edit markup there, both sites use it.
- `meta {eyebrow, titleCn, titleEn, desc, chips[]}`, `cover` (IMG path), `market` (`us` / `cw`, default folder for galleries), `snapshot[{k,v}]`, `note` (disclaimer under the page).
- `comparePdf`: one object or an array of `{label, dir, count, btn?, btnEn?}` → one 报价单 / 比价 button each (overlay hero **and** the tab's product card), opening `PdfViewer` over `<dir>/01.webp … NN.webp`.
- `sections[]` in display order, each `{type, label:[cn, en], …}`: `lead {text}` · `why {items[{t,d}]}` · `tiers {items[{name,audience,config}]}` · `modules {items[{title, subtitle?, desc, bullets?[{t,d}], gallery?}]}` · `table {heads[], rows[[]], note?}` · `list {items[]}` · `fit {fit[], notFor?[]}` · `timeline {items[{q,phase,desc,merged?}]}`.
- Module `gallery {market?, slug, count, alt?}` → cover thumbnail + `GalleryViewer` over `assets/img/course-products/<market>/core/<slug>/NN.webp` (`market: "shared"` for the 视传 / 数媒 课单 used by several products).
- Prices stay **only** in the 报价单 images, never in copy (same rule as graduate).

Rebuild the images (报价单 PDFs/JPGs, 课单, 1+2 course decks) from `_suppltement-1001`: `python3 tools/build-ug-product-assets.py [job …]` — it prints page counts; keep `count` in products.json / site.json in sync.

## Track pages
Every track (2nd-level tab except 总览) follows the same order: **`track` intro → other content → `schools` list (if any) → `cases`** (portfolio cases always last).
Tab look comes from `nav[].tabs[]`: `icon` (overview · cursor · atom · brush · cap · path · crown · skyline · globe · star — SVGs in `du-core.js` `ICONS`), `theme` 0–5 (colour pair in `du.css` `[data-theme]`), `sub` (one-liner under the label).

## Block types (site.json → tabs)
`track` `intro` `offers` `compare` `choose` `routes` `product` `schools` `cases` `quote` `directions` `video` `endorse` `handbook` `rank` `pathway` `routes2` `resources` `showreel` `profs` — renderers in `assets/js/du-blocks.js` (`Blocks.<type>`).
- `track`: `eyebrow`, `title`, `tagline`, `text`, `img`, `sticker`, `fit[]` (适合谁), `facts[{k,v}]`, `stats[]` (`{q,label}` / `{cases:"<track>",label}` / `{value,label}`); jump links to the tab's other sections are added automatically.
- `schools`: `groups: [{ label, lists: ["us-dm", …] }]` from rankings.json; top 5 as feature tiles, the rest behind 展开 (`top` overrides 5).
- `product`: `{product: "<products.json id>"}`; block `title` is the section heading (hk / sgau reuse `cw-classic` with their own heading).
- `choose`: route selector — `items[{go, name, sticker, goal, fit, deliver}]`, optional `foot {title, items[]}`.
- `pathway`: `alt: true` shows 或 between items (alternatives, not a sequence); item `gallery {market, slug, count, alt}` adds a 课程介绍 deck button.
- `profs`: optional `comparePdf` adds a 报价单 button to the heading.
- `offers`: query `q: { country:[…], top:true }`, grid in ranking order; `countries: […]` adds a country switch. Cards link to `#offers?school=<key>`.
Hero stats take the same query (`q`), a fixed `value`, or `count: "professors"`.

## offer 一览
School cards in ranking order (sort toggle: 排名 / offer 数), grouped by country; click a card to expand ≤ 20 signature offers (one per distinct college + major first, case-linked preferred). Offers with a 案例卡 show 「作品集案例」 → opens the case. URL query: `country` `top=1` `case=1` `city` `sort=count` `school=<key>`.
A `video` / `endorse` video item plays once it has a `src`.

## Placeholders to replace
- `kr` (韩国) cases have no tab yet — they're reachable only through offer 一览 (作品集案例 links). 特长爬藤 and 1+2 have no 案例卡 yet; empty case blocks and 本路线案例 stats hide themselves.
- Works: titles/descriptions partly placeholder; images are student work from the old site.
- Professors: names, bios, posters (generated SVG), PDFs all placeholder.
- RISD 背书/认证 files and video, 毕业典礼 video, 翠鹿榜 认证 copy and 小程序码, SG/AU 招生办 entries — all marked （占位） or 待上传 in the copy.
- No 案例卡 carry the `us-mix` track yet, so 艺术综合混申 has no cases block; add one (`{type:"cases", track:"us-mix"}`) once cases are tagged.
- Images live in `assets/img/{site,fulltime,acg}` (carried over from the archived v1 site, `_archive/undergrad-v1`).
