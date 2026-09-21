/* ═══════════════════════════════════════════
   SITE SWITCHER — 本科站 ⇄ 研究生站

   A single, shared toggle mounted at the TOP-LEFT of both sites'
   navigation bars, so the two sites read as one product with two
   entry points.

   Where it mounts (auto-detected, no per-site config):
     · 研究生站 (dad_demo/index.html) — into `.navbar__inner`, LEFT of
       `.navbar__logo`. The logo and this switch are wrapped together in
       a new `.sfk-nav-cluster`, so `.navbar__inner` keeps exactly the
       same number of flex children and its `justify-content:space-between`
       layout is untouched.
     · 本科站 (undergrad/**) — into `.header-inner` / `.header-primary`,
       LEFT of `.brand`; the undergraduate site's own legacy
       `.site-switcher` (本科方向 / 行业就业) is removed so there is
       never a second, competing switcher.

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
    /* The cluster that keeps .navbar__inner's child count unchanged. */
    '.sfk-nav-cluster{display:flex; align-items:center; gap:14px; flex:0 0 auto; min-width:0;}',
    '@media (max-width:620px){',
    '  .sfk-site-switch__full{display:none;}',
    '  .sfk-site-switch__short{display:inline;}',
    '  .sfk-site-switch__item{padding:5px 10px;}',
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
    injectStyles();

    /* ── 研究生站 ──────────────────────────────────────────────
       Wrap logo + switch into one cluster, then prepend it, so the
       navbar's own flex layout and child count never change. */
    var graduateNav = document.querySelector('.navbar__inner');
    var graduateLogo = graduateNav && graduateNav.querySelector('.navbar__logo');
    if (graduateNav && graduateLogo) {
      var cluster = document.createElement('div');
      cluster.className = 'sfk-nav-cluster';
      graduateNav.insertBefore(cluster, graduateLogo);
      cluster.appendChild(graduateLogo);
      cluster.insertBefore(buildSwitch('graduate'), graduateLogo);
      if (document.body) document.body.dataset[MOUNT_FLAG] = 'true';
      return;
    }

    /* ── 本科站 ────────────────────────────────────────────────
       The legacy switcher is dropped and replaced by the unified one. */
    var undergradHeader = document.querySelector('.header-inner, .header-primary');
    var undergradBrand = undergradHeader && undergradHeader.querySelector('.brand');
    if (undergradHeader && undergradBrand) {
      var legacy = undergradHeader.querySelector('.site-switcher');
      if (legacy) legacy.remove();
      undergradHeader.insertBefore(buildSwitch('undergrad'), undergradBrand);
      if (document.body) document.body.dataset[MOUNT_FLAG] = 'true';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
