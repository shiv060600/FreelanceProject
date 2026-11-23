/**
 * After sign-in we send people to a path taken from the URL (`?next=`). Taken
 * as-is that is an open redirect: `?next=https://evil.example` would bounce a
 * freshly signed-in user to an attacker's site. Only same-site absolute paths
 * are allowed.
 */
export function safeRedirectPath(input: string | null | undefined, fallback = '/dashboard'): string {
  if (!input) return fallback
  if (!input.startsWith('/')) return fallback
  // "//host" and "/\host" are protocol-relative / browser-normalised to another origin.
  if (input.startsWith('//') || input.startsWith('/\\')) return fallback
  // Tabs/newlines are stripped by URL parsers, so "/\t/host" would become "//host".
  if (/[\u0000-\u001f\u007f]/.test(input)) return fallback
  return input
}
