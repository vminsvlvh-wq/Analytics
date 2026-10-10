'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  HelpCircle,
  Lightbulb,
  FileSpreadsheet,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Dataset, DataRecord } from '@/lib/bi-datasets';

interface AIAnalystPanelProps {
  dataset: Dataset;
  filteredRecords: DataRecord[];
}

interface AIInsightResult {
  headline: string;
  executiveSummary: string;
  keyFindings: {
    title: string;
    description: string;
    impact: 'positive' | 'neutral' | 'negative';
  }[];
  anomalies: string[];
  recommendations: string[];
  suggestedQuestions: string[];
}

const PRESET_QUESTIONS = [
  'Identify primary revenue growth drivers and churn risks.',
  'Find statistical anomalies or outliers in recent performance.',
  'Draft 3 strategic recommendations for executive leadership.',
  'What is the forecast trajectory if customer retention improves by 10%?',
];

export function AIAnalystPanel({ dataset, filteredRecords }: AIAnalystPanelProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIInsightResult | null>(null);

  const fetchInsights = async (userPrompt?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetName: dataset.name,
          datasetDescription: dataset.description,
          columns: dataset.columns,
          recordsSample: filteredRecords.slice(0, 15),
          userQuery: userPrompt || query || 'Provide an executive summary and strategic data findings.',
          mode: 'insights',
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to generate AI insights');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to AI server route');
    } finally {
      setLoading(false);
    }
  };

  // Initial auto-fetch when dataset or panel mounts
  useEffect(() => {
    let isMounted = true;
    const loadInitialInsights = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/ai-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            datasetName: dataset.name,
            datasetDescription: dataset.description,
            columns: dataset.columns,
            recordsSample: filteredRecords.slice(0, 15),
            userQuery: 'Provide an executive summary and strategic data findings.',
            mode: 'insights',
          }),
        });

        if (!response.ok) {
          const errJson = await response.json();
          throw new Error(errJson.error || 'Failed to generate AI insights');
        }

        const data = await response.json();
        if (isMounted) setResult(data);
      } catch (err: any) {
        if (isMounted) setError(err?.message || 'Failed to connect to AI server route');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialInsights();

    return () => {
      isMounted = false;
    };
  }, [dataset.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    fetchInsights(query);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-slate-800 mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Gemini AI Data Analyst
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                Gemini 3.6 Flash
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Natural language business intelligence synthesis & predictive scenario analysis
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchInsights()}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-md text-xs font-semibold shadow-xs transition"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Dataset...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Re-Analyze Dataset</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Suggestion Chips */}
      <div className="mb-6">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Executive Query Prompts</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(q);
                fetchInsights(q);
              }}
              disabled={loading}
              className="text-xs px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md transition text-left"
            >
              &quot;{q}&quot;
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a specific question (e.g. 'Why did churn spike in Q2?', 'What is our top performing region?')"
          className="w-full pl-4 pr-12 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-md flex items-center justify-center transition"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Loading Skeleton */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-slate-50 rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">
            Synthesizing statistical metrics and generating board-level insights...
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* AI Insights Results Output */}
      {result && !loading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Key Headline Banner */}
          <div className="p-5 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Executive Headline Takeaway
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              &quot;{result.headline}&quot;
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {result.executiveSummary}
            </p>
          </div>

          {/* Key Findings Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Strategic Key Findings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.keyFindings?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        item.impact === 'positive'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.impact === 'negative'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.impact}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Anomalies & Strategic Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Anomalies */}
            {result.anomalies && result.anomalies.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 text-xs">
                <h4 className="font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Detected Data Anomalies
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-amber-800 leading-relaxed">
                  {result.anomalies.map((anom, idx) => (
                    <li key={idx}>{anom}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 text-xs">
                <h4 className="font-bold text-indigo-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  Executive Recommendations
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-indigo-900 leading-relaxed">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Suggested Follow-up Questions */}
          {result.suggestedQuestions && result.suggestedQuestions.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400 mb-2">
                Suggested Follow-up Analytics Questions:
              </div>
              <div className="flex flex-wrap gap-2">
                {result.suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(q);
                      fetchInsights(q);
                    }}
                    className="text-xs px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 flex items-center space-x-1 transition"
                  >
                    <span>&quot;{q}&quot;</span>
                    <ArrowRight className="w-3 h-3 text-indigo-600" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
