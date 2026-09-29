// Scene engine: everything on screen is a pure function of the global time t.
//
//  seek(t) → background shader (uTime = t)
//          → overlay timeline (captions, wipes) at t
//          → current scene: rebuilt from scratch when entered (or when time
//            goes backwards), then simulated forward on the virtual clock in
//            60 Hz steps so bots (springs + timers) and the scene's GSAP
//            timeline stay locked together.
import { clock } from './clock.js';
import { gsap } from '../../node_modules/gsap/index.js';
import { createBot, RING_COLORS } from '../vendor/cowork-bots.js';
import { createBackground } from './bg.js';
import { allCues } from '../schedule.js';
import { cursorSvg } from '../ui.js';

gsap.ticker.sleep(); // never run on its own: we drive every timeline by hand
gsap.config({ force3D: false });

export function createEngine({ timeline, scenes, stage, lang = 'th', voTiming = {}, subs = true }) {
  const bg = createBackground(stage.querySelector('#bg'));
  const sceneHost = stage.querySelector('#scene');
  const overlay = stage.querySelector('#overlay');
  let current = null; // { index, tl, bots, root, spins, local }
  let overlayTl = null;

  function setSubs(on) { subs = on; buildOverlay(); }
  function setLang(l) {
    lang = l;
    document.documentElement.lang = l;
    buildOverlay();
    destroyScene();
  }

  // ---------------------------------------------------------------- overlay
  function buildOverlay() {
    overlay.innerHTML = `<div id="captions"></div><div id="wipe">${RING_COLORS.slice(0, 7).map((c) => `<i style="background:${c}"></i>`).join('')}</div>`;
    const caps = overlay.querySelector('#captions');
    const tl = gsap.timeline({ paused: true });
    if (subs) {
      for (const cue of allCues(timeline, lang, voTiming)) {
        const el = document.createElement('div');
        el.className = 'cap';
        el.textContent = cue.text;
        el.style.opacity = 0;
        caps.appendChild(el);
        el.style.position = 'absolute';
        el.style.bottom = '0';
        tl.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' }, cue.start);
        tl.to(el, { opacity: 0, y: -8, duration: 0.15, ease: 'power1.in' }, cue.end - 0.15);
      }
    }
    // rainbow stripe wipe on every cut
    const bars = overlay.querySelectorAll('#wipe i');
    for (const s of timeline.scenes.slice(1)) {
      const B = s.start;
      tl.set(bars, { transformOrigin: '50% 100%' }, B - 0.34);
      tl.fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 0.26, ease: 'power3.in', stagger: 0.012 }, B - 0.34);
      tl.set(bars, { transformOrigin: '50% 0%' }, B);
      tl.to(bars, { scaleY: 0, duration: 0.3, ease: 'power3.out', stagger: 0.012 }, B + 0.02);
    }
    tl.duration(); // resolve
    overlayTl = tl;
  }

  // ---------------------------------------------------------------- scenes
  function sceneIndexAt(t) {
    const s = timeline.scenes;
    for (let i = s.length - 1; i >= 0; i--) if (t >= s[i].start) return i;
    return 0;
  }

  function destroyScene() {
    if (!current) return;
    current.tl.kill();
    sceneHost.innerHTML = '';
    current = null;
  }

  function buildScene(index) {
    destroyScene();
    clock.reset(1000 + index * 7919);
    const meta = timeline.scenes[index];
    const root = document.createElement('div');
    root.className = 'layer scene-' + meta.id;
    sceneHost.appendChild(root);
    const tl = gsap.timeline({ paused: true });
    const bots = [];
    const ctx = makeCtx({ root, tl, bots, meta, lang, bg, duration: meta.end - meta.start });
    // every scene owns the backdrop settings it needs
    tl.set(bg.params, { glow: 0.35, gray: 0, ring: 0, ringR: 0.32, fx: 0.5, fy: 0.5, grid: 1 }, 0);
    scenes[meta.id](ctx);
    tl.time(0, false);
    current = { index, tl, bots, root, local: 0, spins: [...root.querySelectorAll('.spin')], shimmers: [...root.querySelectorAll('.shimmer')] };
  }

  function stepScene(local) {
    const cur = current;
    clock.advanceTo(local * 1000, (sec, dt) => {
      cur.tl.time(sec, false);
      for (const b of cur.bots) if (b.live) b.bot.update(dt, dt * 60);
    });
    cur.tl.time(local, false);
    cur.local = local;
    // CSS-free loaders: rotate spinners / sweep shimmers from time
    if (cur.tl.data?.dirty) { cur.spins = [...cur.root.querySelectorAll('.spin')]; cur.shimmers = [...cur.root.querySelectorAll('.shimmer')]; cur.tl.data.dirty = false; }
    for (const s of cur.spins) s.style.transform = `rotate(${((local * 360) / (s.classList.contains('slow') ? 3 : 0.9)) % 360}deg)`;
    for (const s of cur.shimmers) s.style.backgroundPosition = `${200 - ((local / 2) % 1) * 400}% 50%`;
  }

  function seek(t) {
    t = Math.max(0, Math.min(timeline.duration - 1e-6, t));
    const index = sceneIndexAt(t);
    const local = t - timeline.scenes[index].start;
    if (!current || current.index !== index || local < current.local - 1e-6) buildScene(index);
    stepScene(local);
    overlayTl.time(t, false);
    bg.render(t);
  }

  buildOverlay();
  return { seek, setLang, setSubs, get lang() { return lang; }, bg };
}

// ------------------------------------------------------------------ ctx
function makeCtx({ root, tl, bots, meta, lang, bg, duration }) {
  const th = lang === 'th';
  const T = meta[lang];
  const segWord = new Intl.Segmenter(lang, { granularity: 'word' });
  const segG = new Intl.Segmenter(lang, { granularity: 'grapheme' });
  tl.data = { dirty: false };

  const ctx = {
    root, tl, meta, lang, th, T, bg, duration, gsap,
    rand: clock.random,
    /** "at" helper: tl position in scene seconds */
    el(html, parent = root) {
      const tpl = document.createElement('template');
      tpl.innerHTML = html.trim();
      const node = tpl.content.firstElementChild;
      parent.appendChild(node);
      tl.data.dirty = true;
      return node;
    },
    q: (sel, from = root) => from.querySelector(sel),
    qa: (sel, from = root) => [...from.querySelectorAll(sel)],
    /** Swap the markup of a node at scene time `at`. */
    swap(node, html, at) {
      tl.call(() => { node.innerHTML = html; tl.data.dirty = true; }, null, at);
    },
    call(fn, at) { tl.call(fn, null, at); },
    /** Layout box of a node in stage pixels (measure before adding tweens to it). */
    pos(node) {
      const st = root.closest('#stage').getBoundingClientRect();
      const r = node.getBoundingClientRect();
      const k = st.width / 1920;
      const b = { x: (r.left - st.left) / k, y: (r.top - st.top) / k, w: r.width / k, h: r.height / k };
      return { ...b, cx: b.x + b.w / 2, cy: b.y + b.h / 2 };
    },

    // ------------------------------------------------ bots
    /**
     * Mount a CoworkBot. Returns the wrapper element (position it with GSAP)
     * with `.bot` (engine) attached.
     */
    bot(key, { size = 200, x = 0, y = 0, state = 'idle', shadow = true, name = false, parent = root, cls = '' } = {}) {
      const wrap = document.createElement('div');
      wrap.className = 'bot-wrap ' + cls;
      Object.assign(wrap.style, { width: size + 'px', height: size + 'px', left: x + 'px', top: y + 'px' });
      const canvas = document.createElement('div');
      canvas.className = 'bot-canvas';
      wrap.appendChild(canvas);
      if (name) {
        const n = document.createElement('div');
        n.className = 'bot-name';
        n.innerHTML = name === true ? cap(key) : name;
        wrap.appendChild(n);
      }
      parent.appendChild(wrap);
      const bot = createBot(canvas, key);
      if (!shadow) canvas.querySelector('.shadow').style.display = 'none';
      if (state !== 'idle') bot.setState(state);
      const rec = { bot, live: true, wrap };
      bots.push(rec);
      wrap.bot = bot;
      return wrap;
    },
    /** Change a bot's pose at scene time `at`. */
    pose(wrap, state, at) { tl.call(() => wrap.bot.setState(state), null, at); },

    // ------------------------------------------------ type
    /**
     * Kinetic headline. lines: [{ t: 'text', cls: 'rb' | 'amber' | 'dim' }] or strings.
     * Words are split with Intl.Segmenter so Thai never breaks inside a cluster.
     */
    headline(lines, { x = 960, y = 540, size = 120, align = 'center', valign = 'middle', parent = root, width } = {}) {
      const el = document.createElement('div');
      el.className = 'headline';
      el.style.fontSize = size + 'px';
      el.style.textAlign = align;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
      el.style.transform = `translate(${tx}, ${valign === 'top' ? '0' : '-50%'})`;
      if (width) { el.style.width = width + 'px'; el.style.whiteSpace = 'normal'; }
      el.innerHTML = lines.map((ln) => {
        const o = typeof ln === 'string' ? { t: ln } : ln;
        const words = [...segWord.segment(o.t)].map((s) => s.segment);
        return `<span class="line ${o.cls ?? ''}" ${o.size ? `style="font-size:${o.size}px"` : ''}>${words.map((w) => (w.trim() ? `<span class="w">${esc(w)}</span>` : w.replace(/ /g, '&nbsp;'))).join('')}</span>`;
      }).join('');
      parent.appendChild(el);
      return el;
    },
    wordsIn(el, at, { stagger = 0.06, y = 50, dur = 0.55, ease = 'back.out(1.7)' } = {}) {
      const w = el.querySelectorAll('.w');
      tl.from(w, { y, opacity: 0, rotate: 4, duration: dur, ease, stagger }, at);
    },
    wordsOut(el, at, { stagger = 0.02, dur = 0.3 } = {}) {
      tl.to(el.querySelectorAll('.w'), { y: -30, opacity: 0, duration: dur, ease: 'power2.in', stagger }, at);
    },
    /** Typewriter into `node` (grapheme-safe). */
    type(node, text, at, dur, { caret } = {}) {
      const g = [...segG.segment(text)].map((s) => s.segment);
      const o = { n: 0 };
      tl.call(() => { node.textContent = ''; }, null, at - 0.001);
      tl.to(o, { n: g.length, duration: dur, ease: 'none', onUpdate: () => { node.textContent = g.slice(0, Math.round(o.n)).join(''); } }, at);
      if (caret) { tl.set(caret, { opacity: 1 }, at); tl.set(caret, { opacity: 0 }, at + dur + 0.6); }
    },
    count(node, from, to, at, dur, fmt = (v) => Math.round(v).toLocaleString()) {
      const o = { v: from };
      node.textContent = fmt(from);
      tl.to(o, { v: to, duration: dur, ease: 'power2.out', onUpdate: () => { node.textContent = fmt(o.v); } }, at);
    },

    // ------------------------------------------------ pointer
    cursor(x = 960, y = 700, parent = root) {
      const c = document.createElement('div');
      c.className = 'cursor';
      c.innerHTML = cursorSvg();
      parent.appendChild(c);
      gsap.set(c, { x, y, opacity: 0 });
      const ring = document.createElement('div');
      ring.className = 'click-ring';
      parent.appendChild(ring);
      c.ring = ring;
      return c;
    },
    move(c, x, y, at, dur = 0.6, ease = 'power3.inOut') { tl.to(c, { x, y, duration: dur, ease }, at); },
    click(c, at) {
      tl.to(c, { scale: 0.82, duration: 0.08, yoyo: true, repeat: 1, transformOrigin: '20% 15%' }, at);
      tl.call(() => { gsap.set(c.ring, { left: gsap.getProperty(c, 'x') + 6, top: gsap.getProperty(c, 'y') + 5 }); }, null, at);
      tl.fromTo(c.ring, { scale: 0.3, opacity: 0.95 }, { scale: 1.4, opacity: 0, duration: 0.45, ease: 'power2.out', immediateRender: false }, at);
    },

    // ------------------------------------------------ fx
    /** Deterministic confetti burst (Momo's celebration). */
    confetti(x, y, at, { count = 90, spread = 900, parent = root, up = 700 } = {}) {
      const box = document.createElement('div');
      box.className = 'layer';
      box.style.pointerEvents = 'none';
      parent.appendChild(box);
      const r = clock.random;
      for (let i = 0; i < count; i++) {
        const p = document.createElement('i');
        const w = 8 + r() * 10, h = r() < 0.4 ? w : 4 + r() * 6;
        Object.assign(p.style, { position: 'absolute', left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px',
          background: RING_COLORS[Math.floor(r() * 7)], borderRadius: r() < 0.3 ? '50%' : '2px', opacity: 0 });
        box.appendChild(p);
        const ang = -Math.PI / 2 + (r() - 0.5) * 2.2;
        const v = 0.45 + r() * 0.75;
        const dx = Math.cos(ang) * spread * 0.5 * v, dy = Math.sin(ang) * up * v;
        const d = 1.6 + r() * 0.9;
        tl.set(p, { opacity: 1 }, at);
        tl.to(p, { x: dx, duration: d, ease: 'power1.out' }, at);
        tl.to(p, { keyframes: [{ y: dy, duration: d * 0.38, ease: 'power2.out' }, { y: dy + 520 + r() * 200, duration: d * 0.62, ease: 'power1.in' }] }, at);
        tl.to(p, { rotation: (r() - 0.5) * 900, rotationX: r() * 720, duration: d, ease: 'none' }, at);
        tl.to(p, { opacity: 0, duration: 0.3 }, at + d - 0.3);
      }
      return box;
    },
    /** Pop an element in. */
    pop(node, at, { from = 0.6, dur = 0.5, y = 0, ease = 'back.out(1.8)' } = {}) {
      tl.fromTo(node, { scale: from, opacity: 0, y }, { scale: 1, opacity: 1, y: 0, duration: dur, ease }, at);
    },
    fadeOut(node, at, dur = 0.3) { tl.to(node, { opacity: 0, duration: dur, ease: 'power1.in' }, at); },
  };
  return ctx;
}

const cap = (s) => s[0].toUpperCase() + s.slice(1);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// ------------------------------------------------------------------ preview player
export function mountPlayer(engine, timeline) {
  const p = document.getElementById('player');
  p.hidden = false;
  p.innerHTML = `
    <button id="pp">▶︎ Play</button>
    <span id="tt">0.00</span>
    <input id="scrub" type="range" min="0" max="${timeline.duration}" step="0.01" value="0">
    <span class="scenes">${timeline.scenes.map((s, i) => `<button data-t="${s.start}">S${i + 1}</button>`).join('')}</span>
    <select id="lang"><option value="th">TH</option><option value="en">EN</option></select>`;
  const pp = p.querySelector('#pp'), tt = p.querySelector('#tt'), scrub = p.querySelector('#scrub'), sel = p.querySelector('#lang');
  sel.value = engine.lang;
  let t = +(new URLSearchParams(location.search).get('t') || 0), playing = false, last = 0;
  const show = () => { engine.seek(t); tt.textContent = t.toFixed(2); scrub.value = t; };
  const loop = () => {
    if (!playing) return;
    const now = performance.now();
    t += (now - last) / 1000; last = now;
    if (t >= timeline.duration) { t = 0; }
    show();
    requestAnimationFrame(loop);
  };
  pp.onclick = () => { playing = !playing; pp.textContent = playing ? '❚❚ Pause' : '▶︎ Play'; last = performance.now(); if (playing) requestAnimationFrame(loop); };
  scrub.oninput = () => { t = +scrub.value; show(); };
  p.querySelectorAll('.scenes button').forEach((b) => (b.onclick = () => { t = +b.dataset.t; show(); }));
  sel.onchange = () => { engine.setLang(sel.value); show(); };
  window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); pp.click(); } });
  show();
}
