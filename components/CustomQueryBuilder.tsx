'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, BarChart2, AreaChart as AreaIcon, LineChart as LineIcon, PieChart as PieIcon, RefreshCw, Layers, Table } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Dataset, DataRecord, formatValue } from '@/lib/bi-datasets';

interface CustomQueryBuilderProps {
  dataset: Dataset;
  filteredRecords: DataRecord[];
}

export function CustomQueryBuilder({ dataset, filteredRecords }: CustomQueryBuilderProps) {
  const metricCols = dataset.columns.filter((c) => c.isMetric || c.type === 'number');
  const dimensionCols = dataset.columns.filter((c) => c.isDimension || c.type === 'string' || c.type === 'date');

  const [yMetricKey, setYMetricKey] = useState<string>(metricCols[0]?.key || '');
  const [xDimensionKey, setXDimensionKey] = useState<string>(dimensionCols[0]?.key || '');
  const [aggregation, setAggregation] = useState<'sum' | 'avg' | 'max' | 'min' | 'count'>('sum');
  const [chartStyle, setChartStyle] = useState<'bar' | 'area' | 'line'>('bar');
  const [chartColor, setChartColor] = useState<string>('#6366f1'); // Indigo

  const activeYMeta = metricCols.find((c) => c.key === yMetricKey) || metricCols[0];
  const activeXMeta = dimensionCols.find((c) => c.key === xDimensionKey) || dimensionCols[0];

  // Group records by X dimension and compute aggregated Y values
  const groupedMap = new Map<string, { total: number; count: number; max: number; min: number }>();

  filteredRecords.forEach((record) => {
    const xVal = String(record[xDimensionKey] || 'Unassigned');
    const yVal = Number(record[yMetricKey]) || 0;

    const existing = groupedMap.get(xVal) || { total: 0, count: 0, max: -Infinity, min: Infinity };
    groupedMap.set(xVal, {
      total: existing.total + yVal,
      count: existing.count + 1,
      max: Math.max(existing.max, yVal),
      min: Math.min(existing.min, yVal),
    });
  });

  const queryResults = Array.from(groupedMap.entries()).map(([xLabel, stats]) => {
    let finalVal = stats.total;
    if (aggregation === 'avg') finalVal = stats.count > 0 ? stats.total / stats.count : 0;
    if (aggregation === 'max') finalVal = stats.max === -Infinity ? 0 : stats.max;
    if (aggregation === 'min') finalVal = stats.min === Infinity ? 0 : stats.min;
    if (aggregation === 'count') finalVal = stats.count;

    return {
      xLabel,
      yValue: Number(finalVal.toFixed(2)),
      count: stats.count,
    };
  }).sort((a, b) => a.xLabel.localeCompare(b.xLabel));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-8">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-200">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
          <SlidersHorizontal className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Visual Query & Chart Studio</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Construct custom multi-dimensional visual queries and aggregations
          </p>
        </div>
      </div>

      {/* Query Control Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
        {/* Metric Y-Axis */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Metric (Y-Axis)
          </label>
          <select
            value={yMetricKey}
            onChange={(e) => setYMetricKey(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600"
          >
            {metricCols.map((col) => (
              <option key={col.key} value={col.key}>
                {col.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dimension X-Axis */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Dimension (X-Axis)
          </label>
          <select
            value={xDimensionKey}
            onChange={(e) => setXDimensionKey(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600"
          >
            {dimensionCols.map((col) => (
              <option key={col.key} value={col.key}>
                {col.label}
              </option>
            ))}
          </select>
        </div>

        {/* Aggregation Function */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Aggregation
          </label>
          <select
            value={aggregation}
            onChange={(e) => setAggregation(e.target.value as any)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600"
          >
            <option value="sum">Sum (Total)</option>
            <option value="avg">Average (Mean)</option>
            <option value="max">Max Peak</option>
            <option value="min">Min Floor</option>
            <option value="count">Count Rows</option>
          </select>
        </div>

        {/* Chart Style */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Visual Type
          </label>
          <select
            value={chartStyle}
            onChange={(e) => setChartStyle(e.target.value as any)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600"
          >
            <option value="bar">Bar Chart</option>
            <option value="area">Area Chart</option>
            <option value="line">Line Chart</option>
          </select>
        </div>

        {/* Accent Color Palette */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Theme Palette
          </label>
          <div className="flex items-center space-x-2 pt-1">
            {[
              { color: '#4f46e5', name: 'Indigo' },
              { color: '#0284c7', name: 'Sky' },
              { color: '#059669', name: 'Emerald' },
              { color: '#d97706', name: 'Amber' },
              { color: '#db2777', name: 'Pink' },
            ].map((p) => (
              <button
                key={p.color}
                onClick={() => setChartColor(p.color)}
                className={`w-6 h-6 rounded-full border-2 transition ${
                  chartColor === p.color ? 'border-slate-900 scale-110 shadow-xs' : 'border-transparent opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: p.color }}
                title={p.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Live Chart Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 text-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Aggregated Chart Preview ({aggregation.toUpperCase()} of {activeYMeta?.label} by {activeXMeta?.label})
            </span>
            <span className="text-xs font-mono text-slate-400">{queryResults.length} Groups</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartStyle === 'bar' ? (
                <BarChart data={queryResults} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="xLabel" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => formatValue(val, activeYMeta?.format)}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [formatValue(Number(val), activeYMeta?.format), `${aggregation.toUpperCase()} (${activeYMeta?.label})`]}
                  />
                  <Bar dataKey="yValue" fill={chartColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : chartStyle === 'area' ? (
                <AreaChart data={queryResults} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="xLabel" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => formatValue(val, activeYMeta?.format)}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [formatValue(Number(val), activeYMeta?.format), `${aggregation.toUpperCase()} (${activeYMeta?.label})`]}
                  />
                  <Area type="monotone" dataKey="yValue" stroke={chartColor} strokeWidth={2.5} fill={chartColor} fillOpacity={0.25} />
                </AreaChart>
              ) : (
                <LineChart data={queryResults} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="xLabel" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => formatValue(val, activeYMeta?.format)}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [formatValue(Number(val), activeYMeta?.format), `${aggregation.toUpperCase()} (${activeYMeta?.label})`]}
                  />
                  <Line type="monotone" dataKey="yValue" stroke={chartColor} strokeWidth={2.5} dot={{ r: 3, fill: chartColor }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aggregated Data Matrix Table */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
              <span>Query Data Matrix</span>
              <Table className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg bg-white divide-y divide-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                  <tr>
                    <th className="p-2">{activeXMeta?.label}</th>
                    <th className="p-2 text-right">{aggregation.toUpperCase()} Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queryResults.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2 font-medium text-slate-800 truncate max-w-[120px]">{r.xLabel}</td>
                      <td className="p-2 text-right font-mono font-semibold text-slate-900">
                        {formatValue(r.yValue, activeYMeta?.format)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-500 italic text-center">
            Dynamically computed across {filteredRecords.length} records.
          </div>
        </div>
      </div>
    </div>
  );
}
