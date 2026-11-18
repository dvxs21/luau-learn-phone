// Lessons in the same order as the PC app (lessons.js). Keep ids in sync when the PC app gets new lessons.
const LESSONS = [
  ['hello', 'Getting Started', 'Hello, Roblox!'], ['comments', 'Getting Started', 'Comments & Many Lines'],
  ['variables', 'Getting Started', 'Variables'], ['math', 'Getting Started', 'Math'],
  ['strings', 'Getting Started', 'Joining Strings'], ['interp', 'Getting Started', 'String Interpolation'],
  ['booleans', 'Making Decisions', 'True or False'], ['if', 'Making Decisions', 'If Statements'],
  ['else', 'Making Decisions', 'else and elseif'], ['logic', 'Making Decisions', 'and, or, not'],
  ['for', 'Loops', 'For Loops'], ['countdown', 'Loops', 'Counting Down'], ['while', 'Loops', 'While Loops'],
  ['totals', 'Loops', 'Adding Things Up'], ['break', 'Loops', 'break & continue'],
  ['functions', 'Functions', 'Functions'], ['params', 'Functions', 'Parameters'],
  ['return', 'Functions', 'Return Values'], ['scope', 'Functions', 'Scope (Bug Hunt)'],
  ['arrays', 'Tables', 'Arrays'], ['ipairs', 'Tables', 'Looping Through Arrays'], ['tablefns', 'Tables', 'Adding & Removing'],
  ['dicts', 'Tables', 'Dictionaries'], ['pairs', 'Tables', 'Looping Dictionaries'],
  ['types', 'Final Boss', 'Types (Luau Superpower)'], ['boss', 'Final Boss', 'Boss: Leaderboard'],
  ['rbx-part', 'Roblox Scripting', 'Your First Part'], ['rbx-vector', 'Roblox Scripting', 'Position & Vector3'],
  ['rbx-find', 'Roblox Scripting', 'Finding Things'], ['rbx-wait', 'Roblox Scripting', 'Waiting with task.wait'],
  ['rbx-touched', 'Roblox Scripting', 'Kill Bricks (Events)'], ['rbx-players', 'Roblox Scripting', 'Players Joining'],
  ['rbx-leaderstats', 'Roblox Scripting', 'Leaderstats'], ['rbx-boss', 'Roblox Scripting', 'Boss: Coin Pickup'],
  ['cs-intro', 'Client & Server', 'Client and Server'], ['cs-fireserver', 'Client & Server', 'Client → Server'],
  ['cs-fireclient', 'Client & Server', 'Server → Client'],
].map(([id, chapter, title]) => ({ id, chapter, title }));

// Exercise builders. Rules for writing exercises:
//   fill   ▢ marks each blank. bank = right answers + decoys.
//   pick   the first option is the right one (shuffled at runtime).
//   bug    line is 0-based.
//   build  tiles in the right order, joined by glue(). alt = other accepted lines.
//   trace  steps = [[line, value], ...] in the order they run. Lines are 1-based. v can be any expression.
//   gen    make() returns the fields for a fresh copy with new numbers each time it's shown.
// `npm test` runs every snippet in real Luau and checks the answers, so run it after editing.
const EX = [];
let L = '';
const at = id => { L = id; };
const fill = (q, code, ans, extra, why) => EX.push({ t: 'fill', l: L, q, code, ans, bank: [...ans, ...extra], why });
const pick = (q, code, opts, why) => EX.push({ t: 'pick', l: L, q, code, opts, why });
const order = (q, lines, why) => EX.push({ t: 'order', l: L, q, lines, why });
const bug = (q, code, line, why) => EX.push({ t: 'bug', l: L, q, code, line, why });
const tf = (q, ans, why) => EX.push({ t: 'tf', l: L, q, ans, why });
const type = (q, code, ans, why) => EX.push({ t: 'type', l: L, q, code, ans, why });
const match = (q, pairs) => EX.push({ t: 'match', l: L, q, pairs });
const build = (q, tiles, extra, why, alt) => EX.push({ t: 'build', l: L, q, tiles, extra, why, alt });
const trace = (q, code, v, steps, extra, why) => EX.push({ t: 'trace', l: L, q, code, v, steps, extra, why });
const gen = (t, make) => EX.push({ t, l: L, make });

// Joins build tiles into one line of code: no space after ( [ . or before ) ] , . : (
const glue = tiles => tiles.reduce((s, t) => {
  const tight = /[([.]$/.test(s) || (/^[)\],.:(]/.test(t) && !t.startsWith('..'));
  return s && !tight ? `${s} ${t}` : s + t;
}, '');

// Helpers for generated exercises
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const one = a => a[Math.floor(Math.random() * a.length)];
// The right answer first, then the first 3 different wrong ones.
const opts4 = (right, ...wrong) => [String(right), ...[...new Set(wrong.map(String))].filter(w => w !== String(right))].slice(0, 4);

at('hello');
fill('Print the word Hello', 'print(▢)', ['"Hello"'], ['Hello', 'say'], 'Text needs quotes around it. That makes it a string.');
tf('Print("hi") works the same as print("hi").', false, 'Luau is case-sensitive. Print and print are different names.');
type('What does this print?', 'print("Roblox")', 'Roblox', 'The quotes are not printed, only the text inside them.');
pick('What does this print?', 'print("Hi")\nprint("Bye")', ['Hi\nBye', 'HiBye', 'Bye\nHi', 'Nothing'], 'Each print puts its text on a new line, top to bottom.');
build('Build the line that prints Hello', ['print(', '"Hello"', ')'], ['Hello', 'say('], 'print( opens, the text goes in quotes, ) closes.');
type('What does this print?', 'print(5)', '5', 'Numbers don\'t need quotes.');
pick('Which line prints the word Hi?', '', ['print("Hi")', 'print(Hi)', 'Print("Hi")', 'print "Hi")'], 'Lowercase print, the text in quotes, brackets on both sides.');
bug('Tap the line with the mistake', 'print("Ready")\nprint("Set"\nprint("Go")', 1, 'The bracket after "Set" is never closed.');

at('comments');
pick('What does Luau do with this line?', '-- spawn the boss here', ['Ignores it', 'Prints it', 'Errors', 'Runs it later'], 'Lines starting with -- are comments. They are notes for people.');
fill('Turn this into a comment', '▢ spawn the boss later', ['--'], ['//', '#'], 'Luau comments start with two dashes.');
bug('Tap the line with the mistake', '-- Greeting\nprint("Hi")\n- print("Bye")', 2, 'A comment needs two dashes, not one.');
fill('Make a comment that spans many lines', '▢ this is a long note\nthat keeps going ▢', ['--[[', ']]'], ['/*', '*/'], 'Long comments start with --[[ and end with ]].');
tf('Comments change what your script does.', false, 'Luau skips comments completely. They are only for people reading the code.');
pick('What does this print?', 'print("A") -- print("B")\n-- print("C")\nprint("D")', ['A\nD', 'A\nB\nC\nD', 'A\nB\nD', 'D'], 'Everything after -- on a line is skipped.');
build('Switch this line off by making it a comment', ['--', 'print(', '"debug"', ')'], ['//', '#'], 'Put -- in front and Luau skips the whole line.');
pick('What does this print?', 'print("Hi") -- says hi', ['Hi', 'Hi -- says hi', 'says hi', 'An error'], 'The comment after the code is ignored.');

at('variables');
fill('Make a variable called coins', '▢ coins = 10', ['local'], ['var', 'let'], 'local creates a new variable.');
type('What does this print?', 'local coins = 10\ncoins = 25\nprint(coins)', '25', 'The second line replaces 10 with 25.');
pick('Which variable name is allowed?', '', ['playerName', '2player', 'player name', 'local'], 'Names can\'t start with a number, have spaces, or be a keyword.');
order('Put the lines in order so it prints 70', ['local health = 100', 'health = health - 30', 'print(health)'], 'Make the variable, change it, then print it.');
build('Make a variable called speed set to 16', ['local', 'speed', '=', '16'], ['var', '=='], 'local, the name, =, then the value.');
trace('Follow coins line by line', 'local coins = 5\ncoins = coins + 3\ncoins = coins * 2', 'coins', [[1, '5'], [2, '8'], [3, '16']], ['10', '13', '3'], 'Each line uses the value from the line before.');
type('What does this print?', 'local a = 4\nlocal b = a\na = 9\nprint(b)', '4', 'b got a copy of 4. Changing a afterwards doesn\'t change b.');
gen('type', () => {
  const a = rnd(2, 20), b = rnd(2, 15);
  return { q: 'What does this print?', code: `local coins = ${a}\ncoins = coins + ${b}\nprint(coins)`, ans: String(a + b), why: `coins starts at ${a}, then ${b} is added: ${a + b}.` };
});

at('math');
type('What does this print?', 'print(7 + 3 * 2)', '13', 'Multiplication happens first: 3 * 2 = 6, then 7 + 6.');
pick('What does this print?', 'print(10 % 3)', ['1', '3', '0', '3.33'], '% gives the remainder. 10 / 3 is 3 with 1 left over.');
fill('Split 10 in half', 'local half = 10 ▢ 2', ['/'], ['%', '^', '*'], '/ divides.');
pick('What does this print?', 'print(2 ^ 3)', ['8', '6', '5', '23'], '^ is power: 2 × 2 × 2 = 8.');
match('Match each sign to what it does', [['+', 'add'], ['*', 'multiply'], ['%', 'remainder'], ['^', 'power']]);
trace('Follow x', 'local x = 10\nx = x - 4\nx = x * 3\nx = x % 5', 'x', [[1, '10'], [2, '6'], [3, '18'], [4, '3']], ['4', '12', '30'], '18 % 5 is the remainder of 18 / 5, which is 3.');
type('What does this print?', 'print((7 + 3) * 2)', '20', 'Brackets go first: 7 + 3 = 10, then times 2.');
build('Print 5 times 4', ['print(', '5', '*', '4', ')'], ['x', '+'], '* is multiply.', ['print(4 * 5)']);
gen('type', () => {
  const a = rnd(1, 9), b = rnd(2, 6), c = rnd(2, 6);
  return { q: 'What does this print?', code: `print(${a} + ${b} * ${c})`, ans: String(a + b * c), why: `* goes first: ${b} * ${c} = ${b * c}, then ${a} + ${b * c}.` };
});
gen('pick', () => {
  const b = rnd(3, 6), a = b * rnd(1, 5) + rnd(1, b - 1);
  return { q: 'What does this print?', code: `print(${a} % ${b})`, opts: opts4(a % b, Math.floor(a / b), b, a % b + 1, 0, b - 1, a), why: `${a} / ${b} is ${Math.floor(a / b)} with ${a % b} left over.` };
});

at('strings');
fill('Join the two pieces of text', 'print("Hi " ▢ name)', ['..'], ['+', '&', ','], 'Two dots join strings together.');
type('What does this print?', 'local a = "Ro"\nlocal b = "blox"\nprint(a .. b)', 'Roblox', '.. glues the strings with no space between.');
pick('What does this print?', 'print("Level " .. 5)', ['Level 5', 'An error', 'Level5', '"Level " 5'], 'Numbers turn into text when you join them with ..');
tf('"5" + "5" gives "55".', false, '+ is for math. Luau turns both into numbers and gives 10. Use .. to join text.');
build('name holds "Sam". Print Hi Sam', ['print(', '"Hi "', '..', 'name', ')'], ['+', ','], '.. joins the two strings. The space is inside "Hi ".');
type('What does this print?', 'local word = "Ro" .. "bo" .. "t"\nprint(word)', 'Robot', 'You can chain .. as many times as you like.');
trace('Follow msg', 'local msg = "Go"\nmsg = msg .. "!"\nmsg = "Ready, " .. msg', 'msg', [[1, 'Go'], [2, 'Go!'], [3, 'Ready, Go!']], ['Go!Ready, ', 'Ready,Go!'], 'The order of the pieces is the order they get joined.');
bug('Tap the line with the mistake', 'local first = "Mia"\nlocal msg = "Hi " + first\nprint(msg)', 1, 'Use .. to join text. + tries to do math and errors on "Hi ".');
pick('What does this print?', 'print("1" .. "2")', ['12', '3', '1 2', 'An error'], '.. joins, it never adds. "1" and "2" become "12".');

at('interp');
fill('Use string interpolation', 'print(▢Hi {name}!▢)', ['`', '`'], ['"', '"'], 'Backticks let you put values inside {curly braces}.');
type('What does this print?', 'local n = 3\nprint(`You have {n} lives`)', 'You have 3 lives', '{n} is swapped for the value of n.');
pick('What does this print?', 'print(`{2 + 2}`)', ['4', '2 + 2', '{2 + 2}', 'An error'], 'Whatever is inside {} gets worked out first.');
type('What does this print?', 'local name = "Zed"\nprint(`Hi {name}!`)', 'Hi Zed!', '{name} is swapped for "Zed".');
pick('What does this print?', 'local x = 5\nprint("x is {x}")', ['x is {x}', 'x is 5', 'x is x', 'An error'], 'Only backtick strings fill in {}. Normal quotes print it as written.');
build('score is 10. Print Score: 10 with interpolation', ['print(', '`Score: {score}`', ')'], ['"Score: {score}"', '..'], 'Backticks, not quotes, make {score} fill in.');
tf('A backtick string can have more than one {} in it.', true, 'Each {} gets filled in with its own value.');
gen('type', () => {
  const a = rnd(2, 12), b = rnd(2, 12);
  return { q: 'What does this print?', code: `print(\`{${a}} + {${b}} = {${a} + ${b}}\`)`, ans: `${a} + ${b} = ${a + b}`, why: 'Each {} is worked out on its own. Text outside {} is printed as it is.' };
});

at('booleans');
pick('What does this print?', 'print(5 > 3)', ['true', 'false', '5', 'An error'], '5 is bigger than 3, so the answer is true.');
fill('Check if two values are equal', 'print(10 ▢ 10) -- true', ['=='], ['=', '~=', '!='], '== compares. A single = stores a value.');
type('What does this print?', 'print(4 ~= 4)', 'false', '~= means "not equal". 4 is equal to 4, so it\'s false.');
tf('A single = checks if two things are equal.', false, '= stores a value in a variable. == checks if things are equal.');
match('Match the sign to its meaning', [['==', 'equal to'], ['~=', 'not equal'], ['>=', 'at least'], ['<', 'less than']]);
build('Print whether 3 is less than 8', ['print(', '3', '<', '8', ')'], ['>', '='], '< means less than.', ['print(8 > 3)']);
trace('Follow ok', 'local hp = 50\nlocal ok = hp > 20\nhp = 10\nok = hp > 20', 'ok', [[2, 'true'], [4, 'false']], ['nil', '50'], 'ok stores the answer of the check at the moment it ran.');
gen('type', () => {
  const a = rnd(1, 9), b = rnd(1, 9), op = one(['>', '<', '>=', '<=', '==', '~=']);
  const r = { '>': a > b, '<': a < b, '>=': a >= b, '<=': a <= b, '==': a === b, '~=': a !== b }[op];
  return { q: 'What does this print?', code: `print(${a} ${op} ${b})`, ans: String(r), why: `${a} ${op} ${b} is ${r}.` };
});

at('if');
order('Put the lines in order', ['local coins = 15', 'if coins >= 10 then', '    print("Buy!")', 'end'], 'Make the variable, then the if with then, the action, and end.');
fill('Finish the if statement', 'if health <= 0 ▢\n    print("Game over")\n▢', ['then', 'end'], ['do', '{', '}'], 'An if needs then after the check, and end to close it.');
bug('Tap the line with the mistake', 'local score = 50\nif score > 40\n    print("Nice")\nend', 1, 'The if line is missing then at the end.');
type('What does this print?', 'local x = 3\nif x > 5 then\n    print("big")\nend\nprint("done")', 'done', '3 is not bigger than 5, so only "done" prints.');
type('What does this print?', 'local coins = 30\nif coins >= 30 then\n    print("rich")\nend', 'rich', '>= means at least. 30 is at least 30.');
build('Start an if that checks if lives is 0', ['if', 'lives', '==', '0', 'then'], ['=', 'do'], 'Use == to compare, and finish with then.', ['if 0 == lives then']);
trace('Follow speed', 'local speed = 10\nif speed > 5 then\n    speed = speed * 2\nend\nspeed = speed + 1', 'speed', [[1, '10'], [3, '20'], [5, '21']], ['11', '15', '22'], '10 > 5, so it doubles, then 1 is added after the if.');
pick('What does this print?', 'local key = false\nif key then\n    print("open")\nend\nprint("locked?")', ['locked?', 'open\nlocked?', 'open', 'Nothing'], 'key is false, so the if body is skipped.');

at('else');
pick('What does this print?', 'local temp = 20\nif temp > 25 then\n    print("hot")\nelseif temp > 15 then\n    print("warm")\nelse\n    print("cold")\nend', ['warm', 'hot', 'cold', 'warm\ncold'], 'The first check that is true wins. 20 > 15, so "warm".');
fill('Fill in the missing words', 'if n > 0 then\n    print("positive")\n▢ n < 0 then\n    print("negative")\n▢\n    print("zero")\nend', ['elseif', 'else'], ['else if', 'elif', 'otherwise'], 'elseif adds another check. else catches everything left.');
tf('You can have many elseif parts but only one else.', true, 'else is the final fallback, so there is only one.');
bug('Tap the line with the mistake', 'if hp > 50 then\n    print("fine")\nelse if hp > 0 then\n    print("hurt")\nend', 2, 'elseif is one word. else if starts a new if that needs its own end.');
pick('What does this print?', 'local s = 100\nif s > 50 then\n    print("A")\nelseif s > 80 then\n    print("B")\nend', ['A', 'B', 'A\nB', 'Nothing'], 'Only the first true check runs. 100 > 50 wins before 100 > 80 is even checked.');
trace('Follow grade', 'local score = 72\nlocal grade = "F"\nif score >= 90 then\n    grade = "A"\nelseif score >= 70 then\n    grade = "B"\nend', 'grade', [[2, 'F'], [6, 'B']], ['A', 'nil', 'C'], '72 is not 90 or more, but it is 70 or more.');
order('Print "even" or "odd"', ['local n = 7', 'if n % 2 == 0 then', '    print("even")', 'else', '    print("odd")', 'end'], 'The if checks, the else catches everything else, and one end closes both.');
gen('type', () => {
  const x = rnd(0, 15);
  return { q: 'What does this print?', code: `local x = ${x}\nif x >= 10 then\n    print("big")\nelseif x >= 5 then\n    print("medium")\nelse\n    print("small")\nend`,
    ans: x >= 10 ? 'big' : x >= 5 ? 'medium' : 'small', why: 'The first check that is true wins. If none are, else runs.' };
});

at('logic');
type('What does this print?', 'print(true and false)', 'false', 'and needs both sides to be true.');
pick('What does this print?', 'print(not true or true)', ['true', 'false', 'nil', 'An error'], 'not goes first: not true is false. false or true is true.');
fill('The door opens only if both are true', 'if hasKey ▢ doorUnlocked then', ['and'], ['or', 'not', '&&'], 'and is true only when both sides are true.');
pick('What does this print?', 'print(nil or "guest")', ['guest', 'nil', 'true', 'An error'], 'or gives the first value that isn\'t nil or false.');
build('Check that the player is alive and has a key', ['if', 'alive', 'and', 'hasKey', 'then'], ['or', 'not'], 'and needs both to be true.', ['if hasKey and alive then']);
tf('not false is true.', true, 'not flips true and false.');
type('What does this print?', 'local hp = 0\nprint(hp > 0 or "dead")', 'dead', 'hp > 0 is false, so or gives the right side.');
gen('type', () => {
  const a = one([true, false]), b = one([true, false]), op = one(['and', 'or']), neg = Math.random() < 0.4;
  const left = neg ? !a : a, r = op === 'and' ? left && b : left || b;
  return { q: 'What does this print?', code: `print(${neg ? 'not ' : ''}${a} ${op} ${b})`, ans: String(r), why: `${neg ? 'not goes first, so the left side is ' + left + '. ' : ''}and needs both sides true, or needs at least one.` };
});

at('for');
pick('What does this print?', 'for i = 1, 3 do\n    print(i)\nend', ['1\n2\n3', '1\n2', '0\n1\n2\n3', '3'], 'i starts at 1 and goes up to 3, including 3.');
fill('Finish the loop', '▢ i = 1, 5 ▢\n    print(i)\nend', ['for', 'do'], ['while', 'then', 'loop'], 'A for loop is: for i = start, finish do ... end');
pick('How many times does it print "hi"?', 'for i = 1, 10 do\n    print("hi")\nend', ['10', '9', '11', '1'], '1 to 10 is ten rounds.');
order('Make a loop that prints 2, 4, 6', ['for i = 2, 6, 2 do', '    print(i)', 'end'], 'The third number is the step: count up by 2.');
trace('What is i each round?', 'for i = 1, 9, 4 do\n    print("tick")\nend', 'i', [[1, '1'], [1, '5'], [1, '9']], ['4', '8', '13'], 'The step is 4: 1, 5, 9. 13 would be past 9, so it stops.');
build('Start a loop from 1 to 5', ['for', 'i', '=', '1,', '5', 'do'], ['while', 'then'], 'for, the counter, start, finish, then do.');
pick('What does this print?', 'for i = 1, 3 do\n    print("go")\nend\nprint(i)', ['go\ngo\ngo\nnil', 'go\ngo\ngo\n3', 'go\ngo\ngo', 'An error'], 'i only exists inside the loop. Outside, i is nil.');
gen('pick', () => {
  const a = rnd(1, 5), b = a + rnd(2, 8), n = b - a + 1;
  return { q: 'How many times does it print "hi"?', code: `for i = ${a}, ${b} do\n    print("hi")\nend`, opts: opts4(n, n - 1, n + 1, b, b - a), why: `${a} to ${b}, counting both ends, is ${n} rounds.` };
});

at('countdown');
fill('Count down from 10 to 1', 'for i = 10, 1, ▢ do\n    print(i)\nend', ['-1'], ['1', '0', '-10'], 'A step of -1 makes the loop count down.');
pick('What does this print?', 'for i = 3, 1, -1 do\n    print(i)\nend', ['3\n2\n1', '1\n2\n3', '3\n2', 'Nothing'], 'It starts at 3 and goes down to 1.');
tf('for i = 5, 1 do counts down from 5 to 1.', false, 'Without -1 it counts up, and 5 is already past 1, so it runs zero times.');
build('Count down from 5 to 1', ['for', 'i', '=', '5,', '1,', '-1', 'do'], ['1', 'while'], 'The third number, -1, makes it count down.');
trace('What is i each round?', 'for i = 10, 1, -3 do\n    print(i)\nend', 'i', [[1, '10'], [1, '7'], [1, '4'], [1, '1']], ['0', '-2', '3'], 'Each round takes away 3. 1 is not past 1 yet, so it still runs.');
pick('What does this print?', 'for i = 6, 0, -2 do\n    print(i)\nend', ['6\n4\n2\n0', '6\n4\n2', '4\n2\n0', '0\n2\n4\n6'], 'It starts at 6, takes 2 each time, and 0 is included.');
tf('for i = 3, 1, -1 runs 3 times.', true, '3, 2, 1: three rounds.');
gen('pick', () => {
  const b = rnd(0, 3), s = rnd(1, 3), a = b + s * rnd(2, 5) + rnd(0, s - 1), n = Math.floor((a - b) / s) + 1;
  return { q: 'How many times does the loop run?', code: `for i = ${a}, ${b}, -${s} do\n    print(i)\nend`, opts: opts4(n, n + 1, n - 1, a - b, a), why: `It goes down by ${s} from ${a} and stops once it would pass ${b}: ${n} rounds.` };
});

at('while');
order('Make a loop that prints 1, 2, 3', ['local n = 1', 'while n <= 3 do', '    print(n)', '    n = n + 1', 'end'], 'Change n inside the loop, or it never stops.');
bug('This loop never ends. Tap the bad line.', 'local fuel = 3\nwhile fuel > 0 do\n    print("Flying")\n    fuel = fuel + 1\nend', 3, 'fuel keeps growing, so fuel > 0 is always true. It should be fuel - 1.');
pick('When does a while loop stop?', '', ['When its check becomes false', 'After 10 rounds', 'When it prints', 'Never'], 'It keeps going as long as the check is true.');
trace('Follow n', 'local n = 1\nwhile n < 20 do\n    n = n * 3\nend', 'n', [[1, '1'], [3, '3'], [3, '9'], [3, '27']], ['20', '18', '6'], '9 is still under 20, so it runs once more and gets 27.');
pick('What does this print?', 'local n = 10\nwhile n < 5 do\n    n = n + 1\nend\nprint(n)', ['10', '5', '11', 'Nothing'], 'The check is false from the start, so the loop body never runs.');
build('Keep looping while hp is above 0', ['while', 'hp', '>', '0', 'do'], ['then', 'for'], 'while, the check, then do.', ['while 0 < hp do']);
tf('A while loop always runs at least once.', false, 'It checks first. If the check is false at the start, it runs zero times.');
gen('type', () => {
  const a = rnd(0, 5), s = rnd(2, 5), b = a + rnd(6, 20);
  let n = a; while (n < b) n += s;
  return { q: 'What does this print?', code: `local n = ${a}\nwhile n < ${b} do\n    n = n + ${s}\nend\nprint(n)`, ans: String(n), why: `n goes up by ${s} until it is no longer under ${b}. That happens at ${n}.` };
});

at('totals');
type('What does this print?', 'local total = 0\nfor i = 1, 4 do\n    total = total + i\nend\nprint(total)', '10', '1 + 2 + 3 + 4 = 10');
fill('Add up the numbers', 'local sum = 0\nfor i = 1, 3 do\n    sum = ▢ + i\nend', ['sum'], ['i', '0', 'total'], 'Add i to what you already have in sum.');
bug('Tap the line that breaks the total', 'for i = 1, 5 do\n    local total = 0\n    total = total + i\nend\nprint(total)', 1, 'total is reset every round and only exists inside the loop. Make it before the loop.');
trace('Follow total', 'local total = 0\nfor i = 1, 3 do\n    total = total + i\nend', 'total', [[3, '1'], [3, '3'], [3, '6']], ['2', '4', '0'], 'Round 1 adds 1, round 2 adds 2, round 3 adds 3.');
type('What does this print?', 'local count = 0\nfor i = 1, 10 do\n    if i % 2 == 0 then\n        count = count + 1\n    end\nend\nprint(count)', '5', 'It counts the even numbers from 1 to 10: 2, 4, 6, 8, 10.');
build('Add 5 to score', ['score', '=', 'score', '+', '5'], ['==', 'total'], 'Take what score has, add 5, store it back in score.', ['score = 5 + score']);
pick('What does this print?', 'local total = 1\nfor i = 1, 3 do\n    total = total * 2\nend\nprint(total)', ['8', '6', '7', '2'], '1 doubles three times: 2, 4, 8.');
gen('type', () => {
  const n = rnd(3, 9);
  return { q: 'What does this print?', code: `local total = 0\nfor i = 1, ${n} do\n    total = total + i\nend\nprint(total)`, ans: String(n * (n + 1) / 2), why: `It adds 1 + 2 + ... + ${n} = ${n * (n + 1) / 2}.` };
});

at('break');
pick('What does this print?', 'for i = 1, 10 do\n    if i == 3 then break end\n    print(i)\nend', ['1\n2', '1\n2\n3', '3', '1 to 10'], 'break stops the loop before 3 is printed.');
fill('Skip the even numbers', 'for i = 1, 5 do\n    if i % 2 == 0 then ▢ end\n    print(i)\nend', ['continue'], ['break', 'return', 'skip'], 'continue jumps to the next round.');
tf('break stops the whole loop, continue skips to the next round.', true, 'That\'s exactly the difference.');
type('What does this print?', 'local sum = 0\nfor i = 1, 10 do\n    if i > 4 then break end\n    sum = sum + i\nend\nprint(sum)', '10', 'It stops when i is 5, so only 1 + 2 + 3 + 4 gets added.');
pick('What does this print?', 'for i = 1, 4 do\n    if i == 2 then continue end\n    print(i)\nend', ['1\n3\n4', '1', '1\n2\n3\n4', '3\n4'], 'continue skips only round 2.');
trace('Follow found', 'local found = 0\nfor i = 1, 10 do\n    if i * i > 20 then\n        found = i\n        break\n    end\nend', 'found', [[1, '0'], [4, '5']], ['4', '10', '25'], '4 × 4 = 16 isn\'t over 20, but 5 × 5 = 25 is. Then break stops the loop.');
build('Stop the loop once done is true', ['if', 'done', 'then', 'break', 'end'], ['continue', 'return'], 'break leaves the loop straight away.');
bug('This should skip 3, but it stops instead. Tap the bad line.', 'for i = 1, 5 do\n    if i == 3 then break end\n    print(i)\nend', 1, 'break ends the whole loop. Use continue to skip just one round.');

at('functions');
order('Make and call a function', ['local function greet()', '    print("Hello!")', 'end', 'greet()'], 'Define it first, then call it with ().');
fill('Make a function and call it', 'local ▢ jump()\n    print("Boing")\nend\n▢()', ['function', 'jump'], ['func', 'def', 'run'], 'local function name() ... end, then name() runs it.');
tf('Code inside a function runs as soon as you write it.', false, 'It only runs when you call the function.');
pick('How many times is "hi" printed?', 'local function hi()\n    print("hi")\nend\nhi()\nhi()', ['2', '1', '3', '0'], 'Defining doesn\'t print. Each hi() call prints once.');
build('Start a function called spawnBoss', ['local', 'function', 'spawnBoss', '()'], ['func', 'end'], 'local function, the name, then ().');
type('What does this print?', 'local function a()\n    print("A")\nend\nlocal function b()\n    print("B")\nend\nb()', 'B', 'Only b is called. Making a function doesn\'t run it.');
bug('greet never prints. Tap the line with the mistake.', 'local function greet()\n    print("Hello")\nend\ngreet', 3, 'greet on its own does nothing. You need greet() to call it.');
trace('Follow n', 'local n = 0\nlocal function bump()\n    n = n + 1\nend\nbump()\nbump()', 'n', [[1, '0'], [3, '1'], [3, '2']], ['3', 'nil'], 'Line 3 runs once for each bump() call.');

at('params');
fill('Give the function a parameter', 'local function heal(▢)\n    print("Healed " .. amount)\nend\nheal(20)', ['amount'], ['20', 'heal', '"amount"'], 'The parameter name goes in the brackets. 20 gets stored in it.');
type('What does this print?', 'local function add(a, b)\n    print(a + b)\nend\nadd(4, 6)', '10', 'a is 4 and b is 6.');
pick('What does this print?', 'local function hi(name)\n    print("Hi " .. name)\nend\nhi("Sam")', ['Hi Sam', 'Hi name', 'Sam', 'An error'], 'name holds "Sam".');
pick('What does this print?', 'local function show(a, b)\n    print(b)\nend\nshow(1)', ['nil', '1', '0', 'An error'], 'Only one value was passed, so b is nil.');
trace('Follow hp', 'local hp = 100\nlocal function hit(dmg)\n    hp = hp - dmg\nend\nhit(30)\nhit(15)', 'hp', [[1, '100'], [3, '70'], [3, '55']], ['85', '45', '30'], 'dmg is 30 on the first call and 15 on the second.');
type('What does this print?', 'local function shout(word, n)\n    print(word .. string.rep("!", n))\nend\nshout("go", 3)', 'go!!!', 'word is "go" and n is 3.');
build('Call heal with 50', ['heal(', '50', ')'], ['amount', '"50"'], 'The value goes inside the brackets when you call it.');
gen('type', () => {
  const x = rnd(2, 12), y = rnd(2, 9), op = one(['+', '-', '*']);
  const r = op === '+' ? x + y : op === '-' ? x - y : x * y;
  return { q: 'What does this print?', code: `local function calc(a, b)\n    print(a ${op} b)\nend\ncalc(${x}, ${y})`, ans: String(r), why: `a is ${x} and b is ${y}, so it prints ${x} ${op} ${y} = ${r}.` };
});

at('return');
type('What does this print?', 'local function double(n)\n    return n * 2\nend\nprint(double(7))', '14', 'double(7) gives back 14.');
fill('Give back the area', 'local function area(w, h)\n    ▢ w * h\nend', ['return'], ['print', 'give', 'end'], 'return sends a value back to whoever called the function.');
pick('What does this print?', 'local function f(x)\n    print(x)\nend\nlocal r = f(5)\nprint(r)', ['5\nnil', '5\n5', 'nil', '5'], 'f prints 5 but returns nothing, so r is nil.');
build('Send back the sum of a and b', ['return', 'a', '+', 'b'], ['print(', 'end'], 'return gives the value back to the caller.', ['return b + a']);
trace('Follow r', 'local function sq(n)\n    return n * n\nend\nlocal r = sq(3)\nr = sq(r)', 'r', [[4, '9'], [5, '81']], ['6', '27', '18'], 'sq(3) is 9, then sq(9) is 81.');
pick('What does this print?', 'local function f()\n    return 1\n    print("after")\nend\nprint(f())', ['An error', '1', 'after\n1', '1\nafter'], 'return must be the last line in its block. Code after it is a syntax error.');
type('What does this print?', 'local function half(n)\n    return n / 2\nend\nprint(half(9))', '4.5', '/ can give decimals. 9 / 2 = 4.5.');
gen('type', () => {
  const k = one([2, 3, 10]), a = rnd(2, 9);
  return { q: 'What does this print?', code: `local function scale(n)\n    return n * ${k}\nend\nprint(scale(${a}) + 1)`, ans: String(a * k + 1), why: `scale(${a}) gives back ${a * k}, then 1 is added.` };
});

at('scope');
bug('print shows nil. Tap the cause.', 'local function setScore()\n    local score = 100\nend\nsetScore()\nprint(score)', 1, 'score is local to the function. Make it outside the function instead.');
pick('What does this print?', 'local x = 1\nif true then\n    local x = 2\nend\nprint(x)', ['1', '2', 'nil', 'An error'], 'The inner x only lives inside the if block.');
tf('A local made inside a function can be used anywhere in the script.', false, 'It only exists inside that function.');
type('What does this print?', 'local x = 5\nlocal function f()\n    x = 10\nend\nf()\nprint(x)', '10', 'There\'s no local inside f, so it changes the outer x.');
pick('What does this print?', 'local x = 5\nlocal function f()\n    local x = 10\nend\nf()\nprint(x)', ['5', '10', 'nil', 'An error'], 'local x inside f is a new variable. The outer x stays 5.');
trace('Follow count', 'local count = 0\nlocal function add()\n    count = count + 5\nend\nadd()\ncount = count + 1', 'count', [[1, '0'], [3, '5'], [6, '6']], ['1', '10', 'nil'], 'add has no local count, so it changes the outer one.');
bug('This prints nil instead of 3. Tap the cause.', 'local total\nif true then\n    local total = 3\nend\nprint(total)', 2, 'local makes a new total that only lives inside the if. Write total = 3 instead.');
tf('A local made above a function can be used inside it.', true, 'Code inside can see variables made above it.');

at('arrays');
type('What does this print?', 'local fruits = {"apple", "pear", "plum"}\nprint(fruits[2])', 'pear', 'Arrays start at 1, so [2] is the second item.');
pick('What does this print?', 'local t = {"a", "b", "c"}\nprint(#t)', ['3', '2', 'abc', 'c'], '# counts the items.');
tf('The first item in a Luau array is at index 0.', false, 'Luau arrays start at 1.');
fill('Get the Pistol', 'local guns = {"Pistol", "Rifle"}\nprint(guns[▢])', ['1'], ['0', '2', '"Pistol"'], 'Pistol is the first item: index 1.');
build('Print the last item of list', ['print(', 'list[', '#list', ']', ')'], ['0', '[1]'], '#list is the number of items, which is also the last index.');
type('What does this print?', 'local t = {10, 20, 30}\nt[2] = 99\nprint(t[2])', '99', 't[2] = 99 replaces the second item.');
pick('What does this print?', 'local t = {"a", "b"}\nprint(t[3])', ['nil', 'b', 'An error', '0'], 'There is no third item, so you get nil.');
gen('type', () => {
  const words = ['sword', 'shield', 'bow', 'potion', 'map', 'key', 'gem'].sort(() => Math.random() - 0.5).slice(0, 4), k = rnd(1, 4);
  return { q: 'What does this print?', code: `local items = {${words.map(w => `"${w}"`).join(', ')}}\nprint(items[${k}])`, ans: words[k - 1], why: `Arrays start at 1, so [${k}] is item number ${k}.` };
});

at('ipairs');
order('Print every name with its number', ['local names = {"Ann", "Bo"}', 'for i, name in ipairs(names) do', '    print(i, name)', 'end'], 'ipairs gives the index and the item, in order.');
fill('Loop through the items', 'for ▢, item in ▢(items) do', ['i', 'ipairs'], ['each', '#', 'loop'], 'for i, item in ipairs(list) do');
pick('What does this print?', 'for i, v in ipairs({"x", "y"}) do\n    print(i, v)\nend', ['1 x\n2 y', 'x\ny', '1\n2', '0 x\n1 y'], 'Each round prints the index and the value.');
type('What does this print?', 'local total = 0\nfor _, n in ipairs({4, 5, 6}) do\n    total = total + n\nend\nprint(total)', '15', '4 + 5 + 6 = 15.');
trace('Follow best', 'local best = 0\nfor _, s in ipairs({3, 8, 5}) do\n    if s > best then best = s end\nend', 'best', [[3, '3'], [3, '8'], [3, '8']], ['5', '16', '0'], 'best only changes when a bigger score shows up.');
build('Loop through every enemy', ['for', '_,', 'enemy', 'in', 'ipairs(', 'enemies', ')', 'do'], ['pairs(', '#'], 'for _, item in ipairs(list) do');
pick('What is _ for in: for _, v in ipairs(t)?', '', ['A name for a value you don\'t need', 'It skips the loop', 'It makes the loop faster', 'It\'s a syntax error'], 'By habit, _ means "I\'m ignoring this one". Here it holds the index.');
tf('ipairs goes through an array in order, starting at 1.', true, 'That\'s exactly what ipairs is for.');

at('tablefns');
fill('Add a Sword to the end', 'table.▢(inventory, "Sword")', ['insert'], ['remove', 'add', 'push'], 'table.insert adds an item.');
type('What does this print?', 'local t = {"a", "b", "c"}\ntable.remove(t, 1)\nprint(t[1])', 'b', 'Removing the first item shifts the rest down.');
pick('What does this print?', 'local t = {}\ntable.insert(t, 5)\ntable.insert(t, 9)\nprint(#t)', ['2', '9', '14', '0'], 'There are two items in t.');
match('Match each one to what it does', [['table.insert', 'add an item'], ['table.remove', 'take one out'], ['#list', 'count items'], ['ipairs', 'loop in order']]);
trace('Follow #bag', 'local bag = {}\ntable.insert(bag, "gem")\ntable.insert(bag, "key")\ntable.remove(bag)', '#bag', [[1, '0'], [2, '1'], [3, '2'], [4, '1']], ['3'], 'insert adds one. remove with no position takes the last one off.');
build('Remove the first item from list', ['table.remove(', 'list,', '1', ')'], ['table.insert(', '0'], 'The second value is the position to remove.');
pick('What does this print?', 'local t = {"a", "b", "c"}\ntable.remove(t)\nprint(#t)', ['2', '3', '1', '0'], 'With no position, remove takes off the last item.');
gen('type', () => {
  const adds = rnd(2, 5), removes = rnd(0, 2);
  const code = ['local t = {}', ...Array.from({ length: adds }, (_, i) => `table.insert(t, ${(i + 1) * 10})`), ...Array.from({ length: removes }, () => 'table.remove(t)'), 'print(#t)'].join('\n');
  return { q: 'What does this print?', code, ans: String(adds - removes), why: `${adds} added, ${removes} removed, so ${adds - removes} left.` };
});

at('dicts');
type('What does this print?', 'local player = {name = "Mia", coins = 40}\nprint(player.coins)', '40', 'player.coins looks up the coins key.');
fill('Give the key a name', 'local stats = {▢ = 100, speed = 16}\nprint(stats.health)', ['health'], ['"health"', 'Health', '100'], 'Keys are written without quotes in this style, and the case must match.');
pick('What does this print?', 'local p = {name = "Mia"}\nprint(p.age)', ['nil', '0', 'An error', 'age'], 'A key that doesn\'t exist gives nil.');
tf('player.coins and player["coins"] mean the same thing.', true, 'Both look up the "coins" key.');
build('Make a dictionary with name set to "Mia"', ['local', 'p', '=', '{', 'name', '=', '"Mia"', '}'], ['"name"', ':'], 'key = value inside the curly braces.');
type('What does this print?', 'local inv = {sword = 1}\ninv.sword = inv.sword + 2\nprint(inv.sword)', '3', 'inv.sword works like any other variable.');
trace('Follow stats.hp', 'local stats = {hp = 100}\nstats.hp = stats.hp - 40\nstats.hp = nil', 'stats.hp', [[1, '100'], [2, '60'], [3, 'nil']], ['0', '40'], 'Setting a key to nil removes it.');
pick('What does this print?', 'local key = "gold"\nlocal bank = {gold = 7}\nprint(bank[key])', ['7', 'nil', 'gold', 'An error'], 'bank[key] uses the value of key, which is "gold".');

at('pairs');
order('Print every name and score', ['local scores = {Ann = 5, Bo = 9}', 'for name, score in pairs(scores) do', '    print(name, score)', 'end'], 'pairs gives each key and value.');
tf('pairs always goes through a dictionary in the order you wrote it.', false, 'The order of pairs isn\'t guaranteed.');
fill('Loop through a dictionary', 'for key, value in ▢(settings) do', ['pairs'], ['ipairs', 'table', '#'], 'Use pairs for dictionaries. ipairs is for arrays.');
type('What does this print?', 'local total = 0\nfor _, v in pairs({a = 2, b = 3}) do\n    total = total + v\nend\nprint(total)', '5', 'The order doesn\'t matter when you add everything up.');
build('Loop through every key and value in stats', ['for', 'k,', 'v', 'in', 'pairs(', 'stats', ')', 'do'], ['ipairs(', '#'], 'pairs gives you each key and value.');
pick('Which loop fits {Ann = 5, Bo = 9}?', '', ['pairs', 'ipairs', 'for i = 1, #t', 'while'], 'Keys like Ann and Bo aren\'t 1, 2, 3, so use pairs.');
tf('pairs also works on arrays.', true, 'pairs goes through every key, including 1, 2, 3. It just doesn\'t promise the order.');
bug('This prints nothing. Tap the line with the mistake.', 'local ages = {Ann = 12, Bo = 14}\nfor name, age in ipairs(ages) do\n    print(name, age)\nend', 1, 'ipairs only walks 1, 2, 3... This table has text keys, so use pairs.');

at('types');
fill('Say coins is a number', 'local coins: ▢ = 50', ['number'], ['string', 'int', 'boolean'], 'Luau has number, not int.');
pick('Which line is a type error?', '', ['local name: string = 5', 'local ok: boolean = true', 'local n: number = 3.5', 'local s: string = "hi"'], '5 is a number, not a string.');
fill('Say the function returns a number', 'local function add(a: number, b: number)▢ number', [':'], ['->', '=', '::'], 'The return type goes after a colon.');
build('Say name is a string', ['local', 'name:', 'string', '=', '"Ava"'], ['number', '::'], 'A colon after the name, then the type.');
match('Match each value to its type', [['5', 'number'], ['"hi"', 'string'], ['true', 'boolean'], ['{}', 'table']]);
type('What does this print?', 'print(typeof("hi"))', 'string', 'typeof tells you the type of a value.');
pick('What does typeof(42) give?', '', ['"number"', '"int"', '"42"', '"integer"'], 'Luau has one number type for whole numbers and decimals.');
tf('Adding types changes what your code prints.', false, 'Types only help catch mistakes before you run. The code runs the same.');

at('boss');
pick('What does this print?', 'local t = {5, 2, 8}\ntable.sort(t)\nprint(t[1])', ['2', '5', '8', 'An error'], 'table.sort puts the smallest first.');
order('Find the highest score', ['local best = 0', 'for _, s in ipairs(scores) do', '    if s > best then best = s end', 'end', 'print(best)'], 'Keep the biggest score seen so far.');
type('What does this print?', 'local scores = {4, 9, 2}\nlocal best = 0\nfor _, s in ipairs(scores) do\n    if s > best then best = s end\nend\nprint(best)', '9', 'best keeps the biggest score seen so far.');
trace('Follow total', 'local scores = {5, 7, 3}\nlocal total = 0\nfor _, s in ipairs(scores) do\n    total = total + s\nend', 'total', [[4, '5'], [4, '12'], [4, '15']], ['7', '10', '3'], 'Each round adds the next score.');
pick('What does this print?', 'local t = {3, 1, 2}\ntable.sort(t, function(a, b) return a > b end)\nprint(t[1])', ['3', '1', '2', 'An error'], 'This compare puts bigger numbers first.');
build('Sort the scores', ['table.sort(', 'scores', ')'], ['table.insert(', 'sort('], 'table.sort sorts the array in place, smallest first.');
type('What does this print?', 'local board = {Ann = 3, Bo = 8}\nprint(board.Bo - board.Ann)', '5', '8 - 3 = 5.');
fill('Print how many players there are', 'print(▢players)', ['#'], ['%', '.', 'count'], '# gives the number of items in an array.');

at('rbx-part');
order('Make a part that stays still', ['local part = Instance.new("Part")', 'part.Anchored = true', 'part.Parent = workspace'], 'Set it up, then parent it to workspace last.');
fill('Make a part and put it in the game', 'local part = Instance.▢("Part")\npart.▢ = workspace', ['new', 'Parent'], ['create', 'Folder', 'make'], 'Instance.new makes it. Setting Parent puts it in the world.');
tf('A new Part appears in the game even if you never set its Parent.', false, 'It only shows up once Parent is set to workspace (or something in it).');
pick('What stops a part from falling?', '', ['part.Anchored = true', 'part.CanCollide = true', 'part.Parent = workspace', 'part.Locked = true'], 'Anchored parts ignore gravity.');
build('Anchor the part', ['part.Anchored', '=', 'true'], ['"true"', '=='], 'true without quotes. "true" would be text.');
bug('The part never shows up. Tap the mistake.', 'local part = Instance.new("Part")\npart.Anchored = true\npart.Parent = nil', 2, 'Parent must be workspace for the part to appear.');
pick('Which line makes the part half see-through?', '', ['part.Transparency = 0.5', 'part.Transparency = 50', 'part.Visible = 0.5', 'part.Opacity = 0.5'], 'Transparency goes from 0 (solid) to 1 (invisible).');
match('Match each property to what it does', [['Anchored', 'stops it falling'], ['Transparency', 'see-through'], ['CanCollide', 'solid or not'], ['Parent', 'where it lives']]);

at('rbx-vector');
fill('Move the part up 10 studs', 'part.Position = ▢.new(0, 10, 0)', ['Vector3'], ['Vector2', 'Position', 'CFrame'], 'Positions in 3D use Vector3.');
pick('In Vector3.new(0, 10, 0), which number is height?', '', ['The middle one (Y)', 'The first one (X)', 'The last one (Z)', 'None of them'], 'X, Y, Z. Y is up.');
type('What does this print?', 'local v = Vector3.new(1, 2, 3)\nprint(v.Y)', '2', '.Y is the middle number.');
build('Move the part to 0, 5, 0', ['part.Position', '=', 'Vector3.new(', '0,', '5,', '0', ')'], ['Vector2.new(', 'CFrame'], 'X, Y, Z. 5 in the middle means 5 studs up.');
type('What does this print?', 'local v = Vector3.new(1, 2, 3) + Vector3.new(1, 1, 1)\nprint(v.X)', '2', 'Adding two Vector3s adds each part: X is 1 + 1.');
pick('What does Vector3.new(0, 0, 0) mean?', '', ['The centre of the world', 'An empty part', 'No position at all', 'The top of the map'], 'All three are 0: the origin, in the middle of the world.');
tf('You can set part.Position.Y = 5 on its own.', false, 'Vector3 values can\'t be changed piece by piece. Make a new one with Vector3.new.');
fill('Make the part 4 studs wide, 1 tall, 2 deep', 'part.▢ = Vector3.new(4, 1, 2)', ['Size'], ['Position', 'Scale', 'Shape'], 'Size uses a Vector3 too: X wide, Y tall, Z deep.');

at('rbx-find');
fill('Find the Door safely', 'local door = workspace:▢("Door")', ['FindFirstChild'], ['GetChild', 'Find', 'Children'], 'FindFirstChild looks for a child by name.');
pick('What does FindFirstChild give back if nothing has that name?', '', ['nil', 'An error', 'An empty Part', 'false'], 'It returns nil, so check with if before using it.');
bug('The part is named "Door". Tap the mistake.', '-- The part is named "Door"\nlocal door = workspace.door\ndoor.Transparency = 1', 1, 'Names are case-sensitive. It should be workspace.Door.');
order('Hide the Door only if it exists', ['local door = workspace:FindFirstChild("Door")', 'if door then', '    door.Transparency = 1', 'end'], 'Look for it, check it isn\'t nil, then use it.');
build('Wait for the Door to load', ['local', 'door', '=', 'workspace', ':WaitForChild(', '"Door"', ')'], ['.Door', ':GetService('], 'WaitForChild pauses until the child exists.');
pick('What\'s the difference between FindFirstChild and WaitForChild?', '', ['WaitForChild waits until it exists', 'FindFirstChild waits forever', 'They are the same', 'WaitForChild deletes it'], 'FindFirstChild gives nil straight away if it isn\'t there.');
tf('workspace.Door errors if there is no Door.', true, 'A dot lookup errors when the child is missing. FindFirstChild gives nil instead.');
fill('Find the Coins folder inside the player', 'local coins = player:▢("Coins")', ['FindFirstChild'], ['GetService', 'Find', 'Child'], 'FindFirstChild works on anything, not just workspace.');

at('rbx-wait');
pick('What does task.wait(2) do?', '', ['Pauses this script for 2 seconds', 'Waits 2 frames', 'Repeats 2 times', 'Pauses the whole game'], 'Only this script waits. The game keeps running.');
order('Count down then say Go!', ['for i = 3, 1, -1 do', '    print(i)', '    task.wait(1)', 'end', 'print("Go!")'], 'Wait inside the loop, print Go! after it.');
fill('Wait half a second', '▢.wait(0.5)', ['task'], ['game', 'time', 'script'], 'task.wait is the modern way to wait.');
build('Wait 3 seconds', ['task.wait(', '3', ')'], ['wait', 'task.delay('], 'task.wait takes the number of seconds.');
pick('What happens?', 'print("A")\ntask.wait(1)\nprint("B")', ['A, then B a second later', 'B, then A', 'A and B at the same time', 'Only B'], 'The script pauses on task.wait, then carries on.');
tf('task.wait() with no number waits about one frame.', true, 'With nothing inside, it waits for the next frame.');
match('Match each one to what it does', [['task.wait(1)', 'pause 1 second'], ['while true do', 'loop forever'], ['task.wait()', 'pause one frame'], ['break', 'leave the loop']]);
fill('Stop this loop from freezing the game', 'while true do\n    print("tick")\n    ▢(1)\nend', ['task.wait'], ['print', 'break', 'return'], 'A while true loop with no wait never gives the game a break.');

at('rbx-touched');
order('Print whatever touches the part', ['part.Touched:Connect(function(hit)', '    print(hit.Name)', 'end)'], 'Connect a function to the Touched event, and close it with end).');
fill('Listen for touches', 'part.Touched:▢(function(hit)', ['Connect'], ['Fire', 'Wait', 'Listen'], ':Connect runs your function every time the event happens.');
pick('How do you find the Humanoid of whatever touched?', '', ['hit.Parent:FindFirstChild("Humanoid")', 'hit:FindFirstChild("Humanoid")', 'workspace.Humanoid', 'hit.Humanoid.Parent'], 'hit is a body part. Its Parent is the character, which holds the Humanoid.');
bug('Tap the line with the mistake', 'part.Touched:Connect(function(hit)\n    print("touched")\nend', 2, 'The Connect( bracket is never closed. It should be end).');
fill('Kill the player', 'humanoid.▢ = 0', ['Health'], ['Dead', 'Life', 'HP'], 'Setting Health to 0 kills the character.');
build('Run onTouch when the part is touched', ['part.Touched', ':Connect(', 'onTouch', ')'], ['.Connect(', ':Fire('], 'Event, colon, Connect, and the function to run.');
tf('Touched fires only once per touch.', false, 'It can fire many times while things bump. That\'s why games add a debounce.');
pick('In Touched:Connect(function(hit), what is hit?', '', ['The part that touched it', 'The player', 'The Humanoid', 'The part with the script'], 'hit is whatever part bumped into it, like a leg or an arm.');

at('rbx-players');
fill('Get the Players service', 'local Players = game:▢("Players")', ['GetService'], ['FindService', 'Get', 'Service'], 'game:GetService gets a Roblox service.');
order('Say when a player joins', ['local Players = game:GetService("Players")', 'Players.PlayerAdded:Connect(function(player)', '    print(player.Name .. " joined")', 'end)'], 'Get the service, then connect to PlayerAdded.');
pick('Which event fires when someone leaves?', '', ['Players.PlayerRemoving', 'Players.PlayerLeft', 'Players.PlayerAdded', 'game.Closing'], 'PlayerRemoving fires just before they leave.');
build('Run onJoin when a player joins', ['Players.PlayerAdded', ':Connect(', 'onJoin', ')'], ['.PlayerJoined', ':Fire('], 'PlayerAdded is the event, Connect hooks up your function.');
tf('PlayerAdded gives your function the player who joined.', true, 'That\'s the player parameter.');
fill('Say who left', 'Players.▢:Connect(function(player)\n    print(player.Name .. " left")\nend)', ['PlayerRemoving'], ['PlayerAdded', 'PlayerLeft', 'Destroying'], 'PlayerRemoving fires as a player leaves.');
pick('What does player.Name hold?', '', ['Their username', 'Their avatar picture', 'Their character', 'Their friends list'], 'Name is the username.');
match('Match each one to what it is', [['Players', 'the service'], ['player', 'one person'], ['player.Character', 'their body'], ['player.UserId', 'their id number']]);

at('rbx-leaderstats');
fill('Name the folder so the leaderboard shows it', 'local stats = Instance.new("Folder")\nstats.Name = "▢"\nstats.Parent = player', ['leaderstats'], ['Leaderstats', 'stats', 'leaderboard'], 'It must be exactly leaderstats, all lowercase.');
pick('Which object shows a number on the leaderboard?', '', ['IntValue', 'Part', 'Folder', 'Script'], 'Put IntValues inside the leaderstats folder.');
order('Add a Coins stat', ['local coins = Instance.new("IntValue")', 'coins.Name = "Coins"', 'coins.Value = 0', 'coins.Parent = stats'], 'Make it, set it up, parent it last.');
tf('The leaderstats folder name must be all lowercase.', true, 'Roblox only looks for the exact name leaderstats.');
build('Put the stats folder in the player', ['stats.Parent', '=', 'player'], ['workspace', '=='], 'leaderstats must live inside the player.');
bug('Coins never shows on the leaderboard. Tap the mistake.', 'local stats = Instance.new("Folder")\nstats.Name = "Leaderstats"\nstats.Parent = player', 1, 'It must be leaderstats, all lowercase.');
fill('Add 10 coins', 'coins.▢ = coins.Value + 10', ['Value'], ['Amount', 'Coins', 'Number'], 'The number in an IntValue lives in .Value');
pick('Where must the leaderstats folder go?', '', ['Inside the player', 'In workspace', 'In ReplicatedStorage', 'Inside the character'], 'Roblox looks for it directly inside each player.');

at('rbx-boss');
pick('A ball touches the coin. What does GetPlayerFromCharacter(hit.Parent) give?', '', ['nil', 'The ball', 'An error', 'The nearest player'], 'The ball isn\'t a character, so there\'s no player. That\'s why you check if player then.');
fill('Remove the coin', 'coin:▢()', ['Destroy'], ['Delete', 'Kill', 'Hide'], ':Destroy() removes it from the game.');
fill('Give the player a coin', 'player.leaderstats.Coins.▢ += 1', ['Value'], ['Number', 'Amount', 'Count'], 'The number lives in .Value');
order('Give a coin when a player touches it', ['coin.Touched:Connect(function(hit)', '    local player = Players:GetPlayerFromCharacter(hit.Parent)', '    if player then', '        player.leaderstats.Coins.Value += 1', '    end', 'end)'], 'Get the player, check there is one, then give the coin.');
build('Get the player from what touched', ['local', 'player', '=', 'Players', ':GetPlayerFromCharacter(', 'hit.Parent', ')'], ['hit', 'workspace'], 'hit is a body part. hit.Parent is the character.');
tf('Without a debounce, one touch can give lots of coins.', true, 'Touched fires many times while the player stands on it.');
bug('This errors when a ball hits the coin. Tap the line that needs a check first.', 'coin.Touched:Connect(function(hit)\n    local player = Players:GetPlayerFromCharacter(hit.Parent)\n    player.leaderstats.Coins.Value += 1\nend)', 2, 'player is nil when something that isn\'t a player touches. Wrap it in if player then.');
pick('What does += 1 do?', '', ['Adds 1 to the value', 'Sets it to 1', 'Checks if it equals 1', 'Takes 1 away'], 'x += 1 is short for x = x + 1.');

at('cs-intro');
pick('Where does a LocalScript run?', '', ['On the player\'s device (client)', 'On Roblox\'s servers', 'Only in Studio', 'On every player at once'], 'LocalScripts run on each player\'s own device.');
tf('If a LocalScript changes a part, every player sees it.', false, 'Changes made on the client only show for that one player.');
match('Match each one to its job', [['Script', 'runs on the server'], ['LocalScript', 'runs on the client'], ['RemoteEvent', 'sends messages between them'], ['ReplicatedStorage', 'shared by both']]);
tf('A server Script can see every player.', true, 'The server runs the whole game.');
pick('Where should code that gives coins go?', '', ['A Script on the server', 'A LocalScript', 'Either one', 'StarterGui'], 'Only the server can be trusted with things like coins.');
pick('Which one handles keyboard input?', '', ['A LocalScript', 'A Script on the server', 'ServerStorage', 'workspace'], 'Input happens on the player\'s device, so it\'s client code.');
match('Match where things live', [['ServerScriptService', 'server scripts'], ['StarterPlayerScripts', 'client scripts'], ['ReplicatedStorage', 'both can see it'], ['ServerStorage', 'server-only items']]);
tf('Exploiters can change code running on their own device.', true, 'That\'s why the client should never decide important things.');

at('cs-fireserver');
fill('Send a message to the server from a LocalScript', 'remote:▢("Sword")', ['FireServer'], ['FireClient', 'Fire', 'Send'], 'The client uses FireServer.');
fill('Listen on the server', 'remote.▢:Connect(function(player, item)', ['OnServerEvent'], ['OnClientEvent', 'Event', 'Touched'], 'The server listens with OnServerEvent.');
pick('In OnServerEvent, what is the first parameter?', '', ['The player who fired it', 'The first thing you sent', 'The RemoteEvent', 'Nothing'], 'Roblox adds the player first, automatically.');
order('LocalScript: ask the server to buy a Sword', ['local ReplicatedStorage = game:GetService("ReplicatedStorage")', 'local remote = ReplicatedStorage:WaitForChild("BuyEvent")', 'remote:FireServer("Sword")'], 'Get the service, wait for the remote, then fire.');
build('Fire the remote to the server with "Sword"', ['remote', ':FireServer(', '"Sword"', ')'], [':FireClient(', 'player'], 'The client never passes the player. Roblox adds it.');
bug('Tap the line with the mistake', 'remote.OnServerEvent:Connect(function(item)\n    print(item)\nend)', 0, 'The first parameter is always the player. It should be function(player, item).');
tf('A LocalScript can call FireServer.', true, 'FireServer is how the client talks to the server.');
order('Server: listen for the buy request', ['local remote = ReplicatedStorage:WaitForChild("BuyEvent")', 'remote.OnServerEvent:Connect(function(player, item)', '    print(player.Name, item)', 'end)'], 'Get the remote, connect, then use player and item.');

at('cs-fireclient');
fill('Send a message to one player', 'remote:▢(player, "Welcome!")', ['FireClient'], ['FireServer', 'FireAllClients', 'Send'], 'FireClient needs the player as the first argument.');
pick('Which one sends to every player?', '', ['remote:FireAllClients(...)', 'remote:FireClient(...)', 'remote:FireServer(...)', 'remote:Broadcast(...)'], 'FireAllClients reaches everyone.');
fill('Listen in a LocalScript', 'remote.▢:Connect(function(msg)', ['OnClientEvent'], ['OnServerEvent', 'Changed', 'Event'], 'The client listens with OnClientEvent.');
tf('The server should trust the price a client sends when buying.', false, 'Exploiters can send anything. The server must look up the price itself.');
build('Tell every player the round started', ['remote', ':FireAllClients(', '"Round started"', ')'], [':FireClient(', ':FireServer('], 'FireAllClients needs no player.');
bug('Tap the line with the mistake', '-- Server Script\nremote:FireClient("Welcome!")', 1, 'FireClient needs the player first: FireClient(player, "Welcome!").');
pick('In OnClientEvent, what is the first parameter?', '', ['The first thing the server sent', 'The player', 'The RemoteEvent', 'The server'], 'The client already knows who it is, so nothing is added.');
match('Match each call to who it reaches', [['FireServer', 'the server'], ['FireClient', 'one player'], ['FireAllClients', 'every player'], ['OnClientEvent', 'listens on the client']]);

// Stable ids for the review schedule. Editing an exercise's text gives it a new id (it starts fresh).
const hash = s => { let h = 5381; for (const c of s) h = (h * 33 + c.codePointAt(0)) >>> 0; return h.toString(36); };
EX.forEach(e => { e.id = `${e.l}:${e.t}:${hash(e.make ? e.make.toString() : JSON.stringify([e.q, e.code, e.lines, e.pairs, e.tiles, e.steps]))}`; });
