/* ═══════════════════════════════════════════
   PRODUCT SECTIONS — product-page fragment renderers shared by BOTH sites.
   Graduate: assets/js/course-demo.js (buildProductHTML / buildRichLongformSections)
   Undergrad: undergrad/assets/js/du-blocks.js (Detail.product)

   Every helper returns a plain HTML string using the `.cd-*` class contract
   in assets/css/ist-shared.css, and feeds the two generic viewers in
   components.js:
     PdfViewer.open(key)      ← PdfRegistry[key]     = { label, dir, count }
     GalleryViewer.open(key)  ← GalleryRegistry[key] = { dir, count, alt }
   Both look for <dir>/01.webp … NN.webp. Paths are relative to the page,
   so the same `assets/img/course-products/<market>/…` convention works for
   index.html and undergrad/index.html alike.

   Load order: after components.js, before course-demo.js / du-blocks.js.
   Moved here verbatim from course-demo.js (2026-11); new helpers at the end.
═══════════════════════════════════════════ */

/* ── v3.26 registries feeding GalleryViewer / PdfViewer (components.js) —
   both viewers are generic (dir + count of NN.webp files); course-demo.js
   just populates the lookup table as it renders each section, keyed by
   whatever the click handler was given inline. ── */
const GalleryRegistry = {};
const PdfRegistry = {};
function registerPdfDoc(productId, comparePdf) {
  PdfRegistry[productId] = comparePdf;
}
window.GalleryRegistry = GalleryRegistry;
window.PdfRegistry = PdfRegistry;

// A single supplement-image gallery: a click-through cover thumbnail that
// opens GalleryViewer (components.js) to page through every image in
// order. `slug` is a folder under assets/img/course-products/<market>/core/.
function buildGalleryCoverHTML(market, slug, count, alt) {
  if (!slug || !count) return '';
  const dir = `assets/img/course-products/${market}/core/${slug}`;
  const key = `${market}-${slug}`;
  GalleryRegistry[key] = { dir, count, alt };
  const multi = count > 1;
  return `
    <div class="cd-gallery-cover" onclick="GalleryViewer.open('${key}')">
      <img src="${dir}/01.webp" alt="${escapeHTML(alt || '')}" loading="lazy">
      <span class="cd-gallery-cover__hint">${multi ? `查看全部 ${count} 张 ›` : '查看大图 ›'}</span>
    </div>`;
}

// ── Reusable fragment renderers, factored out of buildRichLongformSections
// so both a single-track product (UK/US) and a tracks-branch panel (HK's
// 常规计划/学霸计划) can render the exact same markup for each block. Every
// helper returns a plain HTML string (no `sec()` label wrapper) — callers
// decide whether/how to wrap it. ──
function renderAdvantagePairs(pairs) {
  return `
    <div class="cd-transform-grid">
      ${pairs.map(p => `
        <div class="cd-transform">
          <div class="cd-transform__side cd-transform__side--trait">
            <div class="cd-transform__label">升学特性 <span class="u-en">Trait</span></div>
            <div class="cd-transform__title">${p.trait}</div>
            <p class="cd-transform__desc">${p.traitDesc}</p>
          </div>
          <div class="cd-transform__arrow" aria-hidden="true">›</div>
          <div class="cd-transform__side cd-transform__side--edge">
            <div class="cd-transform__label">课程优势 <span class="u-en">Edge</span></div>
            <p class="cd-transform__desc">${p.edge}</p>
          </div>
        </div>`).join('')}
    </div>`;
}

function renderWhyGrid(items) {
  return `
    <div class="cd-why-grid">
      ${items.map((w, i) => `
        <div class="cd-why">
          <div class="cd-why__num">0${i + 1}</div>
          <div class="cd-why__title">${w.t}</div>
          <div class="cd-why__desc">${w.d}</div>
        </div>`).join('')}
    </div>`;
}

function renderTierGrid(tiers) {
  return `
    <div class="cd-tier-grid">
      ${tiers.map(t => `
        <div class="cd-tier">
          <div class="cd-tier__name">${t.name}</div>
          <div class="cd-tier__audience">${t.audience}</div>
          <div class="cd-tier__config">${t.config}</div>
        </div>`).join('')}
    </div>`;
}

function renderModuleGrid(items, market, keyPrefix) {
  return `
    <div class="cd-core-modules">
      ${items.map((m, i) => {
        const gallery = m.gallery ? buildGalleryCoverHTML(m.gallery.market || market, m.gallery.slug, m.gallery.count, m.gallery.alt || m.title) : '';
        // catalog embeds are graduate-only (buildCatalogEmbedHTML lives in course-demo.js)
        const catalog = m.catalogRef && typeof buildCatalogEmbedHTML === 'function' ? buildCatalogEmbedHTML(m.catalogRef) : '';
        return `
        <div class="cd-core-module${gallery ? ' has-gallery' : ''}">
          <div class="cd-core-module__body">
            <div class="cd-core-module__title">${m.title}${m.subtitle ? `<span class="cd-core-module__subtitle">${m.subtitle}</span>` : ''}</div>
            <p class="cd-core-module__desc">${m.desc}</p>
            ${m.bullets ? `
              <div class="cd-core-module__bullets">
                ${m.bullets.map(b => `<div class="cd-core-module__bullet"><span class="cd-core-module__bullet-t">${b.t}</span><span class="cd-core-module__bullet-d">${b.d}</span></div>`).join('')}
              </div>` : ''}
          </div>
          ${gallery}
          ${catalog}
        </div>`;
      }).join('')}
    </div>`;
}

function renderTimeline(timeline) {
  const renderStep = (s) => `
      <div class="cd-timeline__step${s.merged ? ' cd-timeline__step--final' : ''}">
        <div class="cd-timeline__day">${s.q}</div>
        <div class="cd-timeline__title">${s.phase}</div>
        <div class="cd-timeline__desc">${s.desc}</div>
      </div>`;
  const tlHalf = Math.ceil(timeline.length / 2);
  const tlCols = [timeline.slice(0, tlHalf), timeline.slice(tlHalf)];
  return `
    <div class="cd-timeline">
      ${tlCols.map(col => `<div class="cd-timeline__col">${col.map(renderStep).join('')}</div>`).join('')}
    </div>`;
}

/* ── 报价单 / 比价 buttons. `docs` is one comparePdf object or an array of
   them; each is registered in PdfRegistry (as `key`, or `key__<i>` when
   there are several) and gets its own button. Optional per-doc `btn`
   overrides the button text (default 查看比价). ── */
function renderCompareButtons(key, docs) {
  const list = [].concat(docs || []).filter(Boolean);
  return list.map((d, i) => {
    const k = list.length > 1 ? `${key}__${i}` : key;
    registerPdfDoc(k, d);
    return `
        <button type="button" class="cd-compare-btn" onclick="PdfViewer.open('${k}')">
          ${d.btn || '查看比价'} <span class="u-en">${d.btnEn || 'Compare Plans'} ›</span>
        </button>`;
  }).join('');
}

/* ── simple comparison table: { heads: [..], rows: [[..], ..] }; first
   column is the row label. Scrolls sideways on narrow screens. ── */
function renderCompareTable(t) {
  return `
    <div class="cd-table-wrap">
      <table class="cd-table">
        <thead><tr>${t.heads.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${t.rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${c}</td>` : `<th scope="row">${c}</th>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>`;
}

function renderBulletList(items) {
  return `<ul class="cd-list">${items.map(x => `<li>${x}</li>`).join('')}</ul>`;
}

window.buildGalleryCoverHTML = buildGalleryCoverHTML;
window.registerPdfDoc = registerPdfDoc;
