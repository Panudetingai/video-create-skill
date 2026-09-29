// __ID__ __NAME__ — recipe: hero
// Logo pops, product name, tagline, the whole cast jumps out of the logo.
// text[0] = product name, text[1] = tagline. Cast = timeline bots (max 6).
import { ic } from '../ui.js';

export default function scene(ctx) {
  const { tl } = ctx;
  const team = (ctx.meta.bots.length ? ctx.meta.bots : ['mochi', 'jelly', 'petal', 'nori', 'sora', 'momo']).slice(0, 6);
  tl.set(ctx.bg.params, { glow: 0.9, ring: 0, ringR: 0.2, fy: 0.62, grid: 0.4 }, 0);
  tl.to(ctx.bg.params, { ring: 0.8, ringR: 0.24, duration: 1.2 }, 0.2);
  tl.to(ctx.bg.params, { ring: 0.25, ringR: 0.62, duration: 2.5, ease: 'power2.inOut' }, 2.0);

  const logo = ctx.el(`<img class="abs" src="src/assets/icon.png" style="left:860px;top:150px;width:200px;height:200px;object-fit:contain">`);
  tl.fromTo(logo, { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.55)' }, 0.15);
  const word = ctx.headline([{ t: ctx.T.text[0] }], { x: 960, y: 440, size: 150 });
  ctx.wordsIn(word, 0.55, { stagger: 0.12, y: 80 });
  if (ctx.T.text[1]) {
    const tag = ctx.el(`<div class="abs" style="left:960px;top:540px;transform:translateX(-50%);display:flex;align-items:center;gap:12px;font-size:44px;font-weight:600;white-space:nowrap">${ic('laptop', '', 44)}${ctx.T.text[1]}</div>`);
    tl.from(tag, { y: 30, opacity: 0, duration: 0.5 }, 2.9);
  }

  const size = 170, gap = Math.min(262, 1500 / team.length);
  team.forEach((key, i) => {
    const x = 960 + (i - (team.length - 1) / 2) * gap - size / 2, y = 660;
    const b = ctx.bot(key, { size, x, y, state: 'welcome', name: true });
    const at = 1.35 + i * 0.12;
    tl.set(b, { opacity: 0 }, 0);
    tl.set(b, { opacity: 1 }, at);
    tl.fromTo(b, { x: 960 - size / 2 - x, scale: 0.2 }, { x: 0, scale: 1, duration: 0.8, ease: 'power2.out' }, at);
    tl.fromTo(b, { y: 250 - y }, { keyframes: [{ y: -240, duration: 0.42, ease: 'power2.out' }, { y: 0, duration: 0.5, ease: 'bounce.out' }] }, at);
    ctx.pose(b, 'working', 4.8 + i * 0.15);
    ctx.pose(b, 'idle', ctx.duration - 0.8);
  });
}
