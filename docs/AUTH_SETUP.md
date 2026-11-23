# Google and Apple sign-in setup

The app code is finished: `/sign-in`, `/sign-up` and the landing page show **Continue with Google / Apple**
buttons automatically, but only for providers that are switched on in Supabase. Until one is enabled:

- `/sign-up` shows "Sign-up is opening very soon".
- `/sign-in` keeps an email form so existing accounts are not locked out. It disappears by itself once
  Google or Apple is enabled.

Nothing in the code needs changing. Everything below happens in dashboards.

## 1. Supabase URL configuration (do this first)

Supabase dashboard → **Authentication → URL Configuration**

- **Site URL:** your production URL, e.g. `https://freelance-project-lac.vercel.app`
- **Redirect URLs** (allow-list):
  - `https://freelance-project-lac.vercel.app/**`
  - `http://localhost:3000/**`
  - any Vercel preview domain you want to test on

The app redirects back to `/auth/callback`, which exchanges the code for a session. If a URL is missing from
the allow-list, Supabase silently falls back to the Site URL.

## 2. Google

1. Google Cloud Console → **APIs & Services → Credentials → Create credentials → OAuth client ID**
   (first time: configure the OAuth consent screen; "External", add your support email).
2. Application type **Web application**.
3. **Authorized redirect URIs:** `https://<project-ref>.supabase.co/auth/v1/callback`
   (Supabase → Authentication → Providers → Google shows the exact URI to copy).
4. Copy the **Client ID** and **Client secret** into Supabase → Authentication → Providers → **Google** → Enable → Save.
5. The default scopes (email, profile) are all we need. Publish the consent screen from "Testing" to
   "In production" before inviting real users, or only listed test users can sign in.

Cost: free.

## 3. Apple

Requires a paid **Apple Developer Program** membership (US$99/year).

1. developer.apple.com → Certificates, Identifiers & Profiles → **Identifiers → App IDs**: create an App ID and
   enable **Sign in with Apple**.
2. **Identifiers → Services IDs**: create a Services ID (this is the OAuth **client ID**, e.g. `com.yourname.freelanceflow.web`).
   Enable Sign in with Apple, **Configure**, then add:
   - Domain: `<project-ref>.supabase.co`
   - Return URL: `https://<project-ref>.supabase.co/auth/v1/callback`
3. **Keys**: create a key with Sign in with Apple enabled; download the `.p8` file (only offered once) and note the Key ID.
4. Apple does not give a static client secret. You generate a signed JWT from the `.p8` key, Team ID, Key ID and
   Services ID. Supabase documents a generator in the Apple provider page.
   **This secret expires after at most 6 months**, so put a calendar reminder to regenerate it and paste it into
   Supabase again. When it expires, Apple sign-in breaks.
5. Supabase → Authentication → Providers → **Apple** → Enable → Client IDs = your Services ID → Secret = the JWT → Save.

Apple returns the user's name only the very first time, and a user can choose to hide their email (you get a relay address).

## 4. Check it worked

The app reads the public settings endpoint to decide which buttons to show (cached for ~2 minutes):

```bash
curl -s "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/settings" -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" | python3 -c "import sys,json; print(json.load(sys.stdin)['external'])"
```

`google` / `apple` should read `true`. Then open `/sign-up` in a private window and complete a sign-in.

## 5. Turning email off

Once Google works end to end, you can disable email sign-ups in Supabase → Authentication → Providers → **Email**.
Do this **after** testing Google, otherwise nobody can sign in.

Existing email accounts: if the Google/Apple account uses the same **verified** email, Supabase links it to the
existing user automatically, so their clients, invoices and contracts carry over.

## Not covered by this change

- The mobile (Expo) app still uses email sign-in.
- There is no public Terms of Service / Privacy Policy page yet. Google's consent screen and Apple both ask for
  these URLs for production use, so write them before going live.
