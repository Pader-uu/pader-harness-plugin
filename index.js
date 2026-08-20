import Schema from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { fetchPaderLibrary, resolvePaderApiKey } from './pader-client.js'

export const name = 'pader-library-tool'
export const inject = ['tools']

export const Config = Schema.object({
  // Leave apiKey unset in files. PADER_API_KEY is the preferred secret source.
  apiKey: Schema.string().default(''),
  baseUrl: Schema.string().default(process.env.PADER_API_BASE_URL || 'https://www.pader.top'),
  timeoutMs: Schema.number().default(15000),
})

const libraryOutputSchema = {
  type: 'object',
  properties: {
    likedPapers: {
      type: 'array',
      required: true,
      description: 'Papers individually liked by the Pader account owner.',
      items: { type: 'object', additionalProperties: true },
    },
    folderPapers: {
      type: 'array',
      required: true,
      description: 'Papers grouped by folders created or saved by the Pader account owner.',
      items: { type: 'object', additionalProperties: true },
    },
  },
  additionalProperties: false,
}

export function apply(ctx, config) {
  const apiKey = resolvePaderApiKey(config.apiKey)

  ctx.tools.register(defineTool({
    name: 'get_pader_library',
    description: 'Retrieve the authenticated Pader user\'s saved research library. Use it when the user asks about their liked papers, saved folders, or papers contained in their folders. This is read-only and returns the exact likedPapers and folderPapers JSON sections.',
    parameters: {},
    output: {
      schema: libraryOutputSchema,
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
    },
    async execute(_args, exec) {
      return fetchPaderLibrary({
        apiKey,
        baseUrl: config.baseUrl,
        timeoutMs: config.timeoutMs,
        signal: exec.signal,
      })
    },
  }))
}
