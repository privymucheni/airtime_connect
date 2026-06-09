'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import {
  Building2, Mail, Bell, CreditCard, ChevronRight, CheckCircle2,
  AlertCircle, Loader2, User as UserIcon, Shield, Key, Eye, EyeOff, Copy, Check,
  RefreshCw, Layers
} from 'lucide-react';
import { updateCompanyProfile } from '@/actions/company';

type TabType = 'general' | 'profile' | 'billing' | 'security' | 'notifications' | 'api_keys' | 'integrations';

const CompanySettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // General Settings Form
  const [formData, setFormData] = useState({
    name: user?.name || '',
    companyName: user?.companyName || '',
    email: user?.email || '',
  });

  // Password / Security form state
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Notification toggles state
  const [notifications, setNotifications] = useState({
    distributionAlerts: true,
    walletBalanceAlerts: true,
    systemUpdates: false,
    securityWarnings: true,
  });

  // API Keys state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState({
    liveKey: 'pk_live_51Nv9H1Lce24kM0v...8jN23',
    testKey: 'pk_test_51Nv9H1Lce24kM0v...9uB15',
  });

  if (!user) return null;

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await updateCompanyProfile(formData);
      if (res.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message || 'Failed to update profile' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const copyToClipboard = (keyText: string, keyName: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const menuItems = [
    { id: 'general', name: 'General Information', icon: UserIcon },
    { id: 'profile', name: 'Company Profile', icon: Building2 },
    { id: 'billing', name: 'Billing & Payments', icon: CreditCard },
    { id: 'security', name: 'Security (2FA)', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'api_keys', name: 'API Keys', icon: Key },
    { id: 'integrations', name: 'Integrations', icon: Layers },
  ] as const;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600">Settings</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage your company profile, billing, and security preferences.</p>
        </div>

        <div className="flex items-center space-x-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
            Role: Company
          </span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <aside className="md:col-span-1 bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 block">Settings</span>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold text-xs transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-[#4C6EF5]'
                    : 'text-slate-550 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#4C6EF5]' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Section */}
        <div className="md:col-span-3 space-y-6">
          
          {/* General Information tab */}
          {activeTab === 'general' && (
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-50 pb-4">
                <h3 className="text-sm font-bold text-slate-900">General Information</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Primary profile information for the account administrator.</p>
              </div>

              {message && (
                <div className={`p-3 rounded-lg flex items-center space-x-2 animate-in slide-in-from-top-2 duration-300 text-xs font-semibold ${
                  message.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{message.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Contact Person</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4C6EF5] w-4 h-4 transition-colors" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-[#4C6EF5] focus:bg-white rounded-lg text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400"
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Company Name</label>
                  <div className="relative group">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4C6EF5] w-4 h-4 transition-colors" />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-[#4C6EF5] focus:bg-white rounded-lg text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400"
                      placeholder="Enter company name"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4C6EF5] w-4 h-4 transition-colors" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-[#4C6EF5] focus:bg-white rounded-lg text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center space-x-1.5 px-5 py-2.5 bg-[#4C6EF5] hover:bg-[#3B5BDB] active:bg-[#2B4CBE] text-white font-bold rounded-lg transition-all shadow-md shadow-indigo-500/10 active:scale-95 disabled:opacity-50 cursor-pointer text-xs"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </div>
          )}

          {/* Company Profile tab */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-50 pb-4">
                <h3 className="text-sm font-bold text-slate-900">Company Profile</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Manage public-facing business profile metadata.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Website URL</label>
                  <input
                    type="url"
                    defaultValue="https://nust.ac.zw"
                    className="w-full px-3.5 py-2 bg-slate-55 border border-slate-250 focus:border-[#4C6EF5] focus:bg-white rounded-lg text-xs font-semibold text-slate-800 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">HQ Address</label>
                  <input
                    type="text"
                    defaultValue="Bulawayo, Zimbabwe"
                    className="w-full px-3.5 py-2 bg-slate-55 border border-slate-250 focus:border-[#4C6EF5] focus:bg-white rounded-lg text-xs font-semibold text-slate-800 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Company Description</label>
                  <textarea
                    rows={4}
                    defaultValue="National University of Science and Technology. AirFlow integration."
                    className="w-full px-3.5 py-2 bg-slate-55 border border-slate-250 focus:border-[#4C6EF5] focus:bg-white rounded-lg text-xs font-semibold text-slate-800 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex justify-end">
                <button
                  onClick={() => alert('Profile metadata saved!')}
                  className="px-5 py-2.5 bg-[#4C6EF5] hover:bg-[#3B5BDB] text-white font-bold rounded-lg transition-all text-xs"
                >
                  Save Profile Settings
                </button>
              </div>
            </div>
          )}

          {/* Billing tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Current Plan Card */}
              <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-50 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Current Plan</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Your subscription billing level and cycles.</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-[#4C6EF5]">
                    Enterprise Tier
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Plan Cost</span>
                    <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">$149.00 / month</p>
                  </div>
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Next Billing Date</span>
                    <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">July 1, 2026</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>Payment Method: Visa ending in <strong>4242</strong></span>
                  </div>
                  <button className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-lg text-xs shadow-sm transition-all cursor-pointer">
                    Update Card
                  </button>
                </div>
              </div>

              {/* Billing History Card */}
              <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-50">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Billing History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/75 border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Invoice ID</th>
                        <th className="px-5 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Billing Date</th>
                        <th className="px-5 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest text-right">Amount</th>
                        <th className="px-5 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-xs">
                      <tr>
                        <td className="px-5 py-3 text-slate-800 font-semibold">INV-0982-2026</td>
                        <td className="px-5 py-3 text-slate-500 font-medium">Jun 01, 2026</td>
                        <td className="px-5 py-3 text-slate-800 font-bold text-right">$149.00</td>
                        <td className="px-5 py-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">Paid</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-5 py-3 text-slate-800 font-semibold">INV-0761-2026</td>
                        <td className="px-5 py-3 text-slate-500 font-medium">May 01, 2026</td>
                        <td className="px-5 py-3 text-slate-800 font-bold text-right">$149.00</td>
                        <td className="px-5 py-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">Paid</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Security tab */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Change Password Card */}
              <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-6">
                <div className="border-b border-slate-50 pb-4">
                  <h3 className="text-sm font-bold text-slate-900">Change Password</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Keep your administrative panel credentials secure.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Current Password</label>
                    <div className="relative group">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        value={securityForm.currentPassword}
                        onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-[#4C6EF5] focus:bg-white rounded-lg text-xs font-semibold text-slate-850 outline-none transition-all placeholder:text-slate-400"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-800 transition-colors"
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">New Password</label>
                      <div className="relative group">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          value={securityForm.newPassword}
                          onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-[#4C6EF5] focus:bg-white rounded-lg text-xs font-semibold text-slate-850 outline-none transition-all placeholder:text-slate-400"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-850 transition-colors"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Confirm New Password</label>
                      <div className="relative group">
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          value={securityForm.confirmPassword}
                          onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-[#4C6EF5] focus:bg-white rounded-lg text-xs font-semibold text-slate-855 outline-none transition-all placeholder:text-slate-400"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-855 transition-colors"
                        >
                          {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex justify-end">
                  <button
                    onClick={() => {
                      if (securityForm.newPassword !== securityForm.confirmPassword) {
                        alert('Passwords do not match');
                      } else {
                        alert('Password saved successfully!');
                        setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '', twoFactorEnabled: securityForm.twoFactorEnabled });
                      }
                    }}
                    className="px-5 py-2.5 bg-[#4C6EF5] hover:bg-[#3B5BDB] text-white font-bold rounded-lg text-xs transition-all active:scale-95 cursor-pointer shadow-md shadow-indigo-500/10"
                  >
                    Change Password
                  </button>
                </div>
              </div>

              {/* Two-Factor Authentication Card */}
              <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Two-Factor Authentication (2FA)</h3>
                    <p className="text-[10px] text-slate-450 mt-0.5">Secure logins by requesting an additional mobile validation code.</p>
                  </div>
                  <button
                    onClick={() => setSecurityForm({ ...securityForm, twoFactorEnabled: !securityForm.twoFactorEnabled })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      securityForm.twoFactorEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        securityForm.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-50 pb-4">
                <h3 className="text-sm font-bold text-slate-900">Notification Channels</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Control the notifications and alerts you receive.</p>
              </div>

              <div className="space-y-5">
                {/* Switch 1 */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800">Distribution Alerts</span>
                    <p className="text-[10px] text-slate-450 mt-0.5">Get notified immediately when a bulk airtime distribution finishes sending.</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, distributionAlerts: !notifications.distributionAlerts })}
                    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      notifications.distributionAlerts ? 'bg-[#4C6EF5]' : 'bg-slate-200'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      notifications.distributionAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Switch 2 */}
                <div className="flex items-center justify-between py-2 border-t border-slate-50">
                  <div>
                    <span className="text-xs font-bold text-slate-800">Wallet Balance Alerts</span>
                    <p className="text-[10px] text-slate-450 mt-0.5">Receive warning emails when your Available Balance falls below $500.</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, walletBalanceAlerts: !notifications.walletBalanceAlerts })}
                    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      notifications.walletBalanceAlerts ? 'bg-[#4C6EF5]' : 'bg-slate-200'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      notifications.walletBalanceAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Switch 3 */}
                <div className="flex items-center justify-between py-2 border-t border-slate-50">
                  <div>
                    <span className="text-xs font-bold text-slate-800">System Updates</span>
                    <p className="text-[10px] text-slate-450 mt-0.5">Receive occasional alerts about new features, integrations, and releases.</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, systemUpdates: !notifications.systemUpdates })}
                    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      notifications.systemUpdates ? 'bg-[#4C6EF5]' : 'bg-slate-200'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      notifications.systemUpdates ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Switch 4 */}
                <div className="flex items-center justify-between py-2 border-t border-slate-50">
                  <div>
                    <span className="text-xs font-bold text-slate-800">Security Warnings</span>
                    <p className="text-[10px] text-slate-450 mt-0.5">Critical notifications regarding unrecognized logins or password resets.</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, securityWarnings: !notifications.securityWarnings })}
                    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      notifications.securityWarnings ? 'bg-[#4C6EF5]' : 'bg-slate-200'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      notifications.securityWarnings ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* API Keys tab */}
          {activeTab === 'api_keys' && (
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-50 pb-4">
                <h3 className="text-sm font-bold text-slate-900">API Access Credentials</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Authenticate programmatically for API integrations.</p>
              </div>

              <div className="space-y-5">
                {/* Live Key */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Live Secret Token</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={apiKeys.liveKey}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold font-mono text-slate-650 outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(apiKeys.liveKey, 'live')}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-150 border border-slate-200 text-slate-700 font-bold rounded-lg text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center min-w-[70px]"
                    >
                      {copiedKey === 'live' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                  </div>
                </div>

                {/* Test Key */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Sandbox Test Token</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={apiKeys.testKey}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold font-mono text-slate-650 outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(apiKeys.testKey, 'test')}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-150 border border-slate-200 text-slate-700 font-bold rounded-lg text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center min-w-[70px]"
                    >
                      {copiedKey === 'test' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-medium">Use tokens securely. Do not expose them in client code.</span>
                <button
                  onClick={() => {
                    setApiKeys({
                      liveKey: 'pk_live_51Nv9H1Lce24kM0v...' + Math.random().toString(36).substring(7),
                      testKey: 'pk_test_51Nv9H1Lce24kM0v...' + Math.random().toString(36).substring(7),
                    });
                    alert('Tokens regenerated successfully.');
                  }}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-150 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate Keys</span>
                </button>
              </div>
            </div>
          )}

          {/* Integrations tab */}
          {activeTab === 'integrations' && (
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-50 pb-4">
                <h3 className="text-sm font-bold text-slate-900">App Integrations</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Connect external platforms to sync airtime alerts and data.</p>
              </div>

              <div className="space-y-4">
                {/* Integration 1 */}
                <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4C6EF5] font-black">
                      S
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800">Slack Alerts</span>
                      <p className="text-[9px] text-slate-450 mt-0.5">Push success/failure logs directly to Slack channels.</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-lg text-[10px] shadow-sm transition-all cursor-pointer">
                    Configure
                  </button>
                </div>

                {/* Integration 2 */}
                <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4C6EF5] font-black">
                      AT
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800">AfricasTalking Gateway</span>
                      <p className="text-[9px] text-slate-455 mt-0.5">Use your custom AfricasTalking account for SMS/Airtime.</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-lg text-[10px] shadow-sm transition-all cursor-pointer">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CompanySettings;
