'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Mail, Lock, CheckCircle2, AlertCircle, Loader2, User as UserIcon, Shield } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  if (!user) return null;

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Basic mock save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Admin profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
      {/* Top Bar with Breadcrumbs */}
      <div className="border-b border-slate-100 pb-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
          <span>Admin</span>
          <span>/</span>
          <span className="text-indigo-600">Settings</span>
        </nav>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Settings</h1>
        <p className="text-xs font-medium text-slate-500 mt-0.5">Manage your administrator account security and preferences.</p>
      </div>

      {/* Settings Form Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-w-4xl">
        <div className="p-6 border-b border-slate-50 bg-slate-50/20">
          <h3 className="font-bold text-xs text-slate-800 flex items-center">
            <Shield className="w-4 h-4 mr-2 text-indigo-600" />
            Admin Credentials
          </h3>
        </div>
        <div className="p-6 space-y-6">
          {message && (
            <div className={`p-4 rounded-xl flex items-center space-x-3 animate-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-705 border border-emerald-100' : 'bg-rose-50 text-rose-705 border border-rose-100'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span className="font-bold text-xs tracking-tight">{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Full Name</label>
              <div className="relative group">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 w-4 h-4 transition-colors" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all text-slate-850"
                  placeholder="Enter full name"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 w-4 h-4 transition-colors" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all text-slate-850"
                  placeholder="admin@email.com"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50 flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50 active:scale-95 text-xs cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Save Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
