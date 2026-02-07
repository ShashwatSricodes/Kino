/**
 * User Dashboard Page
 *
 * Displays a user's collection archive.
 *
 * Features:
 * - Shows all collections as polaroid-style cards
 * - "Collect" button to add new collections
 * - Delete collections (owner only)
 * - Login/Signup links for visitors
 * - Logout for authenticated users
 *
 * Public: Anyone can view any user's collections
 * Private: Only owner can add/delete collections
 */

import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Postmark, PaperTexture } from "./components";
import { logout, deleteCollection } from "./actions";
import { DeleteButton } from "./DeleteButton";

export const dynamic = "force-dynamic";

export default async function UserDashboardPage({
  params,
}: {
  params: { username: string };
}) {
 const { username } = await params;

  const supabase = await createClient();

  // Get authenticated user (if any)
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  /**
   * 1️⃣ Get the profile being viewed via username
   */
  const { data: viewedProfile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", username)
    .single();

  if (!viewedProfile) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#EFE5CF]">
        <p className="font-[Architects_Daughter] text-[#3A332A]">
          User not found
        </p>
      </main>
    );
  }

  /**
   * 2️⃣ Determine if logged-in user is the owner
   */
  const isOwner = authUser?.id === viewedProfile.id;

  /**
   * 3️⃣ Fetch PUBLIC collections of the viewed profile
   */
  const { data } = await supabase
    .from("collections")
    .select("id,title,slug,poster_url,price,variant")
    .eq("user_id", viewedProfile.id)
    .order("created_at", { ascending: false });

  const collections =
    data?.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      img: c.poster_url,
      price: c.price ?? "—",
      variant: c.variant ?? "tall",
    })) ?? [];

  /**
   * Username used in UI/header/links
   */
  const activeUsername = viewedProfile.username;

  // Helper for responsive sizing
  const getSizeClasses = (variant: string) => {
    if (variant === "wide") return "w-48 aspect-[4/3]";
    if (variant === "square") return "w-40 aspect-square";
    return "w-36 aspect-[3/4]";
  };

  return (
    <main className="min-h-screen px-6 py-20 bg-[#EFE5CF] relative overflow-hidden">
      <PaperTexture />

      {/* AUTH HEADER */}
      <div className="fixed top-6 right-8 z-50 font-[Architects_Daughter] text-sm text-[#3A332A]">
        {!authUser ? (
          <div className="flex gap-3 items-center">
            <Link
              href="/login"
              className="hover:text-[#8C7B66] transition-colors"
            >
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
        ) : (
          <div className="flex gap-4">
            <Link href={`/u/${activeUsername}`} className="italic hover:underline">
              @{activeUsername}
            </Link>
            <form action={logout}>
              <button className="opacity-70 hover:opacity-100 transition-opacity">
                Logout
              </button>
            </form>
          </div>
        )}
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

      {/* COLLECTIONS GRID */}
      <section className="relative mx-auto max-w-6xl flex flex-wrap justify-center items-end gap-x-12 gap-y-16 px-4 z-10">
        {/* COLLECT BUTTON (only owner can actually use it, but UI unchanged) */}
        <Link href={authUser ? `/u/${activeUsername}/new` : "/signup"}>
          <div className="w-36 aspect-[3/4] border-2 border-dashed border-[#A89F91] flex flex-col items-center justify-center rotate-[-2deg] hover:rotate-0 transition-transform bg-[#A89F91]/5 hover:bg-[#A89F91]/10 cursor-pointer group">
            <Plus className="w-8 h-8 text-[#A89F91] group-hover:scale-110 transition-transform" />
            <span className="font-[Architects_Daughter] text-xs mt-2 text-[#A89F91]">
              Collect
            </span>
          </div>
        </Link>

        {/* COLLECTION CARDS */}
        {collections.map((c, i) => (
          <div
            key={c.id}
            className="relative group"
            style={{
              transform: `rotate(${i % 2 === 0 ? "-3deg" : "2deg"})`,
            }}
          >
            <Link href={`/u/${activeUsername}/${c.slug}`}>
              <div className="relative hover:scale-110 transition-transform duration-300 ease-out">
                <div
                  className={`relative ${getSizeClasses(
                    c.variant
                  )} bg-[#FFFDF5] p-[6px] shadow-[2px_4px_12px_rgba(0,0,0,0.1)]`}
                >
                  <PaperTexture />
                  <div className="h-full w-full border border-[#8C7B66]/30 bg-[#F4F1E8] overflow-hidden">
                    <img
                      src={c.img}
                      alt={c.title}
                      className="h-full w-full object-cover sepia-[0.2] opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
                {i % 2 === 0 && <Postmark date={`19${90 + i}`} />}
              </div>
            </Link>

            {/* Collection Title */}
            <div className="mt-3 text-center">
              <p className="font-[Architects_Daughter] text-sm text-[#3A332A]">
                {c.title}
              </p>
            </div>

            {/* Delete Button (OWNER ONLY) */}
            {isOwner && (
              <div className="absolute -top-2 -right-2 z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <DeleteButton
                  collectionId={c.id}
                  collectionTitle={c.title}
                  username={activeUsername}
                  deleteAction={deleteCollection}
                />
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
