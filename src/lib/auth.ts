import type { User } from "@supabase/supabase-js";

import { isSupabaseAuthConfigured } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  if (!isSupabaseAuthConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return error ? null : user;
}

export function profileDataFromAuthUser(user: User) {
  const metadata = user.user_metadata;
  const name = metadata.full_name ?? metadata.name;
  const avatarUrl = metadata.avatar_url ?? metadata.picture;

  return {
    id: user.id,
    email: user.email ?? null,
    name: typeof name === "string" ? name : null,
    avatarUrl: typeof avatarUrl === "string" ? avatarUrl : null,
  };
}

export function safeRedirectPath(value: string | null, fallback = "/start") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}
