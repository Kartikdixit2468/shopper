CREATE TYPE "PageSectionType" AS ENUM ('HERO', 'ABOUT', 'GALLERY', 'LISTINGS', 'HOURS', 'LOCATION', 'CONTACT', 'SOCIAL');
CREATE TYPE "MediaKind" AS ENUM ('LOGO', 'COVER', 'GALLERY', 'LISTING');

CREATE TABLE "StoreContact" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "phone" TEXT,
    "whatsappNumber" TEXT,
    "addressLine" TEXT,
    "locality" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postalCode" TEXT,
    "mapUrl" TEXT,
    "openingHours" JSONB,
    "socials" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StoreContact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ThemeConfig" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL DEFAULT 'canvas',
    "primaryColor" TEXT NOT NULL DEFAULT '#167D6D',
    "accentColor" TEXT NOT NULL DEFAULT '#F4AD82',
    "fontSet" TEXT NOT NULL DEFAULT 'modern',
    "logoAssetId" TEXT,
    "coverAssetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ThemeConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PageSection" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "type" "PageSectionType" NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "structuredContent" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PageSection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" VARCHAR(500),
    "category" TEXT,
    "priceDisplay" TEXT,
    "imageAssetId" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoreRevision" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "revisionNo" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoreRevision_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StoreContact_storeId_key" ON "StoreContact"("storeId");
CREATE UNIQUE INDEX "ThemeConfig_storeId_key" ON "ThemeConfig"("storeId");
CREATE UNIQUE INDEX "PageSection_storeId_type_key" ON "PageSection"("storeId", "type");
CREATE INDEX "PageSection_storeId_sortOrder_idx" ON "PageSection"("storeId", "sortOrder");
CREATE INDEX "Listing_storeId_visible_sortOrder_idx" ON "Listing"("storeId", "visible", "sortOrder");
CREATE UNIQUE INDEX "MediaAsset_storageKey_key" ON "MediaAsset"("storageKey");
CREATE INDEX "MediaAsset_storeId_kind_idx" ON "MediaAsset"("storeId", "kind");
CREATE UNIQUE INDEX "StoreRevision_storeId_revisionNo_key" ON "StoreRevision"("storeId", "revisionNo");
CREATE INDEX "StoreRevision_storeId_publishedAt_idx" ON "StoreRevision"("storeId", "publishedAt");

ALTER TABLE "StoreContact" ADD CONSTRAINT "StoreContact_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ThemeConfig" ADD CONSTRAINT "ThemeConfig_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PageSection" ADD CONSTRAINT "PageSection_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoreRevision" ADD CONSTRAINT "StoreRevision_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StoreContact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ThemeConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PageSection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Listing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MediaAsset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StoreRevision" ENABLE ROW LEVEL SECURITY;
