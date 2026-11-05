/* ═══════════════════════════════════════════
   DU BLOCKS — renderers for the content blocks listed per tab in
   data/site.json → "tabs". Each block is { type, eyebrow, title, text, … };
   Blocks.render(list) returns the HTML of the whole tab.

   Shared card pieces (CaseCard, OfferGrid, Detail overlays) are also here
   because the regular pages (du-pages.js) reuse them.
═══════════════════════════════════════════ */

const WORK_LABEL = () => Object.fromEntries(DU.data.works.categories.map(c => [c.id, c.label]));

const Blocks = {
  ctx: {},
  /** ctx: { nav, tab } — the track being rendered (track block reads icon / jump links from it) */
  render(list, ctx = {}) {
    this.ctx = ctx;
    this.list = (list || []).map((b, i) => ({ ...b, id: b.id || `sec-${i}` }))
      .filter(b => b.type !== 'cases' || DU.casesFor(b.track).length);
    return this.list.map((b, i) => {
      const fn = this[b.type];
      if (!fn) { console.warn('unknown block', b.type); return ''; }
      const alt = i % 2 ? ' du-sec--alt' : '';
      const cls = b.type === 'track' ? ' du-sec--track' : '';
      return `<section class="section du-sec${alt}${cls}" id="${b.id}"><div class="container">${fn.call(this, b, i)}</div></section>`;
    }).join('');
  },

  /* ── track: standard intro that opens every track (icon + theme from the tab).
       fields: eyebrow, title, tagline, text, img, fit[], facts[{k,v}], stats[{q|cases|value, label}], sticker ── */
  track(b) {
    const tab = this.ctx.tab || {};
    const statVal = (s) => s.value != null ? s.value : s.cases ? DU.casesFor(s.cases).length : DU.count(s.q);
    const jumps = this.list.filter(x => x !== b && x.title);
    return `
      <div class="du-trackintro fade-up">
        <div class="du-trackintro__text">
          <div class="du-trackintro__badge">
            <span class="du-trackintro__ico">${icon(b.icon || tab.icon)}</span>
            <span class="u-en">${esc(b.eyebrow)}</span>
          </div>
          <h2>${esc(b.title)}</h2>
          ${b.tagline ? `<p class="du-trackintro__tag">${esc(b.tagline)}</p>` : ''}
          <p class="du-trackintro__lead">${esc(b.text)}</p>
          ${b.fit ? `<div class="du-trackintro__fit"><h3>适合谁</h3><ul class="du-checks">${b.fit.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>` : ''}
          ${b.facts ? `<dl class="du-trackintro__facts">${b.facts.map(f => `<div><dt>${esc(f.k)}</dt><dd>${esc(f.v)}</dd></div>`).join('')}</dl>` : ''}
          ${jumps.length ? `<nav class="du-jumps" aria-label="本页内容"><span>本页</span>${jumps.map(x =>
            `<button onclick="Router.scrollTo(document.getElementById('${x.id}'))">${esc(x.title)}</button>`).join('')}</nav>` : ''}
        </div>
        <div class="du-trackintro__media">
          <div class="du-trackintro__img du-blob"><img src="${IMG(b.img)}" alt="${esc(b.title)}" loading="lazy"></div>
          ${b.sticker ? `<span class="du-sticker du-trackintro__sticker">${esc(b.sticker)}</span>` : ''}
          <div class="du-trackintro__stats">
            ${(b.stats || []).filter(s => !s.cases || DU.casesFor(s.cases).length).map((s, i) => `<div class="du-trackintro__stat du-trackintro__stat--${i}"><b class="u-mono">${esc(statVal(s))}</b><span>${esc(s.label)}</span></div>`).join('')}
          </div>
        </div>
      </div>`;
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

  /* ── offers: school offer grid from offers.json, in ranking order.
       `countries: [...]` adds a country switch (grid shows one country at a time) ── */
  offers(b) {
    const uid = 'og-' + Math.random().toString(36).slice(2, 7);
    const rows = b.rows || 2;
    if (!b.countries) return this.head(b) + OfferGrid.html(DU.schoolsFor(b.q), uid, rows);
    OfferGrid._q[uid] = b.q || {};
    return this.head(b) + `
      <div class="du-countryswitch fade-up" role="tablist">
        ${b.countries.map((c, i) => `<button class="du-countryswitch__btn${i ? '' : ' is-active'}" role="tab" onclick="OfferGrid.country('${uid}','${jsq(c)}',this)">
          ${esc(c)}<b class="u-mono">${DU.count({ ...(b.q || {}), country: [c] })}</b></button>`).join('')}
      </div>
      <div id="${uid}-wrap">${OfferGrid.html(DU.schoolsFor({ ...(b.q || {}), country: [b.countries[0]] }), uid, rows)}</div>`;
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
      <div class="du-routes du-routes--n${b.items.length} fade-up">
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

  /* ── product: 产品解读 card → overlay (data/products.json). Block `title`
       is the section heading; the card shows the product's own meta, plus its
       报价单 / 比价 buttons (same PdfViewer as the graduate site). ── */
  product(b) {
    const p = DU.data.products[b.product];
    if (!p) return '';
    const m = p.meta;
    return this.head(b) + `
      <div class="du-card du-product fade-up" role="button" tabindex="0"
           onclick="if(!event.target.closest('.cd-compare-btn'))Detail.product('${jsq(b.product)}')"
           onkeydown="if(event.key==='Enter'&&event.target===this)Detail.product('${jsq(b.product)}')">
        <div class="du-product__img du-blob"><img src="${IMG(p.cover)}" alt="${esc(m.titleCn)}" loading="lazy"></div>
        <div class="du-product__body">
          <span class="eyebrow u-en">${esc(m.titleEn)}</span>
          <h3>${esc(m.titleCn)}</h3>
          <p>${esc(m.desc)}</p>
          <div class="du-chips">${(m.chips || []).map(c => `<span class="du-chip">${esc(c)}</span>`).join('')}</div>
          <div class="du-product__actions">
            <span class="btn btn--primary du-btn">查看产品解读</span>
            ${renderCompareButtons('card-' + b.product, p.comparePdf)}
          </div>
        </div>
      </div>`;
  },

  /* ── choose: product / route selector — one card per route with
       目标 / 适合 / 交付 rows, linking to its tab; optional `foot` list ── */
  choose(b) {
    const row = (k, v) => `<div class="du-choose__row"><dt>${k}</dt><dd>${esc(v)}</dd></div>`;
    return this.head(b) + `
      <div class="du-choose fade-up">
        ${b.items.map((it, i) => `
          <a class="du-card du-choose__item" href="#${it.go}">
            <div class="du-choose__top">
              <h3>${esc(it.name)}</h3>
              ${it.sticker ? `<span class="du-sticker du-sticker--${i % 3}">${esc(it.sticker)}</span>` : ''}
            </div>
            <dl>${row('申请目标', it.goal)}${row('适合学生', it.fit)}${row('核心交付', it.deliver)}</dl>
            <span class="du-more">查看路线 <i>→</i></span>
          </a>`).join('')}
      </div>
      ${b.foot ? `<div class="du-choose__foot fade-up"><h3 class="du-subhead">${esc(b.foot.title)}</h3>
        <ul class="du-checks">${b.foot.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}`;
  },

  /* ── schools: target-school list from rankings.json (cleaned 排名文件), ranking order.
       groups: [{ label, lists:['us-dm', …] }]; first `top` (5) shown as feature tiles,
       the rest behind 展开. Ranking numbers are never printed. ── */
  schools(b) {
    const top = b.top || 5;
    return this.head(b) + (b.groups || []).map((g, gi) => {
      const list = DU.rankedSchools(g.lists);
      const uid = 'sl-' + Math.random().toString(36).slice(2, 7);
      return `
      <div class="du-schoolgroup fade-up">
        <h3 class="du-subhead"><i class="du-dot du-dot--${gi % 3}"></i>${esc(g.label)}<small>${list.length} 所</small></h3>
        <div class="du-toplist">${list.slice(0, top).map((s, i) => SchoolTile.feature(s, i)).join('')}</div>
        ${list.length > top ? `
          <div class="du-schoolmap du-schoolmap--rest" id="${uid}" hidden>${list.slice(top).map((s, i) => SchoolTile.ranked(s, i + top)).join('')}</div>
          <div class="du-center"><button class="section-cta" aria-controls="${uid}" aria-expanded="false" onclick="SchoolList.toggle('${uid}', this)">展开其余 ${list.length - top} 所 <span class="u-en">/ more</span></button></div>` : ''}
      </div>`;
    }).join('');
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
          ${i ? (b.alt ? '<div class="du-pathway__or" aria-hidden="true">或</div>' : '<div class="du-pathway__arrow" aria-hidden="true"><span></span></div>') : ''}
          <div class="du-card du-pathway__item">
            <div class="du-pathway__img"><img src="${IMG(it.img)}" alt="${esc(it.school)}" loading="lazy"><span class="du-step u-mono">${esc(it.step)}</span></div>
            <div class="du-pathway__body">
              <h3>${esc(it.school)}</h3>
              <span class="du-en u-en">${esc(it.en)}</span>
              <p>${esc(it.text)}</p>
              <div class="du-chips">${(it.tags || []).map(t => `<span class="du-chip">${esc(t)}</span>`).join('')}</div>
              <div class="du-pathway__foot">
                ${DU.offerCountFor(it.school) ? `<span class="du-pill">26 季 offer × ${DU.offerCountFor(it.school)}</span>` : ''}
                ${it.gallery ? GalleryBtn.html(it.gallery, '课程介绍') : ''}
              </div>
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
    const quote = b.comparePdf ? `<div class="du-head__actions">${renderCompareButtons('profs', b.comparePdf)}</div>` : '';
    return this.head(b, quote) + `
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
const MONO_STOP = new Set(['of', 'the', 'and', 'at', 'for', 'in', 'de', 'di', '&']);
/** short monogram from the English name: "(HKU)" → HKU, University College London → UCL */
function monogram(en, zh) {
  const m = (en || '').match(/\(([A-Z]{2,6})\)/);
  if (m) return m[1];
  const words = (en || '').replace(/[^A-Za-z\s]/g, ' ').split(/\s+/).filter(w => w && !MONO_STOP.has(w.toLowerCase()));
  if (words.length === 1) return words[0].slice(0, 4);
  const ini = words.map(w => w[0].toUpperCase()).join('').slice(0, 4);
  return ini || (zh || '').slice(0, 2);
}

/* ── ranked school list: expand / collapse ── */
const SchoolList = {
  toggle(id, btn) {
    const el = document.getElementById(id);
    const open = el.hidden;
    el.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.innerHTML = open ? '收起' : `展开其余 ${el.children.length} 所 <span class="u-en">/ more</span>`;
    if (!open) Router.scrollTo(el.parentElement);
  },
};

const SchoolTile = {
  /** offers.json schools that match a ranking school (same country) */
  offerInfo(s) {
    const hits = DU.offersForRid(s.id, s.country);
    return { key: hits[0] && hits[0].key, count: hits.reduce((n, h) => n + h.count, 0), cases: hits.reduce((n, h) => n + (h.cases || 0), 0) };
  },
  programLine(s) {
    const p = (s.programs || [])[0];
    if (!p) return '';
    return esc(p.name) + (s.programs.length > 1 ? ` <i>+${s.programs.length - 1}</i>` : '');
  },
  /** top-5 feature tile */
  feature(s, i) {
    const o = this.offerInfo(s);
    const tag = o.count ? 'a' : 'div';
    return `
      <${tag} class="du-card du-topschool"${o.count ? ` href="${Router.href('offers', null, { school: o.key })}"` : ''}>
        <div class="du-topschool__mono du-orb du-orb--${i % 3} u-en">${esc(s.id === 'ual' ? 'UAL' : monogram(s.en, s.zh))}</div>
        <b class="du-topschool__zh">${esc(s.zh)}</b>
        <span class="du-topschool__en u-en">${esc(s.en)}</span>
        <span class="du-topschool__prog u-en">${this.programLine(s)}</span>
        <span class="du-topschool__foot">
          ${o.count ? `<span class="du-pill">26 季 offer × ${o.count}</span>` : '<span class="du-chip">目标院校</span>'}
          ${o.cases ? `<span class="du-chip du-chip--accent">案例 ${o.cases}</span>` : ''}
        </span>
      </${tag}>`;
  },
  /** compact tile for the expanded rest of a ranked list */
  ranked(s, i) {
    const o = this.offerInfo(s);
    return this.html({ zh: s.zh, en: s.en, program: (s.programs || [])[0]?.name, count: o.count, href: o.count ? Router.href('offers', null, { school: o.key }) : '' }, i);
  },
  html(s, i = 0, badge) {
    const n = s.count != null ? s.count : DU.offerCountFor(s.zh);
    const mono = monogram(s.en, s.zh);
    const tag = s.href ? 'a' : 'div';
    return `
      <${tag} class="du-school"${s.href ? ` href="${s.href}"` : ''}>
        <div class="du-school__mono du-orb du-orb--${i % 3} u-en">${esc(mono)}</div>
        <div class="du-school__body">
          <b>${esc(s.zh)}</b>
          ${s.program ? `<span>${esc(s.program)}</span>` : ''}
        </div>
        ${badge ? `<span class="du-school__count du-school__count--text">${esc(badge)}</span>`
          : n ? `<span class="du-school__count u-mono" title="26 季 offer 数">${n}</span>` : ''}
      </${tag}>`;
  },
};

/* ── offer grid (graduate .offer-card) with clamp + expand ── */
const OfferGrid = {
  _rows: {}, _q: {},
  html(list, uid, rows = 2) {
    this._rows[uid] = rows;
    if (!list.length) return `<div class="du-empty">暂无 offer 数据</div>`;
    return `
      <div class="rough-grid du-offers fade-up" id="${uid}" data-rows="${rows}">
        ${list.map(s => `
          <a class="offer-card du-offer${s.top ? ' is-top' : ''}" href="${Router.href('offers', null, { school: s.key })}" title="查看 ${esc(s.zh)} 的 offer">
            ${s.top ? '<span class="du-offer__star" title="顶尖院校">★</span>' : ''}
            <div class="offer-card__count u-mono">${s.count}</div>
            <div class="offer-card__school-zh">${esc(s.zh)}</div>
            <div class="offer-card__school-en u-en">${esc(s.en)}</div>
            ${s.cases ? `<span class="du-offer__case">作品集案例 ${s.cases}</span>` : ''}
          </a>`).join('')}
      </div>
      <div class="du-center" id="${uid}-more"></div>`;
  },
  /** country switch of an `offers` block */
  country(uid, c, btn) {
    btn.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('is-active', b === btn));
    const wrap = document.getElementById(uid + '-wrap');
    wrap.innerHTML = this.html(DU.schoolsFor({ ...(this._q[uid] || {}), country: [c] }), uid, this._rows[uid]);
    wrap.querySelectorAll('.fade-up').forEach(e => e.classList.add('is-visible'));
    const g = document.getElementById(uid);
    if (g) this.clamp(g);
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
          ${c.decision ? `<span class="du-sticker du-sticker--${i % 3}">${esc(c.decision)}</span>`
            : lead.top ? `<span class="du-sticker du-sticker--${i % 3}">顶尖院校</span>` : ''}
          <span class="du-case__type">${esc(labels[c.workType] || '')}</span>
        </div>
        <div class="du-case__body">
          <div class="du-case__who"><b>${esc(c.student)}</b><span>${esc([c.country, c.city].filter(Boolean).join(' · '))}</span></div>
          <div class="du-case__lead">${esc(lead.zh || '')}</div>
          <div class="du-case__major u-en">${esc(lead.major || '')}</div>
          ${more.length ? `<div class="du-case__more">${more.map(o => `<span>${esc(o.abbr)}</span>`).join('')}${c.offers.length > 4 ? `<span>+${c.offers.length - 4}</span>` : ''}</div>` : ''}
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

/* ── button that opens a course-introduction deck in GalleryViewer
   (same registry/dir convention as buildGalleryCoverHTML) ── */
const GalleryBtn = {
  html(g, label = '查看') {
    const dir = `assets/img/course-products/${g.market}/core/${g.slug}`;
    const key = `${g.market}-${g.slug}`;
    GalleryRegistry[key] = { dir, count: g.count, alt: g.alt };
    return `<button type="button" class="section-cta du-gallerybtn" onclick="GalleryViewer.open('${key}')">${esc(label)} <span class="u-en">/ ${g.count} 页</span></button>`;
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

  /* product 解读 overlay — same .cd-* markup as the graduate product pages,
     built from the shared helpers in assets/js/product-sections.js.
     `sections` is an ordered list; each type maps to one renderer below. */
  product(id) {
    const p = DU.data.products[id];
    if (!p) return;
    const m = p.meta;
    const sec = (label, inner) => `
      <section class="cd-section">
        <div class="cd-section__label">${esc(label[0])} <span class="u-en">${esc(label[1])}</span></div>
        ${inner}
      </section>`;
    const note = (t) => t ? `<p class="du-note du-note--block">${esc(t)}</p>` : '';
    const R = {
      lead: (s) => `<p class="cd-lead">${esc(s.text)}</p>`,
      why: (s) => renderWhyGrid(s.items),
      tiers: (s) => renderTierGrid(s.items),
      modules: (s) => renderModuleGrid(s.items, p.market, `cm-${id}`),
      table: (s) => renderCompareTable(s) + note(s.note),
      list: (s) => renderBulletList(s.items),
      timeline: (s) => renderTimeline(s.items),
      fit: (s) => `
        <div class="du-fit${s.notFor ? '' : ' du-fit--single'}">
          <div><h4 class="du-fit__h">适合</h4>${renderBulletList(s.fit)}</div>
          ${s.notFor ? `<div class="du-fit__no"><h4 class="du-fit__h">不建议直接选择</h4>${renderBulletList(s.notFor)}</div>` : ''}
        </div>`,
    };
    Overlay.open(`
      <div class="cd-hero">
        <div class="cd-hero__content">
          <div class="cd-hero__eyebrow">${esc(m.eyebrow)}</div>
          <div class="cd-hero__title-row">
            <h1 class="cd-hero__title">${esc(m.titleCn)}</h1>
            ${renderCompareButtons(id, p.comparePdf)}
          </div>
          <div class="cd-hero__subtitle"><span class="u-en">${esc(m.titleEn)}</span></div>
          <p class="cd-hero__desc">${esc(m.desc)}</p>
          <div class="cd-chips">${(m.chips || []).map(c => `<span class="cd-chip">${esc(c)}</span>`).join('')}</div>
        </div>
        <div class="cd-hero__tile du-blob" aria-hidden="true"><img src="${IMG(p.cover)}" alt="" loading="lazy"></div>
      </div>
      ${p.snapshot ? sec(['速览', 'Snapshot'], `<div class="cd-stat-grid">${p.snapshot.map(x => `<div class="cd-stat"><div class="cd-stat__k">${esc(x.k)}</div><div class="cd-stat__v">${esc(x.v)}</div></div>`).join('')}</div>`) : ''}
      ${(p.sections || []).map(s => R[s.type] ? sec(s.label, R[s.type](s)) : (console.warn('unknown product section', s.type), '')).join('')}
      ${note(p.note)}
    `, { wide: true });
  },

  /* 案例卡: the full card image (offer letters blurred at build time — see
     tools/build-ug-case-images.py) + its content as text */
  case(id) {
    const c = DU.data.cases.find(x => x.id === id);
    if (!c) return;
    const labels = WORK_LABEL();
    Overlay.open(`
      <div class="du-casedetail">
        <button class="du-detail__img du-casedetail__card" onclick="ImageModal.open('${jsq(IMG(c.full))}','${jsq(c.student)} 案例卡')">
          <img src="${IMG(c.full)}" alt="${esc(c.student)} 学生录取案例卡"></button>
        <div class="du-casedetail__cols">
          <div>
            <span class="eyebrow u-en">Student Portfolio &amp; Offer Case</span>
            <h2>${esc(c.student)}<small>${esc([c.country, c.city].filter(Boolean).join(' · '))}</small></h2>
            <div class="du-chips">
              ${c.tags.filter(t => t !== c.country && !(c.country === '澳大利亚' && t === '澳洲')).map(t => `<span class="du-chip">${esc(t)}</span>`).join('')}
              ${c.workType ? `<span class="du-chip du-chip--accent">${esc(labels[c.workType] || '')}</span>` : ''}
            </div>
            <dl class="du-meta">${c.profile.map(p => `<dt>${esc(p.k)}</dt><dd>${esc(p.v)}</dd>`).join('')}</dl>
            ${c.notes.length ? `<h3 class="du-subhead">文书与背景提升</h3>
              ${c.notes.map(n => `<div class="du-casedetail__note"><span class="du-pill">${esc(n.label)}</span>
                <ul>${n.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}` : ''}
          </div>
          <div>
            <h3 class="du-subhead">作品方向</h3>
            <div class="du-chips">${c.directions.map(d => `<span class="du-chip du-chip--accent">${esc(d)}</span>`).join('')}</div>
            <h3 class="du-subhead">作品展示</h3>
            <ol class="du-casedetail__projects">${c.projects.map(p => `<li>${esc(p)}</li>`).join('')}</ol>
            <h3 class="du-subhead">部分录取院校${c.decision ? `<small>${esc(c.decision)}</small>` : ''}</h3>
            <ul class="du-offerlist">
              ${c.offers.map(o => `<li class="${o.top ? 'is-top' : ''}">
                <b>${esc(o.zh)}</b><span class="u-en">${esc(o.abbr)}${o.en ? ' · ' + esc(o.en) : ''}</span><em class="u-en">${esc(o.major)}</em>
                ${o.top ? '<i class="du-pill">顶尖</i>' : ''}</li>`).join('')}
            </ul>
          </div>
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
window.SchoolList = SchoolList; window.monogram = monogram; window.GalleryBtn = GalleryBtn;
