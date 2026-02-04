'use client';

import React from 'react';
import { Shield, LogIn, Send, CreditCard, Search, Download } from 'lucide-react';

const MOCK_LOGS = [
    { id: 1, type: 'distribution', message: 'Acme Corp distributed $12,500 to 150 employees', user: 'Finance Admin', time: '2 mins ago', icon: Send, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 2, type: 'login', message: 'Admin login detected from new IP: 192.168.1.45', user: 'System', time: '15 mins ago', icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 3, type: 'wallet', message: 'Global Tech Hub loaded $50,000 via Bank Transfer', user: 'Billing Dept', time: '1 hour ago', icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 4, type: 'auth', message: 'User password change requested for user jane@sunrise.com', user: 'Self Service', time: '3 hours ago', icon: LogIn, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 5, type: 'distribution', message: 'Blue Sky Media airtime distribution failed for 3 recipients', user: 'Ops Bot', time: '5 hours ago', icon: Send, color: 'text-red-600', bg: 'bg-red-50' },
];

const AdminSystemLogs: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">System Activity Logs</h2>
                    <p className="text-gray-500 text-sm">Audit trail of all administrative and financial actions.</p>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium">
                    <Download className="w-4 h-4" />
                    <span>Export Logs</span>
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex items-center bg-gray-50/30">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Filter by action or user..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 focus:border-indigo-500 rounded-xl outline-none text-sm transition-all"
                        />
                    </div>
                </div>

                <div className="divide-y divide-gray-50">
                    {MOCK_LOGS.map((log) => (
                        <div key={log.id} className="p-5 flex items-start space-x-4 hover:bg-gray-50 transition-colors">
                            <div className={`p-3 rounded-2xl shrink-0 ${log.bg} ${log.color}`}>
                                <log.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-bold text-gray-900 truncate pr-4">{log.message}</p>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">{log.time}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500 font-medium">{log.user}</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span className="text-xs text-gray-400 italic uppercase tracking-widest">{log.type}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-gray-50 text-center">
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Load Older Activity</button>
                </div>
            </div>
        </div>
    );
};

export default AdminSystemLogs;
