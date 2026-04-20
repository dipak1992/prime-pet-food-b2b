import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var __prisma: PrismaClient | undefined;
  var __pgPool: Pool | undefined;
}

const connectionString =
  process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "No database connection string found. Set POSTGRES_PRISMA_URL or DATABASE_URL."
  
  throw new Error(
    "No database connection string found. Set POSTGRES_PRISMA_URL or DATABASE_URL."
  );
}

const pool = global.__pgPool ?? new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  global.__prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
  global.__pgPool = pool;
}
