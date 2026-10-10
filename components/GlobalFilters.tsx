'use client';

import React from 'react';
import { Search, Filter, X, SlidersHorizontal, Layers } from 'lucide-react';
import { Dataset } from '@/lib/bi-datasets';

interface GlobalFiltersProps {
  dataset: Dataset;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedDimensionValue: string;
  setSelectedDimensionValue: (val: string) => void;
  selectedDimensionKey: string;
  setSelectedDimensionKey: (key: string) => void;
  filteredCount: number;
  totalCount: number;
  onClearFilters: () => void;
}

export function GlobalFilters({
  dataset,
  searchTerm,
  setSearchTerm,
  selectedDimensionValue,
  setSelectedDimensionValue,
  selectedDimensionKey,
  setSelectedDimensionKey,
  filteredCount,
  totalCount,
  onClearFilters,
}: GlobalFiltersProps) {
  // Find available dimension columns
  const dimensionCols = dataset.columns.filter((col) => col.isDimension || col.type === 'string');

  // Find unique values for selected dimension
  const currentDimCol = dimensionCols.find((c) => c.key === selectedDimensionKey) || dimensionCols[0];
  const uniqueDimensionValues = currentDimCol
    ? Array.from(new Set(dataset.records.map((r) => String(r[currentDimCol.key])))).filter(Boolean)
    : [];

  const hasActiveFilters = searchTerm !== '' || selectedDimensionValue !== 'ALL';

  return (
    <div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-[240px] max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search records, categories, metrics..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Dimension Selectors */}
        <div className="flex items-center flex-wrap gap-2.5">
          {dimensionCols.length > 0 && (
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDimensionKey}
                onChange={(e) => {
                  setSelectedDimensionKey(e.target.value);
                  setSelectedDimensionValue('ALL');
                }}
                className="bg-transparent text-slate-700 text-xs font-semibold focus:outline-hidden border-none py-0.5 cursor-pointer"
              >
                {dimensionCols.map((col) => (
                  <option key={col.key} value={col.key}>
                    Filter by {col.label}
                  </option>
                ))}
              </select>

              <span className="text-slate-300">|</span>

              <select
                value={selectedDimensionValue}
                onChange={(e) => setSelectedDimensionValue(e.target.value)}
                className="bg-transparent text-slate-800 text-xs font-medium focus:outline-hidden border-none py-0.5 cursor-pointer max-w-[150px]"
              >
                <option value="ALL">All {currentDimCol?.label || 'Values'}</option>
                {uniqueDimensionValues.map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Active record count pill */}
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium border border-slate-200">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              <strong className="text-slate-900">{filteredCount}</strong> of {totalCount} records
            </span>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
            >
              <X className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
