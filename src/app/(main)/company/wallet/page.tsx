'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthContext';
import { getCompanyTransactions, getCompanyDashboardData } from '@/actions/company';
import { 
  CreditCard, 
  ArrowDownLeft, 
  Zap, 
  Shield, 
  ChevronRight, 
  Calendar,
  History,
  Activity,
  Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import TransactionDetailModal from '@/components/TransactionDetailModal';

const WalletPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState<string>('1000');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchWalletData = useCallback(async () => {
    setLoading(true);
    try {
      const dashboard = await getCompanyDashboardData();
      setBalance(dashboard.user.balance);
      
      const historyData = await getCompanyTransactions(1, 10, "", "CREDIT");
      setTransactions(historyData.transactions);
    } catch (error) {
      console.error("Failed to load wallet data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleProceed = () => {
    const numericAmount = Number(amount) || 0;
    if (numericAmount <= 0) return;
    router.push(`/company/checkout?amount=${numericAmount}`);
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">My Wallet</h1>
        <p className="text-xs text-[#6B7280]">Manage your balance, add funds, and review reload transactions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Top-Up Widget & Balance Card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Balance Widget Card */}
          <div className="bg-gradient-to-br from-[#1A3E78] to-[#4C6EF5] p-6 rounded-xl text-white shadow-md flex flex-col justify-between h-44 relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] opacity-10 text-white">
              <CreditCard className="w-40 h-40" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-100 uppercase tracking-wider">Available Funds</span>
              <CreditCard className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              {loading ? (
                <div className="h-8 w-32 bg-white/20 rounded animate-pulse"></div>
              ) : (
                <h3 className="text-3xl font-bold font-mono tracking-tight">${balance.toLocaleString()}</h3>
              )}
              <p className="text-[10px] text-blue-100 mt-1 uppercase tracking-wider">Linked to: {user.companyName || user.name}</p>
            </div>
          </div>

          {/* Reload Portal Widget */}
          <div className="bg-white p-6 rounded-xl border border-[#E4E7EC] shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A]">Reload Wallet</h3>
              <p className="text-xs text-[#6B7280]">Select a preset amount or type a custom amount below.</p>
            </div>

            {/* Quick Amounts Selection */}
            <div className="grid grid-cols-2 gap-3">
              {[500, 1000, 2500, 5000].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(String(val))}
                  className={`py-3.5 rounded-lg font-bold text-sm transition-all border ${
                    Number(amount) === val
                      ? 'bg-[#4C6EF5] border-[#4C6EF5] text-white shadow-sm'
                      : 'bg-white border-[#E4E7EC] text-gray-700 hover:border-[#4C6EF5]'
                  }`}
                >
                  ${val.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Custom Amount Form */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Custom Reload Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-300">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const cleaned = raw === '' ? '' : String(Number(raw));
                    setAmount(cleaned);
                  }}
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-transparent focus:border-[#4C6EF5] focus:bg-white rounded-lg text-lg font-bold outline-none transition-all"
                />
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleProceed}
              disabled={!amount || Number(amount) <= 0}
              className="w-full py-3.5 bg-[#4C6EF5] hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Go to Checkout</span>
              <Zap className="w-4 h-4 fill-current" />
            </button>

            <div className="flex items-center justify-center space-x-2 text-gray-400 opacity-60 text-[9px] uppercase tracking-widest pt-2 border-t border-gray-100">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure Checkout SSL</span>
            </div>
          </div>
        </div>

        {/* Right Column: Reload Activity History */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E4E7EC] shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A]">Reload History</h3>
              <p className="text-xs text-[#6B7280]">List of all credit additions to your wallet.</p>
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-50 border border-gray-100 rounded-lg animate-pulse"></div>
              ))
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center opacity-40">
                <History className="w-12 h-12 mb-3 text-gray-300" />
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">No reload history</p>
              </div>
            ) : (
              transactions.map((tx: any) => (
                <div
                  key={tx.id}
                  onClick={() => {
                    setSelectedTransaction(tx);
                    setIsDetailModalOpen(true);
                  }}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-all cursor-pointer border border-[#E4E7EC] hover:border-[#4C6EF5] group bg-white shadow-sm"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="p-2.5 rounded-lg flex-shrink-0 bg-green-50 text-[#16A34A]">
                      <ArrowDownLeft className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1A1A1A] truncate">
                        Wallet Reload
                      </p>
                      <div className="flex items-center space-x-2 text-[10px] text-[#6B7280] mt-1">
                        <span className="font-mono text-gray-400">{tx.id}</span>
                        <span>•</span>
                        <span>{tx.paymentMethod || 'Credit Card'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#16A34A] font-mono">
                        +${tx.amount.toLocaleString()}
                      </p>
                      <div className="flex items-center space-x-1 justify-end mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-[9px] text-[#6B7280]">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default WalletPage;
