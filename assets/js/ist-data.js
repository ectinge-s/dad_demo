/* ═══════════════════════════════════════════
   IST-DATA — minimal loader for the JS copied from /ist_demo
   (timeline.js, course-demo.js) that expects a global `DATA` object
   in IST's own shape (DATA.<name> after DATA.load()). Originally scoped
   to just `timeline`; as of the 2026-09 catalog-data delivery, also
   loads `courses_industry`/`courses_academic` (from the real
   `dad_courses_industry.json`/`dad_courses_academic.json` files GM's
   team delivered) so course-demo.js's internship/summerwinter/
   bizpractice/masterclass catalogs can render real data — see
   docs/PROJECT_NOTES.md. Kept separate from this site's own `Data`
   loader (assets/js/data.js) so neither collides with the other.

   TAB REMAP: the delivered JSON uses Chinese `program_type` labels
   (岗位制实习（实地）/ 行业导师带训（线上）/ 商业实践项目课程 /
   海外冬夏校 / 海外大师课), not the English tab codes course-demo.js's
   PRODUCTS registry filters on (internship/mentoring/bizpractice/
   summer/masterclass). Rather than rewrite that existing filter logic,
   each record's `tab` field is remapped in place at load time so
   `src.tabs.includes(c.tab)` keeps working unmodified.
═══════════════════════════════════════════ */
const DATA = (() => {
  const cache = {};
  const BASE = './data/';
  // name used as the DATA.<name> cache key -> actual JSON filename on disk
  const FILES = {
    timeline: 'timeline',
    courses_industry: 'dad_courses_industry',
    courses_academic: 'dad_courses_academic',
  };

  const PROGRAM_TYPE_TO_TAB = {
    '岗位制实习（实地）': 'internship',
    '行业导师带训（线上）': 'mentoring',
    '商业实践项目课程': 'bizpractice',
    '海外冬夏校': 'summer',
    '海外大师课': 'masterclass',
  };

  async function load() {
    await Promise.all(Object.entries(FILES).map(async ([cacheKey, fileName]) => {
      const r = await fetch(BASE + fileName + '.json');
      const json = await r.json();
      if (Array.isArray(json)) {
        json.forEach(rec => {
          const mapped = PROGRAM_TYPE_TO_TAB[rec.program_type];
          if (mapped) rec.tab = mapped;
        });
      }
      cache[cacheKey] = json;
    }));
  }

  return new Proxy({ load }, {
    get(target, prop) {
      if (prop === 'load') return target.load;
      return cache[prop];
    }
  });
})();
