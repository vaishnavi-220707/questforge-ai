import test from 'node:test'
import assert from 'node:assert/strict'
import app from '../src/app.js'

let server
let baseUrl = ''

test.before(async () => {
  await new Promise(resolve => {
    server = app.listen(5003, () => {
      baseUrl = 'http://localhost:5003'
      resolve()
    })
  })
})

test.after(async () => {
  await new Promise(resolve => server.close(resolve))
})

test('API: POST /api/documents/upload rejects invalid file types (e.g. text/html)', async () => {
  const formData = new FormData()
  const fakeBlob = new Blob(['<html><body>malicious</body></html>'], { type: 'text/html' })
  formData.append('documents', fakeBlob, 'test.html')

  const res = await fetch(`${baseUrl}/api/documents/upload`, {
    method: 'POST',
    body: formData
  })

  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.status, 'error')
  assert.ok(json.message.includes('Unsupported file type'))
})

test('API: POST /api/documents/upload rejects empty payload', async () => {
  const res = await fetch(`${baseUrl}/api/documents/upload`, {
    method: 'POST'
  })
  // Multer or controller returns 400
  assert.equal(res.status, 400)
})
