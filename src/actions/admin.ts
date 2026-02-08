"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getAdminDashboardData() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const companiesCount = await prisma.user.count({
        where: { role: UserRole.COMPANY },
    });

    const totalAirtimeDistributed = await prisma.transaction.aggregate({
        where: { type: "DEBIT" },
        _sum: { amount: true },
    });

    const recentCompanies = await prisma.user.findMany({
        where: { role: UserRole.COMPANY },
        include: { wallet: true },
        orderBy: { createdAt: "desc" },
        take: 5,
    });

    const activePromoCodes = await prisma.promoCode.count({
        where: { isActive: true },
    });

    return {
        stats: {
            companies: companiesCount,
            volume: totalAirtimeDistributed._sum.amount || 0,
            promos: activePromoCodes,
        },
        recentCompanies,
    };
}

export async function getAllCompanies() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    return await prisma.user.findMany({
        where: { role: UserRole.COMPANY },
        include: { wallet: true },
        orderBy: { createdAt: "desc" },
    });
}

export async function updateUserStatus(userId: string, status: UserStatus) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    await prisma.user.update({
        where: { id: userId },
        data: { status },
    });

    revalidatePath("/admin/companies");
    return { success: true };
}

export async function getSystemLogs() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    return await prisma.systemLog.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: { name: true, companyName: true },
            },
        },
    });
}

export async function createPromoCode(data: any) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const promo = await prisma.promoCode.create({
        data: {
            code: data.code.toUpperCase(),
            discountPercent: parseFloat(data.discountPercent),
            expiryDate: new Date(data.expiryDate),
            isActive: true,
        },
    });

    revalidatePath("/admin/promo-codes");
    return { success: true, promo };
}

export async function getPromoCodes() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    return await prisma.promoCode.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function deletePromoCode(id: string) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    await prisma.promoCode.delete({
        where: { id },
    });

    revalidatePath("/admin/promo-codes");
    return { success: true };
}

export async function togglePromoCodeStatus(id: string, isActive: boolean) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    await prisma.promoCode.update({
        where: { id },
        data: { isActive },
    });

    revalidatePath("/admin/promo-codes");
    return { success: true };
}
