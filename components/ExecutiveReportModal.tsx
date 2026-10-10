'use client';

import React from 'react';
import { X, Printer, Download, Sparkles, Building2, Calendar, FileCheck } from 'lucide-react';
import { Dataset, DataRecord, calculateKPIValue, formatValue } from '@/lib/bi-datasets';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: Dataset;
  filteredRecords: DataRecord[];
  onExportCSV: () => void;
}

export function ExecutiveReportModal({
  isOpen,
  onClose,
  dataset,
  filteredRecords,
  onExportCSV,
}: ExecutiveReportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full border border-slate-200 p-8 my-8 relative animate-in fade-in zoom-in duration-200 print:shadow-none print:border-none print:p-0">
        {/* Header Controls (Hidden on print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden mb-6">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-md">
              <FileCheck className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900">Executive Briefing Generator</h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Briefing Document Content */}
        <div className="space-y-6 text-slate-800 text-sm">
          {/* Document Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                NexusBI Enterprise Intelligence
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                Executive Performance & Strategy Brief
              </h1>
              <p className="text-xs text-slate-500 mt-1">Stream: {dataset.name}</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div className="font-semibold text-slate-700">Confidential</div>
              <div className="mt-1 flex items-center space-x-1 justify-end">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{currentDateStr}</span>
              </div>
            </div>
          </div>

          {/* Dataset Overview */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Data Scope Overview
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-200">
              This report compiles operational metrics across <strong>{filteredRecords.length}</strong> active data records from the <strong>{dataset.name}</strong> data stream.
            </p>
          </div>

          {/* KPI Snapshot Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Core Operational Snapshot
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {dataset.kpis.map((kpi, idx) => {
                const val = calculateKPIValue(filteredRecords, kpi.metricKey, kpi.aggregation);
                const formatted = formatValue(val, kpi.format, kpi.prefix, kpi.suffix);

                return (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-md shadow-2xs">
                    <div className="text-[10px] font-bold uppercase text-slate-400 truncate">
                      {kpi.title}
                    </div>
                    <div className="text-lg font-bold text-slate-900 mt-1 tracking-tight">{formatted}</div>
                    {kpi.target && (
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Target: {formatValue(kpi.target, kpi.format)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data Summary Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Recent Activity Data Log
            </h3>
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    {dataset.columns.slice(0, 5).map((col) => (
                      <th key={col.key} className="px-4 py-2.5">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRecords.slice(0, 6).map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      {dataset.columns.slice(0, 5).map((col) => (
                        <td key={col.key} className="px-4 py-2.5 font-mono text-slate-800">
                          {col.isMetric ? formatValue(Number(rec[col.key]), col.format) : String(rec[col.key] || '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Document Signoff Footer */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-400">
            <div>Generated automatically via NexusBI Engine</div>
            <div>Page 1 of 1</div>
          </div>
        </div>
      </div>
    </div>
  );
}
