'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Power, X, Calendar, Percent, Loader2, Award, Zap, ToggleLeft, ToggleRight } from 'lucide-react';
import { createPromoCode, getPromoCodes, deletePromoCode, togglePromoCodeStatus } from '@/actions/admin';

const AdminPromoCodes: React.FC = () => {
  const [promos, setPromos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discountPercent: '',
    expiryDate: ''
  });

  const fetchPromos = async () => {
    setIsLoading(true);
    try {
      const data = await getPromoCodes();
      setPromos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createPromoCode({
        ...formData,
        discountPercent: parseFloat(formData.discountPercent)
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ code: '', discountPercent: '', expiryDate: '' });
        fetchPromos();
      }
    } catch (error) {
      alert("Failed to create promo code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;
    try {
      await deletePromoCode(id);
      fetchPromos();
    } catch (error) {
      alert("Delete failed");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await togglePromoCodeStatus(id, !currentStatus);
      fetchPromos();
    } catch (error) {
      alert("Toggle failed");
    }
  };

  const activeCount = promos.filter(p => p.isActive).length;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Top Bar with Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-indigo-600">Promo Codes</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Promo Codes</h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Manage incentives and discount campaigns.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold text-xs shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Promo</span>
        </button>
      </div>

      {/* Mini Overview Row */}
      {!isLoading && promos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Promos</span>
              <p className="text-xl font-bold text-slate-800 mt-1">{promos.length}</p>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Campaigns</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">{activeCount}</p>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Archived Campaigns</span>
              <p className="text-xl font-bold text-slate-500 mt-1">{promos.length - activeCount}</p>
            </div>
            <div className="p-2.5 bg-slate-50 text-slate-500 rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading Promo Cards...</p>
        </div>
      ) : promos.length === 0 ? (
        <div className="bg-white rounded-2xl p-24 text-center border-2 border-dashed border-slate-200/60 max-w-2xl mx-auto flex flex-col items-center justify-center">
          <div className="bg-slate-50 w-16 h-16 border border-slate-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Tag className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-xs font-semibold text-slate-900">No promo codes yet</h3>
          <p className="text-[10px] text-slate-400 mt-1 max-w-sm">Start by creating your first promotional code to incentivize users.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group transition-all hover:border-indigo-150 hover:shadow-md flex flex-col justify-between h-48 ${!promo.isActive ? 'opacity-70 grayscale' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl border ${promo.isActive ? 'bg-indigo-50 border-indigo-100/30 text-indigo-600' : 'bg-slate-150 border-slate-250 text-slate-400'}`}>
                  <Tag className="w-4 h-4" />
                </div>
                <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggleStatus(promo.id, promo.isActive)}
                    className={`p-1.5 rounded-lg border transition-all active:scale-90 cursor-pointer ${promo.isActive ? 'text-amber-600 bg-white border-amber-200 hover:bg-amber-50' : 'text-green-600 bg-white border-green-200 hover:bg-green-50'}`}
                    title={promo.isActive ? "Deactivate" : "Activate"}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="p-1.5 text-slate-400 hover:text-red-650 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-lg transition-all active:scale-90 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight font-mono uppercase leading-none mb-1.5">{promo.code}</h3>
                <p className="text-indigo-650 font-bold text-xs font-mono">+{promo.discountPercent}% Bonus Airtime</p>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-4">
                <div className="flex items-center space-x-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${promo.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-300'}`}></div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${promo.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {promo.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest leading-none mb-0.5">Expires</p>
                  <p className="text-[10px] font-bold text-slate-600 font-mono">{new Date(promo.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 relative overflow-hidden animate-in slide-in-from-bottom-8 duration-350">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">New Promo Code</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Define your promotion settings</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-400 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Promo Code</label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="E.g. SUMMER2024"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl font-bold outline-none transition-all uppercase text-xs text-slate-800 placeholder:text-slate-350"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bonus %</label>
                  <div className="relative">
                    <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      required
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                      placeholder="5"
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl font-bold outline-none transition-all text-xs text-slate-800 placeholder:text-slate-350"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiry Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl font-bold outline-none transition-all text-xs text-slate-800 placeholder:text-slate-350"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  disabled={isSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/10 active:scale-95 transition-all text-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Launch Promotion</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromoCodes;
