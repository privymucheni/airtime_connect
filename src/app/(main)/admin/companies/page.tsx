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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { getCompanies, getAllCompanies, updateUserStatus } from '@/actions/admin';
import { UserStatus } from '@prisma/client';
import AddCompanyModal from '@/components/AddCompanyModal';
import CompanyDetailsSheet from '@/components/CompanyDetailsSheet';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const data = await getCompanies(currentPage, pageSize, searchTerm, statusFilter);
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
  }, [currentPage, pageSize, statusFilter]);

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
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Top Bar with Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-indigo-600">Companies</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registered Companies</h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Review, approve, and manage company accounts.</p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchCompanies}
            className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Refresh Directory"
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Data</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={exportToCSV}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50/50 hover:text-indigo-600 rounded-lg transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                  <span>Excel / CSV</span>
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

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold text-xs shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Company</span>
          </button>
        </div>
      </div>

      {/* Directory Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col justify-between">
        {/* Table Filter Area */}
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search companies by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white border border-transparent focus:border-indigo-500 rounded-xl outline-none transition-all text-xs font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all border cursor-pointer active:scale-95 ${statusFilter !== 'ALL' || isFilterOpen
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{statusFilter === 'ALL' ? 'Advanced Filters' : `Status: ${statusFilter}`}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                  Filter by Status
                </div>
                {(['ALL', ...Object.values(UserStatus)] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setCurrentPage(1);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${statusFilter === status
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                      : 'text-slate-700 hover:bg-indigo-50/50 hover:text-indigo-600'
                      }`}
                  >
                    {status === 'ALL' ? 'All Companies' : status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Directory Contents */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 flex-grow animate-in fade-in duration-300">
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute w-6 h-6 border border-indigo-500/10 rounded-full"></div>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-4 tracking-wider animate-pulse">Synchronizing Database...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center px-4 flex-grow">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-4 text-slate-400 shadow-sm">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-semibold text-slate-900">No companies matched</h3>
            <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">Try adjusting your filters or search term to find what you're looking for.</p>
          </div>
        ) : (
          <div className="flex-grow">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/75 border-b border-slate-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Company Profile</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Balance</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compliance Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Registration Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companies.map((company: any) => (
                    <tr
                      key={company.id}
                      className="hover:bg-slate-50/60 transition-all odd:bg-white even:bg-slate-50/20 group cursor-pointer"
                      onClick={() => {
                        setSelectedCompany(company);
                        setIsSheetOpen(true);
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 border border-indigo-100/20">
                            {(company.companyName || company.name).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-none mb-1">{company.companyName || company.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium font-mono">{company.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-950 font-mono">${(company.wallet?.balance || 0).toLocaleString()}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">USD Wallet</span>
                        </div>
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
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-600 font-normal">
                          {new Date(company.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2.5">
                          <button
                            onClick={() => {
                              setSelectedCompany(company);
                              setIsSheetOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && companies.length > 0 && (
          <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50/70 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span>Showing</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-500 transition-all font-semibold text-indigo-600 shadow-sm"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <span>of {totalItems} Companies</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm group cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4 h-4 group-active:-translate-x-0.5 transition-transform" />
              </button>

              <div className="flex items-center space-x-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => {
                    if (totalPages <= 5) return true;
                    if (p === 1 || p === totalPages) return true;
                    return Math.abs(p - currentPage) <= 1;
                  })
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="text-slate-300 font-bold px-1 text-xs">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${currentPage === page
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 scale-105'
                          : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-55'
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
                className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm group cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-4 h-4 group-active:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
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
