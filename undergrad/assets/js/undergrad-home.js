/* ═══════════════════════════════════════════
   UNDERGRAD HOME — 本科站首页交互
   Owns every interaction on undergraduate/index.html:
     · hero text/image injection
     · .fade-up scroll reveal

   v3.39 (GM): the 5 topic widgets that used to live here (申请方向
   tablist, 升学路径 accordion, 能力产出 filter grid, 学生适配 profile
   picker, 专业优势 list) moved to assets/js/undergrad-topic.js and now
   render at the top of each topic's own hub page instead — see that
   file's header comment and build-undergrad.cjs's renderTopicWidget().
   The homepage kept its simplified title+intro+CTA band per topic
   (main.template.html) but no longer renders the widgets themselves,
   so this file no longer needs to own them.

   v3.42 (GM): "主页现在hero下的横向card与下面stack的部分功能重复。去掉cards" —
   removed renderDepthNav() (the #depth-nav-grid card row just below the
   hero), a second, redundant set of entry points to the same 5 topics
   the bands below it already link to. The bands' own copy/imagery were
   made to carry that job properly instead (main.template.html/
   undergrad.css). build-undergrad.cjs's buildBrowserContent() has
   stopped emitting `deepNavigation` into the browser payload for the
   same reason (nothing reads it anymore).

   v3.42 (GM): "拿掉目前的homepage hero背景图" — renderHero() no longer sets
   a #hero-image src; the hero background is now graduate's decorative
   grid/bloom/scan/HUD/readout shell (pure CSS, main.template.html) plus
   the shared cursor effect, not a photo. `meta.heroImage` was removed
   from undergrad-content.json accordingly.

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
    setText('hero-eyebrow', data.meta.eyebrow);
    setText('hero-title', data.meta.title);
    setText('hero-lead', data.meta.lead);
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value == null ? '' : value;
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
