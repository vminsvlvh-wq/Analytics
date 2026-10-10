export interface DataRecord {
  id: string;
  [key: string]: string | number | boolean;
}

export interface ColumnMeta {
  key: string;
  label: string;
  type: 'number' | 'string' | 'date' | 'boolean';
  isMetric?: boolean;
  isDimension?: boolean;
  format?: 'currency' | 'percent' | 'number' | 'date' | 'raw';
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  category: string;
  columns: ColumnMeta[];
  records: DataRecord[];
  kpis: {
    title: string;
    metricKey: string;
    aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min';
    format: 'currency' | 'percent' | 'number';
    target?: number;
    prefix?: string;
    suffix?: string;
    description?: string;
  }[];
}

export const SAMPLE_DATASETS: Dataset[] = [
  {
    id: 'saas-metrics',
    name: 'SaaS Revenue & Customer Health',
    description: 'Enterprise ARR, MRR, churn rate, customer acquisition costs, and segment performance over 12 months.',
    category: 'Finance & Subscriptions',
    columns: [
      { key: 'month', label: 'Month', type: 'date', isDimension: true, format: 'date' },
      { key: 'mrr', label: 'MRR ($)', type: 'number', isMetric: true, format: 'currency' },
      { key: 'arr', label: 'ARR ($)', type: 'number', isMetric: true, format: 'currency' },
      { key: 'newCustomers', label: 'New Customers', type: 'number', isMetric: true, format: 'number' },
      { key: 'churnRate', label: 'Churn Rate (%)', type: 'number', isMetric: true, format: 'percent' },
      { key: 'cac', label: 'CAC ($)', type: 'number', isMetric: true, format: 'currency' },
      { key: 'ltv', label: 'LTV ($)', type: 'number', isMetric: true, format: 'currency' },
      { key: 'region', label: 'Region', type: 'string', isDimension: true, format: 'raw' },
      { key: 'segment', label: 'Segment', type: 'string', isDimension: true, format: 'raw' },
    ],
    kpis: [
      { title: 'Annual Run Rate (ARR)', metricKey: 'arr', aggregation: 'max', format: 'currency', target: 20000000, description: 'Current annualized recurring revenue' },
      { title: 'Monthly Recurring Revenue', metricKey: 'mrr', aggregation: 'max', format: 'currency', target: 1650000, description: 'Latest monthly subscription total' },
      { title: 'Average Churn Rate', metricKey: 'churnRate', aggregation: 'avg', format: 'percent', target: 2.0, description: 'Average monthly customer churn' },
      { title: 'Customer Acquisition Cost', metricKey: 'cac', aggregation: 'avg', format: 'currency', target: 4500, description: 'Blended cost per new customer' },
    ],
    records: [
      { id: '1', month: '2025-01', mrr: 1250000, arr: 15000000, newCustomers: 142, churnRate: 2.8, cac: 4850, ltv: 38000, region: 'North America', segment: 'Enterprise' },
      { id: '2', month: '2025-02', mrr: 1290000, arr: 15480000, newCustomers: 158, churnRate: 2.6, cac: 4720, ltv: 39500, region: 'North America', segment: 'Mid-Market' },
      { id: '3', month: '2025-03', mrr: 1340000, arr: 16080000, newCustomers: 175, churnRate: 2.3, cac: 4600, ltv: 41000, region: 'EMEA', segment: 'Enterprise' },
      { id: '4', month: '2025-04', mrr: 1380000, arr: 16560000, newCustomers: 162, churnRate: 2.4, cac: 4550, ltv: 42000, region: 'North America', segment: 'Enterprise' },
      { id: '5', month: '2025-05', mrr: 1430000, arr: 17160000, newCustomers: 189, churnRate: 2.1, cac: 4400, ltv: 43500, region: 'APAC', segment: 'SMB' },
      { id: '6', month: '2025-06', mrr: 1490000, arr: 17880000, newCustomers: 204, churnRate: 1.9, cac: 4300, ltv: 45000, region: 'North America', segment: 'Enterprise' },
      { id: '7', month: '2025-07', mrr: 1520000, arr: 18240000, newCustomers: 198, churnRate: 2.2, cac: 4450, ltv: 44000, region: 'EMEA', segment: 'Mid-Market' },
      { id: '8', month: '2025-08', mrr: 1580000, arr: 18960000, newCustomers: 221, churnRate: 1.8, cac: 4180, ltv: 46800, region: 'North America', segment: 'Enterprise' },
      { id: '9', month: '2025-09', mrr: 1620000, arr: 19440000, newCustomers: 215, churnRate: 1.9, cac: 4250, ltv: 47200, region: 'APAC', segment: 'Enterprise' },
      { id: '10', month: '2025-10', mrr: 1670000, arr: 20040000, newCustomers: 238, churnRate: 1.6, cac: 4050, ltv: 49000, region: 'North America', segment: 'Enterprise' },
      { id: '11', month: '2025-11', mrr: 1730000, arr: 20760000, newCustomers: 252, churnRate: 1.5, cac: 3950, ltv: 51200, region: 'EMEA', segment: 'Enterprise' },
      { id: '12', month: '2025-12', mrr: 1810000, arr: 21720000, newCustomers: 280, churnRate: 1.4, cac: 3800, ltv: 53500, region: 'North America', segment: 'Enterprise' },
    ],
  },
  {
    id: 'ecommerce-sales',
    name: 'Global E-Commerce Analytics',
    description: 'Gross Merchandise Value (GMV), conversion rate, order volume, and channel breakdowns.',
    category: 'Sales & Retail',
    columns: [
      { key: 'date', label: 'Date', type: 'date', isDimension: true, format: 'date' },
      { key: 'gmv', label: 'Revenue ($)', type: 'number', isMetric: true, format: 'currency' },
      { key: 'orders', label: 'Orders', type: 'number', isMetric: true, format: 'number' },
      { key: 'aov', label: 'Average Order ($)', type: 'number', isMetric: true, format: 'currency' },
      { key: 'convRate', label: 'Conversion Rate (%)', type: 'number', isMetric: true, format: 'percent' },
      { key: 'category', label: 'Category', type: 'string', isDimension: true, format: 'raw' },
      { key: 'channel', label: 'Channel', type: 'string', isDimension: true, format: 'raw' },
      { key: 'region', label: 'Region', type: 'string', isDimension: true, format: 'raw' },
    ],
    kpis: [
      { title: 'Total Revenue (GMV)', metricKey: 'gmv', aggregation: 'sum', format: 'currency', target: 3500000, description: 'Aggregated gross merchandise sales' },
      { title: 'Total Orders', metricKey: 'orders', aggregation: 'sum', format: 'number', target: 25000, description: 'Completed checkout orders' },
      { title: 'Average Order Value', metricKey: 'aov', aggregation: 'avg', format: 'currency', target: 135, description: 'Mean spending per transaction' },
      { title: 'Overall Conversion Rate', metricKey: 'convRate', aggregation: 'avg', format: 'percent', target: 3.5, description: 'Store checkout success rate' },
    ],
    records: [
      { id: 'e1', date: '2025-08-01', gmv: 245000, orders: 1850, aov: 132.4, convRate: 3.2, category: 'Electronics', channel: 'Direct', region: 'North America' },
      { id: 'e2', date: '2025-08-02', gmv: 268000, orders: 1980, aov: 135.3, convRate: 3.4, category: 'Apparel', channel: 'Paid Search', region: 'Europe' },
      { id: 'e3', date: '2025-08-03', gmv: 289000, orders: 2100, aov: 137.6, convRate: 3.6, category: 'Home & Living', channel: 'Social Media', region: 'North America' },
      { id: 'e4', date: '2025-08-04', gmv: 312000, orders: 2240, aov: 139.2, convRate: 3.8, category: 'Electronics', channel: 'Direct', region: 'Asia Pacific' },
      { id: 'e5', date: '2025-08-05', gmv: 295000, orders: 2110, aov: 139.8, convRate: 3.5, category: 'Beauty & Health', channel: 'Organic Search', region: 'North America' },
      { id: 'e6', date: '2025-08-06', gmv: 340000, orders: 2410, aov: 141.0, convRate: 4.1, category: 'Electronics', channel: 'Paid Search', region: 'Europe' },
      { id: 'e7', date: '2025-08-07', gmv: 378000, orders: 2650, aov: 142.6, convRate: 4.3, category: 'Apparel', channel: 'Social Media', region: 'North America' },
      { id: 'e8', date: '2025-08-08', gmv: 362000, orders: 2520, aov: 143.6, convRate: 4.0, category: 'Home & Living', channel: 'Direct', region: 'Latin America' },
      { id: 'e9', date: '2025-08-09', gmv: 395000, orders: 2710, aov: 145.7, convRate: 4.5, category: 'Electronics', channel: 'Organic Search', region: 'North America' },
      { id: 'e10', date: '2025-08-10', gmv: 420000, orders: 2890, aov: 145.3, convRate: 4.7, category: 'Apparel', channel: 'Paid Search', region: 'Asia Pacific' },
    ],
  },
  {
    id: 'supply-chain',
    name: 'Logistics & Supply Chain Operations',
    description: 'Fulfillment lead times, on-time delivery percentages, fleet capacity utilization, and logistics costs.',
    category: 'Operations',
    columns: [
      { key: 'period', label: 'Week', type: 'string', isDimension: true, format: 'raw' },
      { key: 'fulfillmentHrs', label: 'Lead Time (hrs)', type: 'number', isMetric: true, format: 'number' },
      { key: 'onTimePercent', label: 'On-Time Delivery (%)', type: 'number', isMetric: true, format: 'percent' },
      { key: 'unitsShipped', label: 'Units Shipped', type: 'number', isMetric: true, format: 'number' },
      { key: 'logisticsCost', label: 'Cost ($)', type: 'number', isMetric: true, format: 'currency' },
      { key: 'returnRate', label: 'Return Rate (%)', type: 'number', isMetric: true, format: 'percent' },
      { key: 'warehouse', label: 'Hub Facility', type: 'string', isDimension: true, format: 'raw' },
    ],
    kpis: [
      { title: 'Total Units Shipped', metricKey: 'unitsShipped', aggregation: 'sum', format: 'number', target: 500000, description: 'Total packages routed through network' },
      { title: 'On-Time Delivery Rate', metricKey: 'onTimePercent', aggregation: 'avg', format: 'percent', target: 96.5, description: 'Percentage delivered within SLA window' },
      { title: 'Average Fulfillment Time', metricKey: 'fulfillmentHrs', aggregation: 'avg', format: 'number', target: 18, suffix: ' hrs', description: 'Order placement to carrier scan time' },
      { title: 'Total Shipping & Logistics Cost', metricKey: 'logisticsCost', aggregation: 'sum', format: 'currency', target: 1200000, description: 'Direct freight and warehousing expenses' },
    ],
    records: [
      { id: 's1', period: 'W31 2025', fulfillmentHrs: 24.2, onTimePercent: 92.4, unitsShipped: 48200, logisticsCost: 115000, returnRate: 2.8, warehouse: 'East Hub (NJ)' },
      { id: 's2', period: 'W32 2025', fulfillmentHrs: 22.8, onTimePercent: 93.8, unitsShipped: 51200, logisticsCost: 118000, returnRate: 2.6, warehouse: 'Midwest Hub (IL)' },
      { id: 's3', period: 'W33 2025', fulfillmentHrs: 21.0, onTimePercent: 95.1, unitsShipped: 54000, logisticsCost: 122000, returnRate: 2.4, warehouse: 'West Hub (CA)' },
      { id: 's4', period: 'W34 2025', fulfillmentHrs: 19.5, onTimePercent: 96.5, unitsShipped: 58900, logisticsCost: 129000, returnRate: 2.1, warehouse: 'East Hub (NJ)' },
      { id: 's5', period: 'W35 2025', fulfillmentHrs: 18.2, onTimePercent: 97.2, unitsShipped: 62400, logisticsCost: 134000, returnRate: 1.9, warehouse: 'Southern Hub (TX)' },
      { id: 's6', period: 'W36 2025', fulfillmentHrs: 17.5, onTimePercent: 98.0, unitsShipped: 66000, logisticsCost: 139000, returnRate: 1.8, warehouse: 'West Hub (CA)' },
    ],
  },
];

export function parseCSV(csvText: string): { columns: ColumnMeta[]; records: DataRecord[] } {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row.');
  }

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const records: DataRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseLine(lines[i]);
    const rowObj: DataRecord = { id: `custom_${i}` };

    headers.forEach((h, idx) => {
      const val = values[idx] ?? '';
      const numVal = Number(val);
      if (val !== '' && !isNaN(numVal)) {
        rowObj[h] = numVal;
      } else {
        rowObj[h] = val;
      }
    });
    records.push(rowObj);
  }

  // Infer columns
  const firstRow = records[0] || {};
  const columns: ColumnMeta[] = headers.map((key) => {
    const sampleVal = firstRow[key];
    const isNum = typeof sampleVal === 'number';
    const isDate = typeof sampleVal === 'string' && !isNaN(Date.parse(sampleVal)) && (sampleVal.includes('-') || sampleVal.includes('/'));

    return {
      key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      type: isNum ? 'number' : isDate ? 'date' : 'string',
      isMetric: isNum,
      isDimension: !isNum,
      format: isNum ? (key.toLowerCase().includes('rate') || key.toLowerCase().includes('%') ? 'percent' : key.toLowerCase().includes('cost') || key.toLowerCase().includes('price') || key.toLowerCase().includes('mrr') || key.toLowerCase().includes('revenue') ? 'currency' : 'number') : 'raw',
    };
  });

  return { columns, records };
}

export function calculateKPIValue(records: DataRecord[], key: string, agg: 'sum' | 'avg' | 'count' | 'max' | 'min'): number {
  if (!records.length) return 0;
  const vals = records.map((r) => Number(r[key]) || 0);

  if (agg === 'count') return records.length;
  if (agg === 'sum') return vals.reduce((a, b) => a + b, 0);
  if (agg === 'avg') return vals.reduce((a, b) => a + b, 0) / vals.length;
  if (agg === 'max') return Math.max(...vals);
  if (agg === 'min') return Math.min(...vals);
  return 0;
}

export function formatValue(value: number, format?: 'currency' | 'percent' | 'number' | 'date' | 'raw', prefix = '', suffix = ''): string {
  if (value === undefined || value === null || isNaN(value)) return 'N/A';

  let formatted = '';
  if (format === 'currency') {
    if (Math.abs(value) >= 1_000_000_000) {
      formatted = `$${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (Math.abs(value) >= 1_000_000) {
      formatted = `$${(value / 1_000_000).toFixed(2)}M`;
    } else if (Math.abs(value) >= 1_000) {
      formatted = `$${(value / 1_000).toFixed(1)}k`;
    } else {
      formatted = `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
  } else if (format === 'percent') {
    formatted = `${value.toFixed(1)}%`;
  } else if (format === 'number') {
    if (Math.abs(value) >= 1_000_000) {
      formatted = `${(value / 1_000_000).toFixed(2)}M`;
    } else if (Math.abs(value) >= 10_000) {
      formatted = `${(value / 1_000).toFixed(1)}k`;
    } else {
      formatted = value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
  } else {
    formatted = String(value);
  }

  return `${prefix}${formatted}${suffix}`;
}
