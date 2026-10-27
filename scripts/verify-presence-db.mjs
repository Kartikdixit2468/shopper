import { randomUUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";

process.loadEnvFile(".env");

if (!process.env.DIRECT_URL) {
  throw new Error("DIRECT_URL is required for the Presence database verification.");
}

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL } },
});
const rollbackMarker = "PRESENCE_VERIFICATION_ROLLBACK";

try {
  await prisma.$transaction(async (tx) => {
    const ownerId = randomUUID();
    const otherOwnerId = randomUUID();
    const slug = `verification-${randomUUID().slice(0, 8)}`;
    await tx.profile.createMany({
      data: [
        { id: ownerId, email: `${ownerId}@verification.invalid` },
        { id: otherOwnerId, email: `${otherOwnerId}@verification.invalid` },
      ],
    });
    const store = await tx.store.create({
      data: {
        ownerUserId: ownerId,
        type: "PRESENCE",
        name: "Verification Store",
        category: "Other local business",
        slug,
      },
    });
    await tx.storeContact.create({
      data: {
        storeId: store.id,
        locality: "Test Locality",
        city: "Bengaluru",
        phone: "+919876543210",
      },
    });
    await tx.themeConfig.create({ data: { storeId: store.id } });
    const revision = await tx.storeRevision.create({
      data: {
        storeId: store.id,
        revisionNo: 1,
        snapshot: { version: 1, store: { name: store.name, slug } },
      },
    });
    await tx.store.update({ where: { id: store.id }, data: { name: "Changed Draft" } });
    const savedRevision = await tx.storeRevision.findUniqueOrThrow({
      where: { id: revision.id },
    });
    if (savedRevision.snapshot.store?.name !== "Verification Store") {
      throw new Error("Published snapshot changed with the draft.");
    }
    const crossTenantRead = await tx.store.findFirst({
      where: { id: store.id, ownerUserId: otherOwnerId },
    });
    if (crossTenantRead) throw new Error("Cross-tenant store read was possible.");
    throw new Error(rollbackMarker);
  });
} catch (error) {
  if (!(error instanceof Error) || error.message !== rollbackMarker) throw error;
  console.log("Presence database verification passed; temporary records were rolled back.");
} finally {
  await prisma.$disconnect();
}
