/* ═══════════════════════════════════════════
   ROUTER — page switching + scroll helpers.
   Same shape as IST's router.js, now covering five router pages
   (home, planning, timeline, course-products, portfolio — the latter
   three copied/adapted from IST per GM's 2026-09 requests).
   /undergraduate/ stays OUT
   of this router: it's on hold (see docs/PROJECT_NOTES.md) and, when
   it returns, is planned as its own set of real, deep-linkable static
   pages rather than a hash route.
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

    const hashPages = ['planning', 'timeline', 'course-products', 'portfolio'];
    const newHash = hashPages.includes(pageId) ? '#' + pageId : location.pathname + location.search;
    if (!this._fromPopstate && location.hash !== '#' + pageId) {
      history.pushState(null, '', newHash);
    }

    if (opts.industry && pageId === 'planning' && window.PlanningPage) {
      setTimeout(() => window.PlanningPage.focusIndustry(opts.industry), 80);
    }

    if (opts.scrollTo) {
      setTimeout(() => this.scrollTo(opts.scrollTo), 100);
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
  const hashPage = location.hash.replace('#', '');
  const PAGES = ['planning', 'timeline', 'course-products', 'portfolio'];
  Router._fromPopstate = true;
  Router.go(PAGES.includes(hashPage) ? hashPage : 'home');
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
