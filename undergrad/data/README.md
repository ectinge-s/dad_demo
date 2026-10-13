# Undergrad site data

All page content is data-driven; the JS in `assets/js/` only renders it.

| File | What it holds | How to update |
|---|---|---|
| `site.json` | nav (1st-level pages + 2nd-level tabs), the three heroes, page heads, the block list for every tab (`tabs["us/dad"]` …), product 解读 content, school lists, 特长爬藤 directions | edit by hand |
| `offers.json` | 26 季 offers: `meta`, `schools` (per-school counts), `cities` (生源地), `wall` (one anonymised row per offer) | **generated** — `python3 tools/ug-offers.py "<path to 录取 export .xlsx>"` from `dad_demo/` |
| `cases.json` | 案例卡. Each case: `student` (surname + 同学), `city`, `bg`, `major`, `tracks` (which tab lists it: `us-dad`, `us-talent`, `risd`, `cw-ft`, `cw-12`, `cw-uk`, `hk`, `sgau`), optional `direction` (特长爬藤 label), `workType` (works.json category id), `offers[]`, `thumb` / `full` images | edit by hand |
| `works.json` | 作品案例: `categories`, `ages`, `works[]` | edit by hand |
| `professors.json` | 冬夏校 合作教授 | edit by hand |

## Block types (site.json → tabs)
`intro` `offers` `compare` `routes` `product` `schools` `cases` `quote` `directions` `video` `endorse` `handbook` `rank` `pathway` `routes2` `resources` `showreel` `profs` — renderers in `assets/js/du-blocks.js` (`Blocks.<type>`).
`offers` blocks take a query `q: { country:[…], top:true }`; hero stats take the same query (`q`), a fixed `value`, or `count: "professors"`.
A `video` / `endorse` video item plays once it has a `src`.

## Placeholders to replace
- Case offers are real (from the 26 录取 export, anonymised); case **images, `workType` and `direction` tags are placeholders** — swap in the real 案例卡 poster (`full`) and thumbnail (`thumb`).
- Works: titles/descriptions partly placeholder; images are student work from the old site.
- Professors: names, bios, posters (generated SVG), PDFs all placeholder.
- 特长爬藤 product 解读 (pending from 文书 team), RISD 背书/认证 files and video, 毕业典礼 video, 翠鹿榜 认证 copy and 小程序码, SG/AU 招生办 entries, 1+2 program copy — all marked （占位） or 待上传 in the copy.
- Images live in `assets/img/{site,fulltime,acg}` (carried over from the archived v1 site, `_archive/undergrad-v1`).
