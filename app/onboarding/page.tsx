"use client";

import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function OnboardingPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const submit = async () => {
    setError("");

    if (!username.match(/^[a-z0-9_]+$/)) {
      setError("Only lowercase letters, numbers, and underscores allowed");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .insert({ id: user.id, username });

    if (error) {
      setError("Username already taken");
    } else {
      router.push(`/u/${username}`);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-3xl font-[Clever] text-center">
          Choose username
        </h1>

        <input
          className="w-full border p-2"
          placeholder="username"
          onChange={(e) => setUsername(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          className="w-full bg-black text-white py-2"
          onClick={submit}
        >
          Continue
        </button>
      </div>
    </main>
  );
}
