// S1 Hook 0–7s — "งานล้น?" A grey, messy desktop; Mochi knocks on the glass
// and the world turns yellow.
import { ic } from '../ui.js';
import { L } from './common.js';

const FILES = [
  ['final_v3_REAL.docx', '#185abd', 'W'], ['budget(1).xlsx', '#1d6f42', 'X'], ['IMG_2331.png', '#8b5cf6', 'IMG'],
  ['สัญญา-แก้ล่าสุด.pdf', '#e5322d', 'PDF'], ['bug-report.txt', '#6b7280', 'TXT'], ['export (4).csv', '#1d6f42', 'CSV'],
  ['Screen Shot 11.42.png', '#8b5cf6', 'IMG'], ['ใบเสนอราคา_old.docx', '#185abd', 'W'], ['backup.zip', '#a16207', 'ZIP'],
  ['notes-meeting.md', '#6b7280', 'MD'], ['invoice_0925.pdf', '#e5322d', 'PDF'], ['untitled folder', '#3aa3f5', '▣'],
  ['deck_FINAL_final.pptx', '#c43e1c', 'P'], ['data-clean?.xlsx', '#1d6f42', 'X'],
];

export default function s01(ctx) {
  const { tl, gsap, th } = ctx;
  tl.set(ctx.bg.params, { gray: 1, glow: 0.25, grid: 0.6 }, 0);

  const desk = ctx.el(`<div class="layer" style="filter:grayscale(1) brightness(.8)"></div>`);

  // Downloads window (Finder-like, neutral)
  const finder = ctx.el(`
  <div class="abs card" style="left:150px;top:330px;width:1000px;height:560px;overflow:hidden;background:#1b1b18">
    <div style="height:46px;display:flex;align-items:center;gap:8px;padding:0 16px;border-bottom:1px solid var(--border)">
      <i style="width:12px;height:12px;border-radius:50%;background:#ff5f57"></i><i style="width:12px;height:12px;border-radius:50%;background:#febc2e"></i><i style="width:12px;height:12px;border-radius:50%;background:#28c840"></i>
      <span style="margin-left:14px;display:flex;align-items:center;gap:8px;font-weight:600;font-size:16px">${ic('download', 'sz-4')}Downloads</span>
      <span style="margin-left:auto;color:var(--muted-foreground);font-size:14px">${ic('search', 'sz-4')}</span>
    </div>
    <div class="files" style="position:relative;height:594px"></div>
  </div>`, desk);
  const grid = finder.querySelector('.files');
  const r = ctx.rand;
  FILES.forEach(([name, color, badge], i) => {
    const col = i % 5, row = Math.floor(i / 5);
    const x = 30 + col * 190 + (r() - 0.5) * 50, y = 20 + row * 165 + (r() - 0.5) * 40;
    const f = ctx.el(`
      <div class="abs" style="left:${x}px;top:${y}px;width:150px;display:flex;flex-direction:column;align-items:center;gap:8px">
        <div style="width:84px;height:104px;border-radius:8px;background:#e9e7df;position:relative;box-shadow:0 6px 14px rgba(0,0,0,.35)">
          <span style="position:absolute;left:-8px;bottom:14px;padding:3px 7px;border-radius:5px;background:${color};color:#fff;font:700 14px var(--font-en)">${badge}</span>
        </div>
        <span style="font-size:14px;text-align:center;line-height:1.25;color:#ddd">${name}</span>
      </div>`, grid);
    gsap.set(f, { rotation: (r() - 0.5) * 16 });
    tl.from(f, { y: -700, rotation: (r() - 0.5) * 90, opacity: 0, duration: 0.7, ease: 'bounce.out' }, 0.05 + i * 0.09);
  });

  // Terminal with red errors
  const term = ctx.el(`
  <div class="abs term" style="left:1000px;top:600px;width:620px;height:250px;box-shadow:0 20px 50px rgba(0,0,0,.5)">
    <div><span class="p">➜</span> <span class="y">~/app</span> npm run build</div>
    <div class="e">✖ ERROR  TypeError: Cannot read properties of undefined</div>
    <div class="e">✖ 14 tests failed · src/pricing.test.ts</div>
    <div class="m">  at calcTotal (src/pricing.ts:42:17)</div>
    <div><span class="p">➜</span> <span class="y">~/app</span> <span class="caret" style="opacity:1;background:#d6d3c7"></span></div>
  </div>`, desk);
  tl.from(term, { x: 200, opacity: 0, duration: 0.5, ease: 'power3.out' }, 1.0);

  // Notifications stacking top-right
  const notes = [
    ['mail', '#3aa3f5', 'Mail', L(ctx, '128 ฉบับยังไม่อ่าน', '128 unread emails')],
    ['circle-alert', '#f0443a', 'CI', L(ctx, 'Build ล้มเหลว · main', 'Build failed · main')],
    ['message-square', '#f7609f', 'Slack', L(ctx, '@you ด่วน!! ลูกค้ารอ', '@you urgent!! client waiting')],
    ['calendar', '#f5c518', L(ctx, 'ปฏิทิน', 'Calendar'), L(ctx, 'ประชุมอีก 5 นาที', 'Meeting in 5 min')],
  ];
  notes.forEach(([icon, color, app, text], i) => {
    const n = ctx.el(`
      <div class="abs glass" style="left:1290px;top:${90 + i * 98}px;width:500px;padding:14px 18px;display:flex;gap:14px;align-items:center;border-radius:16px">
        <span style="width:44px;height:44px;border-radius:10px;background:${color};display:flex;align-items:center;justify-content:center;color:#fff">${ic(icon, '', 24)}</span>
        <span style="display:flex;flex-direction:column;line-height:1.3"><b style="font-size:18px">${app}</b><span style="font-size:18px;color:#ccc">${text}</span></span>
        <span style="margin-left:auto;align-self:flex-start;font-size:13px;color:#999">now</span>
      </div>`, desk);
    tl.from(n, { x: 560, duration: 0.45, ease: 'power3.out' }, 0.9 + i * 0.35);
  });

  // "sigh"
  const sigh = ctx.el(`<div class="abs" style="left:1180px;top:880px;font:italic 600 38px var(--font-app);color:#aaa">${L(ctx, 'เฮ้อ…', 'Ugh…')} 😮‍💨</div>`, desk);
  tl.from(sigh, { opacity: 0, y: 20, duration: 0.5 }, 2.2);
  tl.to(sigh, { opacity: 0, duration: 0.3 }, 3.6);

  // overwhelm shake
  tl.to(desk, { keyframes: [{ x: -8 }, { x: 7 }, { x: -5 }, { x: 3 }, { x: 0 }], duration: 0.45, ease: 'none' }, 2.0);

  // Headline 1
  const h1 = ctx.headline([{ t: ctx.T.text[0] }], { x: 110, y: 60, size: 110, align: 'left', valign: 'top' });
  ctx.wordsIn(h1, 1.6);

  // Glass pane + Mochi knocking
  const glass = ctx.el(`<div class="layer"></div>`);
  const mochi = ctx.bot('mochi', { size: 340, x: 1920, y: 560, state: 'thinking', shadow: false, parent: glass });
  tl.to(mochi, { x: -420, duration: 0.9, ease: 'back.out(1.4)' }, 3.0);
  // knock-knock
  tl.to(mochi, { keyframes: [{ x: -380, duration: 0.12 }, { x: -420, duration: 0.14 }, { x: -380, duration: 0.12 }, { x: -420, duration: 0.14 }], ease: 'power1.inOut' }, 4.0);
  for (const [k, at] of [[0, 4.12], [1, 4.38]]) {
    const ring = ctx.el(`<div class="abs" style="left:1430px;top:${690 + k * 30}px;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;border:4px solid #fff;opacity:0"></div>`, glass);
    tl.fromTo(ring, { scale: 0.2, opacity: 0.9 }, { scale: 1.8, opacity: 0, duration: 0.6, ease: 'power2.out', immediateRender: false }, at);
  }
  // colour returns
  tl.to(desk, { filter: 'grayscale(0) brightness(1)', duration: 0.9, ease: 'power2.out' }, 4.4);
  tl.to(ctx.bg.params, { gray: 0, glow: 0.7, duration: 1.0 }, 4.4);
  ctx.pose(mochi, 'welcome', 4.6);
  // everything messy slides back a little, calmer
  tl.to(desk, { scale: 0.92, x: -40, opacity: 0.55, duration: 1.2, ease: 'power2.inOut', transformOrigin: '40% 50%' }, 4.6);

  const h2 = ctx.headline([{ t: ctx.T.text[1], cls: 'amber' }], { x: 110, y: th ? 195 : 180, size: 110, align: 'left', valign: 'top' });
  ctx.wordsIn(h2, 4.8, { stagger: 0.08 });
}
