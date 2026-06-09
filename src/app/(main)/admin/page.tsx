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
  TrendingUp,
  Activity,
  ArrowUpRight,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  RefreshCcw,
  Tag,
  Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area } from 'recharts';
import { getAdminDashboardData, updateUserStatus } from '@/actions/admin';
import { UserStatus } from '@prisma/client';
import Link from 'next/link';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const MOCK_REVENUE = [
  { name: 'Jan', rev: 45000, users: 120 },
  { name: 'Feb', rev: 52000, users: 145 },
  { name: 'Mar', rev: 48000, users: 160 },
  { name: 'Apr', rev: 61000, users: 185 },
  { name: 'May', rev: 55000, users: 210 },
  { name: 'Jun', rev: 67000, users: 230 },
];

const CustomTooltip = ({ active, payload, label, prefix = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 text-white p-3.5 rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-xs font-semibold leading-relaxed">
            {item.name}: <span className="font-mono font-bold text-indigo-400">{prefix}{item.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Sparkline = ({ data, dataKey, stroke }: { data: any[], dataKey: string, stroke: string }) => {
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

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

    const statsData = [
      { Metric: 'Total Companies', Value: data.stats.companies },
      { Metric: 'Total Airtime Volume', Value: `$${data.stats.volume.toLocaleString()}` },
      { Metric: 'Active Promo Codes', Value: data.stats.promos },
      { Metric: 'System Users', Value: data.stats.companies + 1 }
    ];

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

    XLSX.writeFile(wb, `AirFlow_Dashboard_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    setIsExportDropdownOpen(false);
  };

  const exportToPDF = () => {
    if (!data) return;

    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(99, 102, 241);
    doc.text("AirFlow Distribution Summary", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

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

    doc.save(`AirFlow_Dashboard_${new Date().toISOString().split('T')[0]}.pdf`);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-300">
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute w-6 h-6 border border-indigo-500/10 rounded-full"></div>
        </div>
        <p className="text-xs font-semibold text-slate-500 mt-4 tracking-wider animate-pulse">Synchronizing Platform Overview...</p>
      </div>
    );
  }

  const recentCompanies = data?.recentCompanies || [];
  const filteredCompanies = recentCompanies.filter((c: any) =>
    (c.companyName || c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Top Bar with Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-indigo-600">Overview</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Intelligence</h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Real-time oversight of system health and enterprise activity.</p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchData}
            className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Refresh Dashboard"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold text-xs shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95 transition-all group cursor-pointer"
            >
              <Download className="w-4 h-4 text-white/90 group-hover:translate-y-0.5 transition-transform" />
              <span>Generate Reports</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={exportToExcel}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50/50 hover:text-indigo-600 rounded-lg transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                  <span>Excel Spreadsheet</span>
                </button>
                <button
                  onClick={exportToPDF}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50/50 hover:text-indigo-600 rounded-lg transition-all"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>PDF Document</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (4-Column Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Total Registered Companies */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Companies</span>
            <div className="p-2 bg-indigo-50/70 text-indigo-600 rounded-xl">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-2xl font-bold text-slate-900 leading-none">{data?.stats?.companies || 0}</p>
              <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                Live tracking
              </span>
            </div>
            <Sparkline data={MOCK_REVENUE} dataKey="users" stroke="#4f46e5" />
          </div>
        </div>

        {/* KPI 2: Total Funded Volume */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Funded Volume</span>
            <div className="p-2 bg-emerald-50/70 text-emerald-600 rounded-xl">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-2xl font-bold text-slate-900 leading-none">${(data?.stats?.volume || 0).toLocaleString()}</p>
              <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +18.5%
              </span>
            </div>
            <Sparkline data={MOCK_REVENUE} dataKey="rev" stroke="#10b981" />
          </div>
        </div>

        {/* KPI 3: Active Promo Codes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Promo Codes</span>
            <div className="p-2 bg-violet-50/70 text-violet-600 rounded-xl">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-2xl font-bold text-slate-900 leading-none">{data?.stats?.promos || 0}</p>
              <span className="inline-flex items-center text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-2">
                Running campaigns
              </span>
            </div>
            <Sparkline data={MOCK_REVENUE} dataKey="users" stroke="#8b5cf6" />
          </div>
        </div>

        {/* KPI 4: System Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Users</span>
            <div className="p-2 bg-sky-50/70 text-sky-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-2xl font-bold text-slate-900 leading-none">{(data?.stats?.companies || 0) + 1}</p>
              <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full mt-2">
                Admin included
              </span>
            </div>
            <Sparkline data={MOCK_REVENUE} dataKey="users" stroke="#0ea5e9" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Revenue Distribution</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Monthly revenue view and system volume</p>
            </div>
            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/30 px-2 py-0.5 rounded-full uppercase tracking-wider">Monthly View</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_REVENUE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                <Tooltip content={<CustomTooltip prefix="$" />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="rev" name="Net Revenue" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* New Company Sign-ups Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">New Company Sign-ups</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Total growth trend of onboarded systems</p>
            </div>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/30 px-2 py-0.5 rounded-full uppercase tracking-wider">Growth Trend</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_REVENUE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={1} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.75} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 4 }} />
                <Bar dataKey="users" name="New Users" fill="url(#colorBarGrad)" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Companies Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Table Header Section */}
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-slate-900 text-sm">Recently Registered Companies</h3>
          </div>
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white border border-transparent focus:border-indigo-500 rounded-xl outline-none transition-all text-xs font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Company Profile</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Onboarding Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Balance</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Security Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-sm">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-900">No companies found</p>
                      <p className="text-[10px] text-slate-400 mt-1">Try modifying your search query keywords.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company: any) => (
                  <tr key={company.id} className="hover:bg-slate-50/60 transition-colors odd:bg-white even:bg-slate-50/20 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 border border-indigo-100/20">
                          {(company.companyName || company.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-none mb-1">{company.companyName || company.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium font-mono">{company.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600 font-normal">
                        {new Date(company.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-semibold text-slate-950 font-mono">${(company.wallet?.balance || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      {company.status === UserStatus.ACTIVE ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10">
                          <span className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse" />
                          Active
                        </span>
                      ) : company.status === UserStatus.PENDING ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 ring-1 ring-amber-600/10">
                          <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-600/10">
                          <span className="w-1 h-1 rounded-full bg-rose-600" />
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2.5">
                        <Link
                          href={`/admin/companies`}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="View Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {company.status === UserStatus.ACTIVE ? (
                          <button
                            onClick={() => handleStatusUpdate(company.id, UserStatus.SUSPENDED)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
                            title="Active - Click to Suspend"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusUpdate(company.id, UserStatus.ACTIVE)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                            title="Suspended - Click to Activate"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 md:p-6 bg-slate-50/70 flex items-center justify-between border-t border-slate-100">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Showing {filteredCompanies.length} recent companies</p>
          <Link
            href="/admin/companies"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95 transition-all"
          >
            Manage All Companies
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
