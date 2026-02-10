'use client';

import React, { useState } from 'react';
import { Building2, User as UserIcon, Mail, Lock, X, CheckCircle } from 'lucide-react';
import { registerCompany } from '@/actions/auth';

interface AddCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await registerCompany({
                name: formData.contactPerson,
                email: formData.email,
                password: formData.password,
                companyName: formData.companyName
            });

            if (result.error) {
                setError(result.error);
            } else {
                setIsSuccess(true);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                    setIsSuccess(false);
                    setFormData({ companyName: '', contactPerson: '', email: '', password: '' });
                }, 2000);
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="relative p-8 md:p-10">
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {isSuccess ? (
                        <div className="py-10 text-center animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Company Registered!</h2>
                            <p className="text-gray-500 leading-relaxed">
                                <span className="font-bold text-gray-900">{formData.companyName}</span> has been successfully added to the system.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Add New Company</h1>
                                <p className="text-gray-500 mt-1">Register a new client company to the platform.</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Company Name</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Acme Corp"
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                                value={formData.companyName}
                                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Contact Person</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Full Name"
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                                value={formData.contactPerson}
                                                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="finance@company.com"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Default Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center space-x-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <span>Add Company Account</span>
                                                <Building2 className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="w-full mt-3 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddCompanyModal;
