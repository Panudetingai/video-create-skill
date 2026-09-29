# Pitfalls (all hit for real while building the Mali promo)

| Symptom | Cause | Fix |
|---|---|---|
| Export hangs forever with **no output** | something replaced the page's global `setTimeout`; the exporter polls with it | never patch globals; timers for bots are module-scoped via `vt` in `engine/clock.js` |
| Export stuck/slow and you piped it to `tail` | `tail` only prints at the end | run in background with output to a log file, or no pipe |
| Circles/rings visible at the start of a scene | `tl.fromTo` renders its from-state at build time | `immediateRender: false` on effects that appear later |
| Cursor clicks next to the button | measured with `ctx.pos` after a tween already moved/scaled the element or its window | measure first, then add `windowIn` / `from` tweens |
| Thai shows dotted circles while typing | text split per UTF-16 char | `ctx.type` / `ctx.headline` (Intl.Segmenter graphemes/words) |
| Rainbow headline invisible | gradient on the line, words are inline-blocks | use `cls: 'rb'` (styles put the gradient on each `.w`) |
| Icon renders tiny | `.lc` class width 1em beats a width attribute | `ic(name, cls, px)` sets an inline style |
| Scene looks different in preview vs export | non-deterministic code (Math.random, Date, CSS animation, real timers) | only `ctx.rand`, timeline positions; verify: render the same range twice → `ffmpeg -f framemd5` hashes equal |
| Bot "done" looks like dots | state changes run through the dots form first | give it ~0.8 s before the moment you need the face |
| Text overlaps headline | layout with absolute coords | `check.mjs` reports `headline-overlap`; move one of them, not the headline size |
| UI too small to read in 1080p | app UI is 12–14 px | window scale ≥0.86 + `zoom:1.2–1.3` on the content |
| `.docx` can't be read | truncated download (hundreds of bytes) | ask the user to re-download; don't invent the storyboard |
| QR code: `qrcode is not a function` | qrcode-generator is UMD | it's loaded as a classic `<script>` in index.html → `window.qrcode` |
| `ffmpeg -shortest` output 0.2 s short | AAC priming / VO shorter than video | `apad` + `-t <duration>` |
| Temp dir `ENOTEMPTY` after screenshots | deleting Chrome's profile before it exits | wait for `exit`, `rmSync(..., {maxRetries})` in try/catch |
| Headless Chrome missing | fresh machine | `npx @puppeteer/browsers install chrome-headless-shell@stable` (scripts look in `~/.cache/puppeteer`) |

## Speed
~11 fps at 1080p on an M-series Mac (≈4–5 min per 90 s language). `--frame-format jpeg`
is a little faster. WebGL backdrop renders at half resolution on purpose.
