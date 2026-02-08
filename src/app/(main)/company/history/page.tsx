'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getCompanyTransactions, getAllCompanyTransactions } from '@/actions/company';
import {
    History as HistoryIcon,
    ArrowUpRight,
    ArrowDownLeft,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    Download,
    Calendar,
    Hash
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

const TransactionHistoryPage = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [isExporting, setIsExporting] = useState(false);
    const pageSize = 12;

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getCompanyTransactions(page, pageSize, searchTerm, filterType);
            setTransactions(data.transactions);
            setTotalPages(data.pages);
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, filterType]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1); // Reset to first page on search
    };

    const handleFilterChange = (type: string) => {
        setFilterType(type);
        setPage(1); // Reset to first page on filter
    };

    const handleExportCSV = async () => {
        setIsExporting(true);
        try {
            const allData = await getAllCompanyTransactions();
            const headers = ["ID", "Type", "Amount", "Date", "Status", "Method", "Recipients"];
            const csvContent = [
                headers.join(","),
                ...allData.map((tx: any) => [
                    tx.id,
                    tx.type,
                    tx.amount,
                    new Date(tx.createdAt).toLocaleDateString(),
                    tx.status,
                    tx.paymentMethod || 'Wallet Balance',
                    tx.recipientsCount
                ].join(","))
            ].join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setIsExporting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="w-full space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <h1 className="text-7xl font-black text-gray-900 leading-[1.1] tracking-tighter">Transaction <span className="text-indigo-600">History</span></h1>
                    <p className="text-2xl text-gray-500 font-medium max-w-3xl">Analyze and audit your complete financial activity. Track every distribution and top-up with ultra-precision.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleExportCSV}
                        disabled={isExporting}
                        className="flex items-center space-x-3 px-10 py-5 bg-white border-2 border-gray-100 text-gray-900 font-black rounded-[2rem] hover:bg-gray-50 transition-all shadow-xl shadow-gray-100/50 hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        <Download className={`w-6 h-6 ${isExporting ? 'animate-bounce' : ''}`} />
                        <span className="text-lg uppercase tracking-widest">{isExporting ? 'Exporting...' : 'Export CSV'}</span>
                    </button>
                </div>
            </div>

            {/* Advanced Filters Bar */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] border border-gray-100 p-6 shadow-2xl shadow-indigo-100/20 flex flex-col md:flex-row gap-6 sticky top-28 z-20">
                <div className="flex-1 relative group">
                    <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by ID, method or recipient..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-18 pr-8 py-6 bg-gray-50/50 rounded-[2.5rem] font-black text-xl text-gray-900 outline-none focus:ring-4 ring-indigo-500/10 transition-all border-2 border-transparent focus:border-indigo-100 placeholder:text-gray-300"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="relative flex items-center bg-gray-50/50 rounded-[2.5rem] p-2 border-2 border-transparent focus-within:border-indigo-100 transition-all">
                        <Filter className="w-6 h-6 ml-5 text-gray-400" />
                        <select
                            value={filterType}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="bg-transparent pl-4 pr-10 py-4 font-black text-lg text-gray-900 outline-none appearance-none cursor-pointer"
                        >
                            <option value="ALL">All Types</option>
                            <option value="DEBIT">Distributions</option>
                            <option value="CREDIT">Top-ups</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[4rem] border border-gray-100 shadow-2xl overflow-hidden ring-1 ring-gray-50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b-2 border-gray-100">
                                <th className="px-12 py-10 text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Transaction & Timing</th>
                                <th className="px-12 py-10 text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Details & Reference</th>
                                <th className="px-12 py-10 text-sm font-black text-gray-400 uppercase tracking-[0.2em] text-center">Batch Size</th>
                                <th className="px-12 py-10 text-sm font-black text-gray-400 uppercase tracking-[0.2em] text-center">Execution Status</th>
                                <th className="px-12 py-10 text-sm font-black text-gray-400 uppercase tracking-[0.2em] text-right">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-12 py-12">
                                            <div className="h-10 bg-gray-100 rounded-[2rem] w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-12 py-40 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-30">
                                            <div className="p-12 bg-gray-50 rounded-full mb-8">
                                                <HistoryIcon className="w-32 h-32 text-gray-300" />
                                            </div>
                                            <p className="text-4xl font-black text-gray-400 uppercase tracking-widest">No matching activities</p>
                                            <p className="text-xl text-gray-400 mt-4 font-bold">Try adjusting your filters or search terms</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-indigo-50/30 transition-all group">
                                        <td className="px-12 py-10">
                                            <div className="flex items-center space-x-8">
                                                <div className={`p-6 rounded-[2rem] shadow-lg transition-transform group-hover:scale-110 ${tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600 shadow-emerald-100/50' : 'bg-rose-50 text-rose-600 shadow-rose-100/50'}`}>
                                                    {tx.type === 'CREDIT' ? <ArrowDownLeft className="w-8 h-8 stroke-[3px]" /> : <ArrowUpRight className="w-8 h-8 stroke-[3px]" />}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-black text-gray-900 text-2xl leading-none">{tx.type === 'CREDIT' ? 'Wallet Top-up' : 'Bulk Distribution'}</p>
                                                    <div className="flex items-center text-gray-400 font-bold uppercase tracking-widest text-sm space-x-2">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{new Date(tx.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-base font-black text-gray-400 uppercase tracking-widest">Method:</span>
                                                    <span className="text-xl font-black text-gray-900 capitalize underline decoration-indigo-200 underline-offset-4">{tx.paymentMethod || 'Wallet Balance'}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Hash className="w-3.5 h-3.5 text-gray-300" />
                                                    <p className="text-xs font-mono text-gray-400 font-bold uppercase tracking-[0.2em]">{tx.id.toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10 text-center">
                                            {tx.recipientsCount > 0 ? (
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="px-8 py-3 bg-indigo-50 text-indigo-700 rounded-2xl font-black text-lg shadow-sm border border-indigo-100">{tx.recipientsCount} recipients</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-200 font-black text-xl">—</span>
                                            )}
                                        </td>
                                        <td className="px-12 py-10 text-center">
                                            <span className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-sm border ${tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                tx.status === 'FAILED' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-12 py-10 text-right">
                                            <div className={`text-4xl font-black font-mono tracking-tighter ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-gray-900'}`}>
                                                {tx.type === 'CREDIT' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {!loading && transactions.length > 0 && (
                    <div className="px-12 py-12 bg-gray-50/80 border-t-2 border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-8">
                        <div className="space-y-1">
                            <p className="text-xl font-black text-gray-900">
                                Page <span className="text-indigo-600">{page}</span> of <span className="text-indigo-600">{totalPages}</span>
                            </p>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Showing {transactions.length} transactions in this view</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => { window.scrollTo({ top: 300, behavior: 'smooth' }); setPage(p => Math.max(1, p - 1)); }}
                                disabled={page === 1}
                                className="p-6 bg-white border-2 border-gray-100 rounded-[2rem] text-gray-600 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-gray-200/50 hover:scale-110 active:scale-90"
                            >
                                <ChevronLeft className="w-10 h-10" />
                            </button>
                            <div className="w-16 h-16 flex items-center justify-center font-black text-2xl text-indigo-600 bg-white border-2 border-indigo-100 rounded-full shadow-inner">
                                {page}
                            </div>
                            <button
                                onClick={() => { window.scrollTo({ top: 300, behavior: 'smooth' }); setPage(p => Math.min(totalPages, p + 1)); }}
                                disabled={page === totalPages}
                                className="p-6 bg-white border-2 border-gray-100 rounded-[2rem] text-gray-600 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-gray-200/50 hover:scale-110 active:scale-90"
                            >
                                <ChevronRight className="w-10 h-10" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionHistoryPage;
