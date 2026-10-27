import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// A long-running local dev server is better served by Supabase's session/direct
// connection. Production keeps DATABASE_URL so a serverless deployment can use
// the transaction pooler without changing application code.
const runtimeDatabaseUrl =
  process.env.NODE_ENV === "development"
    ? (process.env.DIRECT_URL ?? process.env.DATABASE_URL)
    : process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(runtimeDatabaseUrl ? { datasources: { db: { url: runtimeDatabaseUrl } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
