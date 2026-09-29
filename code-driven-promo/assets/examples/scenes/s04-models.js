// S4 Models 23–31s — Jelly (Connecting) conjures a logo cloud that lands in
// the real model picker.
import { brand, modelPicker, modelRow, ic } from '../ui.js';

export default function s04(ctx) {
  const { tl, gsap } = ctx;
  tl.set(ctx.bg.params, { glow: 0.55, fx: 0.27, fy: 0.5 }, 0);

  const CX = 470, CY = 560;
  const jelly = ctx.bot('jelly', { size: 250, x: CX - 125, y: CY - 125, state: 'connection', name: 'Jelly<small>Connecting</small>' });
  tl.from(jelly, { scale: 0, duration: 0.6, ease: 'back.out(2)' }, 0.1);

  const apis = [['OpenAI', 'OpenAI'], ['Anthropic', 'Anthropic'], ['Gemini', 'Google'], ['Groq', 'Groq'], ['DeepSeek', 'DeepSeek'], ['Ollama', 'Ollama']];
  const clis = [['OpenCode', 'OpenCode'], ['Codex', 'Codex'], ['Gemini', 'Gemini CLI'], ['Cursor', 'Cursor']];
  const chipHtml = (b, label, cls) => `<div class="abs glass logo-chip ${cls}" style="display:flex;align-items:center;gap:10px;padding:10px 16px 10px 12px;border-radius:999px;font-size:21px;font-weight:600;white-space:nowrap">${brand(b, 28)}${label}</div>`;
  const orbit = ctx.el(`<div class="layer"></div>`);
  const place = (list, R, cls, a0, at0) => list.map(([b, label], i) => {
    const el = ctx.el(chipHtml(b, label, cls), orbit);
    const a = a0 + (i / list.length) * Math.PI * 2;
    gsap.set(el, { left: CX, top: CY, xPercent: -50, yPercent: -50 });
    const o = { a };
    const pos = () => gsap.set(el, { x: Math.cos(o.a) * R * 1.15, y: Math.sin(o.a) * R });
    pos();
    tl.from(el, { scale: 0, opacity: 0, duration: 0.45, ease: 'back.out(2)' }, at0 + i * 0.1);
    tl.to(o, { a: a + (cls === 'api' ? 0.9 : -0.7), duration: 3.4, ease: 'none', onUpdate: pos }, 0);
    return el;
  });
  const apiEls = place(apis, 245, 'api', -Math.PI / 2, 0.5);
  const cliEls = place(clis, 385, 'cli', -Math.PI / 3, 1.2);
  // dashed orbit rings
  const rings = ctx.el(`<svg class="abs" style="left:0;top:0;overflow:visible" width="1920" height="1080">
      <ellipse cx="${CX}" cy="${CY}" rx="${245 * 1.15}" ry="245" fill="none" stroke="rgba(255,255,255,.12)" stroke-dasharray="3 10" stroke-width="2"/>
      <ellipse cx="${CX}" cy="${CY}" rx="${385 * 1.15}" ry="385" fill="none" stroke="rgba(255,255,255,.08)" stroke-dasharray="3 10" stroke-width="2"/></svg>`, orbit);
  orbit.prepend(rings);
  tl.from(rings, { opacity: 0, scale: 0.6, transformOrigin: `${CX}px ${CY}px`, duration: 0.8 }, 0.3);

  // headline
  const h = ctx.headline([{ t: ctx.T.text[0] }, { t: ctx.T.text[1], cls: 'rb' }], { x: 1397, y: 150, size: 92 });
  ctx.wordsIn(h, 0.4);

  // model picker (real layout)
  const groups = [
    { head: 'API keys', label: 'OpenAI', icon: brand('OpenAI', 14), count: 12, ready: true, note: '' },
    { label: 'Anthropic', icon: brand('Anthropic', 14), count: 6, ready: true, note: '' },
    { label: 'Google', icon: brand('Gemini', 14), count: 8, ready: true },
    { label: 'Groq', icon: brand('Groq', 14), count: 9, ready: true },
    { label: 'DeepSeek', icon: brand('DeepSeek', 14), count: 3, ready: true },
    { head: 'CLI logins', label: 'OpenCode', icon: brand('OpenCode', 14), count: 24, ready: true },
    { label: 'Codex', icon: brand('Codex', 14), count: 4, ready: true },
    { label: 'Gemini CLI', icon: brand('Gemini', 14), count: 3, ready: true },
    { label: 'Cursor', icon: brand('Cursor', 14), count: 7, ready: false },
    { head: 'Local', label: 'Ollama', icon: brand('Ollama', 14), count: 5, ready: true },
  ];
  const openaiModels = [
    { icon: brand('OpenAI', 16), name: 'GPT-5', tag: 'API key' }, { icon: brand('OpenAI', 16), name: 'GPT-5 mini', tag: 'API key' },
    { icon: brand('OpenAI', 16), name: 'o4-mini', tag: 'API key' }, { icon: brand('OpenAI', 16), name: 'gpt-image-1', tag: 'Image', tagCls: 'cli' },
  ];
  const claudeModels = [
    { icon: brand('Claude', 16), name: 'Claude Opus 4.1', tag: 'API key' }, { icon: brand('Claude', 16), name: 'Claude Sonnet 4.5', tag: 'API key' },
    { icon: brand('Claude', 16), name: 'Claude Haiku 4.5', tag: 'API key' },
  ];
  const ollamaModels = [
    { icon: brand('Ollama', 16), name: 'qwen3:8b', tag: 'Local', tagCls: 'local' }, { icon: brand('Ollama', 16), name: 'llama3.2:3b', tag: 'Local', tagCls: 'local' },
    { icon: brand('Ollama', 16), name: 'gemma3:12b', tag: 'Local', tagCls: 'local' },
  ];
  const pick = ctx.el(`<div class="abs" style="left:960px;top:290px">${modelPicker({ groups, active: 0, models: openaiModels, activeModel: 0 })}</div>`);
  const mp = pick.firstElementChild;
  gsap.set(pick, { scale: 1.15, transformOrigin: '0 0' });
  tl.from(pick, { opacity: 0, y: 40, scale: 0.94, duration: 0.55, ease: 'power3.out' }, 3.0);

  // the orbiting logos fly into the picker
  [...apiEls, ...cliEls].forEach((el, i) => {
    tl.to(el, { left: 1080, top: 340 + (i % 10) * 40, scale: 0.3, opacity: 0, duration: 0.55, ease: 'power3.in' }, 3.0 + i * 0.04);
  });
  tl.to(rings, { opacity: 0, duration: 0.4 }, 3.1);
  tl.to(jelly, { x: 60, duration: 0.8, ease: 'power2.inOut' }, 3.1);

  // the trigger in the composer (bottom), then cursor picks models
  const trigger = ctx.el(`<div class="abs composer" style="left:960px;top:830px;width:874px;padding:12px 14px;zoom:1.0">
      <div class="cp-row" style="margin:0"><span class="cp-plus">${ic('plus', 'sz-4')}</span><span class="cp-folder">${ic('folder', 'sz-3_5')}~/Clients/Acme</span>
      <div class="ml-auto cp-right"><span class="cp-model"><span class="dot-ok"></span><span class="tr-ico">${brand('OpenAI', 14)}</span><span class="tr-name">GPT-5</span>${ic('chevron-down', 'sz-3_5 op60')}</span><span class="cp-send">${ic('arrow-up', 'sz-4')}</span></div></div></div>`);
  tl.from(trigger, { opacity: 0, y: 30, duration: 0.4 }, 3.3);

  const cur = ctx.cursor(1500, 1000);
  tl.to(cur, { opacity: 1, duration: 0.2 }, 3.6);
  const groupsEls = mp.querySelectorAll('.mp-group');
  const title = mp.querySelector('[data-slot=mp-title]');
  const models = mp.querySelector('[data-slot=mp-models]');
  const setGroup = (gi, list, act, at) => ctx.call(() => {
    groupsEls.forEach((g, j) => g.classList.toggle('on', j === gi));
    title.innerHTML = `${groups[gi].icon}<b>${groups[gi].label}</b>`;
    models.innerHTML = list.map((m, i) => modelRow(m, i === act)).join('');
  }, at);
  const gy = (gi) => 290 + (mp.querySelectorAll('.mp-group')[gi].offsetTop + 16) * 1.15;
  // Anthropic
  ctx.move(cur, 1060, gy(1), 3.9, 0.5); ctx.click(cur, 4.45); setGroup(1, claudeModels, -1, 4.5);
  ctx.move(cur, 1380, 290 + (52 + 46 + 23) * 1.15, 4.7, 0.45); ctx.click(cur, 5.2); setGroup(1, claudeModels, 1, 5.25);
  ctx.call(() => { trigger.querySelector('.tr-ico').innerHTML = brand('Claude', 14); trigger.querySelector('.tr-name').textContent = 'Claude Sonnet 4.5'; }, 5.3);
  // Local Ollama
  ctx.move(cur, 1060, gy(9), 5.6, 0.5); ctx.click(cur, 6.15); setGroup(9, ollamaModels, 0, 6.2);
  ctx.call(() => { trigger.querySelector('.tr-ico').innerHTML = brand('Ollama', 14); trigger.querySelector('.tr-name').textContent = 'qwen3:8b · Local'; }, 6.3);
  ctx.pose(jelly, 'done', 5.3);
  ctx.pose(jelly, 'working', 6.3);
  tl.to(cur, { opacity: 0, duration: 0.2 }, 7.3);
}
