/* ═══════════════════════════════════════════
   PORTFOLIO PAGE (案例展示 / 学生案例) — duplicates IST's Portfolio page
   structure (assets/js/pages/portfolio.js in /ist_demo: filter-by-
   category grid of .port-card items) per GM's 2026-09 request, but
   uses ONLY placeholder image/text (data/portfolio-placeholder.json) —
   never real student data. Categories reuse DAD's own 8 industries
   (INDUSTRY_COLOR_VAR, from components.js) instead of IST's 5 academic
   branches, so this page stays consistent with the rest of the site's
   industry taxonomy. Cards are rounded with real gaps + a full-
   perimeter yellow glow on hover (see .port-card / .card-grid in
   assets/css/ist-shared.css) — NOT IST's zero-gap grid + top-bar
   hover reveal.
═══════════════════════════════════════════ */

const PortfolioPage = {
  _data: [],

  async build() {
    this._data = await Data.load('portfolio-placeholder');
    const branches = ['全部', ...new Set(this._data.map(p => p.academic_branch).filter(Boolean))];
    const cats = document.getElementById('portfolio-filter-bar');
    if (cats) {
      cats.innerHTML = branches.map((b, i) =>
        `<button class="filter-btn${i === 0 ? ' is-active' : ''}" onclick="PortfolioPage.filter('${escapeHTML(b)}',this)">${escapeHTML(b)}</button>`
      ).join('');
    }
    this._render('全部');
  },

  filter(branch, btn) {
    document.querySelectorAll('#portfolio-filter-bar .filter-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    this._render(branch);
  },

  _render(branch) {
    const items = branch === '全部' ? this._data : this._data.filter(p => p.academic_branch === branch);
    document.getElementById('portfolio-grid').innerHTML = items.map(p => {
      const otherSchools = (p.other_schools || []).filter(Boolean);
      return `
      <div class="port-card">
        <div class="port-card__img">
          <span class="port-card__img-placeholder">${escapeHTML(p.academic_branch || '')} · 占位图</span>
          <span class="port-card__cat-tag">${escapeHTML(p.academic_branch || '')}</span>
        </div>
        <div class="port-card__body">
          <div class="port-card__title">${escapeHTML(p.primary_school || '—')}</div>
          <div class="port-card__program">${escapeHTML(p.primary_program || '')}</div>
          ${otherSchools.length ? `<div class="port-card__other-schools">${otherSchools.map(escapeHTML).join('　')}</div>` : ''}
          ${p.tags && p.tags.length ? `<div class="port-card__tags">${p.tags.map(t => `<span class="port-card__tag">${escapeHTML(t)}</span>`).join('')}</div>` : ''}
        </div>
      </div>`;
    }).join('');
  },
};
window.PortfolioPage = PortfolioPage;
