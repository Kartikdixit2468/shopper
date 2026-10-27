import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StartPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const store = await prisma.store.findUnique({
    where: { ownerUserId: user.id },
    select: { id: true, onboardingStep: true },
  });

  if (!store) redirect("/onboarding/type");
  redirect(store.onboardingStep === "COMPLETE" ? "/dashboard" : "/onboarding/setup");
}
