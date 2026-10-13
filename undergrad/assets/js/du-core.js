/* ═══════════════════════════════════════════
   DU CORE — undergrad site runtime: data loading, offer queries, hash
   router, navbar / tabs / footer, shared overlay, small helpers.

   Routes (hash):  #<page>[/<tab>][?key=value&…]
     us/overview|dad|talent|risd    美本爬藤 (hero + tabs)
     cw/ft|p12|uk|hk|sgau           英联邦问鼎 (hero + tabs)
     camp                           冬夏校 (hero, no tabs)
     offers  cuilu  works           regular pages (no hero)
   Content lives in data/*.json (see data/README.md); renderers in
   du-blocks.js (tab blocks) and du-pages.js (heroes + regular pages).
═══════════════════════════════════════════ */

const esc = (s) => escapeHTML(s == null ? '' : String(s));
const jsq = (s) => String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const IMG = (p) => (!p ? '' : /^(https?:|data:|\.\.\/|\/)/.test(p) ? p : 'assets/img/' + p);

const DU = {
  data: {},

  async load() {
    const files = ['site', 'offers', 'cases', 'works', 'professors'];
    const res = await Promise.all(files.map(f => fetch(`data/${f}.json`).then(r => {
      if (!r.ok) throw new Error(`data/${f}.json ${r.status}`);
      return r.json();
    })));
    files.forEach((f, i) => { this.data[f] = res[i]; });
  },

  /* ── offer queries — q: { country:[…], top:bool, city, schoolKw, metric:'offers'|'schools'|'students' } ── */
  offers(q = {}) {
    return this.data.offers.wall.filter(o =>
      (!q.country || !q.country.length || q.country.includes(o.country)) &&
      (q.top == null || o.top === q.top) &&
      (!q.city || o.city === q.city) &&
      (!q.schoolKw || o.zh.includes(q.schoolKw)));
  },
  count(q = {}) {
    const list = this.offers(q);
    if (q.metric === 'schools') return new Set(list.map(o => o.zh)).size;
    return list.length;
  },
  /** schools aggregated from the offer list, sorted by count */
  schoolsFor(q = {}) {
    const map = new Map();
    this.offers(q).forEach(o => {
      const s = map.get(o.zh) || { zh: o.zh, en: o.en, country: o.country, count: 0, top: false };
      s.count++; s.top = s.top || o.top; map.set(o.zh, s);
    });
    return [...map.values()].sort((a, b) => b.count - a.count || a.zh.localeCompare(b.zh, 'zh'));
  },
  offerCountFor(zh) {
    const s = this.data.offers.schools.find(x => x.zh === zh);
    return s ? s.count : 0;
  },
  casesFor(track) { return this.data.cases.filter(c => (c.tracks || []).includes(track)); },
  navItem(id) { return this.data.site.nav.find(n => n.id === id); },

  async boot() {
    try {
      await this.load();
      Nav.render();
      Overlay.init();
      Router.init();
    } catch (err) {
      console.error(err);
      document.getElementById('du-main').innerHTML =
        `<div class="container du-empty">数据加载失败：${esc(err.message)}<br>请通过本地服务器访问（例如 <code>python3 -m http.server</code>）。</div>`;
    } finally {
      document.getElementById('app-loading')?.remove();
    }
  },
};

/* ── ROUTER ── */
const Router = {
  current: { page: null, tab: null, query: {} },

  parse(hash) {
    const raw = decodeURIComponent((hash || '').replace(/^#/, ''));
    const [path, qs = ''] = raw.split('?');
    const [page, tab] = path.split('/');
    const query = {};
    qs.split('&').filter(Boolean).forEach(kv => { const [k, v = ''] = kv.split('='); query[k] = v; });
    return { page, tab, query };
  },

  href(page, tab, query) {
    let h = '#' + page + (tab ? '/' + tab : '');
    const qs = Object.entries(query || {}).filter(([, v]) => v !== '' && v != null).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    return qs ? h + '?' + qs : h;
  },

  /** go('us/dad', {anchor:'x'}) or go('offers', {query:{country:'英国'}}) */
  go(path, opts = {}) {
    const [page, tab] = path.split('/');
    this._pendingAnchor = opts.anchor || null;
    const h = this.href(page, tab, opts.query);
    if (location.hash === h) this.resolve();
    else location.hash = h;
  },

  init() {
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
  },

  resolve() {
    const site = DU.data.site;
    let { page, tab, query } = this.parse(location.hash);
    let nav = site.nav.find(n => n.id === page);
    if (!nav) { nav = site.nav[0]; page = nav.id; tab = null; }
    if (nav.tabs && !nav.tabs.some(t => t.id === tab)) tab = nav.tabs[0].id;

    const prev = this.current;
    const pageChanged = prev.page !== page;
    const tabChanged = prev.tab !== tab;
    this.current = { page, tab, query };

    Nav.setActive(page);
    if (pageChanged) Hero.render(page);
    Tabs.render(nav, tab);
    if (pageChanged || tabChanged || page === 'offers' || page === 'works') Pages.render(page, tab, query);
    Effects.init(document);

    const anchor = this._pendingAnchor; this._pendingAnchor = null;
    requestAnimationFrame(() => {
      if (anchor && document.getElementById(anchor)) return this.scrollTo(document.getElementById(anchor));
      if (pageChanged) return window.scrollTo({ top: 0 });
      if (tabChanged) {
        // tabs are sticky, so measure the hero's bottom edge instead
        const hero = document.getElementById('hero-root');
        const top = hero.offsetTop + hero.offsetHeight - Nav.height();
        if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  },

  scrollTo(el) {
    const tabs = document.getElementById('du-tabs');
    const offset = Nav.height() + (tabs.hidden ? 0 : tabs.offsetHeight) + 12;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  },
};

/* ── NAVBAR / MENU / FOOTER (from site.json nav) ── */
const Nav = {
  height() { return document.querySelector('.navbar')?.offsetHeight || 60; },

  render() {
    const nav = DU.data.site.nav;
    const heroPages = nav.filter(n => n.hero);
    const plainPages = nav.filter(n => n.page);
    const link = (n, cls = 'navbar__btn') => `<a class="${cls}" data-page="${n.id}" href="#${n.id}">${esc(n.label)}</a>`;

    document.getElementById('du-navlinks').innerHTML =
      heroPages.map(n => link(n)).join('') +
      '<span class="navbar__divider" aria-hidden="true"></span>' +
      plainPages.map(n => link(n, 'navbar__btn navbar__btn--page')).join('');

    document.getElementById('du-navmenu').innerHTML = `
      <div class="nav-menu-overlay__row">
        <div class="nav-menu-overlay__col nav-menu-overlay__col--primary">
          ${heroPages.map(n => `<a class="nav-menu-overlay__link nav-menu-overlay__link--page" data-page="${n.id}" href="#${n.id}">${esc(n.label)}</a>`).join('')}
        </div>
        <span class="nav-menu-overlay__div" aria-hidden="true"></span>
        <div class="nav-menu-overlay__col nav-menu-overlay__col--secondary">
          ${plainPages.map(n => `<a class="nav-menu-overlay__link" data-page="${n.id}" href="#${n.id}">${esc(n.label)}</a>`).join('')}
        </div>
      </div>`;

    document.getElementById('du-footer-grid').innerHTML =
      heroPages.map(n => `
        <div class="site-footer__col">
          <h2 class="site-footer__col-title">${esc(n.label)}<span class="u-en">${esc(n.en)}</span></h2>
          ${(n.tabs || [{ id: '', label: n.label }]).map(t =>
            `<a href="${Router.href(n.id, t.id)}"><strong>${esc(t.label)}</strong></a>`).join('')}
        </div>`).join('') + `
        <div class="site-footer__col">
          <h2 class="site-footer__col-title">更多<span class="u-en">More</span></h2>
          ${plainPages.map(n => `<a href="#${n.id}"><strong>${esc(n.label)}</strong><span class="u-en">${esc(n.en)}</span></a>`).join('')}
          <a href="../index.html"><strong>研究生站</strong><span class="u-en">Graduate</span></a>
        </div>`;
  },

  setActive(page) {
    document.querySelectorAll('[data-page]').forEach(a => {
      const on = a.dataset.page === page;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  },
};

/* ── 2nd-level tabs — graduate .industry-nav pills, horizontally scrolled ── */
const Tabs = {
  render(nav, active) {
    const bar = document.getElementById('du-tabs');
    if (!nav.tabs) { bar.hidden = true; return; }
    bar.hidden = false;
    const scroll = document.getElementById('du-tabs-scroll');
    scroll.innerHTML = nav.tabs.map(t =>
      `<a class="industry-nav__btn${t.id === active ? ' is-active' : ''}" href="${Router.href(nav.id, t.id)}">${esc(t.label)}</a>`).join('');
    const on = scroll.querySelector('.is-active');
    if (on) scroll.scrollTo({ left: on.offsetLeft - (scroll.clientWidth - on.offsetWidth) / 2, behavior: 'smooth' });
  },
};

/* ── OVERLAY — the graduate #course-overlay shell, generic body ── */
const Overlay = {
  init() {
    const el = document.getElementById('course-overlay');
    el.querySelector('.course-overlay__backdrop').addEventListener('click', () => this.close());
    el.querySelector('.course-overlay__close').addEventListener('click', () => this.close());
    document.addEventListener('keydown', e => {
      // ImageModal handles its own Escape; close only the topmost layer
      if (e.key === 'Escape' && this.isOpen() && !document.querySelector('.img-modal-backdrop.is-visible')) this.close();
    });
  },
  isOpen() { return document.getElementById('course-overlay').classList.contains('is-open'); },
  open(html, opts = {}) {
    const el = document.getElementById('course-overlay');
    const body = document.getElementById('course-overlay-body');
    body.innerHTML = html;
    body.classList.toggle('is-wide', !!opts.wide);
    if (!this.isOpen()) ScrollLock.lock();
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    el.querySelector('.course-overlay__panel').scrollTop = 0;
  },
  close() {
    const el = document.getElementById('course-overlay');
    if (!this.isOpen()) return;
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    ScrollLock.unlock();
  },
};

/* ── placeholder poster (SVG data URI) for poster walls ── */
const Poster = {
  PALETTES: [['#FFFF00', '#B8F5C8'], ['#FFB8E0', '#C9B8FF'], ['#A8DBFF', '#B8F5C8'], ['#FFD0A8', '#FFFF00'], ['#C9B8FF', '#A8DBFF']],
  svg(title, sub, i = 0) {
    const [a, b] = this.PALETTES[i % this.PALETTES.length];
    const t = esc(title).slice(0, 24), s = esc(sub || '').slice(0, 30);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 840">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
      <rect width="600" height="840" rx="36" fill="#121212"/>
      <circle cx="420" cy="260" r="200" fill="url(#g)"/>
      <circle cx="170" cy="470" r="90" fill="url(#g)" opacity=".55"/>
      <text x="48" y="650" font-family="sans-serif" font-size="46" font-weight="700" fill="#fff">${t}</text>
      <text x="48" y="705" font-family="sans-serif" font-size="24" fill="#9a9a9a">${s}</text>
      <text x="48" y="790" font-family="monospace" font-size="18" fill="${a}">POSTER · PLACEHOLDER</text>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  },
};

window.DU = DU; window.Router = Router; window.Nav = Nav; window.Tabs = Tabs; window.Overlay = Overlay; window.Poster = Poster;
