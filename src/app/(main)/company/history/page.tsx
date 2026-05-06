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
    Hash,
    Eye
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import TransactionDetailModal from '@/components/TransactionDetailModal';

const TransactionHistoryPage = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [isExporting, setIsExporting] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const pageSize = 12;

    const handleDownloadTransaction = (e: React.MouseEvent, tx: any) => {
        e.stopPropagation(); // prevent row click (modal open)
        const isCredit = tx.type === 'CREDIT';
        const lines: string[] = [];
        lines.push(`Transaction ID,${tx.id}`);
        lines.push(`Type,${isCredit ? 'Wallet Top-up' : 'Bulk Distribution'}`);
        lines.push(`Amount,${isCredit ? '+' : '-'}$${tx.amount.toFixed(2)}`);
        lines.push(`Status,${tx.status}`);
        lines.push(`Payment Method,${tx.paymentMethod || 'Wallet Balance'}`);
        lines.push(`Date,${new Date(tx.createdAt).toLocaleString()}`);
        lines.push(`Recipients Count,${tx.recipientsCount}`);
        if (!isCredit && tx.recipients && tx.recipients.length > 0) {
            lines.push('');
            lines.push('Recipient Name,Phone Number,Amount,Status');
            tx.recipients.forEach((r: any) => {
                lines.push([`"${r.name || 'Unknown'}"`, r.phoneNumber, `$${r.amount.toFixed(2)}`, r.status].join(','));
            });
        }
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `transaction_${tx.id}_${new Date(tx.createdAt).toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

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
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Transaction <span className="text-indigo-600">History</span></h1>
                    <p className="text-lg text-gray-500 font-medium max-w-3xl">Analyze and audit your complete financial activity. Track every distribution and top-up with precision.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleExportCSV}
                        disabled={isExporting}
                        className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-100 text-gray-900 font-black rounded-2xl hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 text-sm"
                    >
                        <Download className={`w-5 h-5 ${isExporting ? 'animate-bounce' : ''}`} />
                        <span className="uppercase tracking-widest">{isExporting ? 'Exporting...' : 'Export CSV'}</span>
                    </button>
                </div>
            </div>

            {/* Advanced Filters Bar */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] border border-gray-100 p-6 shadow-2xl shadow-indigo-100/20 flex flex-col md:flex-row gap-6 sticky top-28 z-20">
                <div className="flex-1 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by ID, method or recipient..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-14 pr-6 py-4 bg-gray-50/50 rounded-[1.5rem] font-bold text-sm text-gray-900 outline-none focus:ring-4 ring-indigo-500/10 transition-all border-2 border-transparent focus:border-indigo-100 placeholder:text-gray-300 shadow-sm"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="relative flex items-center bg-gray-50/50 rounded-[1.5rem] p-1 border-2 border-transparent focus-within:border-indigo-100 transition-all">
                        <Filter className="w-5 h-5 ml-4 text-gray-400" />
                        <select
                            value={filterType}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="bg-transparent pl-3 pr-8 py-3 font-bold text-sm text-gray-900 outline-none appearance-none cursor-pointer"
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
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">Transaction & Timing</th>
                                <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">Details & Reference</th>
                                <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-center">Batch Size</th>
                                <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-right">Value</th>
                                <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-center">Download</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-12 py-12">
                                            <div className="h-10 bg-gray-100 rounded-[2rem] w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-12 py-40 text-center">
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
                                    <tr
                                        key={tx.id}
                                        onClick={() => {
                                            setSelectedTransaction(tx);
                                            setIsDetailModalOpen(true);
                                        }}
                                        className="hover:bg-indigo-50/30 transition-all group cursor-pointer"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-6">
                                                <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 flex-shrink-0 ${tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {tx.type === 'CREDIT' ? <ArrowDownLeft className="w-6 h-6 stroke-[3px]" /> : <ArrowUpRight className="w-6 h-6 stroke-[3px]" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center space-x-2 mb-0.5">
                                                        <p className="font-black text-gray-900 text-xl leading-none truncate">{tx.type === 'CREDIT' ? 'Wallet Top-up' : 'Bulk Distribution'}</p>
                                                        <Eye className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    <p className="text-gray-400 font-bold uppercase tracking-wider text-sm flex items-center">
                                                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                                        {new Date(tx.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1.5">
                                                <p className="text-xl font-black text-gray-800 leading-none">
                                                    {tx.paymentMethod || 'Wallet Balance'}
                                                </p>
                                                <p className="text-base font-bold text-gray-400 uppercase tracking-tight">
                                                    {tx.id}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {tx.recipientsCount > 0 ? (
                                                <span className="inline-flex items-center px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl font-black text-sm uppercase tracking-widest border border-indigo-100/50 whitespace-nowrap">
                                                    {tx.recipientsCount} recipients
                                                </span>
                                            ) : (
                                                <span className="text-gray-300 font-black text-sm">—</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-xl font-black text-sm uppercase tracking-wider ${tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                                                tx.status === 'FAILED' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'
                                                } whitespace-nowrap`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className={`text-xl font-black tracking-tight ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-gray-900'}`}>
                                                {tx.type === 'CREDIT' ? '+' : '-'}${tx.amount.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <button
                                                onClick={(e) => handleDownloadTransaction(e, tx)}
                                                title="Download this transaction as CSV"
                                                className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90 border border-indigo-100"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
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
                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
                                Page <span className="text-indigo-600">{page}</span> of <span className="text-indigo-600">{totalPages}</span>
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => { window.scrollTo({ top: 300, behavior: 'smooth' }); setPage(p => Math.max(1, p - 1)); }}
                                disabled={page === 1}
                                className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="w-10 h-10 flex items-center justify-center font-black text-sm text-indigo-600 bg-white border border-indigo-100 rounded-2xl shadow-sm">
                                {page}
                            </div>
                            <button
                                onClick={() => { window.scrollTo({ top: 300, behavior: 'smooth' }); setPage(p => Math.min(totalPages, p + 1)); }}
                                disabled={page === totalPages}
                                className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <TransactionDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                transaction={selectedTransaction}
            />
        </div >
    );
};

export default TransactionHistoryPage;
