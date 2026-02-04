'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';
import { ShieldCheck, Building2, ChevronRight, Mail, Lock } from 'lucide-react';
import { signIn } from 'next-auth/react';

const Login: React.FC = () => {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(UserRole.COMPANY);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setIsLoading(false);
    } else {
      // Middleware will handle role-based redirection, 
      // but let's do a quick one here for UX.
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-10 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">AirTimeConnect</h1>
          <p className="text-gray-500">The premier bulk airtime automation platform</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
          <button
            onClick={() => setRole(UserRole.COMPANY)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all ${role === UserRole.COMPANY ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'
              }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="font-semibold">Company</span>
          </button>
          <button
            onClick={() => setRole(UserRole.ADMIN)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all ${role === UserRole.ADMIN ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'
              }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="font-semibold">Admin</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-semibold text-gray-700 block">Password</label>
              <Link href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Forgot?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In to {role === UserRole.ADMIN ? 'Console' : 'Portal'}</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">Register your company</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
