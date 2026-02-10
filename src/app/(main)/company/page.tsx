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
  Activity,
  History,
  Eye,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WalletModal from '@/components/WalletModal';
import TransactionDetailModal from '@/components/TransactionDetailModal';
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
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
  const metrics = dashboardData?.metrics;
  const trendData = dashboardData?.trends || [];

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black text-gray-900 leading-tight tracking-tight">Welcome back, {user.name}</h2>
          <p className="text-xl text-gray-500 font-medium mt-2">Overview of your account status and recent distribution activities.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="flex items-center space-x-3 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 text-lg group"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            <span>Top-up Wallet</span>
          </button>
          <Link
            href="/company/distribution"
            className="flex items-center space-x-3 px-8 py-4 bg-white border-2 border-gray-100 text-gray-700 font-black rounded-2xl hover:bg-gray-50 transition-all text-lg"
          >
            <Send className="w-6 h-6" />
            <span>New Distribution</span>
          </Link>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <CreditCard className="w-6 h-6 font-black" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-lg tracking-widest uppercase">Safe</span>
          </div>
          <p className="text-sm text-gray-400 font-medium uppercase tracking-[0.2em]">Available Balance</p>
          <p className="text-4xl font-black text-gray-900 mt-1 font-mono tracking-tighter">${balance.toLocaleString()}</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Activity className="w-6 h-6 font-black" />
            </div>
            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg tracking-widest uppercase">30 Days</span>
          </div>
          <p className="text-sm text-gray-400 font-medium uppercase tracking-[0.2em]">Monthly Volume</p>
          <p className="text-4xl font-black text-gray-900 mt-1 font-mono tracking-tighter">${metrics?.monthlyVolume.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowDownLeft className="w-6 h-6 font-black" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg tracking-widest uppercase">All Time</span>
          </div>
          <p className="text-sm text-gray-400 font-medium uppercase tracking-[0.2em]">Total Reloads</p>
          <p className="text-4xl font-black text-gray-900 mt-1 font-mono tracking-tighter">${metrics?.totalReloads.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <Users className="w-6 h-6 font-black" />
            </div>
          </div>
          <p className="text-sm text-gray-400 font-medium uppercase tracking-[0.2em]">Total Recipients</p>
          <p className="text-4xl font-black text-gray-900 mt-1 font-mono tracking-tighter">{metrics?.totalRecipients.toLocaleString() || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <h3 className="font-black text-2xl text-gray-900">Distribution Trends</h3>
              <p className="text-base text-gray-400 font-medium tracking-tight">Real-time distribution volume for the last 7 days.</p>
            </div>
            <div className="flex items-center space-x-3 px-5 py-2.5 bg-gray-50 rounded-2xl">
              <span className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-gray-600 uppercase tracking-widest">Live Data</span>
            </div>
          </div>
          <div className="h-[450px]">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 14, fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 14, fontWeight: 700 }} dx={-10} />
                  <Tooltip
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <History className="w-16 h-16 mb-4" />
                <p className="font-black uppercase tracking-widest">Insufficient data for trends</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-2xl text-gray-900">Quick History</h3>
            <Link href="/company/history" className="text-indigo-600 text-sm font-black uppercase tracking-widest hover:text-indigo-700 transition-colors">View All</Link>
          </div>
          <div className="space-y-6">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 opacity-30">
                <Activity className="w-16 h-16 mb-4" />
                <p className="text-base font-black uppercase tracking-widest">No recent activity</p>
              </div>
            ) : transactions.map((tx: any) => (
              <div
                key={tx.id}
                onClick={() => {
                  setSelectedTransaction(tx);
                  setIsDetailModalOpen(true);
                }}
                className="flex items-center space-x-6 p-6 hover:bg-gray-50 rounded-[2.5rem] transition-all cursor-pointer group border border-transparent hover:border-gray-100"
              >
                <div className={`p-5 rounded-2xl group-hover:scale-110 transition-transform ${tx.type === 'CREDIT' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {tx.type === 'CREDIT' ? <ArrowDownLeft className="w-7 h-7" /> : <ArrowUpRight className="w-7 h-7" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <p className="text-xl font-black text-gray-900 truncate">
                      {tx.type === 'CREDIT' ? 'Wallet Reload' : `Bulk Distribution`}
                    </p>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>
                  <p className="text-base text-gray-400 font-medium uppercase tracking-widest mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={`text-right ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-gray-900'} font-black text-2xl font-mono tracking-tighter`}>
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

      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default CompanyDashboard;
