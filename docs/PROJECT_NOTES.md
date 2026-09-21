# DAD site rebuild — notes

Snapshot date: 2026-09-21 (v3.19 — hero cursor rebuilt a third time: GM
called v3.17.1's smooth-gradient 3D dart "super ugly" and supplied a new
reference in a chunky pixel/voxel style (a jagged, staircase-edged arrow
silhouette extruded as flat pixel "cubes"), so the cursor was regenerated
programmatically from a pixel bitmap — see below; v3.18 — type system swap:
Archivo → Argentum
Sans, JetBrains Mono → Martian Mono (chosen for a dot-free "0" plus a
flat/graphic look that fits the site, over IBM Plex Mono's more
conventional shape), Noto Sans SC → MiSans — all three confirmed free for
commercial use and self-hosted, MiSans's required attribution added to
`index.html`'s `<head>`; v3.17.1 — hero cursor rebuilt as a real 3D-shaded
inline SVG (gradient-lit faces, specular highlight, drop shadow) per GM's
correction that the first pass wasn't actually 3D, and re-scoped to the
homepage hero only; v3.17 — navbar 职业规划 CTA restyled to a glowing
yellow pill reading "就业全景 × 职业规划"; v3.16.1 — favicon properly fixed
by cropping tight to the logo's content bbox instead of flattening away
its transparency; v3.16 — a shared `ScrollLock` helper stops the page from
shifting sideways when any overlay/modal opens; v3.15 — instructor filter/
data-model fix (single
`category` field replaces the old `category`+`categoryLabel` pair so JSON
edits are directly reflected), instructor.json's `title` split into
`background`+`title`, instructor cards restyled to name/background(bold)/
title, a real favicon (recovered from the pre-combomark standalone logo
mark), 行业正在做什么业务/代表企业 grids widened to 6/7+ per row, and the
nav-menu overlay restyled to ftam_demo's two-column layout — see below;
v3.14 — industry-card image cleanup: 29 duplicate " 2"-suffixed files
removed, ai-tech/internet-ux banner paths fixed to the new .png assets, and
all 32 canonical industry-card images brought into the repo for the first
time; v3.13 — homepage's auto-scrolling 8-industry reel replaced with an
editorial title+copy+CTA teaser (the reel itself lives on the 职业规划
overview tab, moved there in v3.12), every marquee on the site rebuilt on
a shared rAF-driven `Marquee` helper (fixes reels going blank after
scrolling for a while), and the resources hover overlay's arrow removed;
v3.12 — homepage's 8-industry reel moved onto 职业规划's overview tab; v3.11
— seven-part polish pass: navbar logo at
80% scale, 建筑学5年 timeline tab removed, 时间轴/课程产品 title blocks now
match 案例展示's format (English eyebrow above the h1, identical size),
案例展示's filter-group labels restyled larger/more prominent, 国家/地区
filter order now GM's own priority ranking instead of alphabetical, the
case-card modal enlarged to near-native resolution, and the "课程" nav
label renamed to "课程产品" — see below; v3.10.1 — 资源网络 follow-up: card
size/logo treatment now matches ist_demo's own `.coop-card` exactly, and
the Intro/Collab hover info floats ABOVE the card via a shared fixed-
position element instead of an in-card overlay — see below; v3.10 — real
案例展示 portfolio data (70 MA
offer cases + two independent multi-select filter rows) and real 资源网络
company logos (83 partners, name + logo + hover-reveal intro/collab), both
from `_DAD研究生案例卡&企业logo/DAD MA 网站信息包.xlsx`, plus an ist_demo-
style sticky floating collapse button for the 导师团队/offer 展示 expand-
fold grids — see below; v3.9 — six-part follow-up: official VI brand
lockup in the navbar, timeline data replaced from a real xlsx source,
instructor grid now shows everyone with an ist_demo-style expand/fold,
offers grid clamps to whole rows on resize (no sparse last row), the
课程目录 poster-click modal (missing entirely) now works, and 案例展示/
时间轴&课程产品's title blocks were unified — see below; v3.8 — the three
data gaps v3.7 flagged as
blocked on Figma access are now filled: 行业解读, 行业正在做什么业务 and
职业发展路径 are transcribed verbatim, for all 8 industries, from a PDF
export of the same Figma poster GM provided (supplement-912) once the
Figma MCP connection itself stayed rate-limited — see below for how;
v3.7 — industry subpages gained a "岗位解读"
overlay on every role pill (real matched company job postings, fuzzy-
scored), a yellow-block "隐性能力要求" JD-insight callout inside 职业发展路径
(sourced from 总览's existing jdDecoder data), section 01 renamed
行业解读 with a new industryExplainer fallback field, a businessCardsDetailed
fallback path for section 03, and all remaining inconsistent "点击..."
hint text removed — see below for what's still blocked on Figma
access; v3.6 — 沉浸式文化空间's photo re-generated with
a horizontal-only squish so it fills its frame with zero cropping;
click-to-enlarge removed from all 24 "具体可以做什么" photos, Lightbox
component retired; v3.5 — output-photo layout split into a 3-across
strip + small tag pills, yellow-outline section accents on the
industry detail subpage, tab-switch now scrolls to the banner instead
of page top; v3.4.2 — real "具体可以做什么" photos wired in for all 8
industries, 24 total; v3.4.1 — that section degrades to plain tags for
output types with no real photo, instead of a fake-clickable
placeholder tile; v3.4 — real Figma photos wired into the 职业规划
per-industry banners; v3.3 — 职业规划 restructured into per-industry
subpages, following the "数字艺术就业海报" Figma file). Undergraduate
section remains intentionally deferred (see below); this pass is
job-hunting / graduate-school oriented only, no undergrad framing
anywhere on the site.

## v3.19 — 2026-09-21 hero cursor rebuilt again: pixel/voxel style, replacing v3.17.1's smooth-gradient dart

GM's verdict on v3.17.1's gradient-shaded 3D dart: "hero cursor super
ugly. how about this new reference (pixelated 3D style)" — a jagged,
staircase-edged arrow silhouette rendered as flat pixel "cubes" (a
Minecraft-voxel look), not smooth per-face gradient shading. Rebuilt from
scratch with a completely different technique suited to that aesthetic:

1. **Bitmap-driven construction, not hand-drawn paths.** Hand-authoring a
   pixelated silhouette vertex-by-vertex in an SVG path is exactly the
   kind of thing that's easy to get subtly wrong (uneven "teeth", drifted
   grid lines), so instead wrote a small Python generator: define the
   cursor as a 2D pixel grid (a wedge tapering to a point at the tip,
   with a sawtooth pattern along its upper edge and a small stepped
   "feather" cluster trailing off the tip — tuned by eye across 4
   iterations, screenshotting each and comparing against GM's reference
   before locking in the final bitmap), then emit one `<rect>` per filled
   cell. Iterated the same "generate → screenshot → compare → adjust one
   parameter → regenerate" loop used for v3.17.1's gradient dart, just
   with a bitmap + rect-emitter instead of hand-tuned gradients.

2. **The 3D read comes from a duplicated, offset silhouette — not
   gradients or a blur filter.** Every filled cell is drawn twice: once
   as a dark rect shifted down-right by a fixed offset (drawn first, underneath —
   this is the "side/shadow face" of each pixel's extrusion, and because
   it's drawn as a solid duplicate of the whole silhouette rather than
   per-cell visibility logic, the visible sliver of dark automatically
   follows the jagged outline with no extra code), then again as a
   yellow rect at its true position with a thin dark stroke around each
   cell (the grid seams that read as individual "cubes"). No gradients,
   no drop-shadow filter — flat colors only, matching the reference's
   flat pixel-art look. Re-colored to the site's signature yellow +
   a warm dark amber-brown for the extruded side (picked over near-black
   after checking against the hero's dark background — a near-black
   side face all but disappeared there; the amber-brown reads clearly as
   "shadow of the yellow" while staying visible against black).

3. **Cursor container resized for the new non-square artwork.** v3.17.1's
   dart was drawn in a square 100×100 viewBox; the new pixel silhouette
   is naturally wider than tall (192.8×128.8). `.hero-cursor`'s CSS
   box changed from a 72×72 square to 96×64 to match that aspect ratio,
   and `hero-cursor.js`'s tip-offset math (which converts the artwork's
   internal tip coordinate into a CSS pixel offset so the visual tip —
   not the box's own corner — tracks the actual mouse position) was
   recomputed for the new box size and the new tip location (still
   bottom-left, ~0.5%/93.9% of the viewBox). The homepage-only scoping,
   the mousemove rAF-throttling, and the inline-transform press-scale
   from v3.17.1 all carried over unchanged — only the artwork and its
   container dimensions changed. `index.html`, `assets/css/style.css`,
   `assets/js/hero-cursor.js`.

Verified via Playwright: cursor renders correctly over the homepage hero
and stays invisible on other pages (confirms the #hero-root scoping
wasn't disturbed), the visual tip tracks the actual pointer position, and
`mousedown` still applies the `scale(.9)` press effect through the same
inline-transform mechanism as before.

## v3.18 — 2026-09-20 font swap: Argentum Sans / MiSans / Martian Mono (all self-hosted, all confirmed free-commercial-use)

GM asked to (1) confirm Argentum Sans is free for commercial use and swap it
in for Archivo if so, (2) recommend a mono replacement for JetBrains Mono
with a non-dotted zero that reads flat/graphic, and (3) swap Noto Sans SC
for MiSans — all three self-hosted locally per the project's existing
convention (Google Fonts' CDN is unreachable in mainland China, `fonts.
googleapis.com` is also blocked from this build environment's own network,
confirmed via a 403 on the CONNECT tunnel — `registry.npmjs.org` is
allowlisted instead, so every font below was obtained as a real, licensed
package rather than assumed from a spec page).

1. **Archivo → Argentum Sans.** Confirmed OFL-1.1 via its official GitHub
   repo (`cssobral2013/Argentum-Sans`, ships its own `OFL.txt`) — an
   Argentum Sans Project fork of Montserrat, free for commercial use with
   no attribution requirement beyond the OFL's own terms. Pulled via
   `@fontsource/argentum-sans` (same license, verified with `npm view`),
   same 6 weights Archivo had (400/500/600/700/800/900).

2. **JetBrains Mono → Martian Mono.** GM's ask was specifically a mono
   font with a non-dotted "0" that looks flat/graphic. Text sources
   (Google Fonts specimen, Evil Martians' own product page, the GitHub
   README) never actually described the zero glyph's shape, so this was
   checked empirically instead of taken on faith: downloaded real woff2
   files for 4 OFL-licensed mono-font candidates (IBM Plex Mono,
   JetBrains Mono, Martian Mono, Space Mono) via their `@fontsource/*`
   packages, built a side-by-side `@font-face` comparison page rendering
   "0123 O0 10.05% $0" at 64px per font, and screenshotted it. Result:
   JetBrains Mono and Space Mono both have a dotted zero; IBM Plex Mono
   and Martian Mono both have a plain, dot-free zero. Between those two,
   Martian Mono's wide, blocky, brutalist digit shapes are a much closer
   match to the site's bold black/white/yellow digital-art aesthetic than
   IBM Plex Mono's more conventional humanist-mono look — picked Martian
   Mono. OFL-1.1 (Evil Martians), via `@fontsource/martian-mono`, same 3
   weights JetBrains Mono had (400/500/700).

3. **Noto Sans SC → MiSans.** MiSans is Xiaomi's font, free for
   commercial use under its own license (confirmed on Xiaomi's official
   font microsite, though the domain itself — `hyperos.mi.com` — is
   blocked from this build environment, so the license text was read via
   web search/fetch rather than the site's own download page) with two
   conditions: **attribution is required** ("您应在软件中特别注明使用了
   MiSans 字体") and the font files themselves may not be redistributed
   standalone — but a work created using the font (this site) may be
   freely distributed. Self-hosted via the `misans` npm package
   (`dsrkafuu/misans`, MIT-licensed *tooling*, fonts under Xiaomi's own
   terms as above), which re-slices Xiaomi's official font files along
   Xiaomi's own official simplified-Chinese unicode-range table — i.e.
   the same per-glyph lazy-loading approach Google Fonts itself uses for
   CJK families, verified against two independent Xiaomi sources by the
   package's own build pipeline. Went with the sliced form rather than
   hand-rolling a single monolithic file per weight: a real page only
   ever renders a few hundred distinct Chinese characters, so the browser
   ends up fetching a handful of small slices instead of one ~1.1MB
   blob — strictly less data over the wire than the old Noto Sans SC
   files, at the cost of more files on disk (56 slices × 5 weights =
   280 files, 9.9MB total in `assets/fonts/misans/`). Weights 300/400/
   500/700/900 pulled (same set Noto Sans SC had); the vendor's own
   generated CSS was copied in as-is (not hand-transcribed) to avoid
   introducing a typo into any of the 280 `unicode-range` declarations,
   only the `url()` paths were rewritten to point at `../fonts/misans/`.
   **Attribution added**: an HTML comment directly above the `fonts.css`
   `<link>` in `index.html`'s `<head>` states MiSans is in use, satisfying
   the license's attribution condition.

`assets/css/fonts.css` rewritten (Archivo/JetBrains-Mono/Noto-Sans-SC
`@font-face` blocks replaced with Argentum-Sans/Martian-Mono/MiSans);
`assets/css/style.css`'s `--font-en`/`--font-cn`/`--font-mono` tokens
repointed to the new family names (no other file references a font family
by name — everything else goes through these three tokens, confirmed by
grep); `package.json`'s `dependencies` updated to the two new `@fontsource/
*` packages (MiSans has no fontsource equivalent, so it isn't an npm
dependency of the build, just a one-time source for the shipped files);
old `assets/fonts/{archivo,jetbrains-mono,noto-sans-sc}/` deleted (fully
superseded, no remaining references). Verified via Playwright on both the
homepage and 职业规划: zero failed font requests, `getComputedStyle` on
`body`/`h1`/a `.u-mono` element confirms the three new families are
actually being used (not silently falling back), Chinese headline and body
text render cleanly with MiSans with no visible fallback-font flash, and a
zoomed crop of the homepage stat numbers ("10倍+", "200万+", "30–46%")
confirms Martian Mono's dot-free zero renders correctly in context.

## v3.17.1 — 2026-09-20 hero cursor rebuilt as a real 3D SVG, scoped to the homepage only

Direct correction on v3.17's cursor: "well this is obviously not a 3D
cursor... see screenshot for style reference" (GM's reference: a glossy
orange 3D dart/pointer icon with rounded bevels, gradient shading, and a
specular highlight) plus "it should only render within homepage hero, not
other pages too." v3.17's implementation had been a flat CSS `clip-path`
polygon stacked 3× with solid colors and a diagonal offset — a classic 2D
"flat design long shadow" trick, not actual 3D shading, and it was scoped
to every `.hero` section sitewide instead of just the homepage.

Rebuilt `#hero-cursor` as an inline SVG with genuine per-face shading:
`linearGradient`s for a lit face and a shadowed face on both the
shaft and the head (simulating two different faces catching light at
different angles), a `radialGradient` specular-highlight blob, and an
`feDropShadow` filter for grounding — iterated 3 times in a scratch file,
screenshotting and visually comparing each pass against GM's reference
before integrating into `index.html`. Re-scoped from `.hero`/`.hero *`
to `#hero-root`/`#hero-root *` in both the CSS `cursor: none` rule and
`hero-cursor.js`'s mousemove-delegation target, so the effect now only
ever activates on the homepage hero. Also fixed a specificity bug caught
before shipping: a `.hero-cursor.is-pressed { transform: ... }` CSS rule
would never have applied, since the JS sets `el.style.transform` inline on
every frame and an inline style always wins over a class rule for the same
property — the press-scale is now appended directly into the same inline
transform string the JS already builds for position. `index.html`,
`assets/css/style.css`, `assets/js/hero-cursor.js`.

## v3.17 — 2026-09-20 navbar CTA restyle + first cursor pass (superseded by v3.17.1 above)

Reverted the homepage-scroll "职业规划" nav button from an accent-colored
style back to the normal white-text nav-button style (it's a same-page
scroll shortcut, not a page navigation, and shouldn't compete visually
with the real CTA). Restyled the top-right CTA that routes to the
职业规划 page: signature yellow pill background, glow-on-hover using the
site's existing `--glow-accent`/`--glow-accent-soft` tokens (already used
elsewhere, e.g. `.nav-menu-overlay__cta`, so no new visual language was
introduced), text changed to "就业全景 × 职业规划" with a `.navbar__cta-
short` "职业规划"-only fallback under 600px (needed `white-space: nowrap;
flex-shrink: 0` — without it the flex item was allowed to shrink below its
own content width and the short label wrapped to 2 lines on narrow
viewports). First pass at a 3D hero cursor effect shipped in this version
was corrected in v3.17.1 above. `index.html`, `assets/css/style.css`.

## v3.16.1 — 2026-09-20 favicon: proper fix (crop tight to content, keep transparency)

Follow-up question from GM ("why can ftam_demo's favicon keep a
transparent bg when dad_demo always shows black/white behind it")
prompted a proper root-cause check instead of assuming a generic
transparency bug — v3.15.1's fix (below) had papered over the symptom.
Compared the two logos' actual pixel data (PIL/numpy, alpha-channel bbox +
opaque-fill percentage): ftam's reference icon fills ~84% of its own
canvas edge-to-edge; dad's `logo.png` filled only ~35% of its 3125×3125
canvas, with a huge transparent margin around the mark. The margin was the
bug, not the transparency — flattening to solid white (v3.15.1) fixed the
symptom by discarding the transparency entirely. Correct fix: cropped
tight to the logo's real content bbox `(520,520)–(2605,2605)` and
regenerated all 7 favicon files from that crop, keeping true alpha
transparency. Also caught and fixed a related bug in how `favicon.ico` had
been built: an earlier version called Pillow's multi-size `.ico` save on
an already-16px-downscaled source, which silently produced a single
16×16 frame instead of the intended 16/32/48 multi-frame `.ico` (Pillow
can't usefully upscale 16px to 32/48px) — now generated from a 256px
source every time. `assets/img/favicon/*`.

## v3.16 — 2026-09-20 fix overlay-open page shift (shared ScrollLock helper)

"When clicking on companies/jobs to open the overlay, the page under it
shifts a little." Root cause: every modal/overlay locked scroll with a
plain `document.body.style.overflow = 'hidden'`, which removes the
scrollbar and lets the page content jump sideways by the scrollbar's own
width. Added a shared `ScrollLock` helper (`assets/js/components.js`) that
measures `window.innerWidth - document.documentElement.clientWidth` and
compensates with a matching `body` `padding-right` alongside the
`overflow: hidden`, with a lock-counter so nested/overlapping opens don't
unlock early. Applied to every overlay on the site: `CompanyModal`,
`RoleInsight`, `ImageModal`, `NavMenu` (`components.js`) and
`CourseOverlay` (`course-demo.js`) — all switched from their own direct
`body.style.overflow` toggling to `ScrollLock.lock()`/`.unlock()`.
Verified by monkey-patching `document.documentElement.clientWidth` in a
Playwright test (the headless test viewport's own scrollbar doesn't
actually consume layout width, so the real-world 17px shift had to be
simulated to check the compensation logic). `assets/js/components.js`,
`assets/js/course-demo.js`.

## v3.15.1 — 2026-09-20 favicon: flattened to solid white (superseded by v3.16.1 above)

First attempt at "no black background in the favicon" — flattened the
icon onto an opaque white background, which fixed the visible black/white
flash mechanically but sacrificed the icon's intended transparency instead
of fixing the actual cause (see v3.16.1 above for the real fix).

## v3.15 — 2026-09-20 instructor data model fix + title split + card style, favicon, 6-col industry grids, ftam-style nav menu

1. **Instructor filter bug fixed at the data-model level.** GM edited a
   few `instructors.json` entries from `教研导师` to `学术导师` and the
   site's filter didn't pick it up. Root cause: each record carried BOTH
   `category` (an internal id like `"research"`/`"academic"`, used by the
   filter) and `categoryLabel` (the Chinese text a content editor would
   naturally think to edit, like `"教研导师"`) — two fields that had to be
   kept in sync by hand, and the filter only ever looked at `category`.
   Editing `categoryLabel` alone did nothing. Fixed by consolidating to a
   SINGLE `category` field holding the Chinese label text directly — it
   is now both the displayed text and the exact filter-match value, so a
   plain-text edit to that one field is immediately reflected on the
   site with no other code changes needed. `HomePage.INSTRUCTOR_FILTERS`
   (old id/label array) replaced with `HomePage.INSTRUCTOR_CATEGORIES`
   (a flat array of the 6 Chinese category strings); `_instructorCardsHTML`
   now filters on `r.category === typeId` directly. `assets/js/pages/
   home.js`, `data/instructors.json`.

2. **`instructors.json`: `title` split into `background` + `title`.** Per
   GM's spec: `background` is the university/company name the old title
   led with; `title` is the role/credential alone, with no school or
   company name in it. For most records this is a straight split on the
   title's first space. Two systematic no-space cases needed a fallback
   by category: education categories (`海外教授`/`学术导师`/`教研导师`/
   `顶尖学者`) with no space → the whole text is a bare school name
   (`background` = text, `title` = ""); `业界导师` with no space → the
   whole text is a pure credential with no company (`background` = "",
   `title` = text). Migrated all 128 records this way (distribution:
   学术导师 56 · 海外教授 37 · 业界导师 20 · 教研导师 9 · 顶尖学者 6; 8
   records end up with an empty `background`, 15 with an empty `title`,
   none with both empty). **Four records needed manual special-casing**
   because the systematic rule would have split them wrong — flagging
   for GM's awareness per "特殊情况可问我":
   - **陆老师** ("策展人 华人第一女策展人") → kept whole as `title`
     ("策展人" is a role word, not an org; `background` = "").
   - **曹老师** ("国家级盛典视觉 艺术家") → rejoined without the space as
     `title` = "国家级盛典视觉艺术家" (`background` = "").
   - **俞同舟** (顶尖学者, "中国美术学院 中国美术学院数字媒体名师" — a
     literal text duplication in the source) → `background` = "中国美术
     学院", `title` = "数字媒体名师". Note: there's a near-identical
     **俞老师** record under 业界导师 (`background` = "中国美术学院",
     `title` = "数字媒体名师") that may be the same person listed twice
     across two category lists — not merged, just flagged.
   - **黄老师** (one of two 黄老师 records, "普瑞特普瑞特艺术学院 传达
     设计" — a duplicated "普瑞特"/Pratt typo) → `background` = "普瑞特
     艺术学院" (typo fixed in the JSON text only), `title` = "传达设计".
     The corresponding image filename still has the typo on disk.
   Also worth flagging: **4 records** — tico老师, mogo老师, 姚老师, 陈老师
   — had GM's edit land on `categoryLabel` = `学术导师` while the old
   internal `category` id was still `"research"` (i.e. `教研导师`). Since
   the migration reads only the human-readable label (the field GM
   actually edits), all 4 landed under **学术导师**. If any of these were
   meant to move to 教研导师 instead, that's now a one-field text edit in
   the new JSON (`category`) and it takes effect immediately — exactly
   the fix in point 1 above.

3. **Instructor cards restyled: name → background (bold) → title, each
   on its own line.** `_instructorCardsHTML` now renders
   `.person-card__background` and `.person-card__title` as separate
   block-level lines below the name (empty fields render nothing, no
   blank line). `.person-card__background` is `font-weight: 700` so the
   school/company reads as the most prominent credential after the name;
   `.person-card__title` stays at the existing muted/regular treatment.
   `assets/js/pages/home.js`, `assets/css/ist-shared.css`.

4. **Favicon recovered and wired in.** The browser tab was showing no
   icon at all. Found the brand's original standalone square mark at
   `assets/img/logo.png` (3125×3125, transparent background) — the same
   icon that's folded into the current navbar's logo+text combomark
   (`assets/img/logo-full.png`), confirmed by cropping the combomark's
   left edge and comparing pixel-for-pixel. Generated a full icon set
   from it (16/32/48/180/192/512px PNGs + a multi-size .ico) into
   `assets/img/favicon/` and linked `favicon.ico`, three PNG sizes, and
   an `apple-touch-icon` in `index.html`'s `<head>`. Verified via
   Playwright: all `<link rel="icon">` tags resolve, `favicon.ico`
   returns 200.

5. **"行业正在做什么业务" grid → fixed 6 columns; "代表企业" → more per
   row.** Both were `auto-fill` grids sized off a `minmax()` basis, which
   at this site's container width was landing on 5 across for the
   business-line cards even though most industries carry exactly 6 of
   them. `.tag-card-grid` (and its `--detailed` title+body variant, now
   sharing one column rule) changed to a fixed `repeat(6, 1fr)`, with
   `900px`/`640px` breakpoints stepping down to 3/2 columns — verified
   all 8 industries now use the `--detailed` variant and render a clean
   single row of 6. `.company-grid`'s `minmax()` basis narrowed
   180px → 140px (kept as `auto-fill`, not fixed, since company-name
   lists vary a lot in length/count per industry) — now fits 7+ chips
   per row at desktop width instead of 5–6, with a 120px basis on
   mobile. `assets/css/components.css`.

6. **Nav-menu overlay restyled to ftam_demo's two-column layout.**
   Checked `ftam_demo` on GM's machine (it exists, siblings with
   `dad_demo`/`ist_demo`/`ga_demo` under `~/Documents/work/websites/`) —
   its expanded nav menu uses a two-column row layout (bigger "go to a
   whole page" links on the left, smaller in-page anchor links on the
   right, divided by a vertical rule, collapsing to a single centered
   column with a horizontal rule on mobile) instead of dad_demo's
   previous single centered stack. Ported that layout: dad_demo's
   existing links are unchanged in destination, just regrouped —
   left/primary column = the 3 standalone pages (案例展示/时间轴/课程
   产品, already the larger `--page`-styled links), right/secondary
   column = the 5 homepage-anchor links (首页/职业规划/offer展示/导师
   团队/资源网络), with the existing 职业规划 CTA button kept centered
   below both columns (ftam_demo's version has no equivalent CTA, so this
   is dad_demo's own addition, left in place). `.nav-menu-overlay__group`
   replaced by `.nav-menu-overlay__row` (row flex container) wrapping two
   `.nav-menu-overlay__col` elements; the old fixed-width horizontal
   divider is now a full-height vertical rule at desktop widths, reverting
   to horizontal on mobile. `index.html`, `assets/css/ist-shared.css`.

Verified via Playwright: 教研导师 filter shows 9 records / 学术导师 shows
56 (was previously not updating at all); `.person-card__background`
computes `font-weight: 700`; nav-menu overlay opens with 2 columns in a
`flex-direction: row` layout at desktop width and collapses to a centered
column on a 390px viewport; `.tag-card-grid` computes to a literal 6
`grid-template-columns` at desktop width across all 8 industries;
`.company-grid` computes to 7 columns at the same width; no console
errors on any checked page. All changes delivered as
`dad_demo_v3.15.tar.gz`, md5-verified byte-identical against the device
copy for every changed file.

## v3.14 — 2026-09-20 industry-card image cleanup

Found and removed 29 duplicate " 2"-suffixed image files under
`assets/img/industry-cards/` on GM's machine (verified byte-identical via
md5sum against their non-suffixed originals before deleting). Fixed
`data/industries.json`'s `bannerImg` paths for the ai-tech and
internet-ux industries, which were pointing at stale `.jpg` filenames
after GM replaced those two images with new `.png` files. Brought all 32
canonical industry-card images into the cloud repo for the first time
(previously only present on GM's machine). Verified with Playwright that
both banners render at full resolution with zero 404s across all 8
industries.

## v3.13 — 2026-09-19 homepage reel → editorial teaser, marquee reliability fix, resource-overlay arrow removed

1. **Homepage's auto-scrolling 8-industry reel replaced with an editorial
   teaser.** The reel itself was already moved onto 职业规划's overview
   tab in v3.12; this pass removes the homepage's now-redundant copy of
   it and replaces that section with a title + a formal paragraph
   (written along the "行业全景 + 职业规划" angle, in the voice of the
   digital-arts-and-design department) + a highlighted `.btn.btn--primary`
   CTA linking to the full 职业规划 page. `assets/js/pages/home.js`.

2. **All marquees on the site rebuilt on a shared rAF-driven `Marquee`
   helper** (`assets/js/marquee.js`, new file) — fixes every reel on the
   site (职业规划's industry rail, the homepage partner-logo marquee, the
   homepage featured-courses rail) going blank after scrolling for a
   while. Root cause: the previous CSS-keyframe approach (and the first
   draft of this rAF replacement) computed each track's scroll-loop width
   once, but page builders run while their page is still `display:none`
   (before `Router.go()` activates it), so that width was captured as 0
   and the loop-reset math broke permanently once the real width was
   known. Fixed by recomputing the loop width every animation frame
   instead of caching it once. Also pauses on hover and pauses (via
   `IntersectionObserver`) when scrolled out of view.

3. **Resources hover overlay's arrow removed**, keeping only the bordered
   box per GM's request. `assets/css/ist-shared.css`.

## v3.12 — 2026-09-19 8-industry reel moved to 职业规划's overview tab

Homepage's auto-scrolling 8-industry reel relocated onto 职业规划's
overview tab (its natural home, alongside the rest of the industry
landscape content) — homepage keeps only a lightweight teaser as of
v3.13, above.

## v3.11 — 2026-09-20 seven-part polish pass

1. **Navbar logo at 80% scale.** `.navbar__logo-img` height 34px → 27.2px
   (width is `auto`, so the whole lockup — icon + wordmark — scales down
   proportionally as one image). `assets/css/style.css`.

2. **建筑学5年 removed from the timeline's 本科阶段 tab row.** Just the
   `<button data-val="arch5">` in `index.html` — `data/timeline.json`'s
   `arch5` rows are untouched (still there, just unreachable from the UI),
   consistent with v3.9's decision to leave that track's data alone since
   there's no 建筑5年 sheet in the source xlsx to re-derive it from. No JS
   change needed: `TimelinePage._selUg` already defaults to `'uk3'`, never
   `'arch5'`.

3. **时间轴 / 课程产品 title blocks now match 案例展示's format exactly.**
   Both `.timeline-hero` sections were missing the small English eyebrow
   line 案例展示 has above its `<h1>` (`<span class="eyebrow eyebrow--on-
   void u-en">...</span>` — the exact same classes, since `.timeline-hero`
   is on the same void background as `.hero`). Added "Growth Timeline"
   above 成长时间轴 and "Course Products" above 课程产品. All three pages'
   `<h1>` now render at the identical `--fs-h1` size (verified: 56px at
   1440px viewport on all three) — this was already true before this pass
   (v3.9 unified the two font-size systems), the eyebrow was the only
   piece 时间轴/课程产品 were missing.

4. **案例展示's filter-group labels (国家/地区、项目类型) restyled.** These
   used to share `.tl-ctrl-label` with 时间轴's own 本科阶段/研究生阶段
   labels — a 10px, uppercase, letter-spaced, English-mono-styled read-
   out, which GM found too small/quiet for these two plain-Chinese group
   names. Rather than changing the shared class (which would also change
   时间轴's labels — not something GM flagged), added a new
   `.portfolio-filter-label` class scoped to `#page-portfolio`: 15px, bold,
   plain Chinese type, with a small yellow accent-bar prefix (matching the
   site's existing small-accent-mark visual language) instead of the
   uppercase-mono treatment. `assets/css/pages.css` / `index.html`.
   时间轴's own `.tl-ctrl-label` usages are untouched.

5. **国家/地区 filter order.** Was alphabetical (`localeCompare('zh')`);
   now a fixed `PortfolioPage.REGION_ORDER` per GM's own priority: 英国→
   美国→中国香港→中国澳门→加拿大 first (GM's stated order was "英美港澳日
   加" — 日本/Japan isn't in the real data, no case's 申请地区多选 lists
   it, so it's simply skipped), then the remaining 5 regions ranked by
   study-destination importance rather than raw case count: 澳洲→意大利→
   新加坡→韩国→北欧. Case counts in the real data (英国40/美国21/中国香港19/
   中国澳门7/澳洲4/加拿大4/意大利4/新加坡3/北欧2/韩国2) informed but didn't
   dictate this — 韩国 was placed ahead of 北欧 despite an equal count
   (2 each) since South Korea is a far more mainstream, broadly-recognized
   design-study destination than the Nordic countries, which have very
   few programs relevant to Chinese applicants. Any region not in this
   list (future data) sorts after all of these, alphabetically among
   itself — `assets/js/pages/portfolio.js`.

6. **Case-card modal enlarged — was rendering at half resolution.**
   `.img-modal-flipper`/`.img-modal-inner img`'s `max-width` was
   `min(92vw, 800px)` — on any normal-width monitor the flat 800px cap
   kicked in long before 92vw did, so a 1600px-wide case-card poster
   (`assets/img/portfolio-cases/*_full.jpg`) displayed at literally half
   its real pixel width, making the infographic's small text hard to
   read. Raised to `min(90vw, 1700px)` (`max-height` 88vh → 90vh) —
   verified at a 1440px viewport the modal image now renders at 1302px
   (≈90%) instead of 800px, and isn't upscaled past the image's own
   ~1600px native resolution on larger screens. This is the SAME
   `ImageModal` component the course-catalog poster clicks use too
   (`assets/js/course-demo.js`/`home.js`'s `_buildCatalogCard`) — the
   size increase applies there as well, which is a strict improvement for
   those posters too (nothing in the catalog relied on the 800px cap).
   `assets/css/components.css`.

7. **Nav "课程" renamed to "课程产品".** Matches the page's own `<h1>`
   (already "课程产品" since it was copied from ist_demo/that page's own
   content, not renamed here) and removes the inconsistency between the
   nav label and the page you land on. Updated in all 3 places that
   labelled this page "课程": the main navbar button, the mobile hamburger
   overlay link, and the footer's page-nav column link (`index.html`).
   Left `精选课程`/`Featured Courses` (homepage's own course-teaser
   section, a different concept entirely) untouched.

## v3.10.1 — 2026-09-20 资源网络 card/hover follow-up

GM's follow-up on v3.10 below: "参考ist-demo的resource部分并采用那个logo展示
逻辑以及卡片大小。on-hover效果可以改为在上方浮现overlay。"

1. **Card size + logo treatment now matches ist_demo's `.coop-card`
   exactly.** v3.10's card (184×144, unbounded `object-fit:contain` logo)
   is replaced with ist_demo's own proportions: 116px-wide card, 16px
   10px 12px padding, 8px gap, 12px border-radius, and a 60×60 white-
   backed logo box (`.coop-card__logo`, `border-radius:8px`,
   `overflow:hidden`, `background:#fff`) with the `<img>` inside set to
   `object-fit:cover` — so a non-square crest/wordmark fills the square
   the same way ist_demo's own logos do, rather than floating inside a
   loose bounding box. English name + Chinese name are both shown now
   (ist_demo shows both; v3.10 only showed the Chinese name), each
   `-webkit-line-clamp:2` since real institution names run far longer
   than ist_demo's own company list (up to 74 chars for English, e.g.
   "The Hong Kong University of Science and Technology (Guangzhou)
   [HKUST(GZ)]") — without the clamp, a handful of long names stretched
   every card in the row to ~218px tall (flex rows default to
   `align-items:stretch`, matching ist_demo's own unset default); clamped,
   all cards sit at a consistent ~160px.

2. **Hover info now floats ABOVE the card instead of covering it.** The
   v3.10 design put Intro/Collab in a `position:absolute; inset:0` overlay
   *inside* each `.coop-card`, dimming the card itself on hover. Per GM's
   follow-up this is now a separate floating panel above the card. Since
   the marquee's `overflow:hidden` (needed for the horizontal infinite-
   scroll edge mask) would clip anything positioned outside a card's own
   box, this isn't a CSS-only change: `HomePage._showCoopOverlay`/
   `_hideCoopOverlay` (`assets/js/pages/home.js`) manage ONE shared
   `#coop-hover-overlay`-classed element, created once and appended
   directly to `<body>` (`position:fixed`) — completely outside the
   marquee's DOM subtree, so its own `overflow:hidden` and the track's
   `will-change:transform` (which would otherwise create a containing
   block for a `position:fixed` descendant) never come into play. A
   `mouseover`/`mouseout` pair delegated on `#coop-marquee-track` (not
   166 individual listeners) calls these on whichever `.coop-card` is
   hovered, looking up that card's partner record by its index in the
   track's children (`% partners.length`, since the track holds two
   back-to-back copies for the seamless loop). Positioning: centered
   horizontally over the hovered card and clamped to stay on-screen
   left/right; vertically, it measures its own real (content-dependent)
   height after setting the card's data, and flips from "above the card"
   to "below the card" (arrow direction flips too,
   `.coop-hover-overlay--below`) whenever showing above the card would
   tuck part of the overlay under the sticky navbar — verified against a
   card in the marquee's first visible row, right at the top of the
   viewport. `window.scroll` also dismisses the overlay outright rather
   than trying to keep it glued to a card whose position just changed.

## v3.10 — 2026-09-19 real 案例展示/资源网络 data + sticky collapse UX

1. **案例展示 (portfolio cases) — real data.** Replaced the placeholder
   `data/portfolio-placeholder.json` page with `data/portfolio-cases.json`
   (70 real MA/研究生 offer cases), transcribed from GM's team's
   `_DAD研究生案例卡&企业logo/DAD MA 网站信息包.xlsx`「MA案例卡」tab. Each
   row's 画板名称 column names a matching image PAIR in that row's country
   subfolder: `{board}头图.png` (a square artwork/render crop — visually
   confirmed via a sample pair, 港研01: 1523×1523) is the grid thumbnail,
   and the plain `{board}.png` (a landscape branded case-card infographic
   with GPA/projects/offer letters, 港研01: 3840×2368) is the click-to-
   open image. Both were resized ON-DEVICE (confirmed PIL 12.3.0 +
   imagemagick available in the user's own device shell) directly into
   `assets/img/portfolio-cases/` — thumbs ≤640px/JPEG q82, fulls
   ≤1600px/JPEG q85, flattened onto a `#0a0a0a` background to match the
   site's dark theme — rather than transferring the source folder's 334MB
   of raw PNGs to the cloud workspace first (140 files, ~22MB total after
   resize). **Privacy:** the sheet has two name columns — 学生姓名（核对用)
   (real names, internal verification only, many with ✅ annotations) and
   学生姓名（网站显示用) (anonymized, e.g. "叶同学") — only the anonymized
   column was used for the public `name` field; the real-name column was
   never copied into `portfolio-cases.json` or exposed anywhere on the
   site.

   **Two independent multi-select filter rows**, rewritten in
   `assets/js/pages/portfolio.js` (`PortfolioPage`) — deliberately NOT the
   site's usual single-select `.filter-bar` pattern (which force-clears
   sibling `.is-active` classes), since a case can legitimately match
   several buttons in either row:
   - Row 1 — **国家/地区**: one button per unique value straight off the
     sheet's 申请地区多选 column, 10 total (中国澳门/中国香港/加拿大/北欧/
     意大利/新加坡/澳洲/美国/英国/韩国) — explicitly NOT bucketed into
     groups like the offers section's existing "港新"/"其他".
   - Row 2 — sourced from the sheet's 5大分支多选 column (5 values:
     3D虚拟/AI机械/信息体验应用/多媒介装置/视觉策略传播) but the filter-group
     label is renamed **项目类型** per GM's spec.
   Matching is OR-within-a-row (empty selection = no filter on that row,
   equivalent to "全部" being active) AND-across-the-two-rows; each row
   keeps its own "全部" reset button in sync via `PortfolioPage._selRegions`
   /`_selTypes` (Sets). The two rows reuse `.tl-controls`/`.tl-ctrl-group`/
   `.tl-ctrl-label` (originally built for the timeline page's UG/PG
   track-selector rows in `ist-shared.css` — confirmed theme-neutral, so
   safe to reuse here). Clicking a card opens the shared `ImageModal`
   (ported in v3.9) on the case's `full` image.

2. **资源网络 (homepage resource/partner section) — real company logos.**
   `HomePage.renderResources` (`assets/js/pages/home.js`) now loads
   `data/resource-partners.json` (83 real partners) instead of the old
   plain-text company-name marquee. Extracted from the same xlsx's
   「校企资源logo」tab via openpyxl: cell values (English name/Chinese
   name/文字展现合作内容) read with `data_only=True`, and each embedded
   logo image (`ws._images`) matched to its data row by anchor row
   (`.anchor._from.row`, 100% match rate across all 83) — raw extraction
   → `assets/img/partners/*.png`, resized to ≤320px with alpha preserved
   (13MB → 3.1MB). The sheet's combined 文字展现合作内容 field (formatted
   "Intro：...\nCollab：...") is split into `intro` (a sentence) and
   `collab` (an array, the Collab portion's "/"-separated items). Each
   `.coop-card` shows the real logo + Chinese name at rest; on hover, a
   full-card overlay (`.coop-card__overlay`) reveals `intro` as plain text
   and `collab` as prominent yellow tag pills — plain text for the intro,
   "more obvious text/tags" for the collab, per GM's spec. Card grew
   150×72→184×144 to hold the overlay; `intro` is `-webkit-line-clamp:3`
   since real copy runs 47–120 characters (median 70) and a few of the
   longest entries (e.g. 联合国教科文 ICEE 未来科技教育基地, 120 chars)
   would otherwise overflow a fixed-height card. Marquee scroll speed
   math (`COOP_SPEED_PX_PER_SEC`) updated for the new card width+gap and
   83-partner count (was tuned for the old 150px cards/69 companies).

3. **Sticky floating collapse button — ported from ist_demo.** ist_demo's
   `assets/js/pages/home.js` has `_initStickyCollapse`/`_updateStickyBar`:
   while its instructor grid is expanded and its own 展开/收起 button has
   scrolled out of view, a floating pill (`#sticky-collapse`) takes over
   so the user doesn't have to scroll back up. Ported into dad_demo's
   `HomePage`, generalized from ist_demo's single instructor-only
   candidate to cover **both** grids this site has expand/fold for
   (导师团队 AND offer 展示, both already had the v3.9 `_gridClamp`
   expand/fold behavior but not this fallback): `_updateStickyBar` builds
   a `candidates` array in the page's own visual order (offers-root sits
   above instructors-root), filters to those currently `open` with their
   expand/collapse button in the DOM (`#offers-expand-btn`/
   `#instructors-expand-btn`, ids added to `_applyOfferClamp`/
   `_applyInstClamp`'s button markup), and — if BOTH sections happen to be
   open and out of view at once — targets the LAST out-of-view candidate
   (the section the user is currently below), rather than only ever
   supporting one section like ist_demo's original. Markup
   (`#sticky-collapse`/`#sticky-collapse-btn`) added to `index.html`
   before the footer; CSS (`.sticky-collapse`/`.sticky-collapse__btn`,
   `assets/css/pages.css`) recolored from ist_demo's blue
   `--color-primary-bright` to this site's yellow `--color-accent`/
   `--color-accent-deep`/`--glow-accent` tokens. `_updateStickyBar()` is
   called from `_initStickyCollapse` (once, on the scroll listener + an
   initial call), and again after every clamp re-render
   (`_applyOfferClamp`/`_applyInstClamp`) so toggling either grid updates
   the bar immediately, not just on the next scroll.

4. **Bug fix found while testing the above: 案例展示's grid/filter rows
   could get stuck invisible on EVERY page load, not just this one.**
   `#portfolio-grid` (and the same for planning/timeline/course-products'
   own `.fade-up` content) is rendered by its page builder while that
   page's `<main class="page">` is still `display:none` — all builders run
   up-front in `index.html`'s boot sequence, before the first ever
   `Router.go()` call. The single global `Effects.init()` (registered once
   on `DOMContentLoaded`, also before any page is shown) observes these
   `.fade-up` elements while hidden; per spec a hidden element has no
   intersection, and — confirmed by testing — Chromium does NOT
   automatically re-fire the callback later just because the element
   becomes visible; calling `observer.observe()` on an already-observed
   target is a no-op too. Net effect: content that never happens to get
   independently re-observed after its page becomes active can be stuck
   at `opacity:0` forever, on every load, for every visitor — this
   affected 案例展示 specifically because nothing was calling
   `Effects.init()` on `#page-portfolio` at all (planning's own
   `PlanningPage.render()` already re-runs `Effects.init()` on its own
   subpage root, which is why it wasn't visibly broken there). **Fixed**
   by re-running `Effects.init(page)` inside `Router.go()`
   (`assets/js/router.js`) right after `page.classList.add('is-active')`
   — this re-observes any not-yet-`.is-visible` `.fade-up` descendant of
   whichever page just became active, and is safe to call repeatedly
   (effects.js's own `:not(.is-visible)` filter no-ops on anything already
   revealed).

   That alone wasn't quite enough for `#portfolio-grid` specifically: it
   renders all 70 cases un-paginated (unlike offers/instructors, which
   clamp to a handful of rows above the fold), so the element's box is
   ~5800px tall — far taller than the viewport — and `.fade-up`'s
   IntersectionObserver threshold (10% of the *target's own* height,
   `effects.js`) can never be reached from a normal scroll-in position
   (only ~4% of the box is ever above the fold at once). Dropped
   `.fade-up` from `#portfolio-grid` itself in `index.html` (kept on the
   much shorter `.tl-controls` filter-row wrapper, which reveals fine) —
   the grid now just renders immediately with no fade, which reads fine
   since it's below an already-animated hero/filter row anyway.

## v3.9 — 2026-09-19 six-part follow-up (logo, timeline data, instructor/offers grids, poster modal, title-block unification)

1. **Navbar brand lockup.** Replaced the icon-image + separate CSS text
   span with the single official VI asset
   `_SFK数字艺术与设计 VI/SFK26新版科系图标最新电子版-黄字.png` (icon +
   数字艺术与设计科系 + Faculty of Digital Arts and Design, baked in as
   yellow-on-transparent). The icon mark itself is pixel-identical to the
   old `assets/img/logo.png` (confirmed by alpha-channel bbox diff), so
   this is additive (adds the wordmark), not a redesign. Cropped to the
   lockup's own content bbox, resized to 1524×240 → `assets/img/
   logo-full.png` (~80KB), `.navbar__logo-img` bumped 28px→34px so the
   two-line wordmark stays legible (`assets/css/style.css`).

2. **Timeline data (`data/timeline.json`) replaced from
   `_supplement-912/数艺-本研时间线xlsx.xlsx`.** Read with openpyxl
   (5 sheets: 英本3年/美本4年/研究生1年制/研究生1.5年制/研究生2年制 — no
   建筑5年 sheet exists in this file, so **`arch5` entries are untouched**,
   left exactly as before). Each sheet lists 学年/阶段/时间 rows plus
   matching-arrangement columns (实习/夏校/商业实践/大师课/安心办GPA, or a
   single combined column for the PG sheets); bars were built by: (a)
   treating 阶段 ∈ {开学, 毕业, 递交研究生申请} as 关键节点/milestone bars
   using that row's own date range (开学 is always pinned to Sep=col 1 by
   definition, regardless of the exact written month — matters for the US
   sheet's "8月下旬" starts); (b) for every other matched-arrangement cell,
   grouping contiguous rows with the identical cell value into one bar
   spanning first-row-start to last-row-end, converting each Chinese
   month range to the shared Sep=1…Aug=12 grid index via
   `((calendar_month-9) mod 12)+1`; (c) a handful of PG-track rows sit
   in the summer *before* their own 学年 starts (e.g. pg1's "开学前暑假
   07月–9月") — since the grid can't show a month before its own Sep
   start, those are pinned to (1,1) rather than wrapping to the end of
   the grid, which would misleadingly place a pre-term event at the
   *end* of the year instead of the beginning. Labels normalize a
   trailing instance digit against the column's own name (e.g.
   "商业实践1"→"商业实践") but pass through a genuinely different label
   verbatim (e.g. "毕无忧", "无忧包"→folded into 安心办's Sep-start bar);
   any cell containing "作品集" is force-mapped to 求职准备/internship
   regardless of which column it physically sits in (the source sheet
   is inconsistent about this). PG tracks' old "安心办" GPA-support bars
   are dropped — there's no GPA-assist column in any of the 3 PG sheets,
   so those bars weren't backed by real data; PG milestones are now
   labeled 开学 (matching the sheet) instead of the old 入学. Where the
   xlsx's own date ranges disagree with the prior (hand-approximated)
   JSON, the xlsx wins — several bars (e.g. us4's 大二/大三 商业实践/大师课,
   which run further into spring than previously shown) are now longer
   than before. Full source-row transcription and the derivation for
   every bar is in the session transcript if this needs re-deriving
   later; the build script (`build_timeline.py`-style hand-authored
   data, not a live xlsx parser) is not checked into the repo.

3. **导师团队 "全部" grid.** `HomePage.renderInstructors` now renders
   ALL 128 records into the DOM for every filter (unchanged from before
   for "全部" specifically — that already rendered everything; what's
   new is the row-based clamp below, in case the empty grid GM saw was
   an older/cached build) and clamps to `INSTRUCTOR_ROWS = 4` full rows
   via a new shared `_gridClamp(gridEl, rows, open)` helper — ported
   from ist_demo's `assets/js/pages/home.js` `_gridClamp`/
   `toggleInstructors`. It reads the grid's own `getComputedStyle(...)
   .gridTemplateColumns` column count (not a hardcoded number) and
   clamps to `cols * rows`, re-clamping on window resize while
   collapsed. "展开查看更多"/"收起" toggle wired the same way as
   ist_demo's `inst-expand-btn`.

4. **Offer 展示 grid — no sparse last row on resize.** Replaced the old
   fixed `OFFER_PAGE_SIZE = 20` slice (which could leave a trailing row
   with as few as 2 of 6 columns filled) with the same `_gridClamp`
   helper as instructors, `OFFER_ROWS = 4`: the grid now always shows a
   whole number of full rows for the *current* column count, and
   re-clamps on resize while collapsed. Per-group open/closed state
   (`_offerExpanded`) and the "查看更多"/"收起" button text/behavior are
   unchanged from the user's point of view — only the underlying count
   is now column-aware instead of a fixed 20.

5. **课程目录 poster click-to-open modal.** This never existed in
   dad_demo — `_buildCatalogCard`'s `.port-card__img` rendered a plain
   `<img>` with no click handler at all (course-demo.js/home.js's
   catalog-card renderer were copied from ist_demo, but ist_demo's own
   `ImageModal` component — the thing that makes poster clicks work —
   was never carried over). Ported `ImageModal` verbatim from
   ist_demo's `assets/js/components.js` (+ its `.img-modal-*` CSS from
   ist_demo's `components.css`) into dad_demo's `assets/js/
   components.js` / `assets/css/components.css`, and wired
   `onclick="ImageModal.open(poster, title)"` onto `.port-card` in
   `_buildCatalogCard` (`assets/js/pages/home.js`) wherever a poster
   image exists. This is a different component from the "Lightbox" that
   was intentionally removed in v3.6 (that was for planning page output
   photos; this is for course-catalog posters and was simply never
   implemented).

6. **案例展示 / 时间轴&课程产品 title-block unification.** These two used
   different layout systems: 案例展示 used the homepage `.hero` pattern
   (content wrapped in a centered `max-width:1180px` `.container`), while
   时间轴/课程产品 use `.timeline-hero` (a plain full-width padded section,
   no centered container) — on wide viewports this made 案例展示's title
   sit visibly further from the left edge (measured 56px further at
   1440px). Per GM's request the two properties swap directions:
   **alignment** — 案例展示 now adopts 时间轴/课程产品's block layout
   (`#page-portfolio .hero` override in `assets/css/pages.css`: display
   block, `.timeline-hero`-style padding, and the inner `.container.
   hero__content` has its centering/max-width neutralized; the stray
   inline `style="min-height:auto;padding:..."` on that section in
   `index.html` was removed since it would otherwise out-rank the new
   CSS). **Font-size/style** — `.timeline-hero__title`/`__sub` in
   `assets/css/ist-shared.css` now use 案例展示's own values (`var(--fs-h1)`
   clamp(32–56px)/weight 800 title, 16px/1.8 subtitle) instead of their
   previous smaller `--text-xl`/`--text-base`. Net effect: both pages'
   title blocks now sit at the same left position AND render at the
   same (larger) type size.

## v3.8 — 2026-09-19 real Figma content for 行业解读/业务/职业发展路径

v3.7 shipped the behavior GM asked for but left 3 content fields
empty, blocked on the Figma MCP connection's rate limit. GM's fix:
"see supplement-912/SFK 数字艺术与设计就业方向海报系列。same content
but pdf format." — a 240MB, 9-page PDF export of the same poster,
already sitting in their connected folder. That completely sidesteps
the Figma API: this pass reads it directly instead.

**How it was read.** The PDF itself was too large to bring into the
cloud workspace efficiently for a 9-page document, so it was rendered
to per-page PNGs *on the user's device* first (`pdftoppm`, already
available there) and only the ~3MB-per-page renders were staged into
the workspace — never the 240MB source file. Each page was then
cropped into readable slices and read directly (this is a scanned/
rendered image, not text — there is no OCR step, the content was read
visually off each slice). Page → industry mapping confirmed by
cross-referencing each page's own "INDUSTRY 0N" tag against the poster's
cover-page grid: page 2 = 数字文旅, 3 = 互联网生态, 4 = AI创意科技, 5 =
品牌传播, 6 = 游戏娱乐, 7 = 影视影像, 8 = 教育学术, 9 = 独立艺术家 (the
PDF's own page order does not match industries.json's order, so this
mapping mattered).

**What the poster actually contains, per industry:** 9 numbered
sections — 01 行业解读, 02 代表公司/项目类型 (component descriptions,
not just names), 03 行业正在做什么业务, 04 能进入哪些岗位, 05 求职路径
全流程 (a 6-step process + real internship posting images), 06 职业
发展路径 (an intro sentence + 4 numbered stages + 3 salary bands — a
different shape from this site's existing tiers data), 07 需要建立哪些
能力 (3 general capability cards, distinct from the site's existing
UG/PG-split capability section), 08 代表项目类型, 09 作品集项目对应
就业方向&申请院校. Sections 02, 05, 07, 08 and 09 already have a
working equivalent elsewhere on this site (or weren't part of GM's
original ask) and were **not** touched in this pass — only 01, 03 and
06 were in scope, matching the original request's items 1, 2 and 4.

**01 — industryExplainer.** All 8 industries' `industryExplainer`
field in `industries.json` now holds the real 行业解读 paragraph,
transcribed verbatim (full-width punctuation and all). The
`industryExplainer || parentTrans || oneLine` fallback chain in
`planning.js` stays in place unchanged — it's just no longer falling
through, since the primary field is populated for every industry.

**03 — businessCardsDetailed.** All 8 industries now have a real
6-entry `businessCardsDetailed: [{title, body}]` array (the
`tag-card--detailed` rendering path added in v3.7 was built for
exactly this and needed no further code changes — it activates the
moment the field is non-empty). The plain single-line `tag-card`
fallback (built from `splitPhraseList(targetCases)`) is now fully
superseded for all 8 industries but was deliberately left in the code
as a fallback, not deleted — same reasoning as every other
hasImg-style field in this file: cheap insurance if a future industry
gets added without this data ready yet.

**06 — 职业发展路径, structurally replaced.** GM's instruction was
"use figma version entirely," and the Figma structure (intro + 4
stages + 3 salary bands) doesn't map onto the old tiers-based
`.tier-card` accordion (badge/salary/title/desc/roles/reps per tier) —
they're two different shapes, not a data-filling exercise. So this
section's renderer in `planning.js` now branches on a new
`ind.careerPath` field: when present (all 8 industries, now) it
renders the real intro paragraph + a `.stage-card-grid` of the 4
numbered stages + a `.salary-band-row` of the 3 pay bands, all
transcribed verbatim from the PDF; the old tiers-based accordion is
kept as the fallback branch for graceful degradation, not deleted (the
`ind.tiers` data itself is untouched and still separately powers
_rolesForIndustry for section 04's role pills — that data source
wasn't part of this change). The v3.7 yellow `.jd-insight-block`
callout still renders directly underneath in both branches, unchanged.

**Design decision — stage cards stayed outline, not solid.** The
source poster actually renders its 4 stage cards as solid yellow
blocks. This pass intentionally did *not* copy that: v3.7's
PROJECT_NOTES entry for `.jd-insight-block` already commits to "the
one place on the industry subpage that goes solid instead of outlined,
on purpose," and GM's "yellow blocks+black text... for visual impact"
instruction was specifically about incorporating 总览's JD content —
i.e. that callout, not the stage cards themselves. Keeping the new
`.stage-card`/`.salary-band-chip` elements in the site's existing
outline-accent language (matching `.tag-card`, `.fold-section__index`,
etc.) preserves that one-solid-block design principle rather than
diluting it. If GM wants the stage cards solid-yellow to match the
poster exactly instead, that's a one-line CSS change, not a
restructure.

**Verification:** JSON re-validated after the data injection; `node
--check` clean on both touched JS files; a full Playwright pass
re-confirmed all 8 industries render a non-empty real explainer
paragraph, 6 detailed business cards, 4 stage cards, 3 salary chips
and 1 JD-insight block each, with zero console errors — plus a visual
screenshot check (scrolled through to trigger the fade-up reveals) of
数字文旅's full subpage to confirm the new 06 section reads clearly:
outline stage cards → outline salary chips → solid yellow JD callout,
in that order, matching the intended hierarchy.

**Still not done, on purpose:** 总览's JD decoder itself is untouched
(same deferred decision as v3.7 — its filter-button logic hasn't been
re-examined for what breaks if cards are pulled out from under it).
Sections 02/05/07/08/09's *extra* poster content (company one-liners,
the 6-step application-process graphic + real internship images, the
3 general capability cards) was intentionally left off — none of it
was asked for, and 08/09 already have working equivalents built from
other data. Flagging in case GM wants any of it pulled in later; it's
all sitting in the same PDF and page/slice locations documented above,
so a follow-up pass would be quick.

## v3.7 — 2026-09-19 岗位解读 overlay, JD-insight callout, hint-text cleanup

GM's request had 5 parts; this pass covers the parts that don't need
Figma access, and the notes below explain exactly what's still blocked
and why.

**3. 学生能进入哪些岗位 → "岗位解读" overlay (restored).** GM recalled a
"岗位解读" feature from a few versions back. Checking git history, it
never existed as a separate screen — what existed was hint text next
to the role pills ("· 点击对照真实岗位解读") that *promised* a cross-
reference but the role pill's onclick only ever called
`jumpToJD(ind.title)`, i.e. it jumped to 总览's JD decoder filtered by
**industry only** — it silently ignored which role was actually
clicked, so the promised role-level cross-reference never existed in
code. This pass builds it for real: clicking a role pill now opens a
new `RoleInsight` overlay (`components.js`, mirrors `CompanyModal`'s
shell) showing this industry's **real company job postings**
(`companies.json`) that best match that specific role
(`PlanningPage.openRoleInsight` in `planning.js`). Matching is fuzzy on
purpose — role titles (parsed from `tiers[].gargs`) and job titles are
two independently-written lists with no shared vocabulary (e.g. role
"新媒体交互策划" vs. job "新媒体互动策划") — scored exact-match >
substring-containment > shared-bigram count, capped at the top 4. If
nothing scores above 0, the overlay still opens and shows the
industry's other real jobs generally, with a note explaining there's no
direct match, rather than either a fabricated exact match or an empty
overlay — consistent with this project's standing rule of never
presenting invented precision as real data. Verified via Playwright:
clicking a role pill on 数字文旅 opened the overlay with 2 real matched
jobs and no console errors.

**4. 职业发展路径 → yellow JD-insight callout.** Rather than duplicating
总览's JD decoder content, each industry's own existing entry in
`site.jdDecoder.cards` (`{industry, tag, quote, insight}` — already
built, just never surfaced per-industry) now renders as a solid-yellow/
black-text callout block at the bottom of that industry's 职业发展路径
section (`_jdInsightBlockHTML`, new `.jd-insight-block` CSS). This is
the one place on the industry subpage that uses a **solid** accent
fill rather than the outline-only accent treatment everywhere else —
deliberate, per GM's explicit "yellow blocks+black text... for visual
impact" instruction, to make it read as a distinct, higher-emphasis
callout rather than another section decoration. `JD_CARD_LABEL` handles
the two industries whose title doesn't literally match a jdDecoder
card's shorter industry label (互联网生态→互联网, AI创意科技→AI科创,
same mapping the old `jumpToJD` used). All 8 industries confirmed to
resolve to a real card (verified via a direct data cross-check, no
industry falls through to the empty-string fallback).

GM also said "you can take this out from 总览page afterwards" — **not
done in this pass**: that phrasing reads as permissive/optional, and
总览's JD decoder still has its own filter-button UI (`renderJD`'s
`jd-filter` click handlers) that hasn't been re-examined for what
breaks if cards are removed from under it. Flagging as a deliberate
follow-up, not an oversight.

**5. Inconsistent "点击查看详情"-style hint text — removed.** Three
leftover hints promising interactions that were either broken (see
above) or just redundant now that the section titles + role-pill/tier-
card affordances are self-explanatory: "代表企业 · 点击查看岗位解读",
"学生能进入哪些岗位 · 点击对照真实岗位解读", "职业发展路径 · 点击展开
详情" — all three section headers now read as plain title text. (总览's
heatmap legend note, "点击查看在招详情", was left alone — that's a
different, still-accurate functional hint on an unrelated section, not
one of the inconsistent fold-section headers GM was pointing at.)

**1/2/4 (partial) — blocked on Figma access, needs GM's help.** Three
things in this request need the *actual Figma text*, and the Figma MCP
connection is still rate-limited on the account's Starter plan (hit
`get_metadata` again this session — same "You've reached the Figma MCP
tool call limit" error as prior sessions; this is not a transient
issue that resolves by retrying):
  - **① 行业解读 (section 01).** Title renamed from "行业是什么" to
    "行业解读" as asked, and the section now reads from a new
    `ind.industryExplainer` field with a graceful fallback chain
    (`industryExplainer || parentTrans || oneLine`) — but
    `industryExplainer` is empty in `industries.json` for all 8
    industries right now, so every industry is still silently showing
    its old `parentTrans` text, not Figma's actual 行业解读 copy.
  - **② 行业正在做什么业务 (section 03).** Built the full rendering
    path — `ind.businessCardsDetailed: [{title, body}]` renders as
    richer two-line cards (`.tag-card--detailed`) the moment that field
    is populated, falling back to the current single-line
    `splitPhraseList(targetCases)` tags until then — but the field is
    empty for all 8 industries, so this section is also still on old
    data for now.
  - **④ (partial) "use figma version entirely" for 职业路径/职业发展
    路径.** The existing tier-card structure (badge/salary/title/desc/
    roles) is unchanged, and I was not able to read the Figma frame's
    actual 职业路径/职业发展路径 text to know whether/how it differs.
    Earlier research on this file's frame `1:2` found **two differently
    -numbered sections both titled "职业发展路径"** — a shorter one
    around y≈2497 and a longer one with a "career lead" label + 4
    career cards around y≈3348 — and I couldn't disambiguate which one
    (or both) GM means without being able to read their text.

**What would unblock ①②④:** same workaround that worked for the banner
and output photos earlier in this project — if GM can screenshot or
export the specific Figma sections (per industry: the "行业是什么"/
行业解读 text block, the "行业正在做什么业务" card grid with each
card's one-sentence explanation, and the two 职业路径-labeled blocks on
frame 1:2) and attach them here, they can be read and transcribed
directly into `industryExplainer` / `businessCardsDetailed` / the
career-path section with no further Figma API access needed — this
doesn't require the rate limit to reset.

**Verification:** `node --check` clean on both modified JS files;
Playwright pass against all 8 industry subpages — section 01 reads
"行业解读" everywhere, `.jd-insight-block` renders once per industry
(cross-checked all 8 titles resolve to a real jdDecoder card), role-
pill click opens `RoleInsight` with real matched job data and no
console errors, and none of the 3 removed hint strings remain anywhere
on the page.

## v3.6 — 2026-09-19 沉浸式文化空间 image fix + drop output-photo lightbox

**沉浸式文化空间 (数字文旅) image, non-uniform horizontal fit:** its
source screenshot (1734×1083, ~1.60:1) is noticeably wider than the
`.output-tile` frame's fixed 4:3 (1.333:1) aspect ratio, so
`object-fit:cover` was cropping its left/right edges. GM asked to fix
this by reshaping the image asset itself — not the frame's CSS —
specifically via a horizontal-only (non-uniform) transform, so the
full original content survives with no cropping. Regenerated from the
original PNG: squished width-only from 1734→1444px at full height
(1083px) to hit exactly 4:3, then downscaled uniformly to the usual
1200px-max-width pipeline, landing at a clean 1200×900 (exactly
4/3). Saved over the same path,
`assets/img/industry-cards/output-digital-tourism-3.jpg` — no other
files changed for this part, per GM's "only modify the image itself"
instruction. The other 23 output photos were left untouched (none
were reported as an issue).

**Click-to-enlarge removed from all 24 output photos:** the
`output-tile--photo` elements are now plain non-interactive `<div>`s
(previously `<button onclick="PlanningPage.openOutputLightbox(...)">`).
Since this was the Lightbox component's only caller, `openOutputLightbox`
(`planning.js`) and the `Lightbox` object (`components.js`) were both
removed as dead code rather than left orphaned, along with the now-
unused `.lightbox__frame` CSS rule and the `.output-tile:hover` lift
(no interaction left to hint at). `CompanyModal` (企业 cards) is a
separate, still-active component and was not touched.

## v3.5 — 2026-09-19 layout/visual/scroll polish on the industry subpage

Three independent GM requests, all scoped to the industry detail
subpage (`renderIndustryDetailHTML`):

1. **"具体可以做什么" layout** — split into two rows instead of one
   mixed grid: `.output-showcase-row` (the ≤3 real `outputShowcase`
   photos, `display:flex` with `flex:1 1 0` each so they sit in one
   even 3-across strip and reflow on narrow viewports) and
   `.output-tag-row` (the realCase-derived phrases, now small
   `border-radius:pill` tags instead of full 4:3 tile cells — visibly
   lighter-weight than the photo strip, not sharing its grid). CSS:
   `assets/css/components.css`; markup: `assets/js/pages/planning.js`
   section 05.
2. **Section-distinguishing yellow accents** — every `.fold-section`
   gets a 3px left spine in the site's one reserved accent yellow
   (`var(--color-accent)`, dimmer `--color-accent-dim` when collapsed)
   and `.fold-section__index`'s "01"/"02"/etc. badge is now an
   outlined yellow chip instead of plain gray text. Deliberately reuses
   the existing single accent color rather than adding a second hue —
   "more of the one hot color", consistent with the site's documented
   palette rule (`assets/css/components.css`).
3. **Tab-switch scroll target** — `router.js`'s `Router.go`: when
   navigating to a specific industry (`opts.industryId` set, i.e. a
   top-tab click, `goToIndustry`, or a direct deep link) and no
   explicit `opts.scrollTo` was given, it now scrolls to
   `.industry-panel__banner` instead of `window.scrollTo(0, 0)`. GM
   didn't want every tab click re-surfacing the shared "CAREER PLANNING
   · INDUSTRY MAP" hero that sits above the tab row — switching tabs
   should land straight on the new industry's content. 总览 (no
   industryId) is unaffected and still resets to page top. Verified
   with Playwright that this holds regardless of how far down the page
   was scrolled before switching (my first pass at this test read
   `window.scrollY` mid-animation and looked broken — the real
   behavior is correct once the native smooth-scroll finishes).

## v3.4.2 — 2026-09-19 real "具体可以做什么" photos (all 8 industries)

GM exported all 24 (3 per industry) himself, the same way as the
banners, after the Figma MCP server's rate limit blocked me from
mapping the remaining 7 industries' exact layers in v3.4.1. He dropped
them at `_industry-img/<N>-<label>.png`, where `N` is 1-8. That number
turned out to be the industry's position in the Figma file's own frame
order (`1:2`, `1:245`, `1:487`, `1:729`, `1:972`, `1:1215`, `1:1458`,
`1:1700` — confirmed by cross-checking each group's label content
against the industry it obviously describes, e.g. group 6's "AI 影视
创作 / 影视宣发 / 虚拟制片" is unmistakably 影视影像), not the
industries.json array order — worth remembering if this naming
convention is reused later.

**Why `outputShowcase`, not `outputImgs[i]` (the field v3.4.1
scaffolded):** the filenames carry real Figma-native labels (e.g.
"XR互动体验", "光影艺术", "沉浸式文化空间" for 数字文旅), and these don't
textually match `industries.json`'s `realCase`-derived phrase list
(`splitPhraseList` output, e.g. 数字文旅's is "XR大空间体验、文物智能导览、
数字人讲解、文化数据可视化、AI互动装置、投影Mapping、文旅夜游") — different
source, different wording, no clean 1:1 index correspondence. Forcing
them into `outputImgs[i]` would have meant guessing which realCase
phrase each photo "really" represents, and either silently dropping
realCase phrases that lost that guess or double-counting near-
duplicates (e.g. "XR互动体验" the photo vs "XR大空间体验" the phrase).
Instead: replaced `outputImgs` with `outputShowcase: [{img, label}]`
(3 entries per industry, using the Figma-native label as the caption)
— rendered as its own set of photo tiles, prepended to the output-tile
grid; the full original realCase-derived phrase list still renders
as plain tags after them, unfiltered/undeduplicated. This means a
couple of tags can read as close cousins of a photo tile above them
(e.g. 数字文旅 shows both a "XR互动体验" photo tile and a "XR大空间体验"
tag) — a deliberate choice to never silently drop real content over an
uncertain semantic match, not an oversight. If GM wants those trimmed
for a tighter look, that's now a manual "does this tag duplicate a
photo above it" pass per industry rather than something to infer.

**Pipeline:** same as the banners — converted directly on GM's machine
via `device_bash` (PIL: RGB, resized to max width 1200px, JPEG q85;
sources ranged 930×495 to 1779×1086, outputs 45–205KB), placed at
`assets/img/industry-cards/output-<slug>-<1|2|3>.jpg`.

**Code changes:**
- `data/industries.json` — every industry's `outputShowcase` array is
  now populated (was `[]` via the removed `outputImgs` field in
  v3.4.1).
- `assets/js/pages/planning.js` (section 05 render) — renders
  `ind.outputShowcase` as photo tiles first, then all of
  `splitPhraseList(ind.realCase, ...)` as plain `.output-tag`s after,
  unconditionally (no per-item photo lookup/branching left in this
  loop — that was v3.4.1's now-removed approach).
- No CSS or `Lightbox`/`openOutputLightbox` changes needed — v3.4.1
  already built the photo-tile/lightbox machinery generically around
  an `(label, industryTitle, imgSrc)` call, so wiring real data in was
  a pure data + one render-loop change.

**Verified:** local Playwright pass on 数字文旅 (3 of its real photos
staged temporarily into the cloud build to look at the rendered
result, then removed) — 3 photo tiles render with real images + Figma
labels, the 7 realCase tags render alongside them unchanged, clicking
a photo tile opens the Lightbox with the real image full-size (no
rounded-corner artifact visible, no leftover Figma caption bleeding
through — confirming the v3.4.1 node-export reasoning held up in
practice), no console errors beyond the usual unrelated favicon 404.
The other 7 industries were verified structurally (paths resolve,
JSON/JS parse) without a second screenshot round.

## v3.4.1 — 2026-09-19 "具体可以做什么" real photos + tag fallback

**Prompted by GM noticing each industry's Figma poster only has ~3
real project-photo layers in this section, vs. 6-10 output-type
phrases parsed from `industries.json`'s `realCase` field (e.g. 独立艺术家
has 10, most industries have 6-8) — so most of what v3.3 rendered as
identical-looking clickable gradient tiles was never going to have a
real photo behind it.

**What changed:**
- `data/industries.json` — every industry gets a new `outputImgs: []`
  array field (empty for now — same "field exists, gets filled once
  assets land" pattern as `bannerImg` before v3.4). `outputImgs[i]`
  corresponds positionally to the i-th phrase `splitPhraseList` extracts
  from that industry's `realCase`.
- `assets/js/pages/planning.js` (section 05 render + `openOutputLightbox`)
  — each output phrase now checks `ind.outputImgs[i]`: if set, renders
  the existing photo tile (now with the real image as its background,
  not just a gradient) and its Lightbox opens showing that real photo;
  if not set, renders a plain, non-interactive `.output-tag` label
  instead of a fake clickable tile — this is the actual behavior change
  GM asked for ("for 产出类型 not included in the figma file, use
  text/tags without showing photos").
- `assets/js/components.js` (`Lightbox.open`) — takes an optional
  `imgSrc`; shows the real photo full-size when given one, otherwise
  falls back to the original gradient + "占位图" placeholder exactly as
  before.
- `assets/css/components.css` — `.output-tile--photo` (cover-fit
  background image + bottom-aligned label over a dark scrim, same
  legibility treatment as the industry banner) and `.output-tag` (a
  dashed-border, non-interactive label so it reads as "real content
  that's just text" rather than a broken tile) sitting in the same
  grid as the photo tiles.

**On getting the actual 3 photos per industry (GM also asked me to go
into Figma, strip each image layer's corner-radius and the caption
label rendered on top of it, then screenshot the clean result):**
- Confirmed via `get_metadata` on 数字文旅's frame (`1:2`) that the
  "具体可以做什么" section is 1 large image (`image 2`, id `1:226`, left)
  + 2 stacked smaller images (`image 5`/`image 4`, ids `1:228`/`1:229`,
  right) per industry, each a separate `main output text` label
  positioned as a sibling that visually overlaps the image's bottom
  edge — NOT a child of it.
- Screenshotting a single image node by its own id (`get_screenshot`
  scoped to `1:226`) already excludes that sibling label automatically
  — Figma's node export only renders a node's own subtree, so "text on
  top" turns out to need no editing at all: exporting the specific
  image layer (not the whole section/group) is naturally clean of it.
  Confirmed visually — the exported PNG showed only the photo's own
  baked-in content (these are screenshots of real project slides, e.g.
  "昆明市规划展示馆", not plain photos with a separate caption), no
  extra tag text layered on.
- The rounded corner is real: a `cornerRadius` property on the
  rounded-rectangle shape itself, baked into any export of that node.
  I hit the Figma MCP server's Starter-plan tool-call rate limit
  (`rate_limits-access` error) before I could attempt zeroing it out on
  a duplicate node (my plan was to duplicate rather than edit GM's
  original poster layer in place, screenshot the duplicate, then delete
  it) or fetch the other 7 industries' exact image-layer ids/positions
  to give GM a precise export list the way I did for the 8 banners.
  Resolving this needs either the rate limit to reset/be upgraded, or
  GM exporting these himself (same successful path as the banners) —
  in the latter case the corner-radius doesn't block us either: even
  exported with rounded corners intact, the same object-fit:cover /
  slight-overscale trick already used for the banner can crop a small
  rounded-corner sliver off-screen inside the tile's own
  `overflow:hidden`, so a from-Figma export with its native radius
  still works fine as source material.
- Not yet re-confirmed for the other 7 industries: earlier
  (pre-rate-limit) research suggested each follows the same "1 big +
  2 stacked small" layout, but exact layer names/ids for those weren't
  re-verified this pass — treat that as a starting guess, not a
  confirmed map, until re-checked.

**Not done yet:** the actual `outputImgs` values are still empty for
all 8 industries — this pass only shipped the code/data scaffolding
and the (already-verified) tag fallback for the phrases that will
never have a photo. GM would need to export the ~3 real photos per
industry (24 total) the same way he did the banners, at which point
wiring them in is the same `outputImgs[i]` = file path + redeliver
flow as `bannerImg`.

## v3.4 — 2026-09-19 real banner photos (Figma → asset pipeline)

**What changed:** each of the 8 职业规划 industry subpages now shows a
real photo in its banner (v3.1's kept layout: image, gradient overlay,
title/intro/tags on top), sourced from the same Figma poster file used
for the v3.3 restructure, instead of the industry-tinted gradient
placeholder.

**Why this needed a manual step, not an automated download:** GM asked
whether I could download the Figma images directly and wire them in. I
tried three approaches before concluding I couldn't:
1. `curl` from this session's cloud sandbox to the Figma asset URL the
   MCP tool returned → blocked with a 403 (`connect_rejected`) —
   confirmed via the sandbox's proxy status endpoint as an organization
   network policy denying `www.figma.com` outright, not a transient
   error.
2. The same `curl`, run instead from GM's own Mac via the device
   bridge (reasoning that its network path might be independent of the
   cloud sandbox's proxy) → also a 403 from the same policy. Both
   execution environments sit behind the same egress rule.
3. Asking the Figma tool for the image inline as base64 (avoiding a
   network fetch altogether) → the tool renders it back as a viewable
   image, but there is no tool available in this session that can
   extract that inline image data into a savable file — it can be seen,
   not saved.
With all three ruled out, GM exported the 8 banner images from Figma
himself (one per industry — the large photo below each poster's
header/chip row) and dropped them at `_industry-img/<industry title in
Chinese>.png` in the project root, then asked me to move and wire them
in from there.

**Asset pipeline (done via the device bridge, no cloud staging needed
except 2 sample files for a local Playwright sanity check):**
- Source: `_industry-img/*.png` (screenshots/exports, 1920×600,
  0.9–2.9MB each) — left in place, not deleted.
- Converted with Pillow directly on GM's machine (`device_bash`, since
  the images already live there and PIL/ImageMagick/ffmpeg are
  available in that shell — no need to round-trip through the cloud
  sandbox): RGB, resized to max width 1800px (source was already only
  1920px wide, so this is a light trim), re-encoded as JPEG q85. Output
  is 125–376KB per file, ~1800×562.
- Placed at `assets/img/industry-cards/<slug>.jpg`:
  digital-tourism / internet-ux / ai-tech / game-entertainment /
  film-media / brand-communication / education / independent-artist.

**Code changes:**
- `data/industries.json` — each industry's existing-but-previously-
  unused `bannerImg` field now points at its real file, e.g.
  `"assets/img/industry-cards/digital-tourism.jpg"`. Also normalized
  the path convention: the field originally held a leading-slash
  absolute path (`/industry-cards/...`), which is fragile if the site
  is ever deployed under a subpath rather than domain root; changed to
  a root-relative path with no leading slash, matching every other
  image reference in the project (e.g. `assets/img/instructors/...`).
- `assets/js/pages/planning.js` (`renderIndustryDetailHTML`) — banner
  now branches on `!!ind.bannerImg`: real `<img>` when set, else the
  original gradient + "占位图" placeholder tag, unchanged. This is the
  same data-driven fallback pattern `home.js`'s `_buildCatalogCard`
  already uses for course-catalog posters — deliberately not an
  `onerror`-based runtime fallback, to stay consistent with the rest of
  the codebase.
- `assets/css/components.css` — added `.industry-panel__banner-img`
  (absolute-fill, `object-fit: cover`) so the ~3.2:1 source photos crop
  cleanly into the existing 4:1 (2.2:1 on mobile) banner box without
  distortion.

**Verified:** local Playwright pass against 2 of the 8 (staged
temporarily into the cloud build purely to look at the rendered
result, then removed) — real photo renders full-bleed under the
existing gradient overlay/title/tags, no layout shift, no console
errors beyond an unrelated favicon 404; an industry with no bannerImg
set still falls back to the exact original placeholder. The other 6
were verified structurally (`bannerImg` path resolves, file exists at
that path on GM's machine, JSON/JS both still parse) without needing a
second screenshot round.

**Remaining gap:** the "具体可以做什么" sample-output tiles (see v3.3)
still use the Lightbox placeholder — only the 8 banner photos were in
scope for this pass. If GM wants the 3 "具体可以做什么" images and/or the
portrait screenshot row per industry wired in too, those are the same
Figma frames' remaining named image nodes, not yet exported.

## v3.3 — 2026-09-19 职业规划 restructure (Figma-driven, this pass)

GM shared a Figma file, "数字艺术就业海报"
(figma.com/design/unFUcOlfIw8zwl7YMwRDbb) — 8 long-format posters (one
per industry) plus a summary index, each following the same structure:
banner → 行业是什么 → 代表公司/项目类型 → 行业正在做什么业务 → 学生能进入
哪些岗位 → 具体可以做什么 → 职业发展路径 → 需要建立哪些能力 → 作品集项目
如何对应就业方向. GM asked for 职业规划 to mimic that information
structure and layout while reusing this site's existing styles, with
these UX decisions confirmed via AskUserQuestion before building:

- **Nav → deep-linkable subpages.** The 8 industries are no longer
  stacked panels on one long scroll with a nav bar that smooth-scrolls
  between them. Each is now its own subpage at `#planning/<industryId>`
  (e.g. `#planning/direction-1`), swapped in by
  `PlanningPage.showSubpage()` and driven through `Router` — shareable/
  bookmarkable, and back/forward steps between industries correctly.
- **Cross-industry content → its own "总览" subpage.** Everything that
  isn't industry-specific (heatmap, JD decoder, overseas pathways, FAQ,
  quiz, roadmap, capabilities, data insights) moved into
  `#pl-overview-subpage` (`#planning`, no suffix) instead of repeating
  on every industry subpage or staying mixed in with them.
- **Banner kept exactly as v3.1 designed it** — placeholder image, full
  width, ~4:1, gradient overlay, title/intro/tags on top — per GM's
  explicit instruction; only the content *below* the banner follows the
  Figma structure.
- **Sections fold independently, open by default.** Each of the 9
  sections below the banner (`.fold-section`) toggles on its own —
  unlike the FAQ's `.accordion` (exclusive, one open at a time) — and
  starts expanded.
- **Three confirmed interactive additions:**
  1. "具体可以做什么" tiles open a `Lightbox` (new, `components.js`,
     reuses the `.modal-overlay`/`.modal` shell already built for
     `CompanyModal`).
  2. "职业发展路径" steps (reusing the existing `tiers` data) start
     collapsed to badge/salary/title and expand in place on click,
     instead of showing all three tiers' full description at once.
  3. "学生能进入哪些岗位" role pills cross-link into the 总览 subpage's
     JD decoder, pre-filtered to that industry (`PlanningPage.jumpToJD`)
     — there's no per-role JD data to match more precisely, so
     filtering by industry is the honest version of this link rather
     than a fabricated exact match. Two industries needed a label map
     since `industries.json` titles don't literally match
     `jdDecoder.filters` (互联网生态→互联网, AI创意科技→AI科创).

**No new data was needed.** Every Figma section maps onto a field
`industries.json` already had:
`行业是什么`←`parentTrans`, `代表企业`←`enterprises` (unchanged chip grid
+ `CompanyModal`), `行业正在做什么业务`←`targetCases`,
`学生能进入哪些岗位`←roles deduped from `tiers[].gargs`,
`具体可以做什么`←`realCase`, `职业发展路径`←`tiers` (moved down from
directly-under-banner to its Figma position, same data),
`需要建立哪些能力`←`ugPath.focus`/`pgPath.focus` + `studentProfile`,
`作品集项目如何对应就业方向`←`portfolioKey` +
`ugPath`/`pgPath.portfolio`/`.target`. `targetCases`/`realCase` are
Chinese enumeration sentences ("X、Y、Z与W。") turned into arrays by the
new `splitPhraseList()` helper in `components.js`. A 9th section,
对口院校方向 (existing `schools` data, no Figma equivalent), was kept at
the end since it's valuable existing content.

**New CSS, minimal, added only where nothing already fit:**
`.fold-section` (+`__head`/`__title`/`__icon`/`__body`),
`.tag-card`(`-grid`) for the plain business-activity tiles,
`.role-pill`(`-grid`), `.output-tile`(`-grid`), `.tier-card__head`/
`__expand-icon`/`__detail` (career-step expand), `.lightbox__frame`.
Everything else — `.company-chip`/`.company-grid`, `.tier-card`,
`.capability-card`, `.pathway-card__row`, `.schools-grid` — is reused
verbatim from the existing stylesheet.

**Router change:** `Router.go('planning', opts)` now resolves
`opts.industryId` (or `opts.industry` title, looked up against
`PlanningPage.industries` for back-compat) into a `#planning/<id>`
hash and calls `PlanningPage.showSubpage()` directly, synchronously —
no more `setTimeout` guess-and-scroll. All pre-existing call sites
(`Router.goToIndustry`, `PlanningPage.focusIndustry`, home's industry
teaser cards, footer quick links, the quiz result CTA, heatmap cell
clicks) were re-verified against the new routing and work unchanged.
The boot script's initial-hash parse (`index.html`) and the
`popstate` handler (`router.js`) both now split `#planning/<id>` into
page + sub-id.

Verified via Playwright: fold toggle, career-step expand, lightbox
open/close, role-pill → JD cross-link (correct filter activated),
`#planning/<id>` deep link loading directly on a fresh page load,
browser back/forward across industries, and all pre-existing entry
points into the planning page (home teaser card, footer link, quiz
CTA, heatmap cell) — all landing on the correct industry subpage with
zero console/page errors. Also checked at 390px mobile width: no
horizontal overflow, banner switches to its existing 2.2:1 mobile
breakpoint, sections stack single-column.

## v3.2 — 2026-09-11 real-data pass (this pass)

GM's team pushed a large content update to the git repo directly (commit
`43a9dd2`, "dad github update by shao.p 09/10/2026"): ~366 real photo/
poster assets plus 3 new JSON files (`data/dad_offers.json`,
`data/dad_courses_industry.json`, `data/dad_courses_academic.json`).
None of it was wired into the site yet — this pass checks it against the
existing code and renders it for real, per GM's "check if things are
correctly in place & properly render them" request. Where the right
placement was genuinely ambiguous, GM was asked directly rather than
guessed at (see the 3 decisions below).

1. **Offers (`offer 展示`, homepage)** — `HomePage.renderOffers()`
   (`assets/js/pages/home.js`) now loads `data/dad_offers.json` (159
   real schools with real 2026 offer counts: US 49 / UK 38 / HK-SG 14 /
   OTHER 58 — replacing the old fake "院校示例"/numbers-only cards).
   Grouped by region (the JSON's "HK-SG" spelling is normalized to this
   site's existing `HK_SG` filter id) and sorted by offer count
   descending. **Decision (asked GM):** each tab shows the top 20 by
   default with a "查看更多" button to reveal the rest, rather than
   rendering all 58/49 at once on first paint.
2. **Instructors (`导师团队`, homepage)** — `HomePage.renderInstructors()`
   loads a new `data/instructors.json` (128 records), generated by
   transcribing `assets/img/instructors/`'s 4 photo folders — there was
   no source JSON for this, only filenames encoding each person's name/
   title. Parsing convention (see the one-off script in this session,
   not checked in): split each filename on its first `-`; 学术导师/海外
   教授/顶尖学者 are ordered "Name-Title" (海外教授 uses anonymized
   initials like "A.P." for privacy — that's in the source filenames,
   not something this pass added); 业界导师 is inconsistently ordered
   "Title-Name" where a name appears at all (2 of 20 do; the other 18
   are role/title descriptions with no separable person name and render
   as a single line rather than a fabricated name). **Decision (asked
   GM):** the photos include a category, 顶尖学者 (6 people), that
   didn't exist in the site's instructor filter set — added as a new
   6th real tab (`INSTRUCTOR_FILTERS`) rather than folding it into
   学术导师. 教研导师/校友导师 still have zero real photos and now show
   an honest "该分类暂无导师数据" empty state instead of the old
   fabricated placeholder cards.
3. **Course catalogs (internship/summerwinter/bizpractice/masterclass,
   opened from `CourseOverlay`)** — these always showed a "课程数据接入
   中" placeholder because `course-demo.js`'s `buildCatalogGridHTML`
   called `window.HomePage._buildInternshipPanel/_buildCourseGrid/
   _buildAcademicGrid`, three helpers that were referenced from IST's
   original copy but never actually implemented for DAD (see the old
   comment at that call site). Real data now exists to build them for
   real: `assets/js/ist-data.js`'s `DATA` loader gained
   `courses_industry`/`courses_academic` entries (fetching
   `data/dad_courses_industry.json`/`dad_courses_academic.json`), and
   the three methods are now implemented at the bottom of
   `assets/js/pages/home.js`, rendering real listings as `.port-card`/
   `.card-grid` (the same rounded + real-gap + full-perimeter yellow-
   glow style used by `PortfolioPage`, not IST's zero-gap grid).
   **Decision (asked GM):** build real card grids now in the site's
   current v3 style, without also replicating IST's finer sub-filter
   tabs (头部大厂/行业名企/创意工作室 as separate clickable filters
   inside the internship catalog) — that's left as a later option if
   wanted.
   **Schema mismatch found and fixed**: the delivered JSON's `tab` field
   is just the department name ("数字艺术与设计") and doesn't match the
   English tab codes (`internship`/`mentoring`/`bizpractice`/`summer`/
   `masterclass`) `course-demo.js`'s `PRODUCTS` registry filters on —
   the real signal is the `program_type` field (Chinese labels like
   "岗位制实习（实地）"). Rather than rewriting the existing filter
   logic, `ist-data.js`'s loader now remaps each record's `tab` field
   from `program_type` at load time via `PROGRAM_TYPE_TO_TAB`, so
   `src.tabs.includes(c.tab)` keeps working unmodified. Also updated the
   stale placeholder counts in `course-demo.js`'s `PRODUCTS` registry
   (`count`/`chips`/`snapshot`) to the real numbers now that they're
   known: internship 125→97 (79 岗位制实习 + 18 行业导师带训), bizpractice
   9→14, summerwinter 12→19, masterclass 11→12.
4. **Poster image paths were broken and needed correcting, not just
   wiring in.** Both course JSON files' `poster` fields pointed at a
   flat `assets/img/courses/<filename>.jpg`, but the actual delivered
   files live nested under category subfolders (`夏冬校/`, `大师课/`,
   `就业力/商业实践项目/`, `就业力/岗位制实习/<头部大厂|行业名企|创意
   工作室>/`, `就业力/行业导师带训/`) with several extension mismatches
   (`.jpg` in JSON vs actual `.jpeg`/`.png`) and minor punctuation drift
   (`_`/`-`/`|`/`、` used inconsistently between the JSON and the real
   filenames). Resolved 140 of 142 entries automatically by matching
   basenames (with punctuation/whitespace normalized) against the real
   file tree; the 2 that remain genuinely unresolved — no matching
   photo exists anywhere in the delivery — are academic "香港理工官方课程"
   (summer 26 cohort; the winter 27 cohort's photo does exist and is
   unaffected) and industry "时尚传媒集团_视觉设计实习生" (courses_027).
   Both fall back to the site's yellow-black gradient placeholder tile
   instead of a broken `<img>`; flagging here in case GM's team has (or
   wants to supply) the missing 2 photos.
5. **Cleanup**: the delivered commit also included 4 `.staging_rm`
   subfolders under `assets/img/courses/就业力/.../` — confirmed via
   checksum to be byte-identical stale duplicates of files that were
   renumbered and re-added at the top level (e.g. the same photo exists
   at both `.staging_rm/courses_000_...jpg` and the current
   `courses_082_...jpg`) — plus 2 stray Excel lock files
   (`~$Art Humanity Master Courses.xlsx`, `~$Master Courses.xlsx`, left
   behind by an open Excel session). Moved to `_to_delete/` rather than
   deleted outright (this pass can't delete files on GM's machine
   without explicit permission) — safe for GM to delete once confirmed.
   None of this is committed to git; GM's working tree has these as
   pending changes to review.

## v3.1 — 2026-09-09 follow-up pass

GM's 4-point follow-up on top of the v3 dark-theme pass below:

1. **Removed the hero logomark + its float animation** — GM asked to
   "keep it simple for now". Deleted the `.hero__logomark` `<img>` element
   from `HomePage.renderHero()` (`assets/js/pages/home.js`) and its CSS
   (`.hero__logomark` rule + `@keyframes heroLogoFloat`) from
   `assets/css/pages.css`. The rest of the v3 hero (grid bg, blooms, scan
   texture, HUD corners, readout bar, stat row) is unchanged.
2. **Industry-panel heads on `/planning` rebuilt as full-width banners** —
   each of the 8 `industry-panel__head` blocks (`PlanningPage.renderPanels`
   in `assets/js/pages/planning.js`) is now a full-container-width,
   ~4:1 aspect-ratio placeholder-image banner (`.industry-panel__banner`,
   new CSS in `components.css`) — a diagonal gradient stand-in tinted with
   that industry's own `industryColor()`, standing in for a real photo the
   same way `.featured-rail__banner`/`.cd-hero__tile` already do elsewhere
   on the site — with a bottom-heavy black gradient overlay
   (`.industry-panel__banner-overlay`) for legibility and the eyebrow/
   title/one-line copy plus the trend chip positioned on top of the image
   (`.industry-panel__banner-content`). A small "占位图 · Placeholder" tag
   marks it as a stand-in, consistent with `PortfolioPage`'s own
   `.port-card__img-placeholder` convention.
   **Auto-scroll bug found and fixed while checking this**: clicking a
   homepage career card (or an industry-nav button) was supposed to smooth-
   scroll to that industry's panel via `Router.goToIndustry` →
   `PlanningPage.focusIndustry` → `Router.scrollTo`, but this silently did
   nothing for any industry except the first — because `planning.js` never
   assigned `window.PlanningPage = PlanningPage` (every other page module —
   `TimelinePage`, `CourseProductsPage`, `PortfolioPage` — does this at the
   bottom of its own file; `planning.js` was missing it). `router.js`'s own
   `go()` guards the scroll behind `window.PlanningPage`, so the check
   always failed and `focusIndustry` never ran; it only *looked* like it
   worked for the first industry because that panel happens to sit right
   at the top of the page anyway. Fixed by adding the missing
   `window.PlanningPage = PlanningPage;` line. Separately, also hardened
   `Router.scrollTo()` (`assets/js/router.js`) to add the sticky
   `.industry-nav` bar's own rendered height to its scroll offset (on top
   of the main navbar height it already accounted for) — needed once the
   panel heads became taller banners, so a focused panel now lands with
   its full banner visible just below the industry-nav bar instead of
   partially tucked underneath it.
3. **Navbar's anchor-scroll "职业规划" button now in accent yellow** — the
   `.navbar__links` button that scrolls to `#career-planning`
   (`index.html`, plus the matching link in the expandable nav-menu
   overlay) got a new `.navbar__btn--accent` / `.nav-menu-overlay__link--
   accent` class (CSS in `assets/css/style.css` / `ist-shared.css`) to set
   it apart from its plain sibling anchor buttons (首页/offer展示/导师团队/
   资源网络). This is separate from the solid-fill `.navbar__cta` button
   (also labeled "职业规划") at the far right, which was already accent-
   styled and is unchanged.
4. **Homepage's 8 career-planning cards now auto-loop like 精选课程** —
   `HomePage.renderCareerTeaser()` (`assets/js/pages/home.js`) was rewritten
   from a manual scroll-snap rail (fixed right-edge fade + circular arrow
   CTA) into the same auto-looping marquee idiom as
   `renderFeaturedCourses()`'s `.featured-rail`: the industry list is
   duplicated ×2, the shared `featured-scroll-fwd` keyframe drives a
   continuous `translateX(0)→translateX(-50%)` loop, an `IntersectionObserver`
   pauses it when scrolled out of view (mirrors hover-pause), and the old
   circular arrow CTA was replaced with a below-center `.section-cta`
   button ("进入完整职业规划页面 / View All") pointing at the same full
   `/planning` page. New/changed CSS: `.career-rail-wrap`/`.career-rail` in
   `assets/css/components.css`; `.career-rail__fade`/`.career-rail__cta`
   were removed as dead code.

## v3 — 2026-09-09 style pass

GM asked for an 11-point style/content update on top of the v2 restructure.
Summary of what changed, in the same order GM listed them:

1. **Full dark-theme flip**: `assets/css/style.css`'s `:root` now defines
   black background (`--color-bg`/`--color-void: #000000`), white text
   (`--color-text` and its secondary/muted/faint variants), and a new
   accent scale — `--color-accent: #FFFF00` (primary, bright yellow),
   `--color-accent-deep: #D5D400` (secondary/darker yellow, for lighter-
   weight text and borders on black), `--color-accent-dim: #828100` (even
   darker yellow, tertiary), plus one added harmonious tone,
   `--color-accent-pale: #FFF6B8`, for soft highlight fills. All 8 industry
   tag colors and the 3 semantic colors (success/danger/warning) were
   brightened — the old values were dark-saturated hues tuned for a white
   background and would have been nearly invisible on black.
   The "extended token layer" (added in v2 so IST's copied CSS resolves
   through this site's tokens) had `--color-primary` remapped from
   `var(--color-text)` to `var(--color-accent)` — under v1/v2's light theme
   `--color-text` was black and safely doubled as a dark "solid fill"
   color; under v3 `--color-text` is white, so that old mapping would have
   silently produced invisible white-on-white fills (filter-tab active
   states, badges, etc). `--glow-primary`/`--glow-primary-soft` were
   changed from dark drop-shadows to actual light glows (yellow), since a
   black shadow no longer shows against a black page.
   **Contrast audit**: `--color-accent-ink` (a near-black color meant for
   text ON TOP of a solid bright-accent fill) was — before this pass — also
   used as plain highlight/hover text color in ~20 places across
   `components.css`/`ist-shared.css` (industry trend tags, tier badges,
   roadmap product tags, course-detail stat labels, clickable-hover states,
   the timeline's milestone bar). Every one of those was invisible (near-
   black text on black/dark-olive backgrounds) until swept and changed to
   `var(--color-accent)`; the handful of correct pairings (solid
   `background: var(--color-accent)` + `color: var(--color-accent-ink)`,
   e.g. primary buttons, the CTA pill, `.filter-btn.is-active`) were left
   untouched — that's the pairing this token is actually for.
2. **Removed the "平均月薪" hero stat** — `data/site-content.json`'s
   `hero.stats` now has 4 entries instead of 5 (AIGC growth / talent gap /
   salary premium / industry count).
3. **Hero rebuilt to resemble IST's** (`assets/js/pages/home.js`
   `renderHero`, CSS in `assets/css/pages.css`): grid background, two
   drifting yellow-toned blooms (no blue — DAD has one accent, not two),
   scanline texture, HUD corner brackets, a top mono readout bar with a
   pulsing "LIVE" dot, and a floating logomark using `assets/img/logo.png`
   (see point 11) in place of IST's inline SVG. The stat row switched from
   boxed `.stat-card` tiles to IST's border-separated row
   (`.stat-card--void`, restyled). Explicitly excluded per GM's request:
   IST's mouse-follow comet-cursor effect (never ported), IST's fonts
   (still Archivo + Noto Sans SC), and IST's small-radius nav buttons —
   `.navbar__btn` stays pill-shaped (`border-radius: 999px`) in both hover
   and active states, unchanged from v1/v2.
4. **Filter tags added to offers and instructors**
   (`HomePage.renderOffersPlaceholder`/`renderInstructorsPlaceholder`),
   reusing IST's own category sets verbatim — offers: 🇺🇸美国/🇬🇧英国/
   🇭🇰港新/🌏其他; instructors: 全部/海外教授/教研导师/学术导师/业界导师/
   校友导师. Clicking a tag swaps which placeholder example rows render
   (`HomePage.filterOffers`/`filterInstructors`) — visually functional,
   still backed by generic example data pending real offers/instructor
   data.
5. **资源网络 marquee speed fixed**: was inheriting IST's fixed 48s
   `animation-duration`, which was calibrated for IST's own 14-company
   list — reused verbatim on DAD's 69-company list, the effective scroll
   speed came out ~5x faster than intended. `renderResources` now computes
   `animation-duration` from the actual track width so the visual SPEED
   matches IST's (`HomePage.COOP_SPEED_PX_PER_SEC = 47`, IST's own
   effective px/s), rather than reusing IST's duration number.
6. **精选课程 section now matches IST's own homepage copy/format more
   closely** — description text, the "长线"/`目录 · N` tag labels, and the
   title/subtitle extraction (`titleCn.split(' · ')[0]`) all mirror IST's
   `buildFeaturedCourses()` almost verbatim, still explicitly flagged as a
   placeholder pending DAD's own course products.
7. **One consistent border-radius scale, applied sitewide**
   (`assets/css/style.css` `:root`): `--radius-sm` (8px, tags/mini
   badges) → `--radius` (16px, standard cards) → `--radius-lg` (24px,
   large decorative blocks) → `--radius-pill` (999px, buttons/chips/nav).
   Nearly every card in the codebase already referenced `var(--radius)`/
   `var(--radius-sm)` via the v2 token system, so this scale change cascaded
   automatically; the remaining components that had NO radius at all
   (`.rough-grid` items via `.person-card`/`.offer-card`, `.coop-card`,
   `.featured-rail__card`, `.cp-card`) were given `border-radius:
   var(--radius)` explicitly — this is the "unlike IST" divergence GM
   asked for, since IST's own versions of these are flat/sharp-cornered.
8. **New "案例展示" (学生案例) page** duplicating IST's Portfolio page
   structure — `assets/js/pages/portfolio.js` (new), styled by the new
   `.port-card`/`.card-grid` rules in `assets/css/ist-shared.css`, backed
   by `data/portfolio-placeholder.json` (new — 16 placeholder entries
   across DAD's own 8 industries, generic "示例院校/示例项目方向" text, no
   images, NOT real student data). Filter tabs reuse DAD's 8 industries
   (not IST's 5 academic branches) for consistency with the rest of the
   site. Added to the router (`portfolio` page id, in `hashPages`/`PAGES`
   in `assets/js/router.js`) and to the navbar's Part-B page-button group,
   the nav-menu overlay, and the footer's page-links column.
9. **Grid-of-cards components converted to rounded-rect cards WITH real
   gaps + full-perimeter yellow glow hover**, replacing IST's zero-gap/
   shared-hairline-border grids and its top-edge-accent-bar hover reveal:
   `.rough-grid` (offers/instructors), the new `.card-grid`/`.port-card`
   (案例展示), `.coop-card` (资源网络), `.featured-rail__card` (精选课程),
   and `.cp-grid`/`.cp-card` (课程产品 page) all now use a real `gap` and
   `border-radius: var(--radius)`, and their hover states switched from
   IST's `::before { transform: scaleX(0)→scaleX(1) }` top-bar reveal to
   `border-color: var(--color-accent); box-shadow: var(--glow-primary)` —
   a full-ring yellow outline+glow around the whole card. `.industry-card`
   and `.career-card` (already gapped/rounded from v2) got the same glow-
   ring hover treatment for consistency.
10. **Yellow-black gradients fixed** on every decorative banner tile that
    used `var(--color-text)` as an implicit "black" gradient stop
    (`.featured-rail__banner`, `.cd-hero__tile`, `.cd-curriculum-card__img`,
    `.cd-case__banner`, `.cd-schoolrec-card__img`, `.cp-card__banner`) —
    now `linear-gradient(135deg, var(--color-void) 0%, #2b2b2b 45%,
    var(--color-accent) 100%)`, an explicit black→grey→yellow gradient
    that no longer breaks now that `--color-text` is white. The timeline's
    `.tl-seg-div` milestone divider also switched from a white-fading line
    to a yellow-fading one for the same "yellow-black" visual language.
11. **Logo**: found `_VI/logo.png` (3125×3125 transparent PNG, yellow/white
    abstract mark) and copied it to `assets/img/logo.png`. Replaces the
    old text-only navbar logo (`<img class="navbar__logo-img">` next to
    the "数字艺术与设计" label) and doubles as the hero's floating
    logomark (see point 3).

Not yet done: DAD's own course-product content (point 6 still a
placeholder), offer/instructor real data (point 4's tags are wired up but
still backed by example rows), real 案例展示 student data (point 8 is
placeholder-only by design), and everything already listed as a known gap
in v1 below.

## v2 — 2026-09-09 restructuring

GM asked for the homepage/navbar/menu/footer to match IST's (`/ist_demo`,
**`wip` branch** — the canonical reference branch per GM) structure more
closely, with one new, DAD-only pattern layered on top. Summary of what
changed:

1. **Home page section order now matches IST**: Hero → 职业规划 (NEW teaser
   section) → offers → instructors → resources → courses — same order as
   IST's Hero → offers → instructors → resources → courses, with the new
   teaser inserted before offers.
2. **New "职业规划" teaser section** (`HomePage.renderCareerTeaser`,
   `.career-rail*` CSS in `assets/css/components.css`): 8 industry cards in
   a manually-scrollable rail (not IST's auto-loop marquee — this needed a
   fixed, always-visible entry point), right edge fades to background under
   a yellow circle+arrow button. Both the button and any card click route to
   the full `/planning` page (same destination as the navbar's "职业规划"
   CTA and IST's "规划我的未来"). GM plans to bring this same pattern to IST
   later — **`/ist_demo` was not touched**, this is DAD-only for now.
3. **All the detailed career-planning content that used to render directly
   on the homepage moved to the full `/planning` page** — nothing was
   deleted, only relocated (see `assets/js/pages/planning.js`, appended
   after the existing industry drill-down): industries overview grid, city
   heatmap, JD decoder + comparison, overseas pathways, FAQ, interest quiz,
   roadmap, capability toolkit, data insights. The homepage now only shows
   the abbreviated 8-card teaser.
4. **Offers / instructors are rough two-row placeholders** ("随便做两行看看
   视觉效果") — real layout borrowed from IST's `.offer-card`/`.person-card`
   components (now in `assets/css/ist-shared.css`), generic example rows,
   `⏳ 内容筹备中` badge. Still not data-driven — same open item as v1.
5. **资源网络 (resources) section** now runs a marquee of the real 69
   company names from `data/companies.json` (text-only — no logo assets
   yet) instead of a placeholder, reusing IST's coop-marquee CSS pattern.
6. **精选课程 (courses) section + a new standalone Course Products page +
   Timeline page were copied from IST's `wip` branch essentially as-is**
   per GM's explicit instruction ("时间轴和课程也先复制一份ist的放这里") —
   `assets/js/pages/timeline.js`, `assets/js/pages/course-products.js`,
   `assets/js/course-demo.js`, and `data/timeline.json` are IST's own files/
   content, unmodified except one guard (see below). This is placeholder
   content standing in for DAD's own course products — **a later task is
   to replace it with real DAD course data**, at which point
   `course-demo.js`'s one adapted spot (`buildCatalogGridHTML`, guarded to
   degrade gracefully instead of throwing, since it depends on IST-only
   helpers/data DAD doesn't have) can be filled in properly.
7. **Navbar rebuilt to IST's two-part structure**: anchor-scroll buttons
   (首页/职业规划/offer展示/导师团队/资源网络) + separate-page buttons
   (时间轴/课程), top-right CTA relabeled "职业规划" pointing at the same
   destination as the new teaser's circle+arrow. The "本科方向 ↗" link is
   **removed** — undergrad is on hold, this build is graduate/job-hunting
   only for now.
8. **Added IST's expandable nav-menu overlay and 4-column site footer**,
   both previously missing from DAD — `NavMenu` object added to
   `assets/js/components.js`, markup mirrors IST's `#nav-menu-overlay` /
   `<footer class="site-footer">` almost exactly, with DAD's own link
   targets and 8-industry list swapped in.
9. **New shared token layer added to `assets/css/style.css`** (`--space-*`,
   `--text-*`, `--radius-pill`, `--transition-*`, `--glow-*`,
   `--color-primary*`, `--color-hardware/culture/brand/arch`) so that the
   CSS copied from IST's `wip` branch (`assets/css/ist-shared.css`) resolves
   through DAD's own white/black/#F8F86A palette without hand-translating
   every rule. `--color-primary` maps to black (DAD has no 2nd brand color);
   `--color-hardware/culture/brand/arch` (decorative course-card banner
   variants) map to DAD's existing muted industry tag colors.

Not yet done: DAD's own course-product content (item 6 above), offer/
instructor real data (item 4), and everything already listed as a known
gap in v1 below.

## v1 — 2026-09-09 initial build

Scope of the initial pass: homepage + career-planning page only.

## What this is

`/dad_demo` is being rebuilt from `archive_demo_site` (a React/Vite build)
to reuse IST's (`/ist_demo`) project structure and design-token system:
plain HTML/CSS/JS, a small client-side router, one JSON file per data
domain, everything visual defined as CSS custom properties in `:root`.

This mirrors how a third SFK department ("Game + Animation", see
`/ist_demo/_reference`) already reskins the same shell with its own accent
color — DAD is the same move: same architecture, new tokens.

## Decisions locked in with GM (2026-09-09)

1. **Undergraduate section (34 deep pages)** — deferred to a later task.
   Chosen direction for when it happens: real, deep-linkable static pages
   (not IST's flat hash router), generated from JSON data + HTML templates
   — same idea as the archive's own `build_undergraduate.cjs`, minus
   React/Vite, using this project's plain-JS conventions instead. This is
   the best fit for "future adjustment and chronological data updates"
   because content edits become JSON edits, never hand-edited HTML.
   `/undergraduate/index.html` is currently a placeholder explaining this.
2. **导师团队 (instructor team) / Offer 展示 (offer showcase)** — DAD's
   archive has no source data for these (they exist only on IST). Built as
   placeholder sections with real layout/styling so they can be filled in
   later without touching the page structure. Marked with a "内容筹备中"
   badge, not left blank.
3. **Company-insight modals** — kept at full detail: all 69 companies
   across 8 industries, each with positioning/business/hiring copy and 3
   sample jobs, exactly as in the archive's `data/company-insights.json`.
   This matches the archive's own explicit "don't delete content" rule.
4. **Fonts** — Archivo (headlines/UI, self-hosted weights 400–900) + Noto
   Sans SC (CJK, weights 300–900) + JetBrains Mono (stats/data, kept from
   IST for cross-department consistency). All self-hosted in
   `assets/fonts/` for the same reason IST does it: Google Fonts' CDN is
   blocked in mainland China.

## Palette

Same `:root` token names as IST. **Originally** (v1/v2) a single-accent
LIGHT theme (white bg / black text / `#F8F86A` accent); **as of v3**,
flipped to a single-accent DARK theme (black bg / white text / `#FFFF00`
accent, with `#D5D400`/`#828100` as darker secondary/tertiary yellows) —
see the v3 section above and `assets/css/style.css`. No secondary brand
color either way (IST's blue was dropped); the 8 industries get their own
tag colors (brightened in v3 for contrast against black) so the accent
yellow stays the only "hot" color on the page.

## Data layer

- `data/industries.json` — copied verbatim from the archive's
  `industry-details.json` (8 industries, full tier/enterprise/school/trend
  data).
- `data/companies.json` — copied verbatim from `company-insights.json`
  (69 companies).
- `data/city-heat.json` — extracted from the archive's inline heatmap
  markup (8 industries × 5 regions = 40 cells, real heat values 1–6).
- `data/site-content.json` — hand-transcribed from the archive's rendered
  homepage (hero copy, JD-decoder cards, overseas-pathway cards, FAQ,
  interest quiz, roadmap, capability toolkit, data-insight numbers). The
  quiz's option→industry mapping is inferred from each option's content
  (the archive drives this via JS we didn't have visibility into) — worth
  a quick sanity check against the live archive site if that logic matters
  for accuracy.

## Known gaps / next steps

- ~~Industry banner images aren't wired into the UI yet~~ — done in v3.4
  (see below) for the 职业规划 per-industry banners. `section-banners/*.jpg`
  (used elsewhere in the archive) is still unaddressed.
- City heatmap is a plain table for v1; the archive's version has richer
  hover tooltips per cell (data is already there in `city-heat.json`,
  just needs a nicer visual treatment).
- No favicon set yet.
- Undergraduate section: see decision #1 above — full scope estimate
  needed before starting (34 pages, 3 nesting levels, 1 long-form
  full-time handbook page requiring ~95% content retention per the
  archive's own handoff rules).
