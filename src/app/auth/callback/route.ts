import { NextResponse } from "next/server";

import { profileDataFromAuthUser, safeRedirectPath } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeRedirectPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing-code", requestUrl.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(new URL("/login?error=oauth", requestUrl.origin));
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL("/login?error=session", requestUrl.origin));
  }

  const profile = profileDataFromAuthUser(user);
  await prisma.profile.upsert({
    where: { id: user.id },
    update: {
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
    },
    create: profile,
  });

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
