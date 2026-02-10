'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, User as UserIcon, Mail, Lock, ChevronRight, CheckCircle, ArrowLeft } from 'lucide-react';
import { registerAdmin } from '@/actions/auth';

const RegisterAdmin: React.FC = () => {
    const router = useRouter();
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        secretKey: '' // Added a secret key field for extra security
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Simple security check
        if (formData.secretKey !== 'ATC_ADMIN_2024') {
            setError('Invalid setup key. You are not authorized to create an admin account.');
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        const result = await registerAdmin({
            name: formData.name,
            email: formData.email,
            password: formData.password
        });

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
        } else {
            setIsSuccess(true);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center relative z-10 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Admin Created!</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        The administrator account for <span className="font-bold text-gray-900">{formData.email}</span> has been successfully registered.
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center space-x-2"
                    >
                        <span>Proceed to Login</span>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20"></div>

            <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 relative z-10 transition-all duration-500">
                <div className="mb-8">
                    <Link href="/login" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-indigo-600 mb-6 transition-colors group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Sign In
                    </Link>
                    <div className="flex items-center space-x-3 mb-2">
                        <ShieldCheck className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Setup</h1>
                    </div>
                    <p className="text-gray-500">Create a new system administrator account.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Setup Key</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                            <input
                                type="password"
                                required
                                placeholder="Enter system secret key"
                                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                value={formData.secretKey}
                                onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                            <input
                                type="text"
                                required
                                placeholder="Admin Name"
                                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                            <input
                                type="email"
                                required
                                placeholder="admin@airtimeconnect.com"
                                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Confirm</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center space-x-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Create Admin Account</span>
                                    <ShieldCheck className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterAdmin;
