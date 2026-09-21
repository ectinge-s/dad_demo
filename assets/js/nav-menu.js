/* ═══════════════════════════════════════════
   NAV MENU — ScrollLock + the expandable full-screen nav overlay's
   open/close/toggle behavior, SHARED between the graduate site and the
   undergraduate site (loaded before assets/js/components.js on the
   graduate side, and before undergrad-home.js/undergrad-detail.js on
   the undergraduate side).

   v3.38 (GM): extracted from assets/js/components.js, which used to
   carry the only copy of this behavior — undergrad had no hamburger
   menu of its own at all. Per GM's explicit request that a change made
   once (e.g. how the menu opens, or its scroll-lock behavior) should
   apply to both sites without touching two files, this is now that one
   file. It only assumes #nav-menu-toggle and #nav-menu-overlay exist in
   the page — it doesn't know or care what the overlay's links do
   (onclick router calls on the graduate site, plain <a href> on the
   undergraduate site — both close the overlay the same way, either via
   their own onclick calling NavMenu.close() first, as the graduate
   site's NavMenu.go() does, or via the delegated click listener below,
   which the undergraduate site relies on since its links have no
   onclick handler at all).

   NavMenu.go(pageId, opts) — the graduate site's router-specific
   navigation on top of this — is added separately, in components.js,
   since Router is graduate-only.
═══════════════════════════════════════════ */

/* ── SCROLL LOCK — freezes body scroll while a modal/overlay is open,
   compensating for the scrollbar's width so removing it doesn't shift
   the page's content column. A lock counter lets overlays nest/overlap
   safely (e.g. opening one from underneath an already-open one)
   without the first close() prematurely restoring scrolling. ── */
const ScrollLock = {
  _count: 0,
  lock() {
    if (this._count === 0) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) document.body.style.paddingRight = scrollbarWidth + 'px';
    }
    this._count++;
  },
  unlock() {
    this._count = Math.max(0, this._count - 1);
    if (this._count === 0) {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  },
};

/* ── EXPANDABLE NAV MENU ── */
const NavMenu = {
  toggle() {
    const overlay = document.getElementById('nav-menu-overlay');
    if (!overlay) return;
    overlay.classList.contains('is-open') ? this.close() : this.open();
  },
  open() {
    const toggle = document.getElementById('nav-menu-toggle');
    const overlay = document.getElementById('nav-menu-overlay');
    if (!toggle || !overlay) return;
    toggle.setAttribute('aria-expanded', 'true');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-menu-open');
    ScrollLock.lock();
  },
  close() {
    const toggle = document.getElementById('nav-menu-toggle');
    const overlay = document.getElementById('nav-menu-overlay');
    if (!toggle || !overlay) return;
    toggle.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-menu-open');
    ScrollLock.unlock();
  },
};
document.getElementById('nav-menu-toggle')?.addEventListener('click', () => NavMenu.toggle());
document.addEventListener('keydown', e => { if (e.key === 'Escape') NavMenu.close(); });
/* Closes the overlay whenever one of its own links is actually clicked
   — one delegated listener instead of one per link. Needed for the
   undergraduate site's plain <a href> links (an in-page anchor doesn't
   otherwise trigger any JS at all); harmless-but-redundant on the
   graduate site, whose onclick="NavMenu.go(...)" links already call
   close() themselves before navigating. */
document.getElementById('nav-menu-overlay')?.addEventListener('click', (e) => {
  if (e.target.closest('.nav-menu-overlay__link, .nav-menu-overlay__cta')) NavMenu.close();
});

/* ── FOOTER YEAR — both sites' shared .site-footer (site-chrome.css)
   ends with "© <year> SFK ...". Graduate's own boot sequence in
   index.html also sets this once its async page render finishes
   (harmless — same value, just later); undergrad has no equivalent
   boot step, so this is the only place it gets set there. */
const footerYearEl = document.getElementById('footer-year');
if (footerYearEl) footerYearEl.textContent = new Date().getFullYear();
