import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getRuntimeDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) return undefined;

  const url = new URL(value);
  // Keep the transaction pooler conservative for Next.js processes. These
  // defaults can still be overridden explicitly in DATABASE_URL.
  if (url.port === "6543") {
    if (!url.searchParams.has("pgbouncer")) url.searchParams.set("pgbouncer", "true");
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", process.env.NODE_ENV === "development" ? "5" : "1");
    }
    if (!url.searchParams.has("connect_timeout")) url.searchParams.set("connect_timeout", "15");
    if (!url.searchParams.has("pool_timeout")) url.searchParams.set("pool_timeout", "15");
  }
  if (!url.searchParams.has("sslmode")) url.searchParams.set("sslmode", "require");
  return url.toString();
}

const runtimeDatabaseUrl = getRuntimeDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(runtimeDatabaseUrl ? { datasources: { db: { url: runtimeDatabaseUrl } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
