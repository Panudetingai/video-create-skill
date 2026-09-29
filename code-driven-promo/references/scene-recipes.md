# Scene recipes

`node S/scripts/new-scene.mjs <project> <sceneId> <recipe> [--force]` copies a recipe
into `src/scenes/<id>.js`. Every recipe renders correctly as-is using the
scene's `text` and `bots` from timeline.json. Then edit the marked constants.

| Recipe | Use for | Edit | Full example (`S/assets/examples/scenes/`) |
|---|---|---|---|
| `hook` | opening problem shot: grey clutter → bot knocks → colour returns | `CLUTTER`, `NOTES` | `s01-hook.js` |
| `hero` | logo + product name + cast jumps out | tagline icon | `s02-hero.js` |
| `app` | one feature shown in the real app window with a cursor flow | `MAIN` screen, prompt, steps, result card | `s07-speed.js`, `s09-inbox.js` |
| `split` | 2–3 side-by-side panels: modes, A vs B, before/after | `PANELS` | `s03-modes.js`, `s11-wow.js` |
| `cards` | integrations/templates: bot wired to a list + card grid | `ITEMS`, `CARDS` | `s06-power.js` |
| `cta` | last shot: 3 steps, QR, URL, cast waves, confetti | `STEPS` | `s12-cta.js` |

Example scenes (`S/assets/examples/scenes/`) that go beyond a recipe (read them for techniques):
- `s04-models.js`: orbiting logo cloud flying into a real model picker; clicks change picker content via `ctx.call`.
- `s05-trust.js`: permission prompt → allow → diff → undo with a 3D flip (`rotationX`) back to the old file.
- `s08-anywhere.js`: fake browser + selection highlight + hotkey keycaps + Quick bar + screen-capture box; uses `ctx.pos` for every click target.
- `s10-proof.js`: a 3-panel strip panned like a camera (`tl.to(strip, {x: -1920})`).

## Mapping storyboard words → techniques
| Storyboard says | Do |
|---|---|
| "X appears / pops" | `ctx.pop(el, at)` or `tl.from(el, {scale:0, ease:'back.out(2)'})` |
| "user clicks / picks / switches" | `ctx.cursor` + `ctx.move` + `ctx.click`, then `ctx.call`/`ctx.swap` the UI change at the click time + 0.05 |
| "types / asks" | `ctx.type(node, text, at, dur)` then a keycap flash (`<kbd class="kbd-big">⌘</kbd>`) |
| "runs in background / progress" | `.spin` icons rotate by themselves; step rows appear one by one; status pills via `ctx.swap` |
| "grey → colour" | CSS `filter: grayscale(1)` tweened to 0 + `bg.params.gray` 1→0 |
| "celebrate / confetti / done" | `ctx.pose(bot,'done', at)` + `ctx.confetti(x, y, at)` + a banner `ctx.pop` |
| "bot does X" | pick state: thinking=ask/think, working=doing (rainbow ring), tool=using tools, connection=connecting, permission=asking to allow, welcome=wave, done=celebrate |
| "camera pans / zooms" | put content in one big layer and tween its `x`/`scale` |
| "split screen" | `split` recipe |
| "logo cloud" | chips with `brand('OpenAI', 28)` placed on an ellipse, animate an angle proxy with `onUpdate` (see s04) |
| "QR code" | `window.qrcode` (qrcode-generator) → SVG path (see `cta`) |

## Beat checklist for any scene
1. Headline words in by 0.6 s.
2. One clear action the viewer can follow (the cursor is the viewer's eye).
3. A visible result (card, badge, status change) + a bot reaction.
4. Hold ~1 s before the cut; the last 0.34 s is covered by the wipe.
