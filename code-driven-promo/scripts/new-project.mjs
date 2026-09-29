#!/usr/bin/env node
// Scaffold a complete, renderable promo project in one command.
//
// Usage:
//   node new-project.mjs <dir> [--storyboard file.docx] [--app ../MyApp] [--url example.com]
//
// What it does:
//   1. copies assets/template → <dir>   (engine, UI kit, tools, music, exporter)
//   2. storyboard → src/timeline.json   (or a 3-scene sample if none given)
//   3. one scene file per shot from a recipe guessed from its position/name
//   4. bun/npm install
//   5. if --app has public/anim/cowork-bots.html or lucide/lobehub deps, re-extracts bots/icons from it
// After this, `npm run dev` previews and `npm run render` renders — every scene works from minute one.
import { cpSync, existsSync, writeFileSync, readFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
const storyboard = flag('storyboard'), appDir = flag('app'), url = flag('url') ?? 'example.com';
const dir = args[0] && resolve(args[0]);
if (!dir) { console.error('usage: new-project.mjs <dir> [--storyboard file] [--app path] [--url domain]'); process.exit(1); }
if (existsSync(dir) && readdirSync(dir).filter((f) => !f.startsWith('.')).length) { console.error(`${dir} is not empty`); process.exit(1); }

const step = (s) => console.log(`\n▸ ${s}`);
const run = (cmd, a, cwd = dir) => { const r = spawnSync(cmd, a, { cwd, stdio: 'inherit' }); return r.status === 0; };

step('copy template');
mkdirSync(dir, { recursive: true });
cpSync(join(here, '..', 'assets', 'template'), dir, { recursive: true });
writeFileSync(join(dir, '.gitignore'), 'node_modules/\nexports/\naudio/out/vo-tmp/\n.DS_Store\n');

step('timeline');
const tlPath = join(dir, 'src/timeline.json');
if (storyboard) {
  if (!run('node', [join(here, 'storyboard-to-timeline.mjs'), resolve(storyboard), tlPath, '--url', url], process.cwd())) process.exit(1);
} else {
  writeFileSync(tlPath, JSON.stringify({
    title: 'Sample promo', duration: 20, bpm: 120, size: [1920, 1080], url,
    scenes: [
      { id: 's01', name: 'Hero', start: 0, end: 8, bots: ['mochi', 'jelly', 'petal'], th: { vo: 'นี่คือผลิตภัณฑ์ของเรา', text: ['My App', 'ทำงานบนเครื่องคุณ'] }, en: { vo: 'Meet our product.', text: ['My App', 'Runs on your machine'] } },
      { id: 's02', name: 'Demo', start: 8, end: 16, bots: ['petal'], th: { vo: 'สั่งงานครั้งเดียว ได้ผลทันที', text: ['สั่งครั้งเดียว', 'ได้ผลทันที'] }, en: { vo: 'One request, instant results.', text: ['One request.', 'Instant results.'] } },
      { id: 's03', name: 'CTA', start: 16, end: 20, bots: ['mochi', 'jelly', 'petal'], th: { vo: 'โหลดฟรีวันนี้', text: ['โหลดฟรี', 'เริ่มเลย!'] }, en: { vo: 'Download free today.', text: ['Download free', 'Start!'] } },
    ],
    verticalCut: [[0, 6], [11, 20]],
  }, null, 2) + '\n');
}

step('scenes from recipes');
const tl = JSON.parse(readFileSync(tlPath, 'utf8'));
tl.scenes.forEach((s, i) => {
  const n = `${s.name} ${s.visual ?? ''}`.toLowerCase();
  const recipe = i === tl.scenes.length - 1 || /\bcta\b|get started/i.test(s.name) ? 'cta'
    : i === 0 && /hook|problem|ปัญหา|งานล้น/.test(n) ? 'hook'
      : i <= 2 && (/hero|logo|intro/.test(n) || s.bots.length >= 4) ? 'hero'
        : /split|\bvs\b|compare|\bmodes?\b|arena|เทียบ|โหมด|3 จอ/.test(n) ? 'split'
          : /mcp|connect|skill|template|plug|card|การ์ด|สกิล/.test(n) ? 'cards' : 'app';
  run('node', [join(here, 'new-scene.mjs'), dir, s.id, recipe]);
});

step('install packages');
if (!run('bun', ['install'])) run('npm', ['install']);

if (appDir) {
  step(`extract bots/icons from ${appDir}`);
  const app = resolve(appDir);
  if (existsSync(join(app, 'public/anim/cowork-bots.html'))) run('node', ['tools/extract-bots.mjs', app]);
  else console.log('  (no public/anim/cowork-bots.html — keeping the bundled CoworkBots)');
  if (existsSync(join(app, 'node_modules/lucide-react'))) run('node', ['tools/extract-icons.mjs', app]);
  else console.log('  (no lucide-react in the app — keeping the bundled icons)');
}

console.log(`\n✓ project ready: ${dir}
  next:  cd ${dir}
         npm run dev                 # preview http://localhost:4321
         node ${join(here, 'check.mjs')} .   # automatic QA (errors, overlaps, contact sheet)
         npm run render              # music + VO + frames + mix + 9:16`);
