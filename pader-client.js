const DEFAULT_BASE_URL = 'https://www.pader.top'

function asTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function resolvePaderApiKey(configuredKey, environment = process.env) {
  return asTrimmedString(configuredKey) || asTrimmedString(environment.PADER_API_KEY)
}

export function createLibraryUrl(baseUrl = DEFAULT_BASE_URL) {
  let url
  try {
    url = new URL(asTrimmedString(baseUrl) || DEFAULT_BASE_URL)
  } catch {
    throw new Error('Pader baseUrl must be a valid absolute HTTP(S) URL.')
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('Pader baseUrl must use http or https.')
  }

  url.pathname = `${url.pathname.replace(/\/$/, '')}/api/v1/library`
  url.search = ''
  url.hash = ''
  return url
}

export function validateLibraryPayload(payload) {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Pader library API returned an invalid JSON object.')
  }
  if (!Array.isArray(payload.likedPapers) || !Array.isArray(payload.folderPapers)) {
    throw new Error('Pader library API response is missing likedPapers or folderPapers.')
  }

  return {
    likedPapers: payload.likedPapers,
    folderPapers: payload.folderPapers,
  }
}

export async function fetchPaderLibrary({
  apiKey,
  baseUrl = DEFAULT_BASE_URL,
  timeoutMs = 15000,
  signal,
  fetchImpl = fetch,
}) {
  const key = asTrimmedString(apiKey)
  if (!key) {
    throw new Error('Pader API key is not configured. Set PADER_API_KEY before starting DeepSeek Harness.')
  }
  if (!key.startsWith('pader_pk_')) {
    throw new Error('Pader API key has an invalid format. Generate a new key in Pader Settings > API Access.')
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error('Pader timeoutMs must be a positive number.')
  }

  const timeoutSignal = AbortSignal.timeout(timeoutMs)
  const requestSignal = signal === undefined ? timeoutSignal : AbortSignal.any([signal, timeoutSignal])
  let response

  try {
    response = await fetchImpl(createLibraryUrl(baseUrl), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-API-Key': key,
      },
      signal: requestSignal,
    })
  } catch (error) {
    if (signal?.aborted) throw error
    if (timeoutSignal.aborted) {
      throw new Error(`Pader library API timed out after ${timeoutMs}ms.`)
    }
    throw new Error('Unable to reach the Pader library API.')
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error('Pader API key was rejected. Generate or rotate it in Pader Settings > API Access.')
  }
  if (!response.ok) {
    throw new Error(`Pader library API request failed with HTTP ${response.status}.`)
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error('Pader library API returned invalid JSON.')
  }
  return validateLibraryPayload(payload)
}
