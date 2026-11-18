// Checks every exercise in exercises.js. Run with: npm test
//  1. Shape: blanks match answers, options are unique, lines are in range, ids are unique, 8+ per lesson...
//  2. Syntax: solutions compile as real Luau.
//  3. Answers: "What does this print?", "How many times", type and trace exercises are run in Luau
//     and the output must match the answer. Roblox code (game, workspace, ...) is only syntax-checked.
// Generated exercises are checked SAMPLES times each, since every copy has different numbers.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { LuauState } from 'luau-web';

const SAMPLES = 25, MIN_PER_LESSON = 8;
const src = readFileSync(new URL('../exercises.js', import.meta.url), 'utf8');
const { LESSONS, EX, glue } = vm.runInNewContext(`${src};({ LESSONS, EX, glue })`);

const errors = [];
const fail = (e, msg) => errors.push(`[${e.l}] ${e.t} "${e.q}": ${msg}`);
const norm = s => String(s).trim().replace(/\s+/g, ' ');
const ROBLOX = /\b(game|workspace|Instance|Vector3|CFrame|task|Players|part|remote|player|coin|humanoid|script|hit|door)\b/;

// ── Luau runner ──
// print and the trace hook are defined in Luau so values are formatted by Luau's own tostring.
const PRELUDE = `local __out, __trace = __out, __trace
print = function(...) local t = table.pack(...) for i = 1, t.n do t[i] = tostring(t[i]) end __out(table.concat(t, "\\t")) end
local function __t(x) __trace(tostring(x)) end
`;
const quiet = console.warn; console.warn = () => {}; // luau-web warns about serialized calls; harmless here
async function luau(code, { runIt = true } = {}) {
  const out = [], trace = [];
  const state = await LuauState.createAsync({ __out: s => out.push(String(s)), __trace: s => trace.push(String(s)) });
  try {
    const fn = state.loadstring(PRELUDE + code, 'exercise', true);
    if (runIt) await fn();
    return { ok: true, out: out.join('\n'), trace };
  } catch (err) {
    return { ok: false, err: String(err.message || err).split('\n')[0], out: out.join('\n'), trace };
  } finally { state.destroy(); }
}
// Fragments like "if x then" compile once their block is closed; break and continue need a loop around them.
async function compiles(code) {
  for (const tail of ['', '\nend', '\nend)', '\nend\nend']) {
    if ((await luau(code + tail, { runIt: false })).ok) return true;
    if ((await luau(`for _ = 1, 1 do\n${code}${tail}\nend`, { runIt: false })).ok) return true;
  }
  return false;
}

// ── Shape checks ──
function shape(e) {
  const need = { fill: ['code', 'ans', 'bank'], pick: ['opts'], order: ['lines'], bug: ['code'], tf: [], type: ['code', 'ans'], match: ['pairs'], build: ['tiles', 'extra'], trace: ['code', 'v', 'steps', 'extra'] }[e.t];
  if (!need) return fail(e, `unknown type ${e.t}`);
  for (const k of ['q', ...need]) if (e[k] == null) fail(e, `missing ${k}`);
  if (e.t === 'fill') {
    const n = (e.code.match(/▢/g) || []).length;
    if (n !== e.ans.length) fail(e, `${n} blanks but ${e.ans.length} answers`);
  }
  if (e.t === 'pick') {
    if (new Set(e.opts.map(String)).size !== e.opts.length) fail(e, `duplicate options: ${e.opts.join(' | ')}`);
    if (e.opts.length < 2) fail(e, 'needs at least 2 options');
  }
  if (e.t === 'tf' && typeof e.ans !== 'boolean') fail(e, 'ans must be true or false');
  if (e.t === 'bug' && !(e.line >= 0 && e.line < e.code.split('\n').length)) fail(e, `line ${e.line} is out of range`);
  if (e.t === 'order') {
    if (e.lines.length < 2) fail(e, 'needs at least 2 lines');
  }
  if (e.t === 'match') {
    if (new Set(e.pairs.map(p => p[0])).size !== e.pairs.length || new Set(e.pairs.map(p => p[1])).size !== e.pairs.length) fail(e, 'duplicate items in pairs');
  }
  if (e.t === 'build') {
    const line = glue(e.tiles);
    if (e.extra.some(x => e.tiles.includes(x))) fail(e, 'a decoy tile is the same as a real tile');
    if ((e.alt || []).includes(line)) fail(e, 'alt repeats the main answer');
  }
  if (e.t === 'trace') {
    const n = e.code.split('\n').length;
    for (const [line, v] of e.steps) {
      if (!(line >= 1 && line <= n)) fail(e, `step line ${line} is out of range (1-${n})`);
      if (typeof v !== 'string') fail(e, `step value ${v} must be a string`);
    }
    const choices = new Set([...e.steps.map(s => s[1]), ...e.extra]);
    if (choices.size > 8) fail(e, `${choices.size} choices is too many for a phone screen`);
    if (choices.size < 3) fail(e, 'needs at least 3 choices');
  }
  if (e.t !== 'match' && !e.why) fail(e, 'missing why (the explanation shown after answering)');
}

// ── Luau checks ──
async function inLuau(e) {
  const solved = { fill: () => { let n = 0; return e.code.replace(/▢/g, () => e.ans[n++]); }, order: () => e.lines.join('\n'), build: () => glue(e.tiles) }[e.t];
  if (solved) {
    const code = solved();
    if (!(await compiles(code))) fail(e, `solution doesn't compile:\n    ${code.replace(/\n/g, '\n    ')}`);
    for (const alt of e.alt || []) if (!(await compiles(alt))) fail(e, `alt doesn't compile: ${alt}`);
  }
  const runnable = e.code && !ROBLOX.test(e.code);
  if (e.t === 'type' && runnable) {
    const r = await luau(e.code);
    if (!r.ok) fail(e, `errors when run: ${r.err}`);
    else if (norm(r.out) !== norm(e.ans)) fail(e, `prints "${r.out}" but the answer is "${e.ans}"`);
  }
  if (e.t === 'pick' && runnable && e.q === 'What does this print?') {
    const r = await luau(e.code);
    if (e.opts[0] === 'An error') { if (r.ok) fail(e, `answer is "An error" but it runs and prints "${r.out}"`); }
    else if (!r.ok) fail(e, `errors when run: ${r.err}`);
    else if (norm(r.out) !== norm(e.opts[0])) fail(e, `prints "${r.out}" but the answer is "${e.opts[0]}"`);
  }
  if (e.t === 'pick' && runnable && /^How many times/.test(e.q)) {
    const r = await luau(e.code);
    const lines = r.ok && r.out ? r.out.split('\n').length : 0;
    if (!r.ok) fail(e, `errors when run: ${r.err}`);
    else if (String(lines) !== String(e.opts[0])) fail(e, `prints ${lines} lines but the answer is ${e.opts[0]}`);
  }
  if (e.t === 'trace') {
    // Add __t(v) after every watched line, then compare the values seen with the steps, in order.
    const watch = new Set(e.steps.map(s => s[0]));
    const code = e.code.split('\n').flatMap((l, i) => (watch.has(i + 1) ? [l, `__t(${e.v})`] : [l])).join('\n');
    const r = await luau(code);
    const want = e.steps.map(s => s[1]);
    if (!r.ok) fail(e, `errors when run: ${r.err}`);
    else if (r.trace.join(' | ') !== want.join(' | ')) fail(e, `${e.v} goes ${r.trace.join(', ')} but the steps say ${want.join(', ')}`);
  }
}

// ── Version: index.html must load every file with ?v=VERSION, or phones keep old cached copies ──
const { VERSION, CHANGES } = vm.runInNewContext(`${readFileSync(new URL('../version.js', import.meta.url), 'utf8')};({ VERSION, CHANGES })`);
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
for (const [, file, v] of html.matchAll(/<script src="([^"?]+)(?:\?v=([^"]*))?"/g)) {
  if (v !== VERSION) errors.push(`index.html loads ${file} with ?v=${v ?? '(none)'} but version.js says ${VERSION}`);
}
if (!CHANGES[VERSION]?.length) errors.push(`version.js has no CHANGES entry for ${VERSION}`);

// ── Run ──
const ids = new Set(LESSONS.map(l => l.id)), seen = new Map();
for (const e of EX) {
  if (!ids.has(e.l)) fail(e, `unknown lesson id "${e.l}"`);
  if (seen.has(e.id)) fail(e, `duplicate id ${e.id} (same exercise twice?)`);
  seen.set(e.id, e);
}
for (const l of LESSONS) {
  const n = EX.filter(e => e.l === l.id).length;
  if (n < MIN_PER_LESSON) errors.push(`[${l.id}] only ${n} exercises (want ${MIN_PER_LESSON}+)`);
}
let checked = 0;
for (const base of EX) {
  for (let i = 0; i < (base.make ? SAMPLES : 1); i++) {
    const e = base.make ? { ...base, ...base.make() } : base;
    shape(e);
    await inLuau(e);
    checked++;
  }
}
console.warn = quiet;
const unique = [...new Set(errors)];
if (unique.length) {
  console.error(unique.join('\n'));
  console.error(`\n${unique.length} problem(s) in ${EX.length} exercises.`);
  process.exit(1);
}
console.log(`All good: ${EX.length} exercises (${checked} checked, including generated copies).`);
