'use client';

import React from 'react';
import { X, User, Mail, Building2, Shield, CreditCard, ExternalLink, LogOut } from 'lucide-react';
import Link from 'next/link';
import { UserRole } from '@/types';
import { useAuth } from './AuthContext';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user }) => {
    const { logout } = useAuth();
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
                {/* Header/Cover */}
                <div className="h-32 bg-gradient-to-r from-indigo-600 to-blue-600 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="absolute -bottom-12 left-10">
                        <div className="w-24 h-24 rounded-[2rem] bg-white border-4 border-white shadow-xl flex items-center justify-center text-indigo-700 font-black text-3xl">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-16 p-10 space-y-8">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 leading-tight">{user.name}</h2>
                        <div className="flex items-center mt-1">
                            <span className={`px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest ${user.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                {user.role} Account
                            </span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
                                <p className="font-bold text-gray-900">{user.email}</p>
                            </div>
                        </div>

                        {user.companyName && (
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Company Name</p>
                                    <p className="font-bold text-gray-900">{user.companyName}</p>
                                </div>
                            </div>
                        )}

                        {user.role === UserRole.COMPANY && (
                            <div className="flex items-center space-x-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Wallet balance</p>
                                    <p className="font-black text-indigo-600 text-2xl font-mono tracking-tighter">${user.balance.toLocaleString()}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 space-y-4">
                        <Link
                            href={user.role === UserRole.ADMIN ? '/admin/settings' : '/company/settings'}
                            onClick={onClose}
                            className="w-full flex items-center justify-center space-x-3 p-5 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 group"
                        >
                            <span>Go to Detailed Settings</span>
                            <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <button
                            onClick={() => {
                                onClose();
                                logout();
                            }}
                            className="w-full flex items-center justify-center space-x-3 p-5 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition-all group border border-red-100"
                        >
                            <span>Sign Out</span>
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
