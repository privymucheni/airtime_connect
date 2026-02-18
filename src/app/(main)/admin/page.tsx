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

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ChevronDown, FileText, FileSpreadsheet } from 'lucide-react';

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
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

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

  const exportToExcel = () => {
    if (!data) return;

    // Sheet 1: Stats
    const statsData = [
      { Metric: 'Total Companies', Value: data.stats.companies },
      { Metric: 'Total Airtime Volume', Value: `$${data.stats.volume.toLocaleString()}` },
      { Metric: 'Active Promo Codes', Value: data.stats.promos },
      { Metric: 'System Users', Value: data.stats.companies + 1 }
    ];

    // Sheet 2: Recent Companies
    const companiesData = data.recentCompanies.map((c: any) => ({
      'Company Name': c.companyName || c.name,
      'Email': c.email,
      'Date Joined': new Date(c.createdAt).toLocaleDateString(),
      'Current Balance': `$${(c.wallet?.balance || 0).toLocaleString()}`,
      'Status': c.status
    }));

    const wb = XLSX.utils.book_new();
    const wsStats = XLSX.utils.json_to_sheet(statsData);
    const wsComp = XLSX.utils.json_to_sheet(companiesData);

    XLSX.utils.book_append_sheet(wb, wsStats, "Platform Overview");
    XLSX.utils.book_append_sheet(wb, wsComp, "Recent Companies");

    XLSX.writeFile(wb, `AirTimeConnect_Dashboard_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    setIsExportDropdownOpen(false);
  };

  const exportToPDF = () => {
    if (!data) return;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(99, 102, 241);
    doc.text("AirTimeConnect Distribution Summary", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Platform Stats Table
    doc.setFontSize(14);
    doc.setTextColor(50);
    doc.text("Platform Performance Overview", 14, 45);

    autoTable(doc, {
      head: [["Metric", "Value"]],
      body: [
        ["Total Registered Companies", data.stats.companies.toString()],
        ["Total Credited Volume", `$${data.stats.volume.toLocaleString()}`],
        ["Active Campaigns", data.stats.promos.toString()],
        ["Identified System Users", (data.stats.companies + 1).toString()]
      ],
      startY: 50,
      theme: 'plain',
      headStyles: { fontStyle: 'bold', textColor: [99, 102, 241] },
      styles: { fontSize: 11, cellPadding: 4 }
    });

    // Recent Companies Table
    const lastY = (doc as any).lastAutoTable.finalY || 80;
    doc.setFontSize(14);
    doc.setTextColor(50);
    doc.text("Recently Onboarded Companies", 14, lastY + 15);

    const tableColumn = ["Company", "Email", "Joined", "Balance", "Status"];
    const tableRows = data.recentCompanies.map((c: any) => [
      c.companyName || c.name,
      c.email,
      new Date(c.createdAt).toLocaleDateString(),
      `$${(c.wallet?.balance || 0).toLocaleString()}`,
      c.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: lastY + 20,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], fontStyle: 'bold' },
      styles: { fontSize: 9 }
    });

    doc.save(`AirTimeConnect_Dashboard_${new Date().toISOString().split('T')[0]}.pdf`);
    setIsExportDropdownOpen(false);
  };

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
        <p className="text-gray-500 font-medium tracking-widest uppercase text-[10px] font-black">Synchronizing Data Node...</p>
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
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Platform Intelligence</h2>
          <p className="text-gray-500 font-medium text-lg">Real-time oversight of system health and enterprise activity.</p>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
            className="flex items-center space-x-3 px-8 py-5 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 font-black shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 text-lg group"
          >
            <Download className="w-6 h-6 stroke-[3px] text-indigo-600 group-hover:translate-y-0.5 transition-transform" />
            <span>Generate Reports</span>
            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isExportDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-[1.5rem] shadow-2xl border border-gray-50 p-2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
              <button
                onClick={exportToExcel}
                className="w-full flex items-center space-x-3 px-4 py-4 text-sm font-black text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>Excel Spreadsheet</span>
              </button>
              <button
                onClick={exportToPDF}
                className="w-full flex items-center space-x-3 px-4 py-4 text-sm font-black text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
              >
                <FileText className="w-5 h-5" />
                <span>PDF Document</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-[0.2em] mb-1">Total Companies</p>
          <p className="text-3xl font-black text-gray-900 mt-2 tracking-tight">{data?.stats?.companies || 0}</p>
          <div className="mt-2 flex items-center text-[10px] font-medium text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            Live tracking
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl w-fit mb-4">
            <Activity className="w-6 h-6" />
          </div>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-[0.2em] mb-1">Total Funded Volume</p>
          <p className="text-3xl font-black text-gray-900 mt-2 tracking-tight">${(data?.stats?.volume || 0).toLocaleString()}</p>
          <div className="mt-2 flex items-center text-[10px] font-medium text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            +18.5%
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl w-fit mb-4">
            <BarChart3 className="w-6 h-6" />
          </div>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-[0.2em] mb-1">Active Promo Codes</p>
          <p className="text-3xl font-black text-gray-900 mt-2 tracking-tight">{data?.stats?.promos || 0}</p>
          <div className="mt-2 flex items-center text-[10px] font-medium text-blue-600">
            Running campaigns
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit mb-4">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-[0.2em] mb-1">System Users</p>
          <p className="text-3xl font-black text-gray-900 mt-2 tracking-tight">{(data?.stats?.companies || 0) + 1}</p>
          <div className="mt-2 flex items-center text-[10px] font-medium text-indigo-600">
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
            <div className="relative flex-1 md:max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Quick search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border-2 border-gray-100 focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all text-sm font-bold text-gray-900 shadow-sm placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 text-sm font-black text-gray-400 uppercase tracking-widest">Company Name</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400 uppercase tracking-widest">Onboarding Date</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400 uppercase tracking-widest">Account Balance</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400 uppercase tracking-widest">Security Status</th>
                <th className="px-6 py-5 text-sm font-black text-gray-400 uppercase tracking-widest text-right">Control Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCompanies.map((company: any) => (
                <tr key={company.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                        {(company.companyName || company.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xl font-black text-gray-900 leading-none mb-1">{company.companyName || company.name}</p>
                        <p className="text-base text-gray-400 font-bold">{company.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 font-medium">
                    <p className="text-base font-bold text-gray-600">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-xl font-black text-gray-900 tracking-tight">${(company.wallet?.balance || 0).toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`inline-flex px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider ${company.status === UserStatus.ACTIVE ? 'bg-green-100 text-green-700' :
                      company.status === UserStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {company.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      {company.status === UserStatus.ACTIVE ? (
                        <button
                          onClick={() => handleStatusUpdate(company.id, UserStatus.SUSPENDED)}
                          className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all"
                          title="Account is Active - Click to Suspend"
                        >
                          <CheckCircle2 className="w-6 h-6" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusUpdate(company.id, UserStatus.ACTIVE)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Account is Suspended - Click to Activate"
                        >
                          <XCircle className="w-6 h-6" />
                        </button>
                      )}
                      <button className="p-2.5 text-gray-400 hover:bg-gray-100 rounded-xl transition-all">
                        <MoreVertical className="w-6 h-6" />
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


