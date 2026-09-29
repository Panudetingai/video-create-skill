---
name: code-driven-promo
description: Build product promo / explainer / launch videos as code (GSAP + Three.js + real app UI), rendered frame-by-frame to MP4 with algorithmic music, TTS voiceover and burned-in TH/EN captions. Use this whenever the user wants a promo animation, product video, storyboard-to-video, app demo video, TikTok/Reels cut, or "animation จาก storyboard/docx", "ทำวิดีโอโปรโมท", "promo animation", "ทำ motion graphic จาก UI จริง", even if they don't say "code-driven". Also use it to edit, re-time, re-voice or re-render an existing promo project that has src/timeline.json + tools/render.mjs.
---

# Code-driven promo video

Videos made from code instead of generated pixels: every frame is a web page at
time *t*, so the UI looks exactly like the real app, text never warps, and a
render is identical every time. This skill packages the pipeline that produced
the Mali Cowork 90s promo into a machine you drive with a few
commands. **Let the scripts do the heavy lifting; your job is the scenes.**

```
storyboard.docx ──► timeline.json ──► scenes/sNN.js (GSAP) ──► check.mjs (QA) ──► render.mjs
                         │                                                          │
                         └──► music.py (120 BPM, cut-synced) + make-vo (TTS) ───────┘→ exports/*.mp4
```

`S` = this skill's folder (`.claude/skills/code-driven-promo`). Scripts are Node ≥ 22,
need `ffmpeg`, and use a headless Chrome (`npx @puppeteer/browsers install chrome-headless-shell@stable` if missing).

## The workflow (follow in order)

### 1. Read the inputs
- Storyboard: check it is a real file (`ls -la`; a .docx of a few hundred bytes is a broken download, so ask for it again rather than guessing content).
- The app to copy UI from (if any): note its design tokens (e.g. `src/index.css`), icon library, and mascot/character assets.
- Any "how to" notes from the user; they override this skill.

### 2. Scaffold (one command)
```bash
node S/scripts/new-project.mjs <new-dir> --storyboard <file.docx> --app <path-to-app> --url <domain>
```
This copies the engine, UI kit, tools and music into `<new-dir>`, converts the
storyboard into `src/timeline.json`, creates **one working scene per shot** from
a recipe, installs packages, and re-extracts bots/icons from the app. Read the
warnings it prints (gaps between shots, VO too long for a shot).

Already inside an existing promo project? Skip this; work on its files.

### 3. Fix the timeline first
Open `src/timeline.json` and correct what the parser guessed: scene names, the
two headline lines per language (`text`), `bots`, `url`. VO lines longer than
~11 chars/s (TH) or ~15 chars/s (EN) get sped up; for short final shots add
`"voLead": 0.12, "voTail": 0.05` or `"sayRate": 215` (see references/audio.md).
Everything else (captions, music cuts, VO placement) reads this file, so there's no other place to change timing.

### 4. Preview & check the scaffold
```bash
cd <new-dir> && node S/scripts/check.mjs . --per 1
```
Then **read `qa/sheet-th.png`** (contact sheet). You now have a complete video
of placeholders-with-motion. Nothing is broken yet, so each later edit is easy to verify.

### 5. Build scenes one at a time (the real work)
For each shot, in order:
1. Re-read its storyboard row (`visual` in timeline.json).
2. Pick the closest recipe if the scaffold guessed wrong:
   `node S/scripts/new-scene.mjs . s05 app --force` (recipes: `hook hero app split cards cta`, see references/scene-recipes.md).
3. Edit `src/scenes/sNN.js`: swap in the real UI for this beat (builders in
   `src/ui.js`, see references/ui-kit.md), the story actions (cursor clicks,
   typing, bot poses), and timing inside the scene's duration.
4. Verify just that scene: `node S/scripts/check.mjs . --scene s05 --per 3`
   then **look at the PNGs** in `qa/`. Fix every `ERROR`; fix warnings unless intended.

Work on one scene at a time and check it before moving on; small models do much better this way than writing all 12 scenes and debugging together.
The finished Mali promo scenes in `assets/examples/scenes/` (`s01-hook.js` … `s12-cta.js`,
with their `assets/examples/timeline.json`) are full worked examples of every recipe pushed
further; copy patterns from them.

### 6. Render
```bash
npm run render                     # music + VO + TH/EN frames + mix + 9:16 cut  (~5 min per language)
node tools/render.mjs --langs th   # one language
node tools/render.mjs --skip-audio --skip-video   # remix only (e.g. new VO wav)
```
Outputs in `exports/`: `Promo-TH.mp4`, `Promo-EN.mp4`, `*-music-only.mp4`, `*-vertical.mp4`.
Verify with `ffprobe` (duration = timeline duration, 1920×1080) and pull a few
frames (`ffmpeg -ss 12 -i exports/Promo-TH.mp4 -frames:v 1 f.png`) to look at.

### 7. Report honestly
Tell the user what was made, where the files are, and what is **temporary or unverified**:
TTS voiceover is a guide track; you cannot hear the audio (you can only check
loudness/spectrogram); any UI you invented because the app lacks it.

## Rules that keep renders correct

These come from real bugs; the reasons matter more than the rules:

- **Only scene time.** Animate with `ctx.tl` at positions in *scene seconds*
  (0 = the cut). Never use `setTimeout`, `setInterval`, `requestAnimationFrame`, CSS
  animations/transitions or `Date.now()`: the exporter freezes real time, so those
  either never fire or differ per render. Randomness: `ctx.rand()` only.
- **`fromTo` renders its "from" immediately.** For effects that should be
  invisible until their time (click rings, ripples), pass `immediateRender: false`.
- **Measure before you move.** `ctx.pos(el)` returns stage coordinates; call it
  *before* adding tweens that transform that element or its parents, or the
  cursor will click the wrong place.
- **Thai text**: split with the engine (`ctx.headline`, `ctx.type`) because they use
  `Intl.Segmenter`. Splitting Thai per JS char tears vowels off consonants.
- **Keep the caption band clear**: y > 940 is subtitles. Headlines never overlap UI; `check.mjs` flags both.
- **Lucide icons**: `ic(name, cls, sizePx)`; names must exist in `src/vendor/icons.js`
  (`npm run sync:icons` to add more by editing `tools/extract-icons.mjs`).
- **Bots** (`ctx.bot`) are the app's real mascot engine; states: `idle thinking working done alert welcome tool connection permission`. Change pose with `ctx.pose(bot, state, at)`.

More in references/pitfalls.md; read it when something looks wrong.

## Reference files (read when needed)
| File | Read it when |
|---|---|
| `references/engine-api.md` | writing any scene: every `ctx.*` helper, timeline schema, bg params |
| `references/scene-recipes.md` | choosing/adapting a recipe; layout grid & timing patterns |
| `references/ui-kit.md` | building app screens; cloning a *different* app's UI |
| `references/audio.md` | music, TTS voiceover, replacing VO with a real recording, mixing |
| `references/pitfalls.md` | anything renders wrong, hangs, or differs between preview and export |

## Done checklist
- [ ] `check.mjs .` → 0 errors in both languages; contact sheets looked at
- [ ] every storyboard shot has its visual beat, headline text and characters
- [ ] `npm run render` finished; durations & resolutions verified with ffprobe
- [ ] frames from the final MP4 viewed (not just the preview)
- [ ] user told what's temporary (TTS VO, invented UI, sample data)
