'use client';

import React from 'react';
import { Tag, Plus, Trash2, Edit3, Power } from 'lucide-react';

const MOCK_PROMOS = [
    { id: 1, code: 'WELCOME50', discount: '5% Bonus', usages: 145, status: 'active', expiry: '2024-12-31' },
    { id: 2, code: 'SUMMER_BOOST', discount: '2% Bonus', usages: 89, status: 'active', expiry: '2024-08-30' },
    { id: 3, code: 'TECHWEEK', discount: '10% Bonus', usages: 0, status: 'inactive', expiry: '2024-05-15' },
    { id: 4, code: 'RELOAD20', discount: '3% Bonus', usages: 540, status: 'active', expiry: '2025-01-01' },
];

const AdminPromoCodes: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Promo Code Management</h2>
                    <p className="text-gray-500 text-sm">Create and track marketing discount codes.</p>
                </div>
                <button className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100 transition-all">
                    <Plus className="w-5 h-5" />
                    <span>Create New Promo</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_PROMOS.map((promo) => (
                    <div key={promo.id} className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group transition-all hover:border-indigo-200 hover:shadow-md ${promo.status === 'inactive' ? 'opacity-70 grayscale' : ''}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Tag className="w-6 h-6" />
                            </div>
                            <div className="flex items-center space-x-1">
                                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button className={`p-2 rounded-lg transition-colors ${promo.status === 'active' ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                                    <Power className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-slate-800 tracking-wider font-mono">{promo.code}</h3>
                        <p className="text-indigo-600 font-bold text-lg">{promo.discount}</p>

                        <div className="mt-6 pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total Usages</p>
                                <p className="text-sm font-bold text-gray-700">{promo.usages}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Expiry Date</p>
                                <p className="text-sm font-bold text-gray-700">{promo.expiry}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminPromoCodes;
