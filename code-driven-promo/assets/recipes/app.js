// __ID__ __NAME__ — recipe: app
// The real app window on the right, headline column on the left, a cursor
// does one flow (type → send → result), a bot reacts, a result card pops.
// Replace MAIN with the screen this scene is about (see references/ui-kit.md).
import { ic, composer, modeTabs, userMsg, stepRow, receipt } from '../ui.js';
import { app, windowIn, L } from './common.js';

export default function scene(ctx) {
  const { tl, gsap } = ctx;
  const bot = ctx.meta.bots[0] ?? 'petal';
  tl.set(ctx.bg.params, { glow: 0.45, fx: 0.62, fy: 0.5 }, 0);

  // left column: headline lines arrive with the beats
  const h = ctx.headline([{ t: ctx.T.text[0] }, ...(ctx.T.text[1] ? [{ t: ctx.T.text[1], cls: 'amber', size: 60 }] : [])],
    { x: 90, y: 210, size: 96, align: 'left', valign: 'top', width: 500 });
  ctx.wordsIn(h, 0.4);

  const MAIN = `
    <div class="layer" style="display:flex;flex-direction:column;align-items:center;padding:30px 60px 24px;zoom:1.15">
      ${modeTabs('cowork')}
      <div class="thread" style="margin-top:28px;width:100%;display:flex;flex-direction:column;gap:10px"></div>
      <div style="margin-top:auto;width:100%">${composer({ folder: '~/Clients/Acme' })}</div>
    </div>`;
  const win = app(ctx, { x: 620, y: 120, scale: 0.88, main: MAIN, active: 'cowork', chats: [{ title: 'Acme · Q3 report', on: true }] });
  const send = ctx.pos(win.querySelector('.cp-send')); // measure BEFORE any tween moves the window
  windowIn(ctx, win, 0.05);

  // type a request into the composer, then send
  const text = win.querySelector('.cp-text');
  const prompt = L(ctx, 'สรุปยอดขาย Q3 แล้วทำเป็นสไลด์ 5 หน้า', 'Summarize Q3 sales into 5 slides');
  text.innerHTML = '<span class="cp-typed"></span>';
  ctx.type(text.firstChild, prompt, 0.85, 0.9); // grapheme-safe (Thai vowels stay on their consonant)

  const cur = ctx.cursor(1500, 1000);
  tl.to(cur, { opacity: 1, duration: 0.2 }, 1.6);
  ctx.move(cur, send.cx, send.cy, 1.7, 0.5);
  ctx.click(cur, 2.3);
  tl.to(cur, { opacity: 0, duration: 0.2 }, 2.7);

  // the thread fills in
  const thread = win.querySelector('.thread');
  const u = ctx.el(userMsg(prompt), thread);
  tl.from(u, { opacity: 0, y: 20, duration: 0.3 }, 2.4);
  const steps = ctx.el(`<div class="steps">${[
    stepRow({ state: 'done', icon: 'file-spreadsheet', verb: 'Read', target: 'Q3-report.xlsx', time: '0.8s' }),
    stepRow({ state: 'done', icon: 'file-plus', verb: 'Create', target: 'Q3-summary.pptx', time: '3.1s' }),
    stepRow({ state: 'running', icon: 'file-pen', verb: 'Edit', target: 'notes.md' }),
  ].join('')}</div>`, thread);
  ctx.qa('.step', steps).forEach((s, i) => tl.from(s, { opacity: 0, x: -20, duration: 0.3 }, 2.8 + i * 0.3));

  // a bot reacts, then a result card
  const b = ctx.bot(bot, { size: 180, x: 1660, y: 660, state: 'working', name: true });
  tl.from(b, { y: 400, duration: 0.5, ease: 'back.out(1.6)' }, 2.6);
  const rc = ctx.el(`<div class="abs" style="left:1250px;top:330px">${receipt({ added: 1, modified: 3 })}</div>`);
  gsap.set(rc, { xPercent: -50, scale: 1.2, transformOrigin: '50% 0' });
  tl.from(rc, { opacity: 0, y: 40, duration: 0.45, ease: 'power3.out' }, ctx.duration - 2.6);
  ctx.pose(b, 'done', ctx.duration - 2.5);
}
