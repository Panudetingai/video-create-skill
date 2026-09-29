// Entry: engine, scenes and the window.__EXPORT__ bridge used by
// tools/export-video.mjs.
import { createEngine, mountPlayer } from './engine/engine.js';
import { SCENES } from './scenes/index.js';
import timeline from './timeline.json' with { type: 'json' };

const params = new URLSearchParams(location.search);
const exporting = params.get('export') === '1';

let voTiming = {};
try { voTiming = await (await fetch('audio/out/vo-timing.json', { cache: 'no-store' })).json(); } catch { /* no VO yet */ }

// Every font face the video uses, loaded before frame 0.
const FACES = ['400 20px Sarabun', '500 20px Sarabun', '600 20px Sarabun', '700 20px Sarabun', '800 20px Sarabun',
  '400 20px "Inter Variable"', '700 20px "Inter Variable"', '700 20px Mali', '400 20px "JetBrains Mono"'];
await Promise.all(FACES.map((f) => document.fonts.load(f, 'กขAa').catch(() => null)));
await Promise.all([...document.images].map((i) => i.decode().catch(() => null)));
await document.fonts.ready;

const stage = document.getElementById('stage');
const lang = params.get('action') || params.get('lang') || 'th';
document.documentElement.lang = lang;
const engine = createEngine({ timeline, scenes: SCENES, stage, lang, voTiming, subs: params.get('subs') !== '0' && params.get('target') !== 'clean' });

function fit() {
  if (exporting) { stage.style.transform = `scale(${innerWidth / 1920})`; stage.parentElement.style.alignItems = 'flex-start'; stage.parentElement.style.justifyContent = 'flex-start'; return; }
  const k = Math.min(innerWidth / 1920, (innerHeight - (params.get('clean') ? 0 : 56)) / 1080);
  stage.style.transform = `scale(${k})`;
  stage.style.marginRight = `${1920 * (k - 1)}px`;
  stage.style.marginBottom = `${1080 * (k - 1)}px`;
}
addEventListener('resize', fit);
fit();

window.__EXPORT__ = {
  // promo = with burned-in captions, clean = no captions (for the 9:16 cut / re-editing)
  list: () => ({ promo: { th: timeline.duration, en: timeline.duration }, clean: { th: timeline.duration, en: timeline.duration } }),
  prepare({ target, action }) {
    engine.setSubs(target !== 'clean');
    if (action && action !== engine.lang) engine.setLang(action);
    fit();
    return timeline.duration;
  },
  seek(t) { engine.seek(t); },
};

if (!exporting) {
  if (params.get('clean')) engine.seek(+(params.get('t') || 0));
  else mountPlayer(engine, timeline);
}
window.__READY__ = true;
