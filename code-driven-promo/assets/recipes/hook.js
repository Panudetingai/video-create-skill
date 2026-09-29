// __ID__ __NAME__ — recipe: hook
// Problem first: a grey, cluttered world; a bot knocks on the glass and the
// colour comes back. Headline line 1 = the pain, line 2 = the promise.
// Edit: CLUTTER (the mess), NOTES (notifications), the bot key.
import { ic } from '../ui.js';
import { L } from './common.js';

const CLUTTER = ['report_final_v3.docx', 'budget(1).xlsx', 'IMG_2331.png', 'contract.pdf', 'bug-report.txt', 'export (4).csv', 'notes.md', 'backup.zip'];
const NOTES = [['mail', '#3aa3f5', 'Mail', ['128 ฉบับยังไม่อ่าน', '128 unread']], ['circle-alert', '#f0443a', 'CI', ['Build ล้มเหลว', 'Build failed']], ['calendar', '#f5c518', 'Calendar', ['ประชุมอีก 5 นาที', 'Meeting in 5 min']]];

export default function scene(ctx) {
  const { tl } = ctx;
  const bot = ctx.meta.bots[0] ?? 'mochi';
  tl.set(ctx.bg.params, { gray: 1, glow: 0.25, grid: 0.6 }, 0);

  const desk = ctx.el(`<div class="layer" style="filter:grayscale(1) brightness(.8)"></div>`);
  const win = ctx.el(`<div class="abs card" style="left:150px;top:330px;width:1000px;height:540px;background:#1b1b18;overflow:hidden">
      <div style="height:46px;display:flex;align-items:center;gap:8px;padding:0 16px;border-bottom:1px solid var(--border);font-weight:600">${ic('download', 'sz-4')}Downloads</div></div>`, desk);
  CLUTTER.forEach((name, i) => {
    const f = ctx.el(`<div class="abs" style="left:${40 + (i % 4) * 240 + ctx.rand() * 40}px;top:${70 + Math.floor(i / 4) * 220 + ctx.rand() * 30}px;width:160px;display:flex;flex-direction:column;align-items:center;gap:8px">
        <div style="width:84px;height:104px;border-radius:8px;background:#e9e7df;box-shadow:0 6px 14px rgba(0,0,0,.35)"></div><span style="font-size:15px;color:#ddd">${name}</span></div>`, win);
    tl.from(f, { y: -700, rotation: (ctx.rand() - 0.5) * 90, opacity: 0, duration: 0.7, ease: 'bounce.out' }, 0.05 + i * 0.1);
  });
  NOTES.forEach(([icon, color, app, text], i) => {
    const n = ctx.el(`<div class="abs glass" style="left:1290px;top:${120 + i * 104}px;width:500px;padding:14px 18px;display:flex;gap:14px;align-items:center">
        <span style="width:44px;height:44px;border-radius:10px;background:${color};display:flex;align-items:center;justify-content:center;color:#fff">${ic(icon, '', 24)}</span>
        <span style="display:flex;flex-direction:column"><b style="font-size:18px">${app}</b><span style="font-size:18px;color:#ccc">${L(ctx, ...text)}</span></span></div>`, desk);
    tl.from(n, { x: 560, duration: 0.45, ease: 'power3.out' }, 0.9 + i * 0.35);
  });
  tl.to(desk, { keyframes: [{ x: -8 }, { x: 7 }, { x: -5 }, { x: 0 }], duration: 0.4, ease: 'none' }, 2.0);

  const h1 = ctx.headline([{ t: ctx.T.text[0] }], { x: 110, y: 60, size: 110, align: 'left', valign: 'top' });
  ctx.wordsIn(h1, 1.4);

  // the bot arrives and knocks
  const b = ctx.bot(bot, { size: 340, x: 1920, y: 560, state: 'thinking', shadow: false });
  tl.to(b, { x: -420, duration: 0.9, ease: 'back.out(1.4)' }, 3.0);
  tl.to(b, { keyframes: [{ x: -380, duration: 0.12 }, { x: -420, duration: 0.14 }, { x: -380, duration: 0.12 }, { x: -420, duration: 0.14 }] }, 4.0);
  tl.to(desk, { filter: 'grayscale(0) brightness(1)', duration: 0.9 }, 4.4);
  tl.to(ctx.bg.params, { gray: 0, glow: 0.7, duration: 1.0 }, 4.4);
  tl.to(desk, { scale: 0.92, x: -40, opacity: 0.55, duration: 1.2, transformOrigin: '40% 50%' }, 4.6);
  ctx.pose(b, 'welcome', 4.6);
  if (ctx.T.text[1]) ctx.wordsIn(ctx.headline([{ t: ctx.T.text[1], cls: 'amber' }], { x: 110, y: 195, size: 110, align: 'left', valign: 'top' }), 4.8);
}
