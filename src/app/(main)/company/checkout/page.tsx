'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    CreditCard,
    Smartphone,
    Globe,
    CheckCircle2,
    ChevronRight,
    ShieldCheck,
    Zap,
    Gift,
    ArrowLeft,
    AlertCircle,
    X,
    Info,
    AlertTriangle
} from 'lucide-react';
import { topUpWallet, validatePromoCode } from '@/actions/company';
import { useAuth } from '@/components/AuthContext';

const PAYMENT_METHODS = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50', description: 'Visa, Mastercard, etc.' },
    { id: 'ecocash', name: 'EcoCash', icon: Smartphone, color: 'text-green-600', bg: 'bg-green-50', description: 'Instant mobile money' },
];

const CheckoutPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { update } = useAuth();

    const [mode, setMode] = useState<'topup' | 'subscription'>('topup');
    const [amount, setAmount] = useState<number>(Number(searchParams.get('amount')) || 1000);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [selectedMethod, setSelectedMethod] = useState<string>('card');
    const [promoCode, setPromoCode] = useState('');
    const [promoData, setPromoData] = useState<any>(null);
    const [promoStatus, setPromoStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
    const [promoMessage, setPromoMessage] = useState('');

    const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '' });
    const [ecoCashNumber, setEcoCashNumber] = useState('');

    const [modal, setModal] = useState<{ isOpen: boolean, title: string, message: string, type: 'error' | 'success' | 'info' }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');

    const PLANS = [
        { id: 'silver', name: 'Silver Plan', price: 99, bonus: 5, features: ['Priority Support', '5% Extra Airtime', 'Monthly Analytics'] },
        { id: 'gold', name: 'Gold Plan', price: 299, bonus: 10, features: ['Dedicated Manager', '10% Extra Airtime', 'Advanced API Access'] },
        { id: 'platinum', name: 'Platinum Plan', price: 599, bonus: 15, features: ['Unlimited Users', '15% Extra Airtime', 'Custom White-labeling'] },
    ];

    const bonusPercent = promoData ? promoData.discountPercent : 0;
    const finalCredit = mode === 'topup' ? amount * (1 + bonusPercent / 100) : (selectedPlan ? selectedPlan.price * (1 + (selectedPlan.bonus + bonusPercent) / 100) : 0);
    const finalPrice = mode === 'topup' ? amount : (selectedPlan ? selectedPlan.price : 0);

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setPromoStatus('validating');
        try {
            const res = await validatePromoCode(promoCode);
            if (res.success && res.promo) {
                setPromoData(res.promo);
                setPromoStatus('success');
                setPromoMessage(`Success! ${res.promo.discountPercent}% bonus added.`);
            } else {
                setPromoStatus('error');
                setPromoMessage(res.message || 'Invalid code');
                setPromoData(null);
            }
        } catch (error) {
            setPromoStatus('error');
            setPromoMessage('Validation failed');
        }
    };

    const handlePayment = async () => {
        if (selectedMethod === 'card' && (!cardData.number || !cardData.expiry || !cardData.cvv)) {
            setModal({
                isOpen: true,
                title: 'Missing Information',
                message: 'Please fill in all card details to proceed with the payment.',
                type: 'error'
            });
            return;
        }
        if (selectedMethod === 'ecocash' && !ecoCashNumber) {
            setModal({
                isOpen: true,
                title: 'Mobile Number Required',
                message: 'Please enter your EcoCash mobile number.',
                type: 'error'
            });
            return;
        }

        if (amount <= 0) {
            setModal({
                isOpen: true,
                title: 'Invalid Amount',
                message: 'Please enter a valid top-up amount greater than zero.',
                type: 'error'
            });
            return;
        }

        setIsProcessing(true);
        setStep('processing');

        await new Promise(resolve => setTimeout(resolve, 2500));

        try {
            await topUpWallet(amount, selectedMethod, promoData?.id);
            await update();
            setStep('success');
        } catch (error: any) {
            console.error(error);
            setStep('details');
            setIsProcessing(false);
            setModal({
                isOpen: true,
                title: 'Payment Failed',
                message: error.message || 'We could not process your payment. Please check your details and try again.',
                type: 'error'
            });
        }
    };

    if (step === 'success') {
        return (
            <div className="max-w-xl mx-auto py-12 px-4 text-center">
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-600 animate-bounce" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Top-up Successful!</h1>
                    <p className="text-gray-500 mb-8 text-base">Your wallet has been credited with <span className="text-indigo-600 font-bold">${finalCredit.toLocaleString()}</span></p>

                    <div className="w-full bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Transaction ID</span>
                            <span className="text-gray-900 font-mono font-bold">TX-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Payment method</span>
                            <span className="text-gray-900 font-bold capitalize">{selectedMethod}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-gray-200 pt-3">
                            <span className="text-gray-500">Amount Paid</span>
                            <span className="text-gray-900 font-bold">${amount.toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/company')}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-xl shadow-indigo-100 text-sm uppercase tracking-widest"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => {
                            setStep('details');
                            setIsProcessing(false);
                            setPromoData(null);
                            setPromoCode('');
                        }}
                        className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
                    >
                        Make another top-up
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'processing') {
        return (
            <div className="max-w-xl mx-auto py-24 px-4 text-center">
                <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                        <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Securely processing payment...</h2>
                    <p className="text-sm text-gray-500 font-medium">Please do not refresh the page or click back.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <button
                onClick={() => router.back()}
                className="flex items-center text-gray-400 hover:text-indigo-600 font-black text-sm mb-8 transition-colors group uppercase tracking-widest"
            >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Details & Methods */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Checkout</h1>
                        <p className="text-lg text-gray-500 font-medium">Select your preferred top-up method or subscription plan.</p>
                    </section>

                    <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
                        <button
                            onClick={() => setMode('topup')}
                            className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${mode === 'topup' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Quick Top-up
                        </button>
                        <button
                            onClick={() => setMode('subscription')}
                            className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${mode === 'subscription' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Monthly Subscription
                        </button>
                    </div>

                    {mode === 'topup' ? (
                        <section className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-6">
                            <h2 className="text-lg font-bold text-gray-900">Choose Amount</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[500, 1000, 2500, 5000].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setAmount(val)}
                                        className={`py-4 rounded-xl font-black text-lg transition-all border-2 ${amount === val
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105'
                                            : 'bg-white border-gray-100 text-gray-700 hover:border-indigo-100'
                                            }`}
                                    >
                                        ${val.toLocaleString()}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-300">$</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-xl font-black text-2xl outline-none transition-all placeholder:text-gray-300"
                                    placeholder="Enter custom amount"
                                />
                            </div>
                        </section>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {PLANS.map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan)}
                                    className={`relative p-8 rounded-3xl border-2 text-left transition-all ${selectedPlan?.id === plan.id
                                        ? 'border-indigo-600 bg-indigo-50/50 shadow-2xl scale-[1.05] z-10'
                                        : 'border-gray-100 bg-white hover:border-indigo-200 shadow-sm'
                                        }`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${selectedPlan?.id === plan.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        <Zap className="w-7 h-7" />
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">{plan.name}</h3>
                                    <p className="text-2xl font-black text-indigo-600 mb-6">${plan.price}<span className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none ml-1">/mo</span></p>
                                    <ul className="space-y-2 mb-8">
                                        {plan.features.map(f => (
                                            <li key={f} className="text-sm font-bold text-gray-500 flex items-center">
                                                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    {selectedPlan?.id === plan.id && (
                                        <div className="absolute top-6 right-6 bg-indigo-600 text-white p-2 rounded-full shadow-lg">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    <section className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Payment Method</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            {PAYMENT_METHODS.map((method) => {
                                const Icon = method.icon;
                                return (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedMethod(method.id)}
                                        className={`flex items-center p-6 rounded-2xl border-2 transition-all ${selectedMethod === method.id
                                            ? 'border-indigo-600 bg-indigo-50/30'
                                            : 'border-gray-100 hover:border-indigo-100'
                                            }`}
                                    >
                                        <div className={`p-3 ${method.bg} ${method.color} rounded-xl mr-4`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900 text-sm leading-tight">{method.name}</p>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{method.description}</p>
                                        </div>
                                        {selectedMethod === method.id && (
                                            <div className="ml-auto bg-indigo-600 rounded-full p-1.5 shadow-xl shadow-indigo-100">
                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Conditional Payment Inputs */}
                        <div className="pt-8 border-t border-gray-100">
                            {selectedMethod === 'card' ? (
                                <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                    <h3 className="text-lg font-black text-gray-900">Card Information</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Card Number</label>
                                            <input
                                                type="text"
                                                placeholder="0000 0000 0000 0000"
                                                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-xl font-bold text-sm outline-none transition-all"
                                                value={cardData.number}
                                                onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expiry Date</label>
                                                <input
                                                    type="text"
                                                    placeholder="MM/YY"
                                                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-xl font-bold text-sm outline-none transition-all"
                                                    value={cardData.expiry}
                                                    onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CVV</label>
                                                <input
                                                    type="password"
                                                    placeholder="123"
                                                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-xl font-bold text-sm outline-none transition-all"
                                                    value={cardData.cvv}
                                                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                    <h3 className="text-lg font-black text-gray-900">EcoCash Details</h3>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                        <input
                                            type="text"
                                            placeholder="0770 000 000"
                                            className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-xl font-bold text-sm outline-none transition-all"
                                            value={ecoCashNumber}
                                            onChange={(e) => setEcoCashNumber(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: Summary */}
                <div className="lg:col-span-1">
                    <div className="sticky top-12 space-y-8">
                        <section className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-2xl border-t-8 border-t-indigo-600">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Order Item</span>
                                    <span className="text-gray-900 font-black text-sm uppercase">{mode === 'topup' ? 'Balance Reload' : (selectedPlan?.name || 'Select Plan')}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Subtotal</span>
                                    <span className="text-gray-900 font-black text-xl tracking-tight">${finalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Bonus</span>
                                    <span className="text-green-600 font-black text-xl tracking-tight">
                                        +${(finalCredit - finalPrice).toLocaleString()}
                                    </span>
                                </div>
                                <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                                    <span className="text-gray-900 font-black uppercase tracking-widest text-xs mb-1">Total Credit</span>
                                    <span className="text-3xl font-black text-indigo-600 leading-none tracking-tight">${finalCredit.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Promo Code</label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        placeholder="CODE"
                                        className="flex-1 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-black uppercase placeholder:text-gray-300 outline-none transition-all font-mono"
                                    />
                                    <button
                                        onClick={handleApplyPromo}
                                        disabled={promoStatus === 'validating' || !promoCode}
                                        className="px-5 py-3 bg-gray-900 text-white text-sm font-black rounded-xl hover:bg-black transition-all disabled:opacity-50"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {promoMessage && (
                                    <p className={`text-xs font-black flex items-center px-1 ${promoStatus === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                        {promoStatus === 'success' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
                                        {promoMessage}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={handlePayment}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-indigo-100 mb-6 flex items-center justify-center group uppercase tracking-widest"
                            >
                                Pay Securely
                                <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="flex items-center justify-center space-x-3 text-gray-400 text-xs font-black tracking-widest leading-none">
                                <ShieldCheck className="w-5 h-5 text-green-500" />
                                <span>SECURE SSL 256-BIT ENCRYPTION</span>
                            </div>
                        </section>

                        <div className="bg-indigo-600 rounded-3xl p-10 text-white overflow-hidden relative shadow-2xl">
                            <div className="relative z-10">
                                <div className="bg-white/20 w-fit p-4 rounded-2xl mb-6">
                                    <Zap className="w-10 h-10 text-white fill-current" />
                                </div>
                                <h3 className="font-black text-2xl mb-2">Instant Delivery</h3>
                                <p className="text-indigo-100 text-lg font-medium leading-relaxed">Your wallet is credited instantly after verification.</p>
                            </div>
                            <div className="absolute -right-10 -bottom-10 bg-white/10 w-48 h-48 rounded-full blur-3xl"></div>
                        </div>
                    </div>
                </div>
            </div>

            <FeedbackModal
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onClose={() => setModal({ ...modal, isOpen: false })}
            />
        </div>
    );
};

const FeedbackModal = ({ isOpen, title, message, type, onClose }: { isOpen: boolean, title: string, message: string, type: 'error' | 'success' | 'info', onClose: () => void }) => {
    if (!isOpen) return null;

    const icons = {
        error: <AlertTriangle className="w-12 h-12 text-red-500" />,
        success: <CheckCircle2 className="w-12 h-12 text-green-500" />,
        info: <Info className="w-12 h-12 text-blue-500" />
    };

    const colors = {
        error: 'bg-red-50 text-red-900 border-red-100',
        success: 'bg-green-50 text-green-900 border-green-100',
        info: 'bg-blue-50 text-blue-900 border-blue-100'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-10 text-center animate-in zoom-in-95 duration-200 border-2 ${colors[type].split(' ')[2]}`}>
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-all">
                    <X className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center">
                    <div className="mb-4">{icons[type]}</div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="mt-8 w-full py-4 bg-gray-900 text-white font-black text-sm rounded-xl hover:bg-black transition-all shadow-xl shadow-gray-200 uppercase tracking-widest"
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
};

export default CheckoutPage;
