/**
 * OAuth Callback Handler
 * 
 * Handles the redirect after OAuth login (Google, etc.)
 * 
 * Flow:
 * 1. Receives authorization code from OAuth provider
 * 2. Exchanges code for Supabase session
 * 3. Checks if user has a username
 * 4. Redirects to dashboard OR onboarding
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // No code = invalid callback
  if (!code) {
    return NextResponse.redirect(origin);
  }

  const supabase = await createClient();

  // Exchange OAuth code for session
  const { data: { user } } = await supabase.auth.exchangeCodeForSession(code);

  // Safety fallback - redirect to login if exchange failed
  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // Check if user has completed onboarding (has username)
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  // Has username → go to dashboard
  if (profile?.username) {
    return NextResponse.redirect(`${origin}/u/${profile.username}`);
  }

  // No username → complete onboarding first
  return NextResponse.redirect(`${origin}/onboarding/username`);
}