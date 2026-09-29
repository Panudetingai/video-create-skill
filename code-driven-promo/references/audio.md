# Audio: music, voiceover, mix

## Music: `audio/music.py` (numpy only, ~3 s to run)
Reads `src/timeline.json` for BPM, duration and cut times, so it follows edits automatically.
- Sections: `section_energy(t)` → intro (before the first cut: pad, clock ticks, riser),
  groove (drums, bass, Rhodes chords Fmaj9–Em7–Dm9–Cmaj7, pluck arp), build (last
  non-CTA scene: brighter arp, pad, snare roll), outro (button ending on the last scene).
  The hard-coded seconds in it (7, 79, 84–86, 86, 88) are the Mali timeline, so **change them to your cuts**.
- Every cut gets a whoosh (0.36 s before) + sub hit. Sparkle bells at celebration
  times: edit the `for at in (...)` lists to match `ctx.confetti` times.
- Checking without ears: `ffmpeg -i audio/out/music.wav -af volumedetect -f null -`
  (mean ≈ −20 dB, max ≈ −1 dB) and a spectrogram:
  `ffmpeg -i audio/out/music.wav -lavfi showspectrumpic=s=1600x400:scale=log music.png` then look at it:
  quiet intro, a drop at the first cut, dense groove, ending. Too much yellow under ~300 Hz = muddy.

## Voiceover: `tools/make-vo.mjs` (macOS `say`)
- TH voice Kanya, EN Samantha. `SAY` table rewrites words for pronunciation only
  (captions keep the original): add entries for product names/English words in Thai lines.
- Each scene's clip starts at `start + voLead` (0.35 s) and must end by `end - voTail` (0.3 s);
  longer clips are time-stretched (`atempo`). Over ×1.25 sounds rushed: shorten
  the line, raise `sayRate`, or shrink `voLead/voTail` for that scene.
- Writes `audio/out/vo-timing.json`; captions use it, so subtitles match the spoken length.
- It's a **temp track**. Real recording: one file per language, same 48 kHz,
  each line starting 0.35 s after its cut → `audio/out/vo-th.wav`, then
  `node tools/render.mjs --skip-audio --skip-video`.

## Mix (inside `tools/render.mjs`)
VO on top; music at 0.55 side-chain-ducked by the VO (`sidechaincompress`), then
`loudnorm I=-14 TP=-1.5` (YouTube/TikTok level) and `apad` + `-t duration` so
the file is exactly the timeline length. Verify:
`ffmpeg -i exports/Promo-TH.mp4 -af ebur128 -f null - 2>&1 | grep -A1 Integrated` → about −14 LUFS.
