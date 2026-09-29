// __ID__ __NAME__ — recipe: cards
// A bot on the left wired (animated cables) to a column of items, then a grid
// of feature cards pops on the right. Good for integrations, templates, lists.
// Edit ITEMS (left column) and CARDS (right grid).
import { ic, brand, MARKS } from '../ui.js';
import { L } from './common.js';

export default function scene(ctx) {
  const { tl, gsap } = ctx;
  const bot = ctx.meta.bots[0] ?? 'petal';
  tl.set(ctx.bg.params, { glow: 0.5, fx: 0.2, fy: 0.6 }, 0);

  const h = ctx.headline([{ t: ctx.T.text[0] }, ...(ctx.T.text[1] ? [{ t: ctx.T.text[1], cls: 'rb' }] : [])], { x: 110, y: 60, size: 88, align: 'left', valign: 'top' });
  ctx.wordsIn(h, 0.15);
  const b = ctx.bot(bot, { size: 250, x: 170, y: 470, state: 'tool', name: true });
  tl.from(b, { scale: 0, duration: 0.5, ease: 'back.out(2)' }, 0.2);

  const ITEMS = [
    [MARKS.Gmail(30), 'Gmail', '#ea4335'], [brand('Notion', 30), 'Notion', '#ffffff'], [brand('Figma', 30), 'Figma', '#a259ff'],
    [MARKS.Word(30), 'Word (.docx)', '#185abd'],
  ];
  const CX = 640, Y0 = 330, GAP = 110;
  const svg = ctx.el(`<svg class="abs" style="left:0;top:0;overflow:visible" width="1920" height="1080"></svg>`);
  ITEMS.forEach(([mark, name, color], i) => {
    const y = Y0 + i * GAP;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M400 600 C 520 600, ${CX - 140} ${y + 36}, ${CX} ${y + 36}`);
    Object.entries({ fill: 'none', stroke: color, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.8 }).forEach(([k, v]) => path.setAttribute(k, v));
    svg.appendChild(path);
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    tl.to(path, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' }, 0.8 + i * 0.28);
    const row = ctx.el(`<div class="abs card" style="left:${CX}px;top:${y}px;width:440px;height:72px;display:flex;align-items:center;gap:16px;padding:0 18px;font-size:23px;font-weight:600">
        <span style="width:44px;height:44px;border-radius:10px;background:var(--muted);display:flex;align-items:center;justify-content:center">${mark}</span>${name}
        <span class="ml-auto st" style="font-size:16px;color:var(--muted-foreground)">${ic('plug', '', 18)}</span></div>`);
    tl.from(row, { x: 60, opacity: 0, duration: 0.4 }, 0.5 + i * 0.12);
    ctx.swap(row.querySelector('.st'), `<span style="display:flex;align-items:center;gap:8px;color:#6ee7b7"><span class="dot-ok"></span>${L(ctx, 'เชื่อมแล้ว', 'Connected')}</span>`, 1.25 + i * 0.28);
  });

  const CARDS = [['file-text', L(ctx, 'ใบเสนอราคา', 'Quotation')], ['scroll-text', L(ctx, 'หนังสือราชการ', 'Official letter')], ['mail', L(ctx, 'อีเมลสุภาพ', 'Polite email')], ['messages-square', L(ctx, 'สรุปประชุม', 'Meeting notes')]];
  CARDS.forEach(([icon, title], i) => {
    const c = ctx.el(`<div class="abs card" style="left:${1170 + (i % 2) * 330}px;top:${Y0 + Math.floor(i / 2) * 200}px;width:310px;height:180px;padding:22px;display:flex;flex-direction:column;gap:10px">
        <span style="color:#c4b5fd">${ic(icon, '', 32)}</span><b style="font-size:30px">${title}</b></div>`);
    ctx.pop(c, 2.8 + i * 0.16, { y: 30 });
  });
  ctx.pose(b, 'working', 3.2);
  ctx.pose(b, 'done', ctx.duration - 1.6);
}
