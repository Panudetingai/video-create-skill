// S5 Trust 31–39s — local files, approve every action, checkpoint + undo,
// built-in git, keys in the OS keychain. Nori keeps the save disk.
import { ic, permissionPrompt, diff } from '../ui.js';
import { L } from './common.js';

export default function s05(ctx) {
  const { tl, gsap } = ctx;
  tl.set(ctx.bg.params, { glow: 0.4, fx: 0.7, fy: 0.45 }, 0);

  const h = ctx.headline([{ t: ctx.T.text[0] }, { t: ctx.T.text[1], cls: 'amber', size: 58 }], { x: 110, y: 70, size: 96, align: 'left', valign: 'top' });
  ctx.wordsIn(h, 0.15);

  // three promises
  const tiles = [
    ['lock', '#34d399', L(ctx, 'ไฟล์อยู่บนเครื่องคุณ', 'Files stay on your machine'), L(ctx, 'ไม่มี Mali server · ไม่ส่ง telemetry', 'No Mali server · no telemetry')],
    ['shield-check', '#fbbf24', L(ctx, 'อนุมัติทุกแอคชัน', 'You approve every action'), L(ctx, 'สิทธิ์แยกตามโฟลเดอร์', 'Per-folder permissions')],
    ['hard-drive', '#8b5cf6', L(ctx, 'Checkpoint ทุกเทิร์น', 'Checkpoint every turn'), L(ctx, 'พลาดกด Undo ได้ · Built-in Git', 'Undo anything · built-in Git')],
  ].map(([icon, color, t1, t2], i) => {
    const el = ctx.el(`
      <div class="abs glass" style="left:110px;top:${330 + i * 150}px;width:640px;height:128px;display:flex;align-items:center;gap:22px;padding:0 26px">
        <span style="width:72px;height:72px;border-radius:18px;background:color-mix(in oklab, ${color} 18%, transparent);color:${color};display:flex;align-items:center;justify-content:center">${ic(icon, '', 38)}</span>
        <span style="display:flex;flex-direction:column;gap:4px"><b style="font-size:30px">${t1}</b><span style="font-size:21px;color:var(--muted-foreground)">${t2}</span></span>
      </div>`);
    tl.from(el, { x: -80, opacity: 0, duration: 0.5, ease: 'power3.out' }, 0.5 + i * 0.22);
    return el;
  });

  // right side: permission → diff → undo
  const RX = 870;
  const perm = ctx.el(`<div class="abs" style="left:${RX}px;top:150px;width:720px">${permissionPrompt({ action: L(ctx, 'แก้ไฟล์', 'Edit file'), target: 'src/pricing.ts' })}</div>`);
  gsap.set(perm, { scale: 1.3, transformOrigin: '0 0' });
  const permBot = ctx.bot('nori', { size: 46, shadow: false, state: 'permission', parent: perm.querySelector('[data-slot=permbot]') });
  permBot.style.position = 'relative';
  tl.from(perm, { y: 40, opacity: 0, duration: 0.5, ease: 'power3.out' }, 1.2);
  const allowed = ctx.el(`<div class="abs chip" style="left:${RX}px;top:160px;font-size:22px;padding:10px 18px;opacity:0">${ic('circle-check', 'c-emerald', 24)}${L(ctx, 'อนุญาตแล้ว · แก้ได้เฉพาะโฟลเดอร์นี้', 'Allowed · this folder only')}</div>`);

  const d = ctx.el(`<div class="abs" style="left:${RX}px;top:260px;width:720px">${diff({
    file: 'src/pricing.ts',
    lines: [' export function calcTotal(items) {', '-  return items.reduce((s, i) => s + i.price)', '+  return items.reduce((s, i) => s + i.price * i.qty, 0)', ' }', '+export const VAT = 0.07'],
  })}</div>`);
  gsap.set(d, { scale: 1.3, transformOrigin: '0 0' });
  const dls = ctx.qa('.dl', d);
  const cur = ctx.cursor(1500, 900);
  tl.to(cur, { opacity: 1, duration: 0.2 }, 1.6);
  ctx.move(cur, RX + 690 * 1.3 - 90, 150 + 70 * 1.3, 1.7, 0.6);
  ctx.click(cur, 2.4);
  tl.to(perm, { opacity: 0, y: -20, duration: 0.3 }, 2.55);
  tl.to(allowed, { opacity: 1, duration: 0.3 }, 2.7);
  tl.from(d, { opacity: 0, y: 30, duration: 0.4 }, 2.75);
  dls.forEach((l, i) => tl.from(l, { opacity: 0, x: -14, duration: 0.2 }, 2.9 + i * 0.12));

  // Nori holds the checkpoint disk
  const nori = ctx.bot('nori', { size: 210, x: 1600, y: 700, state: 'idle', name: 'Nori<small>Checkpoint</small>' });
  tl.from(nori, { y: 300, duration: 0.6, ease: 'back.out(1.6)' }, 3.0);
  const disk = ctx.el(`<div class="abs" style="left:1650px;top:560px;width:110px;height:110px;border-radius:24px;background:linear-gradient(145deg,#8b5cf6,#3aa3f5);display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 20px 40px rgba(0,0,0,.5)">${ic('hard-drive', '', 58)}</div>`);
  tl.from(disk, { scale: 0, y: 120, duration: 0.5, ease: 'back.out(2)' }, 3.4);
  tl.to(disk, { y: -18, duration: 0.5, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 3.9);
  const cp = ctx.el(`<div class="abs chip" style="left:1575px;top:505px;font-size:17px;opacity:0">${ic('git-branch', 'c-violet', 18)}checkpoint · a3f9c1e</div>`);
  tl.to(cp, { opacity: 1, duration: 0.3 }, 3.7);

  // receipt-style undo bar under the diff
  const undo = ctx.el(`<div class="abs" style="left:${RX}px;top:560px;display:flex;gap:12px;align-items:center">
    <span class="btn btn-outline" style="height:48px;font-size:20px;padding:0 18px">${ic('undo-2', '', 22)}Undo</span>
    <span class="c-mutedfg" style="font-size:19px">${L(ctx, 'ย้อนกลับไป checkpoint ก่อนเทิร์นนี้', 'Restore the checkpoint before this turn')}</span></div>`);
  tl.from(undo, { opacity: 0, y: 10, duration: 0.3 }, 3.6);
  ctx.move(cur, RX + 70, 585, 4.2, 0.5);
  ctx.click(cur, 4.8);
  ctx.pose(nori, 'working', 4.8);
  // the file bounces back
  tl.to(d, { rotationX: 90, duration: 0.2, ease: 'power2.in', transformPerspective: 900 }, 4.9);
  ctx.call(() => {
    d.innerHTML = diff({ file: 'src/pricing.ts', lines: [' export function calcTotal(items) {', '   return items.reduce((s, i) => s + i.price)', ' }'] });
    const hdr = d.querySelector('.diff-h span:last-child');
    hdr.innerHTML = `<span class="c-emerald">${ic('circle-check', 'sz-3_5')} ${L(ctx, 'คืนค่าแล้ว', 'Restored')}</span>`;
  }, 5.1);
  tl.to(d, { rotationX: 0, duration: 0.35, ease: 'back.out(2)' }, 5.1);
  tl.to(d, { keyframes: [{ y: -14, duration: 0.12 }, { y: 0, duration: 0.3, ease: 'bounce.out' }] }, 5.45);
  ctx.pose(nori, 'done', 5.5);

  // keys go into the OS keychain
  const key = ctx.el(`<div class="abs" style="left:870px;top:760px;color:#fbbf24">${ic('key-round', '', 64)}</div>`);
  const kc = ctx.el(`<div class="abs chip" style="left:1060px;top:772px;font-size:22px;padding:10px 18px">${ic('lock', 'c-amber', 22)}OS Keychain · ${L(ctx, 'เก็บคีย์ API อย่างปลอดภัย', 'API keys stored securely')}</div>`);
  tl.from([key, kc], { opacity: 0, duration: 0.3 }, 5.7);
  tl.to(key, { x: 205, y: 4, scale: 0.4, rotation: 90, duration: 0.6, ease: 'power3.in' }, 6.0);
  tl.to(key, { opacity: 0, duration: 0.1 }, 6.6);
  tl.to(kc, { keyframes: [{ scale: 1.12, duration: 0.12 }, { scale: 1, duration: 0.25 }] }, 6.6);
  tl.to(cur, { opacity: 0, duration: 0.2 }, 6.0);
  tiles; // (kept on screen)
}
