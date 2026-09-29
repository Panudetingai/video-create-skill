#!/usr/bin/env node
// Temp voiceover from macOS `say` (TH: Kanya, EN: Samantha), placed on the
// same schedule the captions use (src/schedule.js). Clips that run long are
// time-stretched (atempo) to fit their scene. Writes:
//   audio/out/vo-th.wav, audio/out/vo-en.wav   (48 kHz mono)
//   audio/out/vo-timing.json                     (spoken length per scene → captions)
//
// Replace with a real recording later: drop audio/out/vo-<lang>.wav in place
// (same timing) and re-run the render.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VO_LEAD, VO_TAIL } from '../src/schedule.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const tl = JSON.parse(readFileSync(join(root, 'src/timeline.json'), 'utf8'));
const out = join(root, 'audio/out');
const tmp = join(out, 'vo-tmp');
mkdirSync(tmp, { recursive: true });
const SR = 48000;
const langs = process.argv.slice(2).length ? process.argv.slice(2) : ['th', 'en'];
const VOICES = { th: { voice: 'Kanya', rate: 190 }, en: { voice: 'Samantha', rate: 185 } };

// how the TTS should *say* words that the captions *show*
const SAY = {
  th: [[/Command K/g, 'คอมมานด์ เค'], [/telemetry/g, 'เทเลเมทรี'], [/Undo/g, 'อันดู'], [/Gmail/g, 'จีเมล'], [/Notion/g, 'โนชั่น'],
    [/Figma/g, 'ฟิกม่า'], [/Word/g, 'เวิร์ด'], [/\bAI\b/g, 'เอไอ'], [/2-3/g, 'สองถึงสาม'], [/3 งาน/g, 'สามงาน'], [/\.\.\./g, ' ']],
  en: [[/Command K/g, 'Command-K']],
};

const timing = {};
try { Object.assign(timing, JSON.parse(readFileSync(join(out, 'vo-timing.json'), 'utf8'))); } catch {}

for (const lang of langs) {
  const total = new Float32Array(Math.ceil(tl.duration * SR));
  timing[lang] = {};
  for (const s of tl.scenes) {
    let text = s[lang].vo;
    for (const [re, rep] of SAY[lang] ?? []) text = text.replace(re, rep);
    const aiff = join(tmp, `${lang}-${s.id}.aiff`);
    execFileSync('say', ['-v', VOICES[lang].voice, '-r', String(s[lang].sayRate ?? VOICES[lang].rate), '-o', aiff, text]);
    const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', aiff]).toString().trim();
    const lead = s.voLead ?? VO_LEAD;
    const room = s.end - (s.voTail ?? VO_TAIL) - (s.start + lead);
    const tempo = dur > room ? dur / room : 1;
    const filters = [`silenceremove=start_periods=1:start_threshold=-50dB`, tempo > 1 ? `atempo=${tempo.toFixed(4)}` : null, 'highpass=f=90', 'acompressor=threshold=-18dB:ratio=3:attack=5:release=80']
      .filter(Boolean).join(',');
    const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', aiff, '-af', filters, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
    const pcm = new Float32Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength));
    const at = Math.round((s.start + lead) * SR);
    for (let i = 0; i < pcm.length && at + i < total.length; i++) total[at + i] += pcm[i];
    timing[lang][s.id] = +(pcm.length / SR).toFixed(3);
    console.log(`${lang} ${s.id}: ${dur.toFixed(2)}s → ${(pcm.length / SR).toFixed(2)}s (room ${room.toFixed(2)}s${tempo > 1 ? `, ×${tempo.toFixed(2)}` : ''})`);
  }
  // normalise to -3 dBFS peak
  let peak = 0;
  for (const v of total) peak = Math.max(peak, Math.abs(v));
  const g = peak ? 0.707 / peak : 1;
  const pcm16 = Buffer.alloc(total.length * 2);
  for (let i = 0; i < total.length; i++) pcm16.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(total[i] * g * 32767))), i * 2);
  writeFileSync(join(out, `vo-${lang}.wav`), Buffer.concat([wavHeader(pcm16.length, 1, SR), pcm16]));
}
writeFileSync(join(out, 'vo-timing.json'), JSON.stringify(timing, null, 2));
rmSync(tmp, { recursive: true, force: true });
console.log('wrote audio/out/vo-*.wav + vo-timing.json');

function wavHeader(bytes, ch, sr) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + bytes, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(ch, 22); h.writeUInt32LE(sr, 24);
  h.writeUInt32LE(sr * ch * 2, 28); h.writeUInt16LE(ch * 2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(bytes, 40);
  return h;
}
