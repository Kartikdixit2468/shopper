import { Prisma, type PageSectionType } from "@prisma/client";
import { z } from "zod";

export const templateIds = ["canvas", "heritage", "studio"] as const;
export const fontSets = ["modern", "friendly", "editorial"] as const;

export const presenceInclude = Prisma.validator<Prisma.StoreInclude>()({
  contact: true,
  theme: true,
  sections: { orderBy: { sortOrder: "asc" } },
  listings: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
  mediaAssets: true,
});

export type PresenceStore = Prisma.StoreGetPayload<{ include: typeof presenceInclude }>;

const nullableText = z.string().nullable();
const sectionContentSchema = z.record(z.string(), z.unknown());

export const presenceSnapshotSchema = z.object({
  version: z.literal(1),
  store: z.object({
    name: z.string(),
    slug: z.string(),
    category: z.string(),
    shortDescription: nullableText,
  }),
  contact: z.object({
    phone: nullableText,
    whatsappNumber: nullableText,
    addressLine: nullableText,
    locality: z.string(),
    city: z.string(),
    state: nullableText,
    postalCode: nullableText,
    mapUrl: nullableText,
    openingHours: z.object({ summary: z.string() }).nullable(),
    socials: z.object({ instagram: nullableText, facebook: nullableText }).nullable(),
  }),
  theme: z.object({
    templateId: z.enum(templateIds),
    primaryColor: z.string(),
    accentColor: z.string(),
    fontSet: z.enum(fontSets),
    logoAssetId: nullableText,
    coverAssetId: nullableText,
  }),
  sections: z.array(
    z.object({
      type: z.enum([
        "HERO",
        "ABOUT",
        "GALLERY",
        "LISTINGS",
        "HOURS",
        "LOCATION",
        "CONTACT",
        "SOCIAL",
      ]),
      sortOrder: z.number().int(),
      visible: z.boolean(),
      content: sectionContentSchema,
    }),
  ),
  listings: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: nullableText,
      category: nullableText,
      priceDisplay: nullableText,
      imageAssetId: nullableText,
      visible: z.boolean(),
    }),
  ),
  publishedAt: z.string().datetime(),
});

export type PresenceSnapshot = z.infer<typeof presenceSnapshotSchema>;

export const defaultSections: Array<{
  type: PageSectionType;
  sortOrder: number;
  visible: boolean;
  structuredContent: Prisma.InputJsonObject;
}> = [
  { type: "HERO", sortOrder: 0, visible: true, structuredContent: {} },
  {
    type: "ABOUT",
    sortOrder: 1,
    visible: true,
    structuredContent: { heading: "A little about us", body: "" },
  },
  {
    type: "GALLERY",
    sortOrder: 2,
    visible: true,
    structuredContent: { assetIds: [] },
  },
  { type: "LISTINGS", sortOrder: 3, visible: true, structuredContent: {} },
  { type: "HOURS", sortOrder: 4, visible: true, structuredContent: {} },
  { type: "LOCATION", sortOrder: 5, visible: true, structuredContent: {} },
  { type: "CONTACT", sortOrder: 6, visible: true, structuredContent: {} },
  { type: "SOCIAL", sortOrder: 7, visible: true, structuredContent: {} },
];

export function slugifyStoreName(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function normalizeIndianPhone(value: string) {
  const compact = value.replace(/[\s()-]/g, "");
  if (/^\+91[6-9]\d{9}$/.test(compact)) return compact;
  if (/^[6-9]\d{9}$/.test(compact)) return `+91${compact}`;
  return null;
}

function asObject(value: Prisma.JsonValue | null | undefined) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function buildPresenceSnapshot(store: PresenceStore, publishedAt = new Date()) {
  if (!store.name || !store.slug || !store.category || !store.contact || !store.theme) {
    throw new Error("Store setup is incomplete.");
  }

  const openingHours = asObject(store.contact.openingHours);
  const socials = asObject(store.contact.socials);

  return presenceSnapshotSchema.parse({
    version: 1,
    store: {
      name: store.name,
      slug: store.slug,
      category: store.category,
      shortDescription: store.shortDescription,
    },
    contact: {
      phone: store.contact.phone,
      whatsappNumber: store.contact.whatsappNumber,
      addressLine: store.contact.addressLine,
      locality: store.contact.locality,
      city: store.contact.city,
      state: store.contact.state,
      postalCode: store.contact.postalCode,
      mapUrl: store.contact.mapUrl,
      openingHours: nullableString(openingHours.summary)
        ? { summary: nullableString(openingHours.summary) }
        : null,
      socials:
        nullableString(socials.instagram) || nullableString(socials.facebook)
          ? {
              instagram: nullableString(socials.instagram),
              facebook: nullableString(socials.facebook),
            }
          : null,
    },
    theme: {
      templateId: store.theme.templateId,
      primaryColor: store.theme.primaryColor,
      accentColor: store.theme.accentColor,
      fontSet: store.theme.fontSet,
      logoAssetId: store.theme.logoAssetId,
      coverAssetId: store.theme.coverAssetId,
    },
    sections: store.sections.map((section) => ({
      type: section.type,
      sortOrder: section.sortOrder,
      visible: section.visible,
      content: asObject(section.structuredContent),
    })),
    listings: store.listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      priceDisplay: listing.priceDisplay,
      imageAssetId: listing.imageAssetId,
      visible: listing.visible,
    })),
    publishedAt: publishedAt.toISOString(),
  });
}

export function getPresenceChecklist(store: PresenceStore) {
  const checks = [
    { label: "Business name and category", complete: Boolean(store.name && store.category) },
    { label: "Shareable store address", complete: Boolean(store.slug) },
    {
      label: "City and locality",
      complete: Boolean(store.contact?.city && store.contact.locality),
    },
    {
      label: "Phone or WhatsApp contact",
      complete: Boolean(store.contact?.phone || store.contact?.whatsappNumber),
    },
    { label: "Store design", complete: Boolean(store.theme) },
  ];

  return { checks, complete: checks.every((check) => check.complete) };
}

export function snapshotContainsAsset(snapshot: PresenceSnapshot, assetId: string) {
  if (snapshot.theme.logoAssetId === assetId || snapshot.theme.coverAssetId === assetId)
    return true;
  if (snapshot.listings.some((listing) => listing.imageAssetId === assetId)) return true;
  return snapshot.sections.some((section) => {
    const assetIds = section.content.assetIds;
    return Array.isArray(assetIds) && assetIds.includes(assetId);
  });
}
