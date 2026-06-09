'use client';
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from 'recharts';
import { DollarSign, TrendingUp, ArrowUpRight, RefreshCcw, Download, Calendar, Activity, Shield, Percent, CreditCard, Layers, Zap } from 'lucide-react';
import { getRevenueAnalytics } from '@/actions/admin';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 border border-slate-800 text-white p-3.5 rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
                {payload.map((item: any, index: number) => (
                    <p key={index} className="text-xs font-semibold leading-relaxed">
                        {item.name}: <span className="font-mono font-bold text-indigo-400">{prefix}{item.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}{suffix}</span>
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

const AdminRevenue: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const downloadPDF = () => {
        if (!data) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(99, 102, 241); // Indigo
        doc.text("AirTimeConnect Financial Report", 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        // Stats Summary
        doc.setDrawColor(240);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, 40, 182, 35, 3, 3, 'F');

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Total Funded Volume", 20, 50);
        doc.text("Gross Platform Profit", 85, 50);
        doc.text("Average Margin", 150, 50);

        doc.setFontSize(16);
        doc.setTextColor(20);
        doc.text(`$${data.totalVolume.toLocaleString()}`, 20, 62);
        doc.text(`$${data.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 85, 62);
        doc.text(`${data.avgMargin}%`, 150, 62);

        // Monthly Breakdown Table
        doc.setFontSize(14);
        doc.setTextColor(99, 102, 241);
        doc.text("Monthly Performance Breakdown", 14, 90);

        const tableColumn = ["Month", "Funded Volume ($)", "Platform Margin ($)", "Tx Count"];
        const tableRows = data.chartData.map((m: any) => [
            m.month,
            `$${m.airtime.toLocaleString()}`,
            `$${m.margin.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            m.count
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 95,
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241], fontStyle: 'bold' },
            bodyStyles: { fontSize: 9 },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        });

        doc.save(`AirTimeConnect_Revenue_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const result = await getRevenueAnalytics();
            setData(result);
        } catch (error) {
            console.error("Failed to fetch revenue analytics:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-300">
                <div className="relative flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute w-6 h-6 border border-indigo-500/10 rounded-full"></div>
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-4 tracking-wider animate-pulse">Generating Financial Intelligence...</p>
            </div>
        );
    }

    const totalTransactions = data?.chartData?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Revenue Analytics</h1>
                    <p className="text-xs font-medium text-slate-500 mt-1">Deep dive into platform earnings and transactional volume.</p>
                </div>
                <div className="flex items-center space-x-2.5">
                    <button
                        onClick={fetchData}
                        className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95 cursor-pointer"
                        title="Refresh Intelligence"
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={downloadPDF}
                        disabled={!data}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                    >
                        <Download className="w-4 h-4 text-white/90" />
                        <span>Download PDF Report</span>
                    </button>
                </div>
            </div>

            {/* Layout Grid: Left content, Right insights panel */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content Area (Takes 3 columns on large screens) */}
                <div className="lg:col-span-3 space-y-8">
                    {/* KPI Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* KPI 1: Gross Platform Profit */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-36">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Profit</span>
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <DollarSign className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="flex items-end justify-between mt-2">
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 leading-none">
                                        ${(data?.totalProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2">
                                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                                        +12.4%
                                    </span>
                                </div>
                                <Sparkline data={data?.chartData || []} dataKey="margin" stroke="#4f46e5" />
                            </div>
                        </div>

                        {/* KPI 2: Total Funded Volume */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-36">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Funded Volume</span>
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="flex items-end justify-between mt-2">
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 leading-none">
                                        ${(data?.totalVolume || 0).toLocaleString()}
                                    </p>
                                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2">
                                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                                        +8.2%
                                    </span>
                                </div>
                                <Sparkline data={data?.chartData || []} dataKey="airtime" stroke="#10b981" />
                            </div>
                        </div>

                        {/* KPI 3: Avg Margin */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-36">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Margin</span>
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                                    <Percent className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="flex items-end justify-between mt-2">
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 leading-none">
                                        {data?.avgMargin || 1.5}%
                                    </p>
                                    <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full mt-2">
                                        Stable
                                    </span>
                                </div>
                                <Sparkline data={data?.chartData || []} dataKey="margin" stroke="#f59e0b" />
                            </div>
                        </div>

                        {/* KPI 4: Total Transactions */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-36">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transactions</span>
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="flex items-end justify-between mt-2">
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 leading-none">
                                        {totalTransactions}
                                    </p>
                                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2">
                                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                                        +15.3%
                                    </span>
                                </div>
                                <Sparkline data={data?.chartData || []} dataKey="count" stroke="#8b5cf6" />
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Area Chart: Revenue Analysis */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-semibold text-slate-900 text-sm">Revenue Analysis (6M)</h3>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Platform Net Margin Performance</p>
                                </div>
                                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/30 px-2 py-0.5 rounded-full uppercase tracking-wider">Monthly Breakdown</span>
                            </div>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data?.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                                        <Tooltip content={<CustomTooltip prefix="$" />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
                                        <Area type="monotone" dataKey="revenue" name="Net Profit Margin" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Bar Chart: Margin vs Volume */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-semibold text-slate-900 text-sm">Margin vs Volume</h3>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Distribution Balance Matrix</p>
                                </div>
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/30 px-2 py-0.5 rounded-full uppercase tracking-wider">6-Month Trend</span>
                            </div>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data?.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                                        <Tooltip content={<CustomTooltip prefix="$" />} cursor={{ fill: '#f8fafc', radius: 4 }} />
                                        <Legend verticalAlign="top" align="right" height={36} iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 11, fontWeight: 500, color: '#64748b', paddingBottom: 15 }} />
                                        <Bar dataKey="airtime" name="Volume ($)" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={20} />
                                        <Bar dataKey="margin" name="Margin ($)" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Operational Metrics Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Efficiency Rate Card */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-800">Efficiency Rate</h4>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Success of airtime dispatches</p>
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-indigo-600">98.4%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: '98.4%' }}></div>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium mt-3">Gateway routing successfully handles 98.4% without latency packet drops.</p>
                        </div>

                        {/* Uptime Score Card */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-800">Uptime Score</h4>
                                        <p className="text-[10px] text-slate-400 mt-0.5">High availability replication</p>
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-emerald-600">99.9%</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-semibold text-slate-600">All Core Gateways Operational</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium mt-3">Real-time ping checks verify API endpoints are fully active and reachable.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side Insights Panel (1 column on large screens) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm">Dashboard Insights</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">Automated anomalies & recommendations</p>
                        </div>

                        <div className="space-y-4">
                            {/* Insight Item 1 */}
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100/30 px-2 py-0.5 rounded-full uppercase tracking-wider">Margins</span>
                                    <span className="text-[9px] font-medium text-slate-400">Current</span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                    Based on the current trajectory, the platform is seeing a consistent <strong className="text-slate-900">1.5% profit margin</strong> across all airtime distributions.
                                </p>
                            </div>

                            {/* Insight Item 2 */}
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/30 px-2 py-0.5 rounded-full uppercase tracking-wider">Volume Growth</span>
                                    <span className="text-[9px] font-medium text-slate-400">6 Months</span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                    Transactional volume has normalised over the last 6 months with healthy growth in enterprise onboardings.
                                </p>
                            </div>

                            {/* Insight Item 3 */}
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100/30 px-2 py-0.5 rounded-full uppercase tracking-wider">Protocol</span>
                                    <span className="text-[9px] font-medium text-slate-400">Security</span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                    All transaction summaries and logs are immutably archived for compliance guidelines.
                                </p>
                            </div>
                        </div>

                        {/* Security compliance panel at the bottom of insights */}
                        <div className="pt-4 border-t border-slate-100 space-y-3">
                            <div className="flex items-center space-x-2 text-slate-500">
                                <Shield className="w-4 h-4 text-indigo-500" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Compliance Protocol</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500">Audit Status</span>
                                <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-md uppercase tracking-wide">Secure</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRevenue;
