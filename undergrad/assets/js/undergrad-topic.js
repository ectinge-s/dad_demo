/* ═══════════════════════════════════════════
   UNDERGRAD TOPIC — 本科站主题详情页交互 (v3.39, GM)

   Ported from undergrad-home.js's 5 widget-render functions
   (initDirections/initPathways/initOutputs/initProfiles/
   initAdvantages), which used to live only on the homepage. GM:
   "moving the function of each section's homepage content to the
   beginning of each of their page... let navbar buttons direct to
   each of its page. then, make all the current page into overlay."

   Loaded on EVERY undergraduate detail page (self-guards in boot()
   below, matching the same convention undergrad-detail.js already
   uses), but only the 5 topic hub pages (directions/pathways/
   capabilities/fit/advantages — see build-undergrad.cjs's
   TOPIC_WIDGET_IDS/renderTopicWidget()) actually have a widget
   container for the fetch-and-render half of this file to find.

   The widgets are IDENTICAL to their old homepage selves with one
   change: every "查看完整…" / "了解对应能力" / "查看这类学生的项目入口"
   link used to point at a real leaf-page URL (data.detailLinks.*).
   Since those leaf pages no longer exist as standalone routes (their
   content lives only in their hub page's overlay payload — see
   build-undergrad.cjs's renderOverlayFragment()), each link is now a
   <button data-overlay-child="…"> that opens that content in the
   same-page Overlay instead — so from ANY of the 4 hub pages with
   children, every leaf is one click away. This mirrors the graduate
   site's own CourseOverlay pattern (assets/js/course-demo.js): purely
   data-driven from an in-memory payload, no separate URL.

   v3.39 follow-up (GM): "作品图册page下的本科夏校、作品集合集两个card点开
   也做成overlay而不是独立page" — `works` gets the same overlay shell +
   payload as the 4 topic hubs, but it never had a homepage widget of
   its own, so there's nothing for the fetch-and-render half of this
   file to do there. Its existing "NEXT LEVEL" children-cards grid
   (build-undergrad.cjs's renderChildren(), overlayMode branch) is its
   only trigger, marked with `data-overlay-children` — bindOverlayChildren()
   below wires that grid's clicks straight to Overlay.open(), completely
   independent of the topic-widget fetch (see boot()'s three independent
   guards: hasOverlay / hasTopicWidget / hasOverlayChildren).

   IMG_PREFIX: undergrad-content.json's image paths are resolved once,
   at build time, relative to the HOMEPAGE (depth 0 — see
   build-undergrad.cjs's buildBrowserContent(), which only the
   homepage used to fetch). Every hub page fetching that same payload
   now sits one folder deeper (depth 1, e.g. undergrad/capabilities/),
   so an image path meant for the homepage needs exactly one more
   '../' hop from here. All 5 hub pages share that same depth, so this
   is a fixed constant, not something computed per page.
═══════════════════════════════════════════ */
(function () {
  'use strict';

  var DATA_URL = '../data/site/undergrad-content.json';
  var IMG_PREFIX = '../';

  function escapeHTML(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* Same id="section-N" prefixing scheme build-undergrad.cjs's
     renderOverlayFragment() applies server-side — not needed here,
     just documented so the two stay obviously paired. */

  var Reveal = {
    observer: null,
    init: function () {
      if (this.observer || !('IntersectionObserver' in window)) return;
      this.observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          Reveal.observer.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    },
    scan: function (root) {
      if (!this.observer) return;
      (root || document).querySelectorAll('.fade-up:not(.is-visible)').forEach(function (el) {
        Reveal.observer.observe(el);
      });
    }
  };

  /* ── OVERLAY — data-driven "quick look" modal, populated from the
     <script type="application/json" id="overlay-payload"> block the
     build step embeds on the 4 hub pages that have children. Same
     architecture as the graduate site's CourseOverlay: no separate
     URL, ScrollLock reused from assets/js/nav-menu.js. ── */
  var overlayPayload;
  function getOverlayPayload() {
    if (overlayPayload !== undefined) return overlayPayload;
    var el = document.getElementById('overlay-payload');
    if (!el || !el.textContent) { overlayPayload = null; return overlayPayload; }
    try { overlayPayload = JSON.parse(el.textContent); }
    catch (error) { console.error(error); overlayPayload = null; }
    return overlayPayload;
  }

  var Overlay = {
    open: function (childId) {
      var container = document.getElementById('content-overlay');
      var body = document.getElementById('content-overlay-body');
      var payload = getOverlayPayload();
      if (!container || !body || !payload || !childId || !payload[childId]) return;

      body.innerHTML = payload[childId];
      container.classList.add('is-open');
      container.setAttribute('aria-hidden', 'false');
      if (typeof ScrollLock !== 'undefined') ScrollLock.lock();

      var panel = container.querySelector('.content-overlay__panel');
      if (panel) panel.scrollTop = 0;
      body.scrollTop = 0;
      Reveal.scan(body);
    },
    close: function () {
      var container = document.getElementById('content-overlay');
      if (!container || !container.classList.contains('is-open')) return;
      container.classList.remove('is-open');
      container.setAttribute('aria-hidden', 'true');
      if (typeof ScrollLock !== 'undefined') ScrollLock.unlock();
    }
  };

  /* Turns a `data.detailLinks.<group>[id]` route string (e.g.
     "capabilities/media-installation/") into the overlay payload key
     that same child page uses (e.g. "capabilities/media-installation")
     — the build step's page ids and the browser payload's route
     strings are the same string, only the trailing slash differs. */
  function overlayIdFrom(route) {
    return route ? route.replace(/\/$/, '') : '';
  }

  /* ── 申请方向 ── */
  function initDirections(data) {
    var tabs = document.getElementById('direction-tabs');
    var panel = document.getElementById('direction-panel');
    if (!tabs || !panel) return;
    var detailLinks = data.detailLinks.directions || {};

    function render(directionId) {
      var direction = (data.directions || []).filter(function (d) { return d.id === directionId; })[0] || data.directions[0];
      if (!direction) return;
      tabs.querySelectorAll('button').forEach(function (button) {
        var selected = button.dataset.direction === direction.id;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
      });

      panel.setAttribute('aria-labelledby', 'direction-tab-' + direction.id);
      panel.innerHTML =
        '<p class="direction-intro">' + escapeHTML(direction.summary) + '</p>'
        + '<div class="direction-grid">'
        + (direction.groups || []).map(function (group) {
            return '<article class="direction-group fade-up">'
              + '<h3>' + escapeHTML(group.title) + '</h3>'
              + '<p>' + escapeHTML(group.description) + '</p>'
              + '<ul class="program-list">'
              + (group.programs || []).map(function (program) {
                  return '<li>'
                    + '<strong>' + escapeHTML(program.school) + '</strong>'
                    + '<span>' + escapeHTML(program.program) + '</span>'
                    + (program.status ? '<small>' + escapeHTML(program.status) + '</small>' : '')
                    + '</li>';
                }).join('')
              + '</ul></article>';
          }).join('')
        + '</div>'
        + '<button type="button" class="content-detail-link direction-detail-link" data-overlay-child="'
        + escapeHTML(overlayIdFrom(detailLinks[direction.id])) + '">查看'
        + escapeHTML(direction.label) + '完整方向</button>';

      Reveal.scan(panel);
    }

    tabs.innerHTML = (data.directions || []).map(function (direction, index) {
      return '<button type="button" role="tab" id="direction-tab-' + escapeHTML(direction.id)
        + '" data-direction="' + escapeHTML(direction.id) + '" aria-controls="direction-panel" aria-selected="'
        + (index === 0) + '">' + escapeHTML(direction.label) + '</button>';
    }).join('');

    tabs.addEventListener('click', function (event) {
      var button = event.target.closest('[data-direction]');
      if (button) render(button.dataset.direction);
    });
    tabs.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      var buttons = Array.prototype.slice.call(tabs.querySelectorAll('button'));
      var current = buttons.indexOf(document.activeElement);
      if (current === -1) return;
      var delta = event.key === 'ArrowRight' ? 1 : -1;
      var next = buttons[(current + delta + buttons.length) % buttons.length];
      next.focus();
      render(next.dataset.direction);
    });

    panel.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-overlay-child]');
      if (trigger && trigger.dataset.overlayChild) Overlay.open(trigger.dataset.overlayChild);
    });

    if (data.directions && data.directions.length) render(data.directions[0].id);
  }

  /* ── 升学路径 ── */
  function initPathways(data) {
    var list = document.getElementById('pathway-list');
    if (!list) return;
    var detailLinks = data.detailLinks.pathways || {};

    list.innerHTML = (data.pathways || []).map(function (pathway, index) {
      var open = index === 0;
      return '<article class="pathway-item fade-up">'
        + '<button type="button" class="pathway-toggle" id="pathway-button-' + escapeHTML(pathway.id)
        + '" aria-expanded="' + open + '" aria-controls="pathway-panel-' + escapeHTML(pathway.id) + '">'
        + '<span class="pathway-index">' + escapeHTML(pathway.index) + '</span>'
        + '<span>'
        + '<span class="pathway-title">' + escapeHTML(pathway.title) + '</span>'
        + '<span class="pathway-tagline">' + escapeHTML(pathway.tagline) + '</span>'
        + '</span>'
        + '<span class="pathway-symbol" aria-hidden="true">' + (open ? '−' : '+') + '</span>'
        + '</button>'
        + '<div class="pathway-panel" id="pathway-panel-' + escapeHTML(pathway.id) + '" role="region" aria-labelledby="pathway-button-'
        + escapeHTML(pathway.id) + '"' + (open ? '' : ' hidden') + '>'
        + '<div class="pathway-columns">'
        + '<div>'
        + '<h4>为什么成立</h4><p>' + escapeHTML(pathway.why) + '</p>'
        + '<h4>培养与申请路线</h4><ol>'
        + (pathway.route || []).map(function (step) { return '<li>' + escapeHTML(step) + '</li>'; }).join('')
        + '</ol></div>'
        + '<div>'
        + '<h4>适合学生</h4><p>' + escapeHTML(pathway.fit) + '</p>'
        + '<h4>代表方向</h4><div class="representative-list">'
        + (pathway.representatives || []).map(function (item) { return '<span>' + escapeHTML(item) + '</span>'; }).join('')
        + '</div>'
        + '<p class="evidence-note">' + escapeHTML(pathway.evidence) + '</p>'
        + '<button type="button" class="content-detail-link pathway-detail-link" data-overlay-child="'
        + escapeHTML(overlayIdFrom(detailLinks[pathway.id])) + '">查看完整培养路线</button>'
        + '</div></div></div></article>';
    }).join('');

    list.addEventListener('click', function (event) {
      var toggle = event.target.closest('.pathway-toggle');
      if (toggle) {
        var isOpen = toggle.getAttribute('aria-expanded') === 'true';
        var panel = document.getElementById(toggle.getAttribute('aria-controls'));
        if (panel) {
          toggle.setAttribute('aria-expanded', String(!isOpen));
          var symbol = toggle.querySelector('.pathway-symbol');
          if (symbol) symbol.textContent = isOpen ? '+' : '−';
          panel.hidden = isOpen;
        }
        return;
      }
      var trigger = event.target.closest('[data-overlay-child]');
      if (trigger && trigger.dataset.overlayChild) Overlay.open(trigger.dataset.overlayChild);
    });
  }

  /* ── 五大能力 ── */
  function initOutputs(data) {
    var grid = document.getElementById('output-grid');
    if (!grid) return;
    var detailLinks = data.detailLinks.outputs || {};

    grid.innerHTML = (data.outputs || []).map(function (output) {
      return '<article class="output-card fade-up" data-output-group="' + escapeHTML(output.group) + '">'
        + '<img src="' + escapeHTML(IMG_PREFIX + output.image) + '" alt="' + escapeHTML(output.title)
        + '学生作品画面" loading="lazy" width="800" height="600">'
        + '<div class="output-copy">'
        + '<span class="output-group">' + (output.group === 'art-tech' ? 'ART &amp; TECH' : 'BRAND &amp; GRAPHIC') + '</span>'
        + '<h3>' + escapeHTML(output.title) + '</h3>'
        + '<p>' + escapeHTML(output.description) + '</p>'
        + '<button type="button" class="content-detail-link" data-overlay-child="'
        + escapeHTML(overlayIdFrom(detailLinks[output.id])) + '">了解对应能力</button>'
        + '</div></article>';
    }).join('');

    grid.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-overlay-child]');
      if (trigger && trigger.dataset.overlayChild) Overlay.open(trigger.dataset.overlayChild);
    });

    var filters = document.getElementById('output-filters');
    if (!filters) return;
    filters.addEventListener('click', function (event) {
      var button = event.target.closest('[data-output-filter]');
      if (!button) return;
      var filter = button.dataset.outputFilter;
      filters.querySelectorAll('[data-output-filter]').forEach(function (item) {
        item.setAttribute('aria-pressed', String(item === button));
      });
      grid.querySelectorAll('.output-card').forEach(function (card) {
        card.classList.toggle('is-dimmed', filter !== 'all' && card.dataset.outputGroup !== filter);
      });
    });
  }

  /* ── 学生适配 ── */
  function initProfiles(data) {
    var grid = document.getElementById('profile-grid');
    var result = document.getElementById('profile-result');
    if (!grid || !result) return;
    var detailLinks = data.detailLinks.profiles || {};

    function select(profileId) {
      var profile = (data.profiles || []).filter(function (p) { return p.id === profileId; })[0] || data.profiles[0];
      if (!profile) return;
      grid.querySelectorAll('.profile-card').forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.dataset.profile === profile.id));
      });
      result.innerHTML =
        '<strong>' + escapeHTML(profile.subtitle) + '的建议入口</strong>'
        + '<div><p>' + escapeHTML(profile.startingPoint) + ' ' + escapeHTML(profile.recommendation) + '</p>'
        + '<button type="button" class="content-detail-link" data-overlay-child="'
        + escapeHTML(overlayIdFrom(detailLinks[profile.id])) + '">查看这类学生的项目入口</button></div>';
    }

    grid.innerHTML = (data.profiles || []).map(function (profile, index) {
      return '<button type="button" class="profile-card fade-up" data-profile="' + escapeHTML(profile.id)
        + '" aria-pressed="' + (index === 0) + '">'
        + '<img src="' + escapeHTML(IMG_PREFIX + profile.image) + '" alt="' + escapeHTML(profile.title)
        + '方向学生作品画面" loading="lazy" width="800" height="500">'
        + '<span class="profile-copy">'
        + '<small>' + escapeHTML(profile.subtitle) + '</small>'
        + '<h3>' + escapeHTML(profile.title) + '</h3>'
        + '<strong>' + escapeHTML(profile.subtitle) + '</strong>'
        + '<p>' + escapeHTML(profile.description) + '</p>'
        + '</span></button>';
    }).join('');

    grid.addEventListener('click', function (event) {
      var button = event.target.closest('[data-profile]');
      if (button) select(button.dataset.profile);
    });
    result.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-overlay-child]');
      if (trigger && trigger.dataset.overlayChild) Overlay.open(trigger.dataset.overlayChild);
    });

    if (data.profiles && data.profiles.length) select(data.profiles[0].id);
  }

  /* ── 专业优势 (no children, no overlay — plain list, unchanged) ── */
  function initAdvantages(data) {
    var list = document.getElementById('advantage-list');
    if (!list) return;
    list.innerHTML = (data.advantages || []).map(function (advantage) {
      return '<article class="advantage-item fade-up">'
        + '<span class="advantage-index">' + escapeHTML(advantage.index) + '</span>'
        + '<div><h3>' + escapeHTML(advantage.title) + '</h3>'
        + '<p>' + escapeHTML(advantage.description) + '</p></div>'
        + '</article>';
    }).join('');
  }

  function bindOverlayChrome() {
    var overlay = document.getElementById('content-overlay');
    if (!overlay) return;
    overlay.addEventListener('click', function (event) {
      if (event.target.closest('[data-overlay-close]')) Overlay.close();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') Overlay.close();
    });
  }

  /* GM (follow-up): "作品图册page下的本科夏校、作品集合集两个card点开也做成
     overlay而不是独立page" — `works` has an overlay shell + payload
     (build-undergrad.cjs's OVERLAY_SHELL_IDS/OVERLAY_CHILDREN_IDS) and
     its own children-cards grid (renderChildren()'s overlayMode
     branch), but no topic widget at all — it never had a homepage
     section. So overlay-chrome and the children-grid's click
     delegation are wired independently of the topic-widget fetch
     below, keyed off their own markers rather than [data-topic-widget]. */
  function bindOverlayChildren() {
    var section = document.querySelector('.children-section[data-overlay-children]');
    if (!section) return;
    section.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-overlay-child]');
      if (trigger && trigger.dataset.overlayChild) Overlay.open(trigger.dataset.overlayChild);
    });
  }

  function boot() {
    var hasOverlay = !!document.getElementById('content-overlay');
    var hasTopicWidget = !!document.querySelector('[data-topic-widget]');
    var hasOverlayChildren = !!document.querySelector('.children-section[data-overlay-children]');

    /* Cheap self-guard: pages with none of the three markers above
       (works/cases descendants, etc.) load this same script but do
       nothing at all — no observer set up, no fetch fired. */
    if (!hasOverlay && !hasTopicWidget && !hasOverlayChildren) return;

    Reveal.init();
    if (hasOverlay) bindOverlayChrome();
    if (hasOverlayChildren) bindOverlayChildren();

    if (!hasTopicWidget) return;

    Reveal.scan(document);
    fetch(DATA_URL, { cache: 'no-cache' })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status + ' — ' + DATA_URL);
        return response.json();
      })
      .then(function (data) {
        initDirections(data);
        initPathways(data);
        initOutputs(data);
        initProfiles(data);
        initAdvantages(data);
        Reveal.scan(document);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
