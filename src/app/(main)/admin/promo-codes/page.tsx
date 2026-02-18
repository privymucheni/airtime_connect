'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Power, X, Calendar, Percent, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createPromoCode, getPromoCodes, deletePromoCode, togglePromoCodeStatus } from '@/actions/admin';

const AdminPromoCodes: React.FC = () => {
    const [promos, setPromos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        discountPercent: '',
        expiryDate: ''
    });

    const fetchPromos = async () => {
        setIsLoading(true);
        try {
            const data = await getPromoCodes();
            setPromos(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPromos();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await createPromoCode({
                ...formData,
                discountPercent: parseFloat(formData.discountPercent)
            });
            if (res.success) {
                setIsModalOpen(false);
                setFormData({ code: '', discountPercent: '', expiryDate: '' });
                fetchPromos();
            }
        } catch (error) {
            alert("Failed to create promo code");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deletePromoCode(id);
            fetchPromos();
        } catch (error) {
            alert("Delete failed");
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await togglePromoCodeStatus(id, !currentStatus);
            fetchPromos();
        } catch (error) {
            alert("Toggle failed");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Promo Codes</h2>
                    <p className="text-lg text-gray-500 font-medium mt-1">Manage incentives and discount campaigns.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-3 px-8 py-5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black shadow-2xl shadow-indigo-100 transition-all transform hover:-translate-y-1 active:scale-95 text-lg"
                >
                    <Plus className="w-6 h-6 stroke-[3px]" />
                    <span>Create Promo</span>
                </button>
            </div>

            {isLoading ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-6">
                    <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                    <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-sm">Loading Promos...</p>
                </div>
            ) : promos.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-100">
                    <div className="bg-gray-50 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Tag className="w-14 h-14 text-gray-300" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-4">No promo codes yet</h3>
                    <p className="text-xl text-gray-500 mb-10 max-w-sm mx-auto">Start by creating your first promotional code to boost engagement.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {promos.map((promo) => (
                        <div
                            key={promo.id}
                            className={`bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm relative group transition-all hover:border-indigo-200 hover:shadow-2xl ${!promo.isActive ? 'opacity-70 grayscale' : ''}`}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className={`p-4 rounded-3xl ${promo.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <Tag className="w-8 h-8" />
                                </div>
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleToggleStatus(promo.id, promo.isActive)}
                                        className={`p-3.5 rounded-2xl transition-all ${promo.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                                        title={promo.isActive ? "Deactivate" : "Activate"}
                                    >
                                        <Power className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(promo.id)}
                                        className="p-3.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1 mb-6">
                                <h3 className="text-2xl font-semibold text-gray-900 tracking-tight font-mono uppercase leading-none">{promo.code}</h3>
                                <p className="text-indigo-600 font-medium text-base">+{promo.discountPercent}% Bonus Airtime</p>
                            </div>

                            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${promo.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-300'}`}></div>
                                    <span className={`text-xs font-medium uppercase tracking-wider ${promo.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                        {promo.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 uppercase font-medium tracking-widest mb-0.5">Expires</p>
                                    <p className="text-sm font-semibold text-gray-700">{new Date(promo.expiryDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">New Promo Code</h3>
                                <p className="text-gray-500 text-sm font-medium">Define your promotion settings</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Promo Code</label>
                                <div className="relative">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="E.g. SUMMER2024"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all uppercase"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Bonus %</label>
                                    <div className="relative">
                                        <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="number"
                                            required
                                            value={formData.discountPercent}
                                            onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                                            placeholder="5"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Expiry Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="date"
                                            required
                                            value={formData.expiryDate}
                                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-gray-900 hover:bg-black text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Launch Promotion</span>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPromoCodes;
