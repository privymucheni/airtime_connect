'use client';

import React from 'react';
import {
    X,
    Building2,
    Mail,
    Calendar,
    Wallet,
    Shield,
    Activity,
    ArrowUpRight,
    CheckCircle2,
    XCircle,
    Clock
} from 'lucide-react';
import { UserStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface CompanyDetailsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    company: any;
    onStatusUpdate: (id: string, status: UserStatus) => void;
}

const CompanyDetailsSheet: React.FC<CompanyDetailsSheetProps> = ({
    isOpen,
    onClose,
    company,
    onStatusUpdate
}) => {
    const router = useRouter();

    if (!isOpen || !company) return null;

    const handleViewLogs = () => {
        const searchName = company.companyName || company.name;
        router.push(`/admin/logs?search=${encodeURIComponent(searchName)}`);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 z-[70] w-full max-w-xl bg-white shadow-2xl transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-black text-xl">
                                {(company.companyName || company.name).charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 leading-tight">
                                    {company.companyName || company.name}
                                </h2>
                                <div className="flex items-center mt-1">
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${company.status === UserStatus.ACTIVE ? 'bg-green-100 text-green-700' :
                                        company.status === UserStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {company.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-900"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                        {/* Stats Overview */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                                <div className="p-2 bg-white rounded-xl w-fit mb-3 shadow-sm">
                                    <Wallet className="w-5 h-5 text-indigo-600" />
                                </div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Balance</p>
                                <p className="text-2xl font-black text-gray-900 mt-1">
                                    ${(company.wallet?.balance || 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                                <div className="p-2 bg-white rounded-xl w-fit mb-3 shadow-sm">
                                    <Activity className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Transactions</p>
                                <p className="text-2xl font-black text-gray-900 mt-1">
                                    {company._count?.transactions || 0}
                                </p>
                            </div>
                        </div>

                        {/* Core Details */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Company Profile</h3>

                            <div className="space-y-4">
                                <div className="flex items-start space-x-4">
                                    <div className="p-2.5 bg-gray-50 rounded-xl">
                                        <Building2 className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Legal Name</p>
                                        <p className="text-sm font-bold text-gray-900 mt-0.5">{company.companyName || company.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="p-2.5 bg-gray-50 rounded-xl">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Email</p>
                                        <p className="text-sm font-bold text-gray-900 mt-0.5">{company.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="p-2.5 bg-gray-50 rounded-xl">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registration Date</p>
                                        <p className="text-sm font-bold text-gray-900 mt-0.5">
                                            {new Date(company.createdAt).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="p-2.5 bg-gray-50 rounded-xl">
                                        <Shield className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account ID</p>
                                        <p className="text-xs font-mono font-bold text-gray-500 mt-1 truncate">{company.id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Management */}
                        <div className="p-8 bg-gray-950 rounded-[2.5rem] text-white">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-indigo-400" />
                                Administrative Controls
                            </h3>

                            <div className="space-y-4">
                                {company.status !== UserStatus.ACTIVE && (
                                    <button
                                        onClick={() => onStatusUpdate(company.id, UserStatus.ACTIVE)}
                                        className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-2xl font-black text-sm flex items-center justify-center space-x-3 transition-all shadow-lg shadow-green-900/20"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>Activate Account</span>
                                    </button>
                                )}

                                {company.status !== UserStatus.SUSPENDED && (
                                    <button
                                        onClick={() => onStatusUpdate(company.id, UserStatus.SUSPENDED)}
                                        className="w-full py-4 bg-red-600/10 hover:bg-red-600 border border-red-600/30 rounded-2xl font-black text-sm flex items-center justify-center space-x-3 transition-all text-red-500 hover:text-white"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        <span>Suspend Account</span>
                                    </button>
                                )}

                                <button
                                    onClick={handleViewLogs}
                                    className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-sm flex items-center justify-center space-x-3 transition-all"
                                >
                                    <ArrowUpRight className="w-5 h-5 text-indigo-400" />
                                    <span>View Full Logs</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-50 bg-gray-50/50">
                        <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest leading-relaxed">
                            AirFlow Enterprise • Data Protection Enabled • Admin Tier
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CompanyDetailsSheet;
