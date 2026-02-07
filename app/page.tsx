/**
 * Landing Page (/)
 * 
 * The homepage for non-logged-in visitors.
 * 
 * Features:
 * - Shows "Collect" button that links to signup
 * - Login/Signup links in header
 * - Auto-redirects logged-in users to their dashboard
 * 
 * Design matches the user dashboard for consistency.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

/* ------------------ Visual Components ------------------ */

const PaperTexture = () => (
  <div
    className="absolute inset-0 opacity-30 pointer-events-none z-10 mix-blend-multiply"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
    }}
  />
);

export default async function LandingPage() {
  const supabase = await createClient();

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  
  // If logged in, redirect to their profile
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    
    if (profile?.username) {
      redirect(`/u/${profile.username}`);
    }
  }

  return (
    <main className="min-h-screen px-6 py-20 bg-[#EFE5CF] relative overflow-hidden">
      <PaperTexture />

      {/* AUTH - Top Right */}
      <div className="fixed top-6 right-8 z-50 font-[Architects_Daughter] text-sm text-[#3A332A]">
        <div className="flex gap-3 items-center">
          <Link href="/login" className="hover:text-[#8C7B66] transition-colors">
            Login
          </Link>
          <span className="opacity-50">·</span>
          <Link 
            href="/signup" 
            className="font-bold hover:text-[#E07A5F] transition-colors underline decoration-1 underline-offset-4 decoration-[#E07A5F]/40"
          >
            Sign up
          </Link>
        </div>
      </div>

      {/* HEADER */}
      <div className="relative mx-auto max-w-2xl text-center mb-24 z-10">
        <h1 className="font-serif text-6xl tracking-[0.15em] uppercase mb-4 text-[#2c241b]">
          Kino
        </h1>
        <p className="font-[Architects_Daughter] italic text-[#5C5043]">
          a quiet archive of films that stayed
        </p>
      </div>

      {/* GRID - Only "Collect" button for visitors */}
      <section className="relative mx-auto max-w-6xl flex flex-wrap justify-center items-end gap-x-12 gap-y-16 px-4 z-10">
        
        {/* COLLECT BUTTON */}
        <Link href="/signup">
          <div className="w-36 aspect-[3/4] border-2 border-dashed border-[#A89F91] flex flex-col items-center justify-center rotate-[-2deg] hover:rotate-0 transition-transform bg-[#A89F91]/5 hover:bg-[#A89F91]/10 cursor-pointer group">
            <Plus className="w-8 h-8 text-[#A89F91] group-hover:scale-110 transition-transform" />
            <span className="font-[Architects_Daughter] text-xs mt-2 text-[#A89F91]">
              Collect
            </span>
          </div>
        </Link>

      </section>
    </main>
  );
}