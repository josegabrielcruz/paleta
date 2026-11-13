import { streamObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { PaletteSchema } from '../src/lib/ai/schema'
import { SYSTEM_PROMPT } from '../src/lib/ai/prompt'

export const config = { runtime: 'edge' }

const MAX_DESCRIPTION_LENGTH = 500

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('description' in body) ||
    typeof (body as Record<string, unknown>).description !== 'string'
  ) {
    return new Response('Missing or invalid "description" field', { status: 400 })
  }

  const description = ((body as Record<string, unknown>).description as string)
    .trim()
    .slice(0, MAX_DESCRIPTION_LENGTH)

  if (description.length === 0) {
    return new Response('Description cannot be empty', { status: 400 })
  }

  const result = streamObject({
    model: openai('gpt-4o-mini'),
    schema: PaletteSchema,
    system: SYSTEM_PROMPT,
    prompt: description,
  })

  return result.toTextStreamResponse()
}
