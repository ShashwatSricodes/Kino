import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(origin);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  // ✅ Exchange OAuth code for session
  const {
    data: { user },
  } = await supabase.auth.exchangeCodeForSession(code);

  // 🚨 Safety fallback
  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // 🔍 Check if username exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  // ✅ Decide redirect
  if (profile?.username) {
    return NextResponse.redirect(`${origin}/u/${profile.username}`);
  }

  // ❗ No username yet → onboarding
  return NextResponse.redirect(`${origin}/onboarding/username`);
}
