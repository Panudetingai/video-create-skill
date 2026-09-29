// __ID__ __NAME__ — recipe: cta
// Three steps, the cast waves, confetti, a real scannable QR code + URL.
// Everything is on screen by ~1.5s because CTA scenes are short.
import timeline from '../timeline.json' with { type: 'json' };
import { ic, brand, MARKS } from '../ui.js';

export default function scene(ctx) {
  const { tl } = ctx;
  tl.set(ctx.bg.params, { glow: 1, ring: 0.5, ringR: 0.5, grid: 0.3 }, 0);
  const team = (ctx.meta.bots.length ? ctx.meta.bots : ['mochi', 'jelly', 'petal', 'nori', 'sora', 'momo']).slice(0, 6);

  ctx.wordsIn(ctx.headline([{ t: ctx.T.text[0] }, ...(ctx.T.text[1] ? [{ t: ctx.T.text[1], cls: 'rb', size: 110 }] : [])], { x: 760, y: 60, size: 70, valign: 'top' }), 0.05, { stagger: 0.04, dur: 0.4 });

  const STEPS = [
    [`${brand('Apple', 30)}${MARKS.Windows(28)}`, 'Download', 'macOS · Windows · Linux'],
    [ic('key-round', 'c-amber', 34), 'Add keys', 'OpenAI · Claude · Ollama'],
    [ic('sparkles', 'c-violet', 34), 'Start', ctx.th ? 'ไม่ต้องสมัครบัญชี' : 'No account needed'],
  ];
  STEPS.forEach(([icon, title, sub], i) => {
    const c = ctx.el(`<div class="abs glass" style="left:${90 + i * 460}px;top:330px;width:400px;height:170px;padding:22px 24px;display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;align-items:center;gap:12px"><span style="width:38px;height:38px;border-radius:50%;background:var(--primary);color:var(--primary-foreground);display:flex;align-items:center;justify-content:center;font-weight:800">${i + 1}</span>${icon}</div>
        <b style="font-size:32px">${title}</b><span style="font-size:19px;color:var(--muted-foreground)">${sub}</span></div>`);
    ctx.pop(c, 0.25 + i * 0.18, { y: 30, from: 0.85 });
  });

  const qr = window.qrcode(0, 'M');
  qr.addData('https://' + timeline.url);
  qr.make();
  const n = qr.getModuleCount();
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
  const card = ctx.el(`<div class="abs" style="left:1500px;top:250px;width:330px;display:flex;flex-direction:column;align-items:center;gap:14px">
      <div style="background:#fff;border-radius:22px;padding:18px"><svg width="260" height="260" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><path d="${d}" fill="#111"/></svg></div>
      <div style="font:700 26px var(--font-en);white-space:nowrap">${timeline.url}</div></div>`);
  ctx.pop(card, 0.5, { y: 40, from: 0.8 });

  const wraps = team.map((key, i) => {
    const b = ctx.bot(key, { size: 150, x: 170 + i * 205, y: 590, state: 'welcome' });
    tl.from(b, { y: 400, duration: 0.5, ease: 'back.out(1.5)' }, 0.1 + i * 0.06);
    return b;
  });
  ctx.pose(wraps.at(-1), 'done', 1.2);
  ctx.confetti(1270, 640, 1.25, { count: 140, spread: 1700, up: 900 });
}
