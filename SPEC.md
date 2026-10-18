# Study Timer App: Build Spec

## Problem
Study timers are boring, so students avoid using them. This app makes study sessions playful enough that people actually start them.

## Users
Students who struggle to start or stick with study sessions.

## How it works
1. The user starts a study session by picking how long they will study.
2. The user bets fake points on finishing and picks a risk tier (Safe, Bold, or Reckless). Higher tiers pay more but make quitting harder. The payout multiplier and potential win are always shown before the session starts.
3. A timer runs while they study.
4. The user can end the session early, but the app makes quitting harder (for example, a Stop button that dodges the cursor). Quitting forfeits the bet.
5. Finishing a session pays out the bet times the tier multiplier. Consecutive finished sessions build a streak bonus, and a quit resets it.
6. The app remembers past sessions and shows them back to the user.

## Inputs and outputs
- Inputs: chosen study time, bet amount, risk tier, button clicks.
- Outputs: a live timer, a points balance, a session result, and a history of past sessions.

## Points and risk rules
- Points are fake and have no real-world value.
- Players start with 100 points.
- Bet range: 10 to 50 points.
- Tiers: Safe 1.2x, Bold 2x, Reckless 3x.
- Odds and payouts are always visible before a session starts.
- A player at 0 points gets a free bailout session so they are never locked out.

## Out of scope
- Real money or real gambling of any kind
- User accounts or logins
- Anything beyond the core features until they work
- Later ideas, not part of the first build: reward shop, bonus roll, temptation popup, daily bet cap

## Acceptance criteria
1. I can start a study session.
2. A timer runs during the session.
3. I can pick a bet and a risk tier, and the potential win is shown before I start.
4. When a session ends, the app shows a result and updates my points.
5. Past sessions are saved and still there after I reload the page.
6. The app runs in the browser with no console errors.

## Status (update as you build)
- Built and tested: challenge list from data, Bet/Remove, points total, empty state, Express server with GET /api/health and POST /api/echo
- Not built yet: risk tier picker, timer countdown, win/loss result, dodging Stop button, saved session history (database), front end connected to the server