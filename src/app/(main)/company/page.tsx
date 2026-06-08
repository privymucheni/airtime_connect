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
  ChevronRight,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WalletModal from '@/components/WalletModal';
import TransactionDetailModal from '@/components/TransactionDetailModal';
import Link from 'next/link';
import { getCompanyDashboardData } from '@/actions/company';

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
      <div className="space-y-8 animate-pulse">
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 bg-white border border-[#E4E7EC] rounded-xl p-6 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-2">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-40 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts & Quick History Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[450px] bg-white border border-[#E4E7EC] rounded-xl p-6">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-72 bg-gray-100 rounded-lg"></div>
          </div>
          <div className="h-[450px] bg-white border border-[#E4E7EC] rounded-xl p-6">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const transactions = dashboardData?.transactions || [];
  const balance = dashboardData?.user?.balance ?? user.balance;
  const metrics = dashboardData?.metrics;
  const trendData = dashboardData?.trends || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10">
      {/* 4 Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric Card 1: Available Balance */}
        <div className="bg-white p-6 rounded-xl border border-[#E4E7EC] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280]">Available Balance</span>
            <div className="p-2 rounded-lg bg-blue-50 text-[#1A3E78]">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#1A1A1A] font-mono tracking-tight">${balance.toLocaleString()}</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Funds available for distribution</p>
          </div>
        </div>

        {/* Metric Card 2: Monthly Volume */}
        <div className="bg-white p-6 rounded-xl border border-[#E4E7EC] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280]">Monthly Volume</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-[#4C6EF5]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#1A1A1A] font-mono tracking-tight">${metrics?.monthlyVolume.toLocaleString() || 0}</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Last 30 days</p>
          </div>
        </div>

        {/* Metric Card 3: Total Reloads */}
        <div className="bg-white p-6 rounded-xl border border-[#E4E7EC] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280]">Total Reloads</span>
            <div className="p-2 rounded-lg bg-green-50 text-[#16A34A]">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#1A1A1A] font-mono tracking-tight">${metrics?.totalReloads.toLocaleString() || 0}</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">All-time reloads</p>
          </div>
        </div>

        {/* Metric Card 4: Recipients */}
        <div className="bg-white p-6 rounded-xl border border-[#E4E7EC] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280]">Recipients</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#1A1A1A] font-mono tracking-tight">{metrics?.totalRecipients.toLocaleString() || 0}</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Unique recipients</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Distribution Trends Chart & Quick History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Distribution Trends Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E4E7EC] shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-[#1A1A1A]">Distribution Trends</h3>
              <p className="text-xs text-[#6B7280]">Real-time daily volume for the last 7 days.</p>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg">
              <span className="w-2 h-2 bg-[#4C6EF5] rounded-full animate-pulse"></span>
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Live</span>
            </div>
          </div>

          <div className="h-[320px]">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4C6EF5" />
                      <stop offset="100%" stopColor="#1A3E78" />
                    </linearGradient>
                    <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4C6EF5" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#4C6EF5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12 }} 
                    dy={8} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12 }} 
                    dx={-8} 
                  />
                  <Tooltip
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid #E4E7EC', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', 
                      padding: '10px' 
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#1A1A1A', fontSize: 12 }}
                    itemStyle={{ fontSize: 12, color: '#4C6EF5' }}
                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Daily Distribution Volume']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="url(#strokeGrad)" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#fillGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50 p-6">
                <History className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Insufficient data for trends</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick History List */}
        <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-[#1A1A1A]">Quick History</h3>
            <Link 
              href="/company/history" 
              className="text-xs font-semibold text-[#4C6EF5] hover:text-indigo-700 transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px] pr-1">
            {transactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                <Activity className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">No recent activity</p>
              </div>
            ) : (
              transactions.map((tx: any) => (
                <div
                  key={tx.id}
                  onClick={() => {
                    setSelectedTransaction(tx);
                    setIsDetailModalOpen(true);
                  }}
                  className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-xl transition-all cursor-pointer border border-[#E4E7EC] hover:border-[#4C6EF5] group bg-white shadow-sm"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      tx.type === 'CREDIT' ? 'bg-green-50 text-[#16A34A]' : 'bg-blue-50 text-[#1A3E78]'
                    }`}>
                      {tx.type === 'CREDIT' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1A1A1A] truncate">
                        {tx.type === 'CREDIT' ? 'Wallet Reload' : 'Bulk Distribution'}
                      </p>
                      <p className="text-[10px] text-[#6B7280] mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className={`text-xs font-bold font-mono ${
                        tx.type === 'CREDIT' ? 'text-[#16A34A]' : 'text-[#1A1A1A]'
                      }`}>
                        {tx.type === 'CREDIT' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </p>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wide mt-0.5 uppercase ${
                        tx.status === 'COMPLETED' ? 'bg-green-50 text-[#16A34A]' : 'bg-red-50 text-[#DC2626]'
                      }`}>
                        {tx.status === 'COMPLETED' ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </div>
              ))
            )}
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
