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
    MessageCircle,
    Menu,
    Settings,
    PieChart,
    Tag,
    History,
    Activity,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Plus
} from 'lucide-react';
import ProfileModal from './ProfileModal';
import Logo from './Logo';
import WalletModal from './WalletModal';

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const pathname = usePathname();

    if (!user) return null;

    const adminMenu = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { name: 'Companies', icon: Users, path: '/admin/companies' },
        { name: 'Revenue Analytics', icon: PieChart, path: '/admin/analytics' },
        { name: 'Guided Chatbot', icon: MessageCircle, path: '/admin/chatbot' },
        { name: 'Promo Codes', icon: Tag, path: '/admin/promo-codes' },
        { name: 'System Logs', icon: Activity, path: '/admin/logs' },
        { name: 'Settings', icon: Settings, path: '/admin/settings' },
    ];

    const companyMenu = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/company' },
        { name: 'Distributions', icon: Send, path: '/company/distribution' },
        { name: 'Wallet', icon: CreditCard, path: '/company/wallet' },
        { name: 'History', icon: History, path: '/company/history' },
        { name: 'Settings', icon: Settings, path: '/company/settings' },
    ];

    const menuItems = user.role === UserRole.ADMIN ? adminMenu : companyMenu;

    const getGreeting = (name: string) => {
        const hour = new Date().getHours();
        if (hour < 12) return `Good morning, ${name}`;
        if (hour < 18) return `Good afternoon, ${name}`;
        return `Good evening, ${name}`;
    };

    return (
        <div className="min-h-screen flex bg-[#F7F9FC]">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`
                fixed inset-y-0 left-0 bg-slate-900 text-white z-50 lg:translate-x-0 lg:static
                flex flex-col border-r border-slate-800 transition-all duration-300
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                ${isCollapsed ? 'w-20' : 'w-72'}
            `}>
                {/* Logo section */}
                <div className={`p-6 border-b border-slate-800/50 flex items-center justify-between ${isCollapsed ? 'justify-center' : ''}`}>
                    {isCollapsed ? (
                        <Logo showText={false} iconClassName="w-8 h-8" />
                    ) : (
                        <Logo textClassName="text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-indigo-500 bg-clip-text text-transparent" />
                    )}
                </div>

                {/* Nav Links */}
                <nav className={`mt-6 space-y-1.5 flex-1 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                title={isCollapsed ? item.name : ''}
                                className={`
                                    w-full flex items-center rounded-xl transition-all duration-200 relative group
                                    ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'}
                                    ${isActive 
                                        ? 'bg-indigo-600/20 text-white font-semibold' 
                                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                                    }
                                `}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                {isActive && (
                                    <span className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-r-full transition-all duration-200" />
                                )}
                                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                                {!isCollapsed && <span className="text-sm tracking-wide">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer: Avatar + Logout */}
                <div className={`p-4 border-t border-slate-800 bg-slate-900/50 space-y-3`}>
                    {!isCollapsed && (
                        <div className="flex items-center space-x-3 px-2 py-1.5 bg-slate-800/50 rounded-xl">
                            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm border border-slate-700">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">{user.companyName || user.email}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={logout}
                        title={isCollapsed ? 'Logout' : ''}
                        className={`w-full flex items-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all group ${isCollapsed ? 'justify-center p-3.5' : 'space-x-3.5 px-4 py-3'}`}
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform flex-shrink-0" />
                        {!isCollapsed && <span className="text-xs font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-30 shadow-[0_1px_3px_0_rgba(0,0,0,0.01),0_1px_2px_0_rgba(0,0,0,0.02)]">
                    {/* Header Left: Menu trigger & greeting */}
                    <div className="flex items-center space-x-4">
                        <button
                            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg border border-slate-100"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden lg:flex p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-100/50 hover:border-slate-200/60 rounded-lg transition-all"
                            title={isCollapsed ? 'Expand Menu' : 'Collapse Menu'}
                        >
                            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </button>

                        <div className="hidden sm:block">
                            <div className="flex items-center space-x-2">
                                <h2 className="text-sm font-semibold text-slate-900 leading-none">
                                    {getGreeting(user.name.split(' ')[0])}
                                </h2>
                                {user.role === UserRole.ADMIN && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/10">
                                        Admin
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium">Welcome back to your AirFlow portal.</p>
                        </div>
                    </div>

                    {/* Header Right: Actions & User Info */}
                    <div className="flex items-center space-x-6">
                        {/* Quick actions for Company user */}
                        {user.role === UserRole.COMPANY && (
                            <div className="flex items-center space-x-2.5">
                                <button
                                    onClick={() => setIsWalletModalOpen(true)}
                                    className="flex items-center space-x-1.5 h-10 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-indigo-600/15 transition-all font-semibold text-xs shadow-sm cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Top-up Wallet</span>
                                </button>
                                <Link
                                    href="/company/distribution"
                                    className="flex items-center space-x-1.5 h-10 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold text-xs shadow-sm"
                                >
                                    <Send className="w-3.5 h-3.5 text-slate-400" />
                                    <span>New Distribution</span>
                                </Link>
                            </div>
                        )}

                        {/* Balance display */}
                        {user.role === UserRole.COMPANY && (
                            <div className="hidden md:flex flex-col items-end px-3 py-1 border-l border-slate-100">
                                <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Available Balance</span>
                                <span className="text-sm font-bold text-indigo-950 font-mono">${user.balance.toLocaleString()}</span>
                            </div>
                        )}

                        {/* Profile card with avatar */}
                        <div
                            onClick={() => setIsProfileOpen(true)}
                            className="flex items-center space-x-2.5 p-1 hover:bg-slate-50 rounded-xl cursor-pointer transition-all border border-transparent"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200 shadow-sm">
                                {user.name.charAt(0)}
                            </div>
                            <div className="hidden lg:block text-left">
                                <p className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</p>
                                <p className="text-[9px] text-slate-500 font-medium">{user.companyName || user.email}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-[1600px] mx-auto p-6 md:p-8">
                        {children}
                    </div>
                </div>
            </main>

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
            />

            <WalletModal
                isOpen={isWalletModalOpen}
                onClose={() => setIsWalletModalOpen(false)}
                currentBalance={user.balance}
            />
        </div>
    );
};

export default AuthenticatedLayout;
