/* ═══════════════════════════════════════════
   HOME PAGE — restructured 2026-09 to match IST's (wip branch) section
   order: Hero → 职业规划 teaser → offers → instructors → resources →
   courses. All the detailed career-planning content that used to live
   here (industries grid, heatmap, JD decoder, overseas pathways, FAQ,
   quiz, roadmap, capabilities, data insights) has moved to the full
   /planning page — see assets/js/pages/planning.js. timeline/course-
   products are copied from IST as-is (assets/js/pages/timeline.js,
   assets/js/pages/course-products.js, assets/js/course-demo.js).

   v3 (2026-09 style pass): hero rebuilt to resemble IST's richer hero
   (grid bg, blooms, HUD corners, top readout, plus the border-separated
   stat row) MINUS the comet mouse-follow effect and IST's fonts (v3.1
   later removed the floating logomark for simplicity); offers/
   instructors gained IST's own filter-tag categories; the resources
   marquee speed is now computed from item count so it visually matches
   IST's pace instead of inheriting IST's fixed duration (which was far
   too fast for DAD's larger company list).

   v3.2 (2026-09 real-data pass): offers and instructors are no longer
   placeholders — `renderOffers`/`renderInstructors` now load
   `data/dad_offers.json` (159 real schools) and `data/instructors.json`
   (128 real instructor photos, transcribed from GM's team's
   assets/img/instructors/ folders — see docs/PROJECT_NOTES.md for the
   parsing convention). The course catalogs (internship/summerwinter/
   bizpractice/masterclass, opened from CourseOverlay) now render real
   listings too, via the `_buildInternshipPanel`/`_buildCourseGrid`/
   `_buildAcademicGrid` helpers course-demo.js already expected but were
   never implemented — see the bottom of this file. ── */

const HomePage = {
  async render(data) {
    const { site } = data;
    this.renderHero(site.hero);
    this.renderCareerTeaser();
    await this.renderOffers();
    await this.renderInstructors();
    await this.renderResources();
    this.renderFeaturedCourses();
    this._initStickyCollapse();
    Effects.init(document.getElementById('page-home'));
  },

  /* ── STICKY COLLAPSE BAR — ported from ist_demo's home.js
     (_initStickyCollapse/_updateStickyBar), generalized from ist_demo's
     single instructor-only candidate to cover BOTH expand/fold grids
     this site has: offers AND instructors (per GM's 2026-09 follow-up:
     "check ist-demo project for it's UX of expanding/folding instrctor
     list using stick button. implement that to dad-demo's instructor
     and offer section."). While a grid is open and its OWN 展开/收起
     button has scrolled out of view, this floating pill (#sticky-
     collapse, markup in index.html) takes over so the user doesn't have
     to scroll back up just to collapse it. Candidates are listed in the
     page's own visual order (offers-root sits above instructors-root —
     see render() above) so that if both grids are open and both buttons
     have scrolled past, the sticky bar tracks whichever section the
     user is currently below (the LAST out-of-view candidate). ── */
  _initStickyCollapse() {
    const bar = document.getElementById('sticky-collapse');
    const btn = document.getElementById('sticky-collapse-btn');
    if (!bar || !btn || this._stickyBound) return;
    this._stickyBound = true;
    this._stickyTarget = null; // { collapseBtn, onCollapse }
    window.addEventListener('scroll', () => this._updateStickyBar(), { passive: true });
    btn.addEventListener('click', () => { if (this._stickyTarget) this._stickyTarget.onCollapse(); });
    this._updateStickyBar();
  },
  _updateStickyBar() {
    const bar = document.getElementById('sticky-collapse');
    if (!bar) return;
    const candidates = [
      { el: document.getElementById('offers-expand-btn'), open: !!this._offerExpanded[this._activeOfferGroup], collapse: () => this.toggleOffersExpanded(this._activeOfferGroup) },
      { el: document.getElementById('instructors-expand-btn'), open: !!this._instExpanded, collapse: () => this.toggleInstructorsExpanded() },
    ].filter(c => c.open && c.el);

    if (!candidates.length) {
      bar.style.display = 'none';
      this._stickyTarget = null;
      return;
    }
    const outOfView = candidates.filter(c => {
      const r = c.el.getBoundingClientRect();
      return r.bottom < 0 || r.top > window.innerHeight;
    });
    if (!outOfView.length) {
      bar.style.display = 'none';
      this._stickyTarget = null;
      return;
    }
    const active = outOfView[outOfView.length - 1];
    bar.style.display = '';
    this._stickyTarget = { collapseBtn: active.el, onCollapse: active.collapse };
  },

  /* ── HERO — v3: IST-style grid/bloom/HUD/readout/logomark hero,
     without the comet mouse-follow effect and keeping this site's own
     fonts. Nav-button/CTA shapes stay capsule (999px) throughout. ── */
  renderHero(hero) {
    document.getElementById('hero-root').innerHTML = `
      <div class="hero__grid" aria-hidden="true"></div>
      <div class="hero__bloom hero__bloom--a" aria-hidden="true"></div>
      <div class="hero__bloom hero__bloom--b" aria-hidden="true"></div>
      <div class="hero__scan" aria-hidden="true"></div>
      <div class="hero__hud hero__hud--tl" aria-hidden="true"></div>
      <div class="hero__hud hero__hud--tr" aria-hidden="true"></div>
      <div class="hero__hud hero__hud--bl" aria-hidden="true"></div>
      <div class="hero__hud hero__hud--br" aria-hidden="true"></div>
      <div class="hero__readout" aria-hidden="true">
        <span>SFK International Art Education</span>
        <span>31.2304°N · 121.4737°E</span>
        <span class="hero__readout-live"><i></i> LIVE · AY 2026</span>
      </div>
      <div class="container hero__content">
        <span class="eyebrow eyebrow--on-void u-en">${escapeHTML(hero.eyebrow)}</span>
        <h1 class="fade-up">${escapeHTML(hero.title)}</h1>
        <p class="hero__subtitle fade-up">${escapeHTML(hero.subtitle)}</p>
        <div class="hero__ctas fade-up">
          <button class="btn btn--primary" onclick="Router.go('planning')">${escapeHTML(hero.ctaPrimary)}</button>
          <button class="btn btn--ghost-on-void" onclick="Router.go('course-products')">${escapeHTML(hero.ctaSecondary)}</button>
        </div>
        <div class="hero__stats fade-up">
          ${hero.stats.map(s => `
            <div class="stat-card stat-card--void">
              <div class="stat-card__value u-mono">${escapeHTML(s.value)}</div>
              <div class="stat-card__label">${escapeHTML(s.label)}</div>
            </div>`).join('')}
        </div>
        <div class="hero__guide guide-steps fade-up">
          ${hero.guideSteps.map(g => `
            <div class="guide-step"><span class="guide-step__num u-mono">${g.step}</span>${escapeHTML(g.title)}</div>`).join('')}
        </div>
      </div>`;
  },

  /* ── 职业规划 teaser — v3.13 (GM): the auto-scrolling 8-industry reel
     that used to live here has moved onto the /planning page's own
     "总览" overview tab instead (see
     PlanningPage.renderIndustriesOverview) — since a click on any of
     these cards always landed on that same page anyway, GM asked for
     this homepage section to become a plain editorial teaser instead:
     title, a formal paragraph on the digital-art-and-design division's
     industry/career-planning scope, and one prominent accent-colored
     CTA button into the full page (replacing both the old reel and its
     understated text-colored .section-cta button — GM wanted this one
     to read as the highlighted "primary" action, using the same
     .btn--primary the hero's own main CTA uses). ── */
  renderCareerTeaser() {
    document.getElementById('career-planning-root').innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">Career Planning</span>
        <h2>职业规划</h2>
        <p>数字艺术与设计学科的职业发展，横跨数字文旅、互联网生态、AI创意科技、游戏娱乐、影视影像、品牌传播、教育学术、独立艺术家八大方向，贯穿内容创作、技术开发与商业转化的完整链条。职业规划板块基于头部企业的真实招聘信息与历年录取案例，为每一个方向梳理核心岗位、能力要求与对应的院校申请路径，帮助学生在留学申请与职业选择之间建立清晰、可执行的坐标。</p>
      </div>
      <div class="fade-up" style="text-align:center;margin-top:8px;">
        <button class="btn btn--primary" onclick="Router.go('planning')">进入职业规划页面 <span class="u-en">/ View Career Planning</span></button>
      </div>`;
  },

  /* ── shared grid clamp utility — ported from ist_demo's home.js
     _gridClamp (assets/js/pages/home.js there). Instead of a fixed
     page-size slice, it reads the grid's OWN computed column count
     (getComputedStyle().gridTemplateColumns) and clamps to whole rows
     (cols * rows), so there's never a sparse partial last row — and a
     resize listener re-clamps live, so a 6-per-row layout that becomes
     4-per-row (or vice versa) never leaves a half-empty trailing row
     either. Toggling `open` reveals everything; the caller supplies its
     own expand/collapse button markup/text so each section keeps its
     existing copy (查看更多 for offers, etc). ── */
  _gridClamp(gridEl, rows, open) {
    if (!gridEl) return { limit: Infinity, total: 0 };
    const tpl = getComputedStyle(gridEl).gridTemplateColumns;
    const cols = (tpl && tpl !== 'none') ? tpl.split(' ').length : 1;
    const limit = cols * rows;
    const children = Array.from(gridEl.children);
    children.forEach((card, i) => { card.style.display = (open || i < limit) ? '' : 'none'; });
    return { limit, total: children.length };
  },

  /* ── OFFERS — real 2026 offer counts (data/dad_offers.json, 159
     schools). Grouped by region (US/UK/HK_SG/OTHER — normalizing the
     JSON's "HK-SG" spelling to match this site's existing filter id),
     sorted by offer count descending. Each tab renders its FULL list
     into the DOM and clamps to whole rows via `_gridClamp` (see above)
     with a "查看更多" expand for the rest — replaces the old fixed
     OFFER_PAGE_SIZE=20 slice, which could leave a sparse last row (e.g.
     20 items / 6 cols = 3 full rows + a trailing row of only 2). Each
     group remembers its own open/closed state across filter switches
     and re-clamps on window resize while collapsed. ── */
  OFFER_FILTERS: [
    { id: 'US', label: '🇺🇸 美国' },
    { id: 'UK', label: '🇬🇧 英国' },
    { id: 'HK_SG', label: '🇭🇰 港新' },
    { id: 'OTHER', label: '🌏 其他' },
  ],
  OFFER_ROWS: 4,
  _offersByGroup: {},
  _offerExpanded: {},
  _activeOfferGroup: 'US',
  async renderOffers() {
    const raw = await Data.load('dad_offers');
    const groups = { US: [], UK: [], HK_SG: [], OTHER: [] };
    raw.forEach(row => {
      const g = (row['国家/地区分组'] || '').replace('-', '_'); // "HK-SG" -> "HK_SG"
      if (groups[g]) groups[g].push(row);
    });
    Object.values(groups).forEach(list => list.sort((a, b) => (b['offer数量'] || 0) - (a['offer数量'] || 0)));
    this._offersByGroup = groups;

    document.getElementById('offers-root').innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">Offers 2026</span>
        <h2>offer 展示</h2>
        <p>2026 申请季录取战报 — 覆盖美国、英国、港新与全球院校，累计 ${raw.length} 所院校的真实 offer 数据。</p>
      </div>
      <div class="filter-bar fade-up" id="offers-filter-bar">
        ${this.OFFER_FILTERS.map((f, i) => `<button class="filter-btn${i === 0 ? ' is-active' : ''}" data-group="${f.id}" onclick="HomePage.filterOffers('${f.id}',this)">${f.label}</button>`).join('')}
      </div>
      <div class="rough-grid fade-up" id="offers-grid">${this._offerRowsHTML('US')}</div>
      <div id="offers-more-wrap" style="text-align:center;margin-top:20px;"></div>`;
    this._applyOfferClamp();

    if (!this._offerResizeBound) {
      this._offerResizeBound = true;
      let t;
      window.addEventListener('resize', () => {
        clearTimeout(t);
        t = setTimeout(() => { if (!this._offerExpanded[this._activeOfferGroup]) this._applyOfferClamp(); }, 150);
      });
    }
  },
  _offerRowsHTML(groupId) {
    const list = this._offersByGroup[groupId] || [];
    return list.map(row => {
      const zh = (row['学校名称(中文)'] || '').split('/')[0];
      const en = row['学校名称(英文)'] || '';
      return `
      <div class="offer-card">
        <div class="offer-card__count u-mono">${escapeHTML(String(row['offer数量'] ?? ''))}</div>
        <div class="offer-card__school-zh">${escapeHTML(zh)}</div>
        <div class="offer-card__school-en u-en">${escapeHTML(en)}</div>
      </div>`;
    }).join('');
  },
  _applyOfferClamp() {
    const groupId = this._activeOfferGroup;
    const open = !!this._offerExpanded[groupId];
    const { limit, total } = this._gridClamp(document.getElementById('offers-grid'), this.OFFER_ROWS, open);
    const wrap = document.getElementById('offers-more-wrap');
    if (!wrap) return;
    wrap.innerHTML = total <= limit ? '' : (open
      ? `<button class="section-cta" id="offers-expand-btn" onclick="HomePage.toggleOffersExpanded('${groupId}')">收起</button>`
      : `<button class="section-cta" id="offers-expand-btn" onclick="HomePage.toggleOffersExpanded('${groupId}')">查看更多 <span class="u-en">/ ${total - limit} more</span></button>`);
    this._updateStickyBar();
  },
  filterOffers(groupId, btn) {
    document.querySelectorAll('#offers-filter-bar .filter-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    this._activeOfferGroup = groupId;
    document.getElementById('offers-grid').innerHTML = this._offerRowsHTML(groupId);
    this._applyOfferClamp();
  },
  toggleOffersExpanded(groupId) {
    this._offerExpanded[groupId] = !this._offerExpanded[groupId];
    this._applyOfferClamp();
  },

  /* ── INSTRUCTORS — real photos (data/instructors.json, 128 records
     transcribed from assets/img/instructors/, 4 categories with photos:
     海外教授/学术导师/业界导师/顶尖学者[new]). 教研导师/校友导师 have no
     photos yet and show an empty state rather than fabricated cards.
     v3.9: 全部 (all) now renders every instructor and clamps to whole
     rows via the shared `_gridClamp` (same expand/fold pattern as
     ist_demo's instructor section — see its home.js `_gridClamp` /
     `toggleInstructors`), with a 展开/收起 button and a resize listener
     so the clamp always matches the live column count.
     v3.15 (GM): each record used to carry a `category` id (e.g.
     "research") AND a separate `categoryLabel` Chinese string (e.g.
     "教研导师") that had to be kept in sync by hand — GM edited a few
     records' category text in instructors.json and the filter didn't
     pick up the change, because the filter buttons compare against the
     id field, not the label text someone would actually think to edit.
     Fixed by dropping the id entirely: instructors.json now stores ONE
     `category` field holding the exact Chinese label, and
     INSTRUCTOR_CATEGORIES below (used both as the filter tabs AND the
     match value) is that same text — so editing a record's `category`
     field in the JSON is now the whole story, no second field to
     forget. Order here is the deliberate tab order (kept even for
     校友导师, which currently has 0 records, so its empty state still
     shows — see the comment above). ── */
  INSTRUCTOR_CATEGORIES: ['海外教授', '教研导师', '学术导师', '业界导师', '校友导师', '顶尖学者'],
  INSTRUCTOR_ROWS: 4,
  _instExpanded: false,
  _activeInstType: 'all',
  async renderInstructors() {
    this._instructors = await Data.load('instructors');
    document.getElementById('instructors-root').innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">Instructors</span>
        <h2>导师团队</h2>
        <p>来自顶尖高校与业界的导师团队 — 覆盖海外教授、学术导师、业界导师与顶尖学者共 ${this._instructors.length} 位。</p>
      </div>
      <div class="filter-bar fade-up" id="instructors-filter-bar">
        <button class="filter-btn is-active" data-itype="all" onclick="HomePage.filterInstructors('all',this)">全部</button>
        ${this.INSTRUCTOR_CATEGORIES.map(c => `<button class="filter-btn" data-itype="${escapeHTML(c)}" onclick="HomePage.filterInstructors('${c}',this)">${escapeHTML(c)}</button>`).join('')}
      </div>
      <div class="rough-grid fade-up" id="instructors-grid">${this._instructorCardsHTML('all')}</div>
      <div id="instructors-more-wrap" style="text-align:center;margin-top:20px;"></div>`;
    this._applyInstClamp();

    if (!this._instResizeBound) {
      this._instResizeBound = true;
      let t;
      window.addEventListener('resize', () => {
        clearTimeout(t);
        t = setTimeout(() => { if (!this._instExpanded) this._applyInstClamp(); }, 150);
      });
    }
  },
  _instructorCardsHTML(typeId) {
    const list = typeId === 'all' ? this._instructors : this._instructors.filter(r => r.category === typeId);
    if (!list.length) {
      return `<div class="tl-gantt-empty" style="padding:32px 0;grid-column:1/-1">该分类暂无导师数据 · 敬请期待</div>`;
    }
    // v3.15 (GM): card body is now name / background (bold) / title,
    // background and title split from what used to be one combined
    // `title` field in instructors.json (see data/instructors.json and
    // PROJECT_NOTES.md for the split rule and the handful of manual
    // special cases). Either half can be empty (a bare-school-name
    // record has no separate title; a few industry credentials have no
    // company/university at all) — each line only renders when present.
    return list.map(r => `
      <div class="person-card">
        <div class="person-card__avatar"><img src="${escapeHTML(r.img)}" alt="" loading="lazy"></div>
        <div class="person-card__name">${escapeHTML(r.name)}</div>
        ${r.background ? `<div class="person-card__background">${escapeHTML(r.background)}</div>` : ''}
        ${r.title ? `<div class="person-card__title">${escapeHTML(r.title)}</div>` : ''}
      </div>`).join('');
  },
  _applyInstClamp() {
    const open = !!this._instExpanded;
    const { limit, total } = this._gridClamp(document.getElementById('instructors-grid'), this.INSTRUCTOR_ROWS, open);
    const wrap = document.getElementById('instructors-more-wrap');
    if (!wrap) return;
    wrap.innerHTML = total <= limit ? '' : (open
      ? `<button class="section-cta" id="instructors-expand-btn" onclick="HomePage.toggleInstructorsExpanded()">收起</button>`
      : `<button class="section-cta" id="instructors-expand-btn" onclick="HomePage.toggleInstructorsExpanded()">展开查看更多 <span class="u-en">/ ${total - limit} more</span></button>`);
    this._updateStickyBar();
  },
  filterInstructors(typeId, btn) {
    document.querySelectorAll('#instructors-filter-bar .filter-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    this._activeInstType = typeId;
    document.getElementById('instructors-grid').innerHTML = this._instructorCardsHTML(typeId);
    this._applyInstClamp();
  },
  toggleInstructorsExpanded() {
    this._instExpanded = !this._instExpanded;
    this._applyInstClamp();
  },

  /* ── RESOURCES — v3.10 real-data pass: data/resource-partners.json (83
     real校企资源logo partners, name + logo image extracted from GM's
     team's DAD MA 网站信息包.xlsx「校企资源logo」tab — see
     docs/PROJECT_NOTES.md) replaces the old plain-text company-name
     marquee.
     v3.10.1 (GM follow-up): card markup/size now mirrors ist_demo's own
     `.coop-card` (116px card, 60×60 white-backed logo box, English +
     Chinese name below — see the CSS comment in ist-shared.css). The
     Intro/Collab info (sheet's 文字展现合作内容 field) no longer lives in
     an in-card overlay — GM asked for it to float ABOVE the card instead
     — so hovering delegates to `_showCoopOverlay`/`_hideCoopOverlay`,
     which position a single shared `#coop-hover-overlay` element
     (position:fixed, appended to <body> — see the CSS comment for why)
     above whichever card is hovered. v3.13 (GM): dropped the little
     speech-bubble pointer triangle — GM just wants the bordered box,
     no arrow. Scroll SPEED (not duration — see
     v3.13 below) is fixed at COOP_SPEED_PX_PER_SEC so it matches IST's
     pace regardless of partner count.
     v3.13 (GM): scroll is now driven by Marquee.init() (see
     assets/js/marquee.js) instead of a CSS keyframe animation — GM
     reported reels disappearing after running for a while; see
     marquee.js's header comment for why. ── */
  COOP_SPEED_PX_PER_SEC: 47, // IST's own effective speed: 14 cards × (150+12)px / 48s
  async renderResources() {
    const partners = await Data.load('resource-partners');
    this._coopPartners = partners;
    const cardHTML = (p) => `
      <div class="coop-card">
        <div class="coop-card__logo"><img src="${escapeHTML(p.logo)}" alt="${escapeHTML(p.nameCn || p.nameEn)}" loading="lazy"></div>
        <div class="coop-card__name-en">${escapeHTML(p.nameEn || '')}</div>
        <div class="coop-card__name-cn">${escapeHTML(p.nameCn || '')}</div>
      </div>`;
    const track = [...partners, ...partners].map(cardHTML).join('');
    document.getElementById('resources-root').innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">Network</span>
        <h2>资源网络</h2>
        <p>横跨八大行业方向、深度覆盖的校企资源网络 — 累计 ${partners.length} 家合作院校与企业，鼠标悬停查看具体合作内容，完整企业岗位解读见「职业规划」页。</p>
      </div>
      <div class="coop-marquee-section fade-up">
        <div class="coop-marquee-wrap"><div class="coop-marquee-track" id="coop-marquee-track">${track}</div></div>
      </div>`;
    const trackEl = document.getElementById('coop-marquee-track');
    Marquee.init(trackEl, this.COOP_SPEED_PX_PER_SEC, 'coop-marquee-track');
    this._bindCoopHover(trackEl, partners);
  },

  /* ── shared floating hover overlay ── delegated so we don't attach
     166 listeners; `mouseover`/`mouseout` bubble, unlike `mouseenter`/
     `mouseleave`, so a single pair of listeners on the track covers
     every card (including its duplicate half of the marquee loop). ── */
  _bindCoopHover(trackEl, partners) {
    if (!trackEl) return;
    trackEl.addEventListener('mouseover', (e) => {
      const card = e.target.closest('.coop-card');
      if (!card || !trackEl.contains(card)) return;
      const idx = Array.from(trackEl.children).indexOf(card) % partners.length;
      this._showCoopOverlay(card, partners[idx]);
    });
    trackEl.addEventListener('mouseout', (e) => {
      const card = e.target.closest('.coop-card');
      if (!card || (e.relatedTarget && card.contains(e.relatedTarget))) return;
      this._hideCoopOverlay();
    });
    if (!this._coopScrollBound) {
      this._coopScrollBound = true;
      window.addEventListener('scroll', () => this._hideCoopOverlay(), { passive: true });
    }
  },
  _ensureCoopOverlayEl() {
    if (this._coopOverlayEl) return this._coopOverlayEl;
    const el = document.createElement('div');
    el.className = 'coop-hover-overlay';
    el.innerHTML = `
      <div class="coop-hover-overlay__name"></div>
      <div class="coop-hover-overlay__intro"></div>
      <div class="coop-hover-overlay__collab"></div>`;
    document.body.appendChild(el);
    this._coopOverlayEl = el;
    return el;
  },
  _showCoopOverlay(cardEl, partner) {
    if (!partner) return;
    const el = this._ensureCoopOverlayEl();
    el.querySelector('.coop-hover-overlay__name').textContent = partner.nameCn || partner.nameEn || '';
    el.querySelector('.coop-hover-overlay__intro').textContent = partner.intro || '';
    el.querySelector('.coop-hover-overlay__collab').innerHTML = (partner.collab || [])
      .map(c => `<span class="coop-card__collab-tag">${escapeHTML(c)}</span>`).join('');
    const rect = cardEl.getBoundingClientRect();
    const width = 220;
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    el.style.width = width + 'px';
    el.style.left = left + 'px';

    // Default placement is ABOVE the card (per GM: "overlay 在上方浮现").
    // But a card near the top of the viewport (or of the page, right below
    // the sticky navbar) may not have 上方 room for the overlay's real
    // (content-dependent) height — measure it with the overlay already
    // positioned/placed above, and flip to below the card if that would
    // tuck it under the navbar.
    const navbarH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h'), 10) || 60;
    el.classList.remove('coop-hover-overlay--below');
    el.style.top = (rect.top - 10) + 'px';
    const overlayH = el.offsetHeight;
    if (rect.top - overlayH - 10 < navbarH + 8) {
      el.classList.add('coop-hover-overlay--below');
      el.style.top = (rect.bottom + 10) + 'px';
    }
    el.classList.add('is-visible');
  },
  _hideCoopOverlay() {
    if (this._coopOverlayEl) this._coopOverlayEl.classList.remove('is-visible');
  },

  /* ── COURSES — v3: same style AND content as IST's own homepage
     featured-courses rail (placeholder, pending DAD's own course
     products — see docs/PROJECT_NOTES.md), pointing at the
     course-products page/products copied verbatim from IST
     (assets/js/course-demo.js). ── */
  FEATURED_ORDER: ['changemakers', 'longform2', 'longform3', 'internship', 'summerwinter', 'bizpractice', 'masterclass'],

  renderFeaturedCourses() {
    const root = document.getElementById('courses-root');
    if (!root) return;
    const hasProducts = !!window.PRODUCTS;
    const ids = hasProducts ? this.FEATURED_ORDER.filter(id => window.PRODUCTS[id]) : [];

    const cardHTML = (id) => {
      const p = window.PRODUCTS[id];
      const isLongform = p.group === 'longform';
      const bannerCls = 'featured-rail__banner' + (isLongform
        ? (p.tileVariant ? ' featured-rail__banner--' + p.tileVariant : '')
        : ' featured-rail__banner--catalog');
      const tag = isLongform ? '长线' : ('目录 · ' + (p.count || ''));
      // v3.25: 长线产品 cards now match the course-products page's own
      // overlay→page change — a click here routes to the product's full
      // page instead of opening CourseOverlay, everywhere a longform card
      // can be clicked from, not just the course-products page itself.
      const onclick = isLongform
        ? `Router.go('course-products', {productId:'${id}'})`
        : `CourseOverlay.open('${id}')`;
      return `<div class="featured-rail__card" onclick="${onclick}">
        <div class="${bannerCls}">${p.cover ? `<img src="${p.cover}" alt="" loading="lazy">` : ''}<span class="featured-rail__tag">${escapeHTML(tag)}</span></div>
        <div class="featured-rail__body">
          <div class="featured-rail__title">${escapeHTML(p.meta.titleCn.split(' · ')[0])}</div>
          <div class="featured-rail__desc">${escapeHTML(p.meta.chips ? p.meta.chips[0] : p.meta.desc)}</div>
        </div>
      </div>`;
    };

    root.innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">Featured Courses</span>
        <h2>精选课程</h2>
        <p>从岗位制实习、行业导师带训，到海外冬夏校与大师课，长线旗舰项目与课程目录一站汇总（内容目前复用 IST 的课程产品体系，占位，待替换为 DAD 自有课程），点击任意卡片查看完整介绍。</p>
      </div>
      <div class="pending-badge">⏳ 内容为临时复用，待替换</div>
      ${ids.length ? `
        <div class="featured-rail-wrap"><div class="featured-rail" id="featured-courses-rail">${[...ids, ...ids].map(cardHTML).join('')}</div></div>
        <div style="text-align:center;margin-top:24px;">
          <button class="section-cta" onclick="Router.go('course-products')">查看更多 <span class="u-en">/ View All Courses</span></button>
        </div>` : ''}`;

    // v3.13 (GM): driven by Marquee.init() (assets/js/marquee.js)
    // instead of a CSS keyframe animation — see marquee.js's header
    // comment (GM reported reels disappearing after running a while).
    // Speed matches the site's other reels (COOP_SPEED_PX_PER_SEC).
    Marquee.init(document.getElementById('featured-courses-rail'), this.COOP_SPEED_PX_PER_SEC, 'featured-courses-rail');
  },

  /* ── COURSE CATALOG GRIDS — real listings for the internship/
     summerwinter/bizpractice/masterclass overlays (assets/js/
     course-demo.js's buildCatalogGridHTML calls these three methods by
     name via window.HomePage; they were referenced from IST's original
     copy but never implemented until the 2026-09 real-data delivery).
     Cards reuse .port-card/.card-grid (rounded, real gaps, full-
     perimeter yellow glow hover — the same "not IST's zero-gap grid"
     language used by PortfolioPage). A missing poster (2 known gaps —
     see docs/PROJECT_NOTES.md) falls back to the site's yellow-black
     gradient placeholder tile instead of a broken <img>. ── */
  // v3.28 (GM): optional deckSlug/deckCount — set only for 冬夏校 items that
  // have a real paginated slide deck (dad_courses_academic.json's `slides`
  // field, see _buildAcademicGrid). When present the whole card opens
  // SlideViewer (a left/right paged flip through the deck, components.js)
  // instead of ImageModal, and a CTA line under the tags names the page
  // count — same pattern as ist_demo's SlideViewer.open(slug).
  _buildCatalogCard({ poster, title, sub, tagLabel, tags, deckSlug, deckCount }) {
    const hasImg = !!poster;
    const imgStyle = hasImg ? '' : ' style="background:linear-gradient(135deg, var(--color-void) 0%, #2b2b2b 45%, var(--color-accent) 100%)"';
    // click-to-open-poster: ImageModal (assets/js/components.js, ported
    // from ist_demo) — the JS-string args need their own escaping since
    // this whole thing already lives inside an onclick="" HTML attribute.
    // v3.22 (GM): 商业实践's "Al-Driven 体验创新" card wouldn't open its
    // modal — its role_or_course field has a literal embedded newline
    // ("Al-Driven\n 体验创新" in data/dad_courses_industry.json), which,
    // unescaped, breaks the onclick JS string literal (unterminated
    // string), silently killing that one card's click handler. Escaping
    // \n/\r here (same fix protects any future data with the same issue)
    // fixes it without touching the source data.
    const jsEscape = s => String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n');
    const isDeck = hasImg && !!deckSlug;
    const posterClick = isDeck
      ? ` onclick="SlideViewer.open('${jsEscape(deckSlug)}')" style="cursor:pointer"`
      : (hasImg ? ` onclick="ImageModal.open('${jsEscape(poster)}','${jsEscape(title)}')" style="cursor:pointer"` : '');
    return `
      <div class="port-card${isDeck ? ' port-card--deck' : ''}"${posterClick}>
        <div class="port-card__img"${imgStyle}>
          ${hasImg ? `<img src="${escapeHTML(poster)}" alt="" loading="lazy">` : `<span class="port-card__img-placeholder">占位图 · Placeholder</span>`}
          ${tagLabel ? `<span class="port-card__cat-tag">${escapeHTML(tagLabel)}</span>` : ''}
        </div>
        <div class="port-card__body">
          <div class="port-card__title">${escapeHTML(title || '')}</div>
          ${sub ? `<div class="port-card__program">${escapeHTML(sub)}</div>` : ''}
          ${tags && tags.length ? `<div class="port-card__tags">${tags.map(t => `<span class="port-card__tag">${escapeHTML(t)}</span>`).join('')}</div>` : ''}
          ${isDeck ? `<div class="port-card__cta">查看课程详情 · ${deckCount || ''}页 →</div>` : ''}
        </div>
      </div>`;
  },
  _emptyCatalogHTML() {
    return `<div class="tl-gantt-empty" style="padding:40px 0">课程目录数据接入中 · 此区块结构已就位</div>`;
  },
  // Called with no arguments by course-demo.js — fetches DATA.courses_industry
  // itself and covers BOTH internship paths (岗位制实地实习 + 线上行业导师带训).
  _buildInternshipPanel() {
    const items = (typeof DATA !== 'undefined' && DATA.courses_industry) || [];
    const relevant = items.filter(c => c.tab === 'internship' || c.tab === 'mentoring');
    if (!relevant.length) return this._emptyCatalogHTML();
    const cards = relevant.map(c => this._buildCatalogCard({
      poster: c.poster,
      title: c.role_or_course,
      sub: c.company,
      tagLabel: c.tab === 'internship' ? '岗位实习 · 实地' : '导师带训 · 线上',
      tags: [c.location, c.duration].filter(Boolean),
    })).join('');
    return `<div class="card-grid">${cards}</div>`;
  },
  // Called with the already-tab-filtered `industry` items (bizpractice).
  _buildCourseGrid(items) {
    if (!items || !items.length) return this._emptyCatalogHTML();
    const cards = items.map(c => this._buildCatalogCard({
      poster: c.poster,
      title: c.role_or_course,
      sub: c.company,
      tagLabel: '商业实践',
      tags: [c.location, c.duration].filter(Boolean),
    })).join('');
    return `<div class="card-grid">${cards}</div>`;
  },
  // Called with the already-tab-filtered `academic` items (summerwinter/masterclass).
  _buildAcademicGrid(items) {
    if (!items || !items.length) return this._emptyCatalogHTML();
    const cards = items.map(c => this._buildCatalogCard({
      poster: c.poster,
      title: c.role_or_course,
      sub: c.university,
      tagLabel: c.program_type === '海外大师课' ? '大师课' : '冬夏校',
      tags: [c.level, c.location].filter(Boolean),
      // v3.28 (GM): 27冬校 research-level records carry a real `slides`
      // deck (dad_courses_academic.json) — those cards open SlideViewer
      // instead of a plain poster modal; every other academic item is
      // unaffected (deckSlug undefined → _buildCatalogCard's normal path).
      deckSlug: c.slides ? c.slug : undefined,
      deckCount: c.slides ? c.slides.count : undefined,
    })).join('');
    return `<div class="card-grid">${cards}</div>`;
  },
};
window.HomePage = HomePage;
