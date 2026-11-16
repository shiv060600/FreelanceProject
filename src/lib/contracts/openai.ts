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

const FALLBACK_MODELS = ['gpt-4.1', 'gpt-4o', 'gpt-4o-mini']

/**
 * Models to try in order. Some OpenAI projects don't have access to every
 * model, which surfaces as a 404/403 "model not found". Rather than failing
 * the user, fall through to the next model.
 */
export function getModelCandidates() {
  const primary = getContractModel()
  return [primary, ...FALLBACK_MODELS.filter((m) => m !== primary)]
}

/** True when the failure means "this model isn't available to this account". */
export function isModelUnavailable(error: any) {
  return error?.status === 404 || error?.status === 403 || error?.code === 'model_not_found'
}

export interface ClassifiedAiError {
  /** HTTP status to return to our own client. */
  status: number
  /** Stable code the UI/logs can key off. */
  code: 'ai_auth' | 'ai_quota' | 'ai_busy' | 'ai_model' | 'ai_bad_request' | 'ai_unavailable'
  /** Safe to show to end users: never contains keys or provider internals. */
  message: string
}

export function classifyOpenAIError(error: any): ClassifiedAiError {
  const status: number | undefined = error?.status
  const code: string | undefined = error?.code

  if (status === 401) {
    return { status: 502, code: 'ai_auth', message: 'AI contract generation is misconfigured (provider rejected the API key). Please contact support.' }
  }
  if (code === 'insufficient_quota') {
    return { status: 503, code: 'ai_quota', message: 'AI generation is temporarily unavailable (provider quota exhausted). Please contact support.' }
  }
  if (status === 429) {
    return { status: 503, code: 'ai_busy', message: 'The AI service is busy right now. Please try again in a minute.' }
  }
  if (isModelUnavailable(error)) {
    return { status: 502, code: 'ai_model', message: 'No AI model is available for this account. Please contact support.' }
  }
  if (status === 400) {
    return { status: 502, code: 'ai_bad_request', message: 'The AI service rejected the request. Try shortening your details and generating again.' }
  }
  return { status: 502, code: 'ai_unavailable', message: 'The AI service could not be reached. Please try again in a moment.' }
}
