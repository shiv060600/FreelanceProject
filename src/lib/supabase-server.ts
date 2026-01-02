import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server client for server components (with cookie handling)
export const createServerSupabaseClient = async () => {
  // In Next.js 16, cookies() returns a Promise and must be awaited
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: any }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}; 