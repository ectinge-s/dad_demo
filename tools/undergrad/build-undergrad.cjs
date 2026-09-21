#!/usr/bin/env node
/* ═══════════════════════════════════════════
   BUILD — 本科站 (undergraduate site) generator.

   Ported from the handoff project's build_undergraduate.cjs and rewired
   to the graduate site's layout, so the undergraduate site can be
   regenerated inside dad_demo/ without touching any graduate-site file.

   Source of truth (all inside the undergraduate folder, all named
   `undergrad*`):
     undergrad/data/undergrad-content.json              ↓ homepage copy
     undergrad/data/undergrad-pages.json                ↓ 34 detail pages
     undergrad/data/undergrad-full-time-handbook.json   ↓ handbook layout
     tools/undergrad/templates/{main,detail}.template.html

   Output:
     undergrad/index.html                               (35 pages total)
     undergrad/<route>/index.html  × 34
     undergrad/data/site/undergrad-content.json         ← browser payload
                                                           for the homepage
                                                           (paths resolved)

   Path policy: every emitted link/asset URL is RELATIVE to the page
   that carries it, so the whole undergrad/ folder can be moved or
   renamed without rewriting anything (`prefixOf(route)` — the number of
   `../` back to undergrad/'s own root) — EXCEPT the handful of assets
   that are genuinely shared with the graduate site (web fonts, the
   cross-site switcher script, the favicon set): those resolve one level
   further up, into dad_demo/assets/, via `rootOf(route)`/`__ROOT__`
   (v3.37, GM: "they may share some assets... don't duplicate"). This is
   a deliberate trade — undergrad/ is no longer movable independently of
   dad_demo/ — made to stop shipping/maintaining two copies of the same
   ~11MB of font files (see PROJECT_NOTES.md v3.37 for the full context).
   Everything undergrad-specific (undergrad.css, undergrad-home.js,
   undergrad-detail.js) still lives under undergrad/assets/ and still
   uses the plain __PREFIX__/prefixOf() relative path.

   Run:  node tools/undergrad/build-undergrad.cjs
   (本机 node: ~/.nvm/versions/node/v24.16.0/bin/node)
═══════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const TOOLS_DIR = __dirname;
const ROOT = path.resolve(TOOLS_DIR, '..', '..');        // dad_demo/
const UG_DIR = path.join(ROOT, 'undergrad');
const DATA_DIR = path.join(UG_DIR, 'data');
const TPL_DIR = path.join(TOOLS_DIR, 'templates');
const SITE_DATA_DIR = path.join(DATA_DIR, 'site');

const MAIN_TPL = fs.readFileSync(path.join(TPL_DIR, 'main.template.html'), 'utf8');
const DETAIL_TPL = fs.readFileSync(path.join(TPL_DIR, 'detail.template.html'), 'utf8');
const content = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'undergrad-content.json'), 'utf8'));
const pageData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'undergrad-pages.json'), 'utf8'));
const fullTimeContent = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'undergrad-full-time-handbook.json'), 'utf8'));

const pageById = new Map(pageData.pages.map(page => [page.id, page]));
const SRC_PREFIX = '/undergraduate/';

/* ── path helpers ───────────────────────────────────────────── */
function depthOf(route) {
  const parts = String(route || '').split('/').filter(Boolean);
  return parts.length;
}
/** `../` × depth — from the page's own folder back to undergrad/ */
function prefixOf(route) {
  return '../'.repeat(depthOf(route));
}
/** The undergrad root URL as seen from that page */
function homeOf(route) {
  return prefixOf(route) || './';
}
/** The graduate site entry (dad_demo/index.html) as seen from that page */
function graduateOf(route) {
  return prefixOf(route) + '../index.html';
}
/** v3.37 (GM): dad_demo/assets/ — the graduate site's asset folder — is
    now the shared home for anything genuinely common to both sites
    (web fonts, the cross-site switcher), so undergrad no longer keeps
    its own duplicate copies of them. One `../` further up than
    `prefixOf()` (which only reaches back to undergrad/'s own root). This
    does mean undergrad/ is no longer independently relocatable outside
    dad_demo/ (see this file's header) — an intentional trade for not
    shipping/maintaining two copies of the same 11MB of font files. */
function rootOf(route) {
  return '../'.repeat(depthOf(route) + 1);
}
/** Rewrite a source-site absolute path (/undergraduate/…) into a
    relative one for the page at `route`. Anything else (http, data:,
    relative, ordinary prose) is returned untouched. */
function resolvePath(value, route) {
  if (typeof value !== 'string' || value.indexOf(SRC_PREFIX) !== 0) return value;
  if (value === SRC_PREFIX || value === SRC_PREFIX.replace(/\/$/, '')) return homeOf(route);
  return prefixOf(route) + value.slice(SRC_PREFIX.length);
}
/** Deep-map every string in a JSON tree through resolvePath. */
function resolveTree(node, route) {
  if (typeof node === 'string') return resolvePath(node, route);
  if (Array.isArray(node)) return node.map(item => resolveTree(item, route));
  if (node && typeof node === 'object') {
    const out = {};
    Object.keys(node).forEach(key => { out[key] = resolveTree(node[key], route); });
    return out;
  }
  return node;
}

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function writeIfChanged(filePath, nextContent) {
  const previous = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  if (previous === nextContent) return false;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, nextContent);
  return true;
}

/* ── validation — same guarantees as the handoff build script ── */
function validate() {
  ['directions', 'pathways', 'outputs', 'profiles', 'advantages', 'products'].forEach(key => {
    if (!Array.isArray(content[key]) || content[key].length === 0) {
      throw new Error(`Undergraduate content collection is empty: ${key}`);
    }
  });
  if (!Array.isArray(pageData.navigation) || !Array.isArray(pageData.pages)) {
    throw new Error('Undergraduate page navigation and page collections are required.');
  }
  if (pageById.size !== pageData.pages.length) {
    throw new Error('Undergraduate detail page IDs must be unique.');
  }
  const routes = new Set();
  pageData.pages.forEach(page => {
    if (!page.id || !page.route || !page.title || !page.heroImage || !Array.isArray(page.sections)) {
      throw new Error(`Incomplete undergraduate detail page: ${page.id || page.route || 'unknown'}`);
    }
    if (routes.has(page.route)) throw new Error(`Duplicate undergraduate route: ${page.route}`);
    routes.add(page.route);
    if (page.parent) resolvePage(page.parent, 'parent', page.id);
    (page.children || []).forEach(id => resolvePage(id, 'child', page.id));
    (page.related || []).forEach(id => resolvePage(id, 'related', page.id));
  });

  const fullTimePage = pageById.get('pathways/full-time');
  if (!fullTimePage || fullTimePage.layout !== 'full-time-handbook') {
    throw new Error('Full-time handbook page must use the dedicated handbook layout.');
  }
  if (!Array.isArray(fullTimeContent.sections) || fullTimeContent.sections.length !== fullTimePage.sections.length) {
    throw new Error('Full-time handbook section metadata and content must stay aligned.');
  }
  fullTimePage.sections.forEach((section, index) => {
    const contentSection = fullTimeContent.sections[index];
    if (section.id !== contentSection.id || section.title !== contentSection.title) {
      throw new Error(`Full-time handbook section mismatch at position ${index + 1}.`);
    }
  });
}
function resolvePage(id, relationship, owner) {
  const page = pageById.get(id);
  if (!page) throw new Error(`Unknown ${relationship} page "${id}" referenced by "${owner}"`);
  return page;
}

/* ── homepage browser payload ────────────────────────────────────
   Resolved at depth 0 (the payload is only ever read by
   undergrad/index.html). `officialSources` is maintenance-only data
   and stays out of the shipped payload, as in the handoff build. */
function buildBrowserContent() {
  const resolved = resolveTree(content, '');
  delete resolved.officialSources;

  const detailLinks = {
    sections: Object.fromEntries(ACTIVE_NAVIGATION.map(item => [item.id, resolvePath(item.route, '')])),
    directions: {
      us: 'directions/us/',
      uk: 'directions/uk/',
      hk: 'directions/hong-kong/',
    },
    pathways: Object.fromEntries(content.pathways.map(item => [item.id, `pathways/${item.id}/`])),
    outputs: {
      '3d': 'capabilities/3d-virtual/',
      performance: 'capabilities/media-installation/',
      material: 'capabilities/media-installation/',
      mechanical: 'capabilities/creative-tech/',
      wearable: 'capabilities/media-installation/',
      sound: 'capabilities/media-installation/',
      experimental: 'capabilities/media-installation/',
      audiovisual: 'capabilities/creative-tech/',
      brand: 'capabilities/visual-strategy/',
      information: 'capabilities/information-experience/',
      book: 'capabilities/visual-strategy/',
      web: 'capabilities/information-experience/',
    },
    profiles: Object.fromEntries(content.profiles.map(item => [item.id, `fit/${item.id}/`])),
    products: {
      'nyu-summer': 'works/summer-school/',
      'works-25-1': 'works/portfolio/',
      'works-25-2': 'works/portfolio/',
      'works-26': 'works/portfolio/',
    },
  };

  return Object.assign({}, resolved, { detailLinks });
}

/* ── detail page renderers (ported, now prefix-aware + .fade-up) ── */
function renderHeroMedia(page, prefix) {
  const alt = page.layout === 'full-time-handbook'
    ? fullTimeContent.heroAlt
    : `${page.shortTitle}相关学生作品画面`;
  const hero = escapeHTML(resolvePath(page.heroImage, page.route));
  if (page.heroMobileImage) {
    return `
      <picture class="hero-media">
        <source media="(max-width: 700px)" srcset="${escapeHTML(resolvePath(page.heroMobileImage, page.route))}">
        <img src="${hero}" alt="${escapeHTML(alt)}" width="1960" height="1104" fetchpriority="high">
      </picture>
    `;
  }
  return `<img src="${hero}" alt="${escapeHTML(alt)}" width="1800" height="1125" fetchpriority="high">`;
}

function renderFacts(page) {
  return (page.facts || []).map(fact => `
    <div class="hero-fact">
      <strong>${escapeHTML(fact.value)}</strong>
      <span>${escapeHTML(fact.label)}</span>
    </div>
  `).join('');
}

/* ── SHARED NAVBAR / NAV-MENU-OVERLAY / FOOTER ────────────────────
   v3.38 (GM): unified what used to be TWO different navbars (the
   homepage's own `.section-nav`, autoscroll-only, and every detail
   page's separate `.topic-nav`, page-links-only) into ONE navbar used
   on every undergraduate page, built from the exact same
   `.navbar`/`.navbar__inner`/`.navbar__logo`/`.navbar__links`/
   `.navbar__btn`/`.navbar__divider`/`.navbar__menu-toggle` markup and
   `assets/css/site-chrome.css` styling as the graduate site, driven
   from the SAME single data source (`pageData.navigation`,
   undergrad-pages.json) for both the homepage and every detail page.

   v3.39 (GM): "the navbar should only have: homepage | all other
   separate pages buttons. take out homepage autoscroll buttons
   altogether." Every one of the 5 topic sections (申请方向/升学路径/
   五大能力/学生适配/专业优势) now has a real, content-rich hub page of
   its own (see the overlay system below), so the navbar's old
   anchor-scroll group — which used to jump to that section's spot on
   the homepage — is gone. All 7 nav items (5 topics + 作品图册 +
   学生案例) render identically now: one flat list of real page links,
   home first. TOPIC_NAV_IDS is kept only to group items visually in
   the nav-menu overlay and footer (a page-link vs. no distinction is
   still a useful "core topics vs. galleries" grouping for a sitemap),
   never to change what a link points at. */
const TOPIC_NAV_IDS = ['directions', 'pathways', 'capabilities', 'fit', 'advantages'];

/* ── v3.39 (GM) — TOPIC WIDGET + CONTENT OVERLAY ───────────────────
   GM: "missing nested 申请方向/升学路径/五大能力/学生适配/专业优势 page...
   these all have a homepage section and each of their own detailed
   page (separate)... however nothing under 升学路径page can directly
   link to 英本全日制page, which is a crazy deadend UX flow."

   Fix: the interactive widget that used to live ONLY on the homepage
   (tabs/accordion/filter-grid/profile-picker/advantage-list — see
   undergrad-home.js) now renders at the TOP of its own hub page
   instead (assets/js/undergrad-topic.js, ported from home.js), and
   the homepage keeps only a simplified title+intro+CTA band per
   topic (main.template.html). Every one of the widget's per-item
   "查看完整..." links, which used to point at a real leaf-page URL,
   now opens that leaf's content in a same-page overlay instead
   (Overlay.open(childId) in undergrad-topic.js) — so from ANY of the
   4 hub pages with children, every leaf is one click away, no dead
   end. This mirrors the graduate site's own CourseOverlay pattern
   (assets/js/course-demo.js): purely data-driven from an in-memory
   payload, no separate URL for the leaf's content.

   TOPIC_WIDGET_IDS: hub pages that render the widget at all (all 5 —
   advantages has no children, so it gets the widget but no overlay).
   OVERLAY_HUB_IDS: the subset whose widget items open the overlay
   (the 4 with children). OVERLAY_LEAF_IDS: every one of THOSE
   children's ids — these 15 pages stop being generated as their own
   standalone routes (see the page-generation loop below); their
   content lives only inside their hub page's overlay payload now. */
const TOPIC_WIDGET_IDS = ['directions', 'pathways', 'capabilities', 'fit', 'advantages'];
const OVERLAY_HUB_IDS = ['directions', 'pathways', 'capabilities', 'fit'];

/* GM (follow-up): "作品图册page下的本科夏校、作品集合集两个card点开也做成
   overlay而不是独立page" — works has no topic widget of its own (it never
   had a homepage section), so its existing renderChildren() "NEXT LEVEL"
   card grid IS its primary navigation — unlike OVERLAY_HUB_IDS, that
   grid stays rendered here, its cards just open the overlay instead of
   navigating (see renderChildren()'s overlayMode branch below). GM
   named only 学生案例's sibling, 作品图册 (works) — cases keeps its own
   real pages for now (and is separately disabled below regardless). */
const OVERLAY_CHILDREN_IDS = ['works'];
/* Every page whose OWN markup can open the overlay (topic-widget hubs +
   children-grid pages) — used to gate the overlay shell/payload script,
   which only needs to exist once per page regardless of which of the
   two triggers put it there. */
const OVERLAY_SHELL_IDS = [...OVERLAY_HUB_IDS, ...OVERLAY_CHILDREN_IDS];
const OVERLAY_LEAF_IDS = new Set(
  OVERLAY_SHELL_IDS.flatMap(id => (pageById.get(id).children || []))
);

/* GM (follow-up): "暂时拿掉整个'学生案例'部分" — temporarily pull 学生案例
   or wholesale, keeping the underlying data untouched in
   undergrad-pages.json (nothing deleted, nothing renumbered) so it can
   come back later just by emptying this array. Removes the nav entry
   (navbar/overlay-menu/footer/homepage depth-nav) and stops generating
   every page in its family (cases + its 3 sub-sections + their 7
   individual case studies — collectFamily() below walks the whole
   subtree so nothing has to be listed by hand). */
const DISABLED_NAV_IDS = ['cases'];
function collectFamily(id) {
  const page = pageById.get(id);
  return [id, ...(page.children || []).flatMap(collectFamily)];
}
const DISABLED_PAGE_IDS = new Set(DISABLED_NAV_IDS.flatMap(collectFamily));
const ACTIVE_NAVIGATION = pageData.navigation.filter(item => !DISABLED_NAV_IDS.includes(item.id));

/** The widget container markup for a hub page — identical element ids
    to what main.template.html used to embed directly, so
    undergrad-topic.js (ported from undergrad-home.js) can bind to them
    unchanged. Wrapped in [data-topic-widget] so the script can tell,
    cheaply, whether this page has a widget at all before it fetches
    undergrad-content.json. */
function renderTopicWidget(page) {
  if (!TOPIC_WIDGET_IDS.includes(page.id)) return '';
  const inner = {
    directions: `
      <div class="segment-control" id="direction-tabs" role="tablist" aria-label="国家和地区"></div>
      <div id="direction-panel" role="tabpanel" aria-live="polite"></div>
    `,
    pathways: `<div class="pathway-list" id="pathway-list"></div>`,
    capabilities: `
      <div class="segment-control" id="output-filters" aria-label="能力类别筛选">
        <button type="button" data-output-filter="all" aria-pressed="true">全部产出</button>
        <button type="button" data-output-filter="art-tech" aria-pressed="false">艺术与科技</button>
        <button type="button" data-output-filter="brand" aria-pressed="false">品牌与平面</button>
      </div>
      <div class="output-grid" id="output-grid"></div>
    `,
    fit: `
      <div class="profile-grid" id="profile-grid"></div>
      <div class="profile-result" id="profile-result" aria-live="polite"></div>
    `,
    advantages: `<div class="advantage-list" id="advantage-list"></div>`,
  }[page.id];

  return `
    <section class="band topic-widget" aria-label="${escapeHTML(page.title)}速览">
      <div class="container" data-topic-widget="${escapeHTML(page.id)}">
        ${inner}
      </div>
    </section>
  `;
}

/** The overlay shell markup — a single, empty, data-driven "quick
    look" modal per page that needs one (OVERLAY_SHELL_IDS: the 4
    topic-widget hubs plus `works`; other pages get '' and no modal at
    all). Its body is filled at runtime by undergrad-topic.js's
    Overlay.open() from the JSON payload embedded by
    renderOverlayPayloadScript() below. */
function renderOverlayShell(page) {
  if (!OVERLAY_SHELL_IDS.includes(page.id)) return '';
  return `
    <div id="content-overlay" class="content-overlay" aria-hidden="true">
      <div class="content-overlay__backdrop" data-overlay-close></div>
      <div class="content-overlay__panel" role="dialog" aria-modal="true" aria-label="${escapeHTML(page.shortTitle)}详情">
        <button type="button" class="content-overlay__close" data-overlay-close aria-label="关闭详情">
          <span aria-hidden="true">&times;</span>
        </button>
        <div class="content-overlay__body" id="content-overlay-body"></div>
      </div>
    </div>
  `;
}

/** Renders one leaf page's full content as an HTML fragment for
    embedding inside its hub page's overlay — reusing the exact same
    section renderers as a real standalone page would, so the overlay
    is never thinner than the old dead-end page was. Two adjustments
    versus a normal detail page:
    · path resolution uses the HUB's route, not the leaf's own route
      (`overlayPage`), since the fragment is physically embedded in
      the hub page's document;
    · every `id="section-N"`/`id="section-title-N"` (and the
      `aria-labelledby`s that reference them) is prefixed per-leaf
      (`ov-<slug>-section-…`) so multiple leaves' fragments — all
      eventually available on the same hub page — can never collide. */
function renderOverlayFragment(childId, hubPage) {
  const leafPage = resolvePage(childId, 'child', hubPage.id);
  const overlayPage = Object.assign({}, leafPage, { route: hubPage.route });
  const isHandbook = leafPage.layout === 'full-time-handbook';
  const sections = isHandbook ? fullTimeContent.sections : leafPage.sections;
  const renderer = isHandbook
    ? renderHandbookSection
    : leafPage.layout === 'acg-editorial' ? renderAcgSection : renderSection;

  const html = `
    <div class="overlay-hero">
      <p class="overlay-hero__eyebrow">${escapeHTML(leafPage.eyebrow)}</p>
      <h2 class="overlay-hero__title">${escapeHTML(leafPage.title)}</h2>
      <p class="overlay-hero__lead">${escapeHTML(leafPage.lead)}</p>
      <div class="hero-facts">${renderFacts(leafPage)}</div>
    </div>
    <div class="detail-article overlay-article">
      ${sections.map((section, index) => renderer(section, index, overlayPage)).join('')}
    </div>
  `;

  const slug = childId.replace(/\//g, '-');
  return html.replace(/section-(?=title-|\d)/g, `ov-${slug}-section-`);
}

/** `{ [childId]: htmlFragment }` for every child of a hub page. */
function renderOverlayPayload(page) {
  const payload = {};
  (page.children || []).forEach(childId => {
    payload[childId] = renderOverlayFragment(childId, page);
  });
  return payload;
}

/** The `<script type="application/json">` block carrying that payload
    — '' for any page without an overlay. `<` is escaped to `<`
    so nothing inside the leaf content (there is no user input here,
    but this is cheap insurance) can break out of the script tag. */
function renderOverlayPayloadScript(page) {
  if (!OVERLAY_SHELL_IDS.includes(page.id)) return '';
  const json = JSON.stringify(renderOverlayPayload(page)).replace(/</g, '\\u003c');
  return `<script type="application/json" id="overlay-payload">${json}</script>`;
}

/** route: '' for the homepage itself, otherwise page.route. currentNavId:
    the active nav.id (page.nav on a detail page; 'home' on the homepage,
    which has no matching nav item and is handled separately below). */
function renderNavbarLinks(route, currentNavId) {
  const isHome = route === '';
  const homeLink = `<a class="navbar__btn${isHome ? ' is-active' : ''}" href="${isHome ? '#hero-root' : escapeHTML(homeOf(route))}">首页</a>`;

  const links = ACTIVE_NAVIGATION.map(item => {
    const active = item.id === currentNavId ? ' is-active' : '';
    return `<a class="navbar__btn${active}" href="${escapeHTML(resolvePath(item.route, route))}">${escapeHTML(item.label)}</a>`;
  }).join('');

  return `${homeLink}<span class="navbar__divider" aria-hidden="true"></span>${links}`;
}

/** Same visual two-column overlay as before (works/cases on the
    left/primary, the 5 topic pages + 首页 on the right/secondary) —
    see assets/css/site-chrome.css — but every link is now a real page
    href (resolvePath), never an in-page anchor. */
function renderNavOverlay(route, currentNavId) {
  const topicItems = ACTIVE_NAVIGATION.filter(item => TOPIC_NAV_IDS.includes(item.id));
  const pageItems = ACTIVE_NAVIGATION.filter(item => !TOPIC_NAV_IDS.includes(item.id));
  const isHome = route === '';

  const pageLinks = pageItems.map(item => {
    const active = item.id === currentNavId ? ' aria-current="page"' : '';
    return `<a class="nav-menu-overlay__link nav-menu-overlay__link--page"${active} href="${escapeHTML(resolvePath(item.route, route))}">${escapeHTML(item.label)}</a>`;
  }).join('');

  const homeLink = `<a class="nav-menu-overlay__link"${isHome ? ' aria-current="page"' : ''} href="${isHome ? '#hero-root' : escapeHTML(homeOf(route))}">首页</a>`;
  const topicLinks = topicItems.map(item => {
    const active = item.id === currentNavId ? ' aria-current="page"' : '';
    return `<a class="nav-menu-overlay__link"${active} href="${escapeHTML(resolvePath(item.route, route))}">${escapeHTML(item.label)}</a>`;
  }).join('');

  return `
    <div class="nav-menu-overlay__inner">
      <div class="nav-menu-overlay__row">
        <div class="nav-menu-overlay__col nav-menu-overlay__col--primary">
          ${pageLinks}
        </div>
        <span class="nav-menu-overlay__div" aria-hidden="true"></span>
        <div class="nav-menu-overlay__col nav-menu-overlay__col--secondary">
          ${homeLink}${topicLinks}
        </div>
      </div>
    </div>
  `;
}

/** The graduate site's own `.site-footer` structure (item 4: "use
    similar footer... as the grad site"), populated with the
    undergraduate site's own pages/sections/topics instead of grad's
    industries — built from the same `pageData.navigation` source as
    the navbar above, so it can't drift out of sync with it either. */
function renderFooter(route) {
  const isHome = route === '';
  const pageItems = ACTIVE_NAVIGATION.filter(item => !TOPIC_NAV_IDS.includes(item.id));
  const topicItems = ACTIVE_NAVIGATION.filter(item => TOPIC_NAV_IDS.includes(item.id));

  const pagesCol = [
    `<a href="${isHome ? '#hero-root' : escapeHTML(homeOf(route))}"><strong>首页</strong><span class="u-en">Home</span></a>`,
    ...pageItems.map(item => `<a href="${escapeHTML(resolvePath(item.route, route))}"><strong>${escapeHTML(item.label)}</strong></a>`),
  ].join('\n        ');

  const sectionsCol = topicItems.map(item =>
    `<a href="${escapeHTML(resolvePath(item.route, route))}"><strong>${escapeHTML(item.label)}</strong></a>`
  ).join('\n        ');

  const graduateEntry = escapeHTML(route === '' ? '../index.html' : graduateOf(route));

  return `
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="site-footer__brand">
        <div>
          <div class="site-footer__brand-name"><span class="u-en">SFK</span>数字艺术与设计 · 本科</div>
          <p class="site-footer__brand-desc">从真实兴趣出发，用作品与项目建立通向升学与职业的个人路径 — 申请方向、升学路径、能力体系与学生案例，一站呈现。</p>
        </div>
      </div>
      <div class="site-footer__grid">
        <div class="site-footer__col">
          <h2 class="site-footer__col-title">页面导航<span class="u-en">Pages</span></h2>
          ${pagesCol}
        </div>
        <div class="site-footer__col">
          <h2 class="site-footer__col-title">专业板块<span class="u-en">Sections</span></h2>
          ${sectionsCol}
        </div>
        <div class="site-footer__col">
          <h2 class="site-footer__col-title">站点切换<span class="u-en">Sites</span></h2>
          <a href="${graduateEntry}"><strong>研究生站 · 行业就业方向</strong><span class="u-en">Graduate Site</span></a>
        </div>
        <div class="site-footer__col">
          <h2 class="site-footer__col-title">规划咨询<span class="u-en">Get in Touch</span></h2>
          <p class="site-footer__contact"><span class="u-en">Email</span>admissions@sfk-edu.demo</p>
          <p class="site-footer__contact"><span class="u-en">Tel</span>400-000-0000</p>
          <p class="site-footer__contact">上海市 · 校区地址待定</p>
        </div>
      </div>
    </div>
    <div class="site-footer__bottom">
      <p>© <span id="footer-year"></span> SFK 数字艺术与设计科系 · 本页面为课程与案例演示站点，数据仅供展示</p>
    </div>
  </footer>`;
}

function renderBreadcrumbs(page) {
  const ancestors = [];
  const visited = new Set([page.id]);
  let parentId = page.parent;
  while (parentId) {
    if (visited.has(parentId)) throw new Error(`Circular breadcrumb hierarchy at ${page.id}`);
    visited.add(parentId);
    const parent = resolvePage(parentId, 'parent', page.id);
    ancestors.unshift(parent);
    parentId = parent.parent;
  }

  const parts = [`<a href="${escapeHTML(homeOf(page.route))}">本科方向</a>`];
  ancestors.forEach(parent => {
    parts.push('<span aria-hidden="true">/</span>');
    parts.push(`<a href="${escapeHTML(resolvePath(`/undergraduate/${parent.route}/`, page.route))}">${escapeHTML(parent.shortTitle)}</a>`);
  });
  parts.push('<span aria-hidden="true">/</span>');
  parts.push(`<strong aria-current="page">${escapeHTML(page.shortTitle)}</strong>`);
  return parts.join('');
}

function renderItems(items) {
  if (!items?.length) return '';
  return `
    <div class="content-items">
      ${items.map(item => `
        <article class="content-item fade-up">
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.text)}</p>
          ${item.meta ? `<span>${escapeHTML(item.meta)}</span>` : ''}
        </article>
      `).join('')}
    </div>
  `;
}

function renderList(items) {
  if (!items?.length) return '';
  return `<ul class="content-list">${items.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`;
}

function renderSteps(steps) {
  if (!steps?.length) return '';
  return `
    <ol class="process-steps">
      ${steps.map(step => `
        <li class="fade-up">
          <h3>${escapeHTML(step.title)}</h3>
          <p>${escapeHTML(step.text)}</p>
        </li>
      `).join('')}
    </ol>
  `;
}

function renderSection(section, index, page) {
  const body = (section.body || []).map(paragraph => `<p>${escapeHTML(paragraph)}</p>`).join('');
  const quote = section.quote ? `<blockquote class="section-quote">${escapeHTML(section.quote)}</blockquote>` : '';
  const image = section.image ? `
    <figure class="section-image">
      <img src="${escapeHTML(resolvePath(section.image, page.route))}" alt="${escapeHTML(section.title)}相关课堂或作品画面" width="1600" height="900" loading="lazy">
      <figcaption>${escapeHTML(section.title)} · 课堂与作品过程画面</figcaption>
    </figure>
  ` : '';

  return `
    <section class="content-section fade-up" id="section-${index + 1}" aria-labelledby="section-title-${index + 1}">
      <p class="section-kicker">${escapeHTML(section.kicker)}</p>
      <h2 id="section-title-${index + 1}">${escapeHTML(section.title)}</h2>
      ${body ? `<div class="section-body">${body}</div>` : ''}
      ${renderItems(section.items)}
      ${renderList(section.list)}
      ${renderSteps(section.steps)}
      ${quote}
      ${image}
    </section>
  `;
}

function renderAcgGallery(gallery, modifier = '', page) {
  if (!gallery?.length) return '';
  const modifierClass = modifier ? ` acg-gallery--${modifier}` : '';
  return `
    <div class="acg-gallery${modifierClass}">
      ${gallery.map(item => `
        <figure class="acg-figure">
          <img src="${escapeHTML(resolvePath(item.src, page.route))}" alt="${escapeHTML(item.alt || '')}" width="1600" height="900" loading="lazy">
          ${item.caption ? `<figcaption>${escapeHTML(item.caption)}</figcaption>` : ''}
        </figure>
      `).join('')}
    </div>
  `;
}

function renderAcgVisualGroups(groups, page) {
  if (!groups?.length) return '';
  return `
    <div class="acg-visual-groups">
      ${groups.map((group, index) => `
        <section class="acg-visual-group" aria-labelledby="acg-group-${index + 1}">
          <header>
            <span>${escapeHTML(group.index || String(index + 1).padStart(2, '0'))}</span>
            <div>
              <h3 id="acg-group-${index + 1}">${escapeHTML(group.title)}</h3>
              ${group.text ? `<p>${escapeHTML(group.text)}</p>` : ''}
            </div>
          </header>
          ${renderAcgGallery(group.gallery, 'compact', page)}
        </section>
      `).join('')}
    </div>
  `;
}

function renderAcgSection(section, index, page) {
  const body = (section.body || []).map(paragraph => `<p>${escapeHTML(paragraph)}</p>`).join('');
  return `
    <section class="content-section acg-section acg-section--${index + 1} fade-up" id="section-${index + 1}" aria-labelledby="section-title-${index + 1}">
      <div class="acg-section-inner">
        <header class="acg-section-heading">
          <div>
            <p class="section-kicker">${escapeHTML(section.kicker)}</p>
            <h2 id="section-title-${index + 1}">${escapeHTML(section.title)}</h2>
          </div>
          ${body ? `<div class="section-body">${body}</div>` : ''}
        </header>
        ${renderItems(section.items)}
        ${renderList(section.list)}
        ${renderAcgVisualGroups(section.visualGroups, page)}
        ${section.quote ? `<blockquote class="section-quote">${escapeHTML(section.quote)}</blockquote>` : ''}
        ${renderAcgGallery(section.gallery, '', page)}
      </div>
    </section>
  `;
}

/* ── handbook-layout renderers (full-time) ── */
function renderHandbookStats(stats) {
  if (!stats?.length) return '';
  return `
    <dl class="handbook-stats">
      ${stats.map(stat => `
        <div>
          <dt>${escapeHTML(stat.value)}</dt>
          <dd>${escapeHTML(stat.label)}</dd>
        </div>
      `).join('')}
    </dl>
  `;
}

function renderHandbookTags(tags) {
  if (!tags?.length) return '';
  return `<ul class="handbook-tags">${tags.map(tag => `<li>${escapeHTML(tag)}</li>`).join('')}</ul>`;
}

function renderHandbookCards(cards) {
  if (!cards?.length) return '';
  return `
    <div class="handbook-cards">
      ${cards.map(card => `
        <article class="handbook-card fade-up">
          ${card.eyebrow ? `<p class="handbook-card-kicker">${escapeHTML(card.eyebrow)}</p>` : ''}
          <h3>${escapeHTML(card.title)}</h3>
          ${card.text ? `<p>${escapeHTML(card.text)}</p>` : ''}
          ${renderHandbookTags(card.tags)}
        </article>
      `).join('')}
    </div>
  `;
}

function renderHandbookBullets(items, className = 'handbook-list') {
  if (!items?.length) return '';
  return `<ul class="${className}">${items.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`;
}

function renderHandbookSteps(steps) {
  if (!steps?.length) return '';
  return `
    <ol class="handbook-steps">
      ${steps.map(step => `
        <li class="fade-up">
          <span class="handbook-step-number" aria-hidden="true"></span>
          <div>
            <h3>${escapeHTML(step.title)}</h3>
            <p>${escapeHTML(step.text)}</p>
            ${renderHandbookBullets(step.bullets, 'handbook-step-points')}
          </div>
        </li>
      `).join('')}
    </ol>
  `;
}

function renderHandbookImage(image, alt, caption = '', display = 'photo', page) {
  if (!image) return '';
  const displayClass = ['photo', 'board', 'portrait'].includes(display) ? display : 'photo';
  return `
    <figure class="handbook-image handbook-image--${displayClass}">
      <img src="${escapeHTML(resolvePath(image, page.route))}" alt="${escapeHTML(alt || '')}" width="1500" height="1000" loading="lazy">
      ${caption ? `<figcaption>${escapeHTML(caption)}</figcaption>` : ''}
    </figure>
  `;
}

function renderHandbookGallery(gallery, sectionId, page) {
  if (!gallery?.length) return '';
  return `
    <div class="handbook-gallery handbook-gallery--${escapeHTML(sectionId)}">
      ${gallery.map(item => renderHandbookImage(item.src, item.alt, item.caption, item.display, page)).join('')}
    </div>
  `;
}

function renderHandbookGroups(groups, sectionId, page) {
  if (!groups?.length) return '';
  return `
    <div class="handbook-groups handbook-groups--${escapeHTML(sectionId)}">
      ${groups.map((group, index) => `
        <details class="handbook-group"${index === 0 ? ' open' : ''}>
          <summary>
            <span class="handbook-group-index">${escapeHTML(group.index || String(index + 1).padStart(2, '0'))}</span>
            <span class="handbook-group-heading">
              <strong>${escapeHTML(group.title)}</strong>
              ${group.summary ? `<small>${escapeHTML(group.summary)}</small>` : ''}
            </span>
            <span class="handbook-group-toggle" aria-hidden="true"></span>
          </summary>
          <div class="handbook-group-content">
            ${(group.body || []).map(paragraph => `<p>${escapeHTML(paragraph)}</p>`).join('')}
            ${renderHandbookStats(group.stats)}
            ${renderHandbookCards(group.cards)}
            ${renderHandbookBullets(group.items)}
            ${renderHandbookTags(group.tags)}
            ${group.courses?.length ? `
              <div class="handbook-course-block">
                <h4>课程内容</h4>
                ${renderHandbookBullets(group.courses, 'handbook-course-list')}
              </div>
            ` : ''}
            ${renderHandbookImage(group.image, group.imageAlt, '', group.imageDisplay, page)}
          </div>
        </details>
      `).join('')}
    </div>
  `;
}

function renderHandbookSection(section, index, page) {
  const intro = (section.intro || []).map(paragraph => `<p>${escapeHTML(paragraph)}</p>`).join('');
  const sectionId = String(section.id || `section-${index + 1}`).replace(/[^a-z0-9-]/gi, '-');
  return `
    <section class="content-section handbook-section handbook-section--${escapeHTML(sectionId)} fade-up" id="section-${index + 1}" aria-labelledby="section-title-${index + 1}">
      <div class="handbook-section-inner">
        <header class="handbook-section-heading">
          <div class="handbook-title-block">
            <p class="section-kicker">${escapeHTML(section.kicker)}</p>
            <h2 id="section-title-${index + 1}">${escapeHTML(section.title)}</h2>
          </div>
          ${intro ? `<div class="section-body handbook-intro">${intro}</div>` : ''}
        </header>
        ${renderHandbookStats(section.stats)}
        ${renderHandbookCards(section.cards)}
        ${renderHandbookSteps(section.steps)}
        ${section.highlight ? `<blockquote class="handbook-highlight">${escapeHTML(section.highlight)}</blockquote>` : ''}
        ${renderHandbookGroups(section.groups, sectionId, page)}
        ${renderHandbookImage(section.image, section.imageAlt, '', section.imageDisplay, page)}
        ${renderHandbookGallery(section.gallery, sectionId, page)}
      </div>
    </section>
  `;
}

/** GM (follow-up): "作品图册page下的本科夏校、作品集合集两个card点开也做成
    overlay而不是独立page" — for OVERLAY_CHILDREN_IDS (currently just
    `works`), the exact same card grid renders, but each card becomes a
    <button data-overlay-child> that opens the overlay (see
    undergrad-topic.js) instead of an <a href> to a now-nonexistent
    standalone route. The section carries `data-overlay-children` so
    the script can tell, cheaply, whether to wire that click delegation
    at all. Every other page with children (works' own sibling `cases`,
    when it isn't disabled — see DISABLED_NAV_IDS) keeps real page
    links, untouched. */
function renderChildren(page) {
  if (!page.children?.length) return '';
  const children = page.children.map(id => resolvePage(id, 'child', page.id));
  const overlayMode = OVERLAY_CHILDREN_IDS.includes(page.id);

  return `
    <section class="children-section" aria-labelledby="children-title"${overlayMode ? ' data-overlay-children' : ''}>
      <div class="children-inner">
        <div class="block-heading">
          <p>NEXT LEVEL</p>
          <h2 id="children-title">继续进入具体方向</h2>
        </div>
        <div class="child-grid">
          ${children.map(child => overlayMode ? `
            <button type="button" class="child-card fade-up" data-overlay-child="${escapeHTML(child.id)}">
              <img src="${escapeHTML(resolvePath(child.heroImage, page.route))}" alt="" width="1200" height="750" loading="lazy">
              <span class="child-card-copy">
                <small>${escapeHTML(child.eyebrow)}</small>
                <h3>${escapeHTML(child.shortTitle)}</h3>
                <p>${escapeHTML(child.lead)}</p>
                <span class="arrow" aria-hidden="true">查看详情 →</span>
              </span>
            </button>
          ` : `
            <a class="child-card fade-up" href="${escapeHTML(resolvePath(`/undergraduate/${child.route}/`, page.route))}">
              <img src="${escapeHTML(resolvePath(child.heroImage, page.route))}" alt="" width="1200" height="750" loading="lazy">
              <span class="child-card-copy">
                <small>${escapeHTML(child.eyebrow)}</small>
                <h3>${escapeHTML(child.shortTitle)}</h3>
                <p>${escapeHTML(child.lead)}</p>
                <span class="arrow" aria-hidden="true">查看详情 →</span>
              </span>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

/* v3.38 (GM): "take out 'keep exploring' section from every page coz it
   causes a lot of confusion" — always returns '' now, so no detail page
   renders the block. Left as a function (rather than deleting it and
   the __RELATED_BLOCK__ placeholder outright) in case a future request
   wants a curated version of this back; page.related data in
   undergrad-pages.json is untouched. Its CSS (.related-section etc.,
   undergrad.css) was removed separately since it shared a selector with
   .children-section, which is NOT being removed. */
function renderRelated(_page) {
  return '';
}

function renderDetailPage(page) {
  const prefix = prefixOf(page.route);
  const isHandbook = page.layout === 'full-time-handbook';
  const sections = isHandbook ? fullTimeContent.sections : page.sections;
  const pageClass = isHandbook
    ? 'page-full-time'
    : page.layout === 'acg-editorial' ? 'page-acg' : '';

  const renderers = isHandbook
    ? renderHandbookSection
    : page.layout === 'acg-editorial' ? renderAcgSection : renderSection;

  const replacements = {
    '__PAGE_DESCRIPTION__': escapeHTML(page.lead),
    '__PAGE_TITLE__': escapeHTML(page.shortTitle),
    '__PAGE_ACCENT__': escapeHTML(page.accent),
    '__PAGE_CLASS__': pageClass,
    '__PREFIX__': prefix,
    '__ROOT__': rootOf(page.route),
    '__HOME__': escapeHTML(homeOf(page.route)),
    '__GRADUATE_ENTRY__': escapeHTML(graduateOf(page.route)),
    '__NAVBAR_LINKS__': renderNavbarLinks(page.route, page.nav),
    '__NAV_MENU_OVERLAY__': renderNavOverlay(page.route, page.nav),
    '__FOOTER__': renderFooter(page.route),
    '__BREADCRUMBS__': renderBreadcrumbs(page),
    '__HERO_MEDIA__': renderHeroMedia(page, prefix),
    '__PAGE_EYEBROW__': escapeHTML(page.eyebrow),
    '__PAGE_HEADING__': escapeHTML(page.title),
    '__PAGE_LEAD__': escapeHTML(page.lead),
    '__HERO_FACTS__': renderFacts(page),
    '__TABLE_OF_CONTENTS__': sections.map((section, index) => (
      `<li><a href="#section-${index + 1}">${escapeHTML(section.title)}</a></li>`
    )).join(''),
    '__CONTENT_SECTIONS__': sections.map((section, index) => renderers(section, index, page)).join(''),
    '__TOPIC_WIDGET__': renderTopicWidget(page),
    '__CONTENT_OVERLAY__': renderOverlayShell(page),
    '__OVERLAY_PAYLOAD_SCRIPT__': renderOverlayPayloadScript(page),
    /* v3.39 (GM): the "NEXT LEVEL" children-cards grid is redundant on
       the 4 hub pages that now have their own widget + overlay for
       reaching every child (renderTopicWidget/Overlay.open) — suppressed
       there only. `works`/`cases` (out of scope for this request) keep
       it exactly as before. */
    '__CHILDREN_BLOCK__': OVERLAY_HUB_IDS.includes(page.id) ? '' : renderChildren(page),
    '__RELATED_BLOCK__': renderRelated(page),
  };

  let output = DETAIL_TPL;
  Object.entries(replacements).forEach(([placeholder, value]) => {
    output = output.replaceAll(placeholder, value);
  });
  const unresolved = output.match(/__[A-Z0-9_]+__/g);
  if (unresolved) throw new Error(`Unresolved detail template placeholders for ${page.id}: ${unresolved.join(', ')}`);
  return output;
}

/* ── link self-check — runs ONLY after every page has been written, so
   pages that point at each other are never reported as broken. ── */
function collectLocalRefs(html) {
  const refs = [];
  const attrRe = /\s(?:href|src)="([^"]+)"/g;
  let match;
  while ((match = attrRe.exec(html))) refs.push(match[1]);
  const srcsetRe = /\ssrcset="([^"]+)"/g;
  while ((match = srcsetRe.exec(html))) {
    match[1].split(',').forEach(part => {
      const url = part.trim().split(/\s+/)[0];
      if (url) refs.push(url);
    });
  }
  return refs;
}

function checkLinks(written) {
  const problems = [];
  written.forEach(({ file, html }) => {
    const dir = path.dirname(file);
    collectLocalRefs(html).forEach(ref => {
      if (!ref || ref.startsWith('#')) return;
      if (/^(https?:|data:|mailto:|tel:|javascript:)/i.test(ref)) return;
      const clean = ref.split('#')[0].split('?')[0];
      if (!clean) return;
      const target = path.resolve(dir, clean);
      const exists = clean.endsWith('/')
        ? fs.existsSync(path.join(target, 'index.html'))
        : fs.existsSync(target);
      if (!exists) {
        problems.push(`${path.relative(ROOT, file)} → ${ref}`);
      }
    });
  });
  return problems;
}

/* ── homepage ─────────────────────────────────────────────────── */
function renderHomepage() {
  let output = MAIN_TPL
    .replace('__NAVBAR_LINKS__', renderNavbarLinks('', null))
    .replace('__NAV_MENU_OVERLAY__', renderNavOverlay('', null))
    .replace('__FOOTER__', renderFooter(''));
  const unresolved = output.match(/__[A-Z0-9_]+__/g);
  if (unresolved) throw new Error(`Unresolved homepage template placeholders: ${unresolved.join(', ')}`);
  return output;
}

/* ── run ──────────────────────────────────────────────────────── */
validate();

const written = [];
const mainHTML = renderHomepage();
const mainChanged = writeIfChanged(path.join(UG_DIR, 'index.html'), mainHTML);
written.push({ file: path.join(UG_DIR, 'index.html'), html: mainHTML });

/* v3.39 (GM): the leaf pages under directions/pathways/capabilities/
   fit/works no longer get their own standalone route — their content
   is rendered into their hub page's overlay payload instead (see
   OVERLAY_LEAF_IDS/renderOverlayPayload above). They stay in
   undergrad-pages.json (still validated above, still the single
   source of truth for their content) — they just aren't written to
   disk as their own page anymore.

   Separately, DISABLED_PAGE_IDS (currently 学生案例/cases and its whole
   family) are excluded the same way, for the same "data stays, page
   generation stops" reason — see DISABLED_NAV_IDS's own comment. */
const generatedPages = pageData.pages.filter(page => (
  !OVERLAY_LEAF_IDS.has(page.id) && !DISABLED_PAGE_IDS.has(page.id)
));

let changedDetailCount = 0;
generatedPages.forEach(page => {
  const html = renderDetailPage(page);
  const outputPath = path.join(UG_DIR, ...page.route.split('/'), 'index.html');
  if (writeIfChanged(outputPath, html)) changedDetailCount += 1;
  written.push({ file: outputPath, html });
});

/* v3.39 (GM): "make sure it's super clean" — a page that stops being
   generated (like the overlay-only leaf routes above, or a disabled
   section) leaves its old directory behind on disk forever unless
   something removes it; writeIfChanged only ever adds/updates files,
   never deletes. Prune every no-longer-generated route's folder here
   so the build stays self-cleaning on every future run, not just this
   one. `DISABLED_NAV_IDS` (not the full DISABLED_PAGE_IDS) is enough —
   removing e.g. `cases/` recursively takes its whole sub-tree with it
   in one call. Scoped to exactly these named routes (never a blanket
   sweep of undergrad/), so an unrelated hand-placed file elsewhere in
   the tree is never at risk. */
let prunedCount = 0;
[...OVERLAY_LEAF_IDS, ...DISABLED_NAV_IDS].forEach(id => {
  const page = pageById.get(id);
  const dir = path.join(UG_DIR, ...page.route.split('/'));
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    prunedCount += 1;
  }
});

const siteContent = JSON.stringify(buildBrowserContent());
writeIfChanged(path.join(SITE_DATA_DIR, 'undergrad-content.json'), siteContent);

const problems = checkLinks(written);
console.log(`${mainChanged ? 'Generated' : 'Checked'} undergrad/index.html and ${generatedPages.length} detail pages (${changedDetailCount} updated).`);
if (prunedCount) console.log(`Pruned ${prunedCount} retired leaf-page folder(s) (now overlay-only).`);
console.log(`Wrote browser payload: undergrad/data/site/undergrad-content.json`);
if (problems.length) {
  console.error(`\nBroken local references (${problems.length}):`);
  problems.forEach(p => console.error('  ' + p));
  process.exit(1);
}
console.log('Link self-check: OK — every local href/src resolves.');
