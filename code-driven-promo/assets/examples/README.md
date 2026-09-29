# Worked example: Mali Cowork 90s promo (TH/EN)

The 12 finished scenes and the timeline behind the Mali Cowork promo. They import
`../ui.js`, `./common.js`, `../timeline.json` like any scene, so they run inside a
project made by `scripts/new-project.mjs` (copy a file to `src/scenes/sNN.js` and
rename to the scene id). Read them for techniques beyond the recipes:
camera pans (s10), 3D flip undo (s05), model picker driven by clicks (s04),
measured click targets with `ctx.pos` (s08), parallel inbox tasks (s09).
