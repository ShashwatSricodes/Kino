import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CookieOptions } from "@supabase/ssr";

export async function supabaseServer(response: NextResponse) {
  const cookieStore = await cookies();

interface CookieToSet {
    name: string;
    value: string;
    options?: CookieOptions;
}

return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: (cookiesToSet: CookieToSet[]): void => {
                cookiesToSet.forEach(({ name, value, options }: CookieToSet) => {
                    response.cookies.set(name, value, options);
                });
            },
        },
    }
);
}
