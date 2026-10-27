export const siteConfig = {
  name: process.env.NEXT_PUBLIC_PRODUCT_NAME?.trim() || "Your Storefront",
  url: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",
  description:
    "A simple way for independent Indian businesses to create a polished online presence and grow into local ordering.",
} as const;

export function isSupabaseAuthConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim(),
  );
}

export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) {
    throw new Error("Supabase Auth environment variables are not configured.");
  }

  return { url, publishableKey };
}
