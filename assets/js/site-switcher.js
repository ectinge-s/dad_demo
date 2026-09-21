/* ═══════════════════════════════════════════
   SITE SWITCHER — 本科站 ⇄ 研究生站

   v3.37 (GM): moved from undergrad/assets/js/undergrad-switcher.js to
   dad_demo/assets/js/site-switcher.js — this file is genuinely shared
   (both sites load the exact same copy), so it lives in the graduate
   root's assets/ folder, which is now the shared-asset home, rather
   than inside one site's own asset tree. Loaded as `assets/js/
   site-switcher.js` from dad_demo/index.html and as `__ROOT__assets/js/
   site-switcher.js` (see tools/undergrad/build-undergrad.cjs's
   rootOf()) from every undergrad/** page.

   v3.38 (GM): GM asked for the switch to move from the LEFT of the
   brand mark to its RIGHT ("adjust its position so it moves to right
   of brand mark"). Also simplified to a single mount path: as of this
   version both sites render the exact same navbar shape (`.navbar__inner`
   > `.navbar__logo` — see assets/css/site-chrome.css and
   tools/undergrad/build-undergrad.cjs's renderNavbar()), so the old
   "which selector matched" branch that told graduate and undergrad
   apart is gone; both bodies now carry `data-sfk-site="graduate"` /
   `"undergrad"` directly, which is a more explicit way to tell them
   apart anyway.

   A single, shared toggle mounted just to the right of the logo/brand
   mark on both sites' navigation bars, so the two sites read as one
   product with two entry points.

   Entry targets:
     · 研究生站 → 本科站      `undergrad/index.html` (relative to the
                              graduate site root)
     · 本科站 → 研究生站      read from `<body data-sfk-graduate>` — the
                              build step emits the depth-correct relative
                              path on every undergraduate page, so the
                              whole undergrad/ folder stays movable.

   Styles are injected by this file (scoped to `.sfk-site-switch*`) and
   only reference design tokens both sites already define, which is what
   keeps the control visually identical on either side. Nothing in the
   graduate site's CSS/JS is read or modified.
═══════════════════════════════════════════ */
(function () {
  'use strict';

  var UNDERGRAD_ENTRY = 'undergrad/index.html';
  var STYLE_ID = 'sfk-site-switch-style';
  var MOUNT_FLAG = 'sfkSiteSwitchMounted';

  var CSS = [
    '.sfk-site-switch{',
    '  display:inline-flex; align-items:center; gap:2px; flex:0 0 auto;',
    '  padding:2px; background:var(--color-surface);',
    '  border:1px solid var(--color-border-2); border-radius:var(--radius-pill);',
    '}',
    '.sfk-site-switch__item{',
    '  display:inline-flex; align-items:center; justify-content:center;',
    '  min-height:28px; padding:5px 13px;',
    '  border-radius:var(--radius-pill);',
    '  font-family:var(--font-cn); font-size:11px; font-weight:700; line-height:1;',
    '  color:var(--color-text-muted); white-space:nowrap;',
    '  transition:background 0.18s var(--ease),color 0.18s var(--ease);',
    '}',
    '.sfk-site-switch__item:hover{background:var(--color-surface-2); color:var(--color-text);}',
    '.sfk-site-switch__item.is-active{',
    '  background:var(--color-accent); color:var(--color-accent-ink);',
    '  box-shadow:var(--glow-primary-soft);',
    '}',
    '.sfk-site-switch__item:focus-visible{',
    '  outline:2px solid transparent; outline-offset:2px;',
    '  box-shadow:0 0 0 3px rgba(255,255,0,.16);',
    '}',
    '.sfk-site-switch__short{display:none;}',
    /* The cluster that keeps .navbar__inner's child count unchanged.
       v3.40 (GM): "widen the gap between the brand mark and the site
       switch, keep the navbar visually centered" — widened from 14px.
       This is a flex `gap` between the two cluster children, not a
       one-sided margin, so it grows the space symmetrically without
       nudging either element off-axis; .navbar__inner's own
       justify-content:space-between (site-chrome.css) still balances
       the row the same way it did before. */
    '.sfk-nav-cluster{display:flex; align-items:center; gap:28px; flex:0 0 auto; min-width:0;}',
    '@media (max-width:620px){',
    '  .sfk-site-switch__full{display:none;}',
    '  .sfk-site-switch__short{display:inline;}',
    '  .sfk-site-switch__item{padding:5px 10px;}',
    '  .sfk-nav-cluster{gap:18px;}',
    '}',
    /* v3.38 (GM): narrow-phone tightening — see site-chrome.css's own
       max-width:430px block, which this pairs with (that file can't
       reach these classes since they're injected here instead). */
    '@media (max-width:430px){',
    '  .sfk-site-switch__item{padding:4px 8px;}',
    '  .sfk-nav-cluster{gap:10px;}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '  .sfk-site-switch__item{transition:none;}',
    '}'
  ].join('\n');

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function buildSwitch(current) {
    var wrap = document.createElement('nav');
    wrap.className = 'sfk-site-switch';
    wrap.setAttribute('aria-label', '站点切换');
    var graduateEntry = (document.body && document.body.dataset.sfkGraduate) || '../index.html';

    var items = [
      { id: 'undergrad', label: '本科站', short: '本科', href: UNDERGRAD_ENTRY },
      { id: 'graduate', label: '研究生站', short: '研究生', href: graduateEntry }
    ];

    items.forEach(function (item) {
      var active = item.id === current;
      var link = document.createElement('a');
      link.className = 'sfk-site-switch__item' + (active ? ' is-active' : '');
      link.href = active ? '#' : item.href;
      link.dataset.site = item.id;
      if (active) link.setAttribute('aria-current', 'page');
      link.innerHTML = '<span class="sfk-site-switch__full">' + item.label + '</span>'
        + '<span class="sfk-site-switch__short">' + item.short + '</span>';
      if (active) {
        link.addEventListener('click', function (event) { event.preventDefault(); });
      }
      wrap.appendChild(link);
    });

    return wrap;
  }

  function mount() {
    if (document.body && document.body.dataset[MOUNT_FLAG] === 'true') return;

    var nav = document.querySelector('.navbar__inner');
    var logo = nav && nav.querySelector('.navbar__logo');
    if (!nav || !logo) return;

    injectStyles();

    /* Wrap logo + switch into one cluster, then put the cluster where
       the logo was, so the navbar's own flex layout and child count
       never change. v3.38: the switch is appended AFTER the logo (was
       inserted before it), per GM's "move it to the right of the brand
       mark" request. */
    var current = document.body && document.body.dataset.sfkSite === 'undergrad' ? 'undergrad' : 'graduate';
    var cluster = document.createElement('div');
    cluster.className = 'sfk-nav-cluster';
    nav.insertBefore(cluster, logo);
    cluster.appendChild(logo);
    cluster.appendChild(buildSwitch(current));

    if (document.body) document.body.dataset[MOUNT_FLAG] = 'true';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
