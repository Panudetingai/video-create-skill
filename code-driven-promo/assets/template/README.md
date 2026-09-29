# Promo video project (code-driven)

Created by the `code-driven-promo` skill. Every frame is `index.html` at time *t*.

```bash
npm run dev          # preview → http://localhost:4321 (play / scrub / scene buttons / TH-EN)
npm run render       # music + TTS VO + TH/EN frames + mix + 9:16 → exports/
```

- `src/timeline.json`: scenes, timing, VO and headline text (TH + EN). Edit this first.
- `src/scenes/sNN.js`: one file per scene (GSAP timeline in scene seconds).
- `src/ui.js`, `src/styles.css`: the app's UI kit; `src/vendor/`: extracted bots + icons.
- `audio/music.py`: algorithmic music; `tools/make-vo.mjs`: temp voiceover.
- QA: `node <skill>/scripts/check.mjs . --scene s03` → `qa/*.png` + errors/overlaps.

Preview URL options: `?lang=en`, `?t=12.5&clean=1` (single frame), `?subs=0`.
