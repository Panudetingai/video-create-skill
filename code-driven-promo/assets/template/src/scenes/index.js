// Scene registry by convention: scene "s03" lives in src/scenes/s03.js
// (export default function (ctx) { ... }). Missing files get a title-card
// placeholder, so the video always renders end to end while you work.
import timeline from '../timeline.json' with { type: 'json' };

const placeholder = (ctx) => {
  const lines = [{ t: ctx.T.text[0] ?? ctx.meta.name }];
  if (ctx.T.text[1]) lines.push({ t: ctx.T.text[1], cls: 'amber' });
  ctx.wordsIn(ctx.headline(lines, { size: 100 }), 0.2);
  ctx.el(`<div class="abs eyebrow" style="left:60px;top:40px">TODO ${ctx.meta.id} · ${ctx.meta.name}</div>`);
};

const entries = await Promise.all(timeline.scenes.map(async (s) => {
  try { return [s.id, (await import(`./${s.id}.js`)).default]; }
  catch (e) {
    if (!/Failed to fetch|Cannot find|404|error loading/i.test(String(e))) console.error(`scene ${s.id}:`, e);
    return [s.id, placeholder];
  }
}));

export const SCENES = Object.fromEntries(entries);
