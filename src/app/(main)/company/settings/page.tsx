'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Building2, Mail, Lock, Bell, CreditCard, ChevronRight, Globe, CheckCircle2, AlertCircle, Loader2, User as UserIcon } from 'lucide-react';
import { updateCompanyProfile } from '@/actions/company';

const CompanySettings: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        companyName: user?.companyName || '',
        email: user?.email || '',
    });

    if (!user) return null;

    const handleSave = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await updateCompanyProfile(formData);
            if (res.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                // We don't need to update state manually if revalidatePath works, 
                // but the local state might need a refresh if context doesn't update immediately.
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
            // Hide message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Account <span className="text-indigo-600">Settings</span></h1>
                <p className="text-lg text-gray-500 font-medium">Manage your company profile, billing, and security preferences.</p>
            </div>

            {/* General Information Card */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center">
                        <UserIcon className="w-5 h-5 mr-3 text-indigo-600" />
                        General Information
                    </h3>
                </div>
                <div className="p-10 space-y-8">
                    {message && (
                        <div className={`p-4 rounded-xl flex items-center space-x-3 animate-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <span className="font-bold text-sm tracking-tight">{message.text}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Person</label>
                            <div className="relative group">
                                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 w-5 h-5 transition-colors" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-sm text-gray-900 outline-none focus:ring-4 ring-indigo-500/5 focus:border-indigo-100 transition-all shadow-sm"
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Name</label>
                            <div className="relative group">
                                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 w-5 h-5 transition-colors" />
                                <input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-sm text-gray-900 outline-none focus:ring-4 ring-indigo-500/5 focus:border-indigo-100 transition-all shadow-sm"
                                    placeholder="Enter company name"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 w-5 h-5 transition-colors" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-sm text-gray-900 outline-none focus:ring-4 ring-indigo-500/5 focus:border-indigo-100 transition-all shadow-sm"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center space-x-2 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed group text-sm uppercase tracking-widest"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            <span>Save Profile Changes</span>
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CompanySettings;
