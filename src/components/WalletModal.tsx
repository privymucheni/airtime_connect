'use client';

import React, { useState } from 'react';
import { X, Shield, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, currentBalance }) => {
  const router = useRouter();
  const [amount, setAmount] = useState<string>('1000');

  if (!isOpen) return null;

  const handleProceed = () => {
    router.push(`/company/checkout?amount=${Number(amount) || 0}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose}></div>

      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-black text-gray-900 leading-tight">Reload Wallet</h3>
            <p className="text-gray-500 font-medium mt-1">Select an amount to continue</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 transition-all hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[500, 1000, 2500, 5000].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(String(val))}
                className={`py-6 rounded-2xl font-black transition-all border-2 text-xl ${Number(amount) === val
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100'
                  : 'bg-white border-gray-100 text-gray-700 hover:border-indigo-200'
                  }`}
              >
                ${val.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Custom Amount</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-300">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  // Strip leading zeros — convert to number then back to string
                  const raw = e.target.value;
                  const cleaned = raw === '' ? '' : String(Number(raw));
                  setAmount(cleaned);
                }}
                className="w-full pl-14 pr-8 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-3xl font-black outline-none transition-all"
              />
            </div>
          </div>

          <div className="p-6 bg-indigo-50 rounded-2xl space-y-3 border border-indigo-100/50">
            <div className="flex items-center justify-between text-lg">
              <span className="text-indigo-600 font-black">Estimated Credit</span>
              <span className="text-indigo-900 font-black font-mono text-xl">${(Number(amount) || 0).toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-indigo-400 font-bold leading-relaxed uppercase tracking-wider">
              * Final amount might vary if you apply a promo code during checkout.
            </p>
          </div>

          <button
            onClick={handleProceed}
            className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center group"
          >
            Go to Checkout
            <Zap className="w-6 h-6 ml-3 fill-current animate-pulse" />
          </button>
        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-100 flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2 text-gray-400 grayscale opacity-50">
            <Shield className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">SSL Secured</span>
          </div>
          <div className="w-px h-6 bg-gray-200"></div>
          <div className="flex items-center space-x-4 grayscale opacity-50">
            <div className="w-8 h-5 bg-gray-200 rounded-sm" title="Visa"></div>
            <div className="w-8 h-5 bg-gray-200 rounded-sm" title="Mastercard"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
