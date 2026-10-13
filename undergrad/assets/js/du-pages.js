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
      main.innerHTML = Blocks.render(site.tabs[key]);
    } else {
      main.innerHTML = this[page](query);
    }
    main.dataset.page = page;
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

/* ── offer 一览: 院校榜 / offer 墙 ── */
const OffersPage = {
  state: { view: 'wall', country: '', top: false, city: '', shown: 48 },
  COUNTRY_ORDER: ['英国', '美国', '中国香港', '新加坡', '澳大利亚', '加拿大', '韩国'],

  html(query = {}) {
    const meta = DU.data.offers.meta;
    this.state = { view: query.view || 'wall', country: query.country || '', top: query.top === '1', city: query.city || '', shown: 48 };
    const countries = meta.countries.map(c => c[0]).sort((a, b) => {
      const ia = this.COUNTRY_ORDER.indexOf(a), ib = this.COUNTRY_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    const stats = [
      { v: meta.offers, l: '本科 offer' }, { v: meta.students, l: '录取学生' },
      { v: meta.schools, l: '录取院校' }, { v: meta.topOffers, l: '顶尖院校 offer' },
    ];
    return Pages.pagehead('offers', `
      <div class="du-bubbles du-bubbles--head">
        ${stats.map((s, i) => `<div class="du-bubble du-bubble--${i % 4}"><b class="u-mono">${s.v}</b><span>${s.l}</span></div>`).join('')}
      </div>`) + `
      <section class="section du-sec du-sec--flush"><div class="container">
        <div class="du-toolbar">
          <div class="du-seg" role="tablist">
            <button class="du-seg__btn" data-view="wall" onclick="OffersPage.set({view:'wall'})">offer 墙</button>
            <button class="du-seg__btn" data-view="schools" onclick="OffersPage.set({view:'schools'})">院校榜</button>
          </div>
          <label class="du-toggle"><input type="checkbox" ${this.state.top ? 'checked' : ''} onchange="OffersPage.set({top:this.checked})"><span></span>只看顶尖院校</label>
        </div>
        <div class="filter-bar filter-bar--scroll du-filter" id="du-offer-country">
          <button class="filter-btn" data-c="" onclick="OffersPage.set({country:''})">全部国家</button>
          ${countries.map(c => `<button class="filter-btn" data-c="${esc(c)}" onclick="OffersPage.set({country:'${jsq(c)}'})">${esc(c)}</button>`).join('')}
        </div>
        <div id="du-offer-city"></div>
        <div id="du-offer-body"></div>
      </div></section>`;
  },

  set(patch) {
    Object.assign(this.state, patch, { shown: 48 });
    const q = { view: this.state.view === 'wall' ? '' : this.state.view, country: this.state.country, top: this.state.top ? '1' : '', city: this.state.city };
    history.replaceState(null, '', Router.href('offers', null, q));
    this.draw();
  },

  draw() {
    const s = this.state;
    document.querySelectorAll('.du-seg__btn').forEach(b => b.classList.toggle('is-active', b.dataset.view === s.view));
    document.querySelectorAll('#du-offer-country .filter-btn').forEach(b => b.classList.toggle('is-active', b.dataset.c === s.country));
    document.getElementById('du-offer-city').innerHTML = s.city
      ? `<div class="du-citytag">生源地：<b>${esc(s.city)}</b><button onclick="OffersPage.set({city:''})" aria-label="清除生源地">✕</button></div>` : '';
    const q = { country: s.country ? [s.country] : null, top: s.top ? true : null, city: s.city || null };
    const body = document.getElementById('du-offer-body');
    if (s.view === 'schools') {
      body.innerHTML = OfferGrid.html(DU.schoolsFor(q), 'du-offer-schools', 99);
      return Effects.init(body);
    }
    const list = DU.offers(q).slice().sort((a, b) => b.top - a.top);
    body.innerHTML = list.length ? `
      <p class="du-count">共 <b class="u-mono">${list.length}</b> 份 offer</p>
      <div class="du-wall">${list.slice(0, s.shown).map((o, i) => this.letter(o, i)).join('')}</div>
      ${list.length > s.shown ? `<div class="du-center"><button class="section-cta" onclick="OffersPage.more()">加载更多 <span class="u-en">/ ${list.length - s.shown} more</span></button></div>` : ''}`
      : `<div class="du-empty du-empty--cute">没有符合条件的 offer，换个筛选试试</div>`;
  },

  more() {
    this.state.shown += 48;
    const y = window.scrollY;
    this.draw();
    window.scrollTo({ top: y });
  },

  letter(o, i) {
    return `
      <article class="du-letter${o.top ? ' is-top' : ''}" style="--tilt:${((i * 37) % 5) - 2}deg">
        <div class="du-letter__stamp u-en">${o.top ? '★ TOP' : 'OFFER'}</div>
        <div class="du-letter__school">${esc(o.zh)}</div>
        <div class="du-letter__en u-en">${esc(o.en)}</div>
        <div class="du-letter__major u-en">${esc(o.major)}</div>
        <div class="du-letter__foot"><b>${esc(o.student)}</b><span>${esc(o.city)}</span><span>${esc(o.country)}</span></div>
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
