# Engine API

How a frame is made: `seek(t)` → find the scene containing *t* → if we just
entered it (or time went backwards) **rebuild it from scratch** → step the
virtual clock from the scene start to *t* in 60 Hz steps, advancing the scene's
GSAP timeline and the bots together → set the overlay (captions, rainbow wipe
on every cut) → render the WebGL backdrop with `uTime = t`.

Consequences:
- A scene function runs once per (re)build. It **declares** the whole scene: it
  creates DOM and puts tweens/calls on `ctx.tl`. Nothing happens "later" outside the timeline.
- Scenes are isolated: they can't see each other's DOM. Continuity (e.g. the same
  window across a cut) = rebuild it in both scenes at matching positions.
- The stage is always 1920×1080 CSS px. Positions below are stage px.

## Scene file
```js
// src/scenes/s05.js   (id must match timeline.json)
import { ic, composer } from '../ui.js';
import { app, windowIn, person, chip, L } from './common.js';

export default function scene(ctx) {
  const { tl, gsap } = ctx;
  tl.set(ctx.bg.params, { glow: 0.45, fx: 0.6 }, 0);       // backdrop look for this scene
  const h = ctx.headline([{ t: ctx.T.text[0] }, { t: ctx.T.text[1], cls: 'amber' }], { x: 110, y: 60, size: 96, align: 'left', valign: 'top' });
  ctx.wordsIn(h, 0.2);
  // …
}
```

## ctx
| Member | What |
|---|---|
| `tl` | paused GSAP timeline; position argument = scene seconds |
| `gsap` | GSAP (for `gsap.set` at build time) |
| `meta` | this scene's timeline entry (`id, name, start, end, bots, visual, th, en`) |
| `T` | `meta[lang]` → `T.vo`, `T.text[0..1]` |
| `lang`, `th` | `'th'|'en'`, boolean |
| `duration` | scene length in s (use it: `ctx.duration - 1` = "near the end") |
| `bg.params` | backdrop uniforms, tween them: `glow` 0–1, `gray` 0–1 (desaturate), `ring` 0–1 + `ringR` (rainbow ring radius), `fx/fy` (glow focus 0–1), `grid` 0–1 |
| `rand()` | seeded random (deterministic) |
| `el(html, parent?)` | create element from HTML, append (default: scene root), return it |
| `q(sel, from?)`, `qa(sel, from?)` | querySelector / querySelectorAll (array) inside the scene |
| `swap(node, html, at)` | replace `node.innerHTML` at time `at` (status changes, new screens) |
| `call(fn, at)` | run fn at time `at` (class toggles etc.; must be idempotent-looking) |
| `pos(node)` | `{x,y,w,h,cx,cy}` in stage px. Measure **before** tweening it/parents |
| `bot(key, {size,x,y,state,shadow,name,parent})` | mount a CoworkBot, returns wrapper (animate it like any element). `name: true` or `'Nori<small>Role</small>'` adds a label |
| `pose(botWrap, state, at)` | change bot state at time |
| `headline(lines, {x,y,size,align,valign,width,parent})` | kinetic headline; lines = strings or `{t, cls: 'rb'|'amber'|'dim', size}`; words split safely for Thai |
| `wordsIn(el, at, {stagger,y,dur,ease})`, `wordsOut(el, at)` | animate headline words |
| `type(node, text, at, dur, {caret})` | typewriter (grapheme-safe) |
| `count(node, from, to, at, dur, fmt)` | number counter |
| `cursor(x, y)` → `c`; `move(c, x, y, at, dur)`; `click(c, at)` | mouse pointer + click ring. Show with `tl.to(c, {opacity:1}, at)` |
| `confetti(x, y, at, {count, spread, up})` | deterministic confetti burst |
| `pop(node, at, {from, dur, y})` | scale-in pop |
| `fadeOut(node, at, dur)` | fade out |

`common.js` helpers: `app(ctx, {x,y,scale,main,active,more,chats,titleBot})` (full app window),
`windowIn(ctx, el, at)`, `person(ctx, {name,color,line,x,y})` (story characters like Kai/Lin),
`chip(ctx, {icon,text,x,y})`, `L(ctx, thText, enText)`.

## Timeline schema (`src/timeline.json`)
```json
{
  "title": "…", "duration": 90, "bpm": 120, "size": [1920, 1080], "url": "example.com",
  "verticalCut": [[7, 13], [81, 90]],
  "scenes": [
    { "id": "s01", "name": "Hook", "start": 0, "end": 7, "bots": ["mochi"],
      "visual": "storyboard description…",
      "voLead": 0.35, "voTail": 0.3,
      "th": { "vo": "เสียงพากย์…", "text": ["บรรทัด 1", "บรรทัด 2"], "sayRate": 190 },
      "en": { "vo": "Voiceover…", "text": ["Line 1", "Line 2"] } }
  ]
}
```
Scenes must be contiguous (`end` of one = `start` of next). Cut times on whole
seconds keep cuts on the 120 BPM beat. `verticalCut` segments should start on a
bar (odd seconds for a 7s-first-shot 120 BPM track, e.g. 7, 9, 11…) so the music splice is clean.

## Layout grid that works
- Safe area: x 80–1840, y 50–930. Captions live below y≈940.
- Headline left column: x 90–600 with an app window at x≈620, scale≈0.88 (1267×792).
- Headline top-left: `x:110, y:60, size 88–110, valign:'top'`, content from y≈300.
- Centered hero: logo y≈150–350, wordmark y≈440, tagline y≈540, bots row y≈660.
- Readability: app UI is 14px text at scale 1. On a 1080p video use scale ≥0.86
  **and** `zoom: 1.2–1.3` on the content block you want read (see `S/assets/examples/scenes/s09-inbox.js`).

## Timing patterns (per 7–8 s scene)
0.0–0.6 enter (headline words, window in) → 0.6–5.5 the one story beat
(cursor → click → result, 2–3 sub-beats ~1.5 s apart) → 5.5–end payoff (bot
`done`, result card, confetti) and hold. The rainbow wipe covers the last 0.34 s
and first 0.3 s of every scene, so nothing important there.
