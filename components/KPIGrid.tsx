'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  X,
  Sparkles
} from 'lucide-react';
import { DataRecord, Dataset, calculateKPIValue, formatValue } from '@/lib/bi-datasets';

interface KPIGridProps {
  dataset: Dataset;
  filteredRecords: DataRecord[];
  onAddCustomKPI: (kpi: { title: string; metricKey: string; aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min'; format: 'currency' | 'percent' | 'number'; target?: number }) => void;
}

export function KPIGrid({ dataset, filteredRecords, onAddCustomKPI }: KPIGridProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMetricKey, setNewMetricKey] = useState(dataset.columns.find((c) => c.isMetric)?.key || '');
  const [newAgg, setNewAgg] = useState<'sum' | 'avg' | 'count' | 'max' | 'min'>('sum');
  const [newFormat, setNewFormat] = useState<'currency' | 'percent' | 'number'>('currency');
  const [newTarget, setNewTarget] = useState<string>('');

  const numericColumns = dataset.columns.filter((c) => c.isMetric || c.type === 'number');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMetricKey) return;

    onAddCustomKPI({
      title: newTitle.trim(),
      metricKey: newMetricKey,
      aggregation: newAgg,
      format: newFormat,
      target: newTarget ? Number(newTarget) : undefined,
    });

    setNewTitle('');
    setNewTarget('');
    setShowAddModal(false);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Executive Key Performance Indicators
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              Live Aggregate
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Core operating metrics computed dynamically from filtered records
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom KPI</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {dataset.kpis.map((kpi, idx) => {
          const val = calculateKPIValue(filteredRecords, kpi.metricKey, kpi.aggregation);
          const formattedVal = formatValue(val, kpi.format, kpi.prefix, kpi.suffix);

          // Variance check against target
          let targetPct = 0;
          let isSuccess = false;
          let isWarning = false;

          if (kpi.target && kpi.target > 0) {
            targetPct = ((val - kpi.target) / kpi.target) * 100;
            // For churn or cost, lower is better
            const isLowerBetter = kpi.metricKey.toLowerCase().includes('churn') || kpi.metricKey.toLowerCase().includes('cac') || kpi.metricKey.toLowerCase().includes('cost');

            if (isLowerBetter) {
              isSuccess = val <= kpi.target;
              isWarning = val > kpi.target;
            } else {
              isSuccess = val >= kpi.target;
              isWarning = val < kpi.target * 0.9;
            }
          }

          // Min and Max values in current dataset slice
          const allVals = filteredRecords.map((r) => Number(r[kpi.metricKey]) || 0);

          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate pr-2">
                    {kpi.title}
                  </p>
                  {kpi.target && (
                    <span
                      className={`text-xs font-medium ${
                        isSuccess ? 'text-emerald-600' : isWarning ? 'text-amber-600' : 'text-slate-500'
                      }`}
                    >
                      {targetPct >= 0 ? `+${targetPct.toFixed(1)}%` : `${targetPct.toFixed(1)}%`}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {formattedVal}
                  </h2>
                  <span className="text-[11px] font-medium text-slate-400">
                    {kpi.aggregation}
                  </span>
                </div>
              </div>

              {/* Subtitle / Description */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="truncate">
                  {kpi.description || `Field: ${kpi.metricKey}`}
                </span>
                {kpi.target && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    Target: {formatValue(kpi.target, kpi.format)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to add Custom KPI */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Define Custom KPI Card</h3>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  KPI Title Name
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Net ARR Expansion, Order Velocity"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Column
                  </label>
                  <select
                    value={newMetricKey}
                    onChange={(e) => setNewMetricKey(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {numericColumns.map((col) => (
                      <option key={col.key} value={col.key}>
                        {col.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Aggregation
                  </label>
                  <select
                    value={newAgg}
                    onChange={(e) => setNewAgg(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="sum">Sum (Total)</option>
                    <option value="avg">Average (Mean)</option>
                    <option value="max">Max Value</option>
                    <option value="min">Min Value</option>
                    <option value="count">Record Count</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Format Mode
                  </label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="currency">Currency ($)</option>
                    <option value="percent">Percentage (%)</option>
                    <option value="number">Raw Number</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Goal / Target (Optional)
                  </label>
                  <input
                    type="number"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="e.g. 2000000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Create KPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
