/* ═══════════════════════════════════════════
   UNDERGRAD DETAIL — 本科站详情页交互
   Every one of the 34 generated detail pages is static HTML, so this
   script only adds progressive behaviour on top:

     · .fade-up scroll reveal (same recipe as the graduate site)
     · 本页内容 rail — highlights the section the reader is currently in
       (`is-current`), so the sticky rail reads like the graduate site's
       active-state rails

   It never rewrites page content: if the scripts are stripped, each
   page still renders as complete, static HTML.
═══════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── reveal ── */
  var observer = null;
  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.fade-up').forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.fade-up:not(.is-visible)').forEach(function (el) { observer.observe(el); });
  }

  /* ── contents rail: mark the section in view ──
     Uses the rail's own <a href="#section-N"> list as the source of
     truth, so no section ids are hardcoded here. */
  function initRail() {
    var rail = document.querySelector('.contents-rail');
    if (!rail) return;
    var links = Array.prototype.slice.call(rail.querySelectorAll('a[href^="#"]'));
    if (!links.length) return;

    var targets = links.map(function (link) {
      return { link: link, section: document.getElementById(link.getAttribute('href').slice(1)) };
    }).filter(function (item) { return !!item.section; });
    if (!targets.length) return;

    var current = null;
    function setCurrent(link) {
      if (current === link) return;
      if (current) current.classList.remove('is-current');
      current = link;
      if (current) current.classList.add('is-current');
    }

    function update() {
      // "reading line" sits just under the sticky header
      var line = 140;
      var active = targets[0];
      targets.forEach(function (item) {
        if (item.section.getBoundingClientRect().top - line <= 0) active = item;
      });
      // at the very bottom, always highlight the last section
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
        active = targets[targets.length - 1];
      }
      setCurrent(active.link);
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  function boot() {
    initReveal();
    initRail();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
