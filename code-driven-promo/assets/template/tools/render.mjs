#!/usr/bin/env node
// Full pipeline (Code-driven Engine):
//   1. algorithmic music      audio/music.py            → audio/out/music.wav
//   2. temp voiceover (say)   tools/make-vo.mjs         → audio/out/vo-<lang>.wav + vo-timing.json
//   3. deterministic frames   tools/export-video.mjs    → exports/_work/Promo-<LANG>-silent.mp4
//   4. mix (VO ducks music, -14 LUFS)                   → exports/Promo-<LANG>.mp4 (+ -music.mp4 without VO)
//   5. 9:16 15 s cut (S2 + S11 + S12)                   → exports/Promo-<LANG>-vertical.mp4
//
// Usage: node tools/render.mjs [--langs th,en] [--fps 30] [--res 1080p] [--quality high]
//                              [--skip-audio] [--skip-video] [--skip-vertical] [--frames jpeg]
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const { values: o } = parseArgs({ options: {
  langs: { type: 'string', default: 'th,en' }, fps: { type: 'string', default: '30' }, res: { type: 'string', default: '1080p' },
  quality: { type: 'string', default: 'high' }, frames: { type: 'string', default: 'png' },
  'skip-audio': { type: 'boolean' }, 'skip-video': { type: 'boolean' }, 'skip-vertical': { type: 'boolean' },
} });
const langs = o.langs.split(',');
const tl = JSON.parse(readFileSync(join(root, 'src/timeline.json'), 'utf8'));
const OUT = join(root, 'exports'), WORK = join(OUT, '_work'), AUD = join(root, 'audio/out');
mkdirSync(WORK, { recursive: true });

const run = (cmd, args, opts = {}) => {
  console.log(`\n$ ${cmd} ${args.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(' ')}`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: root, ...opts });
  if (r.status !== 0) throw new Error(`${cmd} failed (${r.status})`);
};
const exportVideo = (target, lang, out, extra = []) => run('node', ['tools/export-video.mjs', root, '-t', target, '-a', lang,
  '-r', o.res, '-f', o.fps, '-q', o.quality, '--frame-format', o.frames, '-o', out, '-y', ...extra]);

// 1–2 audio
if (!o['skip-audio']) {
  run('python3', ['audio/music.py']);
  run('node', ['tools/make-vo.mjs', ...langs]);
}

for (const lang of langs) {
  const L = lang.toUpperCase();
  const silent = join(WORK, `Promo-${L}-silent.mp4`);
  // 3 frames
  if (!o['skip-video'] || !existsSync(silent)) exportVideo('promo', lang, silent);

  // 4 mix: VO on top, music side-chained under it, broadcast-ish loudness
  const vo = join(AUD, `vo-${lang}.wav`), music = join(AUD, 'music.wav');
  run('ffmpeg', ['-y', '-v', 'error', '-i', silent, '-i', music, '-i', vo, '-filter_complex',
    '[2:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[vo][key];' +
    '[1:a]volume=0.55[mus];' +
    '[mus][key]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=400:makeup=1[duck];' +
    '[duck][vo]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,apad[a]',
    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', '-t', String(tl.duration),
    join(OUT, `Promo-${L}.mp4`)]);
  run('ffmpeg', ['-y', '-v', 'error', '-i', silent, '-i', music, '-filter_complex', '[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,apad[a]',
    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', '-t', String(tl.duration),
    join(OUT, `Promo-${L}-music-only.mp4`)]);

  // 5 vertical 9:16 (15 s): clean frames (no captions) + header/footer overlay
  if (o['skip-vertical']) continue;
  const [[a0, a1], [b0, b1]] = [[7, 13], [81, 90]]; // bar-aligned: S2 drop + S11 tail → S12
  const segA = join(WORK, `clean-${L}-a.mp4`), segB = join(WORK, `clean-${L}-b.mp4`);
  exportVideo('clean', lang, segA, ['--start', String(a0), '-d', String(a1 - a0)]);
  exportVideo('clean', lang, segB, ['--start', String(b0), '-d', String(b1 - b0)]);
  const overlay = join(WORK, `vertical-overlay-${L}.png`);
  const server = spawn('node', ['tools/serve.mjs', '4399'], { cwd: root, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 600));
  try {
    run('node', ['tools/shoot.mjs', WORK, `http://localhost:4399/vertical.html?lang=${lang}=vertical-overlay-${L}`], { env: { ...process.env, TRANSPARENT: '1', W: '1080', H: '1920', WAIT: '1500' } });
  } finally { server.kill(); }
  const d1 = a1 - a0;
  run('ffmpeg', ['-y', '-v', 'error', '-i', segA, '-i', segB, '-loop', '1', '-i', overlay, '-i', music, '-filter_complex',
    '[0:v][1:v]concat=n=2:v=1:a=0,fps=' + o.fps + ',split[v1][v2];' +
    '[v1]scale=-2:1920,crop=1080:1920,gblur=sigma=28,eq=brightness=-0.22:saturation=1.2[bg];' +
    '[v2]scale=1080:-2[fg];' +
    '[bg][fg]overlay=0:600[b];[b][2:v]overlay=0:0:shortest=1,format=yuv420p[v];' +
    `[3:a]atrim=${a0}:${a1},asetpts=PTS-STARTPTS,afade=t=out:st=${d1 - 0.08}:d=0.08[x1];` +
    `[3:a]atrim=${b0}:${b1},asetpts=PTS-STARTPTS,afade=t=in:d=0.04[x2];` +
    '[x1][x2]concat=n=2:v=0:a=1,loudnorm=I=-14:TP=-1.5:LRA=11[a]',
    '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-c:a', 'aac', '-b:a', '192k', '-t', String(d1 + (b1 - b0)),
    '-movflags', '+faststart', join(OUT, `Promo-${L}-vertical.mp4`)]);
}
console.log('\n✓ done →', OUT);
