# Undergrad site data

All page content is data-driven; the JS in `assets/js/` only renders it.

| File | What it holds | How to update |
|---|---|---|
| `site.json` | nav (1st-level pages + 2nd-level tracks with `icon` / `theme` / `sub`), the three heroes, page heads, the block list for every tab (`tabs["us/dad"]` …), product 解读 content, 特长爬藤 directions | edit by hand |
| `rankings.json` | target-school lists per country / direction from the 数艺设 排名文件 (`lists["uk"]`, `us-dm`, `us-vc`, `hk`, `mo`, `sg`, `au`, `ca`); `rank` is a tier used **only for ordering**, never shown | **generated** — `python3 tools/ug-rankings.py "<排名文件 .xlsx>"`; also writes a cleaned copy `<name> · 清洗版.xlsx` next to the source (专业明细 / 院校排名 / 修正记录) |
| `offers.json` | 26 季 offers: `meta`, `schools` (per-school counts + `rid`/`rank` from rankings.json, `cases`, UAL `colleges`), `cities` (生源地), `wall` (one anonymised row per offer; `s` = school key, `case` = linked 案例卡 id) | **generated** — run **after** ug-rankings.py: `python3 tools/ug-offers.py "<path to 录取 export .xlsx>"` from `dad_demo/` |
| `cases.json` | 案例卡. Each case: `student` (surname + 同学), `city`, `bg`, `major`, `tracks` (which tab lists it: `us-dad`, `us-talent`, `risd`, `cw-ft`, `cw-12`, `cw-uk`, `hk`, `sgau`), optional `direction` (特长爬藤 label), `workType` (works.json category id), `offers[]`, `thumb` / `full` images | edit by hand |
| `works.json` | 作品案例: `categories`, `ages`, `works[]` | edit by hand |
| `professors.json` | 冬夏校 合作教授 | edit by hand |

## Rebuilding data (order matters)
```
python3 tools/ug-rankings.py "_suppltement-1001/数艺设排名文件27f 10.10最新-英美港澳澳洲新加坡加拿大.xlsx"
python3 tools/ug-offers.py   "_suppltement-1001/数字艺术与设计-26录取本科.xlsx"
```
ug-offers.py matches offer schools to the ranking by English name (+ a small `ALIAS` table for renamed schools) and groups every 伦艺-xxx college as 伦敦艺术大学 (UAL). It prints how many schools are ranked — unranked schools are listed after ranked ones. Case links match a 案例卡 offer to the export by student + city + school + major, so keep `cases.json` offers spelled as in the export.

## Track pages
Every track (2nd-level tab except 总览) follows the same order: **`track` intro → other content → `schools` list (if any) → `cases`** (portfolio cases always last).
Tab look comes from `nav[].tabs[]`: `icon` (overview · cursor · atom · brush · cap · path · crown · skyline · globe · star — SVGs in `du-core.js` `ICONS`), `theme` 0–5 (colour pair in `du.css` `[data-theme]`), `sub` (one-liner under the label).

## Block types (site.json → tabs)
`track` `intro` `offers` `compare` `routes` `product` `schools` `cases` `quote` `directions` `video` `endorse` `handbook` `rank` `pathway` `routes2` `resources` `showreel` `profs` — renderers in `assets/js/du-blocks.js` (`Blocks.<type>`).
- `track`: `eyebrow`, `title`, `tagline`, `text`, `img`, `sticker`, `fit[]` (适合谁), `facts[{k,v}]`, `stats[]` (`{q,label}` / `{cases:"<track>",label}` / `{value,label}`); jump links to the tab's other sections are added automatically.
- `schools`: `groups: [{ label, lists: ["us-dm", …] }]` from rankings.json; top 5 as feature tiles, the rest behind 展开 (`top` overrides 5).
- `offers`: query `q: { country:[…], top:true }`, grid in ranking order; `countries: […]` adds a country switch. Cards link to `#offers?school=<key>`.
Hero stats take the same query (`q`), a fixed `value`, or `count: "professors"`.

## offer 一览
School cards in ranking order (sort toggle: 排名 / offer 数), grouped by country; click a card to expand ≤ 20 signature offers (one per distinct college + major first, case-linked preferred). Offers with a 案例卡 show 「作品集案例」 → opens the case. URL query: `country` `top=1` `case=1` `city` `sort=count` `school=<key>`.
A `video` / `endorse` video item plays once it has a `src`.

## Placeholders to replace
- Case offers are real (from the 26 录取 export, anonymised); case **images, `workType` and `direction` tags are placeholders** — swap in the real 案例卡 poster (`full`) and thumbnail (`thumb`).
- Works: titles/descriptions partly placeholder; images are student work from the old site.
- Professors: names, bios, posters (generated SVG), PDFs all placeholder.
- 特长爬藤 product 解读 (pending from 文书 team), RISD 背书/认证 files and video, 毕业典礼 video, 翠鹿榜 认证 copy and 小程序码, SG/AU 招生办 entries, 1+2 program copy — all marked （占位） or 待上传 in the copy.
- Images live in `assets/img/{site,fulltime,acg}` (carried over from the archived v1 site, `_archive/undergrad-v1`).
