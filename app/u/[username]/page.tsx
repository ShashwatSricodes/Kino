import Link from "next/link";
import { Plus } from "lucide-react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { DeleteButton } from "./DeleteButton";

export const dynamic = "force-dynamic";

/* ------------------ Visual Components ------------------ */

const Postmark = ({ date = "FEB 26", location = "KINO" }) => (
  <div className="absolute -right-5 -top-5 z-20 h-24 w-24 opacity-60 pointer-events-none mix-blend-multiply rotate-[25deg] overflow-hidden">
    <div className="absolute inset-0 rounded-full border-[2px] border-slate-800/60" />
    <div className="absolute inset-1 rounded-full border border-slate-800/40" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
      <div className="text-[6px] font-bold uppercase tracking-widest text-slate-800/70 font-serif">
        {location} ARCHIVE
      </div>
      <div className="text-[10px] font-bold text-slate-900/80 leading-tight">
        {date}
      </div>
    </div>
    <div className="absolute top-1/2 -left-4 w-32 border-t border-slate-800/50 rotate-[-15deg]" />
    <div className="absolute top-1/2 -left-4 w-32 border-t border-slate-800/50 rotate-[-15deg] mt-1.5" />
  </div>
);

const PaperTexture = () => (
  <div
    className="absolute inset-0 opacity-30 pointer-events-none z-10 mix-blend-multiply"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
    }}
  />
);

/* ------------------ Supabase Server Helper ------------------ */

async function createSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

/* ------------------ Server Actions ------------------ */

async function logout() {
  "use server";
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/u/kino");
}

async function deleteCollection(formData: FormData) {
  "use server";
  const collectionId = formData.get("collectionId") as string;
  const username = formData.get("username") as string;
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId)
    .eq("user_id", user.id);

  redirect(`/u/${username}`);
}

/* ------------------ Page ------------------ */

export default async function Page({
  params,
}: {
  params: { username: string };
}) {
  const supabase = await createSupabaseServer();

  let user = null;
  let activeUsername = params.username;

  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (authUser) {
    user = authUser;
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", authUser.id)
      .single();

    if (profile?.username) activeUsername = profile.username;
  }

  /* -------- Collections -------- */

  let collections: {
    id: string;
    title: string;
    slug: string;
    img: string;
    price: string;
    variant: string;
  }[] = [];

  if (user) {
    const { data } = await supabase
      .from("collections")
      .select("id,title,slug,poster_url,price,variant")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data?.length) {
      collections = data.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        img: c.poster_url,
        price: c.price ?? "—",
        variant: c.variant ?? "tall",
      }));
    }
  }

  const getSizeClasses = (variant: string) => {
    if (variant === "wide") return "w-48 aspect-[4/3]";
    if (variant === "square") return "w-40 aspect-square";
    return "w-36 aspect-[3/4]";
  };

  /* ------------------ UI ------------------ */

  return (
    <main className="min-h-screen px-6 py-20 bg-[#EFE5CF] relative overflow-hidden">
      <PaperTexture />

      {/* AUTH */}
      <div className="fixed top-6 right-8 z-50 font-[Architects_Daughter] text-sm text-[#3A332A]">
        {!user ? (
          <div className="flex gap-3 items-center">
            <Link href="/login" className="hover:text-[#8C7B66] transition-colors">
              Login
            </Link>
            <span className="opacity-50">·</span>
            {/* Explicit Signup Link */}
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

      {/* GRID */}
      <section className="relative mx-auto max-w-6xl flex flex-wrap justify-center items-end gap-x-12 gap-y-16 px-4 z-10">
        
        {/* COLLECT BUTTON */}
        {/* If logged in -> New Collection. If NOT logged in -> Signup Page */}
        <Link href={user ? `/u/${activeUsername}/new` : "/signup"}>
          <div className="w-36 aspect-[3/4] border-2 border-dashed border-[#A89F91] flex flex-col items-center justify-center rotate-[-2deg] hover:rotate-0 transition-transform bg-[#A89F91]/5 hover:bg-[#A89F91]/10 cursor-pointer group">
            <Plus className="w-8 h-8 text-[#A89F91] group-hover:scale-110 transition-transform" />
            <span className="font-[Architects_Daughter] text-xs mt-2 text-[#A89F91]">
              Collect
            </span>
          </div>
        </Link>

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

            {user && (
              <div className="absolute -top-2 -right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
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