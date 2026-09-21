/* ═══════════════════════════════════════════
   MARQUEE — robust, requestAnimationFrame-driven infinite scroll for
   the site's duplicated-list reel sections (career-rail/industry
   reel, featured-rail courses, coop-marquee-track partner logos —
   any future one can reuse this).

   v3.13 (GM): replaces the previous pure-CSS approach ("duplicate the
   list once, `animation: translateX(0) -> translateX(-50%)
   ... infinite`" — mathematically seamless since the two halves are
   pixel-identical, but relies on the browser keeping ONE very-long-
   lived CSS animation's compositing layer correctly alive for the
   entire time the page is open). GM reported the reels visibly
   disappearing after scrolling for a while — consistent with known
   browser/WebKit compositing-layer degradation on long-running
   `infinite` CSS animations combined with `will-change: transform`.
   A rAF loop instead recomputes the transform every single frame from
   elapsed time modulo the single-copy width, so there is no long-
   lived animation state for the rendering engine to ever lose track
   of — position is always freshly computed, which is what actually
   guarantees an unbroken head-to-tail loop for as long as the tab is
   open, on any browser.

   Usage contract (unchanged DOM shape from the old CSS version):
     <div class="X-wrap"><div class="X-track" id="...">
       ${[...items, ...items].map(cardHTML).join('')}
     </div></div>
   then: Marquee.init(document.getElementById('...'), speedPxPerSec)

   Pause behavior (same UX as before, now driven from JS instead of a
   CSS :hover/.is-paused selector): paused while the pointer is over
   the wrap, and paused while the wrap has scrolled out of view
   (IntersectionObserver) — both were already the site's existing
   marquee conventions, just re-homed here so every reel gets both for
   free instead of each page re-implementing its own IntersectionObserver
   block. ═══════════════════════════════════════════ */

const Marquee = {
  _byKey: Object.create(null),

  // trackEl: the flex track containing the list duplicated exactly
  // once (2 copies, same order) — required for the modulo wraparound
  // math to stay seamless. speedPxPerSec: scroll speed. key: optional
  // string — if a Marquee is already running under this key (e.g. a
  // page builder re-rendered and replaced the track's innerHTML), the
  // old one is stopped first so loops never pile up on a stale,
  // detached node.
  init(trackEl, speedPxPerSec, key) {
    if (!trackEl) return null;
    if (key && this._byKey[key]) this._byKey[key].stop();

    const wrap = trackEl.parentElement;
    let paused = false;
    let outOfView = false;
    let x = 0;
    let lastTs = null;
    let rafId = null;

    const tick = (ts) => {
      if (lastTs === null) lastTs = ts;
      const dt = Math.min((ts - lastTs) / 1000, 0.25); // clamp huge gaps (tab backgrounded)
      lastTs = ts;
      // Recomputed every frame rather than cached at init time: page
      // builders (HomePage.render/PlanningPage.render) run before
      // Router.go() makes their page visible (see the boot sequence in
      // index.html — same reason Effects.init() is re-run per page
      // activation), so scrollWidth is 0 at the moment init() is first
      // called for whichever page isn't the initial one. Reading it
      // fresh each frame means the reel just starts moving the instant
      // its layout becomes real, with no separate "page became visible"
      // hook needed — and it stays correct across resizes/reflows too.
      const singleCopyWidth = trackEl.scrollWidth / 2;
      if (!paused && !outOfView && singleCopyWidth > 0) {
        x -= speedPxPerSec * dt;
        // v3.36 (GM): this used to be `if (x <= -singleCopyWidth) x +=
        // singleCopyWidth;` — a single best-effort correction that only
        // recovers from an overshoot of at most one frame's movement. It
        // silently assumed singleCopyWidth is stable frame to frame, but
        // scrollWidth is read fresh every tick specifically because it
        // ISN'T always stable (see the comment above) — a transient
        // reflow (a webfont swap, a subpage toggle, any one-frame layout
        // glitch) can make scrollWidth read abnormally small for just
        // that one frame. When it does, a long-running x (which spends
        // its whole cycle somewhere in (-singleCopyWidth, 0]) can land
        // far outside the NEW, shrunk singleCopyWidth — and one `+=` isn't
        // enough to bring it back, so the reel's visible strip lands
        // beyond the track's actual rendered content: a real blank gap,
        // reproduced and confirmed with an adversarial stress test (see
        // PROJECT_NOTES.md v3.36). Using `%` instead of a single `if`
        // brings x into (-singleCopyWidth, 0] in one step regardless of
        // how far it drifted, however much singleCopyWidth changed.
        if (singleCopyWidth > 0) {
          x = x % singleCopyWidth;
          if (x > 0) x -= singleCopyWidth;
        }
        // translate3d, not translateX — forces one consistent GPU-
        // composited layer for the loop's whole lifetime instead of
        // leaving 2D-vs-3D layer promotion up to the engine's own
        // heuristics. Paired with dropping mask-image from the wraps
        // (components.css/.career-rail-wrap has the full writeup) — GM
        // reported the reels still going blank after a while even after
        // v3.13's CSS-animation-to-rAF rewrite, and this pair of changes
        // targets the other remaining risk factor: a browser/GPU
        // compositing layer that's masked *and* continuously transformed.
        trackEl.style.transform = `translate3d(${x}px, 0, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const onMouseEnter = () => { paused = true; };
    const onMouseLeave = () => { paused = false; };
    if (wrap) {
      wrap.addEventListener('mouseenter', onMouseEnter);
      wrap.addEventListener('mouseleave', onMouseLeave);
    }
    let io = null;
    if (wrap && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(entries => {
        entries.forEach(e => { outOfView = !e.isIntersecting; });
      }, { threshold: 0.1 });
      io.observe(wrap);
    }

    const instance = {
      stop() {
        cancelAnimationFrame(rafId);
        if (wrap) {
          wrap.removeEventListener('mouseenter', onMouseEnter);
          wrap.removeEventListener('mouseleave', onMouseLeave);
        }
        if (io) io.disconnect();
      },
    };
    if (key) this._byKey[key] = instance;
    return instance;
  },
};
window.Marquee = Marquee;
