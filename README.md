# Luau Learn (phone)

Duolingo-style Luau practice that follows your progress in the Luau Learn PC app.

Play: https://dvxs21.github.io/luau-learn-phone/

## How practice works
- Exercises only come from lessons you've finished on PC (set with the PC app's `?at=<lesson id>` link or the picker).
- Each exercise has a review box (1 weak to 5 solid). Right on the first try moves it up and pushes the next review out (1, 3, 7, 14, 30 days); a miss sends it back to box 1.
- A round takes due exercises first (weakest first), then up to 3+ new ones (newest lessons first), then the rest.

## Adding exercises
Exercises live in `exercises.js`, grouped under `at('<lesson id>')`. The comment at the top lists the format of each type
(fill, pick, tf, bug, order, type, match, build, trace) and `gen` for exercises that get new numbers every time.

Then run the checker. It runs every snippet in real Luau (luau-web, a WebAssembly build) and fails if an answer is wrong:

```sh
npm install
npm test
```

CI runs the same check on every push.
