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

/**
 * Default: gpt-5.4-mini — current generation, ~$0.75 / $4.50 per 1M tokens
 * (roughly 1.5 cents per contract). Override with OPENAI_CONTRACT_MODEL
 * (e.g. gpt-5.4 or gpt-5.6-sol for higher quality) without a deploy.
 */
export function getContractModel() {
  return process.env.OPENAI_CONTRACT_MODEL || 'gpt-5.4-mini'
}

const FALLBACK_MODELS = ['gpt-5.4-mini', 'gpt-5.4', 'gpt-4.1', 'gpt-4o-mini']

/**
 * Models to try in order. Some OpenAI projects don't have access to every
 * model (or can't use it for streaming), which surfaces as a 400/403/404.
 * Rather than failing the user, fall through to the next model.
 */
export function getModelCandidates() {
  const primary = getContractModel()
  return [primary, ...FALLBACK_MODELS.filter((m) => m !== primary)]
}

/** GPT-5.x and o-series are reasoning models: different request parameters. */
export function isReasoningModel(model: string) {
  return /^(o\d|gpt-5)/i.test(model)
}

/**
 * Request parameters that differ between model families.
 *  - Reasoning models reject `temperature`, accept `reasoning_effort`, and
 *    count hidden reasoning tokens against `max_completion_tokens`, so we
 *    keep effort low (drafting doesn't need deep reasoning; it also means
 *    the first words stream sooner) and add headroom for those tokens.
 *  - Older chat models take `temperature` and reject `reasoning_effort`.
 */
export function completionTuning(model: string, maxTokens: number) {
  if (isReasoningModel(model)) {
    const effort = (process.env.OPENAI_CONTRACT_REASONING || 'low') as 'low' | 'medium' | 'high'
    return { max_completion_tokens: maxTokens + 2000, reasoning_effort: effort }
  }
  return { max_completion_tokens: maxTokens, temperature: 0.3 }
}

/** Move on to the next candidate model for these failures. */
export function shouldTryNextModel(error: any) {
  return error?.status === 400 || error?.status === 403 || error?.status === 404 || error?.code === 'model_not_found'
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
