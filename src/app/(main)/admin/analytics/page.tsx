'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MOCK_DATA = [
    { month: 'Jan', revenue: 45000, airtime: 400000, margin: 5000 },
    { month: 'Feb', revenue: 52000, airtime: 480000, margin: 6200 },
    { month: 'Mar', revenue: 48000, airtime: 430000, margin: 5800 },
    { month: 'Apr', revenue: 61000, airtime: 550000, margin: 7500 },
    { month: 'May', revenue: 68000, airtime: 610000, margin: 8200 },
    { month: 'Jun', revenue: 75000, airtime: 690000, margin: 9100 },
];

const AdminRevenue: React.FC = () => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Revenue Analytics</h2>
                <p className="text-gray-500">Deep dive into platform earnings and airtime volume.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div className="flex items-center text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded-lg">
                            <ArrowUpRight className="w-4 h-4 mr-1" />
                            18%
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Gross Platform Profit</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">$41,800</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div className="flex items-center text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded-lg">
                            <ArrowUpRight className="w-4 h-4 mr-1" />
                            12%
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Airtime Volume</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">$3.1M</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div className="flex items-center text-red-600 font-bold text-sm bg-red-50 px-2 py-1 rounded-lg">
                            <ArrowDownRight className="w-4 h-4 mr-1" />
                            2%
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Avg. Profit Margin</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">1.35%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-8">Revenue Growth (6 Months)</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MOCK_DATA}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-8">Profit Margin vs Total Airtime</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={MOCK_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Legend iconType="circle" />
                                <Bar dataKey="airtime" name="Airtime Volume ($)" fill="#a5b4fc" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="margin" name="Platform Margin ($)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRevenue;
