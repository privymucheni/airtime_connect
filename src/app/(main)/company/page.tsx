'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import {
  Plus,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Send,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WalletModal from '@/components/WalletModal';
import Link from 'next/link';
import { getCompanyDashboardData } from '@/actions/company';

const MOCK_DATA = [
  { name: 'Mon', amount: 4000 },
  { name: 'Tue', amount: 3000 },
  { name: 'Wed', amount: 2000 },
  { name: 'Thu', amount: 2780 },
  { name: 'Fri', amount: 1890 },
  { name: 'Sat', amount: 2390 },
  { name: 'Sun', amount: 3490 },
];

const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getCompanyDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, []);

  if (!user || isLoadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const transactions = dashboardData?.transactions || [];
  const balance = dashboardData?.user?.balance ?? user.balance;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}</h2>
          <p className="text-gray-500">Overview of your account status and recent distribution activities.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
          >
            <Plus className="w-5 h-5" />
            <span>Top-up Wallet</span>
          </button>
          <Link
            href="/company/distribution"
            className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            <Send className="w-5 h-5" />
            <span>New Distribution</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              12%
            </span>
          </div>
          <p className="text-sm text-gray-500 font-medium tracking-wide">Available Balance</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${balance.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Send className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Last 30 days</span>
          </div>
          <p className="text-sm text-gray-500 font-medium tracking-wide">Monthly Volume</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${dashboardData?.monthlyVolume.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Real-time</span>
          </div>
          <p className="text-sm text-gray-500 font-medium tracking-wide">Total Recipients</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardData?.totalRecipients.toLocaleString() || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Distribution Trends</h3>
            <select className="text-sm bg-gray-50 border-none rounded-lg px-2 py-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_DATA}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Quick History</h3>
            <Link href="/company/history" className="text-indigo-600 text-sm font-semibold hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">No transactions yet.</p>
            ) : transactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group">
                <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${tx.type === 'CREDIT' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {tx.type === 'CREDIT' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {tx.type === 'CREDIT' ? 'Wallet Reload' : `Bulk Distribution`}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                </div>
                <div className={`text-right ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-gray-900'} font-bold`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}${tx.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        currentBalance={balance}
      />
    </div>
  );
};

export default CompanyDashboard;
