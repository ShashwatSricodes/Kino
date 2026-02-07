/**
 * Supabase Browser Client
 * 
 * Use this in Client Components (files with "use client").
 * Handles browser-based authentication for client-side operations.
 * 
 * Benefits:
 * - Centralizes browser client creation (no repetition)
 * - Consistent client config across all components
 * - Easy to update in one place
 * 
 * Usage:
 * import { createClient } from '@/lib/supabase/client';
 * 
 * const supabase = createClient();
 * const { data } = await supabase.from('profiles').select();
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}