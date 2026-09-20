/* ═══════════════════════════════════════════
   PLANNING PAGE — industry → company/job/school drill-down.

   v3.3 rebuild (2026-09), following the "数字艺术就业海报" Figma file
   (https://figma.com/design/unFUcOlfIw8zwl7YMwRDbb) per GM's explicit
   UX brief + confirmed answers — see docs/PROJECT_NOTES.md for the
   full writeup. Summary of what changed vs. the v1/v3.1 single long
   scroll page:
     - The 8 industries are no longer stacked panels on one endless
       scroll. Each is its own deep-linkable subpage (#planning/<id>),
       swapped in by showSubpage() and driven by Router — confirmed
       choice over an instant-swap-same-URL alternative.
     - Everything that ISN'T industry-specific (heatmap, JD decoder,
       overseas pathways, FAQ, quiz, roadmap, capabilities, data
       insights) now lives together on its own "总览" overview subpage
       (#planning), reachable from the same top nav bar as the 8
       industries — confirmed choice over repeating it on every
       industry subpage.
     - Within one industry's subpage: banner stays exactly as v3.1
       designed it (image, gradient overlay, title/intro/tags on top)
       per GM's explicit instruction to keep that part as-is. v3.4
       (2026-09-19) wires it to a real photo when industries.json's
       bannerImg is set for that industry (<img>, object-fit:cover),
       falling back to the original gradient + "占位图" tag exactly as
       before when it's empty — same hasImg-driven pattern already
       used by home.js's _buildCatalogCard, no onerror needed. Photos
       are sourced from the Figma poster file per industry and land at
       assets/img/industry-cards/<slug>.jpg; see PROJECT_NOTES.md for
       why this had to be a manual export/attach step rather than an
       automated download. Everything below it is restructured into the Figma
       poster's own section order (行业是什么 / 代表企业 / 业务内容 /
       岗位 / 具体产出 / 发展路径 / 能力要求 / 作品集对标), each an
       independently foldable section (open by default — confirmed),
       built with existing site styles wherever a fit existed
       (company-chip/company-grid, tier-card, capability-card,
       pathway-card__row, schools-grid) and only three small new CSS
       components added where nothing already fit: .fold-section,
       .tag-card(-grid), .role-pill(-grid), .output-tile(-grid).
     - Confirmed interactive additions: 职业发展路径 steps (reusing the
       existing tiers data) expand in place instead of showing full
       detail for all three at once; role pills cross-link into the
       overview subpage's JD decoder, pre-filtered to this industry.
       (Sample-output tiles originally opened a Lightbox on click —
       removed in v3.6 per GM's request once real photos were in place
       and already legible at tile size; see PROJECT_NOTES.md.)
     - No new data was needed — every section above is built from
       fields industries.json already had (parentTrans, targetCases,
       realCase, tiers[].gargs, ugPath/pgPath, studentProfile,
       portfolioKey, schools). See splitPhraseList() in components.js
       for how the two comma/顿号-separated sentence fields become
       card grids.
═══════════════════════════════════════════ */

const PlanningPage = {
  industries: [],
  companies: {},
  currentIndustryId: null,

  // industries.json titles that don't literally match a jdDecoder
  // card's "industry" label (site-content.json uses shorter labels for
  // these two) — used by _jdCardForIndustry().
  JD_CARD_LABEL: {
    '互联网生态': '互联网',
    'AI创意科技': 'AI科创',
  },

  async render(data) {
    this.industries = data.industries;
    this.companies = data.companies;
    this.renderHero();
    this.renderNav();
    // ── Content moved here from the homepage, 2026-09 restructuring:
    // home now only teases 8 industries (see HomePage.renderCareerTeaser);
    // the full detail — industry overview, heatmap, JD decoder, overseas
    // pathways, FAQ, quiz, roadmap, capabilities, data insights — lives
    // on this page's "总览" overview subpage.
    const { site, cityHeat } = data;
    // v3.7: kept for renderIndustryDetailHTML — each industry's career
    // path section surfaces its own JD-decoder card (see JD_CARD_LABEL)
    // as a "行业真实声音" callout. v3.12 (GM): the standalone JD decoder
    // section that used to also live on 总览 (rendered by the old
    // renderJD()) has been removed — GM: that information is already
    // covered inside each industry's own detail subpage via this same
    // jdDecoder data, so the overview-page copy was redundant. This
    // this.jdDecoder assignment and JD_CARD_LABEL are NOT dead code —
    // _jdCardForIndustry()/_jdInsightBlockHTML() (used by
    // renderIndustryDetailHTML) still depend on them.
    this.jdDecoder = site.jdDecoder;
    this.renderIndustriesOverview(site.industriesIntro, this.industries);
    this.renderHeatmap(site.heatmap, cityHeat);
    this.renderPathways(site.overseasPathways);
    this.renderFAQ(site.faq);
    this.renderQuiz(site.quiz);
    this.renderRoadmap(site.roadmap);
    this.renderCapabilities(site.capabilities);
    this.renderDataInsights(site.dataInsights);
    // Default state: overview subpage visible, industry subpage empty/
    // hidden. Router.go (called right after this from the boot script,
    // reading the real initial #planning[/id] hash) will override this
    // via showSubpage() if the page is loading straight into an
    // industry deep link.
    this.showSubpage(null);
    Effects.init(document.getElementById('pl-overview-subpage'));
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
        <button class="industry-nav__btn is-active" id="nav-overview" onclick="Router.go('planning', {})">总览</button>
        ${this.industries.map(ind => `
          <button class="industry-nav__btn" id="nav-${ind.id}" onclick="Router.go('planning', {industryId:'${ind.id}'})">${escapeHTML(ind.title)}</button>`).join('')}
      </div>`;
  },

  /* ═══ Subpage switching (Router calls this on every #planning[/id] nav) ═══ */

  showSubpage(industryId) {
    this.currentIndustryId = industryId || null;
    document.querySelectorAll('.industry-nav__btn').forEach(b => b.classList.remove('is-active'));
    document.getElementById(industryId ? `nav-${industryId}` : 'nav-overview')?.classList.add('is-active');

    const overviewEl = document.getElementById('pl-overview-subpage');
    const industryEl = document.getElementById('pl-industry-subpage');
    if (!overviewEl || !industryEl) return;

    if (industryId) {
      const ind = this.industries.find(i => i.id === industryId);
      if (!ind) { this.showSubpage(null); return; }
      overviewEl.hidden = true;
      industryEl.hidden = false;
      industryEl.innerHTML = this.renderIndustryDetailHTML(ind);
      Effects.init(industryEl);
    } else {
      industryEl.hidden = true;
      industryEl.innerHTML = '';
      overviewEl.hidden = false;
    }
  },

  openCompany(industryId, industryTitle, companyName) {
    const entry = (this.companies[industryId] || {})[companyName];
    if (!entry) return;
    CompanyModal.open(industryTitle, companyName, entry);
  },

  // Back-compat: several other pages/sections still call this by title
  // (home's industry cards, quiz result CTA, heatmap row click, footer
  // quick links via Router.goToIndustry). Now navigates to the
  // industry's deep-linkable subpage instead of scrolling.
  focusIndustry(title) {
    const ind = this.industries.find(i => i.title === title);
    if (!ind) return;
    Router.go('planning', { industryId: ind.id });
  },

  toggleFold(btn) {
    const section = btn.closest('.fold-section');
    if (!section) return;
    const isOpen = section.classList.toggle('is-open');
    const icon = btn.querySelector('.fold-section__icon');
    if (icon) icon.textContent = isOpen ? '−' : '+';
  },

  toggleCareerStep(btn) {
    const card = btn.closest('.tier-card');
    if (!card) return;
    const isOpen = card.classList.toggle('is-expanded');
    const icon = card.querySelector('.tier-card__expand-icon');
    if (icon) icon.textContent = isOpen ? '−' : '+';
  },

  // v3.7: role pill click -> "岗位解读" overlay showing this industry's
  // REAL company job postings (companies.json) that best match the
  // clicked role, restoring a feature GM said existed a few versions
  // back and asked to bring back in place of jumping to 总览's JD
  // decoder (which only ever filtered by industry, never by role).
  // Matching is fuzzy (role titles and job titles are two independently
  // written lists, not a shared vocabulary): exact match scores
  // highest, then substring containment, then shared-bigram count as a
  // loose relevance signal. If nothing scores above 0, falls back to
  // showing this industry's real jobs generally rather than an empty
  // overlay — the point is always "here's the real hiring language",
  // never a fabricated precise match.
  openRoleInsight(roleTitle, industryTitle) {
    const ind = this.industries.find(i => i.title === industryTitle);
    if (!ind) return;
    const companyMap = this.companies[ind.id] || {};
    const allJobs = [];
    Object.entries(companyMap).forEach(([company, c]) => {
      (c.jobs || []).forEach(([jobTitle, jobDesc]) => allJobs.push({ company, jobTitle, jobDesc }));
    });
    const norm = s => (s || '').replace(/[\/\s·、,，]/g, '');
    const roleN = norm(roleTitle);
    const score = (job) => {
      const jobN = norm(job.jobTitle);
      if (!jobN || !roleN) return 0;
      if (jobN === roleN) return 100;
      if (jobN.includes(roleN) || roleN.includes(jobN)) return 50;
      let shared = 0;
      for (let i = 0; i < roleN.length - 1; i++) {
        if (jobN.includes(roleN.slice(i, i + 2))) shared++;
      }
      return shared;
    };
    let matches = allJobs.map(j => ({ ...j, _s: score(j) })).filter(j => j._s > 0).sort((a, b) => b._s - a._s);
    let note;
    if (matches.length) {
      matches = matches.slice(0, 4);
      note = '真实企业岗位描述 · 供对照参考';
    } else {
      matches = allJobs.slice(0, 4);
      note = `暂无与"${roleTitle}"直接对应的岗位描述，以下为该行业其他真实岗位参考`;
    }
    RoleInsight.open(roleTitle, industryTitle, matches, note);
  },

  _rolesForIndustry(ind) {
    const seen = [];
    (ind.tiers || []).forEach(t => {
      (t.gargs || '').split(/[、，,]/).map(s => s.trim()).filter(Boolean).forEach(r => {
        if (!seen.includes(r)) seen.push(r);
      });
    });
    return seen;
  },

  // v3.7: site-content.json's jdDecoder.cards has one entry per industry
  // (using its own shorter labels for two industries — see JD_CARD_LABEL),
  // originally surfaced only inside 总览's JD decoder. Looked up here so
  // 职业发展路径 can show this industry's own real-JD "隐性能力要求"
  // insight without requiring the visitor to leave the industry subpage.
  _jdCardForIndustry(industryTitle) {
    if (!this.jdDecoder || !this.jdDecoder.cards) return null;
    const label = this.JD_CARD_LABEL[industryTitle] || industryTitle;
    return this.jdDecoder.cards.find(c => c.industry === label) || null;
  },

  // Renders that card as a yellow-block/black-text callout (GM: "use
  // yellow blocks+black text when needed for visual impact") — reuses
  // the site's single accent token rather than a new color, consistent
  // with the rest of the industry subpage. Renders nothing when this
  // industry has no matching card.
  _jdInsightBlockHTML(industryTitle) {
    const card = this._jdCardForIndustry(industryTitle);
    if (!card) return '';
    return `
      <div class="jd-insight-block">
        <div class="jd-insight-block__head">
          <span class="jd-insight-block__tag">${escapeHTML(card.tag)}</span>
          <span class="jd-insight-block__label">真实JD 隐性能力要求</span>
        </div>
        <div class="jd-insight-block__quote">"${escapeHTML(card.quote)}"</div>
        <div class="jd-insight-block__insight">🔍 ${escapeHTML(card.insight)}</div>
      </div>`;
  },

  _foldSection(index, title, bodyHTML) {
    return `
      <section class="fold-section is-open fade-up" data-fold="${index}">
        <button class="fold-section__head" onclick="PlanningPage.toggleFold(this)">
          <span class="fold-section__index u-mono">${index}</span>
          <h3 class="fold-section__title">${title}</h3>
          <span class="fold-section__icon">−</span>
        </button>
        <div class="fold-section__body">${bodyHTML}</div>
      </section>`;
  },

  /* ═══ One industry's full Figma-style detail subpage ═══ */

  renderIndustryDetailHTML(ind) {
    const roles = this._rolesForIndustry(ind);
    const businessCards = splitPhraseList(ind.targetCases);
    const outputs = splitPhraseList(ind.realCase, /^建议项目[:：]\s*/);
    const hasBanner = !!ind.bannerImg;
    let idx = 0;
    const nextIndex = () => String(++idx).padStart(2, '0');

    return `
      <section class="industry-panel container" id="sec-${ind.id}" style="border-top-color:${industryColor(ind.title)}">
        <div class="industry-panel__banner fade-up"${hasBanner ? '' : ` style="background:linear-gradient(135deg, ${industryColor(ind.title)} 0%, #262626 55%, var(--color-void) 100%)"`}>
          ${hasBanner
            ? `<img class="industry-panel__banner-img" src="${escapeHTML(ind.bannerImg)}" alt="${escapeHTML(ind.title)}" loading="lazy">`
            : `<span class="industry-panel__banner-tag">占位图 · Placeholder</span>`}
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

        ${this._foldSection(nextIndex(), '行业解读', `
          <p style="font-size:13.5px;color:var(--color-text-secondary);line-height:1.7;max-width:820px">${escapeHTML(ind.industryExplainer || ind.parentTrans || ind.oneLine || '')}</p>
        `)}

        ${this._foldSection(nextIndex(), '代表企业', `
          <div class="company-grid">
            ${(ind.enterprises || []).map(name => `
              <button class="company-chip" onclick="PlanningPage.openCompany('${escapeHTML(ind.id)}','${escapeHTML(ind.title)}','${escapeHTML(name).replace(/'/g, "\\'")}')">${escapeHTML(name)}</button>`).join('')}
          </div>
        `)}

        ${this._foldSection(nextIndex(), '行业正在做什么业务', `
          ${(ind.businessCardsDetailed && ind.businessCardsDetailed.length) ? `
            <div class="tag-card-grid tag-card-grid--detailed">
              ${ind.businessCardsDetailed.map(c => `
                <div class="tag-card tag-card--detailed">
                  <div class="tag-card__title">${escapeHTML(c.title)}</div>
                  <div class="tag-card__body">${escapeHTML(c.body)}</div>
                </div>`).join('')}
            </div>
          ` : `
            <div class="tag-card-grid">
              ${businessCards.map(p => `<div class="tag-card">${escapeHTML(p)}</div>`).join('')}
            </div>
          `}
        `)}

        ${this._foldSection(nextIndex(), '学生能进入哪些岗位', `
          <div class="role-pill-grid">
            ${roles.map(r => `<button class="role-pill" onclick="PlanningPage.openRoleInsight('${escapeHTML(r).replace(/'/g, "\\'")}','${escapeHTML(ind.title)}')">${escapeHTML(r)}</button>`).join('')}
          </div>
        `)}

        ${this._foldSection(nextIndex(), '具体可以做什么', `
          <div class="output-showcase-row">
            ${(ind.outputShowcase || []).map(item => `
                <div class="output-tile output-tile--photo" style="background-image:url('${escapeHTML(item.img)}')">
                  <span>${escapeHTML(item.label)}</span>
                </div>`).join('')}
          </div>
          <div class="output-tag-row">
            ${outputs.map(o =>
              /* realCase-derived phrase, kept as a plain non-interactive
                 tag — these use different wording than outputShowcase's
                 Figma-native labels (a different source, not a 1:1 list),
                 so no attempt is made to match/dedupe them positionally;
                 every one of them has no photo, by definition. */
              `<span class="output-tag">${escapeHTML(o)}</span>`
            ).join('')}
          </div>
        `)}

        ${this._foldSection(nextIndex(), '职业发展路径', `
          ${ind.careerPath ? `
            <p style="font-size:13px;color:var(--color-text-secondary);line-height:1.7;max-width:820px;margin-bottom:16px">${escapeHTML(ind.careerPath.intro)}</p>
            <div class="stage-card-grid">
              ${ind.careerPath.stages.map(s => `
                <div class="stage-card">
                  <div class="stage-card__head"><span class="stage-card__step u-mono">${escapeHTML(s.step)}</span>${escapeHTML(s.title)}</div>
                  <div class="stage-card__skills">${escapeHTML(s.skills)}</div>
                </div>`).join('')}
            </div>
            <div class="salary-band-row">
              ${ind.careerPath.salaryBands.map(b => `
                <div class="salary-band-chip"><strong>${escapeHTML(b.stage)}</strong>薪资参考：${escapeHTML(b.range)}</div>`).join('')}
            </div>
          ` : `
            <div class="industry-panel__tiers">
              ${(ind.tiers || []).map((t, i) => `
                <div class="tier-card" data-step="${i}">
                  <button class="tier-card__head" onclick="PlanningPage.toggleCareerStep(this)">
                    <span class="tier-card__badge">${escapeHTML(t.badge)}</span>
                    <span class="tier-card__expand-icon">+</span>
                    <div class="tier-card__salary u-mono">${escapeHTML(t.salary)}</div>
                    <div class="tier-card__title">${escapeHTML(t.title)}</div>
                  </button>
                  <div class="tier-card__detail">
                    <div class="tier-card__desc">${escapeHTML(t.desc)}</div>
                    <div class="tier-card__roles">代表岗位：${escapeHTML(t.gargs)}</div>
                    <div class="tier-card__roles">代表企业：${escapeHTML(t.reps)}</div>
                  </div>
                </div>`).join('')}
            </div>
          `}
          ${this._jdInsightBlockHTML(ind.title)}
        `)}

        ${this._foldSection(nextIndex(), '需要建立哪些能力', `
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin-bottom:20px">
            <div class="capability-card">
              <div class="capability-card__num u-mono">UG</div>
              <div class="capability-card__title">本科阶段重点能力</div>
              <div class="capability-card__skills">${escapeHTML((ind.ugPath || {}).focus || '')}</div>
            </div>
            <div class="capability-card">
              <div class="capability-card__num u-mono">PG</div>
              <div class="capability-card__title">研究生阶段重点能力</div>
              <div class="capability-card__skills">${escapeHTML((ind.pgPath || {}).focus || '')}</div>
            </div>
          </div>
          <div>
            <h5 style="font-size:12px;color:var(--color-text-faint);margin-bottom:6px">适合怎样的学生</h5>
            <p style="font-size:12.5px;color:var(--color-text-secondary);line-height:1.6">${escapeHTML(ind.studentProfile || '')}</p>
          </div>
        `)}

        ${this._foldSection(nextIndex(), '作品集项目如何对应就业方向', `
          <div style="margin-bottom:16px">
            <h5 style="font-size:12px;color:var(--color-text-faint);margin-bottom:6px">作品集定位</h5>
            <p style="font-size:12.5px;color:var(--color-text-secondary);line-height:1.6">${escapeHTML(ind.portfolioKey || '')}</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px">
            <div class="pathway-card__row"><strong>UG 作品集方向</strong>${escapeHTML((ind.ugPath || {}).portfolio || '')}</div>
            <div class="pathway-card__row"><strong>UG 申请目标</strong>${escapeHTML((ind.ugPath || {}).target || '')}</div>
            <div class="pathway-card__row"><strong>PG 作品集方向</strong>${escapeHTML((ind.pgPath || {}).portfolio || '')}</div>
            <div class="pathway-card__row"><strong>PG 申请目标</strong>${escapeHTML((ind.pgPath || {}).target || '')}</div>
          </div>
        `)}

        ${this._foldSection(nextIndex(), '对口院校方向', `
          <div class="schools-grid">
            ${ind.schools ? Object.entries(ind.schools).map(([region, val]) => `
              <div class="schools-col">
                <h5>${escapeHTML({ uk: '英国', us: '美国', hkMacau: '港澳及其他' }[region] || region)}</h5>
                <p>${escapeHTML(val)}</p>
              </div>`).join('') : ''}
          </div>
        `)}
      </section>`;
  },

  /* ═══ Everything below is the "总览" overview subpage — unchanged
     content/behavior from before v3.3, just now living inside
     #pl-overview-subpage instead of sharing the page with the 8
     industry panels. ═══ */

  // v3.12 (GM): the overview tab's 8-industry display was a static
  // .industry-grid of cards; GM asked for it to become the same
  // auto-scrolling horizontal reel format previously used for the
  // homepage's career teaser — same .career-rail/.career-card markup,
  // duplicated-list seamless loop, pause-on-hover/out-of-view. Only the
  // click handler differs: this page's own PlanningPage.focusIndustry()
  // (already used by the old grid) instead of Router.goToIndustry().
  // Uses a page-scoped rail id (pl-industry-rail) — both #page-home and
  // #page-planning stay in the DOM at once (only one is .is-active), so
  // reusing the same id elsewhere would make getElementById ambiguous.
  // v3.13 (GM): the scroll itself is now driven by Marquee.init() (see
  // assets/js/marquee.js) instead of a CSS keyframe animation — GM
  // reported reels disappearing after running for a while; see
  // marquee.js's header comment for why. Speed (47px/s) matches the
  // site's other reels/marquee (originally established for the
  // 资源网络 partner marquee to match IST's own pacing).
  renderIndustriesOverview(intro, industries) {
    const cardHTML = (ind, i) => `
      <div class="career-card" onclick="PlanningPage.focusIndustry('${escapeHTML(ind.title)}')" style="border-top:3px solid ${industryColor(ind.title)}">
        <div class="career-card__top">
          <span class="career-card__num u-mono">0${i + 1}</span>
          <span class="career-card__trend">${escapeHTML(ind.trendArrow)}</span>
        </div>
        <div>
          <div class="career-card__title">${escapeHTML(ind.title)}</div>
          <div class="career-card__title-en">${escapeHTML(ind.titleEn)}</div>
        </div>
        <p class="career-card__desc">${escapeHTML(ind.oneLine)}</p>
      </div>`;

    document.getElementById('pl-industries-root').innerHTML = `
      <div class="section-head fade-up">
        <span class="eyebrow u-en">${escapeHTML(intro.sectionLabel)}</span>
        <h2>${escapeHTML(intro.title)}</h2>
        <p>${escapeHTML(intro.description)}</p>
      </div>
      <div class="career-rail-wrap fade-up"><div class="career-rail" id="pl-industry-rail">${[...industries, ...industries].map((ind, i) => cardHTML(ind, i % industries.length)).join('')}</div></div>`;

    Marquee.init(document.getElementById('pl-industry-rail'), 47, 'pl-industry-rail');
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

  // v3.12 (GM): the standalone renderJD() overview section was removed
  // here (see the render() comment above) — its data (site.jdDecoder)
  // is still used, just not as its own 总览 section anymore; see
  // _jdCardForIndustry()/_jdInsightBlockHTML() below for where it now
  // surfaces instead (per-industry "行业真实声音" callout).

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
