# AI Usage Log

Tool: GitHub Copilot Chat in Codespaces. Each entry says what I asked, what I got, what I changed, and how I checked it.

## M1: HTML, CSS, JS
- Asked Copilot to explain the request/response cycle and what HTML, CSS, and JS each do. No files changed. Checked by restating it in my own words.
- Asked for a small page with a button that changes text. It rewrote my React files instead of making plain HTML. I undid it with `git restore` and re-prompted for plain HTML, CSS, and JS in `m1/`.
- The built-in preview said "Forbidden," so I opened the page with Live Server. [CONFIRM: clicked the button and the text changed.]

## M2: React components
- Asked Copilot to walk through the Vite project files. It described the wrong App.jsx, so I opened the file and checked the real one myself.
- Asked it to convert my profile card HTML to a `ProfileCard` component (1 file changed). I retyped it myself, used my own image, added a CSS import, and fixed the dark h1 color. Checked by running the app and seeing the card render.

## M3: Router, props, state
- Asked for React Router with Home and About pages. Copilot said it was "already implemented," so I checked the files myself. Nav works with no page reload.
- Asked for a `StatCard` rendered three times with different props (2 files changed). Found where props are passed and received.
- Asked for a useState Points counter with Win and Lose buttons. Clicked both and watched the number change. 

## M4: List from a spec
- Asked Copilot to explain `.map()`, lifting state, and not mutating state.
- Asked for a challenge list with Bet and Remove buttons, a total, and an empty message (2 files changed). [CONFIRM: tested Bet, Remove, empty message, and console.]

## M5: Express API
- Asked Copilot to explain servers, Express, GET, and POST.
- Asked for `GET /api/health` on port 3001 (2 files changed). Ran `npm start` and got `{"status":"ok"}`.
- Asked for `POST /api/echo` (1 file changed). I first pasted my test into the terminal by mistake, then ran it in the browser console and got the body echoed back.

## Risk system
- Asked for a risk tier picker with a bet, minutes, three tiers, and a Start button that deducts the bet, with SPEC.md attached (2 files changed). [CONFIRM: tested it in the browser.]

## Other AI use
- Claude (chat) helped me plan the milestones and draft the M1 profile card code and the first `ProfileCard.jsx`, which I typed myself.