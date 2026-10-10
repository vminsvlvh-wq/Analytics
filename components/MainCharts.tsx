'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { DataRecord, Dataset, ColumnMeta, formatValue } from '@/lib/bi-datasets';
import { LineChart as LineIcon, BarChart2, AreaChart as AreaIcon, PieChart as PieIcon, Layers, Sliders } from 'lucide-react';

interface MainChartsProps {
  dataset: Dataset;
  filteredRecords: DataRecord[];
}

const COLOR_PALETTE = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#3b82f6', // Blue
];

export function MainCharts({ dataset, filteredRecords }: MainChartsProps) {
  const metricCols = dataset.columns.filter((c) => c.isMetric || c.type === 'number');
  const dimensionCols = dataset.columns.filter((c) => c.isDimension || c.type === 'string' || c.type === 'date');

  // Chart 1 States
  const [selectedYMetricKey, setSelectedYMetricKey] = useState<string>(metricCols[0]?.key || '');
  const [selectedXDimensionKey, setSelectedXDimensionKey] = useState<string>(dimensionCols[0]?.key || '');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');

  // Chart 2 States (Category Breakdown)
  const secondaryDimensionCol = dimensionCols.find((c) => c.key !== selectedXDimensionKey) || dimensionCols[0];
  const [pieDimensionKey, setPieDimensionKey] = useState<string>(secondaryDimensionCol?.key || dimensionCols[0]?.key || '');
  const [pieMetricKey, setPieMetricKey] = useState<string>(metricCols[0]?.key || '');

  const activeYMeta = metricCols.find((c) => c.key === selectedYMetricKey) || metricCols[0];
  const activeXMeta = dimensionCols.find((c) => c.key === selectedXDimensionKey) || dimensionCols[0];

  // Format chart data for Primary Trend Chart
  // If X dimension is date/time/month, sort chronologically
  const chartData = [...filteredRecords]
    .map((r) => ({
      xLabel: String(r[selectedXDimensionKey] || 'N/A'),
      yValue: Number(r[selectedYMetricKey]) || 0,
      originalRecord: r,
    }))
    .sort((a, b) => a.xLabel.localeCompare(b.xLabel));

  // Compute Pie/Category Grouping Data
  const pieGroupMap = new Map<string, number>();
  filteredRecords.forEach((r) => {
    const groupVal = String(r[pieDimensionKey] || 'Other');
    const metricVal = Number(r[pieMetricKey]) || 0;
    pieGroupMap.set(groupVal, (pieGroupMap.get(groupVal) || 0) + metricVal);
  });

  const pieData = Array.from(pieGroupMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  const pieTotal = pieData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Primary Trend Chart (Spans 2 columns) */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
        {/* Chart Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Primary Visual Analytics
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                {activeYMeta?.label} vs {activeXMeta?.label}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive timeline trend and performance profile
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Metric Selector Dropdown */}
            <select
              value={selectedYMetricKey}
              onChange={(e) => setSelectedYMetricKey(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 cursor-pointer"
            >
              {metricCols.map((c) => (
                <option key={c.key} value={c.key}>
                  Metric: {c.label}
                </option>
              ))}
            </select>

            {/* Dimension Selector */}
            <select
              value={selectedXDimensionKey}
              onChange={(e) => setSelectedXDimensionKey(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 cursor-pointer"
            >
              {dimensionCols.map((c) => (
                <option key={c.key} value={c.key}>
                  Axis: {c.label}
                </option>
              ))}
            </select>

            {/* Chart Type Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
              <button
                onClick={() => setChartType('area')}
                className={`p-1.5 rounded-md transition ${
                  chartType === 'area' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Area Chart"
              >
                <AreaIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`p-1.5 rounded-md transition ${
                  chartType === 'line' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Line Chart"
              >
                <LineIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-1.5 rounded-md transition ${
                  chartType === 'bar' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Bar Chart"
              >
                <BarChart2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Canvas */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
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
                  formatter={(val: any) => [formatValue(Number(val), activeYMeta?.format), activeYMeta?.label]}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="yValue" name={activeYMeta?.label} stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#primaryGradient)" />
              </AreaChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  formatter={(val: any) => [formatValue(Number(val), activeYMeta?.format), activeYMeta?.label]}
                />
                <Line type="monotone" dataKey="yValue" name={activeYMeta?.label} stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3, fill: '#4f46e5' }} />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  formatter={(val: any) => [formatValue(Number(val), activeYMeta?.format), activeYMeta?.label]}
                />
                <Bar dataKey="yValue" name={activeYMeta?.label} fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Distribution / Categorical Chart (1 column) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Distribution Share
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Categorical metric allocation</p>
            </div>

            <select
              value={pieDimensionKey}
              onChange={(e) => setPieDimensionKey(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-md px-2 py-1 focus:outline-hidden"
            >
              {dimensionCols.map((c) => (
                <option key={c.key} value={c.key}>
                  By {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Donut Chart */}
          <div className="h-52 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [formatValue(Number(val), activeYMeta?.format), 'Total']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400 italic">No distribution data</div>
            )}
          </div>
        </div>

        {/* Legend list with percentage share */}
        <div className="mt-4 pt-3 border-t border-slate-100 max-h-36 overflow-y-auto space-y-1.5 pr-1">
          {pieData.map((item, idx) => {
            const pct = pieTotal > 0 ? ((item.value / pieTotal) * 100).toFixed(1) : '0';
            return (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: COLOR_PALETTE[idx % COLOR_PALETTE.length] }}
                  />
                  <span className="font-medium text-slate-700 truncate">{item.name}</span>
                </div>
                <div className="text-right font-mono text-slate-600">
                  <span>{formatValue(item.value, activeYMeta?.format)}</span>
                  <span className="ml-1 text-slate-400 text-[10px]">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
