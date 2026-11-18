const $ = id => document.getElementById(id);
const app = $('app');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const idx = id => LESSONS.findIndex(l => l.id === id);
const today = () => new Date().toDateString();
const yesterday = () => { const y = new Date(); y.setDate(y.getDate() - 1); return y.toDateString(); };
// Local calendar day as a whole number, for the review schedule.
const dayNum = (d = new Date()) => Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);

// ── Saved progress (this phone only) ──
// mem: { exerciseId: [box, dueDay] }. Box 1 = weak, 5 = solid. Unseen exercises aren't stored.
let S = { at: -1, xp: 0, streak: 0, day: '', muted: false, mem: {} };
try { Object.assign(S, JSON.parse(localStorage.getItem('luau-phone') || '{}')); } catch { /* private mode */ }
const save = () => { try { localStorage.setItem('luau-phone', JSON.stringify(S)); } catch { /* ignore */ } };
// A streak only survives if you practised today or yesterday.
if (S.day !== today() && S.day !== yesterday() && S.streak) { S.streak = 0; save(); }

// The PC app's Profile shows a link with ?at=<lesson id>; opening it sets your progress here.
const fromPc = new URLSearchParams(location.search).get('at');
if (fromPc && idx(fromPc) >= 0) { S.at = idx(fromPc); save(); history.replaceState(null, '', location.pathname); }

// ── Spaced repetition (Leitner boxes) ──
// Right on the first try moves an exercise up a box and pushes it further out; a miss sends it back to box 1, due now.
const GAP = [0, 1, 3, 7, 14, 30]; // days until due again, by box
const memOf = e => S.mem[e.id];
const isDue = e => { const m = memOf(e); return m && m[1] <= dayNum(); };
const isWeak = e => memOf(e)?.[0] === 1;
const isMastered = e => (memOf(e)?.[0] || 0) >= 3;
function remember(e, right) {
  const box = right ? Math.min((memOf(e)?.[0] || 0) + 1, 5) : 1;
  S.mem[e.id] = [box, dayNum() + (right ? GAP[box] : 0)];
  save();
}

// ── Code colours (same rules as the PC editor) ──
const KW = new Set('local function end if then else elseif for in do while repeat until return break and or not'.split(' '));
const BI = new Set('print warn ipairs pairs tostring tonumber typeof type math string table game workspace task wait Instance Vector3 Color3 time'.split(' '));
const BLUE = new Set(['true', 'false', 'nil', 'self', 'continue', 'number', 'string', 'boolean']);
const TOKEN = /(--\[\[[\s\S]*?(?:\]\]|$)|--[^\n]*)|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`(?:\\.|[^`\\])*`?)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)/g;
function highlight(src) {
  const span = (cls, m) => `<span class="${cls}">${m}</span>`;
  return src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(TOKEN, (m, c, s, n, w, at, all) => {
    if (c) return span('c', m);
    if (s) return span('s', m);
    if (n) return span('n', m);
    const before = all.slice(Math.max(0, at - 12), at);
    if (/function\s+$/.test(before)) return span('b', m);
    if (/[^.]\.$/.test(before)) return span('p', m);
    if (KW.has(w)) return span('k', m);
    if (BLUE.has(w) || /:\s*$/.test(before)) return span('v', m);
    if (BI.has(w)) return span('b', m);
    return m;
  });
}

// ── Sounds ──
let actx;
function sfx(kind) {
  if (S.muted) return;
  try {
    actx ||= new AudioContext();
    const notes = { ok: [660, 880], level: [523, 659, 784, 1047], err: [196, 147] }[kind];
    notes.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * 0.09;
      o.type = kind === 'err' ? 'square' : 'triangle';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(kind === 'err' ? 0.04 : 0.14, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === 'level' && i === 3 ? 0.6 : 0.22));
      o.connect(g).connect(actx.destination);
      o.start(t); o.stop(t + 0.7);
    });
  } catch { /* no audio */ }
}
const SPEAKER = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z"/>';
const muteIcon = () => SPEAKER + (S.muted ? '<path d="M17 9l5 6M22 9l-5 6"/></svg>' : '<path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12"/></svg>');

// ── Home ──
const unlocked = () => EX.filter(e => idx(e.l) <= S.at);
const chapterOf = e => LESSONS[idx(e.l)].chapter;
function home() {
  if (S.at < 0) return picker();
  const chapters = [...new Set(LESSONS.map(l => l.chapter))];
  const pool = unlocked();
  const due = pool.filter(isDue).length, weak = pool.filter(isWeak).length, fresh = pool.filter(e => !memOf(e)).length;
  app.innerHTML = `
    <header>
      <div class="logo">Luau<span>Learn</span></div>
      <div class="stats">
        <span class="xp"><b>${S.xp}</b> XP</span>
        <span class="st"><b>${S.streak}</b> day streak</span>
        <button class="icon-btn" id="mute" aria-label="Sounds on or off">${muteIcon()}</button>
      </div>
    </header>
    <div class="screen">
      <div class="home-head"><h1>Practice what you learned</h1><p>Short exercises from the lessons you've finished on PC.</p></div>
      <div class="card pc">
        <div><small>Finished on PC up to</small><b>${esc(LESSONS[S.at].title)}</b></div>
        <button class="ghost" id="change">Change</button>
      </div>
      <div class="queue">
        <div><b>${due}</b><small>Due</small></div>
        <div><b>${fresh}</b><small>New</small></div>
        <div class="${weak ? 'weak' : ''}"><b>${weak}</b><small>Weak</small></div>
      </div>
      <button class="big pink" id="go">${due ? 'Start review' : 'Start practice'}</button>
      ${weak ? `<button class="ghost" id="weak" style="margin-top:10px">Drill my ${weak} weak exercise${weak > 1 ? 's' : ''}</button>` : ''}
      <div class="chapters">
        <span class="label">Practice one chapter</span>
        ${chapters.map(ch => {
          const exs = pool.filter(e => chapterOf(e) === ch), n = exs.length;
          const total = LESSONS.filter(l => l.chapter === ch), done = total.filter(l => idx(l.id) <= S.at).length;
          const pct = n ? Math.round(exs.filter(isMastered).length / n * 100) : 0;
          return `<button class="card chap ${n ? '' : 'locked'}" data-ch="${esc(ch)}" ${n ? '' : 'disabled'}>
            <div><b>${esc(ch)}</b><span>${done} of ${total.length} lessons on PC</span></div>
            <i>${n ? pct + '% mastered' : 'Finish on PC first'}</i>
            ${n ? `<em class="bar"><u style="width:${pct}%"></u></em>` : ''}</button>`;
        }).join('')}
      </div>
    </div>`;
  $('mute').onclick = () => { S.muted = !S.muted; save(); $('mute').innerHTML = muteIcon(); sfx('ok'); };
  $('change').onclick = picker;
  $('go').onclick = () => start({});
  if ($('weak')) $('weak').onclick = () => start({ weak: true });
  app.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => start({ chapter: b.dataset.ch }));
}

// ── "Where are you on PC?" ──
function picker() {
  let html = '', ch = '';
  LESSONS.forEach((l, i) => {
    if (l.chapter !== ch) { ch = l.chapter; html += `<h3>${esc(ch)}</h3>`; }
    html += `<button class="row ${i <= S.at ? 'done' : ''} ${i === S.at ? 'sel' : ''}" data-i="${i}"><span class="dot"></span>${esc(l.title)}</button>`;
  });
  app.innerHTML = `
    <div class="screen">
      ${S.at >= 0 ? '<button class="ghost" id="back" style="align-self:flex-start">← Back</button>' : ''}
      <h1 style="margin:10px 0 4px;font-size:24px;font-weight:600">Where are you on PC?</h1>
      <p style="margin:0;color:var(--muted)">Tap the last lesson you finished in the Luau Learn app. You'll only get exercises up to there. Change it any time.</p>
      <div class="pick-list">${html}</div>
    </div>`;
  if ($('back')) $('back').onclick = home;
  app.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { S.at = +b.dataset.i; save(); home(); scrollTo(0, 0); });
  if (S.at >= 0) app.querySelector('.row.sel')?.scrollIntoView({ block: 'center' });
}

// ── Picking a round ──
// Order: due (weakest first), then new (newest lessons first), then the rest (soonest due first).
// Exercises you got right recently only show up when nothing else is left.
const ROUND = 10, NEW_SLOTS = 3;
function pickRound({ chapter, weak }) {
  let pool = unlocked();
  if (chapter) pool = pool.filter(e => chapterOf(e) === chapter);
  if (weak) pool = pool.filter(isWeak);
  const today_ = dayNum(), jitter = new Map(pool.map(e => [e, Math.random()]));
  const due = pool.filter(isDue).sort((a, b) => memOf(a)[0] - memOf(b)[0] || memOf(a)[1] - memOf(b)[1] || jitter.get(a) - jitter.get(b));
  const fresh = pool.filter(e => !memOf(e)).sort((a, b) => (idx(b.l) - idx(a.l)) * 0.15 + jitter.get(a) - jitter.get(b));
  const later = pool.filter(e => memOf(e) && memOf(e)[1] > today_).sort((a, b) => memOf(a)[1] - memOf(b)[1] || jitter.get(a) - jitter.get(b));
  const room = Math.max(ROUND - Math.min(NEW_SLOTS, fresh.length), 0);
  const picked = [...due.slice(0, room)];
  picked.push(...fresh.slice(0, ROUND - picked.length));
  picked.push(...due.slice(room, room + ROUND - picked.length));
  picked.push(...later.slice(0, ROUND - picked.length));
  return picked;
}
// Generated exercises (e.make) get fresh numbers every time they're shown.
const inst = e => (e.make ? { ...e, ...e.make() } : e);

// ── A practice round ──
let R; // { queue, total, right, firstTry, missed:Set, seen:Set, xp, opts }
function start(opts) {
  const queue = pickRound(opts).map(inst);
  if (!queue.length) return home();
  R = { queue: shuffle(queue), total: queue.length, right: 0, firstTry: 0, missed: new Set(), seen: new Set(), xp: 0, opts };
  next();
}

const KIND = { fill: 'Fill in the blank', pick: 'Choose the answer', order: 'Put it in order', bug: 'Find the bug', tf: 'True or false',
  type: 'Type the output', match: 'Match the pairs', build: 'Build the line', trace: 'Trace the variable' };
let ans, ready, checked;

function next() {
  if (!R.queue.length) return finish();
  const e = R.queue[0];
  ans = null; ready = false; checked = false;
  app.innerHTML = `
    <div class="screen">
      <div class="top">
        <button class="icon-btn" id="quit" aria-label="Quit practice"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        <div class="prog"><i style="width:${R.right / R.total * 100}%"></i></div>
      </div>
      <span class="kind">${R.missed.has(e) ? 'Try again: ' : ''}${KIND[e.t]}</span>
      <h2 class="q">${esc(e.q)}</h2>
      <div class="ex" id="ex"></div>
      <div class="foot" id="foot"><button class="big sky" id="check" disabled>Check</button></div>
    </div>`;
  $('quit').onclick = quit;
  $('check').onclick = check;
  RENDER[e.t](e, $('ex'));
}
const setReady = v => { ready = v; if (!checked) $('check').disabled = !v; };

// Quitting loses this round's XP, so ask first once there's something to lose.
function quit() {
  if (!R.seen.size) return home();
  const sheet = document.createElement('div');
  sheet.className = 'sheet';
  sheet.innerHTML = `<div class="sheet-box" role="dialog" aria-modal="true" aria-labelledby="sheet-h">
      <h4 id="sheet-h">Quit this round?</h4>
      <p>You'll lose the <b>+${R.xp} XP</b> from this round. Your answers still count toward what comes up for review.</p>
      <button class="big sky" id="stay">Keep going</button>
      <button class="ghost danger" id="leave">Quit</button>
    </div>`;
  app.append(sheet);
  $('stay').focus();
  $('stay').onclick = () => sheet.remove();
  $('leave').onclick = home;
  sheet.onclick = ev => { if (ev.target === sheet) sheet.remove(); };
}

const RENDER = {
  fill(e, el) {
    const bank = shuffle(e.bank.map((t, i) => i));
    const slots = e.ans.map(() => null);
    let n = 0;
    el.innerHTML = `<pre class="code">${highlight(e.code).replace(/▢/g, () => `<button class="slot" data-s="${n++}">&nbsp;</button>`)}</pre>
      <div class="bank">${bank.map(i => `<button class="tile" data-t="${i}">${esc(e.bank[i])}</button>`).join('')}</div>`;
    const paint = () => {
      const first = slots.indexOf(null);
      el.querySelectorAll('.slot').forEach((s, i) => {
        s.textContent = slots[i] == null ? ' ' : e.bank[slots[i]];
        s.classList.toggle('full', slots[i] != null); s.classList.toggle('next', i === first);
      });
      el.querySelectorAll('.tile').forEach(t => t.classList.toggle('used', slots.includes(+t.dataset.t)));
      ans = slots.map(i => i == null ? null : e.bank[i]);
      setReady(!slots.includes(null));
    };
    el.querySelectorAll('.tile').forEach(t => t.onclick = () => { if (checked) return; const f = slots.indexOf(null); if (f >= 0) { slots[f] = +t.dataset.t; paint(); } });
    el.querySelectorAll('.slot').forEach(s => s.onclick = () => { if (checked) return; slots[+s.dataset.s] = null; paint(); });
    paint();
  },
  pick(e, el, opts = shuffle(e.opts), two = false) {
    el.innerHTML = (e.code ? `<pre class="code">${highlight(e.code)}</pre>` : '') +
      `<div class="opts ${two ? 'two' : ''}">${opts.map(o => `<button class="opt">${esc(o)}</button>`).join('')}</div>`;
    el.querySelectorAll('.opt').forEach((b, i) => b.onclick = () => {
      if (checked) return;
      el.querySelectorAll('.opt').forEach(x => x.classList.remove('sel'));
      b.classList.add('sel'); ans = opts[i]; setReady(true);
    });
  },
  tf(e, el) { RENDER.pick({ code: e.code, opts: ['True', 'False'] }, el, ['True', 'False'], true); },
  bug(e, el) {
    el.innerHTML = `<div class="bugcode">${e.code.split('\n').map((l, i) => `<button data-l="${i}">${highlight(l) || ' '}</button>`).join('')}</div>`;
    el.querySelectorAll('[data-l]').forEach(b => b.onclick = () => {
      if (checked) return;
      el.querySelectorAll('[data-l]').forEach(x => x.classList.remove('sel'));
      b.classList.add('sel'); ans = +b.dataset.l; setReady(true);
    });
  },
  order(e, el) {
    let pool = shuffle(e.lines.map((l, i) => i)), picked = [];
    if (pool.every((v, i) => v === i)) pool.reverse(); // never start already solved
    const paint = () => {
      el.innerHTML = `<div class="answer">${picked.map(i => `<button class="line" data-a="${i}">${highlight(e.lines[i])}</button>`).join('')}</div>
        <div class="lines">${pool.map(i => `<button class="line" data-p="${i}">${highlight(e.lines[i])}</button>`).join('')}</div>`;
      el.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { if (checked) return; pool = pool.filter(i => i !== +b.dataset.p); picked.push(+b.dataset.p); paint(); });
      el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { if (checked) return; picked = picked.filter(i => i !== +b.dataset.a); pool.push(+b.dataset.a); paint(); });
      ans = picked.map(i => e.lines[i]); setReady(!pool.length);
    };
    paint();
  },
  // Build one line from word tiles, like sentence building in a language app. Extra tiles are decoys.
  build(e, el) {
    const tiles = [...e.tiles, ...e.extra];
    let pool = shuffle(tiles.map((t, i) => i)), picked = [];
    const paint = () => {
      el.innerHTML = `<div class="buildline">${picked.length ? picked.map(i => `<button class="tile" data-a="${i}">${esc(tiles[i])}</button>`).join('') : '<span class="hint">Tap the tiles in order</span>'}</div>
        ${picked.length ? `<pre class="code preview">${highlight(glue(picked.map(i => tiles[i])))}</pre>` : ''}
        <div class="bank">${tiles.map((t, i) => `<button class="tile ${pool.includes(i) ? '' : 'used'}" data-p="${i}">${esc(t)}</button>`).join('')}</div>`;
      el.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { if (checked || !pool.includes(+b.dataset.p)) return; pool = pool.filter(i => i !== +b.dataset.p); picked.push(+b.dataset.p); paint(); });
      el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { if (checked) return; picked = picked.filter(i => i !== +b.dataset.a); pool.push(+b.dataset.a); paint(); });
      ans = glue(picked.map(i => tiles[i])); setReady(picked.length > 0);
    };
    paint();
  },
  // Step through the code: after each highlighted line, pick what the variable holds.
  trace(e, el) {
    const choices = shuffle([...new Set([...e.steps.map(s => s[1]), ...e.extra])]);
    const picks = [];
    const lines = e.code.split('\n');
    const paint = () => {
      const step = e.steps[picks.length], cur = step ? step[0] - 1 : -1;
      el.innerHTML = `<div class="tracecode">${lines.map((l, i) => `<div class="${i === cur ? 'cur' : ''}">${highlight(l) || ' '}</div>`).join('')}</div>
        <div class="steps">${picks.map((p, i) => `<button class="stepv" data-u="${i}"><span>line ${e.steps[i][0]}</span><b class="mono">${esc(e.v)} = ${esc(p)}</b></button>`).join('')}</div>
        ${step ? `<div class="label">What is <span class="mono">${esc(e.v)}</span> after the highlighted line?</div>
          <div class="bank">${choices.map(c => `<button class="tile" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>` : ''}`;
      el.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { if (checked) return; picks.push(b.dataset.c); paint(); });
      el.querySelectorAll('[data-u]').forEach(b => b.onclick = () => { if (checked) return; picks.length = +b.dataset.u; paint(); }); // tap a step to redo from there
      ans = picks.slice(); setReady(picks.length === e.steps.length);
    };
    paint();
  },
  type(e, el) {
    el.innerHTML = `<pre class="code">${highlight(e.code)}</pre>
      <input class="answer-in" id="typed" placeholder="Type what it prints" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done">`;
    const inp = $('typed');
    inp.oninput = () => { ans = inp.value; setReady(inp.value.trim() !== ''); };
    inp.onkeydown = ev => { if (ev.key === 'Enter' && ready && !checked) check(); };
  },
  match(e, el) {
    const left = shuffle(e.pairs.map(p => p[0])), right = shuffle(e.pairs.map(p => p[1]));
    let sel = null, left_ = e.pairs.length;
    el.innerHTML = `<div class="match">${left.map((l, i) => `<button class="opt mono" data-side="0" data-v="${esc(l)}">${esc(l)}</button><button class="opt" data-side="1" data-v="${esc(right[i])}">${esc(right[i])}</button>`).join('')}</div>`;
    el.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      if (!sel || sel.dataset.side === b.dataset.side) {
        el.querySelectorAll('.opt').forEach(x => x.classList.remove('sel'));
        b.classList.add('sel'); sel = b; return;
      }
      const [a, z] = sel.dataset.side === '0' ? [sel, b] : [b, sel];
      if (e.pairs.some(p => p[0] === a.dataset.v && p[1] === z.dataset.v)) {
        a.classList.add('gone'); z.classList.add('gone'); sfx('ok');
        if (--left_ === 0) { ans = true; setReady(true); check(); }
      } else {
        R.missed.add(e); sfx('err');
        [a, z].forEach(x => { x.classList.remove('wrong'); void x.offsetWidth; x.classList.add('wrong'); });
      }
      sel.classList.remove('sel'); b.classList.remove('sel'); sel = null;
    });
  },
};

const norm = s => String(s).trim().replace(/\s+/g, ' ').toLowerCase();
function grade(e) {
  switch (e.t) {
    case 'fill': return ans.every((a, i) => a === e.ans[i]);
    case 'pick': return ans === e.opts[0];
    case 'tf': return (ans === 'True') === e.ans;
    case 'bug': return ans === e.line;
    case 'order': return ans.join('\n') === e.lines.join('\n');
    case 'type': return norm(ans) === norm(e.ans);
    case 'build': return [glue(e.tiles), ...(e.alt || [])].includes(ans);
    case 'trace': return ans.every((a, i) => a === e.steps[i][1]);
    case 'match': return !R.missed.has(e); // mistakes were made while matching
  }
}
function solution(e) {
  let n = 0;
  return { fill: () => e.code.replace(/▢/g, () => e.ans[n++]), pick: () => e.opts[0], tf: () => (e.ans ? 'True' : 'False'),
    bug: () => `Line ${e.line + 1}: ${e.code.split('\n')[e.line].trim()}`, order: () => e.lines.join('\n'), type: () => e.ans,
    build: () => glue(e.tiles), trace: () => e.steps.map(([l, v]) => `line ${l}: ${e.v} = ${v}`).join('\n'), match: () => '' }[e.t]();
}

function check() {
  if (!ready || checked) return;
  checked = true;
  const e = R.queue[0], ok = grade(e), retry = R.missed.has(e);
  if (!R.seen.has(e)) { R.seen.add(e); remember(e, ok); } // only the first attempt moves the review schedule
  if (ok) {
    R.queue.shift(); R.right++;
    if (!retry) R.firstTry++;
    R.xp += retry ? 5 : 10;
    sfx('ok');
  } else if (e.t === 'match') { // finished, just not cleanly: half XP, and it doesn't come back this round
    R.queue.shift(); R.right++; R.xp += 5;
    sfx('ok');
  } else {
    R.missed.add(e);
    R.queue.push(R.queue.shift()); // comes back at the end of the round
    sfx('err');
  }
  // show right/wrong on the choices
  const ex = $('ex');
  if (e.t === 'pick' || e.t === 'tf') ex.querySelectorAll('.opt').forEach(b => {
    const right = e.t === 'tf' ? (b.textContent === 'True') === e.ans : b.textContent === e.opts[0];
    if (right) b.classList.add('right'); else if (b.classList.contains('sel')) b.classList.add('wrong');
  });
  if (e.t === 'bug') ex.querySelector(`[data-l="${e.line}"]`).classList.add('right');
  if (e.t === 'trace') ex.querySelectorAll('.stepv').forEach((b, i) => b.classList.add(ans[i] === e.steps[i][1] ? 'right' : 'wrong'));
  document.querySelector('.prog i').style.width = `${R.right / R.total * 100}%`;
  const why = e.why ? `<p>${esc(e.why)}</p>` : '<p></p>';
  const title = ok ? (e.t === 'match' ? 'All matched' : 'Correct!') : (e.t === 'match' ? 'All matched, with mistakes' : 'Not quite');
  $('foot').innerHTML = `<div class="fb ${ok ? 'ok' : 'bad'}">
      <h4>${title}</h4>
      ${ok || e.t === 'match' ? '' : `<div class="label">Correct answer</div><div class="sol">${esc(solution(e))}</div>`}
      ${why}
      <button class="big ${ok ? 'ok' : 'bad'}" id="next">Continue</button>
    </div>`;
  $('next').onclick = next;
  $('next').focus();
}

function finish() {
  if (S.day !== today()) {
    S.streak = S.day === yesterday() ? S.streak + 1 : 1;
    S.day = today();
  }
  S.xp += R.xp; save();
  sfx('level');
  const acc = R.total ? Math.round(R.firstTry / R.total * 100) : 100;
  app.innerHTML = `<div class="screen"><div class="done">
      <span class="kind">Round complete</span>
      <h2>${acc === 100 ? 'Perfect round!' : acc >= 70 ? 'Nice work!' : 'Keep practising!'}</h2>
      <div class="done-stats">
        <div class="xp"><b>+${R.xp}</b><small>XP</small></div>
        <div class="ac"><b>${acc}%</b><small>First try</small></div>
        <div class="st"><b>${S.streak}</b><small>Day streak</small></div>
      </div>
      <button class="big pink" id="again">Practice again</button>
      <button class="ghost" id="home" style="margin-top:12px">Back home</button>
    </div></div>`;
  $('again').onclick = () => start(R.opts.weak && !unlocked().some(isWeak) ? {} : R.opts);
  $('home').onclick = home;
}

home();
