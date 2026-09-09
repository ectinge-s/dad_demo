/* ═══════════════════════════════════════════
   EFFECTS — scroll-reveal for .fade-up elements.
   Same pattern as IST: IntersectionObserver toggles
   .is-visible once an element enters the viewport.
═══════════════════════════════════════════ */

const Effects = {
  observer: null,

  init(root = document) {
    if (!this.observer) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    }
    root.querySelectorAll('.fade-up:not(.is-visible)').forEach(el => this.observer.observe(el));
  },
};

document.addEventListener('DOMContentLoaded', () => Effects.init());
