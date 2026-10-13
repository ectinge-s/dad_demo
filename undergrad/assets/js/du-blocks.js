/* ═══════════════════════════════════════════
   DU BLOCKS — renderers for the content blocks listed per tab in
   data/site.json → "tabs". Each block is { type, eyebrow, title, text, … };
   Blocks.render(list) returns the HTML of the whole tab.

   Shared card pieces (CaseCard, OfferGrid, Detail overlays) are also here
   because the regular pages (du-pages.js) reuse them.
═══════════════════════════════════════════ */

const WORK_LABEL = () => Object.fromEntries(DU.data.works.categories.map(c => [c.id, c.label]));

const Blocks = {
  render(list) {
    return (list || []).map((b, i) => {
      const fn = this[b.type];
      if (!fn) { console.warn('unknown block', b.type); return ''; }
      const alt = i % 2 ? ' du-sec--alt' : '';
      return `<section class="section du-sec${alt}"${b.id ? ` id="${b.id}"` : ''}><div class="container">${fn.call(this, b, i)}</div></section>`;
    }).join('');
  },

  head(b, extra = '') {
    if (!b.title && !b.eyebrow) return '';
    return `
      <div class="section-head du-head fade-up">
        ${b.eyebrow ? `<span class="eyebrow u-en">${esc(b.eyebrow)}</span>` : ''}
        ${b.title ? `<h2>${esc(b.title)}</h2>` : ''}
        ${b.text ? `<p>${esc(b.text)}</p>` : ''}
        ${extra}
      </div>`;
  },

  /* ── intro: text + image ── */
  intro(b) {
    return `
      <div class="du-intro fade-up">
        <div class="du-intro__text">${this.head(b)}</div>
        ${b.img ? `<div class="du-intro__img du-blob"><img src="${IMG(b.img)}" alt="${esc(b.title)}" loading="lazy"></div>` : ''}
      </div>`;
  },

  /* ── offers: school offer grid from offers.json ── */
  offers(b) {
    const uid = 'og-' + Math.random().toString(36).slice(2, 7);
    return this.head(b) + OfferGrid.html(DU.schoolsFor(b.q), uid, b.rows || 2);
  },

  /* ── compare: two-column Maker vs Art ── */
  compare(b) {
    const side = (s, cls) => `
      <div class="du-compare__side ${cls}">
        <span class="du-pill">${esc(s.label)}</span>
        <h3>${esc(s.title)}</h3>
        <ul class="du-checks">${s.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
      </div>`;
    return this.head(b) + `
      <div class="du-compare fade-up">
        ${side(b.left, 'du-compare__side--a')}
        <div class="du-compare__vs u-en" aria-hidden="true">VS</div>
        ${side(b.right, 'du-compare__side--b')}
      </div>`;
  },

  /* ── routes: big image cards linking to tabs ── */
  routes(b) {
    return this.head(b) + `
      <div class="du-routes fade-up">
        ${b.items.map((r, i) => `
          <a class="du-card du-route" href="#${r.go}">
            <div class="du-route__img"><img src="${IMG(r.img)}" alt="${esc(r.title)}" loading="lazy">
              ${r.sticker ? `<span class="du-sticker du-sticker--${i % 3}">${esc(r.sticker)}</span>` : ''}</div>
            <div class="du-route__body">
              <h3>${esc(r.title)}</h3>
              <p>${esc(r.text)}</p>
              <span class="du-more">进入路线 <i>→</i></span>
            </div>
          </a>`).join('')}
      </div>`;
  },

  /* ── product: 产品解读 card → overlay ── */
  product(b) {
    const p = DU.data.site.products[b.product];
    if (!p) return '';
    return this.head(b) + `
      <div class="du-card du-product fade-up" onclick="Detail.product('${jsq(b.product)}')" role="button" tabindex="0">
        <div class="du-product__img du-blob"><img src="${IMG(p.img)}" alt="${esc(p.title)}" loading="lazy"></div>
        <div class="du-product__body">
          ${p.badge ? `<span class="du-sticker du-sticker--1">${esc(p.badge)}</span>` : ''}
          <span class="eyebrow u-en">${esc(p.en)}</span>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.summary)}</p>
          <div class="du-chips">${(p.chips || []).map(c => `<span class="du-chip">${esc(c)}</span>`).join('')}</div>
          <span class="btn btn--primary du-btn">查看产品解读</span>
        </div>
      </div>`;
  },

  /* ── schools: grid map of target schools ── */
  schools(b) {
    const groups = DU.data.site.schoolLists[b.list] || [];
    return this.head(b) + groups.map((g, gi) => `
      <div class="du-schoolgroup fade-up">
        <h3 class="du-subhead"><i class="du-dot du-dot--${gi % 3}"></i>${esc(g.group)}</h3>
        <div class="du-schoolmap">
          ${g.schools.map((s, i) => SchoolTile.html(s, gi * 3 + i)).join('')}
        </div>
      </div>`).join('');
  },

  /* ── cases: case cards with an optional work-type filter ── */
  cases(b) {
    const list = DU.casesFor(b.track);
    const uid = 'cg-' + b.track;
    let filter = '';
    if (b.filter === 'workType') {
      const labels = WORK_LABEL();
      const types = [...new Set(list.map(c => c.workType))];
      filter = `<div class="filter-bar du-filter fade-up" data-for="${uid}">
        <button class="filter-btn is-active" onclick="CaseGrid.filter('${uid}','',this)">全部作品类型</button>
        ${types.map(t => `<button class="filter-btn" onclick="CaseGrid.filter('${uid}','${t}',this)">${esc(labels[t] || t)}</button>`).join('')}
      </div>`;
    }
    return this.head(b) + filter + CaseGrid.html(list, uid);
  },

  /* ── quote: the one-liner ── */
  quote(b) {
    return `
      <div class="du-quote fade-up">
        ${b.eyebrow ? `<span class="eyebrow u-en">${esc(b.eyebrow)}</span>` : ''}
        <blockquote>${esc(b.text)}</blockquote>
        ${b.by ? `<cite>— ${esc(b.by)}</cite>` : ''}
      </div>`;
  },

  /* ── directions: 特长爬藤 方向分类 → schools + cases ── */
  directions(b) {
    const dirs = DU.data.site.talentDirections;
    return this.head(b) + `
      <div class="du-dirs fade-up">
        ${dirs.map((d, i) => `<button class="du-dir${i === 0 ? ' is-active' : ''}" onclick="Directions.pick('${d.id}',this)">
          <i class="du-dot du-dot--${i % 3}"></i>${esc(d.label)}
          ${DU.casesFor('us-talent').some(c => c.direction === d.label) ? '<b class="du-dir__flag">有案例</b>' : ''}
        </button>`).join('')}
      </div>
      <div id="du-dir-panel" class="du-dir-panel fade-up">${Directions.panel(dirs[0])}</div>`;
  },

  /* ── video: poster + play button (src optional) ── */
  video(b) {
    return this.head(b) + `<div class="fade-up">${VideoBox.html(b.poster, b.caption, b.src)}</div>`;
  },

  /* ── endorse: 官方合作背书 / 认证 / 教授视频 ── */
  endorse(b) {
    const icon = { doc: '📄', badge: '🏅', video: '▶' };
    return this.head(b) + `
      <div class="du-endorse fade-up">
        ${b.items.map((it, i) => it.kind === 'video' ? `
          <div class="du-card du-endorse__item du-endorse__item--video">
            ${VideoBox.html(it.poster, it.text, it.src)}
            <h3>${esc(it.title)}</h3>
          </div>` : `
          <div class="du-card du-endorse__item">
            <div class="du-endorse__icon du-orb du-orb--${i % 3}" aria-hidden="true">${icon[it.kind] || '★'}</div>
            <h3>${esc(it.title)}</h3>
            <p>${esc(it.text)}</p>
          </div>`).join('')}
      </div>`;
  },

  /* ── handbook: 全日制手册 — stats + feature cards + flip-through ── */
  handbook(b) {
    return this.head(b) + `
      <div class="du-bubbles fade-up">
        ${b.stats.map((s, i) => `<div class="du-bubble du-bubble--${i % 4}"><b class="u-mono">${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}
      </div>
      <div class="du-feature-grid fade-up">
        ${b.cards.map((c, i) => `
          <div class="du-card du-feature">
            <div class="du-feature__img" onclick="ImageModal.open('${jsq(IMG(c.img))}','${jsq(c.title)}')"><img src="${IMG(c.img)}" alt="${esc(c.title)}" loading="lazy"></div>
            <div class="du-feature__body">
              <span class="du-num u-mono">${String(i + 1).padStart(2, '0')}</span>
              <h3>${esc(c.title)}</h3>
              <p>${esc(c.text)}</p>
              <div class="du-chips">${(c.tags || []).map(t => `<span class="du-chip">${esc(t)}</span>`).join('')}</div>
            </div>
          </div>`).join('')}
      </div>
      ${b.pages ? `<div class="du-center fade-up"><button class="section-cta" onclick="Detail.flipbook('${jsq(b.title)}', ${esc(JSON.stringify(b.pages))})">翻阅全日制手册 <span class="u-en">/ ${b.pages.length} pages</span></button></div>` : ''}`;
  },

  /* ── rank: A-Level 高分率榜单 ── */
  rank(b) {
    return this.head(b) + `
      <div class="du-rank fade-up">
        <div class="du-rank__stats">
          ${b.stats.map((s, i) => `
            <div class="du-card du-rank__stat">
              <span class="du-rank__medal du-orb du-orb--${i % 3}">${i + 1}</span>
              <b class="u-mono">${esc(s.value)}</b><span>${esc(s.label)}</span>
            </div>`).join('')}
        </div>
        ${b.board ? `<button class="du-card du-rank__board" onclick="ImageModal.open('${jsq(IMG(b.board))}','${jsq(b.title)}')">
          <img src="${IMG(b.board)}" alt="${esc(b.title)}" loading="lazy"><span class="du-pill">查看完整榜单</span></button>` : ''}
      </div>`;
  },

  /* ── pathway: 1+2 金匠 → 考文垂 ── */
  pathway(b) {
    return this.head(b) + `
      <div class="du-pathway fade-up">
        ${b.items.map((it, i) => `
          ${i ? '<div class="du-pathway__arrow" aria-hidden="true"><span></span></div>' : ''}
          <div class="du-card du-pathway__item">
            <div class="du-pathway__img"><img src="${IMG(it.img)}" alt="${esc(it.school)}" loading="lazy"><span class="du-step u-mono">${esc(it.step)}</span></div>
            <div class="du-pathway__body">
              <h3>${esc(it.school)}</h3>
              <span class="du-en u-en">${esc(it.en)}</span>
              <p>${esc(it.text)}</p>
              <div class="du-chips">${(it.tags || []).map(t => `<span class="du-chip">${esc(t)}</span>`).join('')}</div>
              ${DU.offerCountFor(it.school) ? `<span class="du-pill">26 季 offer × ${DU.offerCountFor(it.school)}</span>` : ''}
            </div>
          </div>`).join('')}
      </div>`;
  },

  /* ── routes2: two application routes side by side (JUPAS) ── */
  routes2(b) {
    return this.head(b) + `
      <div class="du-compare du-compare--plain fade-up">
        ${b.items.map((it, i) => `
          <div class="du-compare__side du-compare__side--${i ? 'b' : 'a'}">
            <span class="du-pill">${esc(it.label)}</span>
            <h3>${esc(it.title)}</h3>
            <ul class="du-checks">${it.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
          </div>`).join('')}
      </div>`;
  },

  /* ── resources: admissions offices ── */
  resources(b) {
    return this.head(b) + `
      <div class="du-schoolmap du-schoolmap--res fade-up">
        ${b.items.map((s, i) => SchoolTile.html({ zh: s.school, en: s.en, program: s.text }, i, '招生办')).join('')}
      </div>`;
  },

  /* ── showreel: auto-scrolling strip of video tiles ── */
  showreel(b) {
    const tile = (it) => `
      <div class="du-reel__tile">${VideoBox.html(it.poster, it.title, it.src, true)}</div>`;
    return this.head(b) + `
      <div class="du-reel fade-up" aria-label="showreel">
        <div class="du-reel__track">${b.items.map(tile).join('')}${b.items.map(tile).join('')}</div>
      </div>`;
  },

  /* ── profs: 合作教授 grid map → overlay ── */
  profs(b) {
    return this.head(b) + `
      <div class="du-profs fade-up">
        ${DU.data.professors.map((p, i) => `
          <button class="du-card du-prof" onclick="Detail.prof('${p.id}')">
            <div class="du-prof__cover"><img src="${IMG(p.cover)}" alt="" loading="lazy"></div>
            <div class="du-prof__avatar du-orb du-orb--${i % 3}">${p.photo ? `<img src="${IMG(p.photo)}" alt="">` : `<span class="u-en">${esc(p.name.replace(/^Prof\.\s*/, '').slice(0, 2))}</span>`}</div>
            <div class="du-prof__body">
              <h3 class="u-en">${esc(p.name)}</h3>
              <p class="du-prof__school">${esc(p.school)} · <span class="u-en">${esc(p.dept)}</span></p>
              <span class="du-chip">${esc(p.season)} · ${esc(p.class)}</span>
            </div>
          </button>`).join('')}
      </div>`;
  },
};

/* ── school tile (monogram + name + offer count) ── */
const SchoolTile = {
  html(s, i = 0, badge) {
    const n = s.count != null ? s.count : DU.offerCountFor(s.zh);
    const mono = (s.en || s.zh).replace(/[^A-Za-z]/g, '').slice(0, 4) || s.zh.slice(0, 2);
    return `
      <div class="du-school">
        <div class="du-school__mono du-orb du-orb--${i % 3} u-en">${esc(mono)}</div>
        <div class="du-school__body">
          <b>${esc(s.zh)}</b>
          ${s.program ? `<span>${esc(s.program)}</span>` : ''}
        </div>
        ${badge ? `<span class="du-school__count du-school__count--text">${esc(badge)}</span>`
          : n ? `<span class="du-school__count u-mono" title="26 季 offer 数">${n}</span>` : ''}
      </div>`;
  },
};

/* ── offer grid (graduate .offer-card) with clamp + expand ── */
const OfferGrid = {
  _rows: {},
  html(list, uid, rows = 2) {
    this._rows[uid] = rows;
    if (!list.length) return `<div class="du-empty">暂无 offer 数据</div>`;
    return `
      <div class="rough-grid du-offers fade-up" id="${uid}" data-rows="${rows}">
        ${list.map(s => `
          <div class="offer-card du-offer${s.top ? ' is-top' : ''}">
            ${s.top ? '<span class="du-offer__star" title="顶尖院校">★</span>' : ''}
            <div class="offer-card__count u-mono">${s.count}</div>
            <div class="offer-card__school-zh">${esc(s.zh)}</div>
            <div class="offer-card__school-en u-en">${esc(s.en)}</div>
          </div>`).join('')}
      </div>
      <div class="du-center" id="${uid}-more"></div>`;
  },
  /** clamp every grid on the page to its rows, add 查看更多 */
  clampAll(root = document) {
    root.querySelectorAll('.du-offers[data-rows]').forEach(g => this.clamp(g));
  },
  clamp(grid, open = grid.classList.contains('is-open')) {
    const cards = [...grid.children];
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length || 1;
    const limit = cols * Number(grid.dataset.rows || 2);
    cards.forEach((c, i) => { c.hidden = !open && i >= limit; });
    const more = document.getElementById(grid.id + '-more');
    if (!more) return;
    more.innerHTML = cards.length <= limit ? '' :
      `<button class="section-cta" onclick="OfferGrid.toggle('${grid.id}')">${open ? '收起' : `查看全部 <span class="u-en">/ ${cards.length - limit} more</span>`}</button>`;
  },
  toggle(id) {
    const g = document.getElementById(id);
    g.classList.toggle('is-open');
    this.clamp(g);
    if (!g.classList.contains('is-open')) Router.scrollTo(g);
  },
};
let _clampT;
window.addEventListener('resize', () => { clearTimeout(_clampT); _clampT = setTimeout(() => OfferGrid.clampAll(), 150); });

/* ── case cards ── */
const CaseGrid = {
  html(list, uid) {
    if (!list.length) return `<div class="du-empty du-empty--cute">案例整理中，敬请期待</div>`;
    return `<div class="du-cases fade-up" id="${uid}">${list.map((c, i) => CaseCard.html(c, i)).join('')}</div>`;
  },
  filter(uid, type, btn) {
    btn.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('is-active', b === btn));
    document.querySelectorAll(`#${uid} .du-case`).forEach(el => { el.hidden = !!type && el.dataset.type !== type; });
  },
};

const CaseCard = {
  html(c, i = 0) {
    const lead = c.offers[0] || {};
    const more = c.offers.slice(1, 4);
    const labels = WORK_LABEL();
    return `
      <button class="du-card du-case" data-type="${esc(c.workType)}" onclick="Detail.case('${c.id}')">
        <div class="du-case__img">
          <img src="${IMG(c.thumb)}" alt="${esc(c.student)}作品" loading="lazy">
          ${lead.top ? `<span class="du-sticker du-sticker--${i % 3}">顶尖院校</span>` : ''}
          <span class="du-case__type">${esc(labels[c.workType] || '')}</span>
        </div>
        <div class="du-case__body">
          <div class="du-case__who"><b>${esc(c.student)}</b><span>${esc(c.city)}</span>${c.direction ? `<span class="du-chip du-chip--accent">${esc(c.direction)}</span>` : ''}</div>
          <div class="du-case__lead">${esc(lead.zh || '')}</div>
          <div class="du-case__major u-en">${esc(lead.major || '')}</div>
          ${more.length ? `<div class="du-case__more">${more.map(o => `<span>${esc(o.zh)}</span>`).join('')}${c.offers.length > 4 ? `<span>+${c.offers.length - 4}</span>` : ''}</div>` : ''}
        </div>
      </button>`;
  },
};

/* ── 特长爬藤 direction picker ── */
const Directions = {
  pick(id, btn) {
    btn.parentElement.querySelectorAll('.du-dir').forEach(b => b.classList.toggle('is-active', b === btn));
    const d = DU.data.site.talentDirections.find(x => x.id === id);
    document.getElementById('du-dir-panel').innerHTML = this.panel(d);
  },
  panel(d) {
    const cases = DU.casesFor('us-talent').filter(c => c.direction === d.label);
    return `
      <div class="du-dir-panel__head">
        <h3>${esc(d.label)}</h3><p>${esc(d.text)}</p>
      </div>
      ${d.schools.length ? `<div class="du-schoolmap du-schoolmap--sm">${d.schools.map((s, i) => SchoolTile.html({ zh: s }, i)).join('')}</div>` : ''}
      <h4 class="du-subhead">录取案例</h4>
      ${cases.length ? `<div class="du-cases">${cases.map((c, i) => CaseCard.html(c, i)).join('')}</div>`
        : `<div class="du-empty du-empty--cute">该方向案例整理中</div>`}`;
  },
};

/* ── video placeholder ── */
const VideoBox = {
  html(poster, caption, src, small) {
    if (src) return `<div class="du-video${small ? ' du-video--sm' : ''}"><video src="${esc(src)}" poster="${IMG(poster)}" controls preload="none"></video></div>`;
    return `
      <div class="du-video${small ? ' du-video--sm' : ''}" title="视频待上传">
        <img src="${IMG(poster)}" alt="${esc(caption || '')}" loading="lazy">
        <span class="du-video__play" aria-hidden="true"></span>
        ${caption ? `<span class="du-video__cap">${esc(caption)}</span>` : ''}
      </div>`;
  },
};

/* ── DETAIL overlays (product / case / work / professor / flipbook) ── */
const Detail = {
  posterWall(title, n, sub) {
    return `<div class="du-posters">${Array.from({ length: n }, (_, i) => {
      const src = Poster.svg(`${title} ${String(i + 1).padStart(2, '0')}`, sub, i);
      return `<button class="du-poster" onclick="ImageModal.open(this.querySelector('img').src,'${jsq(title)}')"><img src="${src}" alt="${esc(title)} 海报 ${i + 1}"></button>`;
    }).join('')}</div>`;
  },

  product(id) {
    const p = DU.data.site.products[id];
    Overlay.open(`
      <div class="cd-hero">
        <div class="cd-hero__content">
          <div class="cd-hero__eyebrow u-en">${esc(p.en)}</div>
          <h1 class="cd-hero__title">${esc(p.title)}</h1>
          <p class="cd-hero__desc">${esc(p.summary)}</p>
          <div class="cd-chips">${(p.chips || []).map(c => `<span class="cd-chip">${esc(c)}</span>`).join('')}</div>
        </div>
        <div class="cd-hero__tile du-blob"><img src="${IMG(p.img)}" alt="" style="width:100%;height:100%;object-fit:cover"></div>
      </div>
      ${p.stats ? `<div class="cd-section"><div class="cd-section__label">产品概览 <span class="u-en">Overview</span></div>
        <div class="cd-stat-grid">${p.stats.map(s => `<div class="cd-stat"><div class="cd-stat__k">${esc(s.k)}</div><div class="cd-stat__v">${esc(s.v)}</div></div>`).join('')}</div></div>` : ''}
      ${p.why ? `<div class="cd-section"><div class="cd-section__label">产品亮点 <span class="u-en">Highlights</span></div>
        <div class="cd-why-grid">${p.why.map((w, i) => `<div class="cd-why"><div class="cd-why__num u-mono">${String(i + 1).padStart(2, '0')}</div><div class="cd-why__title">${esc(w.title)}</div><div class="cd-why__desc">${esc(w.text)}</div></div>`).join('')}</div></div>` : ''}
      ${p.timeline ? `<div class="cd-section"><div class="cd-section__label">规划节奏 <span class="u-en">Timeline</span></div>
        <div class="du-steps">${p.timeline.map((t, i) => `<div class="du-steps__item"><span class="du-step u-mono">${i + 1}</span><b>${esc(t.title)}</b><em class="u-mono">${esc(t.day)}</em><p>${esc(t.desc)}</p></div>`).join('')}</div></div>` : ''}
      ${p.posters ? `<div class="cd-section"><div class="cd-section__label">课程海报墙 <span class="u-en">Posters</span></div>${this.posterWall(p.title, p.posters, '课程海报')}</div>` : ''}
    `, { wide: true });
  },

  case(id) {
    const c = DU.data.cases.find(x => x.id === id);
    const labels = WORK_LABEL();
    Overlay.open(`
      <div class="du-detail">
        <div class="du-detail__media">
          <button class="du-detail__img" onclick="ImageModal.open('${jsq(IMG(c.full))}','${jsq(c.student)}')"><img src="${IMG(c.full)}" alt="${esc(c.student)}作品"></button>
          <p class="du-note">案例卡海报待上传，当前为作品占位图</p>
        </div>
        <div class="du-detail__info">
          <span class="eyebrow u-en">Case Card</span>
          <h2>${esc(c.student)}<small>${esc(c.city)}</small></h2>
          <div class="du-chips">
            ${c.bg ? `<span class="du-chip">${esc(c.bg)}</span>` : ''}
            <span class="du-chip">${esc(c.major)}</span>
            ${c.workType ? `<span class="du-chip du-chip--accent">${esc(labels[c.workType] || '')}</span>` : ''}
            ${c.direction ? `<span class="du-chip du-chip--accent">${esc(c.direction)}</span>` : ''}
          </div>
          <h3 class="du-subhead">录取 offer</h3>
          <ul class="du-offerlist">
            ${c.offers.map(o => `<li class="${o.top ? 'is-top' : ''}">
              <b>${esc(o.zh)}</b><span class="u-en">${esc(o.en)}</span><em class="u-en">${esc(o.major)}</em>
              ${o.top ? '<i class="du-pill">顶尖</i>' : ''}</li>`).join('')}
          </ul>
        </div>
      </div>`, { wide: true });
  },

  work(id) {
    const w = DU.data.works.works.find(x => x.id === id);
    const cat = DU.data.works.categories.find(c => c.id === w.category);
    const ages = DU.data.works.ages.filter(a => w.ages.includes(a.id));
    Overlay.open(`
      <div class="du-detail">
        <div class="du-detail__media">
          ${w.images.map(src => `<button class="du-detail__img" onclick="ImageModal.open('${jsq(IMG(src))}','${jsq(w.title)}')"><img src="${IMG(src)}" alt="${esc(w.title)}"></button>`).join('')}
        </div>
        <div class="du-detail__info">
          <span class="eyebrow u-en">Student Work</span>
          <h2>${esc(w.title)}</h2>
          <div class="du-chips">
            <span class="du-chip du-chip--accent">${esc(cat ? cat.label : '')}</span>
            ${ages.map(a => `<span class="du-chip">${esc(a.label)}</span>`).join('')}
          </div>
          <p class="du-detail__desc">${esc(w.desc)}</p>
          <dl class="du-meta">
            <dt>作者</dt><dd>${esc(w.student)}</dd>
            <dt>年级</dt><dd>${esc(w.grade)}</dd>
            ${w.school ? `<dt>录取</dt><dd>${esc(w.school)}</dd>` : ''}
          </dl>
        </div>
      </div>`, { wide: true });
  },

  prof(id) {
    const p = DU.data.professors.find(x => x.id === id);
    const i = DU.data.professors.indexOf(p);
    Overlay.open(`
      <div class="du-prof-detail">
        <div class="du-prof-detail__head">
          <div class="du-prof__avatar du-prof__avatar--lg du-orb du-orb--${i % 3}">${p.photo ? `<img src="${IMG(p.photo)}" alt="">` : `<span class="u-en">${esc(p.name.replace(/^Prof\.\s*/, '').slice(0, 2))}</span>`}</div>
          <div>
            <span class="eyebrow u-en">${esc(p.season)} · Professor</span>
            <h2 class="u-en">${esc(p.name)}</h2>
            <p>${esc(p.school)} · <span class="u-en">${esc(p.dept)}</span></p>
            <div class="du-chips"><span class="du-chip du-chip--accent">${esc(p.class)}</span></div>
          </div>
        </div>
        <div class="cd-section"><div class="cd-section__label">教授介绍 <span class="u-en">About</span></div><p class="du-detail__desc">${esc(p.bio)}</p></div>
        <div class="cd-section"><div class="cd-section__label">开设课程 <span class="u-en">Class Posters</span></div>${this.posterWall(p.class, p.posters || 3, p.name)}</div>
        <div class="cd-section"><div class="cd-section__label">学生产出 <span class="u-en">Outputs</span></div>
          <div class="du-outputs">${(p.outputs || []).map(src => `<button class="du-detail__img" onclick="ImageModal.open('${jsq(IMG(src))}','')"><img src="${IMG(src)}" alt=""></button>`).join('')}</div>
          ${p.pdf ? `<a class="section-cta" href="${esc(p.pdf)}" target="_blank" rel="noopener">查看录取成果 PDF</a>` : '<p class="du-note">录取成果 PDF 待上传</p>'}
        </div>
      </div>`, { wide: true });
  },

  flipbook(title, pages) {
    Overlay.open(`
      <div class="du-flip">
        <span class="eyebrow u-en">Handbook</span><h2>${esc(title)}</h2>
        <div class="du-flip__pages">${pages.map((src, i) => `
          <button class="du-flip__page" onclick="ImageModal.open('${jsq(IMG(src))}','')"><img src="${IMG(src)}" alt="第 ${i + 1} 页" loading="lazy"><span class="u-mono">${String(i + 1).padStart(2, '0')}</span></button>`).join('')}
        </div>
        <p class="du-note">完整手册 PDF 待上传，当前为手册内页节选</p>
      </div>`, { wide: true });
  },
};

window.Blocks = Blocks; window.OfferGrid = OfferGrid; window.CaseGrid = CaseGrid; window.CaseCard = CaseCard;
window.Directions = Directions; window.Detail = Detail; window.SchoolTile = SchoolTile; window.VideoBox = VideoBox;
