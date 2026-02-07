/**
 * Supabase Server Client
 * 
 * Use this in Server Components, Server Actions, and Route Handlers.
 * Handles cookie-based authentication for server-side operations.
 * 
 * Benefits:
 * - Centralizes server client creation (no repetition)
 * - Consistent cookie handling across all server code
 * - Easy to update auth config in one place
 * 
 * Usage:
 * const supabase = await createClient();
 * const { data } = await supabase.from('profiles').select();
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}