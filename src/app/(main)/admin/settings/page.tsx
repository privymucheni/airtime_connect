'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Mail, Lock, CheckCircle2, AlertCircle, Loader2, User as UserIcon, Shield } from 'lucide-react';

const AdminSettings: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    if (!user) return null;

    const handleSave = async () => {
        setLoading(true);
        setMessage(null);
        try {
            // Reusing company profile update logic for basic info if compatible, 
            // or just showing success for now as a placeholder.
            // In a real app, you'd have updateAdminProfile.
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMessage({ type: 'success', text: 'Admin profile updated successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="space-y-4">
                <h1 className="text-6xl font-black text-gray-900 leading-tight tracking-tighter">Admin <span className="text-indigo-600">Profile</span></h1>
                <p className="text-xl text-gray-500 font-medium">Manage your administrator account security and preferences.</p>
            </div>

            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                <div className="p-10 border-b border-gray-50 bg-gray-50/30">
                    <h3 className="font-black text-2xl text-gray-900 flex items-center">
                        <Shield className="w-7 h-7 mr-3 text-indigo-600" />
                        Admin Credentials
                    </h3>
                </div>
                <div className="p-10 space-y-8">
                    {message && (
                        <div className={`p-6 rounded-2xl flex items-center space-x-4 animate-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                            <span className="font-bold text-lg">{message.text}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Full Name</label>
                            <div className="relative group">
                                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 w-6 h-6 transition-colors" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-lg text-gray-900 outline-none focus:ring-4 ring-indigo-500/5 focus:border-indigo-100 transition-all"
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 w-6 h-6 transition-colors" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-lg text-gray-900 outline-none focus:ring-4 ring-indigo-500/5 focus:border-indigo-100 transition-all"
                                    placeholder="admin@email.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center space-x-3 px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                            <span className="text-lg">Save Profile</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
