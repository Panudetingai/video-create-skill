// S12 CTA 86–90s — Download → Add keys → Start coworking. The team waves,
// Momo throws confetti, QR + URL.
import timeline from '../timeline.json' with { type: 'json' };

const qrcode = window.qrcode; // qrcode-generator (classic script in index.html)
import { ic, brand, MARKS } from '../ui.js';

const TEAM = ['mochi', 'jelly', 'petal', 'nori', 'sora', 'momo'];

export default function s12(ctx) {
  const { tl, gsap, meta } = ctx;
  tl.set(ctx.bg.params, { glow: 1, ring: 0.5, ringR: 0.5, fx: 0.5, fy: 0.5, grid: 0.3 }, 0);

  const h = ctx.headline([{ t: ctx.T.text[0] }, { t: ctx.T.text[1], cls: 'rb', size: 110 }], { x: 760, y: 60, size: 70, valign: 'top' });
  ctx.wordsIn(h, 0.05, { stagger: 0.04, dur: 0.4 });

  const steps = [
    [`<span style="display:flex;gap:10px;align-items:center">${brand('Apple', 30)}${MARKS.Windows(28)}<span style="font-size:28px">🐧</span></span>`, 'Download', 'macOS · Windows · Linux'],
    [ic('key-round', 'c-amber', 34), 'Add keys', 'OpenAI · Claude · Ollama…'],
    [ic('sparkles', 'c-violet', 34), 'Start coworking', ctx.th ? 'ไม่ต้องสมัครบัญชี' : 'No account needed'],
  ];
  steps.forEach(([icon, title, sub], i) => {
    const x = 90 + i * 460;
    const c = ctx.el(`<div class="abs glass" style="left:${x}px;top:330px;width:400px;height:170px;padding:22px 24px;display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;align-items:center;gap:12px"><span style="width:38px;height:38px;border-radius:50%;background:var(--primary);color:var(--primary-foreground);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px">${i + 1}</span>${icon}</div>
        <b style="font-size:32px;font-family:var(--font-en)">${title}</b><span style="font-size:19px;color:var(--muted-foreground)">${sub}</span></div>`);
    ctx.pop(c, 0.25 + i * 0.18, { y: 30, from: 0.85 });
    if (i < 2) {
      const a = ctx.el(`<div class="abs" style="left:${x + 408}px;top:398px;color:var(--muted-foreground)">${ic('arrow-right', '', 40)}</div>`);
      tl.from(a, { opacity: 0, x: -10, duration: 0.25 }, 0.45 + i * 0.18);
    }
  });

  // QR code (real, scannable)
  const qr = qrcode(0, 'M');
  qr.addData('https://' + timeline.url);
  qr.make();
  const n = qr.getModuleCount();
  let cells = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) cells += `M${c} ${r}h1v1h-1z`;
  const card = ctx.el(`<div class="abs" style="left:1500px;top:250px;width:330px;display:flex;flex-direction:column;align-items:center;gap:14px">
      <div style="background:#fff;border-radius:22px;padding:18px;box-shadow:0 30px 70px rgba(0,0,0,.5)"><svg width="260" height="260" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><path d="${cells}" fill="#111"/></svg></div>
      <div style="font:700 26px var(--font-en);white-space:nowrap">${timeline.url}</div></div>`);
  ctx.pop(card, 0.5, { y: 40, from: 0.8 });

  // the team waves
  TEAM.forEach((key, i) => {
    const b = ctx.bot(key, { size: 150, x: 170 + i * 205, y: 590, state: 'welcome' });
    tl.from(b, { y: 400, duration: 0.5, ease: 'back.out(1.5)' }, 0.1 + i * 0.06);
  });
  const momo = ctx.qa('.bot-wrap').at(-1);
  ctx.pose(momo, 'done', 1.2);
  ctx.confetti(1270, 640, 1.25, { count: 140, spread: 1700, up: 900 });
  ctx.confetti(560, 640, 1.9, { count: 80, spread: 1200, up: 800 });
  meta;
}
