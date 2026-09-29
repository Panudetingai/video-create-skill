#!/usr/bin/env node
// Storyboard (.docx / .md / .txt) → src/timeline.json draft.
//
// Understands the common storyboard table layout:
//   | Shot / Time            | Visual + action | VO TH + Text TH | VO EN + Text EN |
//   | S1 Hook 0-7s ...       | ...             | VO: ... Text: ...| VO: ... Text: ...|
// and falls back to scanning lines that start with "S<n> ... <a>-<b>s".
//
// Usage: node storyboard-to-timeline.mjs <storyboard.docx> [out.json] [--bpm 120] [--url example.com]
// Prints a summary + warnings. Always review the output: it is a draft.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { extname } from 'node:path';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args.splice(i, 2)[1] : d; };
const bpm = +flag('bpm', 120);
const url = flag('url', 'example.com');
const [input, out = 'src/timeline.json'] = args;
if (!input || !existsSync(input)) { console.error('usage: storyboard-to-timeline.mjs <storyboard.docx|md|txt> [out.json]'); process.exit(1); }

const warnings = [];
const BOT_WORDS = /\b(Mochi|Jelly|Petal|Nori|Sora|Momo|Mikan|Ichigo)\b/gi;

// ------------------------------------------------------------ read rows
function docxRows(file) {
  let xml;
  try { xml = execFileSync('unzip', ['-p', file, 'word/document.xml'], { maxBuffer: 1 << 26 }).toString(); }
  catch { throw new Error(`${file} is not a readable .docx (re-download it? size must be > a few KB)`); }
  const text = (frag) => frag.split(/<\/w:p>/).map((p) => [...p.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join('')).filter(Boolean).join('\n');
  const rows = [];
  for (const tr of xml.split(/<w:tr[ >]/).slice(1)) {
    const cells = tr.split(/<w:tc[ >]/).slice(1).map((tc) => decode(text(tc)).trim());
    if (cells.length) rows.push(cells);
  }
  const paras = decode(text(xml.replace(/<w:tbl>[\s\S]*?<\/w:tbl>/g, ''))).split('\n');
  return { rows, paras };
}
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");

function textRows(file) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const rows = lines.filter((l) => l.includes('|')).map((l) => l.split('|').map((c) => c.trim()).filter((c, i, a) => !(c === '' && (i === 0 || i === a.length - 1))));
  return { rows, paras: lines };
}

const { rows, paras } = extname(input).toLowerCase() === '.docx' ? docxRows(input) : textRows(input);

// ------------------------------------------------------------ parse
const SHOT = /^S(\d+)\s*(.*?)\s*(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*s(?:ec)?\b\s*(.*)$/is;
function splitVoText(cell) {
  const c = cell.replace(/\s+/g, ' ').trim();
  const m = /VO\s*:\s*(.*?)\s*(?:Text\s*:\s*(.*))?$/is.exec(c);
  if (!m) return { vo: c, text: [] };
  let text = (m[2] || '').split(/\s+[-–·]\s+|\s*\/\s*/).map((s) => s.trim()).filter(Boolean);
  // one line with two questions/sentences → two headline lines
  if (text.length === 1) { const parts = text[0].split(/(?<=[?!])\s+/); if (parts.length > 1) text = parts; }
  return { vo: m[1].trim(), text };
}

const scenes = [];
for (const r of rows) {
  const m = SHOT.exec(r[0].replace(/\n/g, ' '));
  if (!m) continue;
  const [, n, name, a, b, rest] = m;
  const visual = r[1] || '';
  const th = splitVoText(r[2] || '');
  const en = splitVoText(r[3] || '');
  const bots = [...new Set([...(visual.match(BOT_WORDS) || [])].map((w) => w.toLowerCase()))];
  scenes.push({
    id: 's' + String(n).padStart(2, '0'), name: (name || rest || `Scene ${n}`).trim().split(/\s+/).slice(0, 3).join(' '),
    start: +a, end: +b, bots,
    visual: visual.replace(/\s+/g, ' ').trim(),
    th: { vo: th.vo, text: th.text.length ? th.text.slice(0, 2) : [th.vo.split(/[?!.…]/)[0]] },
    en: { vo: en.vo, text: en.text.length ? en.text.slice(0, 2) : [en.vo.split(/[?!.…]/)[0]] },
  });
}
if (!scenes.length) {
  console.error('No shots found. Expected rows like "S1 Hook 0-7s" in the first column.');
  process.exit(1);
}

// cast paragraph, e.g. "S1 Mochi, S2 ทั้งทีม, S3 Sora Petal Nori, ..." fills scenes with no named bot
const ALL = ['mochi', 'jelly', 'petal', 'nori', 'sora', 'momo'];
for (const line of paras) {
  for (const m of line.matchAll(/\bS(\d+)\s+([^,]+?)(?=,\s*S\d+\b|\s+-\s|$)/g)) {
    const sc = scenes.find((x) => x.id === 's' + m[1].padStart(2, '0'));
    if (!sc) continue;
    const names = [...new Set([...(m[2].match(BOT_WORDS) || [])].map((w) => w.toLowerCase()))];
    const team = /ทั้งทีม|whole team|all bots|ทั้ง?ทีม/i.test(m[2]) ? ALL : [];
    for (const b of [...names, ...team]) if (!sc.bots.includes(b)) sc.bots.push(b);
  }
}

// ------------------------------------------------------------ checks
scenes.sort((x, y) => x.start - y.start);
for (let i = 0; i < scenes.length; i++) {
  const s = scenes[i];
  if (s.end <= s.start) warnings.push(`${s.id}: end ${s.end} <= start ${s.start}`);
  if (i && Math.abs(scenes[i - 1].end - s.start) > 1e-6) warnings.push(`${scenes[i - 1].id}→${s.id}: gap/overlap (${scenes[i - 1].end} vs ${s.start})`);
  const dur = s.end - s.start;
  for (const lang of ['th', 'en']) {
    if (!s[lang].vo) warnings.push(`${s.id}: missing ${lang.toUpperCase()} VO`);
    // rough speech-rate check: TH ~ 11 chars/s, EN ~ 15 chars/s
    const cps = s[lang].vo.replace(/\s/g, '').length / Math.max(0.5, dur - 0.7);
    if (cps > (lang === 'th' ? 12 : 16)) warnings.push(`${s.id}: ${lang.toUpperCase()} VO is long for ${dur}s (${cps.toFixed(1)} chars/s) → TTS will be sped up; consider voLead/voTail or shorter text`);
  }
  if (!s.bots.length) warnings.push(`${s.id}: no character named in the visual column`);
}
const duration = scenes.at(-1).end;
const titleLine = paras.find((p) => p.trim()) || 'Promo';
const timeline = { title: titleLine.trim(), duration, bpm, size: [1920, 1080], scenes, url, verticalCut: [[scenes[1]?.start ?? 0, (scenes[1]?.start ?? 0) + 6], [Math.max(0, duration - 9), duration]] };
writeFileSync(out, JSON.stringify(timeline, null, 2) + '\n');

console.log(`✓ ${scenes.length} scenes, ${duration}s → ${out}`);
for (const s of scenes) console.log(`  ${s.id} ${String(s.start).padStart(4)}–${String(s.end).padEnd(4)} ${s.name.padEnd(18)} bots: ${s.bots.join(',') || '-'}`);
if (warnings.length) { console.log('\nwarnings:'); for (const w of warnings) console.log('  ! ' + w); }
