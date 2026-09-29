# video-create-skill

A Claude Code skill that makes product promo videos **from code**: storyboard in,
MP4 out. Every frame is a web page at time *t* (GSAP + Three.js + the app's
real UI), rendered frame by frame, with algorithmic music, a TTS voiceover and
TH/EN captions. It's packaged so smaller models can follow it step by step.

Skill ที่ทำให้ Claude สร้างวิดีโอโปรโมท **ด้วยโค้ด** จาก storyboard: ภาพทุกเฟรมคือหน้าเว็บ ณ เวลา *t*
ใช้ UI จริงของแอป, เรนเดอร์ทีละเฟรม, มีเพลงที่สร้างด้วยโค้ด, เสียงพากย์ และซับไทย/อังกฤษ
ออกแบบมาให้โมเดลเล็กทำตามทีละขั้นได้

```
storyboard.docx ─► timeline.json ─► scenes (GSAP) ─► check (QA) ─► render ─► Promo-TH.mp4 / Promo-EN.mp4 / 9:16
```

Built for the 90s Mali Cowork promo (TH + EN, 12 scenes); that project's scenes are
included as worked examples.

## Install

```bash
# per project
mkdir -p .claude/skills && cp -R code-driven-promo .claude/skills/
# or for all projects
cp -R code-driven-promo ~/.claude/skills/
```

Requirements: Node ≥ 22, `ffmpeg`, Python 3 + numpy, a headless Chrome
(`npx @puppeteer/browsers install chrome-headless-shell@stable`), macOS `say`
for the temp voiceover.

## Use

Ask Claude something like *"ทำ promo animation จาก storyboard.docx ใช้ UI จาก ../MyApp"*.
The skill triggers and runs the workflow. Or drive the machine yourself:

```bash
S=code-driven-promo
node $S/scripts/new-project.mjs ../my-promo --storyboard story.docx --app ../MyApp --url my.app
cd ../my-promo
npm run dev                                  # preview http://localhost:4321
node ../video-create-skill/$S/scripts/check.mjs .   # QA: errors, overlaps, contact sheet
npm run render                               # → exports/*.mp4
```

## What's inside

| Path | What |
|---|---|
| `code-driven-promo/SKILL.md` | the 7-step workflow, rules and done-checklist |
| `scripts/storyboard-to-timeline.mjs` | .docx/.md storyboard → `timeline.json` (times, VO, headlines, characters) + warnings |
| `scripts/new-project.mjs` | one command → complete renderable project (one working scene per shot) |
| `scripts/new-scene.mjs` | (re)create a scene from a recipe: `hook hero app split cards cta` |
| `scripts/check.mjs` | automatic QA: page errors, off-frame text, headline overlaps, caption band, contact sheets |
| `assets/template/` | the engine: virtual clock, scene engine, WebGL backdrop, UI kit, exporter, music, VO, render pipeline |
| `assets/recipes/` | scene templates |
| `assets/examples/` | the 12 finished Mali Cowork promo scenes + timeline |
| `references/` | engine API, scene recipes, UI cloning, audio, pitfalls |

The template's UI kit, mascot engine (`src/vendor/cowork-bots.js`) and icon are from
[Mali Cowork](https://malicowork.pndluke.com). For another product, re-extract them with
`--app` or rebuild them following `references/ui-kit.md`.
