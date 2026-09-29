// Mali Cowork UI, rebuilt as plain HTML for the promo.
// Each builder mirrors a real component in Mali-Cowork/src (file noted above
// it): same structure, spacing, tokens (index.css .dark) and lucide icons.
import { LUCIDE, BRANDS } from './vendor/icons.js';

export const ic = (name, cls = '', size) => {
  const s = LUCIDE[name];
  if (!s) throw new Error('icon ' + name);
  const st = size ? ` style="width:${size}px;height:${size}px"` : '';
  return `<svg class="lc ${cls}"${st} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${s}</svg>`;
};

const BRAND_COLORS = {
  OpenAI: '#ffffff', Anthropic: '#d97757', Claude: '#d97757', Google: '#4285f4', Gemini: '#3186ff', Groq: '#f55036',
  DeepSeek: '#4d6bfe', Ollama: '#ffffff', OpenCode: '#ffffff', Codex: '#ffffff', Cursor: '#ffffff', Notion: '#ffffff',
  Figma: '#a259ff', Microsoft: '#00a4ef', Apple: '#ffffff', Github: '#ffffff', GithubCopilot: '#ffffff',
};
export const brand = (name, size = 16, color) => {
  const b = BRANDS[name];
  if (!b) throw new Error('brand ' + name);
  return `<svg class="brand" width="${size}" height="${size}" viewBox="${b.vb}" fill="${color ?? BRAND_COLORS[name] ?? 'currentColor'}" fill-rule="evenodd" aria-hidden="true">${b.mono}</svg>`;
};

/** Non-lobehub marks drawn as simple tiles (Gmail, Playwright, Word, Windows, Linux). */
export const tileMark = (label, bg, fg = '#fff', size = 16, radius = 4) =>
  `<span class="tile-mark" style="width:${size}px;height:${size}px;background:${bg};color:${fg};border-radius:${radius}px;font-size:${Math.round(size * 0.58)}px">${label}</span>`;

export const MARKS = {
  Gmail: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285f4" d="M2 6.5 4.5 5v13H3a1 1 0 0 1-1-1z"/><path fill="#34a853" d="M22 6.5 19.5 5v13H21a1 1 0 0 0 1-1z"/><path fill="#ea4335" d="M4.5 5 12 10.6 19.5 5v3.2L12 13.8 4.5 8.2z"/><path fill="#fbbc04" d="M19.5 5 22 6.5v.4l-2.5 1.3z"/><path fill="#c5221f" d="M4.5 5 2 6.5v.4l2.5 1.3z"/></svg>`,
  Playwright: (s = 16) => tileMark('▶', '#2ead33', '#fff', s),
  Word: (s = 16) => tileMark('W', '#185abd', '#fff', s),
  Windows: (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true" fill="#fff"><path d="M3 5.5 10.5 4.5v7H3zM11.5 4.3 21 3v8.5h-9.5zM3 12.5h7.5v7L3 18.5zM11.5 12.5H21V21l-9.5-1.3z"/></svg>`,
  Linux: (s = 16) => tileMark('🐧', 'transparent', '#fff', s),
};

// ---------------------------------------------------------------- titlebar
// components/app/titlebar/titlebar.tsx
export const titlebar = ({ title = 'Mali Cowork', lang = 'EN' } = {}) => `
<div class="titlebar">
  <div class="tb-left"><img src="src/assets/icon.png" class="tb-logo" alt=""><span>${title}</span></div>
  <div class="tb-right">
    <span class="tb-btn">${ic('globe', 'sz-3_5')}<b>${lang}</b></span>
    <span class="tb-btn">${ic('moon', 'sz-4')}</span>
    <span class="tb-bot" data-slot="titlebot"></span>
    <span class="tb-win">${ic('minus', 'sz-4')}</span><span class="tb-win">${ic('square', 'sz-3_5')}</span><span class="tb-win">${ic('x', 'sz-4')}</span>
  </div>
</div>`;

// ---------------------------------------------------------------- sidebar
// components/app/sidebar/app-sidebar.tsx
export const sidebar = ({ active = '', more = false, chats = [] } = {}) => {
  const item = (id, icon, label) => `<div class="sb-item ${active === id ? 'on' : ''}" data-id="${id}">${ic(icon, 'sz-4')}<span>${label}</span></div>`;
  const sub = (id, icon, label) => `<div class="sb-sub ${active === id ? 'on' : ''}" data-id="${id}">${ic(icon, 'sz-4')}<span>${label}</span></div>`;
  return `
<aside class="sidebar">
  <div class="sb-collapse">${ic('chevron-right', 'sz-4')}</div>
  ${item('new', 'square-pen', 'New chat')}
  ${item('cowork', 'sparkles', 'Cowork')}
  ${item('code', 'code-xml', 'Code')}
  ${item('visual', 'images', 'Visual')}
  <div class="sb-sep"></div>
  <div class="sb-item sb-more ${more ? 'open' : ''}">${ic('layout-grid', 'sz-4')}<span>More</span>${ic(more ? 'chevron-down' : 'chevron-right', 'sz-4 ml-auto')}</div>
  ${more ? `<div class="sb-subs">${sub('inbox', 'inbox', 'Inbox')}${sub('outputs', 'files', 'Outputs')}${sub('usage', 'chart-column', 'Usage')}${sub('projects', 'folder-kanban', 'Projects')}${sub('settings', 'settings-2', 'Settings')}</div>` : ''}
  <div class="sb-search">${ic('search', 'sz-4')}<span>Search chats</span>${ic('square-pen', 'sz-4 ml-auto')}</div>
  ${chats.length ? `<div class="sb-group">Today</div>` + chats.map((c, i) => `<div class="sb-chat ${c.on ? 'on' : ''}">${c.running ? '<span class="dot-run"></span>' : ''}<span>${c.title}</span></div>`).join('') : '<div class="sb-empty">Your chats will show up here.</div>'}
</aside>`;
};

/** Full app window: titlebar + sidebar + main. */
export const appWindow = ({ main = '', active = '', more = false, chats = [], cls = '', title } = {}) => `
<div class="appwin ${cls}">
  ${sidebar({ active, more, chats })}
  <div class="aw-right">${titlebar({ title })}<main class="aw-main">${main}</main></div>
</div>`;

// ---------------------------------------------------------------- mode tabs
// pages/chat/layout.tsx (Chat / Cowork / Code)
export const modeTabs = (active = 'chat') => `
<div class="modetabs">
  <span class="mt ${active === 'chat' ? 'on' : ''}" data-mode="chat">${ic('message-square', 'sz-3_5')}Chat</span>
  <span class="mt ${active === 'cowork' ? 'on' : ''}" data-mode="cowork">${ic('sparkles', 'sz-3_5')}Cowork</span>
  <span class="mt ${active === 'code' ? 'on' : ''}" data-mode="code">${ic('code-xml', 'sz-3_5')}Code</span>
</div>`;

// ---------------------------------------------------------------- composer
// pages/chat/components/prompt.tsx
export const composer = ({ text = '', placeholder = 'How can I help you today?', folder = null, model = 'Auto — OpenCode default', modelIcon = brand('OpenCode', 14), inbox = false, cls = '' } = {}) => `
<div class="composer ${cls}">
  <div class="cp-text">${text ? `<span class="cp-typed">${text}</span>` : `<span class="cp-ph">${placeholder}</span>`}<span class="caret"></span></div>
  <div class="cp-row">
    <span class="cp-plus">${ic('plus', 'sz-4')}</span>
    ${folder ? `<span class="cp-folder"><span class="dot-ok"></span>${ic('folder', 'sz-3_5')}<span>${folder}</span></span>` : `<span class="cp-folder">${ic('folder-lock', 'sz-3_5')}<span>No file access</span></span>`}
    <div class="ml-auto cp-right">
      <span class="cp-model"><span class="dot-ok"></span>${modelIcon}<span>${model}</span>${ic('chevron-down', 'sz-3_5 op60')}</span>
      <span class="cp-icon">${ic('mic', 'sz-4')}</span>
      ${inbox ? `<span class="cp-inbox">${ic('inbox', 'sz-3_5')}<kbd>⌘↵</kbd></span>` : ''}
      <span class="cp-send">${ic('arrow-up', 'sz-4')}</span>
    </div>
  </div>
</div>`;

// ---------------------------------------------------------------- messages
// pages/chat/components/message/user-message.tsx / agent-steps.tsx
export const userMsg = (text) => `<div class="msg-user"><div class="bubble-user">${text}</div></div>`;
export const assistantMsg = (html) => `<div class="msg-ai chat-markdown">${html}</div>`;
export const stepRow = ({ state = 'done', icon = 'file-pen', verb = 'Edit', target = '', time = '' }) => `
<div class="step ${state}">
  <span class="st-ico">${state === 'running' ? `<span class="spin">${ic('loader', 'sz-3_5')}</span>` : state === 'done' ? ic('check', 'sz-3_5 c-emerald') : '<span class="st-dot"></span>'}</span>
  ${ic(icon, 'sz-3_5 c-mutedfg')}
  <span class="st-verb ${state === 'running' ? 'shimmer' : ''}">${verb}</span>
  <span class="st-target">${target}</span>
  <span class="st-time">${time}</span>
</div>`;

// ---------------------------------------------------------------- permission
// features/opencode/permission-prompt.tsx
export const permissionPrompt = ({ action = 'Edit file', target = 'src/pricing.ts', folderNote = true } = {}) => `
<div class="perm">
  <div class="perm-top">
    <span class="perm-bot"><span class="perm-glow"></span><span data-slot="permbot"></span></span>
    <span class="perm-action">${action}</span><code class="perm-target">${target}</code>
  </div>
  <div class="perm-row">
    ${folderNote ? `<span class="perm-note">${ic('folder-lock', 'sz-3_5')}Only this folder</span>` : ''}
    <div class="ml-auto perm-btns">
      <span class="btn btn-ghost">Deny <kbd>esc</kbd></span>
      <span class="btn btn-outline">Always allow <kbd>⇧⌘↵</kbd></span>
      <span class="btn btn-primary" data-slot="allow">Allow <kbd class="kbd-p">↵</kbd></span>
    </div>
  </div>
</div>`;

// ---------------------------------------------------------------- work receipt
// features/work-receipt/work-receipt-card.tsx
export const receipt = ({ added = 2, modified = 4, deleted = 0, dur = '3m 04s', cost = '$0.042', saved = '~45m', plus = 12, minus = 3, cmds = 3, tokens = '48,210', steps = 14, connectors = [] } = {}) => `
<div class="receipt">
  <div class="rc-head">
    <span class="rc-title">${ic('receipt', 'sz-4 c-amber')}<b>Work receipt</b><span class="c-mutedfg">· just now</span></span>
    <span class="ml-auto btn btn-ghost btn-xs" data-slot="undo">${ic('undo-2', 'sz-3_5')}Undo</span>
  </div>
  <div class="rc-stats">
    ${stat('file-plus', 'emerald', 'Created', added)}${stat('file-pen', 'amber', 'Modified', modified)}${stat('file-minus', 'red', 'Deleted', deleted)}
    ${stat('clock', 'neutral', 'Duration', dur)}${stat('coins', 'neutral', 'Cost', cost)}${stat('calculator', 'neutral', 'Saved', saved)}
  </div>
  <div class="rc-line"><span class="c-emerald">+${plus}</span> / <span class="c-red">−${minus}</span> lines changed</div>
  <div class="rc-line">${ic('terminal', 'sz-3_5')}<span>${cmds} command(s)</span>${ic('chevron-down', 'sz-3_5 ml-auto')}</div>
  ${connectors.length ? `<div class="rc-conn">${connectors.map((c) => `<span class="chip">${c.icon}<span>${c.name}</span><span class="c-mutedfg">×${c.calls}</span></span>`).join('')}</div>` : ''}
  <div class="rc-foot"><span>Tokens: ${tokens}</span><span>Steps: ${steps}</span><span class="ml-auto">${ic('calculator', 'sz-3')} ${saved} saved (estimate)</span></div>
</div>`;
const stat = (icon, tone, label, value) => `<div class="stat"><span class="stat-l">${ic(icon, 'sz-3 tone-' + tone)}${label}</span><span class="stat-v">${value}</span></div>`;

// ---------------------------------------------------------------- inbox
// pages/inbox/index.tsx
export const INBOX_STATUS = {
  queued: { label: 'Waiting', icon: 'clock', cls: 'c-mutedfg', pill: 'neutral' },
  running: { label: 'Running', icon: 'loader', cls: 'c-sky spin', pill: 'pending' },
  'needs-you': { label: 'Needs your answer', icon: 'hand', cls: 'c-amber', pill: 'warning' },
  ready: { label: 'Ready to review', icon: 'circle-check', cls: 'c-emerald', pill: 'success' },
};
export const inboxTask = ({ id, title, folder, status = 'queued', step = '', time = '' }) => `
<div class="task" data-task="${id}">
  <header class="task-h">
    <span class="task-ico" data-slot="ico">${taskIcon(status)}</span>
    <div class="task-main">
      <div class="task-title"><h4>${title}</h4><span class="pill" data-slot="pill">${pill(status)}</span></div>
      <p class="task-meta">${ic('folder', 'sz-3')}<span>${folder}</span><span class="op50">·</span><span>${time}</span></p>
    </div>
    <span class="btn btn-ghost btn-sm">${ic('message-square', 'sz-3_5')}Open chat</span>
  </header>
  <div class="task-body" data-slot="body">${taskBody(status, step)}</div>
</div>`;
export const taskIcon = (status) => { const s = INBOX_STATUS[status]; return `<span class="${s.cls.includes('spin') ? 'spin' : ''}">${ic(s.icon, 'sz-4 ' + s.cls.replace('spin', ''))}</span>`; };
export const pill = (status) => { const s = INBOX_STATUS[status]; return `<span class="pill-${s.pill}">${s.label}</span>`; };
export const taskBody = (status, step) => status === 'running'
  ? `<p class="task-step"><span class="spin slow">${ic('circle-dashed', 'sz-3_5')}</span><span>${step}</span></p>`
  : status === 'queued' ? `<p class="task-step">Waits for a free slot · folder locked by another task</p>`
    : status === 'needs-you' ? `<p class="task-step c-amber">${step}</p><div class="task-actions"><span class="btn btn-primary btn-sm">Answer</span></div>`
      : `<p class="task-step"><span class="c-emerald">+48</span> <span class="c-red">−6</span> · 5 files</p><div class="task-actions"><span class="btn btn-primary btn-sm">${ic('check', 'sz-3_5')}Keep changes</span><span class="btn btn-outline btn-sm">${ic('undo-2', 'sz-3_5')}Undo</span></div>`;

// ---------------------------------------------------------------- command palette
// features/command-palette/palette.tsx
export const commandPalette = ({ query = '', th = false } = {}) => `
<div class="cmdk">
  <div class="cmdk-input">${ic('search', 'sz-4 op50')}<span class="cmdk-q">${query || `<span class="c-mutedfg">${th ? 'ค้นหาแชท หน้า skill หรือคำสั่ง…' : 'Search chats, pages, skills, commands…'}</span>`}</span></div>
  <div class="cmdk-list">
    <div class="cmdk-g">${th ? 'เริ่มใหม่' : 'Start'}</div>
    ${cmdItem('message-square', 'New chat', '', true)}${cmdItem('users', th ? 'Cowork ใหม่' : 'New Cowork')}${cmdItem('code', th ? 'Code ใหม่' : 'New Code')}
    <div class="cmdk-g">${th ? 'Skill และแม่แบบเอกสาร' : 'Skills & templates'}</div>
    ${cmdItem('file-text', 'ใบเสนอราคา', '/quotation')}${cmdItem('file-text', 'หนังสือราชการ', '/official-letter')}${cmdItem('sparkles', 'สรุปประชุม', '/meeting-notes')}
    <div class="cmdk-g">${th ? 'ไปที่' : 'Go to'}</div>
    ${cmdItem('inbox', 'Inbox')}${cmdItem('package', 'Outputs')}${cmdItem('chart-column', 'Usage')}
  </div>
  <div class="cmdk-foot"><span>${th ? '↑↓ เลือก · ↵ เปิด · esc ปิด' : '↑↓ to move · ↵ to open · esc to close'}</span><span>⌘K</span></div>
</div>`;
const cmdItem = (icon, label, hint = '', on = false) => `<div class="cmdk-item ${on ? 'on' : ''}">${ic(icon, 'sz-4 c-mutedfg')}<span>${label}</span>${hint ? `<span class="cmdk-hint">${hint}</span>` : ''}</div>`;

// ---------------------------------------------------------------- suggestions
// features/smart-start/smart-suggestions.tsx
export const suggestionCard = ({ icon, title, desc }) => `
<div class="sugg">${ic(icon, 'sz-4 c-mutedfg')}<b>${title}</b><p>${desc}</p></div>`;

// ---------------------------------------------------------------- model picker
// pages/chat/components/model-picker.tsx
export const modelPicker = ({ groups, active = 0, models = [], activeModel = 0 }) => `
<div class="mpick">
  <div class="mp-side">
    ${groups.map((g, i) => (g.head ? `<p class="mp-head">${g.head}</p>` : '') + `<div class="mp-group ${i === active ? 'on' : ''}" data-g="${i}"><span class="dot-ok ${g.ready ? '' : 'off'}"></span>${g.icon}<span class="mp-gl">${g.label}</span><span class="mp-gc">${g.count}</span></div>`).join('')}
  </div>
  <div class="mp-main">
    <div class="mp-title"><span data-slot="mp-title">${groups[active].icon}<b>${groups[active].label}</b><span class="c-mutedfg">${groups[active].note ?? ''}</span></span></div>
    <div class="mp-models" data-slot="mp-models">${models.map((m, i) => modelRow(m, i === activeModel)).join('')}</div>
  </div>
</div>`;
export const modelRow = (m, on) => `<div class="mp-model ${on ? 'on' : ''}">${m.icon}<span>${m.name}</span>${m.tag ? `<span class="mp-tag ${m.tagCls ?? ''}">${m.tag}</span>` : '<span class="ml-auto"></span>'}${on ? ic('check', 'sz-4') : ''}</div>`;

// ---------------------------------------------------------------- quick bar
// features/quick/quick-bar-root.tsx
export const quickBar = ({ th = true, selection = '', answer = '' } = {}) => `
<div class="quick">
  <div class="qb-head"><img src="src/assets/icon.png" class="qb-logo" alt=""><b>Mali Quick</b>
    <span class="qb-model">${brand('OpenCode', 12)}<span>Auto · OpenCode default</span></span>${ic('x', 'sz-3_5 c-mutedfg')}</div>
  <div class="qb-body">
    ${selection ? `<div class="qb-sel">${ic('clipboard-paste', 'sz-3 mt-px')}<span>${selection}</span></div>` : ''}
    <div class="qb-answer" data-slot="answer">${answer}</div>
  </div>
  <div class="qb-foot">
    <div class="qb-chips">
      <span class="qb-chip" data-chip="sum">${th ? 'สรุป' : 'Summarize'} <kbd>⌘1</kbd></span>
      <span class="qb-chip" data-chip="tr">${th ? 'แปล TH⇄EN' : 'Translate TH⇄EN'} <kbd>⌘2</kbd></span>
      <span class="qb-chip">${th ? 'เขียนใหม่ให้สุภาพ' : 'Rewrite politely'} <kbd>⌘3</kbd></span>
    </div>
    <div class="ml-auto qb-icons"><span data-slot="scan">${ic('scan', 'sz-4')}</span>${ic('mic', 'sz-4')}<span class="qb-send">${ic('arrow-up', 'sz-4')}</span></div>
  </div>
  <div class="qb-actions" data-slot="actions">
    <span class="qb-act">${ic('copy', 'sz-3_5')}Copy <kbd>⌘C</kbd></span>
    <span class="qb-act">${ic('clipboard-paste', 'sz-3_5')}Paste back <kbd>⌘↵</kbd></span>
    <span class="qb-act">${ic('external-link', 'sz-3_5')}Open in Mali <kbd>⌘O</kbd></span>
  </div>
</div>`;

// ---------------------------------------------------------------- diff
// components/diff/code-diff.tsx
export const diff = ({ file, lines }) => `
<div class="diff">
  <div class="diff-h">${ic('file-code', 'sz-3_5')}<span>${file}</span><span class="ml-auto"><span class="c-emerald">+${lines.filter((l) => l[0] === '+').length}</span> <span class="c-red">−${lines.filter((l) => l[0] === '-').length}</span></span></div>
  <pre class="diff-b">${lines.map((l) => `<span class="dl ${l[0] === '+' ? 'add' : l[0] === '-' ? 'del' : ''}"><i>${l[0] === ' ' ? '' : l[0]}</i>${esc(l.slice(1))}</span>`).join('')}</pre>
</div>`;
export const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------------------------------------------------------------- misc
export const kbd = (k) => `<kbd class="kbd-big">${k}</kbd>`;
export const cursorSvg = () => `<svg width="34" height="34" viewBox="0 0 24 24"><path d="M4.5 3.2 19 11.4l-6.4 1.6-3.1 6.3z" fill="#fff" stroke="#111" stroke-width="1.3" stroke-linejoin="round"/></svg>`;
