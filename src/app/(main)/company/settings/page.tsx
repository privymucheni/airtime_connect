'use client';

import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { Building2, Mail, Lock, Bell, CreditCard, ChevronRight, Globe } from 'lucide-react';

const CompanySettings: React.FC = () => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
                <p className="text-gray-500">Manage your company profile, billing, and security preferences.</p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                    <h3 className="font-bold text-gray-900">General Information</h3>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Company Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    defaultValue={user.companyName}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Support Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    defaultValue={user.email}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-50 flex justify-end">
                        <button className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {[
                    { icon: Lock, title: 'Security & Password', desc: 'Manage your password and 2FA settings', color: 'bg-amber-50 text-amber-600' },
                    { icon: Bell, title: 'Notifications', desc: 'Configure alerts for distributions and low balance', color: 'bg-blue-50 text-blue-600' },
                    { icon: CreditCard, title: 'Billing Details', desc: 'Tax info, invoices, and default payment methods', color: 'bg-purple-50 text-purple-600' },
                    { icon: Globe, title: 'API & Integrations', desc: 'Access your credentials for automated distributions', color: 'bg-green-50 text-green-600' },
                ].map((item, idx) => (
                    <button key={idx} className="group flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-indigo-200 hover:shadow-md transition-all text-left">
                        <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-xl ${item.color} group-hover:scale-110 transition-transform`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{item.title}</h4>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                    </button>
                ))}
            </div>

            <div className="bg-red-50 border border-red-100 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h4 className="font-bold text-red-900">Deactivate Account</h4>
                    <p className="text-sm text-red-700">Request account deletion. This action is permanent.</p>
                </div>
                <button className="px-6 py-2.5 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all">
                    Contact Support
                </button>
            </div>
        </div>
    );
};

export default CompanySettings;
