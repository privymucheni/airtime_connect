'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';
import { Building2, ShieldCheck, Eye, EyeOff, ArrowRight } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-black flex overflow-hidden font-sans">
      {/* Left Side: Hero Section */}
      <div className="hidden lg:flex lg:w-[50%] relative flex-col justify-between p-12 overflow-hidden border-r border-white/10">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-10000 hover:scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-indigo-900/10 backdrop-blur-[2px]"></div>
        </div>

        {/* Logo & Header */}
        <div className="relative z-10">
          <Logo
            textClassName="text-2xl font-black text-white"
            iconClassName="w-8 h-8"
          />
          <p className="text-white/80 mt-3 text-xs font-black uppercase tracking-[0.4em]">Flowing Airtime. Real-Time Support.</p>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-4xl">
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] mb-6 tracking-tighter">
            Elevate Your <span className="text-teal-400">Enterprise</span><br />
            Airtime Management
          </h2>
          <p className="text-base lg:text-lg text-white/60 font-medium leading-relaxed max-w-2xl">
            Experience the power of real-time distribution and advanced<br className="hidden lg:block" />
            analytics in one seamless platform.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-[50%] flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-2xl bg-[#0a0c10] rounded-[3rem] border border-white/10 p-10 md:p-12 lg:p-12 shadow-2xl relative overflow-hidden lg:-translate-y-6">
          {/* Subtle Glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-600/10 blur-[80px] rounded-full"></div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-white tracking-tight mb-3">Welcome Back</h1>
            <p className="text-gray-500 text-base font-medium italic">Please enter your account details to continue.</p>
          </div>

          {/* Role Switcher */}
          <div className="flex p-1.5 bg-black/60 rounded-[1.5rem] mb-8 border border-white/5">
            <button
              onClick={() => setRole(UserRole.COMPANY)}
              className={`flex-1 flex items-center justify-center space-x-3 py-3.5 rounded-[1rem] transition-all font-black text-sm uppercase tracking-[0.2em] transform active:scale-95 ${role === UserRole.COMPANY
                ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-400'
                }`}
            >
              <Building2 className="w-5 h-5" />
              <span>Company</span>
            </button>
            <button
              onClick={() => setRole(UserRole.ADMIN)}
              className={`flex-1 flex items-center justify-center space-x-3 py-3.5 rounded-[1rem] transition-all font-black text-sm uppercase tracking-[0.2em] transform active:scale-95 ${role === UserRole.ADMIN
                ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-400'
                }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Admin</span>
            </button>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl mb-6 text-sm font-black uppercase tracking-widest text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-400 uppercase tracking-[0.4em] ml-4">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.co.zw"
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] text-white text-base outline-none focus:border-blue-500 focus:bg-white/[0.08] focus:ring-8 ring-blue-500/5 transition-all font-bold placeholder:text-gray-500 group-hover:border-white/20"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-4">
                <label className="text-sm font-black text-gray-400 uppercase tracking-[0.4em]">Password</label>
                <Link href="#" className="text-sm font-black text-teal-500 uppercase tracking-[0.2em] hover:text-teal-400 transition-colors">Forgot Password?</Link>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] text-white text-base outline-none focus:border-blue-500 focus:bg-white/[0.08] focus:ring-8 ring-blue-500/5 transition-all font-bold placeholder:text-gray-500 group-hover:border-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-4 py-5 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-black rounded-[1.5rem] shadow-xl shadow-blue-900/20 transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 group uppercase tracking-[0.3em] text-sm"
            >
              {isLoading ? (
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="text-base">Sign In</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-base font-bold text-gray-500">
              Don't have an account?{' '}
              <Link href="/register" className="text-teal-500 font-black hover:text-teal-400 transition-colors uppercase tracking-widest text-sm ml-2">Get Started</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
