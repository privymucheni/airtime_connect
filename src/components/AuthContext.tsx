'use client';

import React from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';
import { UserRole } from '@/types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <SessionProvider>{children}</SessionProvider>;
};

export const useAuth = () => {
    const { data: session, status, update } = useSession();

    const user = session?.user ? {
        id: (session.user as any).id,
        name: session.user.name || '',
        email: session.user.email || '',
        role: (session.user as any).role as UserRole,
        companyName: (session.user as any).companyName,
        balance: (session.user as any).balance || 0,
        status: (session.user as any).status || 'ACTIVE',
    } : null;

    return {
        user,
        login: (credentials: any) => signIn('credentials', credentials),
        logout: async () => {
            await signOut({ redirect: false });
            window.location.href = '/login';
        },
        isLoading: status === 'loading',
        update,
    };
};
