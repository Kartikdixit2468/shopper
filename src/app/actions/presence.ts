"use server";

import { Prisma, type MediaKind, type PageSectionType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ensurePresenceScaffold, requireMerchantStore } from "@/lib/merchant";
import {
  buildPresenceSnapshot,
  defaultSections,
  fontSets,
  getPresenceChecklist,
  normalizeIndianPhone,
  presenceInclude,
  slugifyStoreName,
  templateIds,
} from "@/lib/presence";
import { prisma } from "@/lib/prisma";
import { saveImageFile } from "@/lib/storage";

export type AutosaveState = { ok: boolean; message: string };

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null);

const basicsSchema = z.object({
  name: z.string().trim().min(2, "Enter your business name.").max(80),
  category: z.string().trim().min(2, "Choose a business category.").max(60),
  shortDescription: z
    .string()
    .trim()
    .max(300)
    .transform((value) => value || null),
  slug: z
    .string()
    .trim()
    .max(56)
    .transform((value) => slugifyStoreName(value)),
});

const contactSchema = z
  .object({
    phone: optionalText,
    whatsappNumber: optionalText,
    addressLine: optionalText,
    locality: z.string().trim().min(2, "Enter your locality.").max(80),
    city: z.string().trim().min(2, "Enter your city.").max(80),
    state: optionalText,
    postalCode: z
      .string()
      .trim()
      .refine((value) => !value || /^\d{6}$/.test(value), "Enter a valid 6-digit PIN code.")
      .transform((value) => value || null),
    mapUrl: z
      .string()
      .trim()
      .refine((value) => !value || /^https?:\/\//.test(value), "Use a full directions URL.")
      .transform((value) => value || null),
    openingHours: optionalText,
    instagram: z
      .string()
      .trim()
      .refine((value) => !value || /^https?:\/\//.test(value), "Use a full Instagram URL.")
      .transform((value) => value || null),
    facebook: z
      .string()
      .trim()
      .refine((value) => !value || /^https?:\/\//.test(value), "Use a full Facebook URL.")
      .transform((value) => value || null),
  })
  .superRefine((value, context) => {
    if (!value.phone && !value.whatsappNumber) {
      context.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Add a phone or WhatsApp number.",
      });
    }
    if (value.phone && !normalizeIndianPhone(value.phone)) {
      context.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Enter a valid Indian mobile number.",
      });
    }
    if (value.whatsappNumber && !normalizeIndianPhone(value.whatsappNumber)) {
      context.addIssue({
        code: "custom",
        path: ["whatsappNumber"],
        message: "Enter a valid WhatsApp number.",
      });
    }
  });

const designSchema = z.object({
  templateId: z.enum(templateIds),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  fontSet: z.enum(fontSets),
});

function formText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

async function resolveUniqueSlug(requested: string, name: string, storeId: string) {
  const base = requested || slugifyStoreName(name) || "my-business";
  for (let suffix = 1; suffix <= 99; suffix += 1) {
    const slug = suffix === 1 ? base : `${base.slice(0, 50)}-${suffix}`;
    const collision = await prisma.store.findFirst({
      where: { slug, id: { not: storeId } },
      select: { id: true },
    });
    if (!collision) return slug;
  }
  return `${base.slice(0, 38)}-${Date.now().toString(36)}`;
}

async function saveBasicsData(formData: FormData) {
  const { store } = await requireMerchantStore();
  const parsed = basicsSchema.safeParse({
    name: formText(formData, "name"),
    category: formText(formData, "category"),
    shortDescription: formText(formData, "shortDescription"),
    slug: formText(formData, "slug"),
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Check your business details.");

  const slug = await resolveUniqueSlug(parsed.data.slug, parsed.data.name, store.id);
  await prisma.store.update({
    where: { id: store.id },
    data: {
      name: parsed.data.name,
      category: parsed.data.category,
      shortDescription: parsed.data.shortDescription,
      slug,
      onboardingStep: "CONTACT",
    },
  });
  return slug;
}

export async function autosaveBasics(formData: FormData): Promise<AutosaveState> {
  try {
    await saveBasicsData(formData);
    return { ok: true, message: "Draft saved" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not save" };
  }
}

export async function continueFromBasics(formData: FormData) {
  try {
    await saveBasicsData(formData);
  } catch (error) {
    redirect(
      `/onboarding/setup?step=basics&error=${encodeURIComponent(error instanceof Error ? error.message : "Check your details")}`,
    );
  }
  redirect("/onboarding/setup?step=contact");
}

async function saveContactData(formData: FormData) {
  const { store } = await requireMerchantStore();
  const parsed = contactSchema.safeParse({
    phone: formText(formData, "phone"),
    whatsappNumber: formText(formData, "whatsappNumber"),
    addressLine: formText(formData, "addressLine"),
    locality: formText(formData, "locality"),
    city: formText(formData, "city"),
    state: formText(formData, "state"),
    postalCode: formText(formData, "postalCode"),
    mapUrl: formText(formData, "mapUrl"),
    openingHours: formText(formData, "openingHours"),
    instagram: formText(formData, "instagram"),
    facebook: formText(formData, "facebook"),
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Check your contact details.");

  const contactData = {
    phone: parsed.data.phone ? normalizeIndianPhone(parsed.data.phone) : null,
    whatsappNumber: parsed.data.whatsappNumber
      ? normalizeIndianPhone(parsed.data.whatsappNumber)
      : null,
    addressLine: parsed.data.addressLine,
    locality: parsed.data.locality,
    city: parsed.data.city,
    state: parsed.data.state,
    postalCode: parsed.data.postalCode,
    mapUrl: parsed.data.mapUrl,
    openingHours: parsed.data.openingHours
      ? { summary: parsed.data.openingHours }
      : Prisma.JsonNull,
    socials:
      parsed.data.instagram || parsed.data.facebook
        ? { instagram: parsed.data.instagram, facebook: parsed.data.facebook }
        : Prisma.JsonNull,
  };
  await prisma.$transaction([
    prisma.storeContact.upsert({
      where: { storeId: store.id },
      update: contactData,
      create: { storeId: store.id, ...contactData },
    }),
    prisma.store.update({ where: { id: store.id }, data: { onboardingStep: "BRANDING" } }),
  ]);
}

export async function autosaveContact(formData: FormData): Promise<AutosaveState> {
  try {
    await saveContactData(formData);
    return { ok: true, message: "Draft saved" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not save" };
  }
}

export async function continueFromContact(formData: FormData) {
  try {
    await saveContactData(formData);
  } catch (error) {
    redirect(
      `/onboarding/setup?step=contact&error=${encodeURIComponent(error instanceof Error ? error.message : "Check your details")}`,
    );
  }
  redirect("/onboarding/setup?step=design");
}

async function createMedia(storeId: string, file: File, kind: MediaKind, altText: string) {
  const saved = await saveImageFile(file);
  return prisma.mediaAsset.create({
    data: { storeId, kind, altText, ...saved },
  });
}

export async function saveDesign(formData: FormData) {
  const { store } = await requireMerchantStore();
  const parsed = designSchema.safeParse({
    templateId: formText(formData, "templateId"),
    primaryColor: formText(formData, "primaryColor"),
    accentColor: formText(formData, "accentColor"),
    fontSet: formText(formData, "fontSet"),
  });
  if (!parsed.success) redirect("/onboarding/setup?step=design&error=Choose+a+valid+design.");

  try {
    const logoFile = formData.get("logo");
    const coverFile = formData.get("cover");
    const logo =
      logoFile instanceof File && logoFile.size
        ? await createMedia(store.id, logoFile, "LOGO", `${store.name ?? "Business"} logo`)
        : null;
    const cover =
      coverFile instanceof File && coverFile.size
        ? await createMedia(store.id, coverFile, "COVER", `${store.name ?? "Business"} cover`)
        : null;

    await prisma.$transaction([
      prisma.themeConfig.upsert({
        where: { storeId: store.id },
        update: {
          ...parsed.data,
          ...(logo ? { logoAssetId: logo.id } : {}),
          ...(cover ? { coverAssetId: cover.id } : {}),
        },
        create: {
          storeId: store.id,
          ...parsed.data,
          logoAssetId: logo?.id,
          coverAssetId: cover?.id,
        },
      }),
      prisma.pageSection.createMany({
        data: defaultSections.map((section) => ({ storeId: store.id, ...section })),
        skipDuplicates: true,
      }),
      prisma.store.update({ where: { id: store.id }, data: { onboardingStep: "REVIEW" } }),
    ]);
  } catch (error) {
    redirect(
      `/onboarding/setup?step=design&error=${encodeURIComponent(error instanceof Error ? error.message : "Could not save design")}`,
    );
  }

  redirect("/onboarding/setup?step=review");
}

export async function autosaveSection(formData: FormData): Promise<AutosaveState> {
  try {
    const { store } = await requireMerchantStore();
    const type = z
      .enum(["HERO", "ABOUT", "GALLERY", "LISTINGS", "HOURS", "LOCATION", "CONTACT", "SOCIAL"])
      .parse(formText(formData, "type"));
    const current = store.sections.find((section) => section.type === type);
    if (!current) throw new Error("Section not found.");

    const existing =
      current.structuredContent &&
      typeof current.structuredContent === "object" &&
      !Array.isArray(current.structuredContent)
        ? (current.structuredContent as Prisma.JsonObject)
        : {};
    const content: Prisma.InputJsonObject = {
      ...existing,
      ...(type === "ABOUT"
        ? {
            heading: formText(formData, "heading").slice(0, 80),
            body: formText(formData, "body").slice(0, 1200),
          }
        : {}),
    };

    await prisma.pageSection.update({
      where: { id: current.id },
      data: { visible: formData.get("visible") === "on", structuredContent: content },
    });
    revalidatePath("/dashboard/website");
    revalidatePath("/dashboard/preview");
    return { ok: true, message: "Section saved" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not save" };
  }
}

export async function saveSection(formData: FormData) {
  await autosaveSection(formData);
  revalidatePath("/dashboard/website");
}

export async function saveBranding(formData: FormData) {
  const { store } = await requireMerchantStore();
  const parsed = designSchema.safeParse({
    templateId: formText(formData, "templateId"),
    primaryColor: formText(formData, "primaryColor"),
    accentColor: formText(formData, "accentColor"),
    fontSet: formText(formData, "fontSet"),
  });
  if (!parsed.success) redirect("/dashboard/website?error=Choose+a+valid+design.");

  try {
    const logoFile = formData.get("logo");
    const coverFile = formData.get("cover");
    const logo =
      logoFile instanceof File && logoFile.size
        ? await createMedia(store.id, logoFile, "LOGO", `${store.name ?? "Business"} logo`)
        : null;
    const cover =
      coverFile instanceof File && coverFile.size
        ? await createMedia(store.id, coverFile, "COVER", `${store.name ?? "Business"} cover`)
        : null;
    await prisma.themeConfig.upsert({
      where: { storeId: store.id },
      update: {
        ...parsed.data,
        ...(logo ? { logoAssetId: logo.id } : {}),
        ...(cover ? { coverAssetId: cover.id } : {}),
      },
      create: {
        storeId: store.id,
        ...parsed.data,
        logoAssetId: logo?.id,
        coverAssetId: cover?.id,
      },
    });
  } catch (error) {
    redirect(
      `/dashboard/website?error=${encodeURIComponent(error instanceof Error ? error.message : "Could not save design")}`,
    );
  }
  revalidatePath("/dashboard/website");
  revalidatePath("/dashboard/preview");
  redirect("/dashboard/website?saved=design");
}

export async function moveSection(formData: FormData) {
  const { store } = await requireMerchantStore();
  const type = formText(formData, "type") as PageSectionType;
  const direction = formText(formData, "direction") === "up" ? -1 : 1;
  const sections = [...store.sections].sort((a, b) => a.sortOrder - b.sortOrder);
  const index = sections.findIndex((section) => section.type === type);
  const swapIndex = index + direction;
  if (index < 0 || swapIndex < 0 || swapIndex >= sections.length) return;

  await prisma.$transaction([
    prisma.pageSection.update({
      where: { id: sections[index].id },
      data: { sortOrder: sections[swapIndex].sortOrder },
    }),
    prisma.pageSection.update({
      where: { id: sections[swapIndex].id },
      data: { sortOrder: sections[index].sortOrder },
    }),
  ]);
  revalidatePath("/dashboard/website");
  revalidatePath("/dashboard/preview");
}

export async function uploadGalleryImage(formData: FormData) {
  const { store } = await requireMerchantStore();
  const file = formData.get("image");
  if (!(file instanceof File) || !file.size) redirect("/dashboard/website?error=Choose+an+image.");
  try {
    const asset = await createMedia(
      store.id,
      file,
      "GALLERY",
      formText(formData, "altText") || "Store photo",
    );
    const section = store.sections.find((candidate) => candidate.type === "GALLERY");
    if (!section) throw new Error("Gallery section not found.");
    const value = section.structuredContent as { assetIds?: unknown };
    const assetIds = Array.isArray(value.assetIds)
      ? value.assetIds.filter((id): id is string => typeof id === "string")
      : [];
    await prisma.pageSection.update({
      where: { id: section.id },
      data: { structuredContent: { assetIds: [...assetIds, asset.id].slice(-8) } },
    });
  } catch (error) {
    redirect(
      `/dashboard/website?error=${encodeURIComponent(error instanceof Error ? error.message : "Upload failed")}`,
    );
  }
  revalidatePath("/dashboard/website");
  revalidatePath("/dashboard/preview");
  redirect("/dashboard/website?saved=gallery");
}

const listingSchema = z.object({
  title: z.string().trim().min(2).max(100),
  description: z
    .string()
    .trim()
    .max(500)
    .transform((value) => value || null),
  category: optionalText,
  priceDisplay: z
    .string()
    .trim()
    .max(40)
    .transform((value) => value || null),
});

export async function createListing(formData: FormData) {
  const { store } = await requireMerchantStore();
  const parsed = listingSchema.safeParse({
    title: formText(formData, "title"),
    description: formText(formData, "description"),
    category: formText(formData, "category"),
    priceDisplay: formText(formData, "priceDisplay"),
  });
  if (!parsed.success) redirect("/dashboard/listings?error=Check+the+listing+details.");

  try {
    const file = formData.get("image");
    const image =
      file instanceof File && file.size
        ? await createMedia(store.id, file, "LISTING", parsed.data.title)
        : null;
    await prisma.listing.create({
      data: {
        storeId: store.id,
        ...parsed.data,
        imageAssetId: image?.id,
        sortOrder: Math.max(-1, ...store.listings.map((listing) => listing.sortOrder)) + 1,
      },
    });
  } catch (error) {
    redirect(
      `/dashboard/listings?error=${encodeURIComponent(error instanceof Error ? error.message : "Could not add listing")}`,
    );
  }
  revalidatePath("/dashboard/listings");
  revalidatePath("/dashboard/preview");
  redirect("/dashboard/listings?created=1");
}

export async function toggleListing(formData: FormData) {
  const { store } = await requireMerchantStore();
  const id = formText(formData, "id");
  const listing = await prisma.listing.findFirst({ where: { id, storeId: store.id } });
  if (!listing) return;
  await prisma.listing.update({ where: { id }, data: { visible: !listing.visible } });
  revalidatePath("/dashboard/listings");
  revalidatePath("/dashboard/preview");
}

export async function deleteListing(formData: FormData) {
  const { store } = await requireMerchantStore();
  const id = formText(formData, "id");
  await prisma.listing.deleteMany({ where: { id, storeId: store.id } });
  revalidatePath("/dashboard/listings");
  revalidatePath("/dashboard/preview");
}

export async function publishPresence() {
  const { store: ownedStore } = await requireMerchantStore();
  let store = ownedStore;
  if (!store.theme || store.sections.length === 0) {
    await ensurePresenceScaffold(store.id);
    store = await prisma.store.findUniqueOrThrow({
      where: { id: ownedStore.id },
      include: presenceInclude,
    });
  }
  const checklist = getPresenceChecklist(store);
  if (!checklist.complete)
    redirect("/onboarding/setup?step=review&error=Complete+the+required+details+first.");

  const latest = await prisma.storeRevision.aggregate({
    where: { storeId: store.id },
    _max: { revisionNo: true },
  });
  const publishedAt = new Date();
  const snapshot = buildPresenceSnapshot(store, publishedAt);
  await prisma.$transaction([
    prisma.storeRevision.create({
      data: {
        storeId: store.id,
        revisionNo: (latest._max.revisionNo ?? 0) + 1,
        snapshot: snapshot as Prisma.InputJsonValue,
        publishedAt,
      },
    }),
    prisma.store.update({
      where: { id: store.id },
      data: { status: "PUBLISHED", publishedAt, onboardingStep: "COMPLETE" },
    }),
  ]);

  revalidatePath(`/s/${store.slug}`);
  revalidatePath("/dashboard");
  redirect(`/dashboard?published=1`);
}

export async function saveSettings(formData: FormData) {
  try {
    await saveContactData(formData);
  } catch (error) {
    redirect(
      `/dashboard/settings?error=${encodeURIComponent(error instanceof Error ? error.message : "Check your details")}`,
    );
  }
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/preview");
  redirect("/dashboard/settings?saved=1");
}

export async function upgradeToLocalStore() {
  const { store } = await requireMerchantStore();
  if (store.type === "PRESENCE") {
    await prisma.store.update({ where: { id: store.id }, data: { type: "LOCAL_STORE" } });
  }
  revalidatePath("/dashboard");
  redirect("/dashboard?upgraded=1");
}
