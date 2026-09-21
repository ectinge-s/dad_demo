/* ═══════════════════════════════════════════
   HERO CUSTOM CURSOR (v3.19, GM)
   Tracks the mouse with a single `mousemove` listener and shows/
   positions #hero-cursor (see index.html for the SVG, style.css for
   its container styling) only while the pointer is over the HOMEPAGE
   hero (#hero-root) — scoped narrower than the v3.17 pass, which had
   this active on every page's `.hero` section; GM asked for homepage
   only. Position updates are rAF-throttled to avoid layout thrash on
   fast mouse movement. Purely decorative (`pointer-events:none` on the
   cursor element, `aria-hidden`) — never intercepts clicks, and simply
   never activates on touch input since no `mousemove` fires there.
═══════════════════════════════════════════ */
(function () {
  const cursorEl = document.getElementById('hero-cursor');
  if (!cursorEl) return;

  // v3.19's pixel/voxel cursor is a non-square SVG (viewBox 192.8x128.8,
  // rendered at 96x64 css px — see style.css) whose tip sits right at
  // the bottom-left corner of the artwork (~0.5%, 93.9% of the box).
  // Convert that fraction into a pixel offset so the visual tip (not
  // the box's own top-left corner) lands under the actual pointer.
  const CURSOR_W = 96;
  const CURSOR_H = 64;
  const TIP_X = 0.0052 * CURSOR_W;
  const TIP_Y = 0.9394 * CURSOR_H;

  let inHero = false;
  let pressed = false;
  let rafId = null;
  let px = 0, py = 0;

  function applyPosition() {
    rafId = null;
    const scale = pressed ? ' scale(.9)' : '';
    cursorEl.style.transform = `translate3d(${px - TIP_X}px, ${py - TIP_Y}px, 0)${scale}`;
  }

  function schedulePosition(x, y) {
    px = x; py = y;
    if (rafId == null) rafId = requestAnimationFrame(applyPosition);
  }

  function isOverHero(e) {
    const heroRoot = document.getElementById('hero-root');
    return !!(heroRoot && e.target.closest && e.target.closest('#hero-root'));
  }

  document.addEventListener('mousemove', (e) => {
    if (isOverHero(e)) {
      if (!inHero) { inHero = true; cursorEl.classList.add('is-visible'); }
      schedulePosition(e.clientX, e.clientY);
    } else if (inHero) {
      inHero = false;
      pressed = false;
      cursorEl.classList.remove('is-visible', 'is-pressed');
    }
  });

  // Mouse leaving the browser window entirely (e.g. to another app).
  document.addEventListener('mouseleave', () => {
    if (inHero) {
      inHero = false;
      pressed = false;
      cursorEl.classList.remove('is-visible', 'is-pressed');
    }
  });

  document.addEventListener('mousedown', (e) => {
    if (inHero && isOverHero(e)) {
      pressed = true;
      cursorEl.classList.add('is-pressed');
      schedulePosition(px, py);
    }
  });
  document.addEventListener('mouseup', () => {
    if (pressed) {
      pressed = false;
      cursorEl.classList.remove('is-pressed');
      schedulePosition(px, py);
    }
  });
})();
