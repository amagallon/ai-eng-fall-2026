const express = require('express')
const database = require('./db')

const app = express()

app.use(express.json())

app.get(['/', '/api'], (request, response) => {
  response.type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Study Timer API</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #0b0e13;
        color: #edf2f7;
      }

      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        background: radial-gradient(ellipse at top, #17222b 0, #0b0e13 60%);
      }

      main {
        box-sizing: border-box;
        width: min(100% - 2rem, 38rem);
        padding: clamp(1.5rem, 5vw, 3rem);
        border: 1px solid #293540;
        border-radius: 1.25rem;
        background: rgb(17 23 30 / 92%);
        box-shadow: 0 1.5rem 5rem rgb(0 0 0 / 35%);
      }

      .eyebrow {
        color: #70d6b1;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0.75rem 0;
        font-size: clamp(2rem, 7vw, 3rem);
        letter-spacing: -0.045em;
      }

      p {
        color: #aab6c2;
        line-height: 1.65;
      }

      .note {
        margin: 1.5rem 0;
        padding: 0.9rem 1rem;
        border-left: 3px solid #70d6b1;
        border-radius: 0.35rem;
        background: #15241f;
        color: #c9f3e4;
      }

      nav {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 1.75rem;
      }

      a {
        display: inline-flex;
        padding: 0.7rem 1rem;
        border: 1px solid #34434f;
        border-radius: 0.65rem;
        color: #edf2f7;
        text-decoration: none;
        transition: border-color 150ms ease, background 150ms ease;
      }

      a:hover,
      a:focus-visible {
        border-color: #70d6b1;
        background: #1b2b2b;
      }
    </style>
  </head>
  <body>
    <main>
      <div class="eyebrow">Study / Signal</div>
      <h1>Study Timer API</h1>
      <p>A small API for checking service health and viewing study session records.</p>
      <p class="note">Points are fake and have no real-world value.</p>
      <nav aria-label="API endpoints">
        <a href="/api/health">API health</a>
        <a href="/api/sessions">Study sessions</a>
      </nav>
    </main>
  </body>
</html>`)
})

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok' })
})

app.get('/api/sessions', (request, response) => {
  const sessions = database
    .prepare('SELECT * FROM sessions ORDER BY started_at DESC, id DESC')
    .all()

  response.json(sessions)
})

app.post('/api/sessions', (request, response) => {
  const {
    started_at: startedAt,
    minutes_planned: minutesPlanned,
    actual_minutes: actualMinutes,
    bet_amount: betAmount,
    tier,
    result,
    points_change: pointsChange,
  } = request.body ?? {}

  if (typeof startedAt !== 'string' || startedAt.trim() === '') {
    return response.status(400).json({ error: 'started_at must be a non-empty string' })
  }

  if (![minutesPlanned, actualMinutes, betAmount, pointsChange].every(Number.isInteger)) {
    return response.status(400).json({ error: 'Minute and point values must be whole numbers' })
  }

  if (betAmount < 0 || betAmount > 50) {
    return response.status(400).json({ error: 'bet_amount must be between 0 and 50' })
  }

  if (!['Safe', 'Bold', 'Reckless'].includes(tier)) {
    return response.status(400).json({ error: 'tier must be Safe, Bold, or Reckless' })
  }

  if (!['won', 'lost'].includes(result)) {
    return response.status(400).json({ error: 'result must be won or lost' })
  }

  const insertResult = database
    .prepare(`
      INSERT INTO sessions (
        started_at,
        minutes_planned,
        actual_minutes,
        bet_amount,
        tier,
        result,
        points_change
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      startedAt,
      minutesPlanned,
      actualMinutes,
      betAmount,
      tier,
      result,
      pointsChange,
    )

  const savedSession = database
    .prepare('SELECT * FROM sessions WHERE id = ?')
    .get(insertResult.lastInsertRowid)

  return response.status(201).json(savedSession)
})

app.post('/api/echo', (req, res) => {
  res.json({ received: req.body })
})

app.use((error, request, response, next) => {
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ error: 'Request body must be valid JSON' })
  }

  return next(error)
})

app.listen(3001, () => {
  console.log('Server listening on port 3001')
})
