/* ═══════════════════════════════════════════
   DATA — loads and caches the JSON data layer.
   Mirrors IST's data/*.json convention: content lives
   in flat JSON files, never hardcoded in page JS.
═══════════════════════════════════════════ */

const Data = {
  _cache: {},

  async load(name) {
    if (this._cache[name]) return this._cache[name];
    const res = await fetch(`data/${name}.json`);
    if (!res.ok) throw new Error(`Failed to load data/${name}.json (${res.status})`);
    const json = await res.json();
    this._cache[name] = json;
    return json;
  },

  async loadAll() {
    const [site, industries, companies, cityHeat] = await Promise.all([
      this.load('site-content'),
      this.load('industries'),
      this.load('companies'),
      this.load('city-heat'),
    ]);
    return { site, industries, companies, cityHeat };
  },
};

/* Industry id (direction-N) <-> title lookup helper, shared by
   home.js (cards, quiz) and planning.js (drill-down, modal). */
const IndustryIndex = {
  build(industries) {
    const byId = {};
    const byTitle = {};
    industries.forEach(ind => { byId[ind.id] = ind; byTitle[ind.title] = ind; });
    return { byId, byTitle };
  },
};
