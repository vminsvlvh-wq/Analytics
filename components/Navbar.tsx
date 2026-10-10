'use client';

import React from 'react';
import {
  BarChart3,
  Bot,
  SlidersHorizontal,
  Table,
  FileText,
  Download,
  Database,
  PlusCircle,
  RefreshCw,
  Sparkles,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import { Dataset } from '@/lib/bi-datasets';

interface NavbarProps {
  datasets: Dataset[];
  selectedDataset: Dataset;
  onSelectDataset: (ds: Dataset) => void;
  activeTab: 'dashboard' | 'ai-analyst' | 'builder' | 'explorer' | 'toolkit';
  setActiveTab: (tab: 'dashboard' | 'ai-analyst' | 'builder' | 'explorer' | 'toolkit') => void;
  onOpenReport: () => void;
  onExportCSV: () => void;
  onResetFilters: () => void;
  isCustomUploaded?: boolean;
}

export function Navbar({
  datasets,
  selectedDataset,
  onSelectDataset,
  activeTab,
  setActiveTab,
  onOpenReport,
  onExportCSV,
  onResetFilters,
  isCustomUploaded
}: NavbarProps) {
  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Dataset Switcher */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-xs">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-slate-900">
                  Lumina Analytics
                </span>
                <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px] font-semibold text-slate-500 border border-slate-200">
                  PRO PLAN
                </span>
              </div>
            </div>

            {/* Dataset Dropdown Selector */}
            <div className="relative group">
              <div className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer transition">
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-medium text-slate-800 truncate max-w-[180px]">
                  {selectedDataset.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="absolute left-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-lg py-2 hidden group-hover:block z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                  Available Data Streams
                </div>
                {datasets.map((ds) => (
                  <button
                    key={ds.id}
                    onClick={() => onSelectDataset(ds)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-start space-x-2 hover:bg-slate-50 transition ${
                      selectedDataset.id === ds.id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
                    }`}
                  >
                    <div className="mt-0.5">
                      <Database className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-medium leading-tight text-slate-900">{ds.name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[210px] mt-0.5">
                        {ds.category} • {ds.records.length} records
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-6 h-16 text-sm font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 h-16 border-b-2 transition ${
                activeTab === 'dashboard'
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboards</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-analyst')}
              className={`flex items-center space-x-1.5 h-16 border-b-2 transition ${
                activeTab === 'ai-analyst'
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Analyst</span>
            </button>

            <button
              onClick={() => setActiveTab('builder')}
              className={`flex items-center space-x-1.5 h-16 border-b-2 transition ${
                activeTab === 'builder'
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Chart Builder</span>
            </button>

            <button
              onClick={() => setActiveTab('explorer')}
              className={`flex items-center space-x-1.5 h-16 border-b-2 transition ${
                activeTab === 'explorer'
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Data Grid</span>
            </button>

            <button
              onClick={() => setActiveTab('toolkit')}
              className={`flex items-center space-x-1.5 h-16 border-b-2 transition ${
                activeTab === 'toolkit'
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>BI Mastery Studio</span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenReport}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs transition"
              title="Generate Executive Summary Report"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Executive Brief</span>
            </button>

            <button
              onClick={onExportCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
              title="Export filtered records to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={onResetFilters}
              className="p-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-200 transition"
              title="Reset all filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
