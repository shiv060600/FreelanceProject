import OpenAI from 'openai'

/**
 * Created lazily: constructing the client at import time throws when the key
 * is missing, which breaks `next build` in environments without secrets.
 */
let client: OpenAI | null = null

export function getOpenAI(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  if (!client) client = new OpenAI({ apiKey })
  return client
}

/** Override with OPENAI_CONTRACT_MODEL to switch models without a deploy. */
export function getContractModel() {
  return process.env.OPENAI_CONTRACT_MODEL || 'gpt-4.1'
}
