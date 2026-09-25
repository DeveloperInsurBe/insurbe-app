import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

// Share one client per process (also in production) so the connections warmed up in
// src/instrumentation.ts are the same ones the pages use.
globalForPrisma.prisma = prisma;
