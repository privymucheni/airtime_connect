'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';
import { Building2, ShieldCheck, Eye, EyeOff, ArrowRight, Mail, Lock, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Logo from '@/components/Logo';

const Login: React.FC = () => {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(UserRole.COMPANY);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const errorParam = searchParams.get('error');
    if (errorParam === 'account_suspended') {
      setError('Your account has been suspended. Please contact support.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      email,
      password,
      role,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen flex overflow-hidden font-sans bg-[#F8FAFC]">
      {/* Left Side: Hero Section with background picture (visible on lg screens) */}
      <div className="hidden lg:flex lg:w-[50%] relative flex-col justify-between p-12 overflow-hidden border-r border-slate-100 bg-slate-900">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-10000 hover:scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/50 to-transparent"></div>
          <div className="absolute inset-0 bg-indigo-950/10 backdrop-blur-[1px]"></div>
        </div>

        {/* Logo & Header */}
        <div className="relative z-10">
          <Logo
            textClassName="text-2xl font-black text-white"
            iconClassName="w-8 h-8"
          />
          <p className="text-slate-350 mt-3 text-[10px] font-bold uppercase tracking-[0.35em]">Flowing Airtime. Real-Time Support.</p>
        </div>

        {/* Bottom container containing Hero Text & Footer */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Elevate Your <span className="text-indigo-400">Enterprise</span> Airtime Management
            </h2>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Experience the power of real-time distribution and advanced analytics in one seamless platform.
            </p>
          </div>
          <div className="border-t border-white/10 pt-4">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              © 2026 AirFlow. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form Card container */}
      <div className="w-full lg:w-[50%] bg-[#F8FAFC] flex flex-col justify-between p-6 lg:p-10 relative overflow-hidden">
        {/* Decorative blurred glow bubbles */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Top spacer to vertically align the card center */}
        <div className="hidden lg:block h-6"></div>

        {/* Centered Login Card */}
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="w-full max-w-[440px] bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-100/50 p-8 md:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
            
            {/* Branding Logo & Tagline (only visible on mobile) */}
            <div className="flex flex-col items-center text-center space-y-2.5 lg:hidden">
              <div className="flex items-center space-x-2">
                <Logo
                  textClassName="text-xl font-bold text-slate-900"
                  iconClassName="w-7 h-7"
                />
              </div>
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest bg-slate-55 border border-slate-100 px-2.5 py-1 rounded-full">
                Bulk Airtime Portal
              </span>
            </div>

            {/* Welcome Text */}
            <div className="text-center space-y-1">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">{getGreeting()}, Welcome Back</h1>
              <p className="text-xs text-slate-500 font-medium">Please enter your account details to continue.</p>
            </div>

            {/* Role Switcher */}
            <div className="flex p-1 bg-slate-50 border border-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setRole(UserRole.COMPANY)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-all font-semibold text-xs cursor-pointer ${role === UserRole.COMPANY
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Company Portal</span>
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.ADMIN)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-all font-semibold text-xs cursor-pointer ${role === UserRole.ADMIN
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Admin Panel</span>
              </button>
            </div>

            {/* Errors */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-xs font-semibold text-center animate-in fade-in slide-in-from-top-1 duration-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Email Address</label>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4C6EF5] transition-colors">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#4C6EF5] focus:bg-white rounded-lg text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                  <Link href="#" className="text-[10px] font-bold text-[#4C6EF5] hover:text-indigo-700 transition-colors uppercase tracking-wider">Forgot Password?</Link>
                </div>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4C6EF5] transition-colors">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#4C6EF5] focus:bg-white rounded-lg text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#4C6EF5] hover:bg-[#3B5BDB] active:bg-[#2B4CBE] text-white font-bold rounded-lg transition-all text-xs shadow-md shadow-indigo-500/10 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>


            {/* Security Indicator */}
            <div className="flex items-center justify-center space-x-2 bg-slate-50/50 border border-slate-100 py-2.5 px-3 rounded-lg text-slate-500">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[9px] font-bold uppercase tracking-wider">
                Your credentials are encrypted and securely processed.
              </span>
            </div>

            {/* Registration Redirect */}
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Don't have an account?{' '}
                <Link href="/register" className="text-[#4C6EF5] font-extrabold hover:text-[#3B5BDB] transition-colors ml-1">
                  Get Started
                </Link>
              </p>
            </div>

          </div>
        </div>

        {/* Footer legal note for mobile */}
        <div className="text-center py-4 lg:hidden">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            © 2026 AirFlow. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
