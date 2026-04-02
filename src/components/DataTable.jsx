import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Search, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const DataTable = ({ data }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'efficiency', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filter and sort data
  const filteredData = data
    .filter((item) => {
      const matchesSearch = item.processName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <div className="w-4 h-4" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Optimal: { bg: 'bg-green-900', text: 'text-green-300', icon: CheckCircle },
      Warning: { bg: 'bg-yellow-900', text: 'text-yellow-300', icon: AlertTriangle },
      Alert: { bg: 'bg-red-900', text: 'text-red-300', icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig.Optimal;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon size={14} />
        {status}
      </span>
    );
  };

  const TableHeader = ({ label, sortKey, columnClass }) => (
    <th
      onClick={() => handleSort(sortKey)}
      className={`px-4 py-3 text-left font-semibold text-slate-200 cursor-pointer hover:bg-slate-700 transition ${columnClass}`}
    >
      <div className="flex items-center gap-2 justify-between">
        {label}
        <SortIcon column={sortKey} />
      </div>
    </th>
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search process name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="Optimal">Optimal</option>
          <option value="Warning">Warning</option>
          <option value="Alert">Alert</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 border-b border-slate-700">
            <tr>
              <TableHeader label="Process Name" sortKey="processName" columnClass="w-40" />
              <TableHeader label="Ore Grade (%)" sortKey="oreGrade" columnClass="w-28" />
              <TableHeader label="Temp (°C)" sortKey="temperature" columnClass="w-24" />
              <TableHeader label="Recovery (%)" sortKey="recoveryRate" columnClass="w-28" />
              <TableHeader label="Efficiency (%)" sortKey="efficiency" columnClass="w-28" />
              <TableHeader label="CO₂ (kg/day)" sortKey="co2Emissions" columnClass="w-28" />
              <TableHeader label="Status" sortKey="status" columnClass="w-28" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-750 transition border-b border-slate-700 hover:bg-slate-700"
                >
                  <td className="px-4 py-3 text-white font-medium">{item.processName}</td>
                  <td className="px-4 py-3 text-slate-300">{item.oreGrade.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-300">{item.temperature}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">{item.recoveryRate.toFixed(1)}</span>
                      <div className="w-16 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${item.recoveryRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={item.efficiency > 85 ? 'text-green-300' : 'text-orange-300'}>
                        {item.efficiency.toFixed(1)}
                      </span>
                      <div className="w-16 bg-slate-700 rounded-full h-2">
                        <div
                          className={item.efficiency > 85 ? 'bg-green-500' : 'bg-orange-500'}
                          style={{ height: '100%', width: `${item.efficiency}%` }} 
                        >
                          <div
                            style={{ width: `${item.efficiency}%`, height: '100%' }}
                            className={`rounded-full ${item.efficiency > 85 ? 'bg-green-500' : 'bg-orange-500'}`}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{item.co2Emissions}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                  No processes found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
          <p className="text-slate-400">Total Processes</p>
          <p className="text-xl font-bold text-blue-400">{filteredData.length}</p>
        </div>
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
          <p className="text-slate-400">Avg. Recovery</p>
          <p className="text-xl font-bold text-green-400">
            {(filteredData.reduce((sum, item) => sum + item.recoveryRate, 0) / filteredData.length).toFixed(1)}%
          </p>
        </div>
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
          <p className="text-slate-400">Avg. Efficiency</p>
          <p className="text-xl font-bold text-green-400">
            {(filteredData.reduce((sum, item) => sum + item.efficiency, 0) / filteredData.length).toFixed(1)}%
          </p>
        </div>
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
          <p className="text-slate-400">Total CO₂</p>
          <p className="text-xl font-bold text-orange-400">
            {filteredData.reduce((sum, item) => sum + item.co2Emissions, 0).toLocaleString()} kg
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
