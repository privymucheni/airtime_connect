"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TransactionType, TransactionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createLog } from "@/lib/logger";
import { sendRecipientNotifications } from "@/lib/twilio";

function generateTransactionRef() {
    const timestamp = new Date().getTime().toString().substring(1); // Remove first digit for length control
    const random = Math.floor(100 + Math.random() * 900).toString();
    return `T${timestamp}${random}`;
}

function formatPhoneNumber(phoneNumber: string): string {
    // Remove any spaces, dashes, or parentheses
    let cleaned = phoneNumber.replace(/[\s\-()]/g, '');
    
    // Add "+" prefix if not present
    if (!cleaned.startsWith('+')) {
        cleaned = '+' + cleaned;
    }
    
    return cleaned;
}

export async function getCompanyDashboardData() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "COMPANY") {
        throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            wallet: true,
            transactions: {
                orderBy: { createdAt: "desc" },
                take: 10,
                include: { recipients: true },
            },
        },
    });

    if (!user) throw new Error("User not found");

    let wallet = user.wallet;
    if (!wallet) {
        wallet = await prisma.wallet.create({
            data: { userId, balance: 0 }
        });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Trend Data (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const trendTransactions = await prisma.transaction.findMany({
        where: {
            userId,
            type: TransactionType.DEBIT,
            createdAt: { gte: sevenDaysAgo },
        },
        select: {
            amount: true,
            createdAt: true,
        },
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const trendMap = new Map();
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        trendMap.set(days[d.getDay()], 0);
    }

    trendTransactions.forEach(tx => {
        const day = days[new Date(tx.createdAt).getDay()];
        if (trendMap.has(day)) {
            trendMap.set(day, trendMap.get(day) + tx.amount);
        }
    });

    const trends = Array.from(trendMap.entries())
        .map(([name, amount]) => ({ name, amount }))
        .reverse();

    // Stats
    const stats = await prisma.transaction.groupBy({
        by: ['type'],
        where: { userId },
        _sum: { amount: true },
        _count: { id: true },
        _avg: { amount: true },
    });

    const debitStats = stats.find(s => s.type === TransactionType.DEBIT);
    const creditStats = stats.find(s => s.type === TransactionType.CREDIT);

    const totalRecipients = await prisma.recipient.count({
        where: { transaction: { userId } },
    });

    return {
        user: {
            name: user.name,
            balance: wallet.balance,
            companyName: user.companyName,
        },
        transactions: user.transactions,
        trends,
        metrics: {
            monthlyVolume: debitStats?._sum.amount || 0,
            totalRecipients,
            avgDistribution: debitStats?._avg.amount || 0,
            totalReloads: creditStats?._sum.amount || 0,
            distributionCount: debitStats?._count.id || 0,
        }
    };
}

export async function distributeAirtime(data: { recipients: any[] }) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    const status = (session.user as any).status;

    if (status === "SUSPENDED") {
        throw new Error("Your account is suspended. Access denied.");
    }

    if (data.recipients.some(r => r.amount <= 0)) {
        throw new Error("Invalid Amount: All recipient amounts must be greater than zero");
    }

    // Format phone numbers - ensure all have "+" prefix
    const formattedRecipients = data.recipients.map(r => ({
        ...r,
        phoneNumber: formatPhoneNumber(r.phoneNumber)
    }));

    const totalAmount = formattedRecipients.reduce((sum, r) => sum + r.amount, 0);

    const result = await prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.findUnique({
            where: { userId },
        });

        if (!wallet || wallet.balance < totalAmount) {
            throw new Error("Insufficient balance");
        }

        // Deduct balance from Wallet
        await tx.wallet.update({
            where: { userId },
            data: { balance: { decrement: totalAmount } },
        });

        // Create transaction first
        const transaction = await tx.transaction.create({
            data: {
                id: generateTransactionRef(),
                userId,
                amount: totalAmount,
                type: TransactionType.DEBIT,
                status: TransactionStatus.COMPLETED,
                recipientsCount: formattedRecipients.length,
                paymentMethod: "Wallet Balance",
            },
        });

        // Use createMany for mass recipients (much faster than nested create)
        await tx.recipient.createMany({
            data: formattedRecipients.map((r) => ({
                transactionId: transaction.id,
                name: r.name,
                phoneNumber: r.phoneNumber,
                amount: r.amount,
                status: "success",
            })),
        });

        return { success: true, transactionId: transaction.id };
    }, {
        maxWait: 10000,
        timeout: 30000,
    });

    await createLog({
        type: 'DISTRIBUTION',
        message: `Distributed $${totalAmount} to ${formattedRecipients.length} recipients`,
        userId
    });

    // Send individual SMS to each recipient with their specific amount
    const userWithCompany = await prisma.user.findUnique({ where: { id: userId } });
    if (userWithCompany) {
        const companyName = userWithCompany.companyName || userWithCompany.name || "Unknown Company";
        
        // Send SMS notifications asynchronously (don't block the response)
        sendRecipientNotifications(formattedRecipients, companyName, result.transactionId)
            .then(() => {
                console.log(`✓ SMS notifications sent for transaction ${result.transactionId}`);
                createLog({
                    type: 'SMS',
                    message: `SMS sent to ${formattedRecipients.length} recipients for transaction ${result.transactionId}`,
                    userId
                }).catch(err => console.error('Failed to log SMS:', err));
            })
            .catch((err: Error) => {
                console.error(`✗ SMS notification error for transaction ${result.transactionId}:`, err.message);
                createLog({
                    type: 'SMS_ERROR',
                    message: `Failed to send SMS: ${err.message}`,
                    userId
                }).catch(logErr => console.error('Failed to log SMS error:', logErr));
            });
    }

    revalidatePath("/company");
    revalidatePath("/company/history");
    return result;
}

export async function topUpWallet(amount: number, paymentMethod: string, promoCodeId?: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    if (amount <= 0) {
        throw new Error("Invalid Amount");
    }

    const userId = (session.user as any).id;
    const status = (session.user as any).status;

    if (status === "SUSPENDED") {
        throw new Error("Your account is suspended. Access denied.");
    }

    let finalAmount = amount;
    if (promoCodeId) {
        const promo = await prisma.promoCode.findUnique({
            where: { id: promoCodeId, isActive: true }
        });
        if (promo && promo.expiryDate > new Date()) {
            finalAmount = amount * (1 + promo.discountPercent / 100);
        }
    }

    const result = await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
            data: {
                id: generateTransactionRef(),
                userId,
                amount: finalAmount,
                type: TransactionType.CREDIT,
                status: TransactionStatus.COMPLETED,
                recipientsCount: 0,
                paymentMethod,
            },
        });

        // Update or create wallet
        await tx.wallet.upsert({
            where: { userId },
            update: { balance: { increment: finalAmount } },
            create: { userId, balance: finalAmount },
        });

        return { success: true, transactionId: transaction.id, creditedAmount: finalAmount };
    });

    await createLog({
        type: 'WALLET',
        message: `Wallet topped up with $${finalAmount} via ${paymentMethod}`,
        userId
    });

    revalidatePath("/company");
    revalidatePath("/company/history");
    return result;
}

export async function validatePromoCode(code: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const promo = await prisma.promoCode.findUnique({
        where: { code: code.toUpperCase(), isActive: true }
    });

    if (!promo) {
        return { success: false, message: "Invalid promo code" };
    }

    if (promo.expiryDate < new Date()) {
        return { success: false, message: "Promo code has expired" };
    }

    return { success: true, promo };
}

export async function createSubscription(data: { planName: string, amount: number, durationMonths: number, promoCodeId?: string }) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + data.durationMonths);

    return await prisma.subscription.create({
        data: {
            userId,
            planName: data.planName,
            amount: data.amount,
            promoCodeId: data.promoCodeId,
            endDate,
            status: "active",
        },
    });
}

export async function getCompanyTransactions(page: number = 1, pageSize: number = 10, search: string = "", type?: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const userId = (session.user as any).id;

    const where: any = {
        userId,
        AND: []
    };

    if (search) {
        where.AND.push({
            OR: [
                { id: { contains: search, mode: 'insensitive' } },
                { paymentMethod: { contains: search, mode: 'insensitive' } },
            ]
        });
    }

    if (type && type !== 'ALL') {
        where.AND.push({ type: type as TransactionType });
    }

    const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                recipients: true
            }
        }),
        prisma.transaction.count({
            where
        })
    ]);

    return {
        transactions,
        total,
        pages: Math.ceil(total / pageSize)
    };
}

export async function getAllCompanyTransactions() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const userId = (session.user as any).id;

    return await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
            recipients: true
        }
    });
}

export async function updateCompanyProfile(data: { name?: string, companyName?: string, email?: string }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "COMPANY") {
        throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            name: data.name,
            companyName: data.companyName,
            email: data.email,
        }
    });

    revalidatePath("/company/settings");
    return { success: true, user: updatedUser };
}
