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
    Activity,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import ProfileModal from './ProfileModal';

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const pathname = usePathname();

    if (!user) return null;

    const adminMenu = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { name: 'Companies', icon: Users, path: '/admin/companies' },
        { name: 'Revenue Analytics', icon: PieChart, path: '/admin/analytics' },
        { name: 'Promo Codes', icon: Tag, path: '/admin/promo-codes' },
        { name: 'System Logs', icon: Activity, path: '/admin/logs' },
        { name: 'Settings', icon: Settings, path: '/admin/settings' },
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
        fixed inset-y-0 left-0 bg-slate-900 text-white z-50 transition-all duration-300 lg:translate-x-0 lg:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-24' : 'w-80'}
      `}>
                <div className={`p-10 transition-all duration-300 ${isCollapsed ? 'px-4 text-center' : 'px-10'}`}>
                    <h1 className={`font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-indigo-500 bg-clip-text text-transparent transition-all duration-300 ${isCollapsed ? 'text-xl' : 'text-3xl'}`}>
                        {isCollapsed ? 'AC' : 'AirTimeConnect'}
                    </h1>
                    {!isCollapsed && (
                        <p className="text-sm text-slate-400 mt-2 uppercase font-black tracking-[0.3em] whitespace-nowrap overflow-hidden">
                            {user.role} Portal
                        </p>
                    )}
                </div>

                <nav className={`mt-6 space-y-3 transition-all duration-300 ${isCollapsed ? 'px-4' : 'px-6'}`}>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                title={isCollapsed ? item.name : ''}
                                className={`
                  w-full flex items-center rounded-2xl transition-all duration-300
                  ${isCollapsed ? 'justify-center p-4' : 'space-x-4 px-6 py-4'}
                  ${isActive ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40 translate-x-1' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                `}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <item.icon className="w-6 h-6 stroke-[2.5px] flex-shrink-0" />
                                {!isCollapsed && <span className="font-black text-lg whitespace-nowrap">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className={`absolute bottom-0 w-full border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-md transition-all duration-300 ${isCollapsed ? 'p-4' : 'p-8'}`}>
                    <button
                        onClick={logout}
                        title={isCollapsed ? 'Logout' : ''}
                        className={`w-full flex items-center text-red-400 hover:bg-red-500/10 rounded-2xl transition-all group ${isCollapsed ? 'justify-center p-4' : 'space-x-4 px-6 py-4'}`}
                    >
                        <LogOut className={`w-6 h-6 group-hover:-translate-x-1 transition-transform flex-shrink-0`} />
                        {!isCollapsed && <span className="font-black text-lg">Logout</span>}
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-24 bg-white border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center space-x-6">
                        <button
                            className="lg:hidden p-3 text-gray-500 hover:bg-gray-100 rounded-xl"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-8 h-8" />
                        </button>

                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden lg:flex p-3 text-indigo-600 hover:bg-indigo-50 bg-indigo-50/50 rounded-xl transition-all border border-indigo-100/50 items-center space-x-3 group"
                        >
                            {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                            <span className="font-black text-sm uppercase tracking-widest hidden xl:block">
                                {isCollapsed ? 'Expand Menu' : 'Collapse Menu'}
                            </span>
                        </button>
                    </div>

                    <div className="flex-1 lg:flex-none"></div>

                    <div className="flex items-center space-x-8">
                        {user.role === UserRole.COMPANY && (
                            <div className="hidden sm:flex flex-col items-end px-6 py-2 border-l-2 border-indigo-50 bg-indigo-50/20 rounded-2xl">
                                <span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mb-0.5">Available Balance</span>
                                <span className="text-3xl font-black text-indigo-600 font-mono tracking-tighter leading-none">${user.balance.toLocaleString()}</span>
                            </div>
                        )}
                        <div
                            onClick={() => setIsProfileOpen(true)}
                            className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded-2xl cursor-pointer transition-all group"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-lg font-black text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">{user.name}</p>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">{user.companyName || user.email}</p>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xl border-4 border-white shadow-xl group-hover:scale-105 transition-transform">
                                {user.name.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                <div className={`flex-1 overflow-y-auto transition-all duration-300 ${isCollapsed ? 'p-6 lg:p-8' : 'p-12 lg:p-16'}`}>
                    {children}
                </div>
            </main>

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
            />
        </div>
    );
};

export default AuthenticatedLayout;
