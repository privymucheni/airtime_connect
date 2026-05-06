import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                role: { label: "Role", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { wallet: true }
                });

                if (!user || !user.password) {
                    throw new Error("User not found");
                }

                // Role validation
                if (credentials.role && user.role !== credentials.role) {
                    throw new Error(`Incompatible account type. This email is registered as an ${user.role}.`);
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (user.status === "SUSPENDED") {
                    throw new Error("Your account has been suspended. Please contact support.");
                }

                if (!isPasswordValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    balance: user.wallet?.balance || 0,
                    status: user.status,
                    companyName: user.companyName,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.balance = (user as any).balance;
                token.companyName = (user as any).companyName;
                token.status = (user as any).status;
            }

            // Always fetch latest status and balance from DB to ensure instant updates (suspension, top-ups)
            try {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    include: { wallet: true }
                });

                if (dbUser) {
                    token.status = dbUser.status;
                    token.balance = dbUser.wallet?.balance || 0;
                    token.role = dbUser.role; // Keep role in sync too
                }
            } catch (error) {
                console.error("JWT DB Lookup Error:", error);
                // Fallback to existing token values if DB is unreachable
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).balance = token.balance;
                (session.user as any).companyName = token.companyName;
                (session.user as any).status = token.status;
            }
            return session;
        },
    },
};
