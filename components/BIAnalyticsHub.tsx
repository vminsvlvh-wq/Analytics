'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Database,
  Layers,
  TrendingUp,
  Palette,
  Target,
  Calculator,
  Code2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Filter,
  LineChart,
  Table,
  Zap,
  Play,
  Check,
  ChevronRight,
  Sliders,
  AlertCircle,
  BarChart2,
  PieChart
} from 'lucide-react';
import { Dataset, formatValue } from '@/lib/bi-datasets';

interface BIAnalyticsHubProps {
  dataset: Dataset;
}

type PillarId = 'excel' | 'sql' | 'powerbi' | 'stats' | 'ux' | 'bi-strategy';

interface PillarConfig {
  id: PillarId;
  title: string;
  focus: string;
  benefit: string;
  icon: React.ReactNode;
  badge: string;
}

const PILLARS: PillarConfig[] = [
  {
    id: 'excel',
    title: 'Excel & Data Prep',
    focus: 'Data cleaning, formulas (VLOOKUP, XLOOKUP), pivot tables',
    benefit: 'Prepare clean data & structure raw inputs',
    icon: <FileSpreadsheet className="w-5 h-5 text-emerald-600" />,
    badge: 'Foundation',
  },
  {
    id: 'sql',
    title: 'SQL & Database Lab',
    focus: 'Queries, joins, primary/foreign keys, Access DB',
    benefit: 'Understand structure & query relational models',
    icon: <Database className="w-5 h-5 text-indigo-600" />,
    badge: 'Queries & Joins',
  },
  {
    id: 'powerbi',
    title: 'Power BI & DAX Modeling',
    focus: 'Modeling, star schema, DAX measures (CALCULATE, SUMX)',
    benefit: 'Correct data models & high-impact reporting',
    icon: <Layers className="w-5 h-5 text-amber-600" />,
    badge: 'Measures & Models',
  },
  {
    id: 'stats',
    title: 'Statistical Studio',
    focus: 'Trends, averages, moving averages, standard deviation',
    benefit: 'Extract statistical insights & confidence',
    icon: <TrendingUp className="w-5 h-5 text-sky-600" />,
    badge: 'Advanced Analysis',
  },
  {
    id: 'ux',
    title: 'Dashboard UX & Design',
    focus: 'UX visual hierarchy, color contrast, board aesthetics',
    benefit: 'High-contrast reporting & executive adoption',
    icon: <Palette className="w-5 h-5 text-pink-600" />,
    badge: 'UX & Visuals',
  },
  {
    id: 'bi-strategy',
    title: 'Executive BI & Strategy',
    focus: 'KPIs, metric trees, decision support matrix, interpretation',
    benefit: 'Drive better business decisions & ROI',
    icon: <Target className="w-5 h-5 text-purple-600" />,
    badge: 'Business Value',
  },
];

export function BIAnalyticsHub({ dataset }: BIAnalyticsHubProps) {
  const [activePillar, setActivePillar] = useState<PillarId>('excel');

  // Excel State
  const [excelFormula, setExcelFormula] = useState('XLOOKUP(lookup_val, return_arr)');
  const [selectedExcelTool, setSelectedExcelTool] = useState<'clean' | 'formula' | 'pivot'>('clean');
  const [pivotRowKey, setPivotRowKey] = useState<string>(
    dataset.columns.find((c) => c.isDimension)?.key || dataset.columns[0]?.key || ''
  );
  const [pivotMetricKey, setPivotMetricKey] = useState<string>(
    dataset.columns.find((c) => c.isMetric)?.key || dataset.columns[1]?.key || ''
  );

  // SQL State
  const [sqlQuery, setSqlQuery] = useState(
    `SELECT ${dataset.columns[0]?.key || 'id'}, SUM(${dataset.columns.find((c) => c.isMetric)?.key || 'value'}) AS Total\nFROM ${dataset.id.replace(/-/g, '_')}\nGROUP BY ${dataset.columns[0]?.key || 'id'}\nORDER BY Total DESC;`
  );
  const [sqlQueryResult, setSqlQueryResult] = useState<any[] | null>(null);

  // DAX State
  const [daxMeasureName, setDaxMeasureName] = useState('Total YoY Growth %');
  const [daxFormula, setDaxFormula] = useState(
    `VAR CurrentVal = SUM('${dataset.name}'[${dataset.columns.find((c) => c.isMetric)?.key || 'mrr'}])\nVAR PriorVal = CALCULATE(SUM('${dataset.name}'[${dataset.columns.find((c) => c.isMetric)?.key || 'mrr'}]), SAMEPERIODLASTYEAR('Calendar'[Date]))\nRETURN\n  DIVIDE(CurrentVal - PriorVal, PriorVal, 0)`
  );
  const [evaluatedDax, setEvaluatedDax] = useState<string | null>(null);

  // Stats State
  const [selectedMetricForStats, setSelectedMetricForStats] = useState<string>(
    dataset.columns.find((c) => c.isMetric)?.key || dataset.columns[1]?.key || ''
  );

  // Scenario / Decision State
  const [churnImprovement, setChurnImprovement] = useState(10); // 10% improvement
  const [priceAdjustment, setPriceAdjustment] = useState(5); // 5% price increase

  // Execute SQL simulation
  const handleRunSQL = () => {
    const metricCol = dataset.columns.find((c) => c.isMetric)?.key || dataset.columns[1]?.key;
    const dimCol = dataset.columns.find((c) => c.isDimension)?.key || dataset.columns[0]?.key;

    if (!metricCol || !dimCol) return;

    // Aggregate by dimCol
    const map: Record<string, number> = {};
    dataset.records.forEach((r) => {
      const dimVal = String(r[dimCol] || 'Unknown');
      const numVal = Number(r[metricCol]) || 0;
      map[dimVal] = (map[dimVal] || 0) + numVal;
    });

    const rows = Object.entries(map).map(([dimension, total]) => ({
      [dimCol]: dimension,
      [`SUM_${metricCol}`]: total,
    }));

    setSqlQueryResult(rows);
  };

  // Evaluate DAX simulation
  const handleEvaluateDax = () => {
    const metricCol = dataset.columns.find((c) => c.isMetric)?.key || 'value';
    const vals = dataset.records.map((r) => Number(r[metricCol]) || 0);
    const sum = vals.reduce((a, b) => a + b, 0);
    const avg = vals.length ? sum / vals.length : 0;
    setEvaluatedDax(`Evaluated Measure Output: ${formatValue(avg * 1.14, 'percent')} (Simulated YoY Growth)`);
  };

  // Statistics calculation
  const numericValues = dataset.records
    .map((r) => Number(r[selectedMetricForStats]))
    .filter((v) => !isNaN(v));

  const statsCount = numericValues.length;
  const statsSum = numericValues.reduce((a, b) => a + b, 0);
  const statsMean = statsCount ? statsSum / statsCount : 0;
  const sortedValues = [...numericValues].sort((a, b) => a - b);
  const statsMedian = statsCount
    ? statsCount % 2 === 0
      ? (sortedValues[statsCount / 2 - 1] + sortedValues[statsCount / 2]) / 2
      : sortedValues[Math.floor(statsCount / 2)]
    : 0;
  const statsMin = sortedValues[0] || 0;
  const statsMax = sortedValues[statsCount - 1] || 0;

  // Standard deviation calculation
  const variance = statsCount
    ? numericValues.reduce((acc, val) => acc + Math.pow(val - statsMean, 2), 0) / statsCount
    : 0;
  const stdDev = Math.sqrt(variance);

  // Pivot Table calculation
  const pivotMap: Record<string, { count: number; sum: number; avg: number }> = {};
  dataset.records.forEach((r) => {
    const rKey = String(r[pivotRowKey] || 'N/A');
    const mVal = Number(r[pivotMetricKey]) || 0;

    if (!pivotMap[rKey]) {
      pivotMap[rKey] = { count: 0, sum: 0, avg: 0 };
    }
    pivotMap[rKey].count += 1;
    pivotMap[rKey].sum += mVal;
    pivotMap[rKey].avg = pivotMap[rKey].sum / pivotMap[rKey].count;
  });

  // Decision Simulator calculation
  const baseRevenue = dataset.records.reduce((acc, r) => {
    const mKey = dataset.columns.find((c) => c.isMetric)?.key || '';
    return acc + (Number(r[mKey]) || 0);
  }, 0);

  const projectedImpact = baseRevenue * (1 + churnImprovement / 100 + priceAdjustment / 100);
  const netGain = projectedImpact - baseRevenue;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                Core Skill Framework
              </span>
              <span className="text-xs text-slate-400">Mastery Workbench</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              Business Intelligence & Analytics Studio
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              From data preparation in Excel and SQL querying to DAX modeling, statistical inference,
              dashboard UX design, and executive decision support.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              Dataset: {dataset.name}
            </span>
          </div>
        </div>

        {/* Pillar Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          {PILLARS.map((pillar) => {
            const isActive = activePillar === pillar.id;
            return (
              <button
                key={pillar.id}
                onClick={() => setActivePillar(pillar.id)}
                className={`p-3 rounded-lg text-left transition border flex flex-col justify-between ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`p-1 rounded-md ${isActive ? 'bg-slate-800' : 'bg-white shadow-2xs'}`}>
                      {pillar.icon}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {pillar.badge}
                    </span>
                  </div>
                  <div className={`text-xs font-bold leading-snug ${isActive ? 'text-white' : 'text-slate-900'}`}>
                    {pillar.title}
                  </div>
                </div>
                <div className={`text-[10px] mt-2 line-clamp-1 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                  {pillar.benefit}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PILLAR 1: EXCEL HUB */}
      {activePillar === 'excel' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Excel Data Preparation & Formulas Studio
              </h2>
              <p className="text-xs text-slate-500">
                Focus: Data cleaning, lookup formulas (VLOOKUP, XLOOKUP, INDEX-MATCH), and Pivot Tables.
              </p>
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
              <button
                onClick={() => setSelectedExcelTool('clean')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  selectedExcelTool === 'clean' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Data Cleaning
              </button>
              <button
                onClick={() => setSelectedExcelTool('formula')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  selectedExcelTool === 'formula' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Formulas & Lookups
              </button>
              <button
                onClick={() => setSelectedExcelTool('pivot')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  selectedExcelTool === 'pivot' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Pivot Table
              </button>
            </div>
          </div>

          {selectedExcelTool === 'clean' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Text Standardization (TRIM / PROPER)
                </div>
                <p className="text-xs text-slate-600">
                  Strips trailing whitespace and standardizes header formatting for join accuracy.
                </p>
                <div className="text-[11px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700">
                  =PROPER(TRIM(A2))
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Null Value Imputation (IFERROR)
                </div>
                <p className="text-xs text-slate-600">
                  Replaces blank record fields with calculated defaults or standard missing markers.
                </p>
                <div className="text-[11px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700">
                  =IFERROR(VLOOKUP(...), 0)
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Duplicate Elimination (COUNTIFS)
                </div>
                <p className="text-xs text-slate-600">
                  Flags duplicate key entries before database loading or reporting visual generation.
                </p>
                <div className="text-[11px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700">
                  =IF(COUNTIFS(A:A, A2)&gt;1, &quot;Duplicate&quot;, &quot;Unique&quot;)
                </div>
              </div>
            </div>
          )}

          {selectedExcelTool === 'formula' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-900">Preset Formula Evaluator</div>
                  <div className="space-y-2">
                    {[
                      { name: 'XLOOKUP (Modern Match)', formula: `=XLOOKUP(ID_Key, Dataset[ID], Dataset[Metric], 0)` },
                      { name: 'INDEX-MATCH (2D Matrix)', formula: `=INDEX(DataRange, MATCH(RowVal, RowKeys, 0), MATCH(ColVal, ColKeys, 0))` },
                      { name: 'SUMIFS (Multi-Criteria)', formula: `=SUMIFS(Dataset[Revenue], Dataset[Region], "North America", Dataset[Status], "Active")` },
                    ].map((f, i) => (
                      <button
                        key={i}
                        onClick={() => setExcelFormula(f.formula)}
                        className="w-full text-left p-2 bg-white hover:bg-slate-100 rounded border border-slate-200 transition text-xs font-medium text-slate-800"
                      >
                        <div className="font-bold text-slate-900">{f.name}</div>
                        <div className="font-mono text-[11px] text-emerald-700 mt-0.5">{f.formula}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-lg border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-emerald-400">Formula Syntax Sandbox</div>
                  <textarea
                    value={excelFormula}
                    onChange={(e) => setExcelFormula(e.target.value)}
                    rows={4}
                    className="w-full font-mono text-xs bg-slate-950 border border-slate-700 rounded p-2 text-emerald-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                  <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="font-bold text-white">Benefit:</span> Ensures zero formula errors when extracting clean values for dashboard visualization.
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedExcelTool === 'pivot' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-3 rounded-md border border-slate-200 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-700">Row Dimension:</span>
                  <select
                    value={pivotRowKey}
                    onChange={(e) => setPivotRowKey(e.target.value)}
                    className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-semibold"
                  >
                    {dataset.columns.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-700">Summarized Metric:</span>
                  <select
                    value={pivotMetricKey}
                    onChange={(e) => setPivotMetricKey(e.target.value)}
                    className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-semibold"
                  >
                    {dataset.columns.filter((c) => c.isMetric).map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pivot Output Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-2 border-b border-slate-200">{pivotRowKey} (Row Labels)</th>
                      <th className="px-4 py-2 border-b border-slate-200 text-right">Count of Records</th>
                      <th className="px-4 py-2 border-b border-slate-200 text-right">Sum of {pivotMetricKey}</th>
                      <th className="px-4 py-2 border-b border-slate-200 text-right">Average of {pivotMetricKey}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                    {Object.entries(pivotMap).map(([label, res]) => (
                      <tr key={label} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-bold text-slate-900">{label}</td>
                        <td className="px-4 py-2 text-right">{res.count}</td>
                        <td className="px-4 py-2 text-right text-emerald-700 font-semibold">
                          {formatValue(res.sum, 'number')}
                        </td>
                        <td className="px-4 py-2 text-right text-slate-600">
                          {formatValue(res.avg, 'number')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PILLAR 2: SQL DATABASE LAB */}
      {activePillar === 'sql' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                Relational SQL Engine & Schema Modeling
              </h2>
              <p className="text-xs text-slate-500">
                Focus: SQL Queries, Table Joins, Primary/Foreign Keys, and Access DB relational structures.
              </p>
            </div>

            <button
              onClick={handleRunSQL}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-xs transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute Query</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SQL Editor */}
            <div className="lg:col-span-2 space-y-3">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Interactive SQL Query Console</span>
                <span className="text-[10px] font-mono text-slate-400">Dialect: Standard ANSI SQL</span>
              </div>

              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={6}
                className="w-full font-mono text-xs bg-slate-950 text-indigo-300 p-3 rounded-lg border border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />

              {/* Query Result Grid */}
              {sqlQueryResult && (
                <div className="border border-slate-200 rounded-lg overflow-hidden animate-in fade-in duration-200">
                  <div className="bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                    Query Execution Output ({sqlQueryResult.length} Rows Returned)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          {Object.keys(sqlQueryResult[0] || {}).map((k) => (
                            <th key={k} className="px-3 py-2 border-b border-slate-200">
                              {k}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {sqlQueryResult.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            {Object.values(r).map((val: any, j) => (
                              <td key={j} className="px-3 py-2 text-slate-800">
                                {typeof val === 'number' ? formatValue(val, 'number') : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Relational Schema Visualizer */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-600" />
                Relational Keys & Schema Architecture
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>tbl_fact_metrics</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono">FACT</span>
                  </div>
                  <ul className="text-[11px] font-mono text-slate-600 space-y-0.5">
                    <li className="text-indigo-600 font-bold">id (PK)</li>
                    {dataset.columns.slice(0, 4).map((c) => (
                      <li key={c.key}>{c.key} {c.isMetric ? '(DECIMAL)' : '(VARCHAR)'}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                </div>

                <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>tbl_dim_lookup</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono">DIMENSION</span>
                  </div>
                  <ul className="text-[11px] font-mono text-slate-600 space-y-0.5">
                    <li className="text-emerald-600 font-bold">dimension_key (PK)</li>
                    <li>category_name (VARCHAR)</li>
                    <li>region_code (FK)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 3: POWER BI & DAX MODELING */}
      {activePillar === 'powerbi' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                Power BI Data Modeling & DAX Engine
              </h2>
              <p className="text-xs text-slate-500">
                Focus: Star Schema Cardinality (1:*), Measures vs Columns, CALCULATE(), and Time Intelligence.
              </p>
            </div>

            <button
              onClick={handleEvaluateDax}
              className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-md shadow-xs transition"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Evaluate Measure</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* DAX Code Console */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Measure Name</label>
                <span className="text-[10px] bg-amber-50 text-amber-700 font-mono px-2 py-0.5 rounded border border-amber-200">
                  Explicit DAX Measure
                </span>
              </div>
              <input
                type="text"
                value={daxMeasureName}
                onChange={(e) => setDaxMeasureName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold text-slate-900"
              />

              <div className="text-xs font-bold text-slate-700 mt-2">DAX Expression</div>
              <textarea
                value={daxFormula}
                onChange={(e) => setDaxFormula(e.target.value)}
                rows={7}
                className="w-full font-mono text-xs bg-slate-950 text-amber-300 p-3 rounded-lg border border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />

              {evaluatedDax && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs font-bold text-amber-900 animate-in fade-in duration-200">
                  {evaluatedDax}
                </div>
              )}
            </div>

            {/* Modeling Principles */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 text-xs">
              <div className="font-bold text-slate-900">Power BI Best Practice Rules</div>
              <ul className="space-y-2 text-slate-700">
                <li className="p-2 bg-white rounded border border-slate-200">
                  <span className="font-bold text-amber-700">Star Schema:</span> Keep Fact tables thin with numeric metrics and link to Dimension tables with 1-to-many (1:*) relationship.
                </li>
                <li className="p-2 bg-white rounded border border-slate-200">
                  <span className="font-bold text-amber-700">Calculated Measures:</span> Prefer explicit DAX measures over implicit aggregations to ensure filter context accuracy.
                </li>
                <li className="p-2 bg-white rounded border border-slate-200">
                  <span className="font-bold text-amber-700">CALCULATE():</span> Modifies filter context dynamically (e.g. `CALCULATE(SUM(Sales), ALL(Date))`).
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 4: STATISTICAL STUDIO */}
      {activePillar === 'stats' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                Statistical Inference & Trend Analytics
              </h2>
              <p className="text-xs text-slate-500">
                Focus: Averages (Mean/Median), Standard Deviation, Variance, Skewness, and Trend Distributions.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700">Target Metric:</span>
              <select
                value={selectedMetricForStats}
                onChange={(e) => setSelectedMetricForStats(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1 text-xs font-bold text-slate-800"
              >
                {dataset.columns.filter((c) => c.isMetric).map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Key Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-sky-50/50 border border-sky-100 rounded-lg">
              <div className="text-[10px] font-bold uppercase text-sky-700">Mean (Average)</div>
              <div className="text-lg font-extrabold text-slate-900 mt-1 font-mono">
                {formatValue(statsMean, 'number')}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Central tendency sum/count</div>
            </div>

            <div className="p-4 bg-sky-50/50 border border-sky-100 rounded-lg">
              <div className="text-[10px] font-bold uppercase text-sky-700">Median (50th %ile)</div>
              <div className="text-lg font-extrabold text-slate-900 mt-1 font-mono">
                {formatValue(statsMedian, 'number')}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Outlier-resistant midpoint</div>
            </div>

            <div className="p-4 bg-sky-50/50 border border-sky-100 rounded-lg">
              <div className="text-[10px] font-bold uppercase text-sky-700">Standard Deviation (σ)</div>
              <div className="text-lg font-extrabold text-slate-900 mt-1 font-mono">
                {formatValue(stdDev, 'number')}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Dispersion around mean</div>
            </div>

            <div className="p-4 bg-sky-50/50 border border-sky-100 rounded-lg">
              <div className="text-[10px] font-bold uppercase text-sky-700">Range (Min - Max)</div>
              <div className="text-base font-extrabold text-slate-900 mt-1 font-mono">
                {formatValue(statsMin, 'number')} – {formatValue(statsMax, 'number')}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Full spread boundary</div>
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 5: DASHBOARD UX & DESIGN */}
      {activePillar === 'ux' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-pink-600" />
              Dashboard Visual Hierarchy & Color UX
            </h2>
            <p className="text-xs text-slate-500">
              Focus: High-contrast palettes, WCAG compliance, spacing rhythm, and eliminating AI visual clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900">1. Mathematical Spacing & Padding</div>
              <p className="text-xs text-slate-600">
                Container outer padding MUST equal or exceed inner element padding. Inner corner radius is calculated as:
              </p>
              <div className="text-[11px] font-mono bg-white p-2 rounded border border-slate-200 text-indigo-700">
                Inner Radius = Outer Radius - Padding
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900">2. Color Contrast Ratios (WCAG AA)</div>
              <p className="text-xs text-slate-600">
                Always ensure a minimum 4.5:1 contrast ratio between chart text and canvas backgrounds for accessibility.
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <span className="px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded">Pass 7.1:1 AAA</span>
                <span className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded">Pass 4.8:1 AA</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900">3. Label Wrapping & Alignment</div>
              <p className="text-xs text-slate-600">
                Control text inside buttons and chart legends sits on ONE line. Never allow orphaned line wraps.
              </p>
              <div className="text-[11px] font-mono bg-white p-2 rounded border border-slate-200 text-emerald-700">
                white-space: nowrap
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 6: EXECUTIVE BI & STRATEGY */}
      {activePillar === 'bi-strategy' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" />
              Executive BI & Decision Support Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Focus: Translating raw data metrics into strategic ROI and board-level decision support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scenario Simulator */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-purple-600" />
                Strategic Scenario Simulator
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Customer Churn Reduction Target</span>
                    <span className="font-bold text-purple-700">-{churnImprovement}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={churnImprovement}
                    onChange={(e) => setChurnImprovement(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Pricing Optimization (AOV Gain)</span>
                    <span className="font-bold text-purple-700">+{priceAdjustment}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={priceAdjustment}
                    onChange={(e) => setPriceAdjustment(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
                <div className="text-[10px] font-bold uppercase text-slate-400">Projected Annual ROI Net Gain</div>
                <div className="text-xl font-extrabold text-purple-900 font-mono">
                  +{formatValue(netGain, 'currency')}
                </div>
                <div className="text-xs text-slate-500">
                  Total Projected Base: {formatValue(projectedImpact, 'currency')}
                </div>
              </div>
            </div>

            {/* Strategic Value Driver Tree */}
            <div className="p-5 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-4">
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                Executive Metric Tree Architecture
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">1. Revenue Expansion</div>
                    <div className="text-[11px] text-slate-400">ARR Growth & Market Share</div>
                  </div>
                  <span className="text-emerald-400 font-bold font-mono">+18.4%</span>
                </div>

                <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">2. Unit Economics Health</div>
                    <div className="text-[11px] text-slate-400">LTV / CAC Payback Ratio</div>
                  </div>
                  <span className="text-indigo-400 font-bold font-mono">4.2x</span>
                </div>

                <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">3. Operational Velocity</div>
                    <div className="text-[11px] text-slate-400">Fulfillment SLA On-Time %</div>
                  </div>
                  <span className="text-amber-400 font-bold font-mono">98.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
