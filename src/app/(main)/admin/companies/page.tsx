'use client';

import React, { useState } from 'react';
import { Search, Filter, CheckCircle2, XCircle, MoreVertical, Download, Plus } from 'lucide-react';

const MOCK_COMPANIES = [
  { id: '1', name: 'Acme Corporation', email: 'finance@acme.com', balance: 45000, status: 'active', joined: '2023-12-10' },
  { id: '2', name: 'Global Tech Hub', email: 'billing@globaltech.io', balance: 12000, status: 'active', joined: '2024-01-15' },
  { id: '3', name: 'Sunrise Logistics', email: 'ops@sunrise.com', balance: 0, status: 'pending', joined: '2024-03-01' },
  { id: '4', name: 'Blue Sky Media', email: 'accounts@bluesky.com', balance: 8500, status: 'active', joined: '2023-11-20' },
  { id: '5', name: 'Terra Nova Energy', email: 'pay@terranova.net', balance: 3400, status: 'suspended', joined: '2023-09-05' },
];

const AdminCompanies: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = MOCK_COMPANIES.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registered Companies</h2>
          <p className="text-gray-500 text-sm">Review, approve, and manage company accounts.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium">
            <Download className="w-4 h-4" />
            <span>Export List</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100">
            <Plus className="w-4 h-4" />
            <span>Add New Company</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by company name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent focus:border-indigo-500 rounded-xl outline-none transition-all"
            />
          </div>
          <button className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-500">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Company</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Balance</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Joined Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold">
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{company.name}</p>
                        <p className="text-xs text-gray-500">{company.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-900">${company.balance.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${company.status === 'active' ? 'bg-green-100 text-green-700' :
                        company.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                      }`}>
                      {company.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{company.joined}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCompanies;
