/**
 * Username Onboarding Page
 * 
 * Allows new users to choose a unique username after signup.
 * 
 * Flow:
 * 1. Checks if user is authenticated (redirects to /signup if not)
 * 2. Checks if user already has username (redirects to dashboard if yes)
 * 3. Allows user to create username
 * 4. Saves to profiles table and redirects to /u/[username]
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Fingerprint } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function UsernameOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check auth status on mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/signup");
        return;
      }

      // Check if user already has username
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

      if (data?.username) {
        router.push(`/u/${data.username}`);
      }
      
      setAuthChecking(false);
    };
    checkUser();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("profiles")
      .upsert({ 
        id: user.id, 
        username: username.toLowerCase()
      });

    if (insertError) {
      console.error("Supabase Error:", insertError);
      if (insertError.code === "23505") {
        setError("That handle is already taken.");
      } else {
        setError(insertError.message || "Could not create ID. Try again.");
      }
      setLoading(false);
    } else {
      router.push(`/u/${username.toLowerCase()}`);
      router.refresh();
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#F0E6D2] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#3A332A]" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F0E6D2] px-6 flex items-center justify-center">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Courier+Prime&display=swap');
      `}</style>
      
      {/* Background Noise */}
      <div className="fixed inset-0 opacity-40 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/dust.png')]" />

      {/* ID Card Container */}
      <div className="relative w-full max-w-lg bg-[#EAE4D9] shadow-xl overflow-hidden rounded-sm">
        
        {/* ID Header Strip */}
        <div className="bg-[#3A332A] p-4 flex justify-between items-center">
          <div className="text-[#FFFDF5] font-serif tracking-[0.2em] text-xs uppercase">Kino Archive System</div>
          <Fingerprint className="text-[#E07A5F] w-6 h-6 opacity-80" />
        </div>

        {/* Card Body */}
        <div className="p-8 md:p-12 relative">
          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <Fingerprint size={200} />
          </div>

          <div className="text-center mb-8">
            <h2 className="font-['Courier_Prime'] font-bold text-2xl text-[#2c241b] mb-2">IDENTIFICATION</h2>
            <p className="font-[Architects_Daughter] text-[#8C7B66] text-sm">Create your unique curator handle</p>
          </div>

          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="bg-[#FFFDF5] border-2 border-dashed border-[#A89F91] p-1 flex items-center shadow-inner">
              <span className="pl-3 pr-1 text-[#A89F91] font-bold font-serif text-lg">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                className="w-full bg-transparent p-2 outline-none font-['Courier_Prime'] text-xl text-[#3A332A] placeholder-[#D6D0C4]"
                placeholder="username"
                autoComplete="off"
                maxLength={20}
              />
            </div>
            
            <div className="mt-2 flex justify-between text-[10px] font-serif uppercase tracking-wider text-[#8C7B66] opacity-70">
              <span>Must be unique</span>
              <span>{username.length}/20</span>
            </div>

            {error && (
              <div className="mt-4 text-center font-[Architects_Daughter] text-[#E07A5F] text-sm">
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || username.length < 3}
              className="mt-8 w-full bg-[#E07A5F] hover:bg-[#C46B53] text-[#FFFDF5] py-3 font-serif uppercase tracking-[0.15em] text-xs shadow-md transition-all disabled:bg-[#D6D0C4] disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? "Issuing ID..." : "Issue ID Card"}
            </button>
          </form>
        </div>

        {/* Bottom Bar */}
        <div className="h-2 w-full bg-[#8C7B66]/20 border-t border-[#8C7B66]/30 flex">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="flex-1 border-r border-[#8C7B66]/30 h-full" />
          ))}
        </div>
      </div>
    </main>
  );
}