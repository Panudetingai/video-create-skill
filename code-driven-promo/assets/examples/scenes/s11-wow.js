// S11 Wow 79–86s — Agent Arena (Codex vs Claude race, pick the winner with a
// checkpoint first) + Thai-first voice: Som speaks Thai, subtitles TH/EN.
import { ic, brand, diff } from '../ui.js';
import { person, L } from './common.js';

export default function s11(ctx) {
  const { tl, gsap } = ctx;
  tl.set(ctx.bg.params, { glow: 0.7, fx: 0.35, fy: 0.5, ring: 0 }, 0);

  const h = ctx.headline([{ t: ctx.T.text[0], cls: 'rb' }, { t: ctx.T.text[1], size: 60 }], { x: 1540, y: 70, size: 92, align: 'center', valign: 'top' });
  ctx.wordsIn(h, 0.1);

  const dan = person(ctx, { name: 'Dan', color: '#ffa447', line: L(ctx, '“refactor auth.ts ให้หน่อย”', '“refactor auth.ts”'), x: 80, y: 60 });
  tl.from(dan, { opacity: 0, x: -30, duration: 0.35 }, 0.1);

  const col = (x, b, name, color) => ctx.el(`
    <div class="abs card arena" style="left:${x}px;top:180px;width:520px;height:540px;padding:18px;display:flex;flex-direction:column;gap:12px;background:var(--background)">
      <div style="display:flex;align-items:center;gap:10px;font-size:22px;font-weight:600">${brand(b, 26)}${name}<span class="ml-auto time" style="font:500 17px var(--font-mono);color:var(--muted-foreground)">0.0s</span></div>
      <div style="height:8px;border-radius:999px;background:var(--muted);overflow:hidden"><div class="prog" style="height:100%;width:0;background:${color};border-radius:999px"></div></div>
      <div class="d" style="zoom:1.22"></div>
      <div class="res" style="margin-top:auto;display:flex;align-items:center;gap:10px;font-size:17px;color:var(--muted-foreground);opacity:0"></div>
    </div>`);
  const A = col(80, 'Codex', 'Codex', '#3aa3f5');
  const B = col(620, 'Claude', 'Claude', '#d97757');
  tl.from([A, B], { y: 60, opacity: 0, duration: 0.45, stagger: 0.1, ease: 'power3.out' }, 0.2);
  A.querySelector('.d').innerHTML = diff({ file: 'src/auth.ts', lines: [' export async function login(u, p) {', '-  const user = db.find(u)', '-  if (user.pass == p) return token(user)', '+  const user = await users.byEmail(u)', '+  if (!user) throw new AuthError()', '+  return verify(user, p) && token(user)', ' }'] });
  B.querySelector('.d').innerHTML = diff({ file: 'src/auth.ts', lines: [' export async function login(email, pass) {', '-  const user = db.find(email)', '-  if (user.pass == pass) return token(user)', '+  const user = await users.byEmail(email)', '+  await assertPassword(user, pass)', '+  return issueToken(user, { ttl: "1h" })', ' }'] });
  [A, B].forEach((c, k) => ctx.qa('.dl', c).forEach((l, i) => tl.from(l, { opacity: 0, x: -10, duration: 0.15 }, 0.6 + i * 0.22 + k * 0.08)));
  // the race
  const race = (c, dur, secs) => {
    tl.to(c.querySelector('.prog'), { width: '100%', duration: dur, ease: 'power1.inOut' }, 0.5);
    ctx.count(c.querySelector('.time'), 0, secs, 0.5, dur, (v) => `${v.toFixed(1)}s`);
  };
  race(A, 2.3, 130.4); race(B, 2.0, 108.2);
  const res = (c, html, at) => { const r = c.querySelector('.res'); r.innerHTML = html; tl.to(r, { opacity: 1, duration: 0.25 }, at); };
  res(A, `${ic('circle-check', 'c-emerald', 18)}<span class="c-emerald">+3</span> <span class="c-red">−2</span> · tests 35/36`, 2.8);
  res(B, `${ic('circle-check', 'c-emerald', 18)}<span class="c-emerald">+3</span> <span class="c-red">−2</span> · tests 36/36 ✓`, 2.5);

  const nori = ctx.bot('nori', { size: 130, x: 1000, y: 740, state: 'thinking', name: 'Nori<small>Review</small>' });
  tl.from(nori, { scale: 0, duration: 0.35, ease: 'back.out(2)' }, 0.4);

  // pick winner (checkpoint first)
  const pickBtn = ctx.el(`<div class="abs btn btn-primary" style="left:${620 + 520 - 18}px;top:660px;height:46px;font-size:18px;padding:0 18px;transform:translateX(-100%);opacity:0">${ic('trophy', '', 20)}Pick winner</div>`);
  tl.to(pickBtn, { opacity: 1, duration: 0.25 }, 2.7);
  const cur = ctx.cursor(700, 1000);
  tl.to(cur, { opacity: 1, duration: 0.2 }, 2.6);
  ctx.move(cur, 620 + 520 - 110, 678, 2.7, 0.45);
  ctx.click(cur, 3.2);
  tl.to(B, { borderColor: 'rgba(252,211,77,.9)', boxShadow: '0 0 0 3px rgba(252,211,77,.35), 0 30px 80px rgba(0,0,0,.5)', duration: 0.25 }, 3.25);
  tl.to(A, { opacity: 0.4, duration: 0.3 }, 3.25);
  const cp = ctx.el(`<div class="abs chip" style="left:640px;top:140px;font-size:16px;padding:6px 12px;opacity:0">${ic('git-branch', 'c-violet', 16)}${L(ctx, 'เซฟ checkpoint ก่อน apply', 'Checkpoint saved before apply')}</div>`);
  tl.to(cp, { opacity: 1, duration: 0.2 }, 3.35);
  const trophy = ctx.el(`<div class="abs" style="left:1150px;top:170px;color:#fbbf24">${ic('trophy', '', 72)}</div>`);
  tl.from(trophy, { scale: 0, rotation: -30, duration: 0.45, ease: 'back.out(2.5)' }, 3.3);
  ctx.pose(nori, 'done', 3.3);
  tl.to(cur, { opacity: 0, duration: 0.2 }, 3.6);

  // Thai-first: Som speaks
  const VX = 1250;
  const som = person(ctx, { name: 'Som', color: '#34c77b', line: L(ctx, 'พูดภาษาไทย', 'speaks Thai'), x: VX, y: 330 });
  tl.from(som, { opacity: 0, x: 30, duration: 0.35 }, 3.6);
  const voice = ctx.el(`
    <div class="abs card" style="left:${VX}px;top:440px;width:590px;padding:18px 20px;display:flex;flex-direction:column;gap:14px;background:var(--card)">
      <div style="display:flex;align-items:center;gap:12px">
        <span style="width:52px;height:52px;border-radius:999px;background:#ef4444;color:#fff;display:flex;align-items:center;justify-content:center">${ic('mic', '', 26)}</span>
        <span class="bars" style="display:flex;align-items:center;gap:5px;height:40px">${Array.from({ length: 14 }, () => '<i style="width:6px;height:40px;border-radius:3px;background:#fca5a5;transform:scaleY(.3)"></i>').join('')}</span>
        <span class="ml-auto chip" style="font-size:14px">${ic('languages', 'sz-3_5')}UI: ไทย</span>
      </div>
      <div class="tth" style="font:600 25px Sarabun;min-height:36px"></div>
      <div class="ten" style="font-size:18px;color:var(--muted-foreground);min-height:26px"></div>
    </div>`);
  tl.from(voice, { opacity: 0, y: 30, duration: 0.4 }, 3.75);
  const bars = ctx.qa('.bars i', voice);
  bars.forEach((b, i) => {
    tl.to(b, { keyframes: Array.from({ length: 8 }, (_, k) => ({ scaleY: 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7 + k * 1.3)), duration: 0.16 })), ease: 'sine.inOut' }, 3.9);
  });
  ctx.type(voice.querySelector('.tth'), 'ช่วยสรุปงานวันนี้เป็นภาษาไทยหน่อย', 4.0, 1.2);
  ctx.type(voice.querySelector('.ten'), '“Summarize today’s work in Thai, please.”', 4.6, 0.9);
  const mochi = ctx.bot('mochi', { size: 140, x: VX + 440, y: 680, state: 'thinking' });
  tl.from(mochi, { scale: 0, duration: 0.35, ease: 'back.out(2)' }, 4.0);
  ctx.pose(mochi, 'working', 5.4);
}
