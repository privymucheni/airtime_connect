import { prisma } from "@/lib/prisma";

export async function createLog(data: {
    type: 'AUTH' | 'DISTRIBUTION' | 'WALLET' | 'SYSTEM' | 'ADMIN';
    message: string;
    userId?: string;
}) {
    try {
        return await prisma.systemLog.create({
            data: {
                type: data.type,
                message: data.message,
                userId: data.userId,
            },
        });
    } catch (error) {
        console.error("Failed to create system log:", error);
    }
}
