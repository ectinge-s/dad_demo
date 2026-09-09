/* ═══════════════════════════════════════════
   IST-DATA — minimal loader for the JS copied from /ist_demo
   (timeline.js, course-demo.js) that expects a global `DATA` object
   in IST's own shape (DATA.<name> after DATA.load()). Scoped to just
   `timeline`, the one dataset those copied pages actually need here —
   see docs/PROJECT_NOTES.md for what's deferred (course catalog data).
   Kept separate from this site's own `Data` loader (assets/js/data.js)
   so neither collides with the other.
═══════════════════════════════════════════ */
const DATA = (() => {
  const cache = {};
  const BASE = './data/';
  const FILES = ['timeline'];

  async function load() {
    await Promise.all(FILES.map(async name => {
      const r = await fetch(BASE + name + '.json');
      cache[name] = await r.json();
    }));
  }

  return new Proxy({ load }, {
    get(target, prop) {
      if (prop === 'load') return target.load;
      return cache[prop];
    }
  });
})();
