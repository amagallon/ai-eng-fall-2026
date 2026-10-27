# Study Timer App: Build Spec

## Problem
Study timers are boring, so students avoid using them. This app makes study sessions playful enough that people actually start them.

## Users
Students who struggle to start or stick with study sessions.

## How it works
1. The user commits to a number of study minutes and bets fake points on finishing.
2. The user picks a risk tier (Safe, Bold, or Reckless). The tier decides how wild the wheel is and how much a win pays. All wheel segments and payouts are shown before spinning.
3. The user spins a wheel. It multiplies their committed minutes to set the actual session length.
4. A timer runs for the actual session length.
5. The user can end the session early, but the app makes quitting harder (for example, a Stop button that dodges the cursor). Quitting forfeits the bet.
6. Finishing pays the bet times the tier's payout multiplier.
7. The app remembers past sessions and shows them back to the user.

## Inputs and outputs
- Inputs: chosen study time, bet amount, risk tier, button clicks.
- Outputs: a live timer, a points balance, a session result, and a history of past sessions.

## Points and risk rules
- Points are fake and have no real-world value.
- Players start with 100 points. Bet range: 10 to 50.
- Committed minutes: 10 to 60. Actual session is committed minutes times the wheel multiplier, rounded, minimum 1, maximum 90.
- Safe: wheel 0.8x, 1x, 1x, 1.2x, payout 1.2x.
- Bold: wheel 0.5x, 1x, 1.5x, 2x, payout 2x.
- Reckless: wheel 0.25x, 0.5x, 1x, 2x, 3x, payout 3x.
- Every wheel segment is equally likely, and all segments are visible before the spin.
- A player at 0 points gets a free bailout session (no stake).

## Out of scope
- Real money or real gambling of any kind
- User accounts or logins
- Anything beyond the core features until they work
- Later ideas, not part of the first build: reward shop, bonus roll, temptation popup, daily bet cap

## Acceptance criteria
1. Start a study session.
2. A timer runs during the session.
3. I can pick a bet and a risk tier, and the potential win is shown before I start.
4. When a session ends, the app shows a result and updates my points.
5. Past sessions are saved and still there after I reload the page.
6. The app runs in the browser with no console errors.

## Status (update as you build)
- Built and tested: challenge list from data, Bet/Remove, points total, empty state, Express server with GET /api/health and POST /api/echo
- Not built yet: risk tier picker, timer countdown, win/loss result, dodging Stop button, saved session history (database), front end connected to the server