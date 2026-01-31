"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft } from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewPosterPage() {
  const { username } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!file || !title) {
      setError("Please provide both a title and an image");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in");
        setLoading(false);
        return;
      }

      // Upload file
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { data: upload, error: uploadError } = await supabase.storage
        .from("posters")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setError(`Upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const poster_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/posters/${upload.path}`;
      const slug = title.toLowerCase().replace(/\s+/g, "-");

      // Insert collection
      const { error: insertError } = await supabase.from("collections").insert({
        user_id: user.id,
        title,
        slug,
        poster_url,
      });

      if (insertError) {
        console.error("Insert error:", insertError);
        setError(`Failed to save: ${insertError.message}`);
        setLoading(false);
        return;
      }

      // Success - redirect to homepage instead of the detail page
      router.push(`/u/${username}`);
      router.refresh(); // Force refresh to show new collection
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F0E6D2] px-6 py-20 selection:bg-[#ccbfa3] selection:text-[#3A332A]">
      {/* Background Noise */}
      <div
        className="fixed inset-0 opacity-50 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-md mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/u/${username}`)}
          className="mb-6 flex items-center gap-2 font-[Architects_Daughter] text-[#3A332A] hover:underline underline-offset-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to archive
        </button>

        {/* Form Card */}
        <section className="bg-[#FFFDF5] border border-[#8C7B66]/40 p-10 shadow-[2px_4px_12px_rgba(0,0,0,0.15)]">
          {/* Paper Texture */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none mix-blend-multiply"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative">
            <h2 className="font-serif text-2xl tracking-[0.2em] uppercase text-[#2c241b] mb-2">
              New Collection
            </h2>
            <p className="font-[Architects_Daughter] text-[#5C5043] italic text-sm mb-8">
              add a film to your archive
            </p>

            <div className="space-y-6">
              <div>
                <label className="block mb-1 font-[Architects_Daughter] text-sm text-[#3A332A]">
                  Film Title
                </label>
                <input
                  placeholder="e.g., Interstellar"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent border-b border-[#8C7B66] px-1 py-2 font-[Architects_Daughter] focus:outline-none focus:border-[#3A332A]"
                />
              </div>

              <div>
                <label className="block mb-1 font-[Architects_Daughter] text-sm text-[#3A332A]">
                  Poster Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full font-[Architects_Daughter] text-sm text-[#3A332A] file:mr-4 file:py-2 file:px-4 file:border file:border-[#8C7B66] file:bg-transparent file:font-[Architects_Daughter] file:text-sm hover:file:bg-[#F4F1E8] file:cursor-pointer"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="font-[Architects_Daughter] text-sm text-red-800">
                    {error}
                  </p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !title || !file}
                className="mt-6 w-full border border-[#3A332A] py-2 font-serif uppercase tracking-widest text-sm hover:bg-[#3A332A] hover:text-[#FFFDF5] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Add to Archive"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}