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
   first `close()` prematurely restoring scrolling. */
const ScrollLock = {
  _count: 0,
  lock() {
    if (this._count === 0) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) document.body.style.paddingRight = scrollbarWidth + 'px';
    }
    this._count++;
  },
  unlock() {
    this._count = Math.max(0, this._count - 1);
    if (this._count === 0) {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  },
};

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

/* ── EXPANDABLE NAV MENU (additive to .navbar — copied from IST) ── */
const NavMenu = {
  toggle() {
    document.getElementById('nav-menu-overlay').classList.contains('is-open') ? this.close() : this.open();
  },
  open() {
    document.getElementById('nav-menu-toggle').setAttribute('aria-expanded', 'true');
    document.getElementById('nav-menu-overlay').classList.add('is-open');
    document.getElementById('nav-menu-overlay').setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-menu-open');
    ScrollLock.lock();
  },
  close() {
    document.getElementById('nav-menu-toggle').setAttribute('aria-expanded', 'false');
    document.getElementById('nav-menu-overlay').classList.remove('is-open');
    document.getElementById('nav-menu-overlay').setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-menu-open');
    ScrollLock.unlock();
  },
  go(pageId, opts) {
    this.close();
    Router.go(pageId, opts);
  },
};
document.getElementById('nav-menu-toggle')?.addEventListener('click', () => NavMenu.toggle());
document.addEventListener('keydown', e => { if (e.key === 'Escape') NavMenu.close(); });

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
