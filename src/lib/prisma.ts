import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

// Always cache the Prisma client to reuse connections
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
} else {
    // In production, explicitly cache to prevent connection pool exhaustion
    (global as any).prisma = prisma;
}
