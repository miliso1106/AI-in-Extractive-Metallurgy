import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Database } from 'lucide-react';
import processDataFile from '../data/processData.json';

const Dashboard = ({ setCurrentPage }) => {
  const processes = processDataFile.processes;
  const stats = {
    efficiency: parseFloat((processes.reduce((s, p) => s + p.efficiency, 0) / processes.length).toFixed(1)),
    recoveryRate: parseFloat((processes.reduce((s, p) => s + p.recoveryRate, 0) / processes.length).toFixed(1)),
    wasteReduction: 34.2,
    energyOptimization: 28.5,
  };

  // Sample data for charts
  const efficiencyData = [
    { time: '00:00', efficiency: 82, target: 85 },
    { time: '04:00', efficiency: 84, target: 85 },
    { time: '08:00', efficiency: 86, target: 85 },
    { time: '12:00', efficiency: 87.3, target: 85 },
    { time: '16:00', efficiency: 88, target: 85 },
    { time: '20:00', efficiency: 87, target: 85 },
    { time: '24:00', efficiency: 87.3, target: 85 },
  ];

  const recoveryData = [
    { process: 'Copper', rate: 94.2 },
    { process: 'Gold', rate: 91.5 },
    { process: 'Silver', rate: 89.3 },
    { process: 'Zinc', rate: 93.1 },
    { process: 'Lead', rate: 88.7 },
  ];

  const StatCard = ({ icon: Icon, label, value, unit, trend }) => (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p className="stat-value">{value}{unit}</p>
        </div>
        <div className="p-3 bg-blue-900 rounded-lg">
          <Icon className="text-blue-400" size={24} />
        </div>
      </div>
      {trend && (
        <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? 'up' : 'down'} {Math.abs(trend)}% from yesterday
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Process Optimization Dashboard
        </h1>
        <p className="text-slate-400">Real-time AI/ML-driven extractive metallurgy optimization</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Process Efficiency"
          value={stats.efficiency}
          unit="%"
          trend={2.3}
        />
        <StatCard
          icon={CheckCircle}
          label="Metal Recovery Rate"
          value={stats.recoveryRate}
          unit="%"
          trend={1.8}
        />
        <StatCard
          icon={AlertCircle}
          label="Waste Reduction"
          value={stats.wasteReduction}
          unit="%"
          trend={4.1}
        />
        <StatCard
          icon={TrendingUp}
          label="Energy Optimization"
          value={stats.energyOptimization}
          unit="%"
          trend={3.2}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Efficiency Trend */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">Efficiency Trend (24h)</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#3b82f6"
                  name="Current"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#10b981"
                  name="Target"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recovery Rate by Metal */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">Recovery Rate by Metal</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recoveryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="process" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="rate" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-white">System Alerts and Status</h2>
        </div>
        <div className="card-body">
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-green-900 bg-opacity-20 border border-green-700 rounded-lg">
              <CheckCircle className="text-green-400 mr-3 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-green-400">Process Optimal</p>
                <p className="text-green-200 text-sm">All metallurgical processes running at peak efficiency</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg">
              <AlertCircle className="text-blue-400 mr-3 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-blue-400">AI/ML Recommendation</p>
                <p className="text-blue-200 text-sm">Consider adjusting leaching temperature by +2 C for improved recovery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process Data Preview */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="text-blue-400" size={20} />
            <h2 className="text-xl font-semibold text-white">Recent Process Data</h2>
          </div>
          <button onClick={() => setCurrentPage && setCurrentPage('data')} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-4 py-2 text-slate-300 font-semibold">Process</th>
                  <th className="text-left px-4 py-2 text-slate-300 font-semibold">Recovery %</th>
                  <th className="text-left px-4 py-2 text-slate-300 font-semibold">Efficiency %</th>
                  <th className="text-left px-4 py-2 text-slate-300 font-semibold">Status</th>
                  <th className="text-left px-4 py-2 text-slate-300 font-semibold">CO2 (kg)</th>
                </tr>
              </thead>
              <tbody>
                {processDataFile.processes.slice(0, 5).map((process) => (
                  <tr key={process.id} className="border-b border-slate-700 hover:bg-slate-700 transition">
                    <td className="px-4 py-2 text-white font-medium">{process.processName}</td>
                    <td className="px-4 py-2 text-slate-300">{process.recoveryRate.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-slate-300">{process.efficiency.toFixed(1)}%</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          process.status === 'Optimal'
                            ? 'bg-green-900 text-green-300'
                            : process.status === 'Warning'
                            ? 'bg-yellow-900 text-yellow-300'
                            : 'bg-red-900 text-red-300'
                        }`}
                      >
                        {process.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-300">{process.co2Emissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-slate-700 rounded-lg border border-slate-600 text-center">
            <p className="text-slate-300 text-sm">
              Showing 5 of {processDataFile.processes.length} processes.{' '}
              <span className="text-blue-400 font-semibold">Go to Process Data page to see all data and export as CSV.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

