export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { prisma } = await import("@/lib/prisma");
  // Start opening the pooled connection while Next.js boots, before the first
  // merchant reaches an authenticated server action.
  void prisma.$connect().catch((error: unknown) => {
    console.warn("Database warm-up was delayed; Prisma will retry on the first query.", error);
  });
}
