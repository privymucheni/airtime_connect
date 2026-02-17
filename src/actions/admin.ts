"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createLog } from "@/lib/logger";

export async function getAdminDashboardData() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const companiesCount = await prisma.user.count({
        where: { role: UserRole.COMPANY },
    });

    const totalAirtimeDistributed = await prisma.transaction.aggregate({
        where: { type: "CREDIT" },
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

export async function getCompanies(page: number = 1, pageSize: number = 10, search: string = "", status: UserStatus | 'ALL' = 'ALL') {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const where: any = {
        role: UserRole.COMPANY,
    };

    if (status !== 'ALL') {
        where.status = status;
    }

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { companyName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }

    const [companies, total] = await Promise.all([
        prisma.user.findMany({
            where,
            include: { wallet: true },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.user.count({ where })
    ]);

    return {
        companies,
        total,
        totalPages: Math.ceil(total / pageSize)
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

    const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, companyName: true }
    });

    await prisma.user.update({
        where: { id: userId },
        data: { status },
    });

    await createLog({
        type: 'ADMIN',
        message: `Updated status of ${targetUser?.companyName || targetUser?.name || userId} to ${status}`,
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

    await createLog({
        type: 'ADMIN',
        message: `Created new promo code: ${data.code.toUpperCase()}`,
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

    const promo = await prisma.promoCode.findUnique({ where: { id } });
    await prisma.promoCode.delete({
        where: { id },
    });

    await createLog({
        type: 'ADMIN',
        message: `Deleted promo code: ${promo?.code || id}`,
    });

    revalidatePath("/admin/promo-codes");
    return { success: true };
}

export async function togglePromoCodeStatus(id: string, isActive: boolean) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const promo = await prisma.promoCode.update({
        where: { id },
        data: { isActive },
    });

    await createLog({
        type: 'ADMIN',
        message: `${isActive ? 'Activated' : 'Deactivated'} promo code: ${promo.code}`,
    });

    revalidatePath("/admin/promo-codes");
    return { success: true };
}

export async function getRevenueAnalytics() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    // Get last 6 months dates
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const transactions = await prisma.transaction.findMany({
        where: {
            createdAt: { gte: sixMonthsAgo },
            status: "COMPLETED"
        },
        orderBy: { createdAt: "asc" }
    });

    const monthlyData: { [key: string]: any } = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize months
    for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = months[d.getMonth()];
        monthlyData[monthName] = { month: monthName, revenue: 0, airtime: 0, margin: 0, count: 0 };
    }

    transactions.forEach(tx => {
        const monthName = months[new Date(tx.createdAt).getMonth()];
        if (monthlyData[monthName]) {
            if (tx.type === "CREDIT") {
                monthlyData[monthName].airtime += tx.amount;
                // Assuming a fixed platform margin of 1.5% for now as there's no margin field in schema
                const estimatedMargin = tx.amount * 0.015;
                monthlyData[monthName].margin += estimatedMargin;
                monthlyData[monthName].revenue += estimatedMargin;
            }
            monthlyData[monthName].count += 1;
        }
    });

    return {
        chartData: Object.values(monthlyData).reverse(),
        totalVolume: transactions.filter(t => t.type === "CREDIT").reduce((acc, curr) => acc + curr.amount, 0),
        totalProfit: transactions.filter(t => t.type === "CREDIT").reduce((acc, curr) => acc + (curr.amount * 0.015), 0),
        avgMargin: 1.5 // Fixed for this implementation
    };
}
