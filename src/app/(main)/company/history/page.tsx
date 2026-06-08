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
    const pageSize = 10;

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
        <div className="w-full space-y-6 animate-in fade-in duration-300 pb-20">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1A1A1A]">Transaction History</h1>
                    <p className="text-xs text-[#6B7280]">Audit and download receipt records of your bulk distributions and wallet top-ups.</p>
                </div>
                <div>
                    <button
                        onClick={handleExportCSV}
                        disabled={isExporting}
                        className="flex items-center space-x-1.5 h-11 px-4 bg-white border border-[#E4E7EC] text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 text-xs cursor-pointer"
                    >
                        <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
                        <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
                    </button>
                </div>
            </div>

            {/* Advanced Filters Bar */}
            <div className="bg-white rounded-xl border border-[#E4E7EC] p-4 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by ID, payment method or recipient..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 focus:bg-white rounded-lg text-xs text-[#1A1A1A] outline-none border border-transparent focus:border-[#4C6EF5] transition-all placeholder:text-gray-400 font-medium"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <div className="relative flex items-center bg-gray-50 rounded-lg border border-transparent focus-within:border-[#4C6EF5] transition-all p-1">
                        <Filter className="w-3.5 h-3.5 ml-2 text-gray-400" />
                        <select
                            value={filterType}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="bg-transparent pl-2 pr-6 py-1.5 font-semibold text-xs text-[#1A1A1A] outline-none appearance-none cursor-pointer"
                        >
                            <option value="ALL">All Types</option>
                            <option value="DEBIT">Distributions</option>
                            <option value="CREDIT">Top-ups</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List / Table Section */}
            <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-[#E4E7EC]">
                                <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Transaction</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Reference ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-center">Batch Size</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-right">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4E7EC]">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-6">
                                            <div className="h-6 bg-gray-100 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <HistoryIcon className="w-12 h-12 text-gray-300 mb-3" />
                                            <p className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider">No matching transactions</p>
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
                                        className="hover:bg-gray-50 transition-all group cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-lg transition-transform group-hover:scale-105 flex-shrink-0 ${
                                                    tx.type === 'CREDIT' ? 'bg-green-50 text-[#16A34A]' : 'bg-blue-50 text-[#1A3E78]'
                                                }`}>
                                                    {tx.type === 'CREDIT' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[#1A1A1A] text-xs">
                                                        {tx.type === 'CREDIT' ? 'Wallet Top-up' : 'Bulk Distribution'}
                                                    </p>
                                                    <p className="text-[10px] text-[#6B7280] mt-0.5 flex items-center">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        {new Date(tx.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-xs font-semibold text-[#1A1A1A]">
                                                    {tx.paymentMethod || 'Wallet Balance'}
                                                </p>
                                                <p className="text-[10px] text-[#6B7280] font-mono mt-0.5">
                                                    {tx.id}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {tx.recipientsCount > 0 ? (
                                                <span className="inline-flex items-center px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase tracking-wider">
                                                    {tx.recipientsCount} recipients
                                                </span>
                                            ) : (
                                                <span className="text-gray-300 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                                tx.status === 'COMPLETED' ? 'bg-green-50 text-[#16A34A]' : 'bg-red-50 text-[#DC2626]'
                                            }`}>
                                                {tx.status === 'COMPLETED' ? 'Success' : 'Failed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className={`text-xs font-bold font-mono ${tx.type === 'CREDIT' ? 'text-[#16A34A]' : 'text-[#1A1A1A]'}`}>
                                                {tx.type === 'CREDIT' ? '+' : '-'}${tx.amount.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedTransaction(tx);
                                                        setIsDetailModalOpen(true);
                                                    }}
                                                    title="View Details"
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded bg-gray-50 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 border border-gray-200 hover:border-indigo-150 transition-all cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDownloadTransaction(e, tx)}
                                                    title="Download CSV Receipt"
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded bg-gray-50 hover:bg-[#4C6EF5] text-gray-400 hover:text-white border border-gray-200 hover:border-[#4C6EF5] transition-all cursor-pointer"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                </button>
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
                    <div className="px-6 py-4 bg-gray-50 border-t border-[#E4E7EC] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                                Page <span className="text-[#4C6EF5]">{page}</span> of <span className="text-[#4C6EF5]">{totalPages}</span>
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setPage(p => Math.max(1, p - 1)); }}
                                disabled={page === 1}
                                className="p-2 bg-white border border-[#E4E7EC] rounded text-gray-500 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm active:scale-95 cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="w-8 h-8 flex items-center justify-center font-bold text-xs text-[#4C6EF5] bg-white border border-[#E4E7EC] rounded">
                                {page}
                            </div>
                            <button
                                onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setPage(p => Math.min(totalPages, p + 1)); }}
                                disabled={page === totalPages}
                                className="p-2 bg-white border border-[#E4E7EC] rounded text-gray-500 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm active:scale-95 cursor-pointer"
                            >
                                <ChevronRight className="w-4 h-4" />
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
