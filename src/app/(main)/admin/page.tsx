'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { User, Transaction } from '@/types';
import {
  Building2,
  Users,
  BarChart3,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  Filter,
  TrendingUp,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const MOCK_REVENUE = [
  { name: 'Jan', rev: 45000, users: 120 },
  { name: 'Feb', rev: 52000, users: 145 },
  { name: 'Mar', rev: 48000, users: 160 },
  { name: 'Apr', rev: 61000, users: 185 },
  { name: 'May', rev: 55000, users: 210 },
  { name: 'Jun', rev: 67000, users: 230 },
];

const MOCK_COMPANIES = [
  { id: '1', name: 'Acme Corporation', email: 'finance@acme.com', balance: 45000, status: 'active', joined: '2023-12-10' },
  { id: '2', name: 'Global Tech Hub', email: 'billing@globaltech.io', balance: 12000, status: 'active', joined: '2024-01-15' },
  { id: '3', name: 'Sunrise Logistics', email: 'ops@sunrise.com', balance: 0, status: 'pending', joined: '2024-03-01' },
  { id: '4', name: 'Blue Sky Media', email: 'accounts@bluesky.com', balance: 8500, status: 'active', joined: '2023-11-20' },
  { id: '5', name: 'Terra Nova Energy', email: 'pay@terranova.net', balance: 3400, status: 'suspended', joined: '2023-09-05' },
];

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) return null;

  const filteredCompanies = MOCK_COMPANIES.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
          <p className="text-gray-500">Overview of system health and company activities.</p>
        </div>
        <button className="flex items-center space-x-2 px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-all shadow-lg">
          <Download className="w-5 h-5" />
          <span>Export Reports</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Active Companies</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">248</p>
          <div className="mt-2 flex items-center text-xs font-bold text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            +12 this week
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl w-fit mb-4">
            <Activity className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Total Airtime Distributed</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">$1.2M</p>
          <div className="mt-2 flex items-center text-xs font-bold text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            +18.5%
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl w-fit mb-4">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Unique Employees</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">45,200</p>
          <div className="mt-2 flex items-center text-xs font-bold text-blue-600">
            Stable
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit mb-4">
            <BarChart3 className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Platform Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">$158K</p>
          <div className="mt-2 flex items-center text-xs font-bold text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            +5%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-lg mb-6">Revenue & Growth</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_REVENUE}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="rev" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-lg mb-6">Company Onboarding</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_REVENUE}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f3f4f6', radius: 8 }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="users" fill="#a5b4fc" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-lg">Manage Registered Companies</h3>
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent focus:border-indigo-500 rounded-xl outline-none transition-all text-sm"
              />
            </div>
            <button className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Wallet Balance</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold group-hover:scale-110 transition-transform">
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{company.name}</p>
                        <p className="text-xs text-gray-500">{company.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{company.joined}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">${company.balance.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${company.status === 'active' ? 'bg-green-100 text-green-700' :
                      company.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Deactivate">
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Showing {filteredCompanies.length} of 248 companies</p>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 transition-all">Prev</button>
            <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-100 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

