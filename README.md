# Study / Signal

Study / Signal is a study timer app where you choose a study commitment, wager
fake points, and spin a risk-tiered wheel to set the session length. Complete
the countdown to win points, or stop early and lose your bet. Session results
are saved to a SQLite database and can be reviewed in the app.

> **Points are fake and have no real-world value.**

## Requirements

- Node.js and npm

## Install

Install the frontend and backend dependencies in separate terminals, or run
these commands one after the other:

```sh
cd client
npm install
```

```sh
cd server
npm install
```

## Run the app

Keep both processes running in separate terminals.

**Terminal 1 — API server** (from the repository root):

```sh
cd server
npm start
```

The Express API listens on [http://localhost:3001](http://localhost:3001).
Its root page describes the API; the SQLite database is created at
`server/study.db` when the server starts.

**Terminal 2 — React client** (from the repository root):

```sh
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies requests
from `/api` to the server on port `3001`.

## Main client routes

- `/` — Choose planned minutes, a bet, and a risk tier.
- `/wheel` — Spin the wheel to determine the session duration.
- `/session` — Complete the countdown or stop the session early.
- `/history` — View saved sessions and their point changes.

The API also provides `GET /api/health`, `GET /api/sessions`, and
`POST /api/sessions`.
