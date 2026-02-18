'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCcw, Download, Calendar } from 'lucide-react';
import { getRevenueAnalytics } from '@/actions/admin';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Generating Financial Report...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Revenue Analytics</h2>
                    <p className="text-lg text-gray-500 font-medium">Deep dive into platform earnings and transactional volume.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchData}
                        className="p-3 bg-white border border-gray-100 text-gray-500 rounded-2xl hover:bg-gray-50 transition-all shadow-sm group"
                    >
                        <RefreshCcw className="w-5 h-5 group-active:rotate-180 transition-transform duration-500" />
                    </button>
                    <button
                        onClick={downloadPDF}
                        disabled={!data}
                        className="flex items-center space-x-3 px-8 py-5 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 font-black shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 text-lg disabled:opacity-50"
                    >
                        <Download className="w-6 h-6 stroke-[3px] text-indigo-600" />
                        <span>Download PDF Report</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[1.25rem] group-hover:scale-110 transition-transform">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div className="flex items-center text-green-600 font-black text-xs bg-green-50 px-3 py-1.5 rounded-full uppercase tracking-wider">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            Stable
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-[0.2em] mb-1">Gross Platform Profit</p>
                    <p className="text-3xl font-black text-gray-900 mt-2 tracking-tight">
                        ${(data?.totalProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[1.25rem] group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div className="flex items-center text-green-600 font-black text-xs bg-green-50 px-3 py-1.5 rounded-full uppercase tracking-wider">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            Live
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-[0.2em] mb-1">Total Funded Volume</p>
                    <p className="text-3xl font-black text-gray-900 mt-2 tracking-tight">
                        ${(data?.totalVolume || 0).toLocaleString()}
                    </p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-4 bg-purple-50 text-purple-600 rounded-[1.25rem] group-hover:scale-110 transition-transform">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div className="flex items-center text-indigo-600 font-black text-xs bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wider">
                            Average
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-[0.2em] mb-1">Avg. Profit Margin</p>
                    <p className="text-3xl font-black text-gray-900 mt-2 tracking-tight">
                        {data?.avgMargin}%
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="font-black text-2xl text-gray-900 tracking-tight">Revenue Analysis (6M)</h3>
                        <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-5 py-2 rounded-full uppercase tracking-widest">Platform Earnings</span>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 900 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 900 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                                    itemStyle={{ fontWeight: 900, fontSize: '14px' }}
                                />
                                <Area type="monotone" dataKey="revenue" name="Net Margin ($)" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="font-black text-2xl text-gray-900 tracking-tight">Margin vs Volume</h3>
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-5 py-2 rounded-full uppercase tracking-widest">Distribution Balance</span>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 900 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 900 }} />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9', radius: 12 }}
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                                    itemStyle={{ fontWeight: 900, fontSize: '14px' }}
                                />
                                <Legend
                                    iconType="circle"
                                    wrapperStyle={{ paddingTop: '30px', fontWeight: 900, fontSize: '15px' }}
                                    formatter={(value) => <span style={{ color: '#111827' }}>{value}</span>}
                                />
                                <Bar dataKey="airtime" name="Volume ($)" fill="#1e293b" radius={[10, 10, 0, 0]} barSize={45} />
                                <Bar dataKey="margin" name="Margin ($)" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={45} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 text-gray-900 border border-gray-100 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[100px] -mr-48 -mt-48 rounded-full"></div>
                <div className="relative z-10">
                    <h3 className="text-3xl font-black mb-3">Platform Performance Insight</h3>
                    <p className="text-lg text-gray-500 w-full leading-relaxed">
                        Based on the current trajectory, the platform is seeing a consistent <span className="text-indigo-600 font-black">1.5% profit margin</span> across all airtime distributions. Transactional volume has normalised over the last 6 months with healthy growth in enterprise onboardings.
                    </p>
                    <div className="flex items-center space-x-6 mt-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 text-opacity-70">Efficiency Rate</span>
                            <span className="text-2xl font-black">98.4%</span>
                        </div>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 text-opacity-70">Uptime Score</span>
                            <span className="text-2xl font-black">99.9%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRevenue;

