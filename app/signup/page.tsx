/**
 * Signup Page
 * 
 * Allows new users to create an account with:
 * - Email + Password
 * - Google OAuth
 * 
 * After successful signup, redirects to /onboarding/username
 * to complete profile setup
 */

"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      router.push("/onboarding/username");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <main className="min-h-screen bg-[#F0E6D2] relative flex items-center justify-center p-6 overflow-hidden">
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
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#E6B89C]/80 shadow-sm rotate-0 mix-blend-multiply mask-tape" style={{ clipPath: "polygon(2% 0, 100% 0, 98% 100%, 0% 100%)" }} />

        {/* Header */}
        <div className="text-center mb-10 space-y-2">
          <h1 className="font-serif text-3xl tracking-[0.2em] text-[#2c241b] uppercase">
            Membership
          </h1>
          <p className="font-[Architects_Daughter] text-[#8C7B66] text-sm">
            start your personal archive
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
            <span className="bg-[#FFFDF5] px-2 text-[#A89F91]">Or via email</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-6 relative z-10">
          <div className="space-y-1">
            <label className="text-xs font-bold font-serif uppercase tracking-widest text-[#5C5043]">Email</label>
            <div className="relative group">
              <Mail className="absolute left-0 top-2.5 w-4 h-4 text-[#A89F91] group-focus-within:text-[#3A332A] transition-colors" />
              <input 
                name="email" 
                type="email" 
                required 
                className="w-full bg-transparent border-b border-[#8C7B66]/40 py-2 pl-7 font-[Architects_Daughter] text-[#3A332A] focus:outline-none focus:border-[#3A332A] transition-colors placeholder-[#A89F91]/50"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold font-serif uppercase tracking-widest text-[#5C5043]">Password</label>
            <div className="relative group">
              <Lock className="absolute left-0 top-2.5 w-4 h-4 text-[#A89F91] group-focus-within:text-[#3A332A] transition-colors" />
              <input 
                name="password" 
                type="password" 
                required 
                minLength={6}
                className="w-full bg-transparent border-b border-[#8C7B66]/40 py-2 pl-7 font-[Architects_Daughter] text-[#3A332A] focus:outline-none focus:border-[#3A332A] transition-colors placeholder-[#A89F91]/50"
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
            className="w-full mt-4 group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#3A332A] text-[#FFFDF5] font-serif uppercase tracking-widest text-xs hover:bg-[#2c241b] transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                <span>Sign Record</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-dashed border-[#8C7B66]/30 pt-6">
          <p className="font-[Architects_Daughter] text-sm text-[#5C5043]">
            Already a member?{" "}
            <Link href="/login" className="text-[#E07A5F] underline decoration-wavy hover:text-[#c46b53]">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}