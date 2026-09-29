#!/usr/bin/env node
// Screenshot pages over the Chrome DevTools Protocol (no npm deps, Node >= 22).
// Usage: node tools/shoot.mjs <outDir> <url>=<name> [<url>=<name> ...]
//   env PRE_JS   : JS evaluated on the origin before the shots (e.g. seed localStorage)
//   env W,H      : viewport (default 1440x900)
//   env WAIT     : ms to wait after load (default 2500)
//   env EVAL_<name> : JS to run on that page before its shot
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME_PATH ||
  join(homedir(), '.cache/puppeteer/chrome-headless-shell/mac_arm-131.0.6778.204/chrome-headless-shell-mac-arm64/chrome-headless-shell');
const [outDir, ...pairs] = process.argv.slice(2);
const W = +(process.env.W || 1440), H = +(process.env.H || 900), WAIT = +(process.env.WAIT || 2500);
mkdirSync(outDir, { recursive: true });

const profile = mkdtempSync(join(tmpdir(), 'shoot-'));
const chrome = spawn(CHROME, ['--headless', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
  '--hide-scrollbars', '--force-device-scale-factor=1', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((res, rej) => {
  let buf = '';
  chrome.stderr.on('data', (d) => { buf += d; const m = /ws:\/\/[^\s]+/.exec(buf); if (m) res(m[0]); });
  setTimeout(() => rej(new Error('chrome did not start')), 15000);
});
const port = new URL(wsUrl).port;
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pending = new Map(); const logs = [];
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  if (msg.method === 'Runtime.exceptionThrown') logs.push('EXC ' + msg.params.exceptionDetails.exception?.description?.slice(0, 200));
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const evalJs = async (expr) => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;

await send('Runtime.enable');
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
if (process.env.TRANSPARENT) await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
let seeded = false;
for (const pair of pairs) {
  const eq = pair.lastIndexOf('=');
  const url = pair.slice(0, eq), name = pair.slice(eq + 1);
  if (!seeded && process.env.PRE_JS) {
    await send('Page.navigate', { url: new URL(url).origin + '/__blank__' });
    await sleep(800);
    await evalJs(process.env.PRE_JS);
    seeded = true;
  }
  await send('Page.navigate', { url });
  await sleep(WAIT);
  const extra = process.env['EVAL_' + name];
  if (extra) { await evalJs(extra); await sleep(1200); }
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(outDir, name + '.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('shot', name);
}
if (logs.length) console.log(logs.slice(0, 10).join('\n'));
ws.close(); chrome.kill();
await new Promise((r) => chrome.once('exit', r));
try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* temp dir, ignore */ }
