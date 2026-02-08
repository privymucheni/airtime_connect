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
        fixed inset-y-0 left-0 w-80 bg-slate-900 text-white z-50 transition-transform duration-300 lg:translate-x-0 lg:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="p-10">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-indigo-500 bg-clip-text text-transparent">
                        AirTimeConnect
                    </h1>
                    <p className="text-sm text-slate-400 mt-2 uppercase font-black tracking-[0.3em]">
                        {user.role} Portal
                    </p>
                </div>

                <nav className="mt-6 px-6 space-y-3">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={`
                  w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300
                  ${isActive ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40 translate-x-1' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                `}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <item.icon className="w-6 h-6 stroke-[2.5px]" />
                                <span className="font-black text-lg">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-8 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-md">
                    <button
                        onClick={logout}
                        className="w-full flex items-center space-x-4 px-6 py-4 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all group"
                    >
                        <LogOut className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black text-lg">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-24 bg-white border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-30 shadow-sm">
                    <button
                        className="lg:hidden p-3 text-gray-500 hover:bg-gray-100 rounded-xl"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="w-8 h-8" />
                    </button>

                    <div className="flex-1 lg:flex-none"></div>

                    <div className="flex items-center space-x-8">
                        {user.role === UserRole.COMPANY && (
                            <div className="hidden sm:flex flex-col items-end px-6 py-2 border-l-2 border-indigo-50 bg-indigo-50/20 rounded-2xl">
                                <span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mb-0.5">Available Balance</span>
                                <span className="text-3xl font-black text-indigo-600 font-mono tracking-tighter leading-none">${user.balance.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded-2xl cursor-default transition-all">
                            <div className="text-right hidden sm:block">
                                <p className="text-lg font-black text-gray-900 leading-tight">{user.name}</p>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">{user.companyName || user.email}</p>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xl border-4 border-white shadow-xl">
                                {user.name.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-12 lg:p-16">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AuthenticatedLayout;
