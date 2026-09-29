// S3 Modes 15–23s — Chat / Cowork / Code, each with its own permission scope.
import { ic, modeTabs, userMsg, stepRow, brand } from '../ui.js';
import { L } from './common.js';

export default function s03(ctx) {
  const { tl, gsap } = ctx;
  tl.set(ctx.bg.params, { glow: 0.45, fy: 0.3 }, 0);

  // the real mode switch, blown up
  const tabs = ctx.el(`<div class="abs" style="left:960px;top:70px">${modeTabs('chat')}</div>`);
  gsap.set(tabs, { xPercent: -50, scale: 2, transformOrigin: '50% 0' });
  tl.from(tabs, { y: -60, opacity: 0, duration: 0.5, ease: 'power3.out' }, 0.1);
  const sub = ctx.el(`<div class="abs eyebrow" style="left:960px;top:176px;transform:translateX(-50%);font-size:26px;letter-spacing:.04em;text-transform:none">${ctx.T.text[1]}</div>`);
  tl.from(sub, { opacity: 0, y: 10, duration: 0.4 }, 0.5);

  const W = 540, H = 600, Y = 250;
  const xs = [105, 690, 1275];
  const panel = (i, head, scope, scopeIcon, body) => ctx.el(`
    <div class="abs card panel" style="left:${xs[i]}px;top:${Y}px;width:${W}px;height:${H}px;overflow:hidden;background:var(--background)">
      <div style="display:flex;align-items:center;gap:10px;height:56px;padding:0 18px;border-bottom:1px solid var(--border);font-size:20px;font-weight:600">${head}
        <span class="ml-auto chip" style="font-size:14px;padding:5px 10px">${ic(scopeIcon, 'sz-3_5')}${scope}</span></div>
      <div class="pbody" style="position:relative;padding:12px 14px;font-size:16px;zoom:1.3">${body}</div>
    </div>`);

  const chat = panel(0, `${ic('message-square', 'sz-5')}Chat`, L(ctx, 'ไม่แตะไฟล์', 'No file access'), 'folder-lock', `
    ${userMsg(L(ctx, 'สรุป PDF สัญญานี้ให้หน่อย 3 ข้อ', 'Summarize this contract PDF in 3 points'))}
    <div class="msg-ai chat-markdown ans" style="font-size:16px">
      <p>${L(ctx, 'ได้เลย สรุปสั้น ๆ:', 'Sure — the short version:')}</p>
      <ul style="margin:0;padding-left:1.2em;line-height:1.7">
        <li>${L(ctx, 'ระยะสัญญา 12 เดือน ต่ออายุอัตโนมัติ', '12-month term, auto-renews')}</li>
        <li>${L(ctx, 'ชำระเงินภายใน 30 วัน', 'Payment due in 30 days')}</li>
        <li>${L(ctx, 'ยกเลิกได้ แจ้งล่วงหน้า 60 วัน', 'Cancel with 60 days notice')}</li>
      </ul>
    </div>`);
  const cowork = panel(1, `${ic('sparkles', 'sz-5')}Cowork`, '~/Clients/Acme', 'folder', `
    <div class="steps" style="font-size:14px">
      <div class="steps-h"><span class="spin">${ic('loader', 'sz-3_5')}</span><b>${L(ctx, 'กำลังทำงาน', 'Working')}</b><span class="c-mutedfg">· 5 steps</span></div>
      ${stepRow({ state: 'done', icon: 'folder-open', verb: 'Read', target: 'invoices/2026-09/*.pdf', time: '0.8s' })}
      ${stepRow({ state: 'done', icon: 'file-spreadsheet', verb: 'Create', target: 'summary-sep.xlsx', time: '2.1s' })}
      ${stepRow({ state: 'done', icon: 'file-pen', verb: 'Edit', target: 'report/Q3.docx', time: '1.4s' })}
      ${stepRow({ state: 'running', icon: 'file-pen', verb: 'Edit', target: 'README.md', time: '' })}
      ${stepRow({ state: 'todo', icon: 'mail', verb: 'Draft', target: 'email-to-client.md', time: '' })}
    </div>`);
  const code = panel(2, `${ic('code-xml', 'sz-5')}Code`, L(ctx, 'repo + terminal', 'repo + terminal'), 'terminal', `
    <div class="term" style="font-size:14px;height:250px">
      <div><span class="p">➜</span> <span class="y">acme-api</span> bun test</div>
      <div class="m tl1">  pricing.test.ts ........ <span class="p">✓ 14</span></div>
      <div class="m tl2">  auth.test.ts ........... <span class="p">✓ 22</span></div>
      <div class="tl3"><span class="p">✓ 36 passed</span> <span class="m">(1.2s)</span></div>
      <div class="tl4"><span class="p">➜</span> <span class="y">acme-api</span> git commit -m "fix: totals"</div>
    </div>`);

  const panels = [chat, cowork, code];
  panels.forEach((p, i) => tl.from(p, { y: 120, opacity: 0, duration: 0.6, ease: 'power3.out' }, 0.25 + i * 0.1));

  // bots on their panels
  const sora = ctx.bot('sora', { size: 150, x: xs[0] + W - 150, y: Y + H - 130, state: 'idle' });
  const petal = ctx.bot('petal', { size: 150, x: xs[1] + W - 150, y: Y + H - 130, state: 'working' });
  const nori = ctx.bot('nori', { size: 150, x: xs[2] + W - 150, y: Y + H - 130, state: 'tool' });
  [sora, petal, nori].forEach((b, i) => tl.from(b, { scale: 0, duration: 0.5, ease: 'back.out(2)' }, 0.6 + i * 0.12));

  // progressive reveals in panels
  tl.from(chat.querySelector('.ans'), { opacity: 0, y: 20, duration: 0.5 }, 1.6);
  ctx.qa('.step', cowork).forEach((s, i) => tl.from(s, { opacity: 0, x: -20, duration: 0.3 }, 3.2 + i * 0.18));
  ['.tl1', '.tl2', '.tl3', '.tl4'].forEach((c, i) => tl.from(code.querySelector(c), { opacity: 0, duration: 0.15 }, 5.4 + i * 0.25));

  // cursor clicks through the tabs: spotlight the matching panel
  const cur = ctx.cursor(960, 900);
  tl.to(cur, { opacity: 1, duration: 0.2 }, 0.6);
  const tabX = (i) => 960 + (i - 1) * 205 - 40, tabY = 105;
  const spot = (i, at) => {
    panels.forEach((p, j) => tl.to(p, { opacity: j === i ? 1 : 0.35, scale: j === i ? 1.03 : 0.98, borderColor: j === i ? 'rgba(252,211,77,.7)' : 'rgba(255,255,255,.1)', duration: 0.35 }, at));
    [sora, petal, nori].forEach((b, j) => tl.to(b, { opacity: j === i ? 1 : 0.35, duration: 0.35 }, at));
    ctx.qa('.mt', tabs).forEach((t, j) => ctx.call(() => t.classList.toggle('on', j === i), at));
  };
  [[0, 0.9], [1, 2.9], [2, 5.0]].forEach(([i, at]) => {
    ctx.move(cur, tabX(i), tabY, at - 0.5, 0.45);
    ctx.click(cur, at);
    spot(i, at);
  });
  ctx.pose(sora, 'thinking', 0.9);
  ctx.pose(sora, 'idle', 2.6);
  // all three together at the end
  tl.to(cur, { opacity: 0, duration: 0.2 }, 6.5);
  panels.forEach((p) => tl.to(p, { opacity: 1, scale: 1, borderColor: 'rgba(255,255,255,.1)', duration: 0.4 }, 6.6));
  [sora, petal, nori].forEach((b) => tl.to(b, { opacity: 1, duration: 0.4 }, 6.6));
  ctx.pose(nori, 'done', 6.4);
}
