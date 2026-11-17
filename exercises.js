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

// Exercise builders. ▢ marks a blank. The first option of a pick is the right one (shuffled at runtime).
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

at('hello');
fill('Print the word Hello', 'print(▢)', ['"Hello"'], ['Hello', 'say'], 'Text needs quotes around it. That makes it a string.');
tf('Print("hi") works the same as print("hi").', false, 'Luau is case-sensitive. Print and print are different names.');
type('What does this print?', 'print("Roblox")', 'Roblox', 'The quotes are not printed, only the text inside them.');
pick('What does this print?', 'print("Hi")\nprint("Bye")', ['Hi\nBye', 'HiBye', 'Bye\nHi', 'Nothing'], 'Each print puts its text on a new line, top to bottom.');

at('comments');
pick('What does Luau do with this line?', '-- spawn the boss here', ['Ignores it', 'Prints it', 'Errors', 'Runs it later'], 'Lines starting with -- are comments. They are notes for people.');
fill('Turn this into a comment', '▢ spawn the boss later', ['--'], ['//', '#'], 'Luau comments start with two dashes.');
bug('Tap the line with the mistake', '-- Greeting\nprint("Hi")\n- print("Bye")', 2, 'A comment needs two dashes, not one.');
fill('Make a comment that spans many lines', '▢ this is a long note\nthat keeps going ▢', ['--[[', ']]'], ['/*', '*/'], 'Long comments start with --[[ and end with ]].');

at('variables');
fill('Make a variable called coins', '▢ coins = 10', ['local'], ['var', 'let'], 'local creates a new variable.');
type('What does this print?', 'local coins = 10\ncoins = 25\nprint(coins)', '25', 'The second line replaces 10 with 25.');
pick('Which variable name is allowed?', '', ['playerName', '2player', 'player name', 'local'], 'Names can\'t start with a number, have spaces, or be a keyword.');
order('Put the lines in order so it prints 70', ['local health = 100', 'health = health - 30', 'print(health)'], 'Make the variable, change it, then print it.');

at('math');
type('What does this print?', 'print(7 + 3 * 2)', '13', 'Multiplication happens first: 3 * 2 = 6, then 7 + 6.');
pick('What does this print?', 'print(10 % 3)', ['1', '3', '0', '3.33'], '% gives the remainder. 10 / 3 is 3 with 1 left over.');
fill('Split 10 in half', 'local half = 10 ▢ 2', ['/'], ['%', '^', '*'], '/ divides.');
pick('What does this print?', 'print(2 ^ 3)', ['8', '6', '5', '23'], '^ is power: 2 × 2 × 2 = 8.');
match('Match each sign to what it does', [['+', 'add'], ['*', 'multiply'], ['%', 'remainder'], ['^', 'power']]);

at('strings');
fill('Join the two pieces of text', 'print("Hi " ▢ name)', ['..'], ['+', '&', ','], 'Two dots join strings together.');
type('What does this print?', 'local a = "Ro"\nlocal b = "blox"\nprint(a .. b)', 'Roblox', '.. glues the strings with no space between.');
pick('What does this print?', 'print("Level " .. 5)', ['Level 5', 'An error', 'Level5', '"Level " 5'], 'Numbers turn into text when you join them with ..');
tf('"5" + "5" gives "55".', false, '+ is for math. Luau turns both into numbers and gives 10. Use .. to join text.');

at('interp');
fill('Use string interpolation', 'print(▢Hi {name}!▢)', ['`', '`'], ['"', '"'], 'Backticks let you put values inside {curly braces}.');
type('What does this print?', 'local n = 3\nprint(`You have {n} lives`)', 'You have 3 lives', '{n} is swapped for the value of n.');
pick('What does this print?', 'print(`{2 + 2}`)', ['4', '2 + 2', '{2 + 2}', 'An error'], 'Whatever is inside {} gets worked out first.');

at('booleans');
pick('What does this print?', 'print(5 > 3)', ['true', 'false', '5', 'An error'], '5 is bigger than 3, so the answer is true.');
fill('Check if two values are equal', 'print(10 ▢ 10) -- true', ['=='], ['=', '~=', '!='], '== compares. A single = stores a value.');
type('What does this print?', 'print(4 ~= 4)', 'false', '~= means "not equal". 4 is equal to 4, so it\'s false.');
tf('A single = checks if two things are equal.', false, '= stores a value in a variable. == checks if things are equal.');
match('Match the sign to its meaning', [['==', 'equal to'], ['~=', 'not equal'], ['>=', 'at least'], ['<', 'less than']]);

at('if');
order('Put the lines in order', ['local coins = 15', 'if coins >= 10 then', '    print("Buy!")', 'end'], 'Make the variable, then the if with then, the action, and end.');
fill('Finish the if statement', 'if health <= 0 ▢\n    print("Game over")\n▢', ['then', 'end'], ['do', '{', '}'], 'An if needs then after the check, and end to close it.');
bug('Tap the line with the mistake', 'local score = 50\nif score > 40\n    print("Nice")\nend', 1, 'The if line is missing then at the end.');
type('What does this print?', 'local x = 3\nif x > 5 then\n    print("big")\nend\nprint("done")', 'done', '3 is not bigger than 5, so only "done" prints.');

at('else');
pick('What does this print?', 'local temp = 20\nif temp > 25 then\n    print("hot")\nelseif temp > 15 then\n    print("warm")\nelse\n    print("cold")\nend', ['warm', 'hot', 'cold', 'warm\ncold'], 'The first check that is true wins. 20 > 15, so "warm".');
fill('Fill in the missing words', 'if n > 0 then\n    print("positive")\n▢ n < 0 then\n    print("negative")\n▢\n    print("zero")\nend', ['elseif', 'else'], ['else if', 'elif', 'otherwise'], 'elseif adds another check. else catches everything left.');
tf('You can have many elseif parts but only one else.', true, 'else is the final fallback, so there is only one.');

at('logic');
type('What does this print?', 'print(true and false)', 'false', 'and needs both sides to be true.');
pick('What does this print?', 'print(not true or true)', ['true', 'false', 'nil', 'An error'], 'not goes first: not true is false. false or true is true.');
fill('The door opens only if both are true', 'if hasKey ▢ doorUnlocked then', ['and'], ['or', 'not', '&&'], 'and is true only when both sides are true.');
pick('What does this print?', 'print(nil or "guest")', ['guest', 'nil', 'true', 'An error'], 'or gives the first value that isn\'t nil or false.');

at('for');
pick('What does this print?', 'for i = 1, 3 do\n    print(i)\nend', ['1\n2\n3', '1\n2', '0\n1\n2\n3', '3'], 'i starts at 1 and goes up to 3, including 3.');
fill('Finish the loop', '▢ i = 1, 5 ▢\n    print(i)\nend', ['for', 'do'], ['while', 'then', 'loop'], 'A for loop is: for i = start, finish do ... end');
pick('How many times does it print "hi"?', 'for i = 1, 10 do\n    print("hi")\nend', ['10', '9', '11', '1'], '1 to 10 is ten rounds.');
order('Make a loop that prints 2, 4, 6', ['for i = 2, 6, 2 do', '    print(i)', 'end'], 'The third number is the step: count up by 2.');

at('countdown');
fill('Count down from 10 to 1', 'for i = 10, 1, ▢ do\n    print(i)\nend', ['-1'], ['1', '0', '-10'], 'A step of -1 makes the loop count down.');
pick('What does this print?', 'for i = 3, 1, -1 do\n    print(i)\nend', ['3\n2\n1', '1\n2\n3', '3\n2', 'Nothing'], 'It starts at 3 and goes down to 1.');
tf('for i = 5, 1 do counts down from 5 to 1.', false, 'Without -1 it counts up, and 5 is already past 1, so it runs zero times.');

at('while');
order('Make a loop that prints 1, 2, 3', ['local n = 1', 'while n <= 3 do', '    print(n)', '    n = n + 1', 'end'], 'Change n inside the loop, or it never stops.');
bug('This loop never ends. Tap the bad line.', 'local fuel = 3\nwhile fuel > 0 do\n    print("Flying")\n    fuel = fuel + 1\nend', 3, 'fuel keeps growing, so fuel > 0 is always true. It should be fuel - 1.');
pick('When does a while loop stop?', '', ['When its check becomes false', 'After 10 rounds', 'When it prints', 'Never'], 'It keeps going as long as the check is true.');

at('totals');
type('What does this print?', 'local total = 0\nfor i = 1, 4 do\n    total = total + i\nend\nprint(total)', '10', '1 + 2 + 3 + 4 = 10');
fill('Add up the numbers', 'local sum = 0\nfor i = 1, 3 do\n    sum = ▢ + i\nend', ['sum'], ['i', '0', 'total'], 'Add i to what you already have in sum.');
bug('Tap the line that breaks the total', 'for i = 1, 5 do\n    local total = 0\n    total = total + i\nend\nprint(total)', 1, 'total is reset every round and only exists inside the loop. Make it before the loop.');

at('break');
pick('What does this print?', 'for i = 1, 10 do\n    if i == 3 then break end\n    print(i)\nend', ['1\n2', '1\n2\n3', '3', '1 to 10'], 'break stops the loop before 3 is printed.');
fill('Skip the even numbers', 'for i = 1, 5 do\n    if i % 2 == 0 then ▢ end\n    print(i)\nend', ['continue'], ['break', 'return', 'skip'], 'continue jumps to the next round.');
tf('break stops the whole loop, continue skips to the next round.', true, 'That\'s exactly the difference.');

at('functions');
order('Make and call a function', ['local function greet()', '    print("Hello!")', 'end', 'greet()'], 'Define it first, then call it with ().');
fill('Make a function and call it', 'local ▢ jump()\n    print("Boing")\nend\n▢()', ['function', 'jump'], ['func', 'def', 'run'], 'local function name() ... end, then name() runs it.');
tf('Code inside a function runs as soon as you write it.', false, 'It only runs when you call the function.');
pick('How many times is "hi" printed?', 'local function hi()\n    print("hi")\nend\nhi()\nhi()', ['2', '1', '3', '0'], 'Defining doesn\'t print. Each hi() call prints once.');

at('params');
fill('Give the function a parameter', 'local function heal(▢)\n    print("Healed " .. amount)\nend\nheal(20)', ['amount'], ['20', 'heal', '"amount"'], 'The parameter name goes in the brackets. 20 gets stored in it.');
type('What does this print?', 'local function add(a, b)\n    print(a + b)\nend\nadd(4, 6)', '10', 'a is 4 and b is 6.');
pick('What does this print?', 'local function hi(name)\n    print("Hi " .. name)\nend\nhi("Sam")', ['Hi Sam', 'Hi name', 'Sam', 'An error'], 'name holds "Sam".');

at('return');
type('What does this print?', 'local function double(n)\n    return n * 2\nend\nprint(double(7))', '14', 'double(7) gives back 14.');
fill('Give back the area', 'local function area(w, h)\n    ▢ w * h\nend', ['return'], ['print', 'give', 'end'], 'return sends a value back to whoever called the function.');
pick('What does this print?', 'local function f(x)\n    print(x)\nend\nlocal r = f(5)\nprint(r)', ['5\nnil', '5\n5', 'nil', '5'], 'f prints 5 but returns nothing, so r is nil.');

at('scope');
bug('print shows nil. Tap the cause.', 'local function setScore()\n    local score = 100\nend\nsetScore()\nprint(score)', 1, 'score is local to the function. Make it outside the function instead.');
pick('What does this print?', 'local x = 1\nif true then\n    local x = 2\nend\nprint(x)', ['1', '2', 'nil', 'An error'], 'The inner x only lives inside the if block.');
tf('A local made inside a function can be used anywhere in the script.', false, 'It only exists inside that function.');

at('arrays');
type('What does this print?', 'local fruits = {"apple", "pear", "plum"}\nprint(fruits[2])', 'pear', 'Arrays start at 1, so [2] is the second item.');
pick('What does this print?', 'local t = {"a", "b", "c"}\nprint(#t)', ['3', '2', 'abc', 'c'], '# counts the items.');
tf('The first item in a Luau array is at index 0.', false, 'Luau arrays start at 1.');
fill('Get the Pistol', 'local guns = {"Pistol", "Rifle"}\nprint(guns[▢])', ['1'], ['0', '2', '"Pistol"'], 'Pistol is the first item: index 1.');

at('ipairs');
order('Print every name with its number', ['local names = {"Ann", "Bo"}', 'for i, name in ipairs(names) do', '    print(i, name)', 'end'], 'ipairs gives the index and the item, in order.');
fill('Loop through the items', 'for ▢, item in ▢(items) do', ['i', 'ipairs'], ['each', '#', 'loop'], 'for i, item in ipairs(list) do');
pick('What does this print?', 'for i, v in ipairs({"x", "y"}) do\n    print(i, v)\nend', ['1 x\n2 y', 'x\ny', '1\n2', '0 x\n1 y'], 'Each round prints the index and the value.');

at('tablefns');
fill('Add a Sword to the end', 'table.▢(inventory, "Sword")', ['insert'], ['remove', 'add', 'push'], 'table.insert adds an item.');
type('What does this print?', 'local t = {"a", "b", "c"}\ntable.remove(t, 1)\nprint(t[1])', 'b', 'Removing the first item shifts the rest down.');
pick('What does this print?', 'local t = {}\ntable.insert(t, 5)\ntable.insert(t, 9)\nprint(#t)', ['2', '9', '14', '0'], 'There are two items in t.');
match('Match each one to what it does', [['table.insert', 'add an item'], ['table.remove', 'take one out'], ['#list', 'count items'], ['ipairs', 'loop in order']]);

at('dicts');
type('What does this print?', 'local player = {name = "Mia", coins = 40}\nprint(player.coins)', '40', 'player.coins looks up the coins key.');
fill('Give the key a name', 'local stats = {▢ = 100, speed = 16}\nprint(stats.health)', ['health'], ['"health"', 'Health', '100'], 'Keys are written without quotes in this style, and the case must match.');
pick('What does this print?', 'local p = {name = "Mia"}\nprint(p.age)', ['nil', '0', 'An error', 'age'], 'A key that doesn\'t exist gives nil.');
tf('player.coins and player["coins"] mean the same thing.', true, 'Both look up the "coins" key.');

at('pairs');
order('Print every name and score', ['local scores = {Ann = 5, Bo = 9}', 'for name, score in pairs(scores) do', '    print(name, score)', 'end'], 'pairs gives each key and value.');
tf('pairs always goes through a dictionary in the order you wrote it.', false, 'The order of pairs isn\'t guaranteed.');
fill('Loop through a dictionary', 'for key, value in ▢(settings) do', ['pairs'], ['ipairs', 'table', '#'], 'Use pairs for dictionaries. ipairs is for arrays.');

at('types');
fill('Say coins is a number', 'local coins: ▢ = 50', ['number'], ['string', 'int', 'boolean'], 'Luau has number, not int.');
pick('Which line is a type error?', '', ['local name: string = 5', 'local ok: boolean = true', 'local n: number = 3.5', 'local s: string = "hi"'], '5 is a number, not a string.');
fill('Say the function returns a number', 'local function add(a: number, b: number)▢ number', [':'], ['->', '=', '::'], 'The return type goes after a colon.');

at('boss');
pick('What does this print?', 'local t = {5, 2, 8}\ntable.sort(t)\nprint(t[1])', ['2', '5', '8', 'An error'], 'table.sort puts the smallest first.');
order('Find the highest score', ['local best = 0', 'for _, s in ipairs(scores) do', '    if s > best then best = s end', 'end', 'print(best)'], 'Keep the biggest score seen so far.');

at('rbx-part');
order('Make a part that stays still', ['local part = Instance.new("Part")', 'part.Anchored = true', 'part.Parent = workspace'], 'Set it up, then parent it to workspace last.');
fill('Make a part and put it in the game', 'local part = Instance.▢("Part")\npart.▢ = workspace', ['new', 'Parent'], ['create', 'Folder', 'make'], 'Instance.new makes it. Setting Parent puts it in the world.');
tf('A new Part appears in the game even if you never set its Parent.', false, 'It only shows up once Parent is set to workspace (or something in it).');
pick('What stops a part from falling?', '', ['part.Anchored = true', 'part.CanCollide = true', 'part.Parent = workspace', 'part.Locked = true'], 'Anchored parts ignore gravity.');

at('rbx-vector');
fill('Move the part up 10 studs', 'part.Position = ▢.new(0, 10, 0)', ['Vector3'], ['Vector2', 'Position', 'CFrame'], 'Positions in 3D use Vector3.');
pick('In Vector3.new(0, 10, 0), which number is height?', '', ['The middle one (Y)', 'The first one (X)', 'The last one (Z)', 'None of them'], 'X, Y, Z. Y is up.');
type('What does this print?', 'local v = Vector3.new(1, 2, 3)\nprint(v.Y)', '2', '.Y is the middle number.');

at('rbx-find');
fill('Find the Door safely', 'local door = workspace:▢("Door")', ['FindFirstChild'], ['GetChild', 'Find', 'Children'], 'FindFirstChild looks for a child by name.');
pick('What does FindFirstChild give back if nothing has that name?', '', ['nil', 'An error', 'An empty Part', 'false'], 'It returns nil, so check with if before using it.');
bug('The part is named "Door". Tap the mistake.', '-- The part is named "Door"\nlocal door = workspace.door\ndoor.Transparency = 1', 1, 'Names are case-sensitive. It should be workspace.Door.');

at('rbx-wait');
pick('What does task.wait(2) do?', '', ['Pauses this script for 2 seconds', 'Waits 2 frames', 'Repeats 2 times', 'Pauses the whole game'], 'Only this script waits. The game keeps running.');
order('Count down then say Go!', ['for i = 3, 1, -1 do', '    print(i)', '    task.wait(1)', 'end', 'print("Go!")'], 'Wait inside the loop, print Go! after it.');
fill('Wait half a second', '▢.wait(0.5)', ['task'], ['game', 'time', 'script'], 'task.wait is the modern way to wait.');

at('rbx-touched');
order('Print whatever touches the part', ['part.Touched:Connect(function(hit)', '    print(hit.Name)', 'end)'], 'Connect a function to the Touched event, and close it with end).');
fill('Listen for touches', 'part.Touched:▢(function(hit)', ['Connect'], ['Fire', 'Wait', 'Listen'], ':Connect runs your function every time the event happens.');
pick('How do you find the Humanoid of whatever touched?', '', ['hit.Parent:FindFirstChild("Humanoid")', 'hit:FindFirstChild("Humanoid")', 'workspace.Humanoid', 'hit.Humanoid.Parent'], 'hit is a body part. Its Parent is the character, which holds the Humanoid.');
bug('Tap the line with the mistake', 'part.Touched:Connect(function(hit)\n    print("touched")\nend', 2, 'The Connect( bracket is never closed. It should be end).');
fill('Kill the player', 'humanoid.▢ = 0', ['Health'], ['Dead', 'Life', 'HP'], 'Setting Health to 0 kills the character.');

at('rbx-players');
fill('Get the Players service', 'local Players = game:▢("Players")', ['GetService'], ['FindService', 'Get', 'Service'], 'game:GetService gets a Roblox service.');
order('Say when a player joins', ['local Players = game:GetService("Players")', 'Players.PlayerAdded:Connect(function(player)', '    print(player.Name .. " joined")', 'end)'], 'Get the service, then connect to PlayerAdded.');
pick('Which event fires when someone leaves?', '', ['Players.PlayerRemoving', 'Players.PlayerLeft', 'Players.PlayerAdded', 'game.Closing'], 'PlayerRemoving fires just before they leave.');

at('rbx-leaderstats');
fill('Name the folder so the leaderboard shows it', 'local stats = Instance.new("Folder")\nstats.Name = "▢"\nstats.Parent = player', ['leaderstats'], ['Leaderstats', 'stats', 'leaderboard'], 'It must be exactly leaderstats, all lowercase.');
pick('Which object shows a number on the leaderboard?', '', ['IntValue', 'Part', 'Folder', 'Script'], 'Put IntValues inside the leaderstats folder.');
order('Add a Coins stat', ['local coins = Instance.new("IntValue")', 'coins.Name = "Coins"', 'coins.Value = 0', 'coins.Parent = stats'], 'Make it, set it up, parent it last.');
tf('The leaderstats folder name must be all lowercase.', true, 'Roblox only looks for the exact name leaderstats.');

at('rbx-boss');
pick('A ball touches the coin. What does GetPlayerFromCharacter(hit.Parent) give?', '', ['nil', 'The ball', 'An error', 'The nearest player'], 'The ball isn\'t a character, so there\'s no player. That\'s why you check if player then.');
fill('Remove the coin', 'coin:▢()', ['Destroy'], ['Delete', 'Kill', 'Hide'], ':Destroy() removes it from the game.');
fill('Give the player a coin', 'player.leaderstats.Coins.▢ += 1', ['Value'], ['Number', 'Amount', 'Count'], 'The number lives in .Value');

at('cs-intro');
pick('Where does a LocalScript run?', '', ['On the player\'s device (client)', 'On Roblox\'s servers', 'Only in Studio', 'On every player at once'], 'LocalScripts run on each player\'s own device.');
tf('If a LocalScript changes a part, every player sees it.', false, 'Changes made on the client only show for that one player.');
match('Match each one to its job', [['Script', 'runs on the server'], ['LocalScript', 'runs on the client'], ['RemoteEvent', 'sends messages between them'], ['ReplicatedStorage', 'shared by both']]);

at('cs-fireserver');
fill('Send a message to the server from a LocalScript', 'remote:▢("Sword")', ['FireServer'], ['FireClient', 'Fire', 'Send'], 'The client uses FireServer.');
fill('Listen on the server', 'remote.▢:Connect(function(player, item)', ['OnServerEvent'], ['OnClientEvent', 'Event', 'Touched'], 'The server listens with OnServerEvent.');
pick('In OnServerEvent, what is the first parameter?', '', ['The player who fired it', 'The first thing you sent', 'The RemoteEvent', 'Nothing'], 'Roblox adds the player first, automatically.');
order('LocalScript: ask the server to buy a Sword', ['local ReplicatedStorage = game:GetService("ReplicatedStorage")', 'local remote = ReplicatedStorage:WaitForChild("BuyEvent")', 'remote:FireServer("Sword")'], 'Get the service, wait for the remote, then fire.');

at('cs-fireclient');
fill('Send a message to one player', 'remote:▢(player, "Welcome!")', ['FireClient'], ['FireServer', 'FireAllClients', 'Send'], 'FireClient needs the player as the first argument.');
pick('Which one sends to every player?', '', ['remote:FireAllClients(...)', 'remote:FireClient(...)', 'remote:FireServer(...)', 'remote:Broadcast(...)'], 'FireAllClients reaches everyone.');
fill('Listen in a LocalScript', 'remote.▢:Connect(function(msg)', ['OnClientEvent'], ['OnServerEvent', 'Changed', 'Event'], 'The client listens with OnClientEvent.');
tf('The server should trust the price a client sends when buying.', false, 'Exploiters can send anything. The server must look up the price itself.');
