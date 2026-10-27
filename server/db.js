const path = require('node:path')
const Database = require('better-sqlite3')

const database = new Database(path.join(__dirname, 'study.db'))

database.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY,
    started_at TEXT NOT NULL,
    minutes_planned INTEGER NOT NULL,
    actual_minutes INTEGER NOT NULL,
    bet_amount INTEGER NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('Safe', 'Bold', 'Reckless')),
    result TEXT NOT NULL CHECK (result IN ('won', 'lost')),
    points_change INTEGER NOT NULL
  )
`)

const sessionCount = database
  .prepare('SELECT COUNT(*) AS count FROM sessions')
  .get()

if (sessionCount.count === 0) {
  const insertSession = database.prepare(`
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

  const seedSessions = database.transaction(() => {
    insertSession.run(
      '2026-10-27T12:00:00Z',
      30,
      36,
      20,
      'Bold',
      'won',
      40,
    )
    insertSession.run(
      '2026-10-27T13:00:00Z',
      20,
      16,
      10,
      'Safe',
      'lost',
      -10,
    )
  })

  seedSessions()
}

module.exports = database
