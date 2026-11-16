import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../supabase/server'
import { getContractModel, getOpenAI } from '@/lib/contracts/openai'
import {
  buildGenerationPrompt,
  buildRefinePrompt,
  buildSystemPrompt,
  maxTokensFor,
  supportsTemperature,
} from '@/lib/contracts/prompt'
import { getAiDailyLimit } from '@/lib/contracts/limits'
import { CONTRACT_TYPES, LENGTHS, TONES } from '@/lib/contracts/catalog'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * POST /api/ai-contract-generate
 *
 * Authenticated by the Supabase session cookie (same-origin only — no CORS
 * headers on purpose). Streams the contract back as plain text so the UI can
 * render it as it is written.
 *
 *   { mode?: 'generate', title, contractType, clientName, details, ... }
 *   { mode: 'refine', currentContract, instruction }
 *
 * The daily per-plan limit is enforced HERE. It used to be checked and
 * incremented in the browser only, so calling this route directly bypassed it.
 */

type Body = Record<string, unknown>

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

function bad(message: string, status = 400) {
  return NextResponse.json({ message }, { status })
}

export async function POST(request: NextRequest) {
  // Auth first, so unauthenticated callers learn nothing about server config.
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return bad('Please sign in to generate contracts.', 401)

  const openai = getOpenAI()
  if (!openai) {
    console.error('OPENAI_API_KEY is not set')
    return bad('AI contract generation is not configured.', 500)
  }

  let body: Body
  try {
    body = await request.json()
  } catch {
    return bad('Invalid request body.')
  }

  const mode = body.mode === 'refine' ? 'refine' : 'generate'

  // ---- Build the messages ------------------------------------------------
  let userPrompt: string
  let maxTokens: number

  if (mode === 'refine') {
    const currentContract = str(body.currentContract, 40000)
    const instruction = str(body.instruction, 1500)
    if (!currentContract || !instruction) {
      return bad('Both the current contract and a change request are required.')
    }
    userPrompt = buildRefinePrompt(currentContract, instruction)
    maxTokens = maxTokensFor('comprehensive')
  } else {
    const title = str(body.title, 200)
    const clientName = str(body.clientName, 200)
    const details = str(body.details ?? body.prompt, 4000)
    const contractType = str(body.contractType, 80)

    if (!title || !clientName || !details) {
      return bad('Title, client and contract details are required.')
    }
    if (!CONTRACT_TYPES.some((t) => t.id === contractType)) {
      return bad('Unknown contract type.')
    }
    const tone = TONES.find((t) => t.id === body.tone)?.id
    const length = LENGTHS.find((l) => l.id === body.length)?.id

    userPrompt = buildGenerationPrompt({
      title,
      contractType,
      details,
      clientName,
      clientCompany: str(body.clientCompany, 200),
      clientEmail: str(body.clientEmail, 200),
      jurisdiction: str(body.jurisdiction, 200),
      freelancerName: str(user.user_metadata?.full_name, 200) || undefined,
      freelancerEmail: user.email ?? undefined,
      tone,
      length,
    })
    maxTokens = maxTokensFor(length)
  }

  // ---- Enforce the plan limit server-side --------------------------------
  const [{ data: profile }, { data: usage }] = await Promise.all([
    supabase.from('users').select('subscription').eq('user_id', user.id).maybeSingle(),
    supabase.from('user_usage').select('ai_uses').eq('user_id', user.id).maybeSingle(),
  ])
  const limit = getAiDailyLimit(profile?.subscription)
  const used = usage?.ai_uses ?? 0
  if (used >= limit) {
    return bad(
      `You've used all ${limit} of your AI generations for today. Your allowance resets daily at 00:00 GMT.`,
      429,
    )
  }

  // ---- Call the model, streaming -----------------------------------------
  const model = getContractModel()
  let completion
  try {
    completion = await openai.chat.completions.create({
      model,
      stream: true,
      max_completion_tokens: maxTokens,
      ...(supportsTemperature(model) ? { temperature: 0.3 } : {}),
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: userPrompt },
      ],
    })
  } catch (error: any) {
    // Full detail stays in server logs; the client gets a safe message.
    console.error('OpenAI request failed:', { status: error?.status, message: error?.message, model })
    return bad('The AI service could not be reached. Please try again in a moment.', 502)
  }

  const encoder = new TextEncoder()
  let counted = false

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content
          if (!delta) continue
          if (!counted) {
            // Count the use once the model has actually started producing text.
            counted = true
            const { error } = await supabase.rpc('handle_ai_usage', { user_id_param: user.id })
            if (error) console.error('Failed to record AI usage:', error.message)
          }
          controller.enqueue(encoder.encode(delta))
        }
        controller.close()
      } catch (error: any) {
        console.error('Contract stream failed:', error?.message)
        controller.error(error)
      }
    },
    cancel() {
      completion.controller.abort()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      'X-Accel-Buffering': 'no',
      'X-AI-Limit': Number.isFinite(limit) ? String(limit) : 'unlimited',
      'X-AI-Used': String(used + 1),
    },
  })
}
