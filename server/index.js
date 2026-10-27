const express = require('express')
const database = require('./db')

const app = express()

app.use(express.json())

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok' })
})

app.get('/api/sessions', (request, response) => {
  const sessions = database
    .prepare('SELECT * FROM sessions ORDER BY started_at DESC, id DESC')
    .all()

  response.json(sessions)
})

app.post('/api/echo', (req, res) => {
  res.json({ received: req.body })
})

app.listen(3001, () => {
  console.log('Server listening on port 3001')
})
