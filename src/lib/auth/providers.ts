/**
 * Which sign-in methods are actually switched on for this Supabase project.
 *
 * Supabase publishes this at GET /auth/v1/settings (public, needs only the
 * anon key). Reading it lets the UI show a "Continue with Google/Apple"
 * button exactly when it will work, instead of a button that errors, and
 * lets the old email sign-in stay available as a safety net until at least
 * one social provider is configured, so nobody gets locked out in between.
 */

export type OAuthProvider = 'google' | 'apple'

export interface ProviderAvailability {
  google: boolean
  apple: boolean
  /** Email/password is enabled on the project (used only as a transition fallback). */
  email: boolean
  /** False when the settings could not be read (we then assume the social buttons work). */
  known: boolean
}

export const UNKNOWN_AVAILABILITY: ProviderAvailability = { google: true, apple: true, email: true, known: false }

/** Pure: turn the /auth/v1/settings payload into availability flags. */
export function parseProviders(settings: unknown): ProviderAvailability {
  const external = (settings as { external?: Record<string, unknown> } | null)?.external
  if (!external || typeof external !== 'object') return UNKNOWN_AVAILABILITY
  return {
    google: external.google === true,
    apple: external.apple === true,
    email: external.email === true,
    known: true,
  }
}

export const hasSocialProvider = (p: ProviderAvailability) => p.google || p.apple

/** Server-side fetch of the project's enabled providers (cached briefly). */
export async function getProviderAvailability(): Promise<ProviderAvailability> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return UNKNOWN_AVAILABILITY
  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(2500),
    })
    if (!res.ok) return UNKNOWN_AVAILABILITY
    return parseProviders(await res.json())
  } catch {
    return UNKNOWN_AVAILABILITY
  }
}

const NAMES: Record<OAuthProvider, string> = { google: 'Google', apple: 'Apple' }
export const providerName = (p: OAuthProvider) => NAMES[p]

/** A friendly message for failed OAuth start-ups. */
export function oauthErrorMessage(provider: OAuthProvider, raw?: string | null) {
  const name = NAMES[provider]
  if (raw && /provider is not enabled|unsupported provider/i.test(raw)) {
    return `${name} sign-in isn’t set up yet. Please try again later.`
  }
  return `We couldn’t start ${name} sign-in. Please try again.`
}
