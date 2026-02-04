'use client';

import React, { useState } from 'react';
import { X, Check, CreditCard, Shield, Gift, Zap } from 'lucide-react';
import { topUpWallet } from '@/actions/company';
import { useAuth } from './AuthContext';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, currentBalance }) => {
  const [step, setStep] = useState<'amount' | 'payment'>('amount');
  const [amount, setAmount] = useState<number>(1000);
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoApplied, setPromoApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { update } = useAuth();

  if (!isOpen) return null;

  const handleApplyPromo = () => {
    setIsApplyingPromo(true);
    setTimeout(() => {
      setIsApplyingPromo(false);
      setPromoApplied(true);
    }, 1000);
  };

  const handleCompletePayment = async () => {
    setIsProcessing(true);
    try {
      const finalAmount = promoApplied ? amount * 1.05 : amount; // Assuming promo adds bonus
      await topUpWallet(amount);
      await update(); // Sync session balance
      onClose();
    } catch (error) {
      console.error("Payment failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const finalAmount = promoApplied ? amount * 0.95 : amount;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Reload Wallet</h3>
            <p className="text-gray-500 text-sm">Prepay to start distributing airtime</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {step === 'amount' ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[500, 1000, 2500, 5000, 10000, 25000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`py-4 rounded-2xl font-bold transition-all border-2 ${amount === val
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105'
                        : 'bg-white border-gray-100 text-gray-700 hover:border-indigo-200 hover:bg-indigo-50/30'
                      }`}
                  >
                    ${val.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Or enter custom amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-2xl font-bold outline-none transition-all"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">Processing Fee (0%)</span>
                  <span className="text-gray-900 font-bold">$0.00</span>
                </div>
                <div className="flex items-center justify-between text-xl font-bold border-t border-gray-100 pt-3">
                  <span className="text-gray-900">Total to Pay</span>
                  <span className="text-indigo-600">${amount.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setStep('payment')}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 transition-all transform hover:-translate-y-0.5"
              >
                Proceed to Checkout
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 border border-gray-100 rounded-2xl bg-gray-50">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <CreditCard className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Payment Summary</p>
                  <p className="text-xs text-gray-500">Ref: TOPUP-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-lg font-bold text-gray-900">${finalAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">Promo Code</label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Gift className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition-all uppercase font-bold"
                    />
                  </div>
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoApplied || !promoCode}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${promoApplied
                        ? 'bg-green-100 text-green-700'
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                      }`}
                  >
                    {isApplyingPromo ? (
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : promoApplied ? (
                      <Check className="w-5 h-5" />
                    ) : 'Apply'}
                  </button>
                </div>
                {promoApplied && <p className="text-xs font-bold text-green-600">Applied: 5% Early Bird Discount!</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center p-4 border border-indigo-200 bg-indigo-50/50 rounded-2xl hover:border-indigo-400 transition-all group">
                  <CreditCard className="w-8 h-8 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-gray-700">Bank Transfer</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 border border-gray-100 hover:border-indigo-200 rounded-2xl transition-all group">
                  <Zap className="w-8 h-8 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-gray-700">Instant API</span>
                </button>
              </div>

              <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs">
                <Shield className="w-4 h-4" />
                <span>Secure SSL Encrypted Payment</span>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('amount')}
                  className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleCompletePayment}
                  disabled={isProcessing}
                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : 'Complete Payment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
