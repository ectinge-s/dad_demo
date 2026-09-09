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
    document.body.style.overflow = 'hidden';
  },

  close() {
    if (!this.el) return;
    this.el.classList.remove('is-open');
    document.body.style.overflow = '';
  },
};

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
  },
  close() {
    document.getElementById('nav-menu-toggle').setAttribute('aria-expanded', 'false');
    document.getElementById('nav-menu-overlay').classList.remove('is-open');
    document.getElementById('nav-menu-overlay').setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-menu-open');
  },
  go(pageId, opts) {
    this.close();
    Router.go(pageId, opts);
  },
};
document.getElementById('nav-menu-toggle')?.addEventListener('click', () => NavMenu.toggle());
document.addEventListener('keydown', e => { if (e.key === 'Escape') NavMenu.close(); });
