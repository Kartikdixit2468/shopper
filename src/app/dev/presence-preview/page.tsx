import { notFound } from "next/navigation";

import { PresenceStorefront } from "@/components/presence-storefront";
import { presenceSnapshotSchema } from "@/lib/presence";

export const dynamic = "force-dynamic";

export default async function DevelopmentPresencePreview({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const params = await searchParams;
  const templateId = ["canvas", "heritage", "studio"].includes(params.template ?? "")
    ? params.template
    : "canvas";
  const snapshot = presenceSnapshotSchema.parse({
    version: 1,
    store: {
      name: "Sampige Bake House",
      slug: "sampige-bake-house-demo",
      category: "Food & bakery",
      shortDescription:
        "Small-batch cakes, fresh breads and familiar treats made in our neighbourhood kitchen.",
    },
    contact: {
      phone: "+919876543210",
      whatsappNumber: "+919876543210",
      addressLine: "DEMO · 18 Sampige Road",
      locality: "Malleshwaram",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560003",
      mapUrl: "https://maps.google.com",
      openingHours: { summary: "Mon–Sat, 8:00 am–8:30 pm" },
      socials: { instagram: "https://instagram.com", facebook: null },
    },
    theme: {
      templateId,
      primaryColor: "#1D6A5D",
      accentColor: "#F2B184",
      fontSet: templateId === "heritage" ? "editorial" : "modern",
      logoAssetId: null,
      coverAssetId: null,
    },
    sections: [
      { type: "HERO", sortOrder: 0, visible: true, content: {} },
      {
        type: "ABOUT",
        sortOrder: 1,
        visible: true,
        content: {
          heading: "Made slowly, shared warmly",
          body: "We are a family-run neighbourhood bakery. Every morning starts with fresh dough, local ingredients and recipes our customers return for.",
        },
      },
      { type: "LISTINGS", sortOrder: 2, visible: true, content: {} },
      { type: "HOURS", sortOrder: 3, visible: true, content: {} },
      { type: "LOCATION", sortOrder: 4, visible: true, content: {} },
      { type: "CONTACT", sortOrder: 5, visible: true, content: {} },
      { type: "SOCIAL", sortOrder: 6, visible: true, content: {} },
    ],
    listings: [
      {
        id: "demo-1",
        title: "Celebration cakes",
        description: "Made to order for birthdays, anniversaries and small gatherings.",
        category: "Custom cakes",
        priceDisplay: "From ₹750",
        imageAssetId: null,
        visible: true,
      },
      {
        id: "demo-2",
        title: "Fresh breads",
        description: "Soft milk bread, whole wheat loaves and weekend specials.",
        category: "Daily bake",
        priceDisplay: "From ₹80",
        imageAssetId: null,
        visible: true,
      },
      {
        id: "demo-3",
        title: "Tea-time boxes",
        description: "A shareable mix of cookies, rusks and savoury bites.",
        category: "Gifting",
        priceDisplay: "From ₹350",
        imageAssetId: null,
        visible: true,
      },
    ],
    publishedAt: new Date().toISOString(),
  });

  return <PresenceStorefront preview snapshot={snapshot} />;
}
