/* ═══════════════════════════════════════════
   DU PAGES — the three hero pages share one hero renderer (graduate
   hero shell + floating media bubbles); their tab content comes from
   data/site.json → "tabs" through Blocks. offer 一览 / 翠鹿榜 / 作品案例
   are regular pages with a plain page head instead of a hero.
═══════════════════════════════════════════ */

const Hero = {
  render(page) {
    const root = document.getElementById('hero-root');
    const h = DU.data.site.heroes[page];
    if (!h) { root.hidden = true; root.innerHTML = ''; return; }
    root.hidden = false;
    root.dataset.page = page;
    const statVal = (s) => s.value != null ? s.value
      : s.count ? String((DU.data[s.count] || []).length)
      : String(DU.count(s.q));
    root.innerHTML = `
      <div class="hero__grid" aria-hidden="true"></div>
      <div class="hero__bloom hero__bloom--a" aria-hidden="true"></div>
      <div class="hero__bloom hero__bloom--b" aria-hidden="true"></div>
      <div class="hero__scan" aria-hidden="true"></div>
      <div class="hero__hud hero__hud--tl" aria-hidden="true"></div>
      <div class="hero__hud hero__hud--tr" aria-hidden="true"></div>
      <div class="hero__hud hero__hud--bl" aria-hidden="true"></div>
      <div class="hero__hud hero__hud--br" aria-hidden="true"></div>
      <div class="hero__readout" aria-hidden="true">
        <span>SFK Digital Arts & Design · Undergraduate</span>
        <span>${esc(DU.navItem(page).en)}</span>
        <span class="hero__readout-live"><i></i> ${esc(DU.data.offers.meta.season)}</span>
      </div>
      <div class="container du-hero__inner">
        <div class="hero__content du-hero__content">
          <span class="eyebrow eyebrow--on-void u-en">${esc(h.eyebrow)}</span>
          <h1>${esc(h.title)}<span class="accent du-hero__accent">${esc(h.accent)}</span></h1>
          <p class="hero__subtitle">${esc(h.subtitle)}</p>
          <div class="hero__ctas">
            ${h.ctas.map(c => `<button class="btn ${c.primary ? 'btn--primary' : 'btn--ghost-on-void'}"
              onclick='Router.go(${JSON.stringify(c.go)}, ${JSON.stringify({ anchor: c.anchor, query: c.query })})'>${esc(c.label)}</button>`).join('')}
          </div>
          <div class="hero__stats">
            ${h.stats.map(s => `
              <div class="stat-card stat-card--void">
                <div class="stat-card__value u-mono">${esc(statVal(s))}</div>
                <div class="stat-card__label">${esc(s.label)}</div>
              </div>`).join('')}
          </div>
        </div>
        <div class="du-hero__bubbles" aria-hidden="true">
          ${h.bubbles.map((b, i) => `
            <figure class="du-hb du-hb--${i}">
              <span class="du-hb__ring"><img src="${IMG(b.img)}" alt=""></span>
              <figcaption class="du-sticker du-sticker--${i % 3}">${esc(b.label)}</figcaption>
            </figure>`).join('')}
        </div>
      </div>`;
  },
};

const Pages = {
  render(page, tab, query) {
    const main = document.getElementById('du-main');
    const site = DU.data.site;
    if (site.heroes[page]) {
      const key = tab ? `${page}/${tab}` : page;
      main.innerHTML = Blocks.render(site.tabs[key], { nav: DU.navItem(page), tab: (DU.navItem(page).tabs || []).find(t => t.id === tab) });
    } else {
      main.innerHTML = this[page](query);
    }
    main.dataset.page = page;
    const theme = Tabs.theme(DU.navItem(page), tab);
    if (theme == null) delete main.dataset.theme; else main.dataset.theme = theme;
    OfferGrid.clampAll(main);
    if (page === 'offers') OffersPage.draw();
    if (page === 'works') WorksPage.draw();
  },

  pagehead(id, extra = '') {
    const p = DU.data.site.pages[id];
    return `
      <header class="du-pagehead">
        <div class="container">
          <span class="eyebrow u-en">${esc(p.eyebrow)}</span>
          <h1>${esc(p.title)}</h1>
          <p>${esc(p.lead)}</p>
          ${extra}
        </div>
      </header>`;
  },

  offers(query) { return OffersPage.html(query); },
  cuilu() { return CuiluPage.html(); },
  works(query) { return WorksPage.html(query); },
};

/* ── offer 一览: school cards (ranking order) → click to expand that school's
   signature offers (≤ 20). Offers that belong to a 案例卡 carry a
   「作品集案例」 tag that opens the case. Query: country, top, city, sort, case, school. ── */
const OffersPage = {
  state: {},
  MAX: 20,
  COUNTRY_ORDER: ['英国', '美国', '中国香港', '新加坡', '澳大利亚', '加拿大', '韩国'],

  countries() {
    return DU.data.offers.meta.countries.map(c => c[0]).sort((a, b) => {
      const ia = this.COUNTRY_ORDER.indexOf(a), ib = this.COUNTRY_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
  },

  html(query = {}) {
    const meta = DU.data.offers.meta;
    this.state = {
      country: query.country || '', top: query.top === '1', city: query.city || '',
      sort: query.sort === 'count' ? 'count' : 'rank', withCase: query.case === '1', school: query.school || '',
    };
    // a deep-linked school must stay visible: drop a conflicting country filter
    const linked = this.state.school && DU.school(this.state.school);
    if (linked && this.state.country && linked.country !== this.state.country) this.state.country = '';
    const stats = [
      { v: meta.offers, l: '本科 offer' }, { v: meta.students, l: '录取学生' },
      { v: meta.schools, l: '录取院校' }, { v: meta.topOffers, l: '顶尖院校 offer' },
    ];
    const caseOffers = DU.data.offers.wall.filter(o => o.case).length;
    return Pages.pagehead('offers', `
      <div class="du-bubbles du-bubbles--head">
        ${stats.map((s, i) => `<div class="du-bubble du-bubble--${i % 4}"><b class="u-mono">${s.v}</b><span>${s.l}</span></div>`).join('')}
      </div>`) + `
      <section class="section du-sec du-sec--flush"><div class="container">
        <div class="du-toolbar">
          <div class="du-seg" role="tablist" aria-label="排序">
            <button class="du-seg__btn" data-sort="rank" onclick="OffersPage.set({sort:'rank'})">按院校排名</button>
            <button class="du-seg__btn" data-sort="count" onclick="OffersPage.set({sort:'count'})">按 offer 数</button>
          </div>
          <div class="du-toolbar__toggles">
            <label class="du-toggle"><input type="checkbox" id="du-off-top" onchange="OffersPage.set({top:this.checked})"><span></span>只看顶尖院校</label>
            <label class="du-toggle"><input type="checkbox" id="du-off-case" onchange="OffersPage.set({withCase:this.checked})"><span></span>有作品集案例 <small class="u-mono">${caseOffers}</small></label>
          </div>
        </div>
        <div class="filter-bar filter-bar--scroll du-filter" id="du-offer-country">
          <button class="filter-btn" data-c="" onclick="OffersPage.set({country:''})">全部国家</button>
          ${this.countries().map(c => `<button class="filter-btn" data-c="${esc(c)}" onclick="OffersPage.set({country:'${jsq(c)}'})">${esc(c)}</button>`).join('')}
        </div>
        <div id="du-offer-city"></div>
        <div id="du-offer-body"></div>
      </div></section>`;
  },

  query() {
    const s = this.state;
    return { country: s.country ? [s.country] : null, top: s.top ? true : null, city: s.city || null };
  },

  syncUrl() {
    const s = this.state;
    history.replaceState(null, '', Router.href('offers', null, {
      country: s.country, top: s.top ? '1' : '', city: s.city, sort: s.sort === 'count' ? 'count' : '',
      case: s.withCase ? '1' : '', school: s.school,
    }));
  },

  set(patch) {
    Object.assign(this.state, patch);
    if (!('school' in patch)) this.state.school = '';
    this.syncUrl();
    this.draw();
  },

  /** offers for one school under the current filters */
  offersOf(key) {
    return DU.offers(this.query()).filter(o => (o.s || o.zh) === key && (!this.state.withCase || o.case));
  },

  schools() {
    const q = this.query();
    let list = DU.schoolsFor(q, this.state.sort);
    if (this.state.withCase) list = list.filter(s => s.cases);
    return list;
  },

  draw() {
    const s = this.state;
    document.querySelectorAll('.du-seg__btn[data-sort]').forEach(b => b.classList.toggle('is-active', b.dataset.sort === s.sort));
    document.querySelectorAll('#du-offer-country .filter-btn').forEach(b => b.classList.toggle('is-active', b.dataset.c === s.country));
    document.getElementById('du-off-top').checked = s.top;
    document.getElementById('du-off-case').checked = s.withCase;
    document.getElementById('du-offer-city').innerHTML = s.city
      ? `<div class="du-citytag">生源地：<b>${esc(s.city)}</b><button onclick="OffersPage.set({city:''})" aria-label="清除生源地">✕</button></div>` : '';

    const list = this.schools();
    const body = document.getElementById('du-offer-body');
    if (!list.length) {
      body.innerHTML = `<div class="du-empty du-empty--cute">没有符合条件的 offer，换个筛选试试</div>`;
      return;
    }
    const total = list.reduce((n, x) => n + (s.withCase ? x.cases : x.count), 0);
    const groups = s.country ? [[s.country, list]] : this.countries()
      .map(c => [c, list.filter(x => x.country === c)]).filter(([, l]) => l.length);
    body.innerHTML = `
      <p class="du-count">共 <b class="u-mono">${list.length}</b> 所院校 · <b class="u-mono">${total}</b> 份 offer
        <span class="du-count__hint">${s.sort === 'rank' ? '按数字艺术与设计院校排名排序' : '按 offer 数排序'} · 点击院校查看代表 offer</span></p>
      ${groups.map(([c, l]) => `
        <div class="du-ogroup">
          ${groups.length > 1 ? `<h2 class="du-ogroup__head"><span>${esc(c)}</span><small><b class="u-mono">${l.length}</b> 所院校 · <b class="u-mono">${l.reduce((n, x) => n + (s.withCase ? x.cases : x.count), 0)}</b> 份 offer</small></h2>` : ''}
          <div class="du-schoolcards">${l.map((x, i) => this.card(x, i)).join('')}</div>
        </div>`).join('')}`;
    if (s.school) {
      const card = body.querySelector(`.du-sc[data-key="${CSS.escape(s.school)}"]`);
      if (card) { this.open(card, false); setTimeout(() => Router.scrollTo(card), 120); }  // after Router's own scroll-to-top
    }
  },

  card(x, i) {
    const n = this.state.withCase ? x.cases : x.count;
    const mono = x.key === '伦敦艺术大学' ? 'UAL' : monogram(x.en, x.zh);
    return `
      <button class="du-sc${x.top ? ' is-top' : ''}" data-key="${esc(x.key)}" aria-expanded="false" onclick="OffersPage.toggle(this)">
        <span class="du-sc__mono du-orb du-orb--${i % 3} u-en">${esc(mono)}</span>
        <span class="du-sc__name"><b>${esc(x.zh)}</b><small class="u-en">${esc(x.en)}</small></span>
        <span class="du-sc__num"><b class="u-mono">${n}</b><small>offers</small></span>
        <span class="du-sc__tags">
          ${x.top ? '<i class="du-sc__tag du-sc__tag--top">★ 顶尖</i>' : ''}
          ${x.cases ? `<i class="du-sc__tag du-sc__tag--case">作品集案例 ${x.cases}</i>` : ''}
        </span>
        <span class="du-sc__chev" aria-hidden="true"></span>
      </button>`;
  },

  toggle(card) {
    const was = card.classList.contains('is-open');
    this.closeAll();
    if (!was) this.open(card, true);
    this.state.school = was ? '' : card.dataset.key;
    this.syncUrl();
  },

  closeAll() {
    document.querySelectorAll('.du-sc.is-open').forEach(c => { c.classList.remove('is-open'); c.setAttribute('aria-expanded', 'false'); });
    document.querySelectorAll('.du-sc-panel').forEach(p => p.remove());
  },

  open(card, scroll) {
    const key = card.dataset.key;
    card.classList.add('is-open');
    card.setAttribute('aria-expanded', 'true');
    const panel = document.createElement('div');
    panel.className = 'du-sc-panel';
    panel.innerHTML = this.panel(key);
    card.after(panel);  // grid-auto-flow: dense lets the rest of the row back-fill above the full-width panel
    if (scroll) requestAnimationFrame(() => {
      const r = panel.getBoundingClientRect();
      if (r.bottom > innerHeight || r.top < Nav.height()) Router.scrollTo(card);
    });
  },

  /** normalised major for grouping: "BA (Hons) Media" = "Media BA" = "media" */
  majorKey(m) {
    return (m || '').toLowerCase().replace(/\(hons\)|\bhons\b|\bba\b|\bbsc\b|\bbfa\b|\bbdes\b|\bbasc\b|\bma\b|\bbs\b|\bin\b|\bof\b|&|\band\b/g, ' ')
      .replace(/[^a-z一-龥]+/g, ' ').trim().split(/\s+/).sort().join(' ') || (m || '').trim();
  },

  /** pick ≤ MAX offers: one per distinct (college, major) first — a case-linked one when there is one —
      then the remaining case-linked offers, then top / newest. Shown grouped by major, case-linked first. */
  signature(list) {
    const seen = new Set();
    const uniq = list.filter(o => { const k = o.student + o.city + o.major + o.zh; if (seen.has(k)) return false; seen.add(k); return true; });
    const score = (o) => (o.case ? 4 : 0) + (o.top ? 2 : 0);
    uniq.sort((a, b) => score(b) - score(a) || (b.date > a.date ? 1 : -1));
    const picked = new Set(), groups = new Set();
    const take = (o) => { if (picked.size < this.MAX) picked.add(o); };
    uniq.forEach(o => { const g = (o.college || '') + '|' + this.majorKey(o.major); if (!groups.has(g)) { groups.add(g); take(o); } });
    uniq.forEach(o => { if (o.case && !picked.has(o)) take(o); });
    uniq.forEach(o => { if (!picked.has(o)) take(o); });
    const freq = {};
    picked.forEach(o => { const k = this.majorKey(o.major); freq[k] = (freq[k] || 0) + 1; });
    return [...picked].sort((a, b) => (b.case ? 1 : 0) - (a.case ? 1 : 0)
      || freq[this.majorKey(b.major)] - freq[this.majorKey(a.major)]
      || this.majorKey(a.major).localeCompare(this.majorKey(b.major)));
  },

  panel(key) {
    const sch = DU.school(key) || { zh: key, en: '' };
    const all = this.offersOf(key);
    const pick = this.signature(all);
    const majors = {};  // normalised key → { n, label (most common spelling) }
    all.forEach(o => {
      const k = this.majorKey(o.major);
      const m = majors[k] = majors[k] || { n: 0, spell: {} };
      m.n++; m.spell[o.major] = (m.spell[o.major] || 0) + 1;
    });
    const topMajors = Object.values(majors).sort((a, b) => b.n - a.n).slice(0, 4)
      .map(m => [Object.entries(m.spell).sort((a, b) => b[1] - a[1])[0][0], m.n]);
    const colleges = {};
    all.forEach(o => { if (o.college) colleges[o.college] = (colleges[o.college] || 0) + 1; });
    const cases = all.filter(o => o.case).length;
    return `
      <div class="du-sc-panel__head">
        <div>
          <span class="eyebrow u-en">Signature Offers</span>
          <h3>${esc(sch.zh)} <small class="u-en">${esc(sch.en)}</small></h3>
          <p>共 <b class="u-mono">${all.length}</b> 份 offer${cases ? ` · <b class="u-mono">${cases}</b> 份附作品集案例` : ''}${all.length > pick.length ? ` · 展示 ${pick.length} 份代表 offer` : ''}</p>
        </div>
        <button class="du-sc-panel__close" onclick="OffersPage.closeAll(); OffersPage.state.school=''; OffersPage.syncUrl()" aria-label="收起">✕</button>
      </div>
      ${Object.keys(colleges).length ? `<div class="du-chips du-sc-panel__chips"><span class="du-sc-panel__k">学院</span>${Object.entries(colleges).sort((a, b) => b[1] - a[1]).map(([c, n]) => `<span class="du-chip">${esc(c)} <b class="u-mono">${n}</b></span>`).join('')}</div>` : ''}
      ${topMajors.length > 1 ? `<div class="du-chips du-sc-panel__chips"><span class="du-sc-panel__k">热门专业</span>${topMajors.map(([m, n]) => `<span class="du-chip u-en">${esc(m)} <b class="u-mono">${n}</b></span>`).join('')}</div>` : ''}
      <div class="du-wall du-wall--panel">${pick.map((o, i) => this.letter(o, i)).join('')}</div>`;
  },

  letter(o, i) {
    return `
      <article class="du-letter${o.top ? ' is-top' : ''}${o.case ? ' has-case' : ''}" style="--tilt:${((i * 37) % 5) - 2}deg">
        <div class="du-letter__stamp u-en">${o.top ? '★ TOP' : 'OFFER'}</div>
        ${o.college ? `<div class="du-letter__college">${esc(o.college)}</div>` : ''}
        <div class="du-letter__major u-en">${esc(/^[a-z0-9 ,&()\-]+$/.test(o.major) ? o.major.replace(/\b[a-z]/g, c => c.toUpperCase()) : o.major)}</div>
        <div class="du-letter__foot"><b>${esc(o.student)}</b><span>${esc(o.city)}</span><span>${esc(o.season)}</span></div>
        ${o.case ? `<button class="du-letter__case" onclick="event.stopPropagation(); Detail.case('${jsq(o.case)}')">作品集案例 <i>→</i></button>` : ''}
      </article>`;
  },
};

/* ── 翠鹿榜: banner + 生源地案例卡 + 小程序 ── */
const CuiluPage = {
  html() {
    const cities = DU.data.offers.cities;
    return Pages.pagehead('cuilu') + `
      <section class="section du-sec du-sec--flush"><div class="container">
        <div class="du-banner fade-up">
          <div class="du-banner__seal" aria-hidden="true"><span>翠鹿榜</span><small class="u-en">VERIFIED</small></div>
          <div class="du-banner__text">
            <span class="eyebrow u-en">Cuilu Ranking · Certification</span>
            <h2>翠鹿榜认证</h2>
            <p>每一份录取都对应真实学员：生源地、就读背景与录取结果经校区与教务核验后公开，可在翠鹿榜小程序查询（认证说明待补充）。</p>
          </div>
          <div class="du-banner__nums">
            <div><b class="u-mono">${DU.data.offers.meta.students}</b><span>认证学员</span></div>
            <div><b class="u-mono">${cities.length}</b><span>生源城市</span></div>
          </div>
        </div>
      </div></section>
      <section class="section du-sec"><div class="container">
        <div class="section-head fade-up"><span class="eyebrow u-en">By City</span><h2>生源地案例卡</h2>
          <p>按学员所在校区统计 26 季录取，点击城市查看该地全部 offer。</p></div>
        <div class="du-cities fade-up">
          ${cities.map((c, i) => `
            <a class="du-card du-city du-city--${i % 4}" href="${Router.href('offers', null, { city: c.city })}">
              <div class="du-city__name">${esc(c.city)}</div>
              <div class="du-city__nums">
                <span><b class="u-mono">${c.students}</b>学员</span>
                <span><b class="u-mono">${c.offers}</b>offer</span>
                <span><b class="u-mono">${c.top}</b>顶尖</span>
              </div>
              <div class="du-city__schools">${c.schools.slice(0, 3).map(s => `<span class="du-chip">${esc(s)}</span>`).join('')}</div>
              <span class="du-more">查看 offer <i>→</i></span>
            </a>`).join('')}
        </div>
      </div></section>
      <section class="section du-sec du-sec--alt"><div class="container">
        <div class="du-mini fade-up">
          <div class="du-mini__qr" aria-label="小程序码占位">${this.qr()}</div>
          <div>
            <span class="eyebrow u-en">Mini Program</span>
            <h2>翠鹿榜小程序查询</h2>
            <p>微信扫码，输入学员姓名或录取院校，即可查询认证信息（小程序码待替换）。</p>
            <span class="du-pill">微信搜索「翠鹿榜」</span>
          </div>
        </div>
      </div></section>`;
  },

  /* decorative QR-like placeholder */
  qr() {
    let cells = '';
    let seed = 7;
    for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
      seed = (seed * 9301 + 49297) % 233280;
      const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      if (finder) continue;
      if (seed / 233280 > .55) cells += `<rect x="${x}" y="${y}" width="1" height="1" rx=".3"/>`;
    }
    const f = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" rx="2" fill="none" stroke="#000" stroke-width="1"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="1"/>`;
    return `<svg viewBox="-1 -1 23 23" fill="#000">${cells}${f(0, 0)}${f(14, 0)}${f(0, 14)}</svg>`;
  },
};

/* ── 作品案例: category + age filters ── */
const WorksPage = {
  state: { cat: '', age: '' },

  html(query = {}) {
    const W = DU.data.works;
    this.state = { cat: query.cat || '', age: query.age || '' };
    return Pages.pagehead('works') + `
      <section class="section du-sec du-sec--flush"><div class="container">
        <div class="du-cats">
          ${W.categories.map((c, i) => `
            <button class="du-cat" data-cat="${c.id}" onclick="WorksPage.set({cat: WorksPage.state.cat === '${c.id}' ? '' : '${c.id}'})">
              <span class="du-cat__img du-orb--ring-${i % 3}"><img src="${IMG(c.cover)}" alt="" loading="lazy"></span>
              <b>${esc(c.label)}</b><small>${esc(c.sub)}</small>
            </button>`).join('')}
        </div>
        <div class="du-toolbar">
          <div class="du-seg" id="du-age">
            <button class="du-seg__btn" data-age="" onclick="WorksPage.set({age:''})">全部年龄</button>
            ${W.ages.map(a => `<button class="du-seg__btn" data-age="${a.id}" onclick="WorksPage.set({age:'${a.id}'})">${esc(a.label)}<small>${esc(a.sub)}</small></button>`).join('')}
          </div>
          <p class="du-count" id="du-works-count"></p>
        </div>
        <div class="du-works" id="du-works"></div>
      </div></section>`;
  },

  set(patch) {
    Object.assign(this.state, patch);
    history.replaceState(null, '', Router.href('works', null, this.state));
    this.draw();
  },

  draw() {
    const { cat, age } = this.state;
    const W = DU.data.works;
    document.querySelectorAll('.du-cat').forEach(b => b.classList.toggle('is-active', b.dataset.cat === cat));
    document.querySelectorAll('#du-age .du-seg__btn').forEach(b => b.classList.toggle('is-active', b.dataset.age === age));
    const labels = WORK_LABEL();
    const list = W.works.filter(w => (!cat || w.category === cat) && (!age || w.ages.includes(age)));
    document.getElementById('du-works-count').innerHTML = `共 <b class="u-mono">${list.length}</b> 件作品`;
    document.getElementById('du-works').innerHTML = list.length ? list.map((w, i) => `
      <button class="du-card du-work" onclick="Detail.work('${w.id}')">
        <div class="du-work__img"><img src="${IMG(w.images[0])}" alt="${esc(w.title)}" loading="lazy">
          ${w.ages.includes('junior') ? `<span class="du-sticker du-sticker--${i % 3}">低龄友好</span>` : ''}</div>
        <div class="du-work__body">
          <span class="du-chip du-chip--accent">${esc(labels[w.category])}</span>
          <h3>${esc(w.title)}</h3>
          <p>${esc(w.student)} · ${esc(w.grade)}</p>
        </div>
      </button>`).join('') : `<div class="du-empty du-empty--cute">这个组合还没有作品，换个筛选试试</div>`;
  },
};

window.Hero = Hero; window.Pages = Pages; window.OffersPage = OffersPage; window.CuiluPage = CuiluPage; window.WorksPage = WorksPage;
