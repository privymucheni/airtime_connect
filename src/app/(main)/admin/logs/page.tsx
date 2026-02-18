'use client';

import React, { useState, useEffect } from 'react';
import {
    Shield,
    LogIn,
    Send,
    CreditCard,
    Search,
    Download,
    RefreshCcw,
    Activity,
    Clock,
    User,
    AlertCircle,
    CheckCircle2,
    Settings
} from 'lucide-react';
import { getSystemLogs } from '@/actions/admin';
import { formatDistanceToNow } from 'date-fns';

const getLogIcon = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes('login') || a.includes('auth')) return { icon: LogIn, color: 'text-amber-600', bg: 'bg-amber-50' };
    if (a.includes('distribute') || a.includes('send')) return { icon: Send, color: 'text-indigo-600', bg: 'bg-indigo-50' };
    if (a.includes('wallet') || a.includes('topup')) return { icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50' };
    if (a.includes('admin') || a.includes('system')) return { icon: Shield, color: 'text-red-600', bg: 'bg-red-50' };
    return { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' };
};

import { useSearchParams } from 'next/navigation';

const AdminSystemLogs: React.FC = () => {
    const searchParams = useSearchParams();
    const querySearch = searchParams.get('search');
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(querySearch || '');

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const data = await getSystemLogs();
            setLogs(data);
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        if (querySearch) {
            setSearchTerm(querySearch);
        }
    }, [querySearch]);

    const filteredLogs = logs.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user?.companyName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center">
                        <Activity className="w-8 h-8 mr-3 text-indigo-600" />
                        System Audit Trail
                    </h2>
                    <p className="text-lg text-gray-500 font-medium mt-1">Real-time oversight of all administrative and financial operations.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchLogs}
                        className="p-3 bg-white border border-gray-100 text-gray-500 rounded-2xl hover:bg-gray-50 transition-all shadow-sm group"
                        title="Refresh Logs"
                    >
                        <RefreshCcw className={`w-5 h-5 group-active:rotate-180 transition-transform duration-500 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button className="flex items-center space-x-3 px-8 py-5 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 font-black shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 text-lg">
                        <Download className="w-6 h-6 stroke-[3px] text-indigo-600" />
                        <span>Export Audit Data</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <div className="relative flex-1 max-w-3xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 font-black" />
                        <input
                            type="text"
                            placeholder="Filter by event, user, or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-3.5 bg-white border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl outline-none text-sm transition-all font-medium"
                        />
                    </div>
                    <div className="hidden md:flex items-center space-x-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4 bg-gray-50/50 py-2 rounded-lg border border-gray-100/50">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <span>Live Sync Enabled</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Accessing Audit Vault...</p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <Search className="w-10 h-10 text-gray-200" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">No activity logs found</h3>
                            <p className="text-gray-400 mt-2 max-w-xs mx-auto text-sm font-medium">Your search query didn't match any historical system events.</p>
                        </div>
                    ) : (
                        filteredLogs.map((log) => {
                            const { icon: LogIcon, color, bg } = getLogIcon(log.action || log.message);
                            return (
                                <div key={log.id} className="p-6 flex items-start space-x-6 hover:bg-gray-50/80 transition-all group">
                                    <div className={`p-4 rounded-2xl shrink-0 transition-transform group-hover:scale-110 duration-300 ${bg} ${color}`}>
                                        <LogIcon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-lg font-medium text-gray-900 leading-snug pr-8 tracking-tight">
                                                {log.message}
                                            </p>
                                            <span className="text-[10px] font-medium text-gray-600 bg-gray-100/80 px-3 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap border border-gray-200/50">
                                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="flex items-center text-xs font-medium text-gray-500 bg-white border border-gray-100 px-3 py-1.5 rounded-lg shadow-sm">
                                                <User className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                                                <span>{log.user?.companyName || log.user?.name || 'System Action'}</span>
                                            </div>
                                            <div className="flex items-center text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl uppercase tracking-widest">
                                                <Settings className="w-4 h-4 mr-2" />
                                                {log.action || 'GENERAL'}
                                            </div>
                                            <div className="flex items-center text-xs font-black text-gray-400 italic px-2">
                                                ID: {log.id.slice(-8)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
                        Showing {filteredLogs.length} of {logs.length} Total Events
                    </p>
                    <button className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-100 font-bold text-sm transition-all shadow-sm">
                        Load Full History
                    </button>
                </div>
            </div>

            <div className="p-10 bg-indigo-600 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-indigo-200 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full"></div>
                <div className="relative z-10 max-w-5xl text-center md:text-left">
                    <h3 className="text-3xl font-black mb-3">Enterprise Security Protocol</h3>
                    <p className="text-indigo-100 font-medium leading-relaxed opacity-90">
                        System logs are immutable and stored for 36 months to ensure regulatory compliance.
                        All sensitive financial data is masked according to international data protection standards.
                    </p>
                </div>
                <div className="shrink-0 flex items-center space-x-4 relative z-10">
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest mb-1 text-indigo-200">Compliance Status</p>
                        <p className="text-xl font-black text-white">Full Integrity Mode</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminSystemLogsPage = () => {
    return (
        <React.Suspense fallback={
            <div className="flex flex-col items-center justify-center py-32">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Loading Secure Audit Interface...</p>
            </div>
        }>
            <AdminSystemLogs />
        </React.Suspense>
    );
};

export default AdminSystemLogsPage;

