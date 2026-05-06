'use client';

import React from 'react';
import {
    X,
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    Hash,
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    ExternalLink,
    Download,
} from 'lucide-react';

interface Recipient {
    id: string;
    name: string;
    phoneNumber: string;
    amount: number;
    status: string;
}

interface Transaction {
    id: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    recipientsCount: number;
    recipients?: Recipient[];
}

interface TransactionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
    isOpen,
    onClose,
    transaction,
}) => {
    if (!isOpen || !transaction) return null;

    const isCredit = transaction.type === 'CREDIT';

    const handleDownload = () => {
        if (!transaction) return;

        const lines: string[] = [];

        // Transaction summary header rows
        lines.push(`Transaction ID,${transaction.id}`);
        lines.push(`Type,${isCredit ? 'Wallet Top-up' : 'Bulk Distribution'}`);
        lines.push(`Amount,${isCredit ? '+' : '-'}$${transaction.amount.toFixed(2)}`);
        lines.push(`Status,${transaction.status}`);
        lines.push(`Payment Method,${transaction.paymentMethod || 'Wallet Balance'}`);
        lines.push(`Date,${new Date(transaction.createdAt).toLocaleString()}`);
        lines.push(`Recipients Count,${transaction.recipientsCount}`);

        if (!isCredit && transaction.recipients && transaction.recipients.length > 0) {
            lines.push(''); // blank separator
            lines.push('Recipient Name,Phone Number,Amount,Status');
            transaction.recipients.forEach((r) => {
                lines.push(
                    [
                        `"${r.name || 'Unknown'}"`,
                        r.phoneNumber,
                        `$${r.amount.toFixed(2)}`,
                        r.status,
                    ].join(',')
                );
            });
        }

        const csvContent = lines.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `transaction_${transaction.id}_${new Date(transaction.createdAt).toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
                {/* Header */}
                <div className={`p-8 flex items-center justify-between border-b border-gray-50 ${isCredit ? 'bg-emerald-50/30' : 'bg-rose-50/30'}`}>
                    <div className="flex items-center space-x-4">
                        <div className={`p-4 rounded-2xl ${isCredit ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {isCredit ? <ArrowDownLeft className="w-8 h-8 stroke-[3px]" /> : <ArrowUpRight className="w-8 h-8 stroke-[3px]" />}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 leading-tight">
                                {isCredit ? 'Wallet Reload' : 'Bulk Distribution'}
                            </h3>
                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center mt-1">
                                <Hash className="w-3.5 h-3.5 mr-1.5" />
                                {transaction.id.toUpperCase()}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white rounded-2xl transition-colors text-gray-400 hover:text-gray-900 shadow-sm"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-10 max-h-[70vh] overflow-y-auto">
                    {/* Main Info */}
                    <div className="grid grid-cols-2 gap-8 mb-12">
                        <div className="space-y-2">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Amount Involved</p>
                            <p className={`text-4xl font-black font-mono tracking-tighter ${isCredit ? 'text-emerald-600' : 'text-gray-900'}`}>
                                {isCredit ? '+' : '-'}${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="space-y-2 text-right">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Transaction Status</p>
                            <div className="flex justify-end">
                                <span className={`inline-flex items-center px-6 py-2 rounded-xl font-black text-sm uppercase tracking-widest border ${transaction.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    transaction.status === 'FAILED' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                        'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                    {transaction.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 mr-2" />}
                                    {transaction.status === 'FAILED' && <XCircle className="w-4 h-4 mr-2" />}
                                    {transaction.status === 'PENDING' && <Clock className="w-4 h-4 mr-2 animate-spin" />}
                                    {transaction.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-12 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100">
                        <div className="flex items-start space-x-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                <Calendar className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date & Time</p>
                                <p className="font-black text-gray-900">{new Date(transaction.createdAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                <CreditCard className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Method</p>
                                <p className="font-black text-gray-900">{transaction.paymentMethod || 'Wallet Balance'}</p>
                            </div>
                        </div>
                    </div>

                    {!isCredit && transaction.recipients && transaction.recipients.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xl font-black text-gray-900 flex items-center">
                                    <Users className="w-6 h-6 mr-3 text-indigo-600" />
                                    Recipients ({transaction.recipientsCount})
                                </h4>
                            </div>

                            <div className="space-y-3">
                                {transaction.recipients.map((recipient) => (
                                    <div key={recipient.id} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-indigo-100 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center font-black text-indigo-600 border border-gray-100 uppercase">
                                                {recipient.name?.charAt(0) || recipient.phoneNumber.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900">{recipient.name || 'Unknown Recipient'}</p>
                                                <p className="text-sm text-gray-400 font-bold font-mono tracking-tight">{recipient.phoneNumber}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-gray-900 font-mono">${recipient.amount.toFixed(2)}</p>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${recipient.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                                {recipient.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <button
                        onClick={handleDownload}
                        className="flex items-center space-x-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 text-sm"
                    >
                        <Download className="w-4 h-4" />
                        <span className="uppercase tracking-widest">Download CSV</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="px-10 py-4 bg-white border-2 border-gray-100 text-gray-900 font-black rounded-2xl hover:bg-gray-50 transition-all shadow-xl shadow-gray-100 hover:scale-105 active:scale-95"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailModal;
