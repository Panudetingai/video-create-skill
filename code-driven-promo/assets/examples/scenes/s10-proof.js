// S10 Proof 71–79s — work receipt under the chat, the Outputs gallery, the
// Monday weekly recap. A camera pans across three panels.
import { ic, receipt, userMsg, brand } from '../ui.js';
import { L } from './common.js';

export default function s10(ctx) {
  const { tl, gsap } = ctx;
  tl.set(ctx.bg.params, { glow: 0.45, fx: 0.5, fy: 0.55 }, 0);

  const h = ctx.headline([{ t: ctx.T.text[0] }], { x: 90, y: 55, size: 80, align: 'left', valign: 'top' });
  ctx.wordsIn(h, 0.1);
  const h2 = ctx.headline([{ t: ctx.T.text[1], cls: 'amber' }], { x: 90, y: 150, size: 54, align: 'left', valign: 'top' });
  ctx.wordsIn(h2, 2.7);

  const strip = ctx.el(`<div class="abs" style="left:0;top:0;width:${1920 * 3}px;height:1080px"></div>`);

  // --- panel 1: chat + receipt
  const p1 = ctx.el(`<div class="abs" style="left:420px;top:250px;width:900px">
      ${userMsg(L(ctx, 'รวมใบแจ้งหนี้เดือนนี้เป็นไฟล์เดียว แล้วแก้ชื่อไฟล์ให้เป็นระบบ', 'Merge this month’s invoices into one file and rename them consistently'))}
      <div class="msg-ai" style="font-size:18px">${L(ctx, 'เสร็จแล้ว ✓ รวม 12 ไฟล์เป็น <code>invoices-2026-09.pdf</code> และตั้งชื่อใหม่ตามรูปแบบ <code>INV-YYYYMMDD-ลูกค้า</code>', 'Done ✓ merged 12 files into <code>invoices-2026-09.pdf</code> and renamed them as <code>INV-YYYYMMDD-client</code>')}</div>
      <div class="rc" style="margin-top:14px"></div></div>`, strip);
  gsap.set(p1, { scale: 1.35, transformOrigin: '0 0' });
  tl.from(p1.children[0], { opacity: 0, y: 20, duration: 0.3 }, 0.2);
  tl.from(p1.children[1], { opacity: 0, y: 20, duration: 0.3 }, 0.5);
  const rc = ctx.el(receipt({ added: 1, modified: 12, deleted: 0, dur: '2m 41s', cost: '$0.031', saved: '~50m', plus: 12, minus: 3, cmds: 4, tokens: '31,842', steps: 18 }), p1.querySelector('.rc'));
  rc.style.width = '900px';
  tl.from(rc, { opacity: 0, y: 40, scale: 0.96, duration: 0.45, ease: 'back.out(1.6)' }, 0.9);
  const vals = ctx.qa('.stat-v', rc);
  ctx.count(vals[0], 0, 1, 1.1, 0.5); ctx.count(vals[1], 0, 12, 1.1, 0.8);
  const nori = ctx.bot('nori', { size: 170, x: 1660, y: 640, state: 'idle', name: 'Nori<small>Receipt</small>', parent: strip });
  tl.from(nori, { y: 300, duration: 0.5, ease: 'back.out(1.6)' }, 0.6);
  ctx.pose(nori, 'done', 1.4);

  // --- panel 2: Outputs gallery
  const thumbs = [
    ['image', 'linear-gradient(135deg,#f5c518,#f0443a)', 'hero-banner.png', L(ctx, 'วันนี้ 10:42', 'Today 10:42')],
    ['file-text', '#fbfaf6', 'ใบเสนอราคา-แอคมี.docx', L(ctx, 'วันนี้ 10:15', 'Today 10:15')],
    ['file-code', '#0a0a08', 'pricing.ts', L(ctx, 'วันนี้ 09:58', 'Today 09:58')],
    ['file-spreadsheet', 'linear-gradient(135deg,#1d6f42,#34c77b)', 'Q3-summary.xlsx', L(ctx, 'วันนี้ 09:31', 'Today 09:31')],
    ['image', 'linear-gradient(135deg,#8b5cf6,#3aa3f5)', 'mascot-sticker.png', L(ctx, 'เมื่อวาน', 'Yesterday')],
    ['file-text', '#fbfaf6', 'สรุปประชุม-0928.md', L(ctx, 'เมื่อวาน', 'Yesterday')],
    ['file-image', 'linear-gradient(135deg,#f7609f,#ff9a2e)', 'social-post-3.png', L(ctx, 'เมื่อวาน', 'Yesterday')],
    ['file-code', '#0a0a08', 'report.py', L(ctx, 'เมื่อวาน', 'Yesterday')],
  ];
  const gal = ctx.el(`<div class="abs" style="left:${1920 + 560}px;top:250px;width:1240px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px"><span style="font-size:28px;font-weight:600">Outputs</span>
        <span class="chip" style="font-size:14px">${ic('files', 'sz-3_5')}${L(ctx, 'รูป · เอกสาร · โค้ด', 'Images · Docs · Code')}</span><span class="ml-auto c-mutedfg" style="font-size:16px">${L(ctx, 'เรียงตามเวลา', 'Sorted by time')}</span></div>
      <div class="g" style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px"></div></div>`, strip);
  const g = gal.querySelector('.g');
  thumbs.forEach(([icon, bgc, name, when], i) => {
    const code = bgc === '#0a0a08';
    const doc = bgc === '#fbfaf6';
    const c = ctx.el(`<div class="card" style="overflow:hidden;background:var(--card)">
        <div style="height:170px;background:${bgc};display:flex;align-items:center;justify-content:center;color:${doc ? '#999' : 'rgba(255,255,255,.9)'};position:relative">
          ${code ? `<pre style="margin:0;padding:14px;font:12px/1.5 var(--font-mono);color:#a7f3d0;position:absolute;inset:0">export function calcTotal(items) {\n  return items.reduce(\n    (s, i) => s + i.price * i.qty,\n  0)\n}</pre>` : doc ? `<div style="position:absolute;inset:18px 26px;display:flex;flex-direction:column;gap:9px">${'<i style="height:8px;border-radius:4px;background:#ddd"></i>'.repeat(6)}</div>` : ic(icon, '', 56)}
        </div>
        <div style="padding:10px 12px;display:flex;flex-direction:column;gap:2px"><b style="font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</b><span style="font-size:13px;color:var(--muted-foreground)">${when}</span></div></div>`, g);
    tl.from(c, { opacity: 0, y: 40, scale: 0.9, duration: 0.35, ease: 'back.out(1.6)' }, 2.95 + i * 0.07);
  });

  // --- panel 3: Weekly recap dialog
  const rec = ctx.el(`<div class="abs card" style="left:${3840 + 560}px;top:215px;width:680px;padding:26px;display:flex;flex-direction:column;gap:18px;background:var(--popover);box-shadow:0 30px 80px rgba(0,0,0,.6)">
      <div style="display:flex;align-items:center;gap:10px;font-size:20px;font-weight:600">${ic('zap', 'c-amber', 20)}${L(ctx, 'สรุปประจำสัปดาห์', 'Weekly recap')}<span class="ml-auto chip" style="font-size:14px">${ic('calendar', 'sz-3_5')}${L(ctx, 'จันทร์ 09:00', 'Mon 09:00')}</span></div>
      <div style="text-align:center;font-size:15px;color:var(--muted-foreground)">22 – 28 ${L(ctx, 'ก.ย.', 'Sep')} 2026</div>
      <section style="border-radius:18px;background:rgba(245,158,11,.07);padding:18px 22px;display:flex;flex-direction:column;gap:4px">
        <span style="font-size:14px;font-weight:500;color:#fbbf24">${L(ctx, 'เวลาที่ประหยัดได้ (ประมาณ)', 'Time saved (estimate)')}</span>
        <span style="font-size:60px;font-weight:650;letter-spacing:-.02em">~<span class="hrs">0h</span></span>
        <span style="font-size:15px;color:var(--muted-foreground)">23 ${L(ctx, 'งาน', 'tasks')} · 58 ${L(ctx, 'ไฟล์', 'files')} · 41 ${L(ctx, 'คำสั่ง', 'commands')}</span>
      </section>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">${[['Tasks', '23'], ['Files', '58'], ['Commands', '41'], ['Cost', '$1.84']].map(([k, v]) => `<div style="border-radius:12px;background:rgba(255,255,255,.05);padding:12px 14px"><div style="font-size:12px;color:var(--muted-foreground)">${k}</div><div style="font-size:22px;font-weight:600">${v}</div></div>`).join('')}</div>
      <div style="display:flex;flex-direction:column;gap:10px"><span style="font-size:13px;color:var(--muted-foreground)">Models</span>
        ${[['Claude', 'Claude Sonnet 4.5', 0.62], ['OpenAI', 'GPT-5', 0.25], ['Ollama', 'qwen3:8b · Local', 0.13]].map(([b, n, f]) => `<div style="display:flex;flex-direction:column;gap:6px"><div style="display:flex;align-items:center;gap:8px;font-size:15px">${brand(b, 16)}${n}<span class="ml-auto c-mutedfg" style="font-size:13px">${Math.round(f * 100)}%</span></div><div style="height:6px;border-radius:999px;background:var(--muted);overflow:hidden"><div class="bar" data-f="${f}" style="height:100%;width:0;border-radius:999px;background:rgba(255,255,255,.8)"></div></div></div>`).join('')}
      </div></div>`, strip);
  gsap.set(rec, { scale: 1.12, transformOrigin: '0 0' });
  tl.from(rec, { opacity: 0, y: 40, duration: 0.45, ease: 'power3.out' }, 5.25);
  ctx.count(rec.querySelector('.hrs'), 0, 400, 5.5, 1.3, (v) => `${Math.floor(v / 60)}h ${String(Math.round(v % 60)).padStart(2, '0')}m`);
  ctx.qa('.bar', rec).forEach((b, i) => tl.to(b, { width: `${+b.dataset.f * 100}%`, duration: 0.7, ease: 'power2.out' }, 5.7 + i * 0.1));
  const nori2 = ctx.bot('nori', { size: 170, x: 3840 + 1440, y: 660, state: 'done', parent: strip });
  ctx.pose(nori2, 'welcome', 6.2);

  // camera
  tl.to(strip, { x: -1920, duration: 0.7, ease: 'power3.inOut' }, 2.4);
  tl.to(strip, { x: -3840, duration: 0.7, ease: 'power3.inOut' }, 4.9);
}
