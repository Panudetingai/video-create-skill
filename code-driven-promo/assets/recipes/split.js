// __ID__ __NAME__ — recipe: split
// Two or three side-by-side panels (modes, before/after, A vs B). A cursor
// spotlights each in turn; a bot sits on each panel. Edit PANELS.
import { ic, userMsg, stepRow } from '../ui.js';
import { L } from './common.js';

export default function scene(ctx) {
  const { tl } = ctx;
  tl.set(ctx.bg.params, { glow: 0.45, fy: 0.3 }, 0);
  // always 3 characters available (pad with defaults when the storyboard names fewer)
  const bots = [...new Set([...ctx.meta.bots, 'sora', 'petal', 'nori'])];

  const h = ctx.headline([{ t: ctx.T.text[0] }], { x: 960, y: 110, size: 76 });
  ctx.wordsIn(h, 0.1);
  if (ctx.T.text[1]) {
    const sub = ctx.el(`<div class="abs eyebrow" style="left:960px;top:176px;transform:translateX(-50%);font-size:26px;text-transform:none;letter-spacing:.04em">${ctx.T.text[1]}</div>`);
    tl.from(sub, { opacity: 0, y: 10, duration: 0.4 }, 0.5);
  }

  const PANELS = [
    { icon: 'message-square', title: 'Chat', body: userMsg(L(ctx, 'สรุป PDF นี้ให้หน่อย', 'Summarize this PDF')) },
    { icon: 'sparkles', title: 'Cowork', body: `<div class="steps">${stepRow({ state: 'done', icon: 'file-pen', verb: 'Edit', target: 'report.docx', time: '1.2s' })}${stepRow({ state: 'running', icon: 'file-plus', verb: 'Create', target: 'summary.xlsx' })}</div>` },
    { icon: 'code-xml', title: 'Code', body: `<div class="term"><div><span class="p">➜</span> bun test</div><div class="p">✓ 36 passed</div></div>` },
  ].slice(0, Math.max(2, Math.min(3, ctx.meta.bots.length || 3)));

  const n = PANELS.length, W = n === 3 ? 540 : 800, gap = 45, Y = 250, H = 600;
  const x0 = 960 - (n * W + (n - 1) * gap) / 2;
  const els = PANELS.map((p, i) => {
    const el = ctx.el(`<div class="abs card" style="left:${x0 + i * (W + gap)}px;top:${Y}px;width:${W}px;height:${H}px;overflow:hidden;background:var(--background)">
        <div style="display:flex;align-items:center;gap:10px;height:56px;padding:0 18px;border-bottom:1px solid var(--border);font-size:20px;font-weight:600">${ic(p.icon, 'sz-5')}${p.title}</div>
        <div style="padding:12px 14px;zoom:1.3">${p.body}</div></div>`);
    tl.from(el, { y: 120, opacity: 0, duration: 0.6, ease: 'power3.out' }, 0.25 + i * 0.1);
    const b = ctx.bot(bots[i], { size: 150, x: x0 + i * (W + gap) + W - 150, y: Y + H - 130, state: 'idle' });
    tl.from(b, { scale: 0, duration: 0.5, ease: 'back.out(2)' }, 0.6 + i * 0.12);
    el.bot = b;
    return el;
  });

  // spotlight each panel in turn, then all together
  const slot = (ctx.duration - 2) / n;
  els.forEach((el, i) => {
    const at = 1 + i * slot;
    els.forEach((o, j) => tl.to([o, o.bot], { opacity: i === j ? 1 : 0.35, duration: 0.35 }, at));
    tl.to(el, { scale: 1.03, borderColor: 'rgba(252,211,77,.7)', duration: 0.3 }, at);
    tl.to(el, { scale: 1, borderColor: 'rgba(255,255,255,.1)', duration: 0.3 }, at + slot - 0.3);
    ctx.pose(el.bot, 'working', at);
  });
  els.forEach((o) => tl.to([o, o.bot], { opacity: 1, duration: 0.4 }, ctx.duration - 1));
}
