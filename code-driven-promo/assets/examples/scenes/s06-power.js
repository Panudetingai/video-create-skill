// S6 Power 39–47s — Petal plugs MCP connectors in; Thai work skills pop;
// a Thai .docx (TH Sarabun) comes out.
import { ic, MARKS, brand } from '../ui.js';
import { L } from './common.js';

export default function s06(ctx) {
  const { tl, gsap } = ctx;
  tl.set(ctx.bg.params, { glow: 0.5, fx: 0.2, fy: 0.6 }, 0);

  const h = ctx.headline([{ t: ctx.T.text[0] }, { t: ctx.T.text[1], cls: 'rb' }], { x: 110, y: 60, size: 88, align: 'left', valign: 'top' });
  ctx.wordsIn(h, 0.15);

  const petal = ctx.bot('petal', { size: 250, x: 170, y: 470, state: 'tool', name: 'Petal<small>Working</small>' });
  tl.from(petal, { scale: 0, duration: 0.5, ease: 'back.out(2)' }, 0.2);

  // connectors (Settings → Connectors) with cables from Petal
  const conns = [
    ['Gmail', MARKS.Gmail(30), 'Gmail', '#ea4335'],
    ['Notion', brand('Notion', 30), 'Notion', '#ffffff'],
    ['Figma', brand('Figma', 30), 'Figma', '#a259ff'],
    ['Playwright', MARKS.Playwright(30), 'Playwright', '#2ead33'],
    ['Word', MARKS.Word(30), 'Word (.docx)', '#185abd'],
  ];
  const CX = 640, Y0 = 330, GAP = 104;
  const svg = ctx.el(`<svg class="abs" style="left:0;top:0;overflow:visible" width="1920" height="1080"></svg>`);
  conns.forEach(([id, mark, name, color], i) => {
    const y = Y0 + i * GAP;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const sx = 400, sy = 600;
    path.setAttribute('d', `M${sx} ${sy} C ${sx + 120} ${sy}, ${CX - 140} ${y + 36}, ${CX} ${y + 36}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '4');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('opacity', '.8');
    svg.appendChild(path);
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    tl.to(path, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' }, 0.8 + i * 0.28);
    const row = ctx.el(`
      <div class="abs card" style="left:${CX}px;top:${y}px;width:440px;height:72px;display:flex;align-items:center;gap:16px;padding:0 18px;font-size:23px;font-weight:600">
        <span style="width:44px;height:44px;border-radius:10px;background:var(--muted);display:flex;align-items:center;justify-content:center">${mark}</span>${name}
        <span class="ml-auto st" style="display:flex;align-items:center;gap:8px;font-size:16px;font-weight:500;color:var(--muted-foreground)">${ic('plug', '', 18)}${L(ctx, 'เชื่อมต่อ', 'Connect')}</span>
      </div>`);
    tl.from(row, { x: 60, opacity: 0, duration: 0.4, ease: 'power3.out' }, 0.5 + i * 0.12);
    ctx.swap(row.querySelector('.st'), `<span class="dot-ok"></span><span style="color:#6ee7b7">${L(ctx, 'เชื่อมแล้ว', 'Connected')}</span>`, 1.25 + i * 0.28);
    tl.fromTo(row, { boxShadow: `0 0 0 0 ${color}00` }, { boxShadow: `0 0 0 3px ${color}aa`, duration: 0.15, yoyo: true, repeat: 1, immediateRender: false }, 1.25 + i * 0.28);
  });
  const mcpTag = ctx.el(`<div class="abs chip" style="left:${CX}px;top:${Y0 - 58}px;font-size:18px;padding:6px 14px">${ic('plug-zap', 'c-amber', 18)}MCP connectors</div>`);
  tl.from(mcpTag, { opacity: 0, duration: 0.3 }, 0.6);

  // Thai work skills
  const skills = [
    ['file-text', 'ใบเสนอราคา', 'Quotation', '/quotation'],
    ['scroll-text', 'หนังสือราชการ', 'Official letter', '/official-letter'],
    ['mail', 'อีเมลสุภาพ', 'Polite email', '/polite-email'],
    ['messages-square', 'สรุปประชุม', 'Meeting notes', '/meeting-notes'],
  ];
  const SX = 1170;
  const skTag = ctx.el(`<div class="abs chip" style="left:${SX}px;top:${Y0 - 58}px;font-size:18px;padding:6px 14px">${ic('book-open', 'c-violet', 18)}${L(ctx, 'สกิลงานไทย', 'Thai work skills')}</div>`);
  tl.from(skTag, { opacity: 0, duration: 0.3 }, 2.6);
  const cards = skills.map(([icon, th, en, slug], i) => {
    const x = SX + (i % 2) * 330, y = Y0 + Math.floor(i / 2) * 200;
    const c = ctx.el(`
      <div class="abs card" style="left:${x}px;top:${y}px;width:310px;height:180px;padding:22px;display:flex;flex-direction:column;gap:8px">
        <span style="display:flex;align-items:center;justify-content:space-between"><span style="color:#c4b5fd">${ic(icon, '', 32)}</span><span class="chip" style="font-size:13px">${ic('file-text', 'sz-3')}.docx</span></span>
        <b style="font:700 32px Sarabun">${th}</b>
        <span style="font-size:17px;color:var(--muted-foreground)">${en} · <code style="font:15px var(--font-mono)">${slug}</code></span>
      </div>`);
    ctx.pop(c, 2.8 + i * 0.16, { y: 30 });
    return c;
  });

  // generated Word document (TH Sarabun)
  const doc = ctx.el(`
    <div class="abs" style="left:1240px;top:250px;width:560px;height:700px;background:#fbfaf6;color:#1a1a1a;border-radius:6px;box-shadow:0 40px 90px rgba(0,0,0,.6);padding:46px 52px;font-family:Sarabun">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div><div style="font:800 34px Sarabun">ใบเสนอราคา</div><div style="font-size:16px;color:#555">เลขที่ QT-2026-0929 · วันที่ 29 ก.ย. 2569</div></div>
        <span style="background:#185abd;color:#fff;font:700 15px var(--font-en);padding:4px 8px;border-radius:4px">W</span>
      </div>
      <div style="margin-top:22px;font-size:17px;line-height:1.6">เรียน คุณสมชาย ใจดี<br>บริษัท แอคมี จำกัด</div>
      <table style="width:100%;margin-top:18px;border-collapse:collapse;font-size:16px">
        <tr style="background:#f0ede4"><th style="text-align:left;padding:8px">รายการ</th><th style="padding:8px">จำนวน</th><th style="text-align:right;padding:8px">ราคา (บาท)</th></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e2d9">ออกแบบเว็บไซต์</td><td style="text-align:center">1</td><td style="text-align:right;padding:8px">45,000.00</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e2d9">ดูแลระบบรายเดือน</td><td style="text-align:center">12</td><td style="text-align:right;padding:8px">36,000.00</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e2d9">ภาษีมูลค่าเพิ่ม 7%</td><td></td><td style="text-align:right;padding:8px">5,670.00</td></tr>
        <tr><td style="padding:8px;font-weight:700">รวมทั้งสิ้น</td><td></td><td style="text-align:right;padding:8px;font-weight:800">86,670.00</td></tr>
      </table>
      <div style="margin-top:16px;font-size:15px;color:#444">(แปดหมื่นหกพันหกร้อยเจ็ดสิบบาทถ้วน)</div>
      <div style="position:absolute;left:52px;right:52px;bottom:40px;display:flex;justify-content:space-between;font-size:14px;color:#777"><span>TH Sarabun New · 16pt</span><span>ใบเสนอราคา-แอคมี.docx</span></div>
    </div>`);
  tl.from(doc, { y: 500, rotation: 6, opacity: 0, duration: 0.7, ease: 'power3.out' }, 4.9);
  cards.forEach((c) => tl.to(c, { opacity: 0.25, duration: 0.4 }, 4.9));
  ctx.pose(petal, 'working', 4.6);
  ctx.pose(petal, 'done', 6.2);
}
