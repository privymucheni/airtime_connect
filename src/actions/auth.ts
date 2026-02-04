"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus } from "@prisma/client";

export async function registerCompany(formData: any) {
    try {
        const { name, email, password, companyName } = formData;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: "User with this email already exists" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                companyName,
                role: UserRole.COMPANY,
                status: UserStatus.ACTIVE,
                balance: 0,
            },
        });

        return { success: true, user: { id: user.id, email: user.email } };
    } catch (error: any) {
        console.error("Registration error:", error);
        return { error: error.message || "An error occurred during registration" };
    }
}

// Admin can also create companies or other admins
export async function createUser(data: any) {
    try {
        const { name, email, password, role, companyName } = data;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                companyName,
                balance: 0,
                status: UserStatus.ACTIVE,
            },
        });

        return { success: true, user };
    } catch (error: any) {
        return { error: error.message };
    }
}
