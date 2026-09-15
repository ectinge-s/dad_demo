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
    const { site, industries, companies } = data;
    this.renderHero(site.hero);
    this.renderCareerTeaser(industries);
    await this.renderOffers();
    await this.renderInstructors();
    this.renderResources(companies);
    this.renderFeaturedCourses();
    Effects.init(document.getElementById('page-home'));
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
          <button class="btn btn--ghost" style="color:var(--color-text-on-void);border-color:rgba(255,255,255,.3)" onclick="Router.scrollTo('#courses')">${escapeHTML(hero.ctaSecondary)}</button>
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

  /* ── 职业规划 teaser — 8 industry cards, auto-looping horizontal
     marquee — same pattern as the 精选课程/featured-rail section below
     (duplicated list, CSS translateX loop, pause on hover/out-of-view)
     per GM's 2026-09 follow-up request, replacing the earlier manual
     scroll-snap rail + fixed circular arrow CTA. Destination is the
     same full /planning page as the navbar's "职业规划" CTA. ── */
  renderCareerTeaser(industries) {
    const cardHTML = (ind, i) => `
      <div class="career-card" onclick="Router.goToIndustry('${escapeHTML(ind.title)}')" style="border-top:3px solid ${industryColor(ind.title)}">
        <div class="career-card__top">
          <span class="career-card__num u-mono">0${i + 1}</span>
          <span class="career-card__trend">${escapeHTML(ind.trendArrow)}</span>
        </div>
        <div>
          <div class="career-card__title">${escapeHTML(ind.title)}</div>
          <div class="career-card__title-en">${escapeHTML(ind.titleEn)}</div>
        </div>
        <p class="career-card__desc">${escapeHTML(ind.oneLine)}</p>
      </div>`;

    document.getElementById('career-planning-root').innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">Career Planning</span>
        <h2>职业规划</h2>
        <p>从八大行业出发，先看一眼全景 — 点击任意行业卡片，或下方的按钮，进入完整的职业规划页面：头部企业、核心岗位与对应升学路径。</p>
      </div>
      <div class="career-rail-wrap fade-up"><div class="career-rail" id="career-rail">${[...industries, ...industries].map((ind, i) => cardHTML(ind, i % industries.length)).join('')}</div></div>
      <div style="text-align:center;margin-top:24px;">
        <button class="section-cta" onclick="Router.go('planning')">进入完整职业规划页面 <span class="u-en">/ View All</span></button>
      </div>`;

    const rail = document.getElementById('career-rail');
    const wrap = rail && rail.closest('.career-rail-wrap');
    if (wrap && 'IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        entries.forEach(e => rail.classList.toggle('is-paused', !e.isIntersecting));
      }, { threshold: 0.1 }).observe(wrap);
    }
  },

  /* ── OFFERS — real 2026 offer counts (data/dad_offers.json, 159
     schools). Grouped by region (US/UK/HK_SG/OTHER — normalizing the
     JSON's "HK-SG" spelling to match this site's existing filter id),
     sorted by offer count descending. Each tab shows the top 20 with a
     "查看更多" expand for the rest, since OTHER (58) and US (49) would
     otherwise be very long grids on first paint. ── */
  OFFER_FILTERS: [
    { id: 'US', label: '🇺🇸 美国' },
    { id: 'UK', label: '🇬🇧 英国' },
    { id: 'HK_SG', label: '🇭🇰 港新' },
    { id: 'OTHER', label: '🌏 其他' },
  ],
  OFFER_PAGE_SIZE: 20,
  _offersByGroup: {},
  _offerExpanded: {},
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
      <div id="offers-more-wrap" style="text-align:center;margin-top:20px;">${this._offerMoreButtonHTML('US')}</div>`;
  },
  _offerRowsHTML(groupId) {
    const list = this._offersByGroup[groupId] || [];
    const expanded = !!this._offerExpanded[groupId];
    const visible = expanded ? list : list.slice(0, this.OFFER_PAGE_SIZE);
    return visible.map(row => {
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
  _offerMoreButtonHTML(groupId) {
    const list = this._offersByGroup[groupId] || [];
    const expanded = !!this._offerExpanded[groupId];
    if (list.length <= this.OFFER_PAGE_SIZE) return '';
    return expanded
      ? `<button class="section-cta" onclick="HomePage.toggleOffersExpanded('${groupId}')">收起</button>`
      : `<button class="section-cta" onclick="HomePage.toggleOffersExpanded('${groupId}')">查看更多 <span class="u-en">/ ${list.length - this.OFFER_PAGE_SIZE} more</span></button>`;
  },
  filterOffers(groupId, btn) {
    document.querySelectorAll('#offers-filter-bar .filter-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    document.getElementById('offers-grid').innerHTML = this._offerRowsHTML(groupId);
    document.getElementById('offers-more-wrap').innerHTML = this._offerMoreButtonHTML(groupId);
    this._activeOfferGroup = groupId;
  },
  toggleOffersExpanded(groupId) {
    this._offerExpanded[groupId] = !this._offerExpanded[groupId];
    document.getElementById('offers-grid').innerHTML = this._offerRowsHTML(groupId);
    document.getElementById('offers-more-wrap').innerHTML = this._offerMoreButtonHTML(groupId);
  },

  /* ── INSTRUCTORS — real photos (data/instructors.json, 128 records
     transcribed from assets/img/instructors/, 4 categories with photos:
     海外教授/学术导师/业界导师/顶尖学者[new]). 教研导师/校友导师 have no
     photos yet and show an empty state rather than fabricated cards. ── */
  INSTRUCTOR_FILTERS: [
    { id: 'all', label: '全部' },
    { id: 'overseas', label: '海外教授' },
    { id: 'research', label: '教研导师' },
    { id: 'academic', label: '学术导师' },
    { id: 'industry', label: '业界导师' },
    { id: 'alumni', label: '校友导师' },
    { id: 'scholar', label: '顶尖学者' },
  ],
  async renderInstructors() {
    this._instructors = await Data.load('instructors');
    document.getElementById('instructors-root').innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">Instructors</span>
        <h2>导师团队</h2>
        <p>来自顶尖高校与业界的导师团队 — 覆盖海外教授、学术导师、业界导师与顶尖学者共 ${this._instructors.length} 位。</p>
      </div>
      <div class="filter-bar fade-up" id="instructors-filter-bar">
        ${this.INSTRUCTOR_FILTERS.map((f, i) => `<button class="filter-btn${i === 0 ? ' is-active' : ''}" data-itype="${f.id}" onclick="HomePage.filterInstructors('${f.id}',this)">${f.label}</button>`).join('')}
      </div>
      <div class="rough-grid fade-up" id="instructors-grid">${this._instructorCardsHTML('all')}</div>`;
  },
  _instructorCardsHTML(typeId) {
    const list = typeId === 'all' ? this._instructors : this._instructors.filter(r => r.category === typeId);
    if (!list.length) {
      return `<div class="tl-gantt-empty" style="padding:32px 0;grid-column:1/-1">该分类暂无导师数据 · 敬请期待</div>`;
    }
    return list.map(r => `
      <div class="person-card">
        <div class="person-card__avatar"><img src="${escapeHTML(r.img)}" alt="" loading="lazy"></div>
        <div class="person-card__name">${escapeHTML(r.name || r.title)}</div>
        ${r.name ? `<div class="person-card__title">${escapeHTML(r.title)}</div>` : ''}
      </div>`).join('');
  },
  filterInstructors(typeId, btn) {
    document.querySelectorAll('#instructors-filter-bar .filter-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    document.getElementById('instructors-grid').innerHTML = this._instructorCardsHTML(typeId);
  },

  /* ── RESOURCES — real company names (from data/companies.json, kept at
     full detail per project decision) run as a marquee, standing in for
     IST's coop-logo network until DAD has its own partner-logo assets.
     v3: animation-duration is now computed from the actual track width
     so the visual scroll SPEED matches IST's (IST's fixed 48s duration
     was calibrated for its own, much shorter, 14-company list — reusing
     that duration verbatim on DAD's 69-company list made the marquee
     run ~5x faster than intended). ── */
  COOP_SPEED_PX_PER_SEC: 47, // IST's own effective speed: 14 cards × (150+12)px / 48s
  renderResources(companies) {
    const names = [];
    Object.values(companies || {}).forEach(byIndustry => {
      Object.keys(byIndustry).forEach(name => names.push(name));
    });
    const track = [...names, ...names].map(name => `
      <div class="coop-card">
        <div class="coop-card__name-cn">${escapeHTML(name)}</div>
      </div>`).join('');
    document.getElementById('resources-root').innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">Network</span>
        <h2>资源网络</h2>
        <p>横跨八大行业方向、深度覆盖的企业资源网络 — 完整的 69 家企业岗位解读见「职业规划」页。</p>
      </div>
      <div class="coop-marquee-section fade-up">
        <div class="coop-marquee-wrap"><div class="coop-marquee-track" id="coop-marquee-track">${track}</div></div>
      </div>`;
    const singleSetWidthPx = names.length * 162; // .coop-card is 150px + 12px gap
    const durationSec = Math.round(singleSetWidthPx / this.COOP_SPEED_PX_PER_SEC);
    const trackEl = document.getElementById('coop-marquee-track');
    if (trackEl) trackEl.style.animationDuration = durationSec + 's';
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
      return `<div class="featured-rail__card" onclick="CourseOverlay.open('${id}')">
        <div class="${bannerCls}"><span class="featured-rail__tag">${escapeHTML(tag)}</span></div>
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

    const rail = document.getElementById('featured-courses-rail');
    const wrap = rail && rail.closest('.featured-rail-wrap');
    if (wrap && 'IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        entries.forEach(e => rail.classList.toggle('is-paused', !e.isIntersecting));
      }, { threshold: 0.1 }).observe(wrap);
    }
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
  _buildCatalogCard({ poster, title, sub, tagLabel, tags }) {
    const hasImg = !!poster;
    const imgStyle = hasImg ? '' : ' style="background:linear-gradient(135deg, var(--color-void) 0%, #2b2b2b 45%, var(--color-accent) 100%)"';
    return `
      <div class="port-card">
        <div class="port-card__img"${imgStyle}>
          ${hasImg ? `<img src="${escapeHTML(poster)}" alt="" loading="lazy">` : `<span class="port-card__img-placeholder">占位图 · Placeholder</span>`}
          ${tagLabel ? `<span class="port-card__cat-tag">${escapeHTML(tagLabel)}</span>` : ''}
        </div>
        <div class="port-card__body">
          <div class="port-card__title">${escapeHTML(title || '')}</div>
          ${sub ? `<div class="port-card__program">${escapeHTML(sub)}</div>` : ''}
          ${tags && tags.length ? `<div class="port-card__tags">${tags.map(t => `<span class="port-card__tag">${escapeHTML(t)}</span>`).join('')}</div>` : ''}
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
    })).join('');
    return `<div class="card-grid">${cards}</div>`;
  },
};
window.HomePage = HomePage;
