'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { GlobalFilters } from '@/components/GlobalFilters';
import { KPIGrid } from '@/components/KPIGrid';
import { MainCharts } from '@/components/MainCharts';
import { AIAnalystPanel } from '@/components/AIAnalystPanel';
import { CustomQueryBuilder } from '@/components/CustomQueryBuilder';
import { DatasetExplorer } from '@/components/DatasetExplorer';
import { BIAnalyticsHub } from '@/components/BIAnalyticsHub';
import { ExecutiveReportModal } from '@/components/ExecutiveReportModal';
import { SAMPLE_DATASETS, Dataset, DataRecord } from '@/lib/bi-datasets';

export default function BIPage() {
  const [datasetsList, setDatasetsList] = useState<Dataset[]>(SAMPLE_DATASETS);
  const [selectedDataset, setSelectedDataset] = useState<Dataset>(SAMPLE_DATASETS[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai-analyst' | 'builder' | 'explorer' | 'toolkit'>('dashboard');

  // Active records copy (for live editing/adding/deleting)
  const [currentRecords, setCurrentRecords] = useState<DataRecord[]>(selectedDataset.records);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDimensionKey, setSelectedDimensionKey] = useState<string>(
    selectedDataset.columns.find((c) => c.isDimension)?.key || selectedDataset.columns[0]?.key || ''
  );
  const [selectedDimensionValue, setSelectedDimensionValue] = useState<string>('ALL');

  // Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Switch Dataset
  const handleSelectDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setCurrentRecords(dataset.records);
    setSearchTerm('');
    setSelectedDimensionValue('ALL');
    const firstDim = dataset.columns.find((c) => c.isDimension)?.key || dataset.columns[0]?.key || '';
    setSelectedDimensionKey(firstDim);
  };

  // Upload Custom CSV
  const handleUploadCustomCSV = (newDataset: Dataset) => {
    setDatasetsList((prev) => [newDataset, ...prev]);
    setSelectedDataset(newDataset);
    setCurrentRecords(newDataset.records);
    setSearchTerm('');
    setSelectedDimensionValue('ALL');
    const firstDim = newDataset.columns.find((c) => c.isDimension)?.key || newDataset.columns[0]?.key || '';
    setSelectedDimensionKey(firstDim);
    setActiveTab('dashboard');
  };

  // Filtered Records calculation
  const filteredRecords = currentRecords.filter((record) => {
    // 1. Search term check
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matches = Object.values(record).some((val) =>
        String(val).toLowerCase().includes(query)
      );
      if (!matches) return false;
    }

    // 2. Dimension filter check
    if (selectedDimensionValue !== 'ALL' && selectedDimensionKey) {
      const recordVal = String(record[selectedDimensionKey] || '');
      if (recordVal !== selectedDimensionValue) return false;
    }

    return true;
  });

  // KPI addition
  const handleAddCustomKPI = (newKPI: {
    title: string;
    metricKey: string;
    aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min';
    format: 'currency' | 'percent' | 'number';
    target?: number;
  }) => {
    const updatedDataset = {
      ...selectedDataset,
      kpis: [...selectedDataset.kpis, newKPI],
    };
    setSelectedDataset(updatedDataset);
    setDatasetsList((prev) => prev.map((d) => (d.id === updatedDataset.id ? updatedDataset : d)));
  };

  // Record CRUD
  const handleUpdateRecord = (updatedRecord: DataRecord) => {
    setCurrentRecords((prev) => prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)));
  };

  const handleDeleteRecord = (id: string) => {
    setCurrentRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddRecord = (newRecord: DataRecord) => {
    setCurrentRecords((prev) => [newRecord, ...prev]);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!filteredRecords.length) return;

    const headers = selectedDataset.columns.map((c) => c.key);
    const csvRows = [
      headers.join(','),
      ...filteredRecords.map((r) =>
        headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedDataset.id}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDimensionValue('ALL');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased flex flex-col">
      {/* Top Navbar */}
      <Navbar
        datasets={datasetsList}
        selectedDataset={selectedDataset}
        onSelectDataset={handleSelectDataset}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReport={() => setIsReportOpen(true)}
        onExportCSV={handleExportCSV}
        onResetFilters={handleResetFilters}
      />

      {/* Global Filter Bar */}
      <GlobalFilters
        dataset={selectedDataset}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedDimensionValue={selectedDimensionValue}
        setSelectedDimensionValue={setSelectedDimensionValue}
        selectedDimensionKey={selectedDimensionKey}
        setSelectedDimensionKey={setSelectedDimensionKey}
        filteredCount={filteredRecords.length}
        totalCount={currentRecords.length}
        onClearFilters={handleResetFilters}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab 1: Executive Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* KPI Cards Grid */}
            <KPIGrid
              dataset={selectedDataset}
              filteredRecords={filteredRecords}
              onAddCustomKPI={handleAddCustomKPI}
            />

            {/* Primary Interactive Charts */}
            <MainCharts dataset={selectedDataset} filteredRecords={filteredRecords} />

            {/* Inline AI Insight Quick Banner */}
            <AIAnalystPanel dataset={selectedDataset} filteredRecords={filteredRecords} />
          </div>
        )}

        {/* Tab 2: AI Analyst Full View */}
        {activeTab === 'ai-analyst' && (
          <div className="animate-in fade-in duration-200">
            <AIAnalystPanel dataset={selectedDataset} filteredRecords={filteredRecords} />
          </div>
        )}

        {/* Tab 3: Visual Query Builder */}
        {activeTab === 'builder' && (
          <div className="animate-in fade-in duration-200">
            <CustomQueryBuilder dataset={selectedDataset} filteredRecords={filteredRecords} />
          </div>
        )}

        {/* Tab 4: Dataset Explorer & Grid */}
        {activeTab === 'explorer' && (
          <div className="animate-in fade-in duration-200">
            <DatasetExplorer
              dataset={selectedDataset}
              records={filteredRecords}
              onUploadCustomCSV={handleUploadCustomCSV}
              onUpdateRecord={handleUpdateRecord}
              onDeleteRecord={handleDeleteRecord}
              onAddRecord={handleAddRecord}
              onExportCSV={handleExportCSV}
            />
          </div>
        )}

        {/* Tab 5: BI Analytics Mastery Studio */}
        {activeTab === 'toolkit' && (
          <div className="animate-in fade-in duration-200">
            <BIAnalyticsHub dataset={selectedDataset} />
          </div>
        )}
      </main>

      {/* Executive Briefing Report Modal */}
      <ExecutiveReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        dataset={selectedDataset}
        filteredRecords={filteredRecords}
        onExportCSV={handleExportCSV}
      />
    </div>
  );
}
