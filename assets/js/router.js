/* ═══════════════════════════════════════════
   ROUTER — page switching + scroll helpers.
   Same shape as IST's router.js, now covering five router pages
   (home, planning, timeline, course-products, portfolio — the latter
   three copied/adapted from IST per GM's 2026-09 requests).
   /undergraduate/ stays OUT
   of this router: it's on hold (see docs/PROJECT_NOTES.md) and, when
   it returns, is planned as its own set of real, deep-linkable static
   pages rather than a hash route.

   v3.3: 'planning' now carries an optional deep-linkable sub-route —
   #planning (总览 overview) or #planning/<industryId> (one industry's
   Figma-style detail subpage, see PlanningPage.showSubpage()). Resolved
   via opts.industryId (preferred) or opts.industry (a title, looked up
   against PlanningPage.industries for back-compat with existing
   goToIndustry/focusIndustry call sites across home/timeline/footer).
═══════════════════════════════════════════ */

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const Router = {
  current: 'home',
  _fromPopstate: false,

  go(pageId, opts = {}) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('is-active'));
    document.querySelectorAll('.navbar__btn').forEach(b => b.classList.remove('is-active'));

    const page = document.getElementById('page-' + pageId);
    if (!page) return;
    page.classList.add('is-active');
    this.current = pageId;

    // v3.10 fix: every page's builder runs while ITS OWN section is still
    // display:none (all page builders run up-front in index.html's boot
    // sequence, before this first Router.go() call ever fires), so the
    // single global Effects.init() registered on DOMContentLoaded observes
    // every .fade-up element while hidden and — since a hidden element
    // never intersects — never fires again once the page is shown later
    // (confirmed: this left 案例展示's whole grid/filter-bars stuck at
    // opacity:0 on every path to that page, not just a direct #portfolio
    // load). Re-running Effects.init() on the page we just revealed
    // re-observes any of its .fade-up descendants that haven't already
    // been marked .is-visible — safe to call repeatedly (see effects.js).
    Effects.init(page);

    let industryId = opts.industryId || null;
    if (!industryId && opts.industry && window.PlanningPage) {
      const ind = window.PlanningPage.industries.find(i => i.title === opts.industry);
      if (ind) industryId = ind.id;
    }

    const hashPages = ['planning', 'timeline', 'course-products', 'portfolio'];
    let newHash;
    if (pageId === 'planning') {
      newHash = industryId ? `#planning/${industryId}` : '#planning';
    } else {
      newHash = hashPages.includes(pageId) ? '#' + pageId : location.pathname + location.search;
    }
    if (!this._fromPopstate && location.hash !== newHash) {
      history.pushState(null, '', newHash);
    }

    if (pageId === 'planning' && window.PlanningPage) {
      window.PlanningPage.showSubpage(industryId);
    }

    if (opts.scrollTo) {
      setTimeout(() => this.scrollTo(opts.scrollTo), 100);
    } else if (pageId === 'planning' && industryId) {
      /* v3.5: switching industries via the top tabs (or landing on one
         directly) jumps to that industry's banner, not page 0 — GM
         didn't want every tab click re-showing the shared "CAREER
         PLANNING · INDUSTRY MAP" hero above the tab row. 总览 (no
         industryId) keeps the normal scroll-to-top. */
      setTimeout(() => this.scrollTo('.industry-panel__banner'), 100);
    } else {
      window.scrollTo(0, 0);
    }
  },

  scrollTo(selector) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return;
    const navbarH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h'), 10) || 60;
    let offset = navbarH + 12;
    // Account for any additional sticky bar stacked below the main navbar
    // on the currently active page (e.g. the planning page's sticky
    // .industry-nav) so goToIndustry/focusIndustry land with the target
    // panel fully visible instead of tucked under it.
    const stickySub = document.querySelector('.page.is-active .industry-nav');
    if (stickySub) offset += stickySub.getBoundingClientRect().height;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  },

  goToIndustry(industryTitle) {
    this.go('planning', { industry: industryTitle });
  },

  /* Used by the copied timeline.js — a Gantt bar with a courseTab opens
     the matching product straight in CourseOverlay (assets/js/course-demo.js),
     same mapping as IST's own router. */
  goToCoursesTab(tabId) {
    const PRODUCT_MAP = { internship: 'internship', summer: 'summerwinter', bizpractice: 'bizpractice', masterclass: 'masterclass' };
    const productId = PRODUCT_MAP[tabId];
    if (productId && window.CourseOverlay) CourseOverlay.open(productId);
  },
};

window.addEventListener('popstate', () => {
  const hashRaw = location.hash.replace('#', '');
  const [hashPage, hashSub] = hashRaw.split('/');
  const PAGES = ['planning', 'timeline', 'course-products', 'portfolio'];
  Router._fromPopstate = true;
  Router.go(PAGES.includes(hashPage) ? hashPage : 'home', hashPage === 'planning' ? { industryId: hashSub || null } : {});
  Router._fromPopstate = false;
});

document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelector('.navbar__links');
  if (!links) return;
  links.addEventListener('click', (e) => {
    const btn = e.target.closest('.navbar__btn');
    if (!btn || !links.contains(btn)) return;
    links.querySelectorAll('.navbar__btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
  });
});
