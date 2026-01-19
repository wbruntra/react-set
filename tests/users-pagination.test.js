const assert = require('assert')
const http = require('http')
const app = require('../app')

let server

before(done => {
  server = http.createServer(app)
  server.listen(5003, done)
})

after(done => {
  server.close(done)
})

describe('GET /users', () => {
  it('should return the first page of users', async () => {
    const res = await fetch('http://localhost:5003/users?page=1&pageSize=2')
    const users = await res.json()
    assert.strictEqual(users.length, 2)
  })

  it('should return the second page of users', async () => {
    const res = await fetch('http://localhost:5003/users?page=2&pageSize=2')
    const users = await res.json()
    assert.strictEqual(users.length, 2)
  })

  it('should return an empty array if the page is out of bounds', async () => {
    const res = await fetch('http://localhost:5003/users?page=100&pageSize=10')
    const users = await res.json()
    assert.strictEqual(users.length, 0)
  })
})
