'use client';

import React, { useState } from 'react';
import {
  Table,
  Upload,
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit2,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Search,
  FileCode,
  Download
} from 'lucide-react';
import { Dataset, DataRecord, ColumnMeta, parseCSV, formatValue } from '@/lib/bi-datasets';

interface DatasetExplorerProps {
  dataset: Dataset;
  records: DataRecord[];
  onUploadCustomCSV: (newDataset: Dataset) => void;
  onUpdateRecord: (updatedRecord: DataRecord) => void;
  onDeleteRecord: (id: string) => void;
  onAddRecord: (newRecord: DataRecord) => void;
  onExportCSV: () => void;
}

export function DatasetExplorer({
  dataset,
  records,
  onUploadCustomCSV,
  onUpdateRecord,
  onDeleteRecord,
  onAddRecord,
  onExportCSV,
}: DatasetExplorerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<DataRecord | null>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // CSV Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Sorting
  const sortedRecords = [...records].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDir === 'asc' ? valA - valB : valB - valA;
    }
    const strA = String(valA || '');
    const strB = String(valB || '');
    return sortDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
  });

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = sortedRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleHeaderClick = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const startEdit = (record: DataRecord) => {
    setEditingId(record.id);
    setEditFormData({ ...record });
  };

  const saveEdit = () => {
    if (editFormData) {
      onUpdateRecord(editFormData);
      setEditingId(null);
      setEditFormData(null);
    }
  };

  // CSV File Processing
  const handleFileUpload = (file: File) => {
    setUploadError(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) return;

        if (file.name.endsWith('.json')) {
          const json = JSON.parse(text);
          if (Array.isArray(json) && json.length > 0) {
            const keys = Object.keys(json[0]);
            const columns: ColumnMeta[] = keys.map((key) => {
              const val = json[0][key];
              const isNum = typeof val === 'number';
              return {
                key,
                label: key.replace(/_/g, ' ').toUpperCase(),
                type: isNum ? 'number' : 'string',
                isMetric: isNum,
                isDimension: !isNum,
                format: isNum ? 'number' : 'raw',
              };
            });

            const parsedDataset: Dataset = {
              id: `custom_${Date.now()}`,
              name: file.name.replace(/\.[^/.]+$/, ''),
              description: `Uploaded custom JSON dataset with ${json.length} records.`,
              category: 'Uploaded Custom Stream',
              columns,
              records: json.map((item, idx) => ({ id: `row_${idx}`, ...item })),
              kpis: columns
                .filter((c) => c.isMetric)
                .slice(0, 3)
                .map((c) => ({
                  title: `Total ${c.label}`,
                  metricKey: c.key,
                  aggregation: 'sum',
                  format: 'number',
                })),
            };

            onUploadCustomCSV(parsedDataset);
            return;
          }
        }

        const { columns, records: parsedRecords } = parseCSV(text);
        const customDataset: Dataset = {
          id: `csv_${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          description: `Custom dataset imported from ${file.name}.`,
          category: 'Uploaded Custom CSV',
          columns,
          records: parsedRecords,
          kpis: columns
            .filter((c) => c.isMetric)
            .slice(0, 3)
            .map((c) => ({
              title: `Total ${c.label}`,
              metricKey: c.key,
              aggregation: 'sum',
              format: c.format as any || 'number',
            })),
        };

        onUploadCustomCSV(customDataset);
      } catch (err: any) {
        setUploadError(err?.message || 'Failed to parse uploaded dataset file.');
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Dataset Explorer & Ingestion</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              View, edit, search, or upload new enterprise CSV / JSON data streams
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* CSV / JSON File Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
          }
        }}
        className={`mb-6 p-6 border-2 border-dashed rounded-xl text-center transition cursor-pointer ${
          isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
        }`}
      >
        <input
          type="file"
          accept=".csv,.json"
          id="csv-file-input"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />
        <label htmlFor="csv-file-input" className="cursor-pointer block">
          <div className="mx-auto w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-800">
            Click to upload or drag and drop custom dataset (.csv, .json)
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Auto-detects data types, headers, metrics, and generates instant BI visualizations
          </div>
        </label>
        {uploadError && <div className="mt-2 text-xs font-semibold text-rose-600">{uploadError}</div>}
      </div>

      {/* Data Grid Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-3 w-10 text-center">#</th>
                {dataset.columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleHeaderClick(col.key)}
                    className="px-6 py-3 cursor-pointer hover:text-slate-700 transition select-none"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>{col.label}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((record, index) => {
                  const isEditing = editingId === record.id;
                  const recordIndex = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-3.5 text-center text-slate-400 font-mono text-xs">{recordIndex}</td>
                      {dataset.columns.map((col) => {
                        const val = isEditing ? editFormData?.[col.key] : record[col.key];

                        return (
                          <td key={col.key} className="px-6 py-3.5 font-medium">
                            {isEditing ? (
                              <input
                                type={col.type === 'number' ? 'number' : 'text'}
                                value={String(val ?? '')}
                                onChange={(e) => {
                                  if (editFormData) {
                                    setEditFormData({
                                      ...editFormData,
                                      [col.key]: col.type === 'number' ? Number(e.target.value) : e.target.value,
                                    });
                                  }
                                }}
                                className="w-full px-2 py-1 border border-indigo-400 rounded-md text-xs font-mono"
                              />
                            ) : (
                              <span className={col.isMetric ? 'font-mono text-slate-900 font-semibold' : 'text-slate-800'}>
                                {col.isMetric ? formatValue(Number(val), col.format) : String(val ?? '')}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-6 py-3.5 text-right">
                        {isEditing ? (
                          <button
                            onClick={saveEdit}
                            className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md mr-1"
                            title="Save changes"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(record)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md mr-1"
                            title="Edit row"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteRecord(record.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={dataset.columns.length + 2} className="px-6 py-8 text-center text-slate-400 italic">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({records.length} records)
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-300 bg-white disabled:opacity-40 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-300 bg-white disabled:opacity-40 hover:bg-slate-100 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
