/* ═══════════════════════════════════════════
   HOME PAGE — restructured 2026-09 to match IST's (wip branch) section
   order: Hero → 职业规划 teaser → offers → instructors → resources →
   courses. All the detailed career-planning content that used to live
   here (industries grid, heatmap, JD decoder, overseas pathways, FAQ,
   quiz, roadmap, capabilities, data insights) has moved to the full
   /planning page — see assets/js/pages/planning.js. Offers/instructors
   are rough placeholder rows per GM's request; timeline/course-products
   are copied from IST as-is (assets/js/pages/timeline.js,
   assets/js/pages/course-products.js, assets/js/course-demo.js).

   v3 (2026-09 style pass): hero rebuilt to resemble IST's richer hero
   (grid bg, blooms, HUD corners, top readout, floating logomark, plus
   the border-separated stat row) MINUS the comet mouse-follow effect
   and IST's fonts; offers/instructors gained IST's own filter-tag
   categories; the resources marquee speed is now computed from item
   count so it visually matches IST's pace instead of inheriting IST's
   fixed duration (which was far too fast for DAD's larger company list).
═══════════════════════════════════════════ */

const HomePage = {
  async render(data) {
    const { site, industries, companies } = data;
    this.renderHero(site.hero);
    this.renderCareerTeaser(industries);
    this.renderOffersPlaceholder();
    this.renderInstructorsPlaceholder();
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

  /* ── OFFERS / INSTRUCTORS — rough placeholders ("随便做两行看看视觉效果").
     Real layout/styling (borrowed from IST's .offer-card / .person-card),
     generic example rows only — no fabricated school/instructor data.
     v3: added IST's own filter-tag categories (visual placeholder —
     switches which example rows show, real filtering arrives with
     real data). ── */
  OFFER_FILTERS: [
    { id: 'US', label: '🇺🇸 美国' },
    { id: 'UK', label: '🇬🇧 英国' },
    { id: 'HK_SG', label: '🇭🇰 港新' },
    { id: 'OTHER', label: '🌏 其他' },
  ],
  OFFER_ROWS: {
    US:    ['67','32','19','11','8','25','14','41','9','23','6','17'],
    UK:    ['54','29','22','16','10','19','12','35','7','21','15','9'],
    HK_SG: ['38','24','17','13','9','15','11','20','6','14','8','12'],
    OTHER: ['22','16','11','9','7','13','8','15','5','10','6','9'],
  },
  renderOffersPlaceholder() {
    document.getElementById('offers-root').innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">Offers 2026</span>
        <h2>offer 展示</h2>
        <p>2026 申请季录取战报区块 — 覆盖美国、英国、港新与全球院校，布局与样式已就位，待接入真实 offer 数据后上线。</p>
      </div>
      <div class="pending-badge">⏳ 内容筹备中</div>
      <div class="filter-bar fade-up" id="offers-filter-bar">
        ${this.OFFER_FILTERS.map((f, i) => `<button class="filter-btn${i === 0 ? ' is-active' : ''}" data-group="${f.id}" onclick="HomePage.filterOffers('${f.id}',this)">${f.label}</button>`).join('')}
      </div>
      <div class="rough-grid fade-up" id="offers-grid">${this._offerRowsHTML('US')}</div>`;
  },
  _offerRowsHTML(groupId) {
    return (this.OFFER_ROWS[groupId] || []).map(n => `
      <div class="offer-card">
        <div class="offer-card__count u-mono">${n}</div>
        <div class="offer-card__school-zh">院校示例</div>
        <div class="offer-card__school-en u-en">School Example</div>
      </div>`).join('');
  },
  filterOffers(groupId, btn) {
    document.querySelectorAll('#offers-filter-bar .filter-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    document.getElementById('offers-grid').innerHTML = this._offerRowsHTML(groupId);
  },

  INSTRUCTOR_FILTERS: [
    { id: 'all', label: '全部' },
    { id: 'overseas', label: '海外教授' },
    { id: 'research', label: '教研导师' },
    { id: 'academic', label: '学术导师' },
    { id: 'industry', label: '业界导师' },
    { id: 'alumni', label: '校友导师' },
  ],
  renderInstructorsPlaceholder() {
    const ALL = ['overseas','research','academic','industry','alumni','overseas','research','academic','industry','alumni','overseas','research'];
    this._instructorRoles = ALL;
    document.getElementById('instructors-root').innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">Instructors</span>
        <h2>导师团队</h2>
        <p>来自顶尖高校与业界的导师团队区块 — 布局与样式已就位，待接入真实导师数据后上线。</p>
      </div>
      <div class="pending-badge">⏳ 内容筹备中</div>
      <div class="filter-bar fade-up" id="instructors-filter-bar">
        ${this.INSTRUCTOR_FILTERS.map((f, i) => `<button class="filter-btn${i === 0 ? ' is-active' : ''}" data-itype="${f.id}" onclick="HomePage.filterInstructors('${f.id}',this)">${f.label}</button>`).join('')}
      </div>
      <div class="rough-grid fade-up" id="instructors-grid">${this._instructorCardsHTML('all')}</div>`;
  },
  INSTRUCTOR_LABEL: { overseas: '海外教授', research: '教研导师', academic: '学术导师', industry: '业界导师', alumni: '校友导师' },
  _instructorCardsHTML(typeId) {
    const roles = typeId === 'all' ? this._instructorRoles : this._instructorRoles.filter(r => r === typeId);
    return roles.map(r => `
      <div class="person-card">
        <div class="person-card__avatar">?</div>
        <div class="person-card__name">导师示例</div>
        <div class="person-card__title">${escapeHTML(this.INSTRUCTOR_LABEL[r])}</div>
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
};
