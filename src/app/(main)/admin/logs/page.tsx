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
  CheckCircle2,
  Settings
} from 'lucide-react';
import { getSystemLogs } from '@/actions/admin';
import { formatDistanceToNow } from 'date-fns';
import { useSearchParams } from 'next/navigation';

const getLogIcon = (action: string) => {
  const a = action.toLowerCase();
  if (a.includes('login') || a.includes('auth')) return { icon: LogIn, color: 'text-amber-600', bg: 'bg-amber-50' };
  if (a.includes('distribute') || a.includes('send')) return { icon: Send, color: 'text-indigo-600', bg: 'bg-indigo-50' };
  if (a.includes('wallet') || a.includes('topup')) return { icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50' };
  if (a.includes('admin') || a.includes('system')) return { icon: Shield, color: 'text-red-600', bg: 'bg-red-50' };
  return { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' };
};

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
    <div className="w-full space-y-8 animate-in fade-in duration-700 pb-16">
      {/* Top Bar with Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-indigo-600">System Audit</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit Trail</h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Real-time oversight of all administrative and financial operations.</p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchLogs}
            className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center space-x-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold text-xs shadow-sm transition-all active:scale-95 cursor-pointer">
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Audit Data</span>
          </button>
        </div>
      </div>

      {/* Logs Feed Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col justify-between">
        {/* Table Filter Area */}
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Filter by event, user, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl outline-none text-xs font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <div className="hidden md:flex items-center space-x-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1.5 bg-white border border-slate-150 rounded-lg shadow-sm">
            <Clock className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>Live Sync Active</span>
          </div>
        </div>

        {/* Content list */}
        {isLoading ? (
          <div className="flex-grow flex flex-col items-center justify-center py-32 animate-in fade-in duration-300">
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-4 tracking-wider animate-pulse">Accessing Audit Vault...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center py-28 text-center px-4">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-4 text-slate-400 shadow-sm">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-semibold text-slate-900">No activity logs found</h3>
            <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">Your search query didn't match any historical system events.</p>
          </div>
        ) : (
          <div className="flex-grow divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const { icon: LogIcon, color, bg } = getLogIcon(log.action || log.message);
              return (
                <div key={log.id} className="p-5 flex items-start space-x-4 hover:bg-slate-50/40 transition-all group">
                  <div className={`p-2 rounded-xl shrink-0 transition-transform group-hover:scale-105 duration-300 border border-transparent group-hover:border-slate-200/40 ${bg} ${color}`}>
                    <LogIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5 gap-4">
                      <p className="text-xs font-semibold text-slate-800 leading-normal tracking-tight pr-6">
                        {log.message}
                      </p>
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200/40 px-2 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="flex items-center text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md shadow-sm">
                        <User className="w-3 h-3 mr-1.5 text-indigo-400" />
                        <span>{log.user?.companyName || log.user?.name || 'System Action'}</span>
                      </div>
                      <div className="flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        <Settings className="w-3 h-3 mr-1.5" />
                        {log.action || 'GENERAL'}
                      </div>
                      <div className="flex items-center text-[9px] font-bold text-slate-400 font-mono italic">
                        ID: {log.id.slice(-8)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-55 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Showing {filteredLogs.length} of {logs.length} Total Events
          </p>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold text-xs transition-all shadow-sm active:scale-95 cursor-pointer">
            Load Full History
          </button>
        </div>
      </div>

      {/* System Integrity Bottom Panel */}
      <div className="p-6 bg-slate-900 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl -mr-32 -mt-32 rounded-full"></div>
        <div className="relative z-10 max-w-3xl text-center md:text-left">
          <h3 className="text-sm font-bold mb-1">Enterprise Security Protocol</h3>
          <p className="text-slate-300 font-medium text-xs leading-relaxed opacity-95">
            System logs are immutable and stored for 36 months to ensure regulatory compliance. All sensitive financial data is masked according to international data protection standards.
          </p>
        </div>
        <div className="shrink-0 flex items-center space-x-3.5 relative z-10 bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-md">
          <div className="p-2 bg-indigo-650 text-white rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[8px] font-bold uppercase tracking-widest text-indigo-300 leading-none mb-1">Compliance Status</p>
            <p className="text-xs font-bold text-white">Full Integrity Mode</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminSystemLogsPage = () => {
  return (
    <React.Suspense fallback={
      <div className="flex flex-col items-center justify-center py-32 animate-in fade-in">
        <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500 mt-4 tracking-wider animate-pulse">Loading Secure Audit Interface...</p>
      </div>
    }>
      <AdminSystemLogs />
    </React.Suspense>
  );
};

export default AdminSystemLogsPage;
