import React, { useState, useMemo } from 'react';
import DataTable from '../components/DataTable';
import SimpleTable from '../components/SimpleTable';
import processDataFile from '../data/processData.json';
import { analyzeDatasetInsights, askMetallurgyQuestion } from '../services/openRouterService';
import { Database, Download, RefreshCw, Upload, Wand2 } from 'lucide-react';

const numericFields = [
  'id',
  'oreGrade',
  'temperature',
  'pressure',
  'leachingTime',
  'recoveryRate',
  'efficiency',
  'wasteGenerated',
  'waterUsage',
  'energyConsumption',
  'co2Emissions',
];

const headerAliases = {
  processName: ['processname', 'process', 'processtype'],
  oreGrade: ['oregrade', 'ore', 'grade'],
  temperature: ['temperature', 'temp', 'tempc'],
  pressure: ['pressure', 'press'],
  leachingTime: ['leachingtime', 'leachtime', 'time'],
  recoveryRate: ['recoveryrate', 'recovery', 'recoverypct'],
  efficiency: ['efficiency', 'eff', 'efficiencypct'],
  wasteGenerated: ['wastegenerated', 'waste'],
  waterUsage: ['waterusage', 'water'],
  energyConsumption: ['energyconsumption', 'energy'],
  co2Emissions: ['co2emissions', 'co2', 'emissions'],
  status: ['status'],
  timestamp: ['timestamp', 'datetime', 'date', 'timepoint'],
  id: ['id'],
};

const normalizeKey = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const mapHeader = (header) => {
  const normalized = normalizeKey(header);
  const match = Object.entries(headerAliases).find(([, aliases]) => aliases.includes(normalized));
  return match ? match[0] : header;
};

const parseCsvText = (text) => {
  const rows = [];
  let current = [];
  let value = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      current.push(value);
      value = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[i + 1] === '\n') {
        i += 1;
      }
      current.push(value);
      rows.push(current);
      current = [];
      value = '';
      continue;
    }

    value += char;
  }

  if (value.length || current.length) {
    current.push(value);
    rows.push(current);
  }

  return rows.filter((row) => row.some((cell) => String(cell).trim() !== ''));
};

const buildSnapshotFromData = (data) => {
  const columns = [
    'processName',
    'oreGrade',
    'temperature',
    'pressure',
    'leachingTime',
    'recoveryRate',
    'efficiency',
    'wasteGenerated',
    'waterUsage',
    'energyConsumption',
    'co2Emissions',
    'status',
    'timestamp',
  ];

  const rows = data.slice(0, 20).map((item) => columns.map((col) => item[col] ?? ''));
  return { columns, rows };
};

const ProcessDataPage = () => {
  const [data, setData] = useState(processDataFile.processes);
  const [isExporting, setIsExporting] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedName, setUploadedName] = useState('');
  const [csvTable, setCsvTable] = useState(null);

  const [analysisFocus, setAnalysisFocus] = useState(
    'Copper slag contains gold and silver. Suggest recovery steps and efficiency improvements.'
  );
  const [explanationMode, setExplanationMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisTable, setAnalysisTable] = useState(null);
  const [analysisRaw, setAnalysisRaw] = useState('');

  const stats = useMemo(() => {
    if (data.length === 0) {
      return {
        totalProcesses: 0,
        avgRecovery: '0.0',
        avgEfficiency: '0.0',
        totalCO2: 0,
        optimalCount: 0,
        warningCount: 0,
        alertCount: 0,
        avgWaste: '0.0',
      };
    }

    return {
      totalProcesses: data.length,
      avgRecovery: (data.reduce((sum, item) => sum + Number(item.recoveryRate ?? 0), 0) / data.length).toFixed(1),
      avgEfficiency: (data.reduce((sum, item) => sum + Number(item.efficiency ?? 0), 0) / data.length).toFixed(1),
      totalCO2: data.reduce((sum, item) => sum + Number(item.co2Emissions ?? 0), 0),
      optimalCount: data.filter((item) => item.status === 'Optimal').length,
      warningCount: data.filter((item) => item.status === 'Warning').length,
      alertCount: data.filter((item) => item.status === 'Alert').length,
      avgWaste: (data.reduce((sum, item) => sum + Number(item.wasteGenerated ?? 0), 0) / data.length).toFixed(1),
    };
  }, [data]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const csv = convertToCSV(data);
      downloadCSV(csv, 'process_data.csv');
      setIsExporting(false);
    }, 500);
  };

  const convertToCSV = (dataArray) => {
    if (!dataArray.length) return '';
    const headers = Object.keys(dataArray[0]).join(',');
    const rows = dataArray.map((item) => Object.values(item).join(','));
    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (csv, filename) => {
    const link = document.createElement('a');
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.download = filename;
    link.click();
  };

  const handleRefresh = () => {
    setData(processDataFile.processes);
    setUploadError(null);
    setUploadedName('');
    setCsvTable(null);
    setAnalysisTable(null);
    setAnalysisRaw('');
  };

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadedName(file.name);
    setAnalysisTable(null);
    setAnalysisRaw('');

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const rows = parseCsvText(text);
        if (!rows.length) {
          throw new Error('CSV appears to be empty.');
        }

        const rawHeaders = rows[0].map((header) => String(header).trim());
        const mappedHeaders = rawHeaders.map((header) => mapHeader(header));
        const dataRows = rows.slice(1).filter((row) => row.some((cell) => String(cell).trim() !== ''));

        const objects = dataRows.map((row, index) => {
          const obj = {};
          mappedHeaders.forEach((key, colIndex) => {
            obj[key] = row[colIndex] ?? '';
          });

          numericFields.forEach((field) => {
            if (obj[field] !== undefined && obj[field] !== '') {
              const parsed = Number(obj[field]);
              obj[field] = Number.isNaN(parsed) ? obj[field] : parsed;
            }
          });

          if (!obj.id) {
            obj.id = index + 1;
          }

          if (!obj.status && typeof obj.efficiency === 'number') {
            if (obj.efficiency > 85) obj.status = 'Optimal';
            else if (obj.efficiency >= 80) obj.status = 'Warning';
            else obj.status = 'Alert';
          }

          return obj;
        });

        setCsvTable({ columns: rawHeaders, rows: dataRows });

        const required = ['processName', 'recoveryRate', 'efficiency'];
        const hasRequired = required.every((field) => mappedHeaders.includes(field));

        if (!hasRequired) {
          setData([]);
          setUploadError(
            'CSV uploaded, but required columns are missing for the advanced table. Expected at least: processName, recoveryRate, efficiency.'
          );
          return;
        }

        setData(objects);
      } catch (err) {
        setUploadError(err.message || 'Failed to parse CSV.');
      }
    };

    reader.onerror = () => {
      setUploadError('Failed to read CSV file.');
    };

    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisTable(null);
    setAnalysisRaw('');

    try {
      const focusText = String(analysisFocus || '').trim();
      const offTopic = /(joke|story|poem|song|meme|quote)/i.test(focusText);
      if (offTopic || focusText.length < 8) {
        setAnalysisError('Analysis focus should be about the dataset (example: recovery, efficiency, slag, water, energy).');
        setIsAnalyzing(false);
        return;
      }

      if (explanationMode) {
        const result = await askMetallurgyQuestion(focusText);
        setAnalysisRaw(String(result || '').trim());
      } else {
        const snapshot = csvTable || buildSnapshotFromData(data);
        const sampleRows = snapshot.rows.slice(0, 20);

        const result = await analyzeDatasetInsights({
          focus: analysisFocus,
          columns: snapshot.columns,
          rows: sampleRows,
        });

        const cleanedResult = String(result)
          .replace(/```json/gi, '```')
          .replace(/```/g, '')
          .trim();
        setAnalysisRaw(cleanedResult);
        const parsed = (() => {
          try {
            return JSON.parse(cleanedResult);
          } catch {
            return null;
          }
        })();

        if (parsed?.columns && parsed?.rows) {
          setAnalysisTable(parsed);
        } else {
          setAnalysisError('AI response was not valid JSON. Showing raw response below.');
        }
      }
    } catch (err) {
      setAnalysisError('Failed to analyze dataset. Please check your API key and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Database className="text-blue-400" size={32} />
          Process Data Management
        </h1>
        <p className="text-slate-400">Upload a CSV dataset, analyze it, and export results in a clean table</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="stat-label">Total Processes</p>
          <p className="stat-value">{stats.totalProcesses}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Avg. Recovery Rate</p>
          <p className="stat-value text-green-400">{stats.avgRecovery}%</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Avg. Efficiency</p>
          <p className="stat-value text-green-400">{stats.avgEfficiency}%</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total CO2 Emissions</p>
          <p className="stat-value text-orange-400">{stats.totalCO2?.toLocaleString()} kg</p>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">System Status</h3>
          </div>
          <div className="card-body space-y-3">
            <div className="flex justify-between items-center p-2 bg-green-900 bg-opacity-20 rounded border border-green-700">
              <span className="text-green-300">Optimal</span>
              <span className="text-xl font-bold text-green-400">{stats.optimalCount}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-yellow-900 bg-opacity-20 rounded border border-yellow-700">
              <span className="text-yellow-300">Warning</span>
              <span className="text-xl font-bold text-yellow-400">{stats.warningCount}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-red-900 bg-opacity-20 rounded border border-red-700">
              <span className="text-red-300">Alert</span>
              <span className="text-xl font-bold text-red-400">{stats.alertCount}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Environmental Metrics</h3>
          </div>
          <div className="card-body space-y-3">
            <div className="flex justify-between p-2 bg-slate-700 rounded">
              <span className="text-slate-300">Avg. Waste Generated</span>
              <span className="text-blue-300 font-semibold">{stats.avgWaste} t/day</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-700 rounded">
              <span className="text-slate-300">Avg. Water Usage</span>
              <span className="text-blue-300 font-semibold">
                {data.length
                  ? (data.reduce((sum, item) => sum + Number(item.waterUsage ?? 0), 0) / data.length).toFixed(0)
                  : '0'} m3
              </span>
            </div>
            <div className="flex justify-between p-2 bg-slate-700 rounded">
              <span className="text-slate-300">Avg. Energy Consumption</span>
              <span className="text-blue-300 font-semibold">
                {data.length
                  ? (data.reduce((sum, item) => sum + Number(item.energyConsumption ?? 0), 0) / data.length).toFixed(0)
                  : '0'} MWh
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          </div>
          <div className="card-body space-y-3">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Download size={18} />
              {isExporting ? 'Exporting...' : 'Export to CSV'}
            </button>
            <button
              onClick={handleRefresh}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Use Sample Data
            </button>
            <label className="btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer">
              <Upload size={18} />
              Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
            {uploadedName && (
              <p className="text-xs text-slate-400">Loaded: {uploadedName}</p>
            )}
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg text-yellow-200">
          {uploadError}
        </div>
      )}

      {/* Data Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-white">Process Data Table</h2>
          <p className="text-slate-400 text-sm mt-1">Click column headers to sort. Use search and filters to find specific processes.</p>
        </div>
        <div className="card-body">
          {data.length ? (
            <DataTable data={data} />
          ) : (
            <SimpleTable
              columns={csvTable?.columns || []}
              rows={csvTable?.rows || []}
              emptyMessage="Upload a CSV to see a preview."
            />
          )}
        </div>
      </div>

      {/* AI Analysis */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-white">AI Insights Table</h2>
          <p className="text-slate-400 text-sm mt-1">Generates a concise table of recommendations from the uploaded data.</p>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Analysis Focus
            </label>
            <textarea
              value={analysisFocus}
              onChange={(e) => setAnalysisFocus(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={explanationMode}
                onChange={(e) => setExplanationMode(e.target.checked)}
                className="accent-blue-500"
              />
              Explanation mode (no table)
            </label>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Wand2 size={18} />
            {isAnalyzing ? 'Analyzing...' : (explanationMode ? 'Answer Question' : 'Analyze Dataset with AI')}
          </button>

          {analysisError && (
            <div className="p-4 bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg text-yellow-200">
              {analysisError}
            </div>
          )}

          {analysisTable && (
            <SimpleTable
              columns={analysisTable.columns}
              rows={analysisTable.rows}
              emptyMessage="No AI insights returned."
            />
          )}

          {!analysisTable && analysisRaw && (
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-semibold text-white mb-3">AI Response (Raw)</h3>
              <p className="text-sm text-slate-200 whitespace-pre-wrap">{analysisRaw}</p>
            </div>
          )}
        </div>
      </div>

      {/* Data Description */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white">Data Dictionary</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-white mb-2">Process Parameters</h4>
              <ul className="space-y-1 text-slate-300">
                <li><strong>Ore Grade:</strong> Metal content percentage in ore</li>
                <li><strong>Temperature:</strong> Operating temperature in Celsius</li>
                <li><strong>Pressure:</strong> Operating pressure in atmospheres</li>
                <li><strong>Leaching Time:</strong> Duration of leaching in hours</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Performance Metrics</h4>
              <ul className="space-y-1 text-slate-300">
                <li><strong>Recovery Rate:</strong> Percentage of metal successfully extracted</li>
                <li><strong>Efficiency:</strong> Overall process efficiency as percentage</li>
                <li><strong>Status:</strong> Operational status (Optimal/Warning/Alert)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Environmental Metrics</h4>
              <ul className="space-y-1 text-slate-300">
                <li><strong>CO2 Emissions:</strong> Carbon dioxide emissions per day (kg)</li>
                <li><strong>Waste Generated:</strong> Waste production per day (tons)</li>
                <li><strong>Water Usage:</strong> Water consumption per day (m3)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Status Legend</h4>
              <ul className="space-y-1 text-slate-300">
                <li><strong>Optimal:</strong> Process running well (Eff. &gt; 85%)</li>
                <li><strong>Warning:</strong> Minor issues detected (80-85%)</li>
                <li><strong>Alert:</strong> Attention needed (&lt; 80%)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessDataPage;
