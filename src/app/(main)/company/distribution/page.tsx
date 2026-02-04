'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { User, Recipient } from '@/types';
import { Upload, FileText, CheckCircle2, Zap, Send, Download } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const CompanyDistribution: React.FC = () => {
  const { user } = useAuth();
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingCsv(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      setTimeout(() => {
        const dummyRecipients: Recipient[] = [
          { name: 'John Doe', phoneNumber: '+1234567890', amount: 50, status: 'pending' },
          { name: 'Jane Smith', phoneNumber: '+0987654321', amount: 75, status: 'pending' },
          { name: 'Alice Johnson', phoneNumber: '+1122334455', amount: 100, status: 'pending' },
          { name: 'Bob Wilson', phoneNumber: '+1998877665', amount: 50, status: 'pending' },
        ];
        setRecipients(dummyRecipients);
        setIsProcessingCsv(false);
        runAiCheck(content);
      }, 1500);
    };
    reader.readAsText(file);
  };

  const runAiCheck = async (csvContent: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this CSV snippet for bulk airtime distribution. Identify potential issues like invalid phone numbers, unusually high amounts, or missing names. Format the output as a friendly summary for the finance manager.\n\n${csvContent.substring(0, 500)}`,
      });
      setAiAnalysis(response.text || null);
    } catch (err) {
      console.error("Gemini analysis failed", err);
    }
  };

  const totalToDistribute = recipients.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bulk Distribution</h2>
        <p className="text-gray-500">Upload your spreadsheet to credit multiple numbers instantly.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            <span>Upload Contact Sheet</span>
          </h3>
          <button className="text-sm text-indigo-600 hover:underline font-medium flex items-center space-x-1">
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
                accept=".csv,.xlsx"
              />
              <div className="bg-white w-20 h-20 rounded-full shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                {isProcessingCsv ? (
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FileText className="w-10 h-10 text-indigo-600" />
                )}
              </div>
              <h4 className="text-xl font-bold text-gray-900">Click to upload or drag & drop</h4>
              <p className="text-gray-500 max-w-sm mx-auto mt-2">
                Supported formats: CSV, XLS, XLSX. Ensure your file contains 'Phone' and 'Amount' columns.
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
                    <p className="font-bold text-lg">{recipients.length} Recipients Validated</p>
                    <p className="text-sm opacity-90">Ready for processing</p>
                  </div>
                </div>
                <button
                  onClick={() => { setRecipients([]); setAiAnalysis(null); }}
                  className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  Clear List
                </button>
              </div>

              {aiAnalysis && (
                <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex space-x-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm h-fit">
                    <Zap className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-900 mb-1 flex items-center">
                      AI Smart Audit Report
                    </p>
                    <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
                  </div>
                </div>
              )}

              <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-bold text-gray-600">Employee Name</th>
                      <th className="px-6 py-4 font-bold text-gray-600">Phone Number</th>
                      <th className="px-6 py-4 font-bold text-gray-600 text-right">Credit Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recipients.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{r.name}</td>
                        <td className="px-6 py-4 text-gray-500">{r.phoneNumber}</td>
                        <td className="px-6 py-4 text-right font-bold text-indigo-600">${r.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl flex items-center justify-between text-white">
                <div>
                  <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">Grand Total Cost</p>
                  <p className="text-3xl font-bold">${totalToDistribute.toLocaleString()}</p>
                </div>
                <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/50 transition-all flex items-center space-x-2 transform hover:-translate-y-1">
                  <Send className="w-5 h-5" />
                  <span>Execute Bulk Airtime</span>
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

