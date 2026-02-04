'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { UserRole } from '@/types';
import {
    LayoutDashboard,
    Users,
    Send,
    LogOut,
    Menu,
    Settings,
    PieChart,
    Tag,
    History,
    Activity
} from 'lucide-react';

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    if (!user) return null;

    const adminMenu = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { name: 'Companies', icon: Users, path: '/admin/companies' },
        { name: 'Revenue Analytics', icon: PieChart, path: '/admin/analytics' },
        { name: 'Promo Codes', icon: Tag, path: '/admin/promo-codes' },
        { name: 'System Logs', icon: Activity, path: '/admin/logs' },
    ];

    const companyMenu = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/company' },
        { name: 'Bulk Distribution', icon: Send, path: '/company/distribution' },
        { name: 'History', icon: History, path: '/company/history' },
        { name: 'Settings', icon: Settings, path: '/company/settings' },
    ];

    const menuItems = user.role === UserRole.ADMIN ? adminMenu : companyMenu;

    return (
        <div className="min-h-screen flex bg-gray-50">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`
        fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-50 transition-transform duration-300 lg:translate-x-0 lg:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        AirTimeConnect
                    </h1>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">
                        {user.role} Portal
                    </p>
                </div>

                <nav className="mt-4 px-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                `}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
                    <button
                        onClick={logout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-30">
                    <button
                        className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex-1 lg:flex-none"></div>

                    <div className="flex items-center space-x-4">
                        {user.role === UserRole.COMPANY && (
                            <div className="hidden sm:flex flex-col items-end px-4 py-1 border-r border-gray-200">
                                <span className="text-xs text-gray-500 font-medium">Wallet Balance</span>
                                <span className="text-lg font-bold text-indigo-600">${user.balance.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex items-center space-x-3 p-1 hover:bg-gray-50 rounded-lg cursor-default">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.companyName || user.email}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                                {user.name.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AuthenticatedLayout;
