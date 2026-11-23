import { NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";
import { safeRedirectPath } from "@/lib/auth/redirect";

/**
 * OAuth return point (Google / Apple via Supabase). Exchanges the one-time
 * `code` for a session cookie, then sends the user on.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  // `next` is ours; `redirect_to` is kept for links created by older versions.
  const next = safeRedirectPath(url.searchParams.get("next") ?? url.searchParams.get("redirect_to"));

  const fail = (message: string) =>
    NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent(message)}`, url.origin));

  // The provider reports problems (for example the user pressed "Cancel") as query params.
  const providerError = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (providerError) return fail("Sign-in was cancelled or failed. Please try again.");

  if (!code) return fail("That sign-in link is invalid or has expired. Please try again.");

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("OAuth code exchange failed:", error.message);
    return fail("We couldn't complete sign-in. Please try again.");
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
