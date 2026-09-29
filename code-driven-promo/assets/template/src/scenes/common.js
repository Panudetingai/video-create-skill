// Shared scene pieces.
import { appWindow, ic } from '../ui.js';

/** Place the Mali Cowork app window. Returns the .appwin element. */
export function app(ctx, { x = 240, y = 90, scale = 1, main = '', active = '', more = false, chats = [], titleBot = 'mochi' } = {}) {
  const el = ctx.el(appWindow({ main, active, more, chats }));
  ctx.gsap.set(el, { left: 0, top: 0, x, y, scale, transformOrigin: '0 0' });
  if (titleBot) ctx.bot(titleBot, { size: 26, shadow: false, parent: el.querySelector('[data-slot=titlebot]'), x: 0, y: 0 });
  return el;
}

/** Window-in: rise + fade, like a macOS window opening. */
export function windowIn(ctx, el, at, { from = 0.94, y = 40 } = {}) {
  const s = ctx.gsap.getProperty(el, 'scale');
  const ty = ctx.gsap.getProperty(el, 'y');
  ctx.tl.fromTo(el, { opacity: 0, scale: s * from, y: ty + y }, { opacity: 1, scale: s, y: ty, duration: 0.6, ease: 'power3.out' }, at);
}

/** A person in the story (Kai, Lin, Dan, Som): avatar + name + optional line. */
export function person(ctx, { name, color, line = '', x, y, parent }) {
  return ctx.el(`
  <div class="abs person" style="left:${x}px;top:${y}px;display:flex;align-items:center;gap:14px;padding:10px 20px 10px 10px;border-radius:999px;background:rgba(24,24,20,.85);border:1px solid rgba(255,255,255,.1);box-shadow:0 12px 30px rgba(0,0,0,.4)">
    <span style="width:52px;height:52px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font:700 24px var(--font-en);color:#111">${name[0]}</span>
    <span style="display:flex;flex-direction:column;line-height:1.25"><b style="font-size:22px">${name}</b>${line ? `<span style="font-size:18px;color:var(--muted-foreground)">${line}</span>` : ''}</span>
  </div>`, parent);
}

/** Big glassy label chip, e.g. "No telemetry". */
export function chip(ctx, { icon, text, x, y, color = 'var(--primary)', size = 26, parent }) {
  return ctx.el(`<div class="abs glass" style="left:${x}px;top:${y}px;display:flex;align-items:center;gap:12px;padding:14px 22px;border-radius:999px;font-size:${size}px;font-weight:600;white-space:nowrap">
    <span style="color:${color};display:flex">${ic(icon, '', size + 4)}</span>${text}</div>`, parent);
}

export const L = (ctx, th, en) => (ctx.th ? th : en);
