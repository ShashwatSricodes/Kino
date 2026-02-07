/**
 * Server Actions for User Dashboard
 * 
 * Contains all server-side mutations:
 * - logout: Sign out user and redirect to landing page
 * - deleteCollection: Remove a collection from user's archive
 */

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function deleteCollection(formData: FormData) {
  const collectionId = formData.get("collectionId") as string;
  const username = formData.get("username") as string;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId)
    .eq("user_id", user.id);

  redirect(`/u/${username}`);
}