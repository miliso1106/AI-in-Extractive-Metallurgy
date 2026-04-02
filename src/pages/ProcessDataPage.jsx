import React, { useState, useMemo } from 'react';
import DataTable from '../components/DataTable';
import processDataFile from '../data/processData.json';
import { Database, Download, RefreshCw } from 'lucide-react';

const ProcessDataPage = () => {
  const [data, setData] = useState(processDataFile.processes);
  const [isExporting, setIsExporting] = useState(false);

  const stats = useMemo(() => {
    if (data.length === 0) return {};

    return {
      totalProcesses: data.length,
      avgRecovery: (data.reduce((sum, item) => sum + item.recoveryRate, 0) / data.length).toFixed(1),
      avgEfficiency: (data.reduce((sum, item) => sum + item.efficiency, 0) / data.length).toFixed(1),
      totalCO2: data.reduce((sum, item) => sum + item.co2Emissions, 0),
      optimalCount: data.filter((item) => item.status === 'Optimal').length,
      warningCount: data.filter((item) => item.status === 'Warning').length,
      alertCount: data.filter((item) => item.status === 'Alert').length,
      avgWaste: (data.reduce((sum, item) => sum + item.wasteGenerated, 0) / data.length).toFixed(1),
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Database className="text-blue-400" size={32} />
          Process Data Management
        </h1>
        <p className="text-slate-400">View and analyze all extraction processes with real-time data</p>
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
          <p className="stat-label">Total CO₂ Emissions</p>
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
              <span className="text-green-300">✓ Optimal</span>
              <span className="text-xl font-bold text-green-400">{stats.optimalCount}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-yellow-900 bg-opacity-20 rounded border border-yellow-700">
              <span className="text-yellow-300">⚠ Warning</span>
              <span className="text-xl font-bold text-yellow-400">{stats.warningCount}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-red-900 bg-opacity-20 rounded border border-red-700">
              <span className="text-red-300">✕ Alert</span>
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
                {(data.reduce((sum, item) => sum + item.waterUsage, 0) / data.length).toFixed(0)} m³
              </span>
            </div>
            <div className="flex justify-between p-2 bg-slate-700 rounded">
              <span className="text-slate-300">Avg. Energy Consumption</span>
              <span className="text-blue-300 font-semibold">
                {(data.reduce((sum, item) => sum + item.energyConsumption, 0) / data.length).toFixed(0)} MWh
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
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-white">Process Data Table</h2>
          <p className="text-slate-400 text-sm mt-1">Click column headers to sort. Use search and filters to find specific processes.</p>
        </div>
        <div className="card-body">
          <DataTable data={data} />
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
                <li><strong>CO₂ Emissions:</strong> Carbon dioxide emissions per day (kg)</li>
                <li><strong>Waste Generated:</strong> Waste production per day (tons)</li>
                <li><strong>Water Usage:</strong> Water consumption per day (m³)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Status Legend</h4>
              <ul className="space-y-1 text-slate-300">
                <li><strong>Optimal:</strong> Process running perfectly (Eff. > 85%)</li>
                <li><strong>Warning:</strong> Minor issues detected (80-85%)</li>
                <li><strong>Alert:</strong> Attention needed (< 80%)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessDataPage;
