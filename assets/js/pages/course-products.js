/* ═══════════════════════════════════════════
   COURSE PRODUCTS PAGE — standalone page (like Timeline), listing all
   7 "课程产品" as full-width cards, split into two zones: 长线旗舰产品
   (longform) and 课程目录 (catalog). Clicking any card opens CourseOverlay
   with that product's full long-form-style content (assets/js/course-demo.js).
   Copied as-is from /ist_demo (wip branch) per GM's 2026-09 request —
   product content is IST's own for now; DAD-specific course products are
   a later task.
═══════════════════════════════════════════ */
const CourseProductsPage = {
  LONGFORM_ORDER: ['changemakers', 'longform2', 'longform3'],
  CATALOG_ORDER: ['internship', 'summerwinter', 'bizpractice', 'masterclass'],

  build() {
    const lf = document.getElementById('cp-longform-grid');
    const cat = document.getElementById('cp-catalog-grid');
    if (lf) lf.innerHTML = this.LONGFORM_ORDER.map(id => this._longformCard(id)).join('');
    if (cat) cat.innerHTML = this.CATALOG_ORDER.map(id => this._catalogCard(id)).join('');
  },

  // v3.25 (GM): "将点开长线产品卡-overlay逻辑，改为点击打开新页面（仍承载在
  // '课程产品'大title下）。里面还会再有overlay功能" — a 长线产品 card now
  // navigates to a real sub-route (#course-products/<id>) instead of
  // opening CourseOverlay, following the exact same overview/subpage
  // pattern PlanningPage already uses for #planning/<industryId> (see
  // showSubpage() there): the page's own hero ("课程产品" title, still
  // outside both subpages in index.html) stays put, and the body swaps
  // between the card-grid overview and one product's full detail page.
  // 课程目录 (catalog) cards are UNCHANGED — they still open CourseOverlay,
  // since GM's request was specific to 长线产品卡. MiniCourseModal/
  // ImageModal etc. keep working exactly as before inside the new page —
  // they're independent fixed-position overlays, not tied to the old
  // course-overlay DOM, so "里面还会再有overlay功能" needed no extra work.
  showSubpage(productId) {
    this.currentProductId = productId || null;
    const overviewEl = document.getElementById('cp-overview-subpage');
    const productEl = document.getElementById('cp-product-subpage');
    if (!overviewEl || !productEl) return;

    if (productId && this.LONGFORM_ORDER.includes(productId) && window.PRODUCTS && window.PRODUCTS[productId]) {
      overviewEl.hidden = true;
      productEl.hidden = false;
      const product = window.PRODUCTS[productId];
      productEl.innerHTML = `
        <button type="button" class="cp-product-back" onclick="Router.go('course-products', {})" aria-label="返回课程产品"><span class="cp-product-back__arrow">←</span><span class="cp-product-back__text">返回课程产品</span></button>
        ${window.buildProductHTML(product, productId)}`;
      productEl.classList.add('is-wide');
      Effects.init(productEl);
    } else {
      productEl.hidden = true;
      productEl.innerHTML = '';
      overviewEl.hidden = false;
    }
  },

  _longformCard(id) {
    const p = window.PRODUCTS[id];
    const bannerCls = 'cp-card__banner' + (p.tileVariant ? ' cp-card__banner--' + p.tileVariant : '');
    return `<div class="cp-card cp-card--longform" onclick="Router.go('course-products', {productId:'${id}'})">
      <div class="${bannerCls}">
        ${p.cover ? `<img src="${p.cover}" alt="" loading="lazy">` : ''}
        <span class="cp-card__badge cp-card__badge--longform">长线内容</span>
      </div>
      <div class="cp-card__body">
        <div class="cp-card__eyebrow">${p.meta.eyebrow}</div>
        <div class="cp-card__title">${p.meta.titleCn}</div>
        <div class="cp-card__subtitle"><span class="u-en">${p.meta.titleEn}</span></div>
        <p class="cp-card__desc">${p.meta.desc}</p>
        <div class="cp-card__chips">${p.meta.chips.map(c => `<span class="cd-chip">${c}</span>`).join('')}</div>
      </div>
    </div>`;
  },

  _catalogCard(id) {
    const p = window.PRODUCTS[id];
    return `<div class="cp-card cp-card--catalog" onclick="CourseOverlay.open('${id}')">
      <div class="cp-card__banner cp-card__banner--catalog">
        ${p.cover ? `<img src="${p.cover}" alt="" loading="lazy">` : ''}
        <span class="cp-card__badge cp-card__badge--catalog">${p.count}个课程</span>
      </div>
      <div class="cp-card__body">
        <div class="cp-card__eyebrow">${p.meta.eyebrow}</div>
        <div class="cp-card__title">${p.meta.titleCn}</div>
        <div class="cp-card__subtitle"><span class="u-en">${p.meta.titleEn}</span></div>
        <p class="cp-card__desc">${p.meta.desc}</p>
      </div>
    </div>`;
  },
};
window.CourseProductsPage = CourseProductsPage;
