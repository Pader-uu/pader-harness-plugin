import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createLibraryUrl,
  fetchPaderLibrary,
  resolvePaderApiKey,
  validateLibraryPayload,
} from '../pader-client.js'

test('uses the configured API key before the environment value', () => {
  assert.equal(resolvePaderApiKey('pader_pk_configured', { PADER_API_KEY: 'pader_pk_environment' }), 'pader_pk_configured')
  assert.equal(resolvePaderApiKey('', { PADER_API_KEY: ' pader_pk_environment ' }), 'pader_pk_environment')
})

test('builds the fixed read-only library endpoint', () => {
  assert.equal(createLibraryUrl('https://www.pader.top/').toString(), 'https://www.pader.top/api/v1/library')
  assert.equal(createLibraryUrl('http://localhost:8002').toString(), 'http://localhost:8002/api/v1/library')
})

test('keeps exactly the two model-facing JSON sections', () => {
  assert.deepEqual(validateLibraryPayload({
    exportedAt: '2026-08-17T00:00:00Z',
    likedPapers: [{ paperId: 'W1' }],
    folderPapers: [{ id: 'f1', papers: [] }],
  }), {
    likedPapers: [{ paperId: 'W1' }],
    folderPapers: [{ id: 'f1', papers: [] }],
  })
})

test('sends the Pader key and returns library data', async () => {
  let request
  const result = await fetchPaderLibrary({
    apiKey: 'pader_pk_test',
    baseUrl: 'https://pader.example',
    fetchImpl: async (url, init) => {
      request = { url: String(url), init }
      return new Response(JSON.stringify({ likedPapers: [], folderPapers: [] }), { status: 200 })
    },
  })

  assert.equal(request.url, 'https://pader.example/api/v1/library')
  assert.equal(request.init.headers['X-API-Key'], 'pader_pk_test')
  assert.deepEqual(result, { likedPapers: [], folderPapers: [] })
})

test('does not leak an invalid API key in an authorization error', async () => {
  await assert.rejects(
    fetchPaderLibrary({
      apiKey: 'pader_pk_private_value',
      fetchImpl: async () => new Response('', { status: 401 }),
    }),
    /Pader API key was rejected/,
  )
})
