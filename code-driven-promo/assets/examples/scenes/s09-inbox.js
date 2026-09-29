// S9 Inbox 63–71s — Lin fires three Cowork tasks with ⌘↵ and walks off to a
// meeting; the Inbox runs them in parallel (one Petal per task, folders locked).
import { ic, composer, modeTabs, inboxTask, taskIcon, pill, taskBody } from '../ui.js';
import { app, windowIn, person, L } from './common.js';

export default function s09(ctx) {
  const { tl, gsap } = ctx;
  tl.set(ctx.bg.params, { glow: 0.45, fx: 0.62, fy: 0.55 }, 0);

  const h = ctx.headline([{ t: ctx.T.text[0] }, { t: ctx.T.text[1], cls: 'dim', size: 46 }], { x: 80, y: 60, size: 90, align: 'left', valign: 'top', width: 520 });
  ctx.wordsIn(h, 0.1);
  const lin = person(ctx, { name: 'Lin', color: '#f7609f', line: L(ctx, 'สั่งงาน 3 อย่าง', 'fires 3 tasks'), x: 80, y: 330 });
  tl.from(lin, { opacity: 0, x: -30, duration: 0.4 }, 0.2);

  const TASKS = [
    { id: 'a', title: L(ctx, 'สรุปยอดขาย Q3 เป็นสไลด์', 'Turn Q3 sales into slides'), folder: '~/Clients/Acme', step: L(ctx, 'กำลังสร้าง Q3-summary.pptx', 'Building Q3-summary.pptx') },
    { id: 'b', title: L(ctx, 'ร่างอีเมลตอบลูกค้า 12 ฉบับ', 'Draft 12 client replies'), folder: '~/Mail/drafts', step: L(ctx, 'ส่งอีเมลเลยไหม หรือเก็บเป็นร่าง?', 'Send now, or keep as drafts?') },
    { id: 'c', title: L(ctx, 'แก้เทสที่พังใน pricing', 'Fix failing pricing tests'), folder: '~/Clients/Acme', step: L(ctx, 'รัน bun test · 36 tests', 'Running bun test · 36 tests') },
  ];

  // phase 1: composer in a Cowork chat
  const chatMain = `<div class="layer" style="display:flex;flex-direction:column;align-items:center;padding:30px 60px 24px;zoom:1.2">${modeTabs('cowork')}
    <div class="sent" style="margin-top:40px;width:100%;display:flex;flex-direction:column;gap:12px"></div>
    <div style="margin-top:auto;width:100%">${composer({ folder: '~/Clients/Acme', inbox: true, placeholder: L(ctx, 'สั่งงานแล้วกด ⌘↵ ส่งเข้า Inbox…', 'Type a task, ⌘↵ sends it to the Inbox…') })}</div></div>`;
  const win = app(ctx, { x: 640, y: 120, scale: 0.86, main: chatMain, active: 'cowork', more: true, chats: [{ title: 'Acme · Q3 report', on: true }] });
  windowIn(ctx, win, 0);
  const cpText = win.querySelector('.cp-text');
  const sent = win.querySelector('.sent');
  const inboxBtn = win.querySelector('.cp-inbox');
  const keys = ctx.el(`<div class="abs" style="left:1260px;top:420px;display:flex;gap:16px;transform:translateX(-50%);opacity:0"><kbd class="kbd-big">⌘</kbd><kbd class="kbd-big">↵</kbd></div>`);
  TASKS.forEach((t, i) => {
    const at = 0.35 + i * 0.75;
    ctx.call(() => { cpText.innerHTML = '<span class="cp-typed"></span>'; }, at - 0.01);
    tl.call(() => {}, null, at);
    const typed = () => cpText.querySelector('.cp-typed');
    // typewriter (grapheme-safe) via a proxy node swap
    const o = { n: 0 };
    const g = [...new Intl.Segmenter(ctx.lang, { granularity: 'grapheme' }).segment(t.title)].map((x) => x.segment);
    tl.to(o, { n: g.length, duration: 0.4, ease: 'none', onUpdate: () => { const n = typed(); if (n) n.textContent = g.slice(0, Math.round(o.n)).join(''); } }, at);
    tl.to(keys, { opacity: 1, duration: 0.08 }, at + 0.42);
    tl.to(keys.children, { y: 10, borderBottomWidth: 2, duration: 0.06, yoyo: true, repeat: 1 }, at + 0.46);
    tl.to(keys, { opacity: 0, duration: 0.1 }, at + 0.62);
    tl.to(inboxBtn, { backgroundColor: 'rgba(252,211,77,.3)', duration: 0.08, yoyo: true, repeat: 1 }, at + 0.48);
    const sentChip = ctx.el(`<div class="chip" style="align-self:flex-end;font-size:13px;padding:6px 12px">${ic('inbox', 'sz-3_5 c-amber')}<span>${L(ctx, 'ส่งเข้า Inbox', 'Sent to Inbox')} · ${t.title}</span></div>`, sent);
    tl.from(sentChip, { opacity: 0, y: 16, duration: 0.25 }, at + 0.5);
    ctx.call(() => { cpText.innerHTML = `<span class="cp-ph">${L(ctx, 'สั่งงานแล้วกด ⌘↵ ส่งเข้า Inbox…', 'Type a task, ⌘↵ sends it to the Inbox…')}</span>`; }, at + 0.55);
  });

  // Lin leaves for a meeting
  const meet = ctx.el(`<div class="abs chip" style="left:80px;top:440px;font-size:21px;padding:10px 18px">${ic('calendar', 'c-amber', 22)}${L(ctx, 'ไปประชุม 10:00 แล้ว', 'Off to the 10:00 meeting')} 🏃</div>`);
  tl.from(meet, { opacity: 0, y: 14, duration: 0.3 }, 2.6);
  tl.to(lin, { x: -40, opacity: 0.35, duration: 0.6 }, 2.9);

  // phase 2: the Inbox page
  const page = ctx.el(`<div class="page" style="opacity:0;background:var(--background);padding:28px 0;zoom:1.22"><div class="page-inner" style="width:900px">
      <header style="display:flex;justify-content:space-between;align-items:flex-start">
        <div><h2>Inbox</h2><p class="lead">Cowork tasks that run in the background while you keep working. Two tasks never change the same folder at once.</p></div>
        <div class="conc"><span>Tasks running at once</span><div class="conc-btns"><span>1</span><span class="on">2</span><span>3</span></div></div>
      </header>
      <nav class="filters"><span class="filter on">All <b>3</b></span><span class="filter">Needs you</span><span class="filter">To review</span><span class="filter">In progress</span><span class="filter">Finished</span></nav>
      <div class="list" style="display:flex;flex-direction:column;gap:12px">${TASKS.map((t) => inboxTask({ ...t, status: 'queued', time: L(ctx, 'เมื่อสักครู่', 'just now') })).join('')}</div>
    </div></div>`, win.querySelector('.aw-main'));
  ctx.call(() => {
    win.querySelectorAll('.sb-item.on, .sb-sub.on').forEach((e) => e.classList.remove('on'));
    win.querySelector('.sb-sub[data-id=inbox]').classList.add('on');
  }, 2.95);
  tl.to(page, { opacity: 1, duration: 0.3 }, 2.95);
  const cards = ctx.qa('.task', page);
  cards.forEach((c, i) => tl.from(c, { y: 30, opacity: 0, duration: 0.35, ease: 'power3.out' }, 3.05 + i * 0.1));

  const setStatus = (i, status, at) => {
    const c = cards[i];
    ctx.call(() => {
      c.querySelector('[data-slot=ico]').innerHTML = taskIcon(status);
      c.querySelector('[data-slot=pill]').innerHTML = pill(status);
      c.querySelector('[data-slot=body]').innerHTML = taskBody(status, TASKS[i].step);
      tl.data.dirty = true;
    }, at);
    tl.fromTo(c, { scale: 1 }, { keyframes: [{ scale: 1.02, duration: 0.1 }, { scale: 1, duration: 0.2 }], immediateRender: false }, at);
  };
  setStatus(0, 'running', 3.5);
  setStatus(1, 'running', 3.7);
  // task c waits: same folder as task a (lock)
  setStatus(1, 'needs-you', 5.0);
  setStatus(0, 'ready', 5.8);
  setStatus(2, 'running', 6.1);

  // one Petal per running task, parallel, with folder locks
  const petals = cards.map((c) => {
    c.style.position = 'relative';
    const p = ctx.bot('petal', { size: 92, x: 600, y: -14, state: 'working', parent: c });
    tl.set(p, { opacity: 0 }, 0);
    return p;
  });
  [[0, 3.5], [1, 3.7], [2, 6.1]].forEach(([i, at]) => tl.fromTo(petals[i], { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)', immediateRender: false }, at));
  ctx.pose(petals[1], 'permission', 5.0);
  ctx.pose(petals[0], 'done', 5.8);
  const lock = ctx.el(`<div class="abs chip" style="left:560px;top:22px;font-size:13px;padding:5px 10px;opacity:0">${ic('lock', 'c-amber', 14)}${L(ctx, 'รอโฟลเดอร์ว่าง · ~/Clients/Acme', 'folder locked · ~/Clients/Acme')}</div>`, cards[2]);
  tl.to(lock, { opacity: 1, duration: 0.2 }, 3.8);
  tl.to(lock, { opacity: 0, duration: 0.2 }, 5.9);
  const n3 = ctx.el(`<div class="abs glass" style="left:80px;top:540px;padding:18px 24px;font-size:26px;font-weight:600;display:flex;gap:12px;align-items:center">${ic('users', 'c-violet', 28)}${L(ctx, '3 ร่าง วิ่งขนานกัน', '3 agents in parallel')}</div>`);
  tl.from(n3, { opacity: 0, y: 20, duration: 0.35 }, 3.8);
}
