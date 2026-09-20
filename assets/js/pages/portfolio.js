/* ═══════════════════════════════════════════
   PORTFOLIO PAGE (案例展示 / 学生案例) — v3.10 real-data pass. Loads
   data/portfolio-cases.json (70 real MA/研究生 offer cases, transcribed
   from GM's team's DAD MA 网站信息包.xlsx「MA案例卡」tab — see
   docs/PROJECT_NOTES.md). Each case has a square grid thumbnail
   (`thumb`, the sheet's 画板名称+"头图" image) and a full-size branded
   case-card poster (`full`, the plain 画板名称 image) that opens in the
   shared ImageModal (assets/js/components.js) on click.

   TWO INDEPENDENT MULTI-SELECT FILTER ROWS (per GM's explicit spec —
   this is NOT the site's usual single-select .filter-bar pattern,
   which forcibly clears sibling .is-active classes):
     Row 1 — 国家/地区: one button per UNIQUE region value straight off
       the sheet's 申请地区多选 column (10 total) — deliberately NOT
       bucketed into groups like "港新"/"其他".
     Row 2 — labelled 项目类型 in the UI, sourced from the sheet's
       5大分支多选 column (5 unique values).
   A case can match several buttons in either row (its regions[]/
   types[] arrays), so matching is OR-within-a-row, AND-across-the-two-
   rows. Each row has its own "全部" reset button. Selection state
   lives in this._selRegions / this._selTypes (Sets); empty means "no
   filter on this row" (shows everything for that row), matching "全部"
   being active by default. ── */

const PortfolioPage = {
  _data: [],
  _regions: [],
  _types: [],
  _selRegions: new Set(),
  _selTypes: new Set(),

  // v3.11 (GM): 国家/地区 filter order is fixed, NOT alphabetical — GM's
  // own priority: 英美港澳(日)加 first (日本 isn't in the real data — no
  // case's 申请地区多选 lists it — so it's simply skipped), then the
  // remaining regions ranked by study-destination importance (韩国/新加坡
  // are larger, more mainstream design-study markets than the Nordic
  // countries, which have very few relevant programs — see
  // docs/PROJECT_NOTES.md for the reasoning and the case-count tie-
  // breakers). Any region not in this list (e.g. real future data adds
  // one) sorts after all of these, alphabetically among itself.
  REGION_ORDER: ['英国', '美国', '中国香港', '中国澳门', '加拿大', '澳洲', '意大利', '新加坡', '韩国', '北欧'],

  async build() {
    this._data = await Data.load('portfolio-cases');
    this._regions = [...new Set(this._data.flatMap(c => c.regions || []))].sort((a, b) => {
      const ia = this.REGION_ORDER.indexOf(a), ib = this.REGION_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b, 'zh');
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    this._types = [...new Set(this._data.flatMap(c => c.types || []))].sort((a, b) => a.localeCompare(b, 'zh'));

    this._renderFilterRow('portfolio-filter-region', this._regions, this._selRegions, 'region');
    this._renderFilterRow('portfolio-filter-type', this._types, this._selTypes, 'type');
    this._render();
    // PortfolioPage.build() runs before Router.go() makes #page-portfolio
    // visible (see the boot sequence in index.html), so the global
    // Effects.init() at DOMContentLoaded observes this page's .fade-up
    // elements while they're still display:none and never reveals them on
    // a direct /#portfolio load. Every other page builder that renders
    // .fade-up content re-runs Effects.init() on its own root right after
    // rendering (see HomePage.render/PlanningPage.render) — do the same here.
    Effects.init(document.getElementById('page-portfolio'));
  },

  _renderFilterRow(elId, values, selectedSet, kind) {
    const root = document.getElementById(elId);
    if (!root) return;
    const allActive = selectedSet.size === 0;
    root.innerHTML = `
      <button class="filter-btn${allActive ? ' is-active' : ''}" onclick="PortfolioPage.resetRow('${kind}')">全部</button>
      ${values.map(v => `
        <button class="filter-btn${selectedSet.has(v) ? ' is-active' : ''}" onclick="PortfolioPage.toggle('${kind}','${escapeHTML(v)}',this)">${escapeHTML(v)}</button>
      `).join('')}`;
  },

  toggle(kind, value, btn) {
    const selectedSet = kind === 'region' ? this._selRegions : this._selTypes;
    if (selectedSet.has(value)) selectedSet.delete(value);
    else selectedSet.add(value);
    btn.classList.toggle('is-active');
    // keep the row's "全部" button in sync (active only when nothing else is selected)
    const allBtn = btn.parentElement.querySelector('.filter-btn');
    if (allBtn) allBtn.classList.toggle('is-active', selectedSet.size === 0);
    this._render();
  },

  resetRow(kind) {
    const elId = kind === 'region' ? 'portfolio-filter-region' : 'portfolio-filter-type';
    const selectedSet = kind === 'region' ? this._selRegions : this._selTypes;
    selectedSet.clear();
    this._renderFilterRow(elId, kind === 'region' ? this._regions : this._types, selectedSet, kind);
    this._render();
  },

  _render() {
    const items = this._data.filter(c => {
      const regionOk = this._selRegions.size === 0 || (c.regions || []).some(r => this._selRegions.has(r));
      const typeOk = this._selTypes.size === 0 || (c.types || []).some(t => this._selTypes.has(t));
      return regionOk && typeOk;
    });
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;
    if (!items.length) {
      grid.innerHTML = `<div class="tl-gantt-empty" style="padding:40px 0;grid-column:1/-1">没有符合筛选条件的案例 · 试试调整筛选项</div>`;
    } else {
      grid.innerHTML = items.map(c => this._cardHTML(c)).join('');
    }
    const wrap = document.getElementById('portfolio-more-wrap');
    if (wrap) wrap.innerHTML = '';
  },

  // v3.12 (GM): added a "{背景单选}背景" line under the student's
  // anonymized name (e.g. "双非背景", "海本背景") — sourced from the
  // xlsx's 背景单选 column, already present as each record's
  // `background` field since the original v3.10 extraction pass (it
  // just wasn't rendered until now).
  _cardHTML(c) {
    const jsEscape = s => String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const schools = (c.schools || []).filter(Boolean);
    const tags = (c.types || []).filter(Boolean);
    return `
      <div class="port-card" onclick="ImageModal.open('${jsEscape(c.full)}','${jsEscape(c.name)}')" style="cursor:pointer">
        <div class="port-card__img">
          <img src="${escapeHTML(c.thumb)}" alt="${escapeHTML(c.name)}" loading="lazy">
          ${c.regions && c.regions[0] ? `<span class="port-card__cat-tag">${escapeHTML(c.regions.join(' / '))}</span>` : ''}
        </div>
        <div class="port-card__body">
          <div class="port-card__title">${escapeHTML(c.name || '')}</div>
          ${c.background ? `<div class="port-card__background">${escapeHTML(c.background)}背景</div>` : ''}
          ${schools.length ? `<div class="port-card__program">${schools.map(escapeHTML).join(' · ')}</div>` : ''}
          ${tags.length ? `<div class="port-card__tags">${tags.map(t => `<span class="port-card__tag">${escapeHTML(t)}</span>`).join('')}</div>` : ''}
        </div>
      </div>`;
  },
};
window.PortfolioPage = PortfolioPage;
