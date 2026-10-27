"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser, profileDataFromAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseActiveStoreType } from "@/lib/store-mode";

export async function createDraftStore(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?reason=session");
  }

  const parsedType = parseActiveStoreType(formData.get("storeType"));

  if (!parsedType.success) {
    redirect("/onboarding/type?error=invalid-mode");
  }

  const profile = profileDataFromAuthUser(user);
  const [, store] = await prisma.$transaction([
    prisma.profile.upsert({
      where: { id: user.id },
      update: {
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
      },
      create: profile,
    }),
    prisma.store.upsert({
      where: { ownerUserId: user.id },
      update: {},
      create: {
        ownerUserId: user.id,
        type: parsedType.data,
        status: "DRAFT",
        onboardingStep: "BASICS",
      },
      select: { onboardingStep: true },
    }),
  ]);

  revalidatePath("/dashboard");
  redirect(
    store.onboardingStep === "COMPLETE" ? "/dashboard" : "/onboarding/setup?step=basics&created=1",
  );
}
