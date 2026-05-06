'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Recipient } from '@/types';
import {
  Upload, FileText, CheckCircle2, Send, Download,
  AlertCircle, AlertTriangle, X, Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { distributeAirtime } from '@/actions/company';
import { useRouter } from 'next/navigation';

const CompanyDistribution: React.FC = () => {
  const { user, update } = useAuth();
  const router = useRouter();
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationInfo, setValidationInfo] = useState<{ skipped: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  // ─── Duplicate detection ───────────────────────────────────────────────────
  // Build a map of phoneNumber → indices that share it
  const duplicateMap = useMemo(() => {
    const map = new Map<string, number[]>();
    recipients.forEach((r, i) => {
      const key = r.phoneNumber.trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(i);
    });
    // Keep only entries that appear more than once
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingCsv(true);
    setError(null);
    setSuccessMessage(null);
    setValidationInfo(null);

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

          const phoneNumber = phoneNumberRaw.replace(/[^\d+]/g, '');
          parsedRecipients.push({
            name: name || 'User',
            phoneNumber:
              phoneNumber.startsWith('+') || phoneNumber.length > 10
                ? phoneNumber
                : `+${phoneNumber}`,
            amount,
            status: 'pending',
          });
        }

        if (parsedRecipients.length === 0) {
          throw new Error('No valid records found. Ensure Phone Numbers and Amounts are correct.');
        }

        setRecipients(parsedRecipients);
        setValidationInfo({ skipped: skippedCount, total: rawRows.length - (headerRowIndex + 1) });
      } catch (err: any) {
        setError(err.message || 'Failed to parse file. Please check the format.');
      } finally {
        setIsProcessingCsv(false);
        // Reset file input so the same file can be re-uploaded after clearing
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Remove a single row by index
  const handleRemoveRecipient = (index: number) => {
    setRecipients((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove ALL duplicate occurrences of a number (keeping none)
  const handleRemoveAllDuplicates = () => {
    const dupePhones = new Set(duplicateMap.keys());
    setRecipients((prev) => prev.filter((r) => !dupePhones.has(r.phoneNumber.trim())));
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
        setValidationInfo(null);
        await update();
        setTimeout(() => router.push('/company/history'), 3000);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Bulk <span className="text-indigo-600">Distribution</span>
        </h2>
        <p className="text-lg text-gray-500 font-medium">
          Upload your spreadsheet to credit multiple numbers instantly.
        </p>
      </div>

      {/* General error */}
      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center space-x-3 text-red-700 animate-in fade-in zoom-in-95 duration-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {/* Success */}
      {successMessage && (
        <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center space-x-3 text-green-700 animate-in fade-in zoom-in-95 duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-bold">{successMessage}</p>
        </div>
      )}

      {/* ── Duplicate warning banner ── */}
      {hasDuplicates && (
        <div className="bg-amber-50 border-2 border-amber-200 p-5 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-amber-100 rounded-xl flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-black text-amber-900 text-sm uppercase tracking-widest mb-1">
                  Duplicate Phone Numbers Detected — Distribution Blocked
                </p>
                <p className="text-xs text-amber-700 font-bold mb-3">
                  The following numbers appear more than once. Remove the duplicates to proceed.
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(duplicateMap.entries()).map(([phone, indices]) => (
                    <span
                      key={phone}
                      className="inline-flex items-center px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 text-xs font-black rounded-xl font-mono"
                    >
                      {phone}
                      <span className="ml-1.5 bg-amber-300 text-amber-900 rounded-md px-1.5 py-0.5 text-[10px]">
                        ×{indices.length}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={handleRemoveAllDuplicates}
              title="Remove all duplicate rows"
              className="flex-shrink-0 flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl transition-all uppercase tracking-widest shadow-md active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove All Duplicates</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center space-x-2 text-gray-900">
            <Upload className="w-5 h-5 text-indigo-600" />
            <span>Upload Contact Sheet</span>
          </h3>
          <button
            onClick={downloadTemplate}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-black flex items-center space-x-1 transition-colors uppercase tracking-widest"
          >
            <Download className="w-4 h-4" />
            <span>Download Template</span>
          </button>
        </div>

        <div className="p-8">
          {!recipients.length ? (
            <div
              className="border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,.xlsx,.xls"
              />
              <div className="bg-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border border-gray-50">
                {isProcessingCsv ? (
                  <div className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileText className="w-8 h-8 text-indigo-600" />
                )}
              </div>
              <h4 className="text-xl font-bold text-gray-900">Click to upload or drag &amp; drop</h4>
              <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto mt-2">
                Supported: CSV, XLS, XLSX. Ensure your file contains 'Phone Number' and 'Amount'
                columns.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status bar */}
              <div
                className={`flex items-center justify-between p-5 rounded-2xl ${hasDuplicates
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-indigo-50 border border-indigo-100'
                  }`}
              >
                <div className={`flex items-center space-x-3 ${hasDuplicates ? 'text-amber-700' : 'text-indigo-700'}`}>
                  <div className={`p-2 rounded-lg ${hasDuplicates ? 'bg-amber-600' : 'bg-indigo-600'} text-white`}>
                    {hasDuplicates ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className={`font-black text-lg ${hasDuplicates ? 'text-amber-900' : 'text-indigo-900'}`}>
                      {recipients.length} Recipients Loaded
                      {hasDuplicates && (
                        <span className="ml-2 text-amber-600 text-sm">
                          — {duplicateIndices.size} duplicate row{duplicateIndices.size !== 1 ? 's' : ''} flagged
                        </span>
                      )}
                    </p>
                    <p className={`text-sm font-bold uppercase tracking-wider ${hasDuplicates ? 'text-amber-600' : 'text-indigo-600/80'}`}>
                      {hasDuplicates
                        ? 'Resolve duplicates to enable distribution'
                        : validationInfo && validationInfo.skipped > 0
                          ? `${validationInfo.total} rows, ${validationInfo.skipped} skipped`
                          : 'Ready for processing'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setRecipients([]);
                    setValidationInfo(null);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  Clear List
                </button>
              </div>

              {/* Recipients table */}
              <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-sm font-black text-gray-400 uppercase tracking-widest">
                        Employee Name
                      </th>
                      <th className="px-6 py-4 text-sm font-black text-gray-400 uppercase tracking-widest">
                        Phone Number
                      </th>
                      <th className="px-6 py-4 text-sm font-black text-gray-400 uppercase tracking-widest text-right">
                        Credit Amount
                      </th>
                      <th className="px-6 py-4 text-sm font-black text-gray-400 uppercase tracking-widest text-center">
                        Remove
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recipients.map((r, i) => {
                      const isDupe = duplicateIndices.has(i);
                      return (
                        <tr
                          key={i}
                          className={`transition-colors ${isDupe
                              ? 'bg-red-50/60 hover:bg-red-50'
                              : 'hover:bg-gray-50/30'
                            }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <span className={`text-base font-black ${isDupe ? 'text-red-700' : 'text-gray-900'}`}>
                                {r.name}
                              </span>
                              {isDupe && (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-red-100 border border-red-200 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  <span>Duplicate</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className={`px-6 py-4 text-base font-bold font-mono ${isDupe ? 'text-red-600' : 'text-gray-500'}`}>
                            {r.phoneNumber}
                          </td>
                          <td className={`px-6 py-4 text-right font-black text-lg tracking-tight ${isDupe ? 'text-red-600' : 'text-indigo-600'}`}>
                            ${r.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleRemoveRecipient(i)}
                              title="Remove this row"
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-xl transition-all active:scale-90 ${isDupe
                                  ? 'bg-red-100 text-red-500 hover:bg-red-600 hover:text-white border border-red-200'
                                  : 'bg-gray-100 text-gray-400 hover:bg-red-600 hover:text-white border border-gray-200'
                                }`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Total + Execute */}
              <div className="bg-slate-900 p-6 rounded-2xl flex items-center justify-between text-white">
                <div>
                  <p className="text-gray-400 text-[10px] uppercase font-medium tracking-[0.2em] mb-1">
                    Grand Total Cost
                  </p>
                  <p className="text-3xl font-black tracking-tight text-white">
                    ${totalToDistribute.toLocaleString()}
                  </p>
                  {!hasSufficientBalance && (
                    <p className="text-red-400 text-xs mt-2 font-bold bg-red-400/10 px-3 py-1.5 rounded-xl inline-block uppercase tracking-wider">
                      Insufficient balance
                    </p>
                  )}
                  {hasDuplicates && (
                    <p className="text-amber-400 text-xs mt-2 font-bold bg-amber-400/10 px-3 py-1.5 rounded-xl inline-block uppercase tracking-wider">
                      Resolve duplicates to proceed
                    </p>
                  )}
                </div>
                <button
                  onClick={handleExecute}
                  disabled={isExecuting || !hasSufficientBalance || hasDuplicates}
                  className={`px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-900/40 transition-all flex items-center space-x-2 transform ${isExecuting || !hasSufficientBalance || hasDuplicates
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:-translate-y-1 active:scale-95'
                    }`}
                >
                  {isExecuting ? (
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  <span className="uppercase tracking-widest">
                    {isExecuting ? 'Processing...' : 'Execute'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDistribution;
