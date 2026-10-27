import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PresenceStorefront } from "@/components/presence-storefront";
import { presenceSnapshotSchema } from "@/lib/presence";
import { prisma } from "@/lib/prisma";

type StorefrontPageProps = { params: Promise<{ slug: string }> };

async function getPublishedStore(slug: string) {
  const store = await prisma.store.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      revisions: { orderBy: { revisionNo: "desc" }, take: 1, select: { snapshot: true } },
    },
  });
  if (!store?.revisions[0]) return null;
  const parsed = presenceSnapshotSchema.safeParse(store.revisions[0].snapshot);
  return parsed.success ? parsed.data : null;
}

export async function generateMetadata({ params }: StorefrontPageProps): Promise<Metadata> {
  const { slug } = await params;
  const snapshot = await getPublishedStore(slug);
  if (!snapshot) return { title: "Store not found" };
  const description =
    snapshot.store.shortDescription || `${snapshot.store.name} in ${snapshot.contact.city}`;
  return {
    title: snapshot.store.name,
    description,
    openGraph: {
      title: snapshot.store.name,
      description,
      type: "website",
      images: snapshot.theme.coverAssetId ? [`/media/${snapshot.theme.coverAssetId}`] : undefined,
    },
  };
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { slug } = await params;
  const snapshot = await getPublishedStore(slug);
  if (!snapshot) notFound();

  const address = [
    snapshot.contact.addressLine,
    snapshot.contact.locality,
    snapshot.contact.city,
    snapshot.contact.state,
    snapshot.contact.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: snapshot.store.name,
    description: snapshot.store.shortDescription ?? undefined,
    telephone: snapshot.contact.phone ?? undefined,
    address: address || undefined,
    url: `/s/${snapshot.store.slug}`,
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
      <PresenceStorefront snapshot={snapshot} />
    </>
  );
}
