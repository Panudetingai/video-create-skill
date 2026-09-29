#!/usr/bin/env node
// Render still frames through the same __EXPORT__ bridge the exporter uses.
// Usage: node tools/stills.mjs <outDir> <lang> <t1> [t2 ...]   (env URL, SCALE)
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME_PATH ||
  join(homedir(), '.cache/puppeteer/chrome-headless-shell/mac_arm-131.0.6778.204/chrome-headless-shell-mac-arm64/chrome-headless-shell');
const [outDir, lang, ...times] = process.argv.slice(2);
const URL_ = process.env.URL || 'http://localhost:4321/';
const SCALE = +(process.env.SCALE || 0.5);
mkdirSync(outDir, { recursive: true });

const profile = mkdtempSync(join(tmpdir(), 'stills-'));
const chrome = spawn(CHROME, ['--headless', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--hide-scrollbars',
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((res, rej) => {
  let buf = '';
  chrome.stderr.on('data', (d) => { buf += d; const m = /ws:\/\/[^\s]+/.exec(buf); if (m) res(m[0]); });
  setTimeout(() => rej(new Error('chrome did not start')), 15000);
});
const port = new URL(wsUrl).port;
const page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pending = new Map(); const logs = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') logs.push('EXC ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) logs.push(m.params.type + ' ' + m.params.args.map((a) => a.value ?? a.description).join(' '));
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evalJs = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'eval failed');
  return r.result?.result?.value;
};
await send('Runtime.enable'); await send('Page.enable');
if (process.env.VCLOCK) {
  // reproduce the exporter's page environment (its injected virtual clock)
  const { readFileSync } = await import('node:fs');
  const src = readFileSync(new URL('./export-video.mjs', import.meta.url), 'utf8');
  const vc = /const VIRTUAL_CLOCK = String\.raw`([\s\S]*?)`;/.exec(src)[1];
  await send('Page.addScriptToEvaluateOnNewDocument', { source: vc });
}
await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: SCALE, mobile: false });
await send('Page.navigate', { url: `${URL_}?export=1&action=${lang}` });
let ready = false;
for (let i = 0; i < 200; i++) { await new Promise((r) => setTimeout(r, 100)); if (await evalJs('!!window.__READY__').catch(() => false)) { ready = true; break; } }
if (!ready) { console.log('NOT READY', logs.join('\n'), await evalJs('document.readyState + " fonts:" + document.fonts.status')); }
await evalJs(`window.__EXPORT__.prepare({ action: '${lang}' })`);
for (const t of times) {
  const t0 = Date.now();
  await evalJs(`window.__EXPORT__.seek(${t})`);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(outDir, `${lang}-${String(t).padStart(5, '0')}.png`), Buffer.from(shot.result.data, 'base64'));
  console.log(`t=${t} (${Date.now() - t0}ms)`);
}
if (logs.length) console.log(logs.slice(0, 15).join('\n'));
ws.close(); chrome.kill();
await new Promise((r) => chrome.once('exit', r));
try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* temp dir, ignore */ }
