/* ═══════════════════════════════════════════
   COMPONENTS — small shared UI behaviors used by
   both home.js and planning.js: escaping, accordions,
   the company modal, and the industry color map.
═══════════════════════════════════════════ */

function escapeHTML(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* Industry title -> CSS custom property, so any component can
   tint itself per-industry without hardcoding hex values. */
const INDUSTRY_COLOR_VAR = {
  '数字文旅': '--color-ind-tourism',
  '互联网生态': '--color-ind-internet',
  'AI创意科技': '--color-ind-ai',
  '游戏娱乐': '--color-ind-game',
  '影视影像': '--color-ind-film',
  '品牌传播': '--color-ind-brand',
  '教育学术': '--color-ind-edu',
  '独立艺术家': '--color-ind-indie',
};
function industryColor(title) {
  const v = INDUSTRY_COLOR_VAR[title];
  return v ? `var(${v})` : 'var(--color-text-muted)';
}

/* v3.3: turns one of industries.json's Chinese enumeration sentences
   ("数字展馆、XR大空间、…、AI互动装置与城市公共艺术。", optionally prefixed
   "建议项目：") into an array of individual phrases, for the planning
   page's per-industry "行业正在做什么业务" / "具体可以做什么" card grids.
   Splits on 、/，/, first; the final segment often reads "X与Y"/"X和Y"
   (standard Chinese list style — a conjunction before the last item
   instead of another 、), so that segment is split once more on 与/和
   when it cleanly yields two non-empty halves. */
function splitPhraseList(str, stripPrefixRe) {
  if (!str) return [];
  let s = String(str).trim();
  if (stripPrefixRe) s = s.replace(stripPrefixRe, '');
  s = s.replace(/[。.]\s*$/, '');
  const parts = s.split(/[、，,]/).map(p => p.trim()).filter(Boolean);
  if (parts.length) {
    const last = parts.pop();
    const m = last.split(/与|和/);
    if (m.length === 2 && m[0].trim() && m[1].trim()) {
      parts.push(m[0].trim(), m[1].trim());
    } else {
      parts.push(last);
    }
  }
  return parts;
}

/* v3.16 (GM): shared scroll-lock — every full-screen overlay (company
   modal, role-insight modal, image modal, course overlay, nav menu) was
   independently setting `document.body.style.overflow = 'hidden'` to
   stop background scrolling while it's open. Hiding the scrollbar that
   way shrinks the *viewport* width without changing the page's layout
   width, so the whole page visibly shifts sideways by the scrollbar's
   width the instant any of these opens (worse on Windows/Linux Chrome
   and on macOS with "always show scrollbars" — the reported bug).
   Fixed by compensating with an equal `padding-right` on body whenever
   the scrollbar is actually removed, so the content column doesn't
   move. A small lock counter lets overlays nest/overlap safely (e.g.
   opening a modal from underneath an already-open one) without the
   first `close()` prematurely restoring scrolling.
   v3.38 (GM): ScrollLock itself moved to assets/js/nav-menu.js (loaded
   before this file — see index.html) so the undergraduate site's own
   nav menu can reuse the exact same implementation instead of a second
   copy. It's still referenced below (course/image modals) exactly as
   before — nothing here changes, just where it's defined. */

const Accordion = {
  init(container) {
    container.querySelectorAll('.accordion__item').forEach(item => {
      const trigger = item.querySelector('.accordion__trigger');
      const panel = item.querySelector('.accordion__panel');
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        container.querySelectorAll('.accordion__item.is-open').forEach(open => {
          if (open !== item) {
            open.classList.remove('is-open');
            open.querySelector('.accordion__panel').style.maxHeight = null;
          }
        });
        item.classList.toggle('is-open', !isOpen);
        panel.style.maxHeight = !isOpen ? panel.scrollHeight + 'px' : null;
      });
    });
  },
};

const CompanyModal = {
  el: null,

  ensure() {
    if (this.el) return this.el;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'company-modal-overlay';
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <button class="modal__close" aria-label="关闭">&times;</button>
        <div class="modal__industry" id="cm-industry"></div>
        <h3 class="modal__title" id="cm-title"></h3>
        <div class="modal__section">
          <div class="modal__label">企业定位</div>
          <div class="modal__text" id="cm-positioning"></div>
        </div>
        <div class="modal__section">
          <div class="modal__label">业务内容</div>
          <div class="modal__text" id="cm-business"></div>
        </div>
        <div class="modal__section">
          <div class="modal__label">招聘关注点</div>
          <div class="modal__text" id="cm-hiring"></div>
        </div>
        <div class="modal__section">
          <div class="modal__label">代表岗位</div>
          <div class="modal__jobs" id="cm-jobs"></div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) this.close(); });
    overlay.querySelector('.modal__close').addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
    this.el = overlay;
    return overlay;
  },

  open(industryTitle, companyName, entry) {
    const overlay = this.ensure();
    overlay.querySelector('#cm-industry').textContent = industryTitle;
    overlay.querySelector('#cm-title').textContent = companyName;
    overlay.querySelector('#cm-positioning').textContent = entry.positioning || '';
    overlay.querySelector('#cm-business').textContent = entry.business || '';
    overlay.querySelector('#cm-hiring').textContent = entry.hiring || '';
    const jobsEl = overlay.querySelector('#cm-jobs');
    jobsEl.innerHTML = (entry.jobs || []).map(job => `
      <div class="modal__job">
        <div class="modal__job-title">${escapeHTML(job[0])}</div>
        <div class="modal__job-desc">${escapeHTML(job[1])}</div>
      </div>`).join('');
    overlay.classList.add('is-open');
    ScrollLock.lock();
  },

  close() {
    if (!this.el) return;
    this.el.classList.remove('is-open');
    ScrollLock.unlock();
  },
};

/* v3.7: "岗位解读" overlay — opened by clicking a role pill on an
   industry subpage (see PlanningPage.openRoleInsight). Shows the real
   company job postings (companies.json) that best fuzzy-match the
   clicked role, restoring a feature GM recalled from a few versions
   back. Mirrors CompanyModal's ensure/open/close shell and reuses its
   .modal__job* row markup — no new CSS needed for the job rows. */
const RoleInsight = {
  el: null,

  ensure() {
    if (this.el) return this.el;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'role-insight-overlay';
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <button class="modal__close" aria-label="关闭">&times;</button>
        <div class="modal__industry" id="ri-industry"></div>
        <h3 class="modal__title" id="ri-title"></h3>
        <div class="modal__section">
          <div class="modal__text" id="ri-note"></div>
        </div>
        <div class="modal__section">
          <div class="modal__label">真实岗位描述</div>
          <div class="modal__jobs" id="ri-jobs"></div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) this.close(); });
    overlay.querySelector('.modal__close').addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
    this.el = overlay;
    return overlay;
  },

  open(roleTitle, industryTitle, matches, note) {
    const overlay = this.ensure();
    overlay.querySelector('#ri-industry').textContent = industryTitle;
    overlay.querySelector('#ri-title').textContent = roleTitle;
    overlay.querySelector('#ri-note').textContent = note || '';
    const jobsEl = overlay.querySelector('#ri-jobs');
    jobsEl.innerHTML = (matches || []).map(job => `
      <div class="modal__job">
        <div class="modal__job-title">${escapeHTML(job.jobTitle)} <span style="font-weight:400;color:var(--color-text-faint)">· ${escapeHTML(job.company)}</span></div>
        <div class="modal__job-desc">${escapeHTML(job.jobDesc)}</div>
      </div>`).join('');
    overlay.classList.add('is-open');
    ScrollLock.lock();
  },

  close() {
    if (!this.el) return;
    this.el.classList.remove('is-open');
    ScrollLock.unlock();
  },
};

/* A Lightbox component lived here from v3.3 through v3.5, opened by
   clicking a "具体可以做什么" sample-output tile to view its photo
   enlarged. Removed in v3.6 per GM's request once all 24 real photos
   were in place — the tiles are no longer clickable (see
   PROJECT_NOTES.md and planning.js's section-05 render). */

/* ── EXPANDABLE NAV MENU ──
   v3.38 (GM): NavMenu's open/close/toggle + its toggle-button/Escape-key
   wiring moved to assets/js/nav-menu.js (loaded before this file — see
   index.html), so the undergraduate site's identical hamburger menu can
   share the exact same behavior instead of reimplementing it. Only the
   router-specific navigation stays here, since Router is graduate-only. */
NavMenu.go = function (pageId, opts) {
  this.close();
  Router.go(pageId, opts);
};

/* ── Shared Image Modal — ported from ist_demo's components.js
   (ImageModal). Used by the 课程目录 catalog cards (see home.js's
   `_buildCatalogCard`, called from `_buildInternshipPanel` /
   `_buildCourseGrid` / `_buildAcademicGrid`) to open a poster image
   full-size on click. Was never carried over when course-demo.js /
   the catalog-card renderer were copied from ist_demo, so the
   click-to-open-poster interaction had no handler at all — this and
   the onclick wiring in home.js fix that. ── */
const ImageModal = {
  _el: null,

  _build() {
    if (this._el) return;
    const el = document.createElement('div');
    el.className = 'img-modal-backdrop';
    el.innerHTML = `
      <div class="img-modal-flipper">
        <div class="img-modal-inner">
          <img id="img-modal-img" src="" alt="">
          <button class="img-modal-close" id="img-modal-close">✕</button>
        </div>
      </div>`;
    document.body.appendChild(el);
    el.addEventListener('click', e => { if (e.target === el) this.close(); });
    el.querySelector('#img-modal-close').addEventListener('click', () => this.close());
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); });
    this._el = el;
  },

  open(src, alt = '') {
    this._build();
    this._el.querySelector('#img-modal-img').src = src;
    this._el.querySelector('#img-modal-img').alt = alt;
    this._el.style.display = 'flex';
    this._el.offsetHeight; // force reflow so the transition fires
    this._el.classList.add('is-visible');
    ScrollLock.lock();
  },

  close() {
    if (!this._el) return;
    this._el.classList.remove('is-visible');
    ScrollLock.unlock();
    setTimeout(() => { if (this._el) this._el.style.display = 'none'; }, 300);
  },
};
window.ImageModal = ImageModal;

/* ── Gallery Viewer — v3.26, for the "1 cover image, click → scroll through
   all N images in order" pattern GM asked for on the course-product pages
   (see course-demo.js's buildGalleryCoverHTML / GalleryRegistry). Unlike
   ImageModal (single image) or the paged PdfViewer below (left/right),
   this scrolls vertically through an ordered set — closer to reading a
   short deck top-to-bottom than flipping pages. ── */
const GalleryViewer = {
  _el: null,

  _build() {
    if (this._el) return;
    const el = document.createElement('div');
    el.className = 'gallery-viewer';
    el.innerHTML = `
      <div class="gallery-viewer__bar">
        <div class="gallery-viewer__title" id="gv-title"></div>
        <div class="gallery-viewer__count" id="gv-count"></div>
        <button type="button" class="gallery-viewer__close" id="gv-close" aria-label="关闭">✕</button>
      </div>
      <div class="gallery-viewer__stage" id="gv-stage"></div>`;
    document.body.appendChild(el);
    el.querySelector('#gv-close').addEventListener('click', () => this.close());
    el.addEventListener('click', e => { if (e.target === el) this.close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && this.isOpen()) this.close(); });
    this._el = el;
  },

  isOpen() { return !!this._el && this._el.classList.contains('is-open'); },

  open(key) {
    const item = (window.GalleryRegistry || {})[key];
    if (!item) return;
    this._build();
    const el = this._el;
    el.querySelector('#gv-title').textContent = item.alt || '';
    el.querySelector('#gv-count').textContent = `${item.count} 张`;
    const stage = el.querySelector('#gv-stage');
    stage.innerHTML = Array.from({ length: item.count }, (_, i) => {
      const n = String(i + 1).padStart(2, '0');
      return `<img class="gallery-viewer__img" src="${item.dir}/${n}.webp" alt="${escapeHTML(item.alt || '')} ${n}" loading="lazy">`;
    }).join('');
    stage.scrollTop = 0;
    el.classList.add('is-open');
    ScrollLock.lock();
  },

  close() {
    if (!this._el) return;
    this._el.classList.remove('is-open');
    ScrollLock.unlock();
  },
};
window.GalleryViewer = GalleryViewer;

/* ── PDF Viewer — v3.26, for a product's pre-rendered comparison-PDF
   pages (see course-demo.js's registerPdfDoc/PdfRegistry). v3.27 (GM):
   switched from ist_demo's left/right paged SlideViewer pattern to a
   vertical scroll through every page in order — the comparison sheets
   are tall single-page tables (see PROJECT_NOTES.md), so scrolling top
   to bottom reads far more naturally than flipping. Same registry shape
   as before (dir + count of NN.webp pages); click a page to zoom it. ── */
const PdfViewer = {
  _el: null,

  _build() {
    if (this._el) return;
    const el = document.createElement('div');
    el.className = 'pdf-viewer';
    el.innerHTML = `
      <div class="pdf-viewer__bar">
        <div class="pdf-viewer__title" id="pv-title"></div>
        <div class="pdf-viewer__count" id="pv-count"></div>
        <button type="button" class="pdf-viewer__close" id="pv-close" aria-label="关闭">✕</button>
      </div>
      <div class="pdf-viewer__stage" id="pv-stage"></div>`;
    document.body.appendChild(el);
    el.querySelector('#pv-close').addEventListener('click', () => this.close());
    el.addEventListener('click', e => { if (e.target === el) this.close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && this.isOpen()) this.close(); });
    this._el = el;
  },

  isOpen() { return !!this._el && this._el.classList.contains('is-open'); },

  open(productId) {
    const item = (window.PdfRegistry || {})[productId];
    if (!item) return;
    this._build();
    const el = this._el;
    el.querySelector('#pv-title').textContent = item.label || '';
    el.querySelector('#pv-count').textContent = `共 ${item.count} 页`;
    const stage = el.querySelector('#pv-stage');
    stage.innerHTML = Array.from({ length: item.count }, (_, i) => {
      const n = String(i + 1).padStart(2, '0');
      return `<img class="pdf-viewer__img" src="${item.dir}/${n}.webp" alt="${escapeHTML(item.label || '')} · 第 ${i + 1} 页" loading="lazy">`;
    }).join('');
    stage.scrollTop = 0;
    el.classList.add('is-open');
    ScrollLock.lock();
  },

  close() {
    if (!this.isOpen()) return;
    this._el.classList.remove('is-open');
    ScrollLock.unlock();
  },
};
window.PdfViewer = PdfViewer;

/* ── Slide Viewer — v3.28, ported (near-verbatim) from ist_demo's own
   SlideViewer: a left/right PAGED flip through a course's real deck
   (keyboard ←/→, touch swipe, click-to-zoom), distinct from the two
   vertical-scroll viewers above. GM's 冬夏校 spec: "cover用海报，点开是
   压缩处理左右翻页的pdf" — each 27冬校/研究生 catalog card that has a
   real deck (dad_courses_academic.json's `slides: {dir, count}`, set on
   exactly the 6 winter-27 研究生 records) opens this instead of the plain
   ImageModal poster (see pages/home.js's _buildCatalogCard deckSlug
   branch). Looked up the same way ist_demo does it — a direct find()
   against the already-loaded DATA global (ist-data.js's top-level
   `const DATA`, confirmed reliably accessible as a bare identifier from
   any later classic <script> — course-demo.js already relies on this
   same fact) — rather than a separate registry, since the record itself
   already carries both its `slug` and its `slides` field. ── */
const SlideViewer = {
  _el: null, _item: null, _i: 0, _opener: null,

  _build() {
    if (this._el) return;
    const el = document.createElement('div');
    el.className = 'slide-viewer';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', '课程详情');
    el.innerHTML = `
      <div class="slide-viewer__bar">
        <div class="slide-viewer__title" id="sv-title"></div>
        <div class="slide-viewer__count" id="sv-count" aria-live="polite"></div>
        <button type="button" class="slide-viewer__close" id="sv-close" aria-label="关闭">✕</button>
      </div>
      <div class="slide-viewer__stage" id="sv-stage">
        <button type="button" class="slide-viewer__nav slide-viewer__nav--prev" id="sv-prev" aria-label="上一页">‹</button>
        <img class="slide-viewer__img" id="sv-img" alt="" draggable="false">
        <button type="button" class="slide-viewer__nav slide-viewer__nav--next" id="sv-next" aria-label="下一页">›</button>
      </div>
      <div class="slide-viewer__foot">
        <input type="range" class="slide-viewer__range" id="sv-range" min="1" value="1" aria-label="页码">
        <span class="slide-viewer__hint">← → 翻页 · 点击图片放大 · Esc 关闭</span>
      </div>`;
    document.body.appendChild(el);
    el.querySelector('#sv-close').addEventListener('click', () => this.close());
    el.querySelector('#sv-prev').addEventListener('click', () => this.go(this._i - 1));
    el.querySelector('#sv-next').addEventListener('click', () => this.go(this._i + 1));
    el.querySelector('#sv-range').addEventListener('input', e => this.go(+e.target.value - 1));
    el.querySelector('#sv-img').addEventListener('click', () => el.classList.toggle('is-zoom'));
    el.addEventListener('click', e => { if (e.target.id === 'sv-stage') this.close(); });
    // touch swipe
    let x0 = null;
    const stage = el.querySelector('#sv-stage');
    stage.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', e => {
      if (x0 === null || el.classList.contains('is-zoom')) { x0 = null; return; }
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) this.go(this._i + (dx < 0 ? 1 : -1));
    }, { passive: true });
    // capture phase so Esc / arrows never leak to the course overlay underneath
    document.addEventListener('keydown', e => {
      if (!this.isOpen()) return;
      const k = e.key;
      if (k === 'Escape') { e.stopImmediatePropagation(); e.preventDefault(); this.close(); }
      else if (k === 'ArrowRight' || k === 'PageDown') { e.preventDefault(); this.go(this._i + 1); }
      else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); this.go(this._i - 1); }
      else if (k === 'Home') { e.preventDefault(); this.go(0); }
      else if (k === 'End') { e.preventDefault(); this.go(this._item.slides.count - 1); }
      else if (k === 'Tab') { // keep focus inside the dialog
        const f = [...el.querySelectorAll('button, input')].filter(b => !b.disabled);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }, true);
    this._el = el;
  },

  isOpen() { return !!this._el && this._el.classList.contains('is-open'); },

  open(slug, page = 0) {
    const item = (window.DATA || (typeof DATA !== 'undefined' ? DATA : null))?.courses_academic?.find(c => c.slug === slug && c.slides);
    if (!item) return;
    this._build();
    this._item = item; this._opener = document.activeElement;
    const el = this._el;
    el.querySelector('#sv-title').textContent = item.role_or_course;
    const r = el.querySelector('#sv-range'); r.max = item.slides.count;
    el.classList.remove('is-zoom');
    el.classList.add('is-open');
    ScrollLock.lock();
    this.go(page);
    el.querySelector('#sv-close').focus();
  },

  close() {
    if (!this.isOpen()) return;
    this._el.classList.remove('is-open', 'is-zoom');
    this._el.querySelector('#sv-img').removeAttribute('src');
    ScrollLock.unlock();
    if (this._opener && this._opener.focus) this._opener.focus();
  },

  _src(i) { const s = this._item.slides; return `${s.dir}/${String(i + 1).padStart(2, '0')}.webp`; },

  go(i) {
    const n = this._item.slides.count;
    i = Math.max(0, Math.min(n - 1, i));
    this._i = i;
    const el = this._el, img = el.querySelector('#sv-img');
    img.src = this._src(i);
    img.alt = `${this._item.role_or_course} · 第 ${i + 1} 页`;
    el.querySelector('#sv-count').textContent = `${i + 1} / ${n}`;
    el.querySelector('#sv-range').value = i + 1;
    el.querySelector('#sv-prev').disabled = i === 0;
    el.querySelector('#sv-next').disabled = i === n - 1;
    el.querySelector('#sv-stage').scrollTo(0, 0);
    // warm the neighbours
    [i - 1, i + 1].forEach(j => { if (j >= 0 && j < n) { const im = new Image(); im.src = this._src(j); } });
  },
};
window.SlideViewer = SlideViewer;
