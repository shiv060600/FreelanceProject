import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { completionTuning, getContractModel, getOpenAI } from '@/lib/contracts/openai'
import { splitDraft } from '@/lib/contracts/draft'
import {
  buildGenerationPrompt,
  buildSystemPrompt,
  maxTokensFor,
} from '@/lib/contracts/prompt'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Mobile (Expo) endpoint. Authenticated by a shared secret header rather than
 * a cookie, so CORS is open. Uses the same prompt builder as the web route so
 * both produce identical contracts. Non-streaming: returns { contract, success }.
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, expo-api-key',
  'Access-Control-Max-Age': '86400',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

const respond = (message: string, status: number) =>
  NextResponse.json({ message }, { status, headers: corsHeaders })

function keysMatch(provided: string, expected: string) {
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: NextRequest) {
  const openai = getOpenAI()
  const expectedKey = process.env.AI_CONTRACT_API_KEY

  if (!openai) {
    console.error('OPENAI_API_KEY is not set')
    return respond('AI contract generation is not configured.', 500)
  }
  if (!expectedKey) {
    console.error('AI_CONTRACT_API_KEY is not set')
    return respond('API authentication not configured', 500)
  }

  const providedKey = request.headers.get('expo-api-key')?.trim()
  if (!providedKey) return respond('API key is required. Please provide expo-api-key header.', 401)
  if (!keysMatch(providedKey, expectedKey)) return respond('Invalid API key. Access denied.', 403)

  try {
    const body = await request.json()
    const { title, contractType, clientName, prompt, clientCompany } = body ?? {}

    if (!title || !contractType || !clientName || !prompt) {
      return respond('Missing required fields: title, contractType, clientName, and prompt are required', 400)
    }

    const model = getContractModel()
    const response = await openai.chat.completions.create({
      model,
      ...completionTuning(model, maxTokensFor('standard')),
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        {
          role: 'user',
          content: buildGenerationPrompt({
            title: String(title),
            contractType: String(contractType),
            details: String(prompt),
            clientName: String(clientName),
            clientCompany: clientCompany ? String(clientCompany) : undefined,
            jurisdiction: body?.jurisdiction ? String(body.jurisdiction) : undefined,
          }),
        },
      ],
    })

    const raw = response.choices?.[0]?.message?.content
    if (!raw) return respond('Invalid response from AI service', 502)
    // Keep the contract free of the drafting-notes checklist; return it separately.
    const { contract, notes } = splitDraft(raw, { final: true })

    return NextResponse.json({ contract, notes, success: true }, { status: 200, headers: corsHeaders })
  } catch (error: any) {
    console.error('Native contract generation failed:', { message: error?.message, status: error?.status })
    return respond('Failed to generate contract', 500)
  }
}
