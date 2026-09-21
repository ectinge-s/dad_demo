/* ═══════════════════════════════════════════
   UNDERGRAD HOME — 本科站首页交互
   Owns every interaction on undergraduate/index.html:
     · hero text/image injection
     · 主题入口 (depth navigation) grid
     · 申请方向 tablist (click + ←/→ keyboard, ARIA synced)
     · 升学路径 accordion (aria-expanded + symbol swap)
     · 能力产出 filter (dims, never removes)
     · 学生适配 profile picker (single-select + result panel)
     · 专业优势 grid
     · .fade-up scroll reveal

   Content comes from data/undergrad-content.json (relative to this
   page, i.e. undergrad/data/…), which the build step writes with every
   route/image path already resolved for the site root.

   Deliberately separate from the graduate site's scripts: no shared
   globals, no dependency on assets/js/*.
═══════════════════════════════════════════ */
(function () {
  'use strict';

  var DATA_URL = 'data/site/undergrad-content.json';

  function escapeHTML(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ── reveal — same behaviour as the graduate site's Effects.init():
     observe .fade-up elements, add .is-visible once, and allow
     re-scanning a subtree after it is re-rendered. ── */
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

  function fail(message) {
    var main = document.getElementById('main-content');
    if (main) main.innerHTML = '<div class="container" style="padding:80px 0">'
      + '<p class="section-kicker">Data unavailable</p>'
      + '<h2>本科站内容加载失败</h2>'
      + '<p style="color:var(--color-text-muted);margin-top:12px">' + escapeHTML(message) + '</p></div>';
  }

  function renderHero(data) {
    var img = document.getElementById('hero-image');
    if (img) { img.src = data.meta.heroImage; img.alt = data.meta.title + ' · 学生数字艺术作品'; }
    setText('hero-eyebrow', data.meta.eyebrow);
    setText('hero-title', data.meta.title);
    setText('hero-lead', data.meta.lead);
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value == null ? '' : value;
  }

  function renderDepthNav(data) {
    var grid = document.getElementById('depth-nav-grid');
    if (!grid) return;
    grid.innerHTML = (data.deepNavigation || []).map(function (item) {
      return '<a class="depth-nav-card fade-up" href="' + escapeHTML(item.route) + '">'
        + '<strong>' + escapeHTML(item.label) + '</strong>'
        + '<span>' + escapeHTML(item.summary) + '</span>'
        + '</a>';
    }).join('');
  }

  /* ── 申请方向 ── */
  function initDirections(data) {
    var tabs = document.getElementById('direction-tabs');
    var panel = document.getElementById('direction-panel');
    if (!tabs || !panel) return;

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
        + '<a class="content-detail-link direction-detail-link" href="'
        + escapeHTML((data.detailLinks.directions || {})[direction.id] || '#') + '">查看'
        + escapeHTML(direction.label) + '完整方向</a>';

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

    if (data.directions && data.directions.length) render(data.directions[0].id);
  }

  /* ── 升学路径 ── */
  function initPathways(data) {
    var list = document.getElementById('pathway-list');
    if (!list) return;

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
        + '<a class="content-detail-link pathway-detail-link" href="'
        + escapeHTML((data.detailLinks.pathways || {})[pathway.id] || '#') + '">查看完整培养路线</a>'
        + '</div></div></div></article>';
    }).join('');

    list.addEventListener('click', function (event) {
      var button = event.target.closest('.pathway-toggle');
      if (!button) return;
      var isOpen = button.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(button.getAttribute('aria-controls'));
      if (!panel) return;
      button.setAttribute('aria-expanded', String(!isOpen));
      var symbol = button.querySelector('.pathway-symbol');
      if (symbol) symbol.textContent = isOpen ? '+' : '−';
      panel.hidden = isOpen;
    });
  }

  /* ── 能力产出 ── */
  function initOutputs(data) {
    var grid = document.getElementById('output-grid');
    if (!grid) return;

    grid.innerHTML = (data.outputs || []).map(function (output) {
      return '<article class="output-card fade-up" data-output-group="' + escapeHTML(output.group) + '">'
        + '<img src="' + escapeHTML(output.image) + '" alt="' + escapeHTML(output.title)
        + '学生作品画面" loading="lazy" width="800" height="600">'
        + '<div class="output-copy">'
        + '<span class="output-group">' + (output.group === 'art-tech' ? 'ART &amp; TECH' : 'BRAND &amp; GRAPHIC') + '</span>'
        + '<h3>' + escapeHTML(output.title) + '</h3>'
        + '<p>' + escapeHTML(output.description) + '</p>'
        + '<a class="content-detail-link" href="' + escapeHTML((data.detailLinks.outputs || {})[output.id] || '#')
        + '">了解对应能力</a>'
        + '</div></article>';
    }).join('');

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

    function select(profileId) {
      var profile = (data.profiles || []).filter(function (p) { return p.id === profileId; })[0] || data.profiles[0];
      if (!profile) return;
      grid.querySelectorAll('.profile-card').forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.dataset.profile === profile.id));
      });
      result.innerHTML =
        '<strong>' + escapeHTML(profile.subtitle) + '的建议入口</strong>'
        + '<div><p>' + escapeHTML(profile.startingPoint) + ' ' + escapeHTML(profile.recommendation) + '</p>'
        + '<a class="content-detail-link" href="' + escapeHTML((data.detailLinks.profiles || {})[profile.id] || '#')
        + '">查看这类学生的项目入口</a></div>';
    }

    grid.innerHTML = (data.profiles || []).map(function (profile, index) {
      return '<button type="button" class="profile-card fade-up" data-profile="' + escapeHTML(profile.id)
        + '" aria-pressed="' + (index === 0) + '">'
        + '<img src="' + escapeHTML(profile.image) + '" alt="' + escapeHTML(profile.title)
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

    if (data.profiles && data.profiles.length) select(data.profiles[0].id);
  }

  /* ── 专业优势 ── */
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

  function boot() {
    Reveal.init();
    Reveal.scan(document);
    fetch(DATA_URL, { cache: 'no-cache' })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status + ' — ' + DATA_URL);
        return response.json();
      })
      .then(function (data) {
        renderHero(data);
        renderDepthNav(data);
        initDirections(data);
        initPathways(data);
        initOutputs(data);
        initProfiles(data);
        initAdvantages(data);
        Reveal.scan(document);
      })
      .catch(function (error) {
        console.error(error);
        fail('无法读取 ' + DATA_URL + '（' + error.message + '）。请在站点根目录用本地服务器打开，而非直接双击 HTML 文件。');
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
