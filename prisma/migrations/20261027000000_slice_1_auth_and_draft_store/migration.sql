-- CreateEnum
CREATE TYPE "StoreType" AS ENUM ('PRESENCE', 'LOCAL_STORE');

-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "OnboardingStep" AS ENUM ('BASICS', 'CONTACT', 'BRANDING', 'CATALOG', 'REVIEW', 'COMPLETE');

-- Supabase Auth owns identities and sessions in its managed `auth` schema.
-- This portable public profile mirrors only the fields the application needs.
CREATE TABLE "Profile" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "ownerUserId" UUID NOT NULL,
    "type" "StoreType" NOT NULL,
    "status" "StoreStatus" NOT NULL DEFAULT 'DRAFT',
    "onboardingStep" "OnboardingStep" NOT NULL DEFAULT 'BASICS',
    "name" TEXT,
    "slug" TEXT,
    "category" TEXT,
    "shortDescription" VARCHAR(300),
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "locale" TEXT NOT NULL DEFAULT 'en-IN',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");
CREATE UNIQUE INDEX "Store_ownerUserId_key" ON "Store"("ownerUserId");
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");
CREATE INDEX "Store_ownerUserId_status_idx" ON "Store"("ownerUserId", "status");
CREATE INDEX "Store_slug_status_idx" ON "Store"("slug", "status");

ALTER TABLE "Store" ADD CONSTRAINT "Store_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- The application uses a privileged server-side PostgreSQL connection through
-- Prisma. RLS with no public policies prevents accidental Data API access.
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Store" ENABLE ROW LEVEL SECURITY;
