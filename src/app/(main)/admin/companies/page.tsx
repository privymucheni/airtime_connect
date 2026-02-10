'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Download,
  Plus,
  RefreshCcw,
  FileSpreadsheet,
  FileText,
  ChevronDown
} from 'lucide-react';
import { getCompanies, getAllCompanies, updateUserStatus } from '@/actions/admin';
import { UserStatus } from '@prisma/client';
import AddCompanyModal from '@/components/AddCompanyModal';
import CompanyDetailsSheet from '@/components/CompanyDetailsSheet';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AdminCompanies: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const data = await getCompanies(currentPage, pageSize, searchTerm);
      setCompanies(data.companies);
      setTotalItems(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, pageSize]);

  // Handle search with debouncing would be better, but for now simple trigger
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchCompanies();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleStatusUpdate = async (userId: string, status: UserStatus) => {
    try {
      await updateUserStatus(userId, status);
      fetchCompanies(); // Refresh list
      if (selectedCompany?.id === userId) {
        setSelectedCompany({ ...selectedCompany, status });
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const exportToCSV = async () => {
    try {
      // For export we want ALL companies
      const allCompanies = await getAllCompanies();
      const data = allCompanies.map(c => ({
        'Company Name': c.companyName || c.name,
        'Email': c.email,
        'Balance': c.wallet?.balance || 0,
        'Status': c.status,
        'Joined Date': new Date(c.createdAt).toLocaleDateString()
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Companies");
      XLSX.writeFile(wb, "AirTimeConnect_Companies.xlsx");
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExportDropdownOpen(false);
    }
  };

  const exportToPDF = async () => {
    try {
      const allCompanies = await getAllCompanies();
      const doc = new jsPDF();
      doc.text("AirTimeConnect - Registered Companies", 14, 15);

      const tableColumn = ["Company", "Email", "Balance", "Status", "Joined"];
      const tableRows = allCompanies.map(c => [
        c.companyName || c.name,
        c.email,
        `$${(c.wallet?.balance || 0).toLocaleString()}`,
        c.status,
        new Date(c.createdAt).toLocaleDateString()
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241] } // Indigo color in RGB
      });

      doc.save("AirTimeConnect_Companies.pdf");
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExportDropdownOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Registered Companies</h2>
          <p className="text-gray-500 text-sm font-medium">Review, approve, and manage company accounts.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCompanies}
            className="p-2.5 bg-white border border-gray-100 text-gray-500 rounded-2xl hover:bg-gray-50 hover:text-indigo-600 transition-all shadow-sm"
            title="Refresh Table"
          >
            <RefreshCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-gray-100 text-gray-700 rounded-2xl hover:bg-gray-50 font-black text-sm shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-50 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={exportToCSV}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel / CSV</span>
                </button>
                <button
                  onClick={exportToPDF}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>PDF Document</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black text-sm shadow-xl shadow-indigo-100 transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Add Company</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 font-black" />
            <input
              type="text"
              placeholder="Search companies by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-transparent focus:border-indigo-500 rounded-[1.5rem] outline-none transition-all font-medium text-sm"
            />
          </div>
          <button className="flex items-center space-x-2 px-5 py-3.5 bg-gray-50 hover:bg-gray-100 rounded-[1.5rem] text-gray-500 font-bold text-sm transition-all border border-transparent hover:border-gray-200">
            <Filter className="w-4 h-4" />
            <span>Advanced Filters</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Synchronizing Database...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center px-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900">No companies matched</h3>
            <p className="text-gray-400 mt-2 max-w-xs mx-auto text-sm font-medium">Try adjusting your filters or search term to find what you're looking for.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-50">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Company Profile</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Current Balance</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Compliance Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Registered On</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {companies.map((company: any) => (
                    <tr
                      key={company.id}
                      className="hover:bg-indigo-50/30 transition-all group cursor-pointer"
                      onClick={() => {
                        setSelectedCompany(company);
                        setIsSheetOpen(true);
                      }}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-5">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-indigo-700 font-black text-lg shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                            {(company.companyName || company.name).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{company.companyName || company.name}</p>
                            <p className="text-xs text-gray-400 font-medium">{company.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900">${(company.wallet?.balance || 0).toLocaleString()}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">USD Wallet</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${company.status === UserStatus.ACTIVE ? 'bg-green-100 text-green-700' :
                          company.status === UserStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                          {company.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-gray-500">
                          {new Date(company.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          {company.status !== UserStatus.ACTIVE && (
                            <button
                              onClick={() => handleStatusUpdate(company.id, UserStatus.ACTIVE)}
                              className="p-2.5 text-green-600 hover:bg-green-100 rounded-xl transition-all"
                              title="Activate Account"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          )}
                          {company.status !== UserStatus.SUSPENDED && (
                            <button
                              onClick={() => handleStatusUpdate(company.id, UserStatus.SUSPENDED)}
                              className="p-2.5 text-red-600 hover:bg-red-100 rounded-xl transition-all"
                              title="Suspend Account"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button className="p-2.5 text-gray-400 hover:bg-gray-100 rounded-xl">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                <span>Showing</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-gray-100 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 transition-all font-black text-indigo-600 shadow-sm"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <span>of {totalItems} Companies</span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-3 bg-white border border-gray-100 text-gray-500 rounded-2xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm group"
                >
                  <ChevronLeft className="w-5 h-5 group-active:-translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => {
                      if (totalPages <= 5) return true;
                      if (p === 1 || p === totalPages) return true;
                      return Math.abs(p - currentPage) <= 1;
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="text-gray-300 font-bold px-1">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-11 h-11 rounded-2xl text-sm font-black transition-all ${currentPage === page
                              ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110'
                              : 'bg-white border border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                            }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-3 bg-white border border-gray-100 text-gray-500 rounded-2xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm group"
                >
                  <ChevronRight className="w-5 h-5 group-active:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <AddCompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCompanies}
      />

      <CompanyDetailsSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        company={selectedCompany}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default AdminCompanies;


