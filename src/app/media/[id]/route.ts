import { getCurrentUser } from "@/lib/auth";
import { presenceSnapshotSchema, snapshotContainsAsset } from "@/lib/presence";
import { prisma } from "@/lib/prisma";
import { readImageFile } from "@/lib/storage";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    select: {
      storageKey: true,
      mimeType: true,
      store: {
        select: {
          ownerUserId: true,
          revisions: { orderBy: { revisionNo: "desc" }, take: 10, select: { snapshot: true } },
        },
      },
    },
  });
  if (!asset) return new Response("Not found", { status: 404 });

  const user = await getCurrentUser();
  const owned = user?.id === asset.store.ownerUserId;
  const published = asset.store.revisions.some((revision) => {
    const parsed = presenceSnapshotSchema.safeParse(revision.snapshot);
    return parsed.success && snapshotContainsAsset(parsed.data, id);
  });
  if (!owned && !published) return new Response("Not found", { status: 404 });

  try {
    const bytes = await readImageFile(asset.storageKey);
    return new Response(bytes, {
      headers: {
        "Content-Type": asset.mimeType,
        "Cache-Control": published ? "public, max-age=86400" : "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
