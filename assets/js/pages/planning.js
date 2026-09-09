/* ═══════════════════════════════════════════
   PLANNING PAGE — industry → company/job/school drill-down.
   Same shape as IST's planning.js (industry nav + per-industry
   panel), scaled to DAD's richer data: 8 industries, each with
   salary tiers, enterprises, schools, and a full company-insight
   modal (69 companies total, kept at full detail per project decision).
═══════════════════════════════════════════ */

const PlanningPage = {
  industries: [],
  companies: {},

  async render(data) {
    this.industries = data.industries;
    this.companies = data.companies;
    this.renderHero();
    this.renderNav();
    this.renderPanels();
    // ── Content moved here from the homepage, 2026-09 restructuring:
    // home now only teases 8 industries (see HomePage.renderCareerTeaser);
    // the full detail — industry overview, heatmap, JD decoder, overseas
    // pathways, FAQ, quiz, roadmap, capabilities, data insights — lives
    // on this page so nothing built in v1 was deleted, only relocated.
    const { site, cityHeat } = data;
    this.renderIndustriesOverview(site.industriesIntro, this.industries);
    this.renderHeatmap(site.heatmap, cityHeat);
    this.renderJD(site.jdDecoder);
    this.renderPathways(site.overseasPathways);
    this.renderFAQ(site.faq);
    this.renderQuiz(site.quiz);
    this.renderRoadmap(site.roadmap);
    this.renderCapabilities(site.capabilities);
    this.renderDataInsights(site.dataInsights);
    Effects.init(document.getElementById('page-planning'));
  },

  renderHero() {
    document.getElementById('planning-hero-root').innerHTML = `
      <div class="hero-grid-bg"></div>
      <div class="container hero__content">
        <span class="eyebrow eyebrow--on-void u-en">CAREER PLANNING · INDUSTRY MAP</span>
        <h1 class="fade-up">职业规划 <span class="accent">× 产业全景</span></h1>
        <p class="hero__subtitle fade-up">从八大行业出发，深入了解每个赛道的头部企业、核心岗位与对应升学路径。点击企业查看岗位详情，点击院校区块对照申请方向。</p>
      </div>`;
  },

  renderNav() {
    document.getElementById('planning-nav-root').innerHTML = `
      <div class="container industry-nav__scroll">
        ${this.industries.map((ind, i) => `
          <button class="industry-nav__btn${i === 0 ? ' is-active' : ''}" id="nav-${ind.id}" onclick="PlanningPage.focusIndustry('${escapeHTML(ind.title)}')">${escapeHTML(ind.title)}</button>`).join('')}
      </div>`;
  },

  renderPanels() {
    document.getElementById('planning-panels-root').innerHTML = this.industries.map(ind => `
      <section class="industry-panel container" id="sec-${ind.id}" style="border-top-color:${industryColor(ind.title)}">
        <div class="industry-panel__banner fade-up" style="background:linear-gradient(135deg, ${industryColor(ind.title)} 0%, #262626 55%, var(--color-void) 100%)">
          <span class="industry-panel__banner-tag">占位图 · Placeholder</span>
          <div class="industry-panel__banner-overlay"></div>
          <div class="industry-panel__banner-content">
            <div>
              <span class="eyebrow eyebrow--on-void u-en">${escapeHTML(ind.label || '')}</span>
              <h2 style="margin-bottom:6px">${escapeHTML(ind.title)} <span class="u-en" style="font-size:14px;color:rgba(255,255,255,.72);font-weight:500">${escapeHTML(ind.titleEn)}</span></h2>
              <p style="max-width:640px;color:rgba(255,255,255,.82);font-size:13.5px;line-height:1.6">${escapeHTML(ind.oneLine)}</p>
            </div>
            <span class="chip is-active industry-panel__banner-chip">${escapeHTML(ind.trendArrow)}</span>
          </div>
        </div>

        <div class="industry-panel__tiers fade-up">
          ${(ind.tiers || []).map(t => `
            <div class="tier-card">
              <span class="tier-card__badge">${escapeHTML(t.badge)}</span>
              <div class="tier-card__salary u-mono">${escapeHTML(t.salary)}</div>
              <div class="tier-card__title">${escapeHTML(t.title)}</div>
              <div class="tier-card__desc">${escapeHTML(t.desc)}</div>
              <div class="tier-card__roles">代表岗位：${escapeHTML(t.gargs)}</div>
              <div class="tier-card__roles">代表企业：${escapeHTML(t.reps)}</div>
            </div>`).join('')}
        </div>

        <div class="fade-up" style="margin-bottom:32px">
          <div class="section-head" style="margin-bottom:16px"><h3 style="margin:0">代表企业 <span style="font-weight:500;font-size:12px;color:var(--color-text-faint)">· 点击查看岗位解读</span></h3></div>
          <div class="company-grid">
            ${(ind.enterprises || []).map(name => `
              <button class="company-chip" onclick="PlanningPage.openCompany('${escapeHTML(ind.id)}','${escapeHTML(ind.title)}','${escapeHTML(name).replace(/'/g, "\\'")}')">${escapeHTML(name)}</button>`).join('')}
          </div>
        </div>

        <div class="fade-up" style="margin-bottom:32px">
          <h3>对口院校方向</h3>
          <div class="schools-grid">
            ${ind.schools ? Object.entries(ind.schools).map(([region, val]) => `
              <div class="schools-col">
                <h5>${escapeHTML({ uk: '英国', us: '美国', hkMacau: '港澳及其他' }[region] || region)}</h5>
                <p>${escapeHTML(val)}</p>
              </div>`).join('') : ''}
          </div>
        </div>

        <div class="fade-up" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px">
          <div>
            <h5 style="font-size:12px;color:var(--color-text-faint);margin-bottom:6px">学生适配画像</h5>
            <p style="font-size:12.5px;color:var(--color-text-secondary);line-height:1.6">${escapeHTML(ind.studentProfile || '')}</p>
          </div>
          <div>
            <h5 style="font-size:12px;color:var(--color-text-faint);margin-bottom:6px">作品集关键</h5>
            <p style="font-size:12.5px;color:var(--color-text-secondary);line-height:1.6">${escapeHTML(ind.portfolioKey || '')}</p>
          </div>
        </div>
      </section>`).join('');
  },

  openCompany(industryId, industryTitle, companyName) {
    const entry = (this.companies[industryId] || {})[companyName];
    if (!entry) return;
    CompanyModal.open(industryTitle, companyName, entry);
  },

  focusIndustry(title) {
    const ind = this.industries.find(i => i.title === title);
    if (!ind) return;
    document.querySelectorAll('.industry-nav__btn').forEach(b => b.classList.remove('is-active'));
    document.getElementById(`nav-${ind.id}`)?.classList.add('is-active');
    const el = document.getElementById(`sec-${ind.id}`);
    if (el) Router.scrollTo(el);
  },

  /* ═══ Everything below was HomePage's, moved here 2026-09 ═══ */

  renderIndustriesOverview(intro, industries) {
    document.getElementById('pl-industries-root').innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">${escapeHTML(intro.sectionLabel)}</span>
        <h2>${escapeHTML(intro.title)}</h2>
        <p>${escapeHTML(intro.description)}</p>
      </div>
      <div class="industry-grid">
        ${industries.map((ind, i) => `
          <div class="industry-card fade-up" onclick="PlanningPage.focusIndustry('${escapeHTML(ind.title)}')" style="border-top:3px solid ${industryColor(ind.title)}">
            <div class="industry-card__top">
              <span class="industry-card__num u-mono">0${i + 1}</span>
              <span class="industry-card__trend">${escapeHTML(ind.trendArrow)}</span>
            </div>
            <div>
              <div class="industry-card__title">${escapeHTML(ind.title)}</div>
              <div class="industry-card__title-en">${escapeHTML(ind.titleEn)}</div>
            </div>
            <p class="industry-card__desc">${escapeHTML(ind.oneLine)}</p>
            <div class="industry-card__enterprises">${escapeHTML((ind.enterprises || []).slice(0, 3).join(' · '))}</div>
            <div class="industry-card__cta">${escapeHTML(intro.cta)} →</div>
          </div>`).join('')}
      </div>`;
  },

  renderHeatmap(hm, cityHeat) {
    const { regions, industries, cells } = cityHeat;
    const cellMap = {};
    cells.forEach(c => { cellMap[`${c.industry}|${c.city}`] = c; });
    document.getElementById('pl-heatmap-root').innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">${escapeHTML(hm.sectionLabel)}</span>
        <h2>${escapeHTML(hm.title)}</h2>
        <p>${escapeHTML(hm.description)}</p>
      </div>
      <div class="heatmap-wrap fade-up">
        <table class="heatmap">
          <thead><tr><th>行业 \\ 城市群</th>${regions.map(r => `<th>${escapeHTML(r)}</th>`).join('')}</tr></thead>
          <tbody>
            ${industries.map(ind => `
              <tr>
                <th>${escapeHTML(ind)}</th>
                ${regions.map(r => {
                  const c = cellMap[`${ind}|${r}`];
                  if (!c) return '<td></td>';
                  return `<td class="heat-cell" data-heat="${c.heat}" data-detail="${escapeHTML(c.detail)}">${c.heat}</td>`;
                }).join('')}
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="heatmap-legend fade-up">
        <span class="heatmap-legend__swatch" style="background:rgba(255,255,255,.08)"></span>${escapeHTML(hm.legend[0])}
        <span class="heatmap-legend__swatch" style="background:rgba(255,255,0,.5)"></span>${escapeHTML(hm.legend[1])}
        <span class="heatmap-legend__swatch" style="background:var(--color-accent)"></span>${escapeHTML(hm.legend[2])}
        <span style="margin-left:auto">${escapeHTML(hm.note)}</span>
      </div>
      <div class="heatmap-tooltip" id="pl-heatmap-tooltip"></div>`;

    const tooltip = document.getElementById('pl-heatmap-tooltip');
    document.querySelectorAll('#pl-heatmap-root .heat-cell').forEach(cell => {
      cell.addEventListener('mousemove', (e) => {
        tooltip.textContent = cell.dataset.detail;
        tooltip.style.left = e.clientX + 16 + 'px';
        tooltip.style.top = e.clientY + 16 + 'px';
        tooltip.classList.add('is-visible');
      });
      cell.addEventListener('mouseleave', () => tooltip.classList.remove('is-visible'));
      cell.addEventListener('click', () => PlanningPage.focusIndustry(cell.closest('tr').querySelector('th').textContent));
    });
  },

  renderJD(jd) {
    document.getElementById('pl-jd-root').innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">${escapeHTML(jd.sectionLabel)}</span>
        <h2>${escapeHTML(jd.title)}</h2>
        <p>${escapeHTML(jd.description)}</p>
      </div>
      <div class="jd-filters fade-up">
        ${jd.filters.map((f, i) => `<button class="chip jd-filter${i === 0 ? ' is-active' : ''}" data-filter="${escapeHTML(f)}">${escapeHTML(f)}</button>`).join('')}
      </div>
      <div class="jd-grid fade-up">
        ${jd.cards.map(c => `
          <div class="jd-card" data-industry="${escapeHTML(c.industry)}">
            <div class="jd-card__tags">
              <span class="jd-card__industry">${escapeHTML(c.industry)}</span>
              <span class="jd-card__tag">${escapeHTML(c.tag)}</span>
            </div>
            <div class="jd-card__quote">${escapeHTML(c.quote)}</div>
            <div class="jd-card__label">🔍 隐性能力要求</div>
            <div class="jd-card__insight">${escapeHTML(c.insight)}</div>
          </div>`).join('')}
      </div>
      <div class="comparison fade-up">
        <div class="comparison__col">
          <h4>🌟 ${escapeHTML(jd.comparison.junior.label)}</h4>
          <div class="comparison__quote">${escapeHTML(jd.comparison.junior.quote)}</div>
          <div class="comparison__row"><strong>看重</strong>${escapeHTML(jd.comparison.junior.valued)}</div>
          <div class="comparison__row"><strong>隐性要求</strong>${escapeHTML(jd.comparison.junior.hidden)}</div>
        </div>
        <div class="comparison__col">
          <h4>🚀 ${escapeHTML(jd.comparison.senior.label)}</h4>
          <div class="comparison__quote">${escapeHTML(jd.comparison.senior.quote)}</div>
          <div class="comparison__row"><strong>看重</strong>${escapeHTML(jd.comparison.senior.valued)}</div>
          <div class="comparison__row"><strong>隐性要求</strong>${escapeHTML(jd.comparison.senior.hidden)}</div>
        </div>
      </div>`;

    document.querySelectorAll('#pl-jd-root .jd-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#pl-jd-root .jd-filter').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const f = btn.dataset.filter;
        document.querySelectorAll('#pl-jd-root .jd-card').forEach(card => {
          card.hidden = f !== '全部行业' && card.dataset.industry !== f;
        });
      });
    });
  },

  renderPathways(p) {
    document.getElementById('pl-pathways-root').innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">${escapeHTML(p.sectionLabel)}</span>
        <h2>${escapeHTML(p.title)}</h2>
        <p>${escapeHTML(p.description)}</p>
      </div>
      <div class="pathway-grid fade-up">
        ${p.cards.map(c => `
          <div class="pathway-card">
            <div class="pathway-card__flag">${c.flag}</div>
            <div class="pathway-card__title">${escapeHTML(c.title)}</div>
            <div class="pathway-card__row"><strong>市场定调</strong>${escapeHTML(c.market)}</div>
            ${c.edge ? `<div class="pathway-card__row"><strong>2026 优势</strong>${escapeHTML(c.edge)}</div>` : ''}
            <div class="pathway-card__row"><strong>热门岗位</strong>${escapeHTML(c.jobs)}</div>
            ${c.barrier ? `<div class="pathway-card__row"><strong>特有壁垒</strong>${escapeHTML(c.barrier)}</div>` : ''}
            ${c.competition ? `<div class="pathway-card__row"><strong>竞争战局</strong>${escapeHTML(c.competition)}</div>` : ''}
            ${c.trend ? `<div class="pathway-card__row"><strong>2026 态势</strong>${escapeHTML(c.trend)}</div>` : ''}
          </div>`).join('')}
      </div>`;
  },

  renderFAQ(faq) {
    document.getElementById('pl-faq-root').innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">${escapeHTML(faq.sectionLabel)}</span>
        <h2>${escapeHTML(faq.title)}</h2>
      </div>
      <div class="accordion fade-up" id="pl-faq-accordion">
        ${faq.items.map(item => `
          <div class="accordion__item">
            <button class="accordion__trigger"><span>${escapeHTML(item.q)}</span><span class="accordion__icon">+</span></button>
            <div class="accordion__panel">
              <div class="accordion__panel-inner">
                ${item.misconception ? `<div class="accordion__misconception">${escapeHTML(item.misconception)}</div>` : ''}
                <div class="accordion__answer">${escapeHTML(item.a)}</div>
              </div>
            </div>
          </div>`).join('')}
      </div>`;
    Accordion.init(document.getElementById('pl-faq-accordion'));
  },

  renderQuiz(quiz) {
    document.getElementById('pl-quiz-root').innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">${escapeHTML(quiz.sectionLabel)}</span>
        <h2>${escapeHTML(quiz.title)}</h2>
        <p>${escapeHTML(quiz.prompt)}</p>
      </div>
      <div class="quiz-grid fade-up">
        ${quiz.options.map((o, i) => `
          <button class="quiz-option" data-industry="${escapeHTML(o.industry)}">
            <span class="quiz-option__emoji">${o.emoji}</span><span>${escapeHTML(o.label)}</span>
          </button>`).join('')}
      </div>
      <div class="quiz-result fade-up" id="pl-quiz-result">
        <div>
          <div class="quiz-result__label">${escapeHTML(quiz.resultLabel)}</div>
          <div class="quiz-result__industry" id="pl-quiz-result-industry"></div>
        </div>
        <button class="btn btn--dark" id="pl-quiz-result-cta">${escapeHTML(quiz.resultCta)}</button>
      </div>
      <div class="quiz-footnote fade-up">💡 ${escapeHTML(quiz.footnote)}</div>`;

    const resultBox = document.getElementById('pl-quiz-result');
    const resultIndustry = document.getElementById('pl-quiz-result-industry');
    let selectedIndustry = null;
    document.querySelectorAll('#pl-quiz-root .quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#pl-quiz-root .quiz-option').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        selectedIndustry = btn.dataset.industry;
        resultIndustry.textContent = selectedIndustry;
        resultBox.classList.add('is-visible');
      });
    });
    document.getElementById('pl-quiz-result-cta').addEventListener('click', () => {
      if (selectedIndustry) PlanningPage.focusIndustry(selectedIndustry);
    });
  },

  renderRoadmap(rm) {
    document.getElementById('pl-roadmap-root').innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">${escapeHTML(rm.sectionLabel)}</span>
        <h2>${escapeHTML(rm.title)}</h2>
      </div>
      <div class="roadmap-track fade-up">
        ${rm.steps.map(s => `
          <div class="roadmap-step">
            <div class="roadmap-step__num">${String(s.n).padStart(2, '0')}</div>
            <div>
              <div class="roadmap-step__stage">${escapeHTML(s.stage)}</div>
              <div class="roadmap-step__title">${escapeHTML(s.title)}</div>
              <span class="roadmap-step__product">${escapeHTML(s.product)}</span>
              <div class="roadmap-step__action">${escapeHTML(s.action)}</div>
              <div class="roadmap-step__output"><strong>产出 → </strong>${escapeHTML(s.output)}</div>
            </div>
          </div>`).join('')}
      </div>
      <div class="roadmap-banner fade-up">
        <h4>${escapeHTML(rm.banner.title)}</h4>
        <p>${escapeHTML(rm.banner.description)}</p>
        <div class="roadmap-banner__flow">
          ${rm.banner.flow.map((f, i) => `<span>${escapeHTML(f)}</span>${i < rm.banner.flow.length - 1 ? '<span class="sep">→</span>' : ''}`).join('')}
        </div>
        <button class="btn btn--primary">${escapeHTML(rm.banner.cta)}</button>
      </div>`;
  },

  renderCapabilities(cap) {
    document.getElementById('pl-capabilities-root').innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">${escapeHTML(cap.sectionLabel)}</span>
        <h2>${escapeHTML(cap.title)}</h2>
        <p>${escapeHTML(cap.description)}</p>
      </div>
      <div class="capability-grid fade-up">
        ${cap.items.map(c => `
          <div class="capability-card">
            <div class="capability-card__num u-mono">0${c.n}</div>
            <div class="capability-card__title">${escapeHTML(c.title)}</div>
            <div class="capability-card__skills">${c.skills.map(escapeHTML).join('<br>')}</div>
            <div class="capability-card__roles">核心岗位：${escapeHTML(c.roles)}</div>
          </div>`).join('')}
      </div>
      <div class="toolkit-row fade-up">
        ${cap.toolkit.map(t => `<span class="toolkit-chip">${escapeHTML(t)}</span>`).join('')}
      </div>`;
  },

  renderDataInsights(di) {
    document.getElementById('pl-data-insights-root').innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">${escapeHTML(di.sectionLabel)}</span>
        <h2>${escapeHTML(di.title)}</h2>
      </div>
      <div class="insight-grid fade-up">
        <div class="insight-block">
          <h4>${escapeHTML(di.allocation.title)}</h4>
          ${di.allocation.items.map(i => `<div class="insight-row"><span>${escapeHTML(i.label)}</span><span class="insight-row__value">${escapeHTML(i.value)}</span></div>`).join('')}
        </div>
        <div class="insight-block">
          <h4>${escapeHTML(di.premiums.title)}</h4>
          ${di.premiums.items.map(i => `<div class="insight-row"><span>${escapeHTML(i.label)}</span><span class="insight-row__value">${escapeHTML(i.value)}</span></div>`).join('')}
        </div>
        <div class="insight-block">
          <h4>${escapeHTML(di.yoy.title)}</h4>
          ${di.yoy.items.map(i => `<div class="insight-row"><span>${escapeHTML(i.label)}</span><span class="insight-row__value insight-row__value--${i.direction}">${escapeHTML(i.value)}</span></div>`).join('')}
        </div>
      </div>`;
  },
};
window.PlanningPage = PlanningPage;
