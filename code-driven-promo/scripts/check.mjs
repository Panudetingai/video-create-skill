#!/usr/bin/env node
// Automatic QA for a promo project — objective feedback you can act on.
//
// Usage: node check.mjs <projectDir> [--lang th|en|both] [--scene s03] [--per 3] [--out qa/]
//
// For every scene it seeks a few moments (early / middle / late), then:
//   • collects page errors and console errors
//   • finds visible text that is off the 1920×1080 frame
//   • finds visible text boxes overlapping each other (e.g. headline over a card)
//   • finds text sitting in the caption band (y > 940) while captions are on
//   • checks fonts loaded and the scene is not blank
// and writes qa/<lang>-<scene>-<t>.png + qa/sheet-<lang>.png (contact sheet) + qa/report.json.
// Exit code 1 when there are errors (warnings don't fail).
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { extname, join, resolve } from 'node:path';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args.splice(i, 2)[1] : d; };
const langArg = flag('lang', 'both'), only = flag('scene'), per = +flag('per', 3);
const dir = resolve(args[0] ?? '.');
const out = resolve(dir, flag('out', 'qa'));
const tl = JSON.parse(readFileSync(join(dir, 'src/timeline.json'), 'utf8'));
const langs = langArg === 'both' ? ['th', 'en'] : [langArg];
mkdirSync(out, { recursive: true });

// ------------------------------------------------------------ static server
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const server = createServer((req, res) => {
  let f = join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(dir) || !existsSync(f)) { res.writeHead(404).end(); return; }
  if (statSync(f).isDirectory()) f = join(f, 'index.html');
  res.writeHead(200, { 'content-type': MIME[extname(f)] || 'application/octet-stream' });
  createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

// ------------------------------------------------------------ chrome
function findChrome() {
  const c = [process.env.CHROME_PATH];
  const cache = join(homedir(), '.cache/puppeteer/chrome-headless-shell');
  if (existsSync(cache)) for (const v of readdirSync(cache).sort().reverse()) {
    for (const sub of ['chrome-headless-shell-mac-arm64/chrome-headless-shell', 'chrome-headless-shell-mac-x64/chrome-headless-shell', 'chrome-headless-shell-linux64/chrome-headless-shell']) c.push(join(cache, v, sub));
  }
  c.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/usr/bin/google-chrome', '/usr/bin/chromium');
  return c.find((p) => p && existsSync(p));
}
const CHROME = findChrome();
if (!CHROME) { console.error('No Chrome found. Run: npx @puppeteer/browsers install chrome-headless-shell@stable'); process.exit(2); }
const profile = mkdtempSync(join(tmpdir(), 'promo-check-'));
const chrome = spawn(CHROME, ['--headless', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--hide-scrollbars', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((res, rej) => {
  let buf = '';
  chrome.stderr.on('data', (d) => { buf += d; const m = /ws:\/\/[^\s]+/.exec(buf); if (m) res(m[0]); });
  setTimeout(() => rej(new Error('chrome did not start')), 20000);
});
const port = new URL(wsUrl).port;
const target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pending = new Map(); let pageErrors = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') pageErrors.push(m.params.exceptionDetails.exception?.description?.split('\n').slice(0, 2).join(' ') || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') pageErrors.push(m.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 300));
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'eval failed');
  return r.result?.result?.value;
};
await send('Runtime.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 0.5, mobile: false });

// ------------------------------------------------------------ in-page lint
const LINT = String.raw`(() => {
  const st = document.getElementById('stage').getBoundingClientRect(), k = st.width / 1920;
  const visible = (el) => { for (let e = el; e && e.id !== 'stage'; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; } return true; };
  const boxes = [];
  for (const el of document.querySelectorAll('#scene *')) {
    if (!['SPAN','B','P','DIV','H1','H2','H3','H4','CODE','LI','SMALL','KBD','TD','TH'].includes(el.tagName)) continue;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
    if (own.length < 2 || !visible(el)) continue;
    const r = el.getBoundingClientRect();
    const b = { x: (r.left - st.left) / k, y: (r.top - st.top) / k, w: r.width / k, h: r.height / k, text: own.slice(0, 40),
      headline: !!el.closest('.headline'), bot: !!el.closest('.bot-wrap'), cap: false };
    if (b.w < 2 || b.h < 2) continue;
    boxes.push(b);
  }
  const issues = [];
  for (const b of boxes) {
    const inside = b.x + b.w > 0 && b.y + b.h > 0 && b.x < 1920 && b.y < 1080; // fully outside = parked off-screen on purpose
    if (inside && (b.x < -4 || b.y < -4 || b.x + b.w > 1924 || b.y + b.h > 1084)) issues.push({ level: 'warn', type: 'offframe', text: b.text, box: [b.x, b.y, b.w, b.h].map(Math.round) });
    if (document.querySelector('.cap') && b.y + b.h > 945 && b.x + b.w > 300 && b.x < 1620 && !b.bot) issues.push({ level: 'warn', type: 'caption-band', text: b.text, box: [b.x, b.y, b.w, b.h].map(Math.round) });
  }
  // headline text overlapping other visible text (the #1 layout bug)
  const heads = boxes.filter((b) => b.headline), rest = boxes.filter((b) => !b.headline);
  for (const h of heads) for (const o of rest) {
    const ix = Math.min(h.x + h.w, o.x + o.w) - Math.max(h.x, o.x), iy = Math.min(h.y + h.h, o.y + o.h) - Math.max(h.y, o.y);
    if (ix > 8 && iy > 8) issues.push({ level: o.bot ? 'warn' : 'error', type: 'headline-overlap', text: h.text + ' ⟷ ' + o.text, box: [o.x, o.y, o.w, o.h].map(Math.round) });
  }
  const sceneEls = document.querySelectorAll('#scene *').length;
  if (sceneEls < 3) issues.push({ level: 'error', type: 'blank-scene', text: 'scene has almost no elements' });
  if (document.fonts.status !== 'loaded') issues.push({ level: 'warn', type: 'fonts', text: 'fonts still loading' });
  const seen = new Set();
  return issues.filter((i) => { const key = i.type + i.text; if (seen.has(key)) return false; seen.add(key); return true; });
})()`;

// ------------------------------------------------------------ run
const report = { project: dir, date: new Date().toISOString(), results: [] };
let errors = 0, warns = 0;
for (const lang of langs) {
  pageErrors = [];
  await send('Page.navigate', { url: `${base}index.html?export=1&action=${lang}` });
  let ready = false;
  for (let i = 0; i < 300 && !ready; i++) { await new Promise((r) => setTimeout(r, 100)); ready = await ev('!!window.__READY__').catch(() => false); }
  if (!ready) { console.log(`✖ [${lang}] page never became ready:\n  ${pageErrors.join('\n  ') || '(no error text — check src/main.js awaits)'}`); errors++; continue; }
  await ev(`window.__EXPORT__.prepare({ target: 'promo', action: '${lang}' })`);
  const shots = [];
  for (const s of tl.scenes) {
    if (only && s.id !== only) continue;
    const d = s.end - s.start;
    const times = Array.from({ length: per }, (_, i) => +(s.start + d * (per === 1 ? 0.6 : 0.25 + (0.7 * i) / (per - 1))).toFixed(2));
    for (const t of times) {
      pageErrors = [];
      let issues = [];
      try { await ev(`window.__EXPORT__.seek(${t})`); await ev('document.fonts.ready.then(() => true)'); issues = await ev(LINT); }
      catch (e) { issues = [{ level: 'error', type: 'seek-crash', text: String(e.message).split('\n')[0] }]; }
      for (const pe of pageErrors) issues.push({ level: 'error', type: 'page-error', text: pe });
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const file = join(out, `${lang}-${s.id}-${t.toFixed(2)}.png`);
      writeFileSync(file, Buffer.from(shot.result.data, 'base64'));
      shots.push(file);
      report.results.push({ lang, scene: s.id, t, file, issues });
      const e = issues.filter((i) => i.level === 'error').length, w = issues.length - e;
      errors += e; warns += w;
      console.log(`${e ? '✖' : w ? '!' : '✓'} [${lang}] ${s.id} t=${t}${issues.length ? '' : '  ok'}`);
      for (const i of issues) console.log(`    ${i.level === 'error' ? 'ERROR' : 'warn '} ${i.type}: ${i.text}${i.box ? '  @' + i.box.join(',') : ''}`);
    }
  }
  // contact sheet (per columns)
  if (shots.length && spawnSync('ffmpeg', ['-version']).status === 0) {
    const cols = per, rows = Math.ceil(shots.length / cols);
    const inputs = shots.flatMap((f) => ['-i', f]);
    const pads = shots.map((_, i) => `[${i}:v]scale=480:-1[v${i}]`).join(';');
    const grid = `${shots.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${shots.length}:layout=${shots.map((_, i) => `${(i % cols) * 480}_${Math.floor(i / cols) * 270}`).join('|')}`;
    const sheet = join(out, `sheet-${lang}.png`);
    const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', shots.length > 1 ? `${pads};${grid}` : `[0:v]scale=480:-1`, sheet]);
    if (r.status === 0) console.log(`  sheet → ${sheet}  (${cols}×${rows}, read it to eyeball the scenes)`);
  }
}
writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log(`\n${errors ? '✖' : '✓'} ${errors} error(s), ${warns} warning(s) — report: ${join(out, 'report.json')}`);
ws.close(); chrome.kill(); server.close();
await new Promise((r) => chrome.once('exit', r));
try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch {}
process.exit(errors ? 1 : 0);
