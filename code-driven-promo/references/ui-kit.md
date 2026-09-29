# UI kit: making the video look like the real app

## What `src/ui.js` gives you (Mali Cowork, dark theme)
Each builder returns an HTML string and mirrors a real component (file noted in `ui.js`):

| Builder | Real component |
|---|---|
| `appWindow({main, active, more, chats})` / `app(ctx, …)` | full window: `titlebar` + `sidebar` + main |
| `modeTabs('chat'|'cowork'|'code')` | Chat/Cowork/Code switch |
| `composer({text, placeholder, folder, model, inbox})` | prompt box (`.cp-text`, `.cp-send`, `.cp-model`) |
| `userMsg(text)`, `assistantMsg(html)`, `stepRow({state, icon, verb, target, time})` | chat thread + agent steps (`state`: done/running/todo) |
| `permissionPrompt({action, target})` | Allow/Deny prompt (mount a bot in `[data-slot=permbot]`) |
| `receipt({...})` | work receipt card (`.stat-v` values can be `ctx.count`ed) |
| `inboxTask({id, title, folder, status, step})` + `taskIcon/pill/taskBody(status)` | Inbox cards; statuses queued/running/needs-you/ready |
| `commandPalette({query, th})` | ⌘K dialog |
| `suggestionCard({icon, title, desc})` | smart empty-state card |
| `modelPicker({groups, active, models, activeModel})`, `modelRow` | model picker |
| `quickBar({th, selection, answer})` | Mali Quick floating bar |
| `diff({file, lines})` | code diff; lines start with `+`, `-` or space |
| `ic(name, cls, px)` | lucide icon; `brand(Name, px)` lobehub logo; `MARKS.Gmail/Word/Windows/Playwright` |

Tokens are the app's `.dark` values in `src/styles.css` (`--background`, `--card`,
`--primary` amber, `--muted-foreground`, radius 10px, Inter/Sarabun). Utility classes:
`.abs .layer .card .glass .chip .btn .btn-primary .btn-outline .kbd-big .term .steps .headline .eyebrow`.

## Cloning a different app's UI (do this before writing scenes)
1. **Run the real app in a browser and screenshot it**. For a Vite/React app:
   `npx vite --port 1420` in the app, then
   `PRE_JS='localStorage.setItem("theme","dark");true' node tools/shoot.mjs qa/ref http://localhost:1420/=home http://localhost:1420/settings=settings`
   (seed localStorage to skip onboarding / force dark). Look at the PNGs; they are your reference for every screen.
2. **Copy tokens, not guesses**: open the app's global CSS (`index.css`, tailwind theme) and
   paste its color/radius/font variables into `:root` of `styles.css`.
3. **Read the component markup** (`grep -n className= Component.tsx`) and rebuild
   the few screens the storyboard shows as builders in `ui.js`: same structure,
   spacing (Tailwind: `p-3`=12px, `gap-2`=8px, `text-sm`=14px, `text-xs`=12px, `rounded-xl`=radius+4px).
4. **Icons**: set `LUCIDE`/`LOBE` lists in `tools/extract-icons.mjs`, run `npm run sync:icons` (reads the app's node_modules).
5. **Mascots**: if the app has an animation file like `public/anim/cowork-bots.html`, adapt
   `tools/extract-bots.mjs` markers so the engine runs the real one. Otherwise draw characters as
   simple SVG/DOM and animate with the timeline (no timers!).
6. Compare: `check.mjs` screenshot vs the reference screenshot side by side
   (`ffmpeg -i a.png -i b.png -filter_complex hstack cmp.png`) and fix what differs.

Features the app doesn't have yet (e.g. Agent Arena here): design them from the
same tokens/components and tell the user they are invented.
