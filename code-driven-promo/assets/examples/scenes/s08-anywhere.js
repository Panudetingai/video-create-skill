// S8 Anywhere 55–63s — Kai in Chrome: select text, ⌥⌘M, the Quick bar
// appears in 150ms, summarize, capture an error, paste back / open in Mali.
import { ic, quickBar } from '../ui.js';
import { person, L } from './common.js';

export default function s08(ctx) {
  const { tl, gsap } = ctx;
  tl.set(ctx.bg.params, { glow: 0.35, fx: 0.5, fy: 0.4 }, 0);

  const h = ctx.headline([{ t: ctx.T.text[0] }, { t: ctx.T.text[1], cls: 'dim', size: 44 }], { x: 90, y: 50, size: 84, align: 'left', valign: 'top' });
  ctx.wordsIn(h, 0.1);

  // a generic browser window
  const B = { x: 70, y: 250, w: 1080, h: 690 };
  const browser = ctx.el(`
  <div class="abs card" style="left:${B.x}px;top:${B.y}px;width:${B.w}px;height:${B.h}px;overflow:hidden;background:#f7f6f2;color:#1f1f1f;border:0">
    <div style="height:44px;background:#dfe3ea;display:flex;align-items:flex-end;gap:8px;padding:0 12px">
      <i style="width:12px;height:12px;border-radius:50%;background:#ff5f57;align-self:center"></i><i style="width:12px;height:12px;border-radius:50%;background:#febc2e;align-self:center"></i><i style="width:12px;height:12px;border-radius:50%;background:#28c840;align-self:center"></i>
      <span style="margin-left:14px;height:34px;padding:0 16px;border-radius:10px 10px 0 0;background:#fff;display:flex;align-items:center;gap:8px;font-size:14px">${ic('globe', 'sz-3_5')}${L(ctx, 'รายงานเศรษฐกิจดิจิทัล 2026', 'Digital economy report 2026')}</span>
    </div>
    <div style="height:46px;background:#fff;display:flex;align-items:center;padding:0 14px;border-bottom:1px solid #e3e3e3">
      <span style="flex:1;height:32px;border-radius:999px;background:#f0f2f5;display:flex;align-items:center;padding:0 14px;font-size:14px;color:#555">${ic('lock', 'sz-3_5')}&nbsp; news.example.com/digital-economy-2026</span>
    </div>
    <div style="padding:34px 80px;font-family:Sarabun,var(--font-en)">
      <div style="font:800 36px Sarabun;line-height:1.25">${L(ctx, 'ธุรกิจไทยหันมาใช้ AI บนเครื่องมากขึ้น 3 เท่า', 'Thai businesses triple their use of on-device AI')}</div>
      <div style="margin-top:8px;font-size:16px;color:#666">29 ${L(ctx, 'ก.ย.', 'Sep')} 2026 · 6 min read</div>
      <p class="para" style="position:relative;margin-top:22px;font-size:21px;line-height:1.75;color:#333">
        <span class="sel" style="position:absolute;left:-4px;top:2px;height:calc(100% - 4px);width:0;background:rgba(59,130,246,.28);border-radius:4px"></span>
        ${L(ctx,
          'ผลสำรวจล่าสุดพบว่าองค์กรขนาดกลางและเล็กกว่า 62% เลือกใช้ผู้ช่วย AI ที่ทำงานบนเครื่องของตัวเอง เพื่อลดความเสี่ยงเรื่องข้อมูลรั่วไหล ในขณะที่ค่าใช้จ่ายด้านคลาวด์ลดลงเฉลี่ย 28% และเวลาทำเอกสารลดลงเกือบครึ่ง',
          'A new survey finds 62% of small and mid-size firms now run AI assistants on their own machines to cut data-leak risk, while cloud spend fell 28% on average and document work time dropped by almost half.')}
      </p>
      <p style="margin-top:14px;font-size:21px;line-height:1.75;color:#333">${L(ctx, 'นักวิเคราะห์คาดว่าแนวโน้มนี้จะเร่งตัวขึ้นในปีหน้า…', 'Analysts expect the trend to speed up next year…')}</p>
      <div class="err" style="margin-top:18px;width:560px;border:1px solid #f3b4b4;background:#fff1f1;border-radius:10px;padding:12px 16px;font:14px var(--font-mono);color:#b42318">⚠ Uncaught TypeError: chart.render is not a function<br><span style="color:#777">at dashboard.js:118</span></div>
    </div>
  </div>`);
  tl.from(browser, { opacity: 0, y: 30, duration: 0.5, ease: 'power3.out' }, 0);
  const kai = person(ctx, { name: 'Kai', color: '#8fd0ff', line: L(ctx, 'อ่านข่าวใน Chrome', 'reading in Chrome'), x: 820, y: 150 });
  tl.from(kai, { opacity: 0, x: 30, duration: 0.4 }, 0.3);

  // select the paragraph
  const sel = browser.querySelector('.sel');
  const cur = ctx.cursor(260, 560);
  tl.to(cur, { opacity: 1, duration: 0.2 }, 0.5);
  tl.to(sel, { width: 'calc(100% + 8px)', duration: 0.7, ease: 'power1.inOut' }, 0.8);
  ctx.move(cur, 1060, 640, 0.8, 0.7, 'power1.inOut');

  // ⌥⌘M
  const keys = ctx.el(`<div class="abs" style="left:610px;top:420px;display:flex;gap:16px;transform:translateX(-50%)"><kbd class="kbd-big">⌥</kbd><kbd class="kbd-big">⌘</kbd><kbd class="kbd-big">M</kbd></div>`);
  tl.from(keys, { opacity: 0, scale: 0.7, duration: 0.2, ease: 'back.out(2)' }, 1.5);
  tl.to(keys.children, { y: 10, borderBottomWidth: 2, duration: 0.07, yoyo: true, repeat: 1, stagger: 0.05 }, 1.75);
  tl.to(keys, { opacity: 0, duration: 0.15 }, 2.05);

  // Quick bar pops in 150 ms
  const selText = L(ctx, 'ผลสำรวจล่าสุดพบว่าองค์กรขนาดกลางและเล็กกว่า 62%…', 'A new survey finds 62% of small and mid-size firms…');
  const QX = 880, QY = 330, QS = 1.28;
  const qb = ctx.el(`<div class="abs" style="left:${QX}px;top:${QY}px">${quickBar({ th: ctx.th, selection: selText })}</div>`);
  gsap.set(qb, { scale: QS, transformOrigin: '0 0' });
  const ans = qb.querySelector('[data-slot=answer]');
  const bullets = ctx.th
    ? ['SME 62% ใช้ AI บนเครื่อง ลดเสี่ยงข้อมูลรั่ว', 'ค่าคลาวด์ลดเฉลี่ย 28%', 'ทำเอกสารเร็วขึ้นเกือบ 2 เท่า']
    : ['62% of SMEs run AI on-device', 'Cloud spend down 28%', 'Docs done ~2× faster'];
  ans.innerHTML = `<ul>${bullets.map(() => `<li><span class="b">&nbsp;</span></li>`).join('')}</ul>`;
  // measure targets before any tween touches the bar
  const scanBtn = ctx.pos(qb.querySelector('[data-slot=scan]'));
  const acts = ctx.qa('.qb-act', qb);
  const actPos = acts.map((a) => ctx.pos(a));
  const errPos = ctx.pos(browser.querySelector('.err'));
  errPos.y -= gsap.getProperty(browser, 'y'); // undo the browser's entrance offset

  tl.from(qb, { opacity: 0, scale: QS * 0.8, duration: 0.15, ease: 'power2.out' }, 1.95);
  const ms = ctx.el(`<div class="abs chip" style="left:${QX + 560}px;top:${QY - 56}px;font-size:20px;padding:6px 14px">${ic('zap', 'c-amber', 20)}150 ms</div>`);
  tl.from(ms, { opacity: 0, y: 10, duration: 0.2 }, 2.1);
  const sora = ctx.bot('sora', { size: 130, x: QX - 60, y: QY - 110, state: 'tool' });
  tl.from(sora, { scale: 0, duration: 0.3, ease: 'back.out(2)' }, 2.0);

  const chipSum = qb.querySelector('[data-chip=sum]');
  ctx.call(() => chipSum.classList.add('on'), 2.4);
  ctx.qa('.b', ans).forEach((el, i) => ctx.type(el, bullets[i], 2.6 + i * 0.45, 0.4));
  ctx.pose(sora, 'working', 2.5);

  // capture the error on screen
  ctx.move(cur, scanBtn.cx - 6, scanBtn.cy - 4, 3.6, 0.4);
  ctx.click(cur, 4.0);
  const shade = ctx.el(`<div class="layer" style="background:rgba(0,0,0,.45);opacity:0"></div>`);
  const box = ctx.el(`<div class="abs" style="left:${errPos.x - 10}px;top:${errPos.y - 10}px;width:${errPos.w + 20}px;height:${errPos.h + 20}px;border:3px dashed #fbbf24;border-radius:12px;opacity:0"></div>`);
  tl.to(shade, { opacity: 1, duration: 0.2 }, 4.1);
  tl.to(box, { opacity: 1, duration: 0.1 }, 4.2);
  tl.fromTo(box, { scale: 1.6 }, { scale: 1, duration: 0.35, ease: 'power3.out', immediateRender: false }, 4.2);
  tl.to([shade, box], { opacity: 0, duration: 0.2 }, 4.9);
  const thumb = ctx.el(`<div class="abs chip" style="left:${QX}px;top:${actPos[0].y + actPos[0].h + 20}px;font-size:18px;padding:8px 14px;opacity:0">${ic('image', 'c-amber', 18)}${L(ctx, 'แคปจอแล้ว', 'Screenshot attached')} · TypeError · dashboard.js:118</div>`);
  tl.to(thumb, { opacity: 1, duration: 0.2 }, 5.0);
  ctx.pose(sora, 'done', 5.2);

  // actions flash in order, then Open in Mali
  acts.forEach((a, i) => tl.to(a, { backgroundColor: 'rgba(252,211,77,.22)', borderColor: 'rgba(252,211,77,.8)', duration: 0.15, yoyo: i < 2, repeat: i < 2 ? 1 : 0 }, 5.4 + i * 0.4));
  ctx.move(cur, actPos[2].cx, actPos[2].cy, 5.8, 0.45);
  ctx.click(cur, 6.35);
  tl.to(qb, { scale: QS * 0.8, opacity: 0, x: 200, duration: 0.35, ease: 'power2.in' }, 6.8);
  tl.to([thumb, ms], { opacity: 0, duration: 0.2 }, 6.8);
}
