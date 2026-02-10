'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Recipient } from '@/types';
import { Upload, FileText, CheckCircle2, Zap, Send, Download, AlertCircle } from 'lucide-react';
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
  const [validationInfo, setValidationInfo] = useState<{ skipped: number, total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

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
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          throw new Error("The uploaded file is empty.");
        }

        // Check for required headers
        const firstRow = jsonData[0] as any;
        const availableKeys = Object.keys(firstRow);
        const keysLower = availableKeys.map(k => k.toLowerCase());

        const phoneKeyActual = availableKeys.find((_, i) => keysLower[i].includes('phone') || keysLower[i].includes('number') || keysLower[i].includes('msisdn'));
        const amountKeyActual = availableKeys.find((_, i) => keysLower[i].includes('amount') || keysLower[i].includes('credit') || keysLower[i].includes('value'));
        const nameKeyActual = availableKeys.find((_, i) => keysLower[i].includes('name') || keysLower[i].includes('employee') || keysLower[i].includes('user'));

        if (!phoneKeyActual || !amountKeyActual) {
          throw new Error("File must contain columns for 'Phone Number' (or 'MSISDN') and 'Amount'.");
        }

        let skippedCount = 0;
        const parsedRecipients: Recipient[] = [];

        jsonData.forEach((row: any) => {
          const phoneNumberRaw = String(row[phoneKeyActual] || '').trim();
          const amountRaw = String(row[amountKeyActual] || '').trim().replace(/[$,]/g, '');
          const amount = parseFloat(amountRaw);
          const name = nameKeyActual ? String(row[nameKeyActual] || '').trim() : 'User';

          if (!phoneNumberRaw || isNaN(amount) || amount <= 0) {
            skippedCount++;
            return;
          }

          // Remove all non-digit characters except +
          const phoneNumber = phoneNumberRaw.replace(/[^\d+]/g, '');

          parsedRecipients.push({
            name: name || 'User',
            phoneNumber: phoneNumber.startsWith('+') || phoneNumber.length > 10 ? phoneNumber : `+${phoneNumber}`,
            amount,
            status: 'pending'
          });
        });

        if (parsedRecipients.length === 0) {
          throw new Error("No valid records found. Ensure Phone Numbers and Amounts are correct.");
        }

        setRecipients(parsedRecipients);
        setValidationInfo({ skipped: skippedCount, total: jsonData.length });
      } catch (err: any) {
        setError(err.message || "Failed to parse file. Please check the format.");
      } finally {
        setIsProcessingCsv(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const totalToDistribute = recipients.reduce((sum, r) => sum + r.amount, 0);
  const hasSufficientBalance = user.balance >= totalToDistribute;

  const handleExecute = async () => {
    if (!hasSufficientBalance) {
      setError("Insufficient wallet balance for this distribution.");
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
        // Update session to reflect new balance
        await update();
        // Optional: redirect to history after a delay
        setTimeout(() => router.push('/company/history'), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong during distribution.");
    } finally {
      setIsExecuting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      { "Employee Name": "John Doe", "Phone Number": "263771234567", "Amount": 50 },
      { "Employee Name": "Jane Smith", "Phone Number": "263712345678", "Amount": 75 }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Airtime_Distribution_Template.xlsx");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Bulk <span className="text-indigo-600">Distribution</span></h2>
        <p className="text-xl text-gray-500 font-medium">Upload your spreadsheet to credit multiple numbers instantly.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-center space-x-4 text-red-700 animate-in fade-in zoom-in-95 duration-300">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <p className="text-lg font-medium">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-100 p-6 rounded-2xl flex items-center space-x-4 text-green-700 animate-in fade-in zoom-in-95 duration-300">
          <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
          <p className="text-lg font-medium">{successMessage}</p>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-black text-2xl flex items-center space-x-3 text-gray-900">
            <Upload className="w-7 h-7 text-indigo-600" />
            <span>Upload Contact Sheet</span>
          </h3>
          <button
            onClick={downloadTemplate}
            className="text-lg text-indigo-600 hover:text-indigo-700 font-bold flex items-center space-x-2 transition-colors"
          >
            <Download className="w-5 h-5" />
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
              <div className="bg-white w-20 h-20 rounded-full shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                {isProcessingCsv ? (
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FileText className="w-10 h-10 text-indigo-600" />
                )}
              </div>
              <h4 className="text-2xl font-black text-gray-900">Click to upload or drag & drop</h4>
              <p className="text-xl text-gray-400 font-medium max-w-lg mx-auto mt-4">
                Supported formats: CSV, XLS, XLSX. Ensure your file contains 'Phone Number' (or MSISDN) and 'Amount' columns.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-indigo-50 p-5 rounded-2xl">
                <div className="flex items-center space-x-4 text-indigo-700">
                  <div className="bg-indigo-600 text-white p-2 rounded-lg">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-xl text-indigo-900">{recipients.length} Recipients Validated</p>
                    <p className="text-lg font-medium text-indigo-600/80">
                      {validationInfo && validationInfo.skipped > 0
                        ? `${validationInfo.total} rows found, ${validationInfo.skipped} skipped due to invalid data.`
                        : 'Ready for processing'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setRecipients([]); setValidationInfo(null); setError(null); setSuccessMessage(null); }}
                  className="px-6 py-3 text-lg font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                >
                  Clear List
                </button>
              </div>

              <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-6 text-lg font-medium text-gray-400 uppercase tracking-widest">Employee Name</th>
                      <th className="px-8 py-6 text-lg font-medium text-gray-400 uppercase tracking-widest">Phone Number</th>
                      <th className="px-8 py-6 text-lg font-medium text-gray-400 uppercase tracking-widest text-right">Credit Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recipients.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-8 py-6 text-xl font-bold text-gray-900">{r.name}</td>
                        <td className="px-8 py-6 text-xl text-gray-500 font-medium">{r.phoneNumber}</td>
                        <td className="px-8 py-6 text-right font-black text-indigo-600 text-2xl font-mono tracking-tighter">${r.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl flex items-center justify-between text-white">
                <div>
                  <p className="text-slate-400 text-sm uppercase font-medium tracking-[0.2em] mb-1">Grand Total Cost</p>
                  <p className="text-5xl font-black font-mono tracking-tighter text-white">${totalToDistribute.toLocaleString()}</p>
                  {!hasSufficientBalance && (
                    <p className="text-red-400 text-lg mt-2 font-medium bg-red-400/10 px-4 py-2 rounded-xl inline-block">Insufficient balance (Available: ${user.balance.toLocaleString()})</p>
                  )}
                </div>
                <button
                  onClick={handleExecute}
                  disabled={isExecuting || !hasSufficientBalance}
                  className={`px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl rounded-2xl shadow-xl shadow-indigo-900/40 transition-all flex items-center space-x-3 transform ${isExecuting || !hasSufficientBalance ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 active:scale-95'}`}
                >
                  {isExecuting ? (
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-6 h-6" />
                  )}
                  <span>{isExecuting ? 'Processing...' : 'Execute Distribution'}</span>
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


