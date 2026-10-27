"use server";

import { Prisma } from "@prisma/client";
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

  const existingStore = await prisma.store.findUnique({
    where: { ownerUserId: user.id },
    select: { id: true },
  });

  if (existingStore) {
    redirect("/dashboard");
  }

  try {
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

    await prisma.store.create({
      data: {
        ownerUserId: user.id,
        type: parsedType.data,
        status: "DRAFT",
        onboardingStep: "BASICS",
      },
    });
  } catch (error) {
    // A unique owner constraint closes the race between two submitted tabs.
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      throw error;
    }
  }

  revalidatePath("/dashboard");
  redirect("/onboarding/setup?step=basics&created=1");
}
