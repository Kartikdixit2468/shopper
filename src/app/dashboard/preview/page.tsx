import Link from "next/link";

import { PresenceStorefront } from "@/components/presence-storefront";
import { ensurePresenceScaffold, requireMerchantStore } from "@/lib/merchant";
import { buildPresenceSnapshot, getPresenceChecklist, presenceInclude } from "@/lib/presence";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DraftPreviewPage() {
  const { store: initialStore } = await requireMerchantStore();
  await ensurePresenceScaffold(initialStore.id);
  const store = await prisma.store.findUniqueOrThrow({
    where: { id: initialStore.id },
    include: presenceInclude,
  });
  const checklist = getPresenceChecklist(store);
  if (!checklist.complete) {
    return (
      <main className="preview-incomplete">
        <div>
          <h1>Your preview needs a few essentials</h1>
          <p>Add your business name, location, contact method, and design first.</p>
          <Link href="/onboarding/setup">Continue setup</Link>
        </div>
      </main>
    );
  }
  return <PresenceStorefront preview snapshot={buildPresenceSnapshot(store)} />;
}
