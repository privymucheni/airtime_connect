'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
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
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getAdminDashboardData, updateUserStatus } from '@/actions/admin';
import { UserStatus } from '@prisma/client';
import Link from 'next/link';

const MOCK_REVENUE = [
  { name: 'Jan', rev: 45000, users: 120 },
  { name: 'Feb', rev: 52000, users: 145 },
  { name: 'Mar', rev: 48000, users: 160 },
  { name: 'Apr', rev: 61000, users: 185 },
  { name: 'May', rev: 55000, users: 210 },
  { name: 'Jun', rev: 67000, users: 230 },
];

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await getAdminDashboardData();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (userId: string, status: UserStatus) => {
    try {
      await updateUserStatus(userId, status);
      fetchData();
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Loading platform data...</p>
      </div>
    );
  }

  const recentCompanies = data?.recentCompanies || [];
  const filteredCompanies = recentCompanies.filter((c: any) =>
    (c.companyName || c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
          <p className="text-gray-500">Overview of system health and company activities.</p>
        </div>
        <button className="flex items-center space-x-2 px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-all shadow-lg active:scale-95">
          <Download className="w-5 h-5" />
          <span>Export Reports</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Total Companies</p>
          <p className="text-3xl font-black text-gray-900 mt-1">{data?.stats?.companies || 0}</p>
          <div className="mt-2 flex items-center text-xs font-bold text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            Live tracking
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl w-fit mb-4">
            <Activity className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Total Airtime Volume</p>
          <p className="text-3xl font-black text-gray-900 mt-1">${(data?.stats?.volume || 0).toLocaleString()}</p>
          <div className="mt-2 flex items-center text-xs font-bold text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            +18.5%
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl w-fit mb-4">
            <BarChart3 className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Active Promo Codes</p>
          <p className="text-3xl font-black text-gray-900 mt-1">{data?.stats?.promos || 0}</p>
          <div className="mt-2 flex items-center text-xs font-bold text-blue-600">
            Running campaigns
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit mb-4">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-500 font-medium">System Users</p>
          <p className="text-3xl font-black text-gray-900 mt-1">{(data?.stats?.companies || 0) + 1}</p>
          <div className="mt-2 flex items-center text-xs font-bold text-indigo-600">
            Admin included
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Revenue Distribution</h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Monthly View</span>
          </div>
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
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">New Company Sign-ups</h3>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">Growth Trend</span>
          </div>
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
                <Bar dataKey="users" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-lg">Recently Registered Companies</h3>
            <Link href="/admin/companies" className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Quick search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent focus:border-indigo-500 rounded-xl outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCompanies.map((company: any) => (
                <tr key={company.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold group-hover:scale-110 transition-transform">
                        {(company.companyName || company.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{company.companyName || company.name}</p>
                        <p className="text-xs text-gray-500">{company.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(company.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">${(company.wallet?.balance || 0).toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${company.status === UserStatus.ACTIVE ? 'bg-green-100 text-green-700' :
                        company.status === UserStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                      }`}>
                      {company.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {company.status !== UserStatus.ACTIVE && (
                        <button
                          onClick={() => handleStatusUpdate(company.id, UserStatus.ACTIVE)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Activate Account"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                      {company.status !== UserStatus.SUSPENDED && (
                        <button
                          onClick={() => handleStatusUpdate(company.id, UserStatus.SUSPENDED)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Suspend Account"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
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

        <div className="p-6 bg-gray-50 flex items-center justify-between border-t border-gray-100">
          <p className="text-xs text-gray-500 font-bold">Showing {filteredCompanies.length} recent companies</p>
          <Link
            href="/admin/companies"
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-700 hover:bg-gray-100 transition-all shadow-sm active:scale-95"
          >
            Manage All
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


