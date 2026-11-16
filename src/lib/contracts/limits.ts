/**
 * Daily AI generation limits per plan. One source of truth for the API route
 * (which enforces it) and the UI (which displays it).
 *
 * The previous code showed one set of numbers in the UI but gated on a
 * different one (everything except "Unlimited Freelancer" was capped at 1).
 * The numbers below are the ones the UI was advertising.
 */
export const AI_DAILY_LIMITS: Record<string, number> = {
  'Unlimited Freelancer': Number.POSITIVE_INFINITY,
  'Expert Freelancer': 50,
  'Seasoned Freelancer': 10,
  'New Freelancer': 1,
  Free: 1,
}

export function getAiDailyLimit(plan: string | null | undefined): number {
  if (!plan) return AI_DAILY_LIMITS.Free
  return AI_DAILY_LIMITS[plan] ?? AI_DAILY_LIMITS.Free
}

export function formatLimit(limit: number) {
  return Number.isFinite(limit) ? String(limit) : '∞'
}
