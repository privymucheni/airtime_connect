'use client';

import React, { useState } from 'react';
import { Transaction } from '@/types';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle2,
    XCircle
} from 'lucide-react';

const MOCK_EXTENDED_HISTORY: Transaction[] = [
    { id: 'TX-1001', companyId: 'c1', companyName: 'Acme Corp', amount: 12500, type: 'debit', recipientsCount: 240, status: 'completed', timestamp: '2024-03-22 14:30' },
    { id: 'TX-1002', companyId: 'c1', companyName: 'Acme Corp', amount: 50000, type: 'credit', recipientsCount: 0, status: 'completed', timestamp: '2024-03-20 09:15' },
    { id: 'TX-1003', companyId: 'c1', companyName: 'Acme Corp', amount: 8200, type: 'debit', recipientsCount: 85, status: 'completed', timestamp: '2024-03-18 16:45' },
    { id: 'TX-1004', companyId: 'c1', companyName: 'Acme Corp', amount: 3500, type: 'debit', recipientsCount: 30, status: 'failed', timestamp: '2024-03-15 11:20' },
    { id: 'TX-1005', companyId: 'c1', companyName: 'Acme Corp', amount: 10000, type: 'credit', recipientsCount: 0, status: 'completed', timestamp: '2024-03-10 13:00' },
];

const CompanyHistory: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
                    <p className="text-gray-500 text-sm">Review your airtime distributions and wallet top-ups.</p>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all">
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by transaction ID or type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent focus:border-indigo-500 rounded-xl outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="flex items-center space-x-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-all">
                            <Filter className="w-4 h-4" />
                            <span className="text-sm font-semibold">Filter</span>
                        </button>
                        <select className="bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-semibold outline-none text-gray-600">
                            <option>All Time</option>
                            <option>This Month</option>
                            <option>Last Month</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Type & Ref</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Recipients</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {MOCK_EXTENDED_HISTORY.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg ${tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                {tx.type === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{tx.type === 'credit' ? 'Wallet Top-up' : 'Bulk Distribution'}</p>
                                                <p className="text-xs text-gray-500">{tx.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                                            {tx.type === 'credit' ? '+' : '-'}${tx.amount.toLocaleString()}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600">{tx.recipientsCount > 0 ? `${tx.recipientsCount} Employees` : '-'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            tx.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {tx.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                                            {tx.status === 'processing' && <Clock className="w-3 h-3" />}
                                            {tx.status === 'failed' && <XCircle className="w-3 h-3" />}
                                            <span>{tx.status}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{tx.timestamp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-500 font-medium tracking-wide">Showing 1 to 5 of 24 transactions</p>
                    <div className="flex items-center space-x-2">
                        <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center space-x-1">
                            <button className="w-8 h-8 bg-indigo-600 text-white font-bold rounded-lg text-xs">1</button>
                            <button className="w-8 h-8 hover:bg-white text-gray-500 font-bold rounded-lg text-xs">2</button>
                            <button className="w-8 h-8 hover:bg-white text-gray-500 font-bold rounded-lg text-xs">3</button>
                        </div>
                        <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyHistory;
