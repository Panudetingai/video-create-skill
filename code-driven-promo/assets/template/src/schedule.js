// Voiceover / caption schedule — shared by the page (captions) and
// tools/make-vo.mjs (audio placement), so sound and subtitles can't drift.

export const VO_LEAD = 0.35; // VO starts this long after the cut
export const VO_TAIL = 0.3; // ...and must end this long before the next cut

/** Split a VO line into caption chunks that read well on one line. */
export function chunkVo(text, lang) {
  const max = lang === 'th' ? 26 : 44;
  // phrases: Thai breaks on spaces, English on punctuation
  const phrases = lang === 'th'
    ? text.replace(/\.\.\./g, '…').split(/\s+/).filter(Boolean)
    : text.split(/(?<=[,.?!:])\s+/).filter(Boolean);
  const chunks = [];
  let cur = '';
  for (const p of phrases) {
    const next = cur ? cur + ' ' + p : p;
    if (cur && next.length > max) { chunks.push(cur); cur = p; } else cur = next;
  }
  if (cur) chunks.push(cur);
  // English phrases can still be long: split them on words
  return chunks.flatMap((c) => {
    if (c.length <= max) return [c];
    const words = c.split(' '); const out = []; let line = '';
    for (const w of words) { const n = line ? line + ' ' + w : w; if (line && n.length > max) { out.push(line); line = w; } else line = n; }
    if (line) out.push(line);
    return out;
  });
}

/**
 * Caption cues for one scene.
 * @param voDur measured length of the spoken clip (s), or undefined → fill the scene
 */
export function sceneCues(scene, lang, voDur) {
  const text = scene[lang].vo;
  const chunks = chunkVo(text, lang);
  const t0 = scene.start + (scene.voLead ?? VO_LEAD);
  const room = scene.end - (scene.voTail ?? VO_TAIL) - t0;
  const len = Math.min(room, voDur ?? room);
  const weights = chunks.map((c) => Math.max(6, c.length));
  const total = weights.reduce((a, b) => a + b, 0);
  let t = t0;
  return chunks.map((c, i) => {
    const d = (len * weights[i]) / total;
    const cue = { text: c, start: t, end: i === chunks.length - 1 ? Math.max(t + d, scene.end - (scene.voTail ?? VO_TAIL)) : t + d };
    t += d;
    return cue;
  });
}

export function allCues(timeline, lang, voTiming = {}) {
  return timeline.scenes.flatMap((s) => sceneCues(s, lang, voTiming[lang]?.[s.id]));
}
