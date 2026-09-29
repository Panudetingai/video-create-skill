// S7 Speed 47–55s — ⌘K palette, smart empty state, completion confetti.
import { ic, commandPalette, suggestionCard, modeTabs, composer, receipt } from '../ui.js';
import { app, windowIn, L } from './common.js';

export default function s07(ctx) {
  const { tl, gsap } = ctx;
  tl.set(ctx.bg.params, { glow: 0.45, fx: 0.62, fy: 0.5 }, 0);

  // left column headline, lines arrive with the beats
  const h1 = ctx.headline([{ t: '⌘K' }], { x: 90, y: 210, size: 150, align: 'left', valign: 'top' });
  const h2 = ctx.headline([{ t: 'Smart suggest', cls: 'dim' }], { x: 94, y: 400, size: 60, align: 'left', valign: 'top' });
  const h3 = ctx.headline([{ t: ctx.th ? 'Completion!' : 'Delight', cls: 'rb' }], { x: 94, y: 490, size: 72, align: 'left', valign: 'top' });
  ctx.wordsIn(h1, 0.6); ctx.wordsIn(h2, 3.0); ctx.wordsIn(h3, 5.5);

  const main = `
    <div class="layer" style="display:flex;flex-direction:column;align-items:center;padding:36px 96px 28px">
      ${modeTabs('cowork')}
      <div class="empty" style="margin-top:88px;display:flex;flex-direction:column;align-items:center;gap:10px">
        <div style="font-size:30px;font-weight:600;letter-spacing:-.01em">${L(ctx, 'วันนี้ให้ช่วยอะไรใน Acme?', 'What should we do in Acme today?')}</div>
        <div class="scan c-mutedfg" style="font-size:14px;display:flex;align-items:center;gap:8px;height:22px"></div>
      </div>
      <div class="cards" style="margin-top:34px;display:flex;gap:16px;height:120px"></div>
      <div class="ml-auto" style="margin-top:auto;width:100%">${composer({ folder: '~/Clients/Acme', placeholder: L(ctx, 'สั่งงานในโฟลเดอร์นี้…', 'Ask Mali to work in this folder…') })}</div>
    </div>`;
  const win = app(ctx, { x: 620, y: 120, scale: 0.88, main, active: 'cowork', chats: [{ title: 'Acme · Q3 report', on: true }, { title: 'สรุปประชุมทีม' }, { title: 'Fix pricing tests' }] });
  windowIn(ctx, win, 0.05);

  // ⌘K
  const keys = ctx.el(`<div class="abs" style="left:1230px;top:470px;display:flex;gap:18px;transform:translateX(-50%)"><kbd class="kbd-big">⌘</kbd><kbd class="kbd-big">K</kbd></div>`);
  tl.from(keys, { opacity: 0, scale: 0.7, duration: 0.25, ease: 'back.out(2)' }, 0.55);
  tl.to(keys.children, { y: 10, borderBottomWidth: 2, duration: 0.08, yoyo: true, repeat: 1 }, 0.85);
  tl.to(keys, { opacity: 0, scale: 0.9, duration: 0.2 }, 1.15);

  const dim = ctx.el(`<div class="abs" style="left:620px;top:120px;width:${1440 * 0.88}px;height:${900 * 0.88}px;border-radius:11px;background:rgba(0,0,0,.5);opacity:0"></div>`);
  const pal = ctx.el(`<div class="abs" style="left:1276px;top:230px">${commandPalette({ th: ctx.th })}</div>`);
  gsap.set(pal, { xPercent: -50, scale: 1.25, transformOrigin: '50% 0' });
  tl.to(dim, { opacity: 1, duration: 0.2 }, 1.1);
  tl.from(pal, { opacity: 0, scale: 1.1, y: -10, duration: 0.25, ease: 'power3.out' }, 1.1);
  const items = ctx.qa('.cmdk-item, .cmdk-g', pal);
  items.forEach((it, i) => tl.from(it, { opacity: 0, x: -12, duration: 0.18 }, 1.2 + i * 0.03));
  const q = pal.querySelector('.cmdk-q');
  ctx.type(q, L(ctx, 'ใบเส', 'quot'), 1.7, 0.35);
  // filter: highlight the quotation skill
  const all = ctx.qa('.cmdk-item', pal);
  ctx.call(() => all.forEach((el) => el.classList.toggle('on', el.textContent.includes('ใบเสนอราคา'))), 2.1);
  tl.to(all.filter((el) => !el.textContent.includes('ใบเสนอราคา')), { opacity: 0.25, duration: 0.2 }, 2.1);
  const sora = ctx.bot('sora', { size: 130, x: 1590, y: 150, state: 'tool' });
  tl.from(sora, { scale: 0, duration: 0.35, ease: 'back.out(2)' }, 1.15);
  tl.to([pal, dim], { opacity: 0, duration: 0.2 }, 2.7);
  tl.to(sora, { x: -40, y: 560, scale: 0.8, duration: 0.5, ease: 'power2.inOut' }, 2.7);
  ctx.pose(sora, 'thinking', 2.8);

  // smart empty state: scanning folder names → 3 cards
  const scan = win.querySelector('.scan');
  const files = ['invoice-0925.pdf', 'Q3-report.xlsx', 'meeting-notes.md', 'contract-acme.pdf'];
  files.forEach((f, i) => ctx.swap(scan, `${ic('search', 'sz-3_5')}${L(ctx, 'กำลังดูชื่อไฟล์', 'Scanning file names')} · <code style="font:13px var(--font-mono)">${f}</code>`, 2.9 + i * 0.16));
  ctx.swap(scan, `${ic('sparkles', 'sz-3_5 c-amber')}${L(ctx, 'แนะนำจากไฟล์ในโฟลเดอร์นี้', 'Suggested from this folder')}`, 3.6);
  const cardsHost = win.querySelector('.cards');
  const sugg = [
    { icon: 'file-spreadsheet', title: L(ctx, 'สรุปยอดขาย Q3', 'Summarize Q3 sales'), desc: L(ctx, 'อ่าน Q3-report.xlsx แล้วทำสรุป 1 หน้า', 'Read Q3-report.xlsx into a one-page brief') },
    { icon: 'file-text', title: L(ctx, 'ออกใบเสนอราคา', 'Draft a quotation'), desc: L(ctx, 'ใช้สกิล /quotation จากข้อมูลลูกค้า', 'Use /quotation with the client details') },
    { icon: 'messages-square', title: L(ctx, 'สรุปประชุม + งานต่อ', 'Meeting notes → tasks'), desc: L(ctx, 'แตก meeting-notes.md เป็น to-do', 'Turn meeting-notes.md into to-dos') },
  ].map((s, i) => { const c = ctx.el(suggestionCard(s), cardsHost); ctx.pop(c, 3.65 + i * 0.12, { y: 24, from: 0.9 }); return c; });

  // pick a card → run → done
  const cur = ctx.cursor(1500, 1000);
  tl.to(cur, { opacity: 1, duration: 0.2 }, 3.9);
  const cardPos = (i) => [620 + (96 + i * 328 + 160 + 256) * 0.88, 120 + (48 + 36 + 30 + 88 + 90 + 34 + 60) * 0.88];
  ctx.move(cur, ...cardPos(0), 4.0, 0.5);
  ctx.click(cur, 4.6);
  tl.to(sugg[0], { borderColor: 'rgba(252,211,77,.8)', duration: 0.15 }, 4.6);
  tl.to(cur, { opacity: 0, duration: 0.2 }, 4.9);
  // work receipt pops over the window
  const rc = ctx.el(`<div class="abs" style="left:1276px;top:300px">${receipt({ added: 1, modified: 5, dur: '3m 02s', saved: '~1h 10m', plus: 184, minus: 29 })}</div>`);
  gsap.set(rc, { xPercent: -50, scale: 1.3, transformOrigin: '50% 0' });
  tl.from(rc, { opacity: 0, y: 40, duration: 0.45, ease: 'power3.out' }, 5.0);
  const banner = ctx.el(`<div class="abs glass" style="left:1276px;top:700px;transform:translateX(-50%);padding:18px 30px;display:flex;align-items:center;gap:16px;font-size:40px;font-weight:700;white-space:nowrap">
      ${ic('party-popper', 'c-amber', 44)}${L(ctx, 'แก้ 6 ไฟล์ใน 3 นาที', '6 files in 3 minutes')}</div>`);
  ctx.pop(banner, 5.4, { y: 30 });
  const momo = ctx.bot('momo', { size: 190, x: 1650, y: 640, state: 'idle', name: 'Momo<small>Celebrate</small>' });
  tl.from(momo, { y: 500, duration: 0.5, ease: 'back.out(1.5)' }, 5.1);
  ctx.pose(momo, 'done', 5.4);
  ctx.pose(momo, 'welcome', 6.8);
  ctx.confetti(1740, 700, 5.45, { count: 110, spread: 1400, up: 800 });
  ctx.pose(sora, 'done', 5.5);
}
