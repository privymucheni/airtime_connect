"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TransactionType, TransactionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getCompanyDashboardData() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "COMPANY") {
        throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            transactions: {
                orderBy: { createdAt: "desc" },
                take: 5,
            },
        },
    });

    if (!user) throw new Error("User not found");

    // Sum of debit transactions in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyVolume = await prisma.transaction.aggregate({
        where: {
            userId,
            type: TransactionType.DEBIT,
            createdAt: { gte: thirtyDaysAgo },
        },
        _sum: {
            amount: true,
        },
    });

    // Total unique recipients
    const totalRecipients = await prisma.recipient.count({
        where: {
            transaction: {
                userId,
            },
        },
    });

    return {
        user: {
            name: user.name,
            balance: user.balance,
            companyName: user.companyName,
        },
        transactions: user.transactions,
        monthlyVolume: monthlyVolume._sum.amount || 0,
        totalRecipients,
    };
}

export async function distributeAirtime(data: { recipients: any[] }) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    const totalAmount = data.recipients.reduce((sum, r) => sum + r.amount, 0);

    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: { id: userId },
        });

        if (!user || user.balance < totalAmount) {
            throw new Error("Insufficient balance");
        }

        // Deduct balance
        await tx.user.update({
            where: { id: userId },
            data: { balance: { decrement: totalAmount } },
        });

        // Create transaction
        const transaction = await tx.transaction.create({
            data: {
                userId,
                amount: totalAmount,
                type: TransactionType.DEBIT,
                status: TransactionStatus.COMPLETED,
                recipientsCount: data.recipients.length,
                recipients: {
                    create: data.recipients.map((r) => ({
                        name: r.name,
                        phoneNumber: r.phoneNumber,
                        amount: r.amount,
                        status: "success",
                    })),
                },
            },
        });

        revalidatePath("/company");
        revalidatePath("/company/history");
        return { success: true, transactionId: transaction.id };
    });
}

export async function topUpWallet(amount: number) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const userId = (session.user as any).id;

    const transaction = await prisma.transaction.create({
        data: {
            userId,
            amount,
            type: TransactionType.CREDIT,
            status: TransactionStatus.COMPLETED,
            recipientsCount: 0,
        },
    });

    await prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: amount } },
    });

    revalidatePath("/company");
    return { success: true, transactionId: transaction.id };
}

export async function getCompanyTransactions() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const userId = (session.user as any).id;

    return await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
}
