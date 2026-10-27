import { type PageSectionType } from "@prisma/client";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { defaultSections, presenceInclude } from "@/lib/presence";
import { prisma } from "@/lib/prisma";

export async function requireMerchantStore() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?reason=session");

  const store = await prisma.store.findUnique({
    where: { ownerUserId: user.id },
    include: presenceInclude,
  });
  if (!store) redirect("/onboarding/type");

  return { user, store };
}

export async function ensurePresenceScaffold(storeId: string) {
  await prisma.$transaction([
    prisma.themeConfig.upsert({
      where: { storeId },
      update: {},
      create: { storeId },
    }),
    ...defaultSections.map((section) =>
      prisma.pageSection.upsert({
        where: { storeId_type: { storeId, type: section.type } },
        update: {},
        create: { storeId, ...section },
      }),
    ),
  ]);
}

export async function requireOwnedSection(sectionType: PageSectionType) {
  const { user, store } = await requireMerchantStore();
  const section = store.sections.find((candidate) => candidate.type === sectionType);
  if (!section) throw new Error("Section not found.");
  return { user, store, section };
}
