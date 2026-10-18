const express = require('express')

const app = express()

app.use(express.json())

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok' })
})

app.post('/api/echo', (req, res) => {
  res.json({ received: req.body })
})

app.listen(3001, () => {
  console.log('Server listening on port 3001')
})
