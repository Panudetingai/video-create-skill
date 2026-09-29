// Virtual clock: every frame is reproducible. The CoworkBot engine (written for
// real time, with setTimeout-driven states and random habits) gets this
// clock's setTimeout / Math.random in its module scope, so it runs unmodified
// yet renders identically on every export.

const STEP_MS = 1000 / 60; // bots' springs are tuned for 60 Hz steps

let now = 0;
let seq = 0;
let timers = []; // { id, at, fn, args, every }
let rafs = []; // { id, fn }
let rng = mulberry32(1);

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Timer API handed to the CoworkBot engine (module-scoped, see
// tools/extract-bots.mjs) — the page's real globals stay untouched so the
// exporter and the browser keep working normally.
export const vt = {
  setTimeout(fn, ms = 0, ...args) {
    const id = ++seq;
    timers.push({ id, at: now + Math.max(0, +ms || 0), fn, args, every: 0 });
    return id;
  },
  setInterval(fn, ms = 0, ...args) {
    const id = ++seq;
    const every = Math.max(1, +ms || 0);
    timers.push({ id, at: now + every, fn, args, every });
    return id;
  },
  clearTimeout(id) { timers = timers.filter((t) => t.id !== id); },
  requestAnimationFrame(fn) { const id = ++seq; rafs.push({ id, fn }); return id; },
  cancelAnimationFrame(id) { rafs = rafs.filter((r) => r.id !== id); },
  /** `Math` with a seeded random(); everything else inherited. */
  Math: Object.create(Math, { random: { value: () => rng() } }),
};
vt.clearInterval = vt.clearTimeout;

export const clock = {
  get ms() { return now; },
  get sec() { return now / 1000; },
  /** Forget every pending timer and restart time at 0 with a fresh seed. */
  reset(seed = 1) { now = 0; timers = []; rafs = []; rng = mulberry32(seed); },
  random: () => rng(),
  /**
   * Walk time forward to `ms` in fixed 60 Hz steps. Timers fire at their exact
   * time (in order); `onStep(sec, dtSec)` runs after each step.
   */
  advanceTo(ms, onStep) {
    let guard = 0;
    while (now < ms - 1e-6) {
      const next = Math.min(ms, now + STEP_MS);
      runTimers(next);
      const dt = (next - now) / 1000;
      now = next;
      const frame = rafs; rafs = [];
      for (const r of frame) r.fn(now);
      onStep?.(now / 1000, dt);
      if (++guard > 1e6) throw new Error('clock runaway');
    }
  },
};

function runTimers(until) {
  for (;;) {
    let pick = null;
    for (const t of timers) if (t.at <= until && (!pick || t.at < pick.at || (t.at === pick.at && t.id < pick.id))) pick = t;
    if (!pick) return;
    now = Math.max(now, pick.at);
    if (pick.every) pick.at += pick.every; else timers = timers.filter((t) => t !== pick);
    try { pick.fn(...pick.args); } catch (e) { console.error(e); }
  }
}
