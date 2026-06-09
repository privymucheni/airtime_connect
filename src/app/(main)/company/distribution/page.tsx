'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Recipient } from '@/types';
import { formatPhoneNumber, displayPhoneNumber } from '@/lib/phoneFormatter';
import {
  Upload, FileText, CheckCircle2, Send, Download,
  AlertCircle, AlertTriangle, X, Trash2, ArrowRight, ArrowLeft, Loader2, Plus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { distributeAirtime } from '@/actions/company';
import { useRouter } from 'next/navigation';
import WalletModal from '@/components/WalletModal';

const CompanyDistribution: React.FC = () => {
  const { user, update } = useAuth();
  const router = useRouter();
  
  // Guided Workflow Step state (1: Upload, 2: Review, 3: Confirm)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const getGreeting = (name: string) => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 18) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };
  
  // File metadata state
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number; rows: number; columns: string[] } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationInfo, setValidationInfo] = useState<{ skipped: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  // ─── Duplicate detection ───────────────────────────────────────────────────
  const duplicateMap = useMemo(() => {
    const map = new Map<string, number[]>();
    recipients.forEach((r, i) => {
      const key = r.phoneNumber.trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(i);
    });
    const dupes = new Map<string, number[]>();
    map.forEach((indices, phone) => {
      if (indices.length > 1) dupes.set(phone, indices);
    });
    return dupes;
  }, [recipients]);

  const hasDuplicates = duplicateMap.size > 0;
  const duplicateIndices = useMemo(() => {
    const set = new Set<number>();
    duplicateMap.forEach((indices) => indices.forEach((i) => set.add(i)));
    return set;
  }, [duplicateMap]);
  // ──────────────────────────────────────────────────────────────────────────

  const processFile = (file: File) => {
    setIsProcessingCsv(true);
    setError(null);
    setSuccessMessage(null);
    setValidationInfo(null);
    setFileMeta(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (rawRows.length === 0) {
          throw new Error('The uploaded file is empty.');
        }

        let headerRowIndex = -1;
        let phoneKeyIndex = -1;
        let amountKeyIndex = -1;
        let nameKeyIndex = -1;

        const phoneKeywords = ['phone', 'number', 'msisdn', 'mobile', 'contact', 'cell', 'tel'];
        const amountKeywords = ['amount', 'credit', 'value', 'price', 'cost', 'total', 'amt', 'balance'];
        const nameKeywords = ['name', 'employee', 'user', 'recipient', 'person', 'customer', 'staff', 'member'];

        for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
          const row = rawRows[i];
          if (!Array.isArray(row)) continue;
          const rowLower = row.map((cell) => String(cell || '').toLowerCase().trim());
          const pIdx = rowLower.findIndex((k) => phoneKeywords.some((key) => k.includes(key)));
          const aIdx = rowLower.findIndex((k) => amountKeywords.some((key) => k.includes(key)));
          const nIdx = rowLower.findIndex((k) => nameKeywords.some((key) => k.includes(key)));
          if (pIdx !== -1 && aIdx !== -1) {
            headerRowIndex = i;
            phoneKeyIndex = pIdx;
            amountKeyIndex = aIdx;
            nameKeyIndex = nIdx;
            break;
          }
        }

        if (headerRowIndex === -1) {
          throw new Error(
            "File must contain columns for 'Phone Number' (or 'MSISDN') and 'Amount'. Please ensure these headers are in one of the first 10 rows."
          );
        }

        let skippedCount = 0;
        const parsedRecipients: Recipient[] = [];

        for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row || row.length === 0) continue;

          const phoneNumberRaw = String(row[phoneKeyIndex] || '').trim();
          const amountRaw = String(row[amountKeyIndex] || '').trim().replace(/[$,]/g, '');
          const amount = parseFloat(amountRaw);
          const name = nameKeyIndex !== -1 ? String(row[nameKeyIndex] || '').trim() : 'User';

          if (!phoneNumberRaw || isNaN(amount) || amount <= 0) {
            if (phoneNumberRaw || amountRaw) skippedCount++;
            continue;
          }

          const phoneNumber = formatPhoneNumber(phoneNumberRaw);
          parsedRecipients.push({
            name: name || 'User',
            phoneNumber,
            amount,
            status: 'pending',
          });
        }

        if (parsedRecipients.length === 0) {
          throw new Error('No valid records found. Ensure Phone Numbers and Amounts are correct.');
        }

        setRecipients(parsedRecipients);
        setValidationInfo({ skipped: skippedCount, total: rawRows.length - (headerRowIndex + 1) });
        
        // Capture File Metadata
        const detectedHeaders = (rawRows[headerRowIndex] || []).map(h => String(h || ''));
        setFileMeta({
          name: file.name,
          size: file.size,
          rows: parsedRecipients.length,
          columns: detectedHeaders.filter(h => h.trim() !== '')
        });
      } catch (err: any) {
        setError(err.message || 'Failed to parse file. Please check the format.');
      } finally {
        setIsProcessingCsv(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (['csv', 'xlsx', 'xls'].includes(extension || '')) {
        processFile(file);
      } else {
        setError('Invalid file format. Please upload a CSV or Excel spreadsheet.');
      }
    }
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients((prev) => prev.filter((_, i) => i !== index));
    if (fileMeta) {
      setFileMeta({ ...fileMeta, rows: fileMeta.rows - 1 });
    }
  };

  const handleRemoveAllDuplicates = () => {
    const dupePhones = new Set(duplicateMap.keys());
    const remaining = recipients.filter((r) => !dupePhones.has(r.phoneNumber.trim()));
    setRecipients(remaining);
    if (fileMeta) {
      setFileMeta({ ...fileMeta, rows: remaining.length });
    }
  };

  const totalToDistribute = recipients.reduce((sum, r) => sum + r.amount, 0);
  const hasSufficientBalance = user.balance >= totalToDistribute;

  const handleExecute = async () => {
    if (!hasSufficientBalance) {
      setError('Insufficient wallet balance for this distribution.');
      return;
    }
    if (hasDuplicates) {
      setError('Please resolve all duplicate phone numbers before distributing.');
      return;
    }

    setIsExecuting(true);
    setError(null);

    try {
      const result = await distributeAirtime({ recipients });
      if (result.success) {
        setSuccessMessage(`Successfully distributed airtime to ${recipients.length} recipients.`);
        setRecipients([]);
        setFileMeta(null);
        setValidationInfo(null);
        await update();
        setTimeout(() => router.push('/company/history'), 2500);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong during distribution.');
    } finally {
      setIsExecuting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      { 'Employee Name': 'John Doe', 'Phone Number': '263771234567', Amount: 50 },
      { 'Employee Name': 'Jane Smith', 'Phone Number': '263712345678', Amount: 75 },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Airtime_Distribution_Template.xlsx');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {getGreeting(user.name.split(' ')[0])}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage your airtime distributions efficiently and securely.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Wallet Balance Card */}
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col justify-center min-w-[160px] relative overflow-hidden">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Available Balance</span>
            <span className="text-lg font-bold text-indigo-600 font-mono mt-1">${user.balance.toLocaleString()}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center space-x-1.5 h-9 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold text-xs shadow-sm cursor-pointer justify-center"
            >
              <Plus className="w-3.5 h-3.5 text-slate-400" />
              <span>Top-up Wallet</span>
            </button>
            <button
              onClick={() => {
                setCurrentStep(1);
                setRecipients([]);
                setFileMeta(null);
                setValidationInfo(null);
                setError(null);
                setSuccessMessage(null);
              }}
              className="flex items-center space-x-1.5 h-9 px-4 bg-indigo-650 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold text-xs shadow-sm shadow-indigo-600/10 cursor-pointer justify-center"
            >
              <Send className="w-3.5 h-3.5 text-white/90" />
              <span>New Distribution</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Flow bar */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {/* Step 1 */}
          <div className="flex items-center space-x-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              currentStep > 1 
                ? 'bg-emerald-100 border border-emerald-200 text-emerald-700' 
                : 'bg-indigo-600 border border-indigo-600 text-white'
            }`}>
              {currentStep > 1 ? '✓' : '1'}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              currentStep === 1 ? 'text-indigo-600' : 'text-slate-400'
            }`}>Upload</span>
          </div>

          <div className="h-0.5 w-16 bg-slate-150"></div>

          {/* Step 2 */}
          <div className="flex items-center space-x-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              currentStep > 2 
                ? 'bg-emerald-100 border border-emerald-200 text-emerald-700' 
                : currentStep === 2 
                  ? 'bg-indigo-600 border border-indigo-600 text-white' 
                  : 'bg-slate-50 border border-slate-200 text-slate-400'
            }`}>
              {currentStep > 2 ? '✓' : '2'}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              currentStep === 2 ? 'text-indigo-600' : 'text-slate-400'
            }`}>Review</span>
          </div>

          <div className="h-0.5 w-16 bg-slate-150"></div>

          {/* Step 3 */}
          <div className="flex items-center space-x-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              currentStep === 3 
                ? 'bg-indigo-600 border border-indigo-600 text-white' 
                : 'bg-slate-50 border border-slate-200 text-slate-400'
            }`}>
              3
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              currentStep === 3 ? 'text-indigo-600' : 'text-slate-400'
            }`}>Confirm</span>
          </div>
        </div>
      </div>

      {/* General error or Success Banners */}
      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center space-x-3 text-red-700 animate-in fade-in zoom-in-95 duration-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center space-x-3 text-emerald-700 animate-in fade-in zoom-in-95 duration-200">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <p className="text-xs font-semibold">{successMessage}</p>
        </div>
      )}

      {/* ── STEP 1: UPLOAD FILE ── */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Bulk Distribution</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Upload your spreadsheet to credit multiple numbers instantly.</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer group ${
                isDragOver 
                  ? 'border-indigo-500 bg-indigo-50/20' 
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/10'
              }`}
            >
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,.xlsx,.xls"
              />
              <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform border border-slate-100/50 shadow-sm">
                {isProcessingCsv ? (
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-indigo-600" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Upload Contact Sheet</h4>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Click to upload or drag &amp; drop</p>
              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-3 inline-block uppercase tracking-wider">CSV, XLS, XLSX formats</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-50">
              <p className="text-[10px] text-slate-400 font-medium">Ensure your file contains 'Phone Number' and 'Amount' columns.</p>
              <button
                onClick={downloadTemplate}
                className="text-[10px] text-indigo-600 hover:text-indigo-750 font-bold flex items-center space-x-1.5 transition-colors uppercase tracking-widest cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Template</span>
              </button>
            </div>
          </div>

          {/* File Summary Card */}
          {fileMeta && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 truncate max-w-xs">{fileMeta.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{formatBytes(fileMeta.size)}</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10">
                  Ready for Review
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Detected Rows</span>
                  <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">{fileMeta.rows} recipients</p>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Matched Columns</span>
                  <p className="text-xs font-semibold text-slate-600 truncate mt-0.5">{fileMeta.columns.join(', ')}</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-650 text-white rounded-xl hover:bg-indigo-700 font-semibold text-xs shadow-md shadow-indigo-600/10 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Proceed to Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: REVIEW DATA ── */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Duplicate warnings inside review if found */}
          {hasDuplicates && (
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider mb-1">Duplicate Numbers Flagged</h4>
                    <p className="text-[10px] text-amber-700 font-semibold mb-3">
                      The numbers below appear multiple times. Discard the duplicates to unlock confirmation.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(duplicateMap.entries()).map(([phone, indices]) => (
                        <span key={phone} className="inline-flex items-center px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-bold rounded-lg font-mono">
                          {phone} <span className="ml-1 text-[8px] bg-amber-300 text-amber-900 px-1 rounded">×{indices.length}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleRemoveAllDuplicates}
                  className="flex-shrink-0 flex items-center space-x-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-750 text-white text-[10px] font-bold rounded-lg transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Duplicates</span>
                </button>
              </div>
            </div>
          )}

          {/* Table Directory Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800">Recipients Preview (First 10 Rows)</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{recipients.length} Loaded</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/75 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Recipient Name</th>
                    <th className="px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Phone Number</th>
                    <th className="px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest text-right">Amount</th>
                    <th className="px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recipients.slice(0, 10).map((r, i) => {
                    const isDupe = duplicateIndices.has(i);
                    return (
                      <tr key={i} className={`transition-colors hover:bg-slate-50/40 ${isDupe ? 'bg-rose-50/50 hover:bg-rose-50' : 'odd:bg-white even:bg-slate-50/20'}`}>
                        <td className="px-6 py-3">
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-semibold ${isDupe ? 'text-rose-700' : 'text-slate-800'}`}>{r.name}</span>
                            {isDupe && (
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-rose-100 border border-rose-200 text-rose-600 rounded text-[8px] font-bold uppercase tracking-wider">
                                Duplicate
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`px-6 py-3 text-xs font-semibold font-mono ${isDupe ? 'text-rose-600' : 'text-slate-500'}`}>
                          {displayPhoneNumber(r.phoneNumber)}
                        </td>
                        <td className={`px-6 py-3 text-right text-xs font-bold font-mono ${isDupe ? 'text-rose-600' : 'text-indigo-600'}`}>
                          ${r.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <button
                            onClick={() => handleRemoveRecipient(i)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all active:scale-90 cursor-pointer border border-transparent hover:border-rose-100"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {recipients.length > 10 && (
              <div className="p-4 bg-slate-50/50 text-center border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">... and {recipients.length - 10} more rows loaded ...</p>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center space-x-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-55 font-semibold text-xs active:scale-95 transition-all cursor-pointer bg-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Upload</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={hasDuplicates}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-650 text-white rounded-xl hover:bg-indigo-750 font-semibold text-xs shadow-md shadow-indigo-600/10 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>Proceed to Confirm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: CONFIRM ── */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cost Summary Card */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Distribution Summary</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Summary of charges and loaded recipients</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Recipients</span>
                  <p className="text-xl font-bold text-slate-800 font-mono mt-1">{recipients.length}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Grand Total Cost</span>
                  <p className="text-xl font-bold text-indigo-650 font-mono mt-1">${totalToDistribute.toLocaleString()}</p>
                </div>
              </div>

              {/* Insufficient Funds Warning Block */}
              {!hasSufficientBalance && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start space-x-3 text-red-750">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-red-950 uppercase tracking-wide">Insufficient Wallet Funds</h5>
                    <p className="text-[10px] text-red-750 font-semibold mt-1">
                      Your wallet balance of <strong>${user.balance.toLocaleString()}</strong> is less than the Grand Total of <strong>${totalToDistribute.toLocaleString()}</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Wallet Balance Widget Column */}
            <div className="md:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between h-48">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Available Balance</span>
                <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tight mt-1.5">${user.balance.toLocaleString()}</h3>
                <p className="text-[9px] text-slate-400 font-semibold mt-1 truncate">Portal: {user.companyName || user.name}</p>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Fintech Secured SSL</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center space-x-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-55 font-semibold text-xs active:scale-95 transition-all cursor-pointer bg-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Review</span>
            </button>
            <button
              onClick={handleExecute}
              disabled={isExecuting || !hasSufficientBalance || hasDuplicates}
              className={`flex items-center space-x-2 px-5 py-2.5 bg-indigo-650 text-white rounded-xl hover:bg-indigo-700 font-semibold text-xs shadow-md shadow-indigo-600/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50`}
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white/95" />
              )}
              <span>{isExecuting ? 'Distributing...' : 'Send Distribution'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Wallet top up modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        currentBalance={user.balance}
      />
    </div>
  );
};

export default CompanyDistribution;
