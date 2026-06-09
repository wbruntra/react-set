import app from './app'

const port = parseInt(process.env.PORT || '5002', 10)

export default {
  port,
  fetch: app.fetch,
}

console.log(`Server running on http://localhost:${port}`)
