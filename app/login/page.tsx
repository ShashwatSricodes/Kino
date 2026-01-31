"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";

// 🔐 Supabase client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===============================
  // Email + Password Login (FIXED)
  // ===============================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // ✅ Force server-side auth handling
    // (prevents first-login cookie race condition)
    window.location.href = "/auth/callback";
  };

  // ===============================
  // Google OAuth Login (CORRECT)
  // ===============================
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#F0E6D2] relative flex items-center justify-center p-6 overflow-hidden selection:bg-[#ccbfa3] selection:text-[#3A332A]">
      {/* Background Texture */}
      <div
        className="fixed inset-0 opacity-40 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Card */}
      <div className="relative w-full max-w-md bg-[#FFFDF5] shadow-[2px_4px_20px_rgba(0,0,0,0.1)] border border-[#8C7B66]/30 p-8 md:p-12">
        {/* Tape Effect */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#E6B89C]/80 shadow-sm mix-blend-multiply mask-tape"
          style={{ clipPath: "polygon(2% 0, 100% 0, 98% 100%, 0% 100%)" }}
        />

        {/* Header */}
        <div className="text-center mb-10 space-y-2">
          <h1 className="font-serif text-3xl tracking-[0.2em] text-[#2c241b] uppercase">
            Access
          </h1>
          <p className="font-[Architects_Daughter] text-[#8C7B66] text-sm">
            return to your archive
          </p>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full mb-6 flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-[#8C7B66]/30 text-[#5C5043] font-serif text-xs uppercase tracking-widest hover:bg-[#F9F6F0] transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#8C7B66]/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#FFFDF5] px-2 text-[#A89F91]">
              Or via email
            </span>
          </div>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div className="space-y-1">
            <label className="text-xs font-bold font-serif uppercase tracking-widest text-[#5C5043]">
              Email
            </label>
            <div className="relative group">
              <Mail className="absolute left-0 top-2.5 w-4 h-4 text-[#A89F91]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-[#8C7B66]/40 py-2 pl-7 font-[Architects_Daughter] text-[#3A332A] focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold font-serif uppercase tracking-widest text-[#5C5043]">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-0 top-2.5 w-4 h-4 text-[#A89F91]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-[#8C7B66]/40 py-2 pl-7 font-[Architects_Daughter] text-[#3A332A] focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-[#E07A5F]/10 border border-[#E07A5F]/20 text-[#E07A5F] text-xs font-[Architects_Daughter] text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-[#3A332A] text-[#FFFDF5] font-serif uppercase tracking-widest text-xs disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Enter Archive</span>
                <ArrowRight className="w-3 h-3" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-dashed border-[#8C7B66]/30 pt-6">
          <p className="font-[Architects_Daughter] text-sm text-[#5C5043]">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#E07A5F] underline decoration-wavy"
            >
              Join here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
