// S2 Hero 7–15s — logo, wordmark, the whole bot team jumps out.
import { ic } from '../ui.js';
import { L } from './common.js';

const TEAM = [
  ['mochi', 'Thinking'], ['jelly', 'Connecting'], ['petal', 'Working'],
  ['nori', 'Checkpoint'], ['sora', 'Quick'], ['momo', 'Celebrate'],
];

export default function s02(ctx) {
  const { tl, gsap } = ctx;
  tl.set(ctx.bg.params, { glow: 0.9, ring: 0, ringR: 0.2, fy: 0.62, grid: 0.4 }, 0);
  tl.to(ctx.bg.params, { ring: 0.8, ringR: 0.24, duration: 1.2, ease: 'power2.out' }, 0.2);
  tl.to(ctx.bg.params, { ring: 0.25, ringR: 0.62, duration: 2.5, ease: 'power2.inOut' }, 2.0);

  // logo
  const logo = ctx.el(`<img class="abs" src="src/assets/icon.png" style="left:860px;top:150px;width:200px;height:200px;object-fit:contain;filter:drop-shadow(0 20px 40px rgba(245,197,24,.35))">`);
  tl.fromTo(logo, { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.55)' }, 0.15);

  const word = ctx.headline([{ t: 'Mali Cowork' }], { x: 960, y: 440, size: 150 });
  word.style.fontFamily = "'Inter Variable', sans-serif";
  word.style.letterSpacing = '-0.045em';
  ctx.wordsIn(word, 0.55, { stagger: 0.12, y: 80 });

  const tag = ctx.el(`
    <div class="abs" style="left:960px;top:540px;transform:translateX(-50%);display:flex;align-items:center;gap:18px;white-space:nowrap">
      <span style="display:flex;align-items:center;gap:12px;font-size:44px;font-weight:600">${ic('laptop', '', 44)}<span class="tagt">${ctx.T.text[1]}</span></span>
      <span class="glass" style="display:flex;align-items:center;gap:10px;padding:8px 18px;border-radius:999px;font-size:26px;color:var(--muted-foreground)">${ic('server-off', '', 26)}${L(ctx, 'ไม่ใช่เซิร์ฟเวอร์ใคร', "not someone else's server")}</span>
    </div>`);
  tl.from(tag.children[0], { y: 30, opacity: 0, duration: 0.5, ease: 'power3.out' }, 2.9);
  tl.from(tag.children[1], { x: -30, opacity: 0, duration: 0.5, ease: 'power3.out' }, 3.5);

  // the team jumps out of the logo
  const size = 170;
  TEAM.forEach(([key, role], i) => {
    const x = 960 + (i - 2.5) * 262 - size / 2;
    const y = 660;
    const b = ctx.bot(key, { size, x, y, state: 'welcome', name: `${key[0].toUpperCase() + key.slice(1)}<small>${role}</small>` });
    const at = 1.35 + i * 0.12;
    tl.set(b, { opacity: 0 }, 0);
    tl.set(b, { opacity: 1 }, at);
    tl.fromTo(b, { x: 960 - size / 2 - x, scale: 0.2 }, { x: 0, scale: 1, duration: 0.8, ease: 'power2.out' }, at);
    tl.fromTo(b, { y: 250 - y }, { keyframes: [{ y: -240, duration: 0.42, ease: 'power2.out' }, { y: 0, duration: 0.5, ease: 'bounce.out' }] }, at);
    ctx.pose(b, 'working', 4.8 + i * 0.15);
    ctx.pose(b, 'idle', 7.2);
  });
}
