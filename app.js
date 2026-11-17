const $ = id => document.getElementById(id);
const app = $('app');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const idx = id => LESSONS.findIndex(l => l.id === id);
const today = () => new Date().toDateString();

// ── Saved progress (this phone only) ──
let S = { at: -1, xp: 0, streak: 0, day: '', muted: false };
try { Object.assign(S, JSON.parse(localStorage.getItem('luau-phone') || '{}')); } catch { /* private mode */ }
const save = () => { try { localStorage.setItem('luau-phone', JSON.stringify(S)); } catch { /* ignore */ } };

// The PC app's Profile shows a link with ?at=<lesson id>; opening it sets your progress here.
const fromPc = new URLSearchParams(location.search).get('at');
if (fromPc && idx(fromPc) >= 0) { S.at = idx(fromPc); save(); history.replaceState(null, '', location.pathname); }

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
function home() {
  if (S.at < 0) return picker();
  const chapters = [...new Set(LESSONS.map(l => l.chapter))];
  const pool = unlocked();
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
      <button class="big pink" id="go">Start practice</button>
      <div class="chapters">
        <span class="label">Practice one chapter</span>
        ${chapters.map(ch => {
          const n = pool.filter(e => LESSONS[idx(e.l)].chapter === ch).length;
          const total = LESSONS.filter(l => l.chapter === ch), done = total.filter(l => idx(l.id) <= S.at).length;
          return `<button class="card chap ${n ? '' : 'locked'}" data-ch="${esc(ch)}" ${n ? '' : 'disabled'}>
            <div><b>${esc(ch)}</b><span>${done} of ${total.length} lessons on PC</span></div>
            <i>${n ? n + ' exercises' : 'Finish on PC first'}</i></button>`;
        }).join('')}
      </div>
    </div>`;
  $('mute').onclick = () => { S.muted = !S.muted; save(); $('mute').innerHTML = muteIcon(); sfx('ok'); };
  $('change').onclick = picker;
  $('go').onclick = () => start(null);
  app.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => start(b.dataset.ch));
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

// ── A practice round ──
const ROUND = 10;
let R; // { queue, total, right, firstTry, missed:Set, xp }
function start(chapter) {
  let pool = unlocked();
  if (chapter) pool = pool.filter(e => LESSONS[idx(e.l)].chapter === chapter);
  // Mixed rounds lean towards the 3 newest lessons, so fresh stuff sticks.
  const weight = e => (!chapter && idx(e.l) >= S.at - 2 ? 2 : 1);
  const queue = pool.map(e => [e, Math.random() * weight(e)]).sort((a, b) => b[1] - a[1]).slice(0, ROUND).map(p => p[0]);
  R = { queue: shuffle(queue), total: queue.length, right: 0, firstTry: 0, missed: new Set(), xp: 0 };
  next();
}

const KIND = { fill: 'Fill in the blank', pick: 'Choose the answer', order: 'Put it in order', bug: 'Find the bug', tf: 'True or false', type: 'Type the output', match: 'Match the pairs' };
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
  $('quit').onclick = home;
  $('check').onclick = check;
  RENDER[e.t](e, $('ex'));
}
const setReady = v => { ready = v; if (!checked) $('check').disabled = !v; };

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
        s.textContent = slots[i] == null ? ' ' : e.bank[slots[i]];
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
  tf(e, el) { RENDER.pick({ opts: ['True', 'False'] }, el, ['True', 'False'], true); },
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
    case 'match': return true;
  }
}
function solution(e) {
  let n = 0;
  return { fill: () => e.code.replace(/▢/g, () => e.ans[n++]), pick: () => e.opts[0], tf: () => (e.ans ? 'True' : 'False'),
    bug: () => `Line ${e.line + 1}: ${e.code.split('\n')[e.line].trim()}`, order: () => e.lines.join('\n'), type: () => e.ans, match: () => '' }[e.t]();
}

function check() {
  if (!ready || checked) return;
  checked = true;
  const e = R.queue[0], ok = grade(e), retry = R.missed.has(e) && e.t !== 'match';
  if (ok) {
    R.queue.shift(); R.right++;
    if (!R.missed.has(e)) R.firstTry++;
    R.xp += retry ? 5 : 10;
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
  document.querySelector('.prog i').style.width = `${R.right / R.total * 100}%`;
  const why = e.why ? `<p>${esc(e.why)}</p>` : '<p></p>';
  $('foot').innerHTML = `<div class="fb ${ok ? 'ok' : 'bad'}">
      <h4>${ok ? (e.t === 'match' && R.missed.has(e) ? 'All matched' : 'Correct!') : 'Not quite'}</h4>
      ${ok ? '' : `<div class="label">Correct answer</div><div class="sol">${esc(solution(e))}</div>`}
      ${why}
      <button class="big ${ok ? 'ok' : 'bad'}" id="next">Continue</button>
    </div>`;
  $('next').onclick = next;
  $('next').focus();
}

function finish() {
  if (S.day !== today()) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    S.streak = S.day === y.toDateString() ? S.streak + 1 : 1;
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
  $('again').onclick = () => start(null);
  $('home').onclick = home;
}

home();
