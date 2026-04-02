import React, { useState } from 'react';
import { analyzeEnvironmentalImpact } from '../services/openRouterService';
import { Loader, Send, Leaf } from 'lucide-react';

const EnvironmentalImpact = () => {
  const [formData, setFormData] = useState({
    wasteGeneration: 150,
    waterUsage: 500,
    energyConsumption: 250,
    emissions: 1200,
  });

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeEnvironmentalImpact(formData);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to analyze environmental impact. Please check your API key and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Environmental Impact Analysis
        </h1>
        <p className="text-slate-400">AI-driven analysis of your process's environmental footprint</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">Process Metrics</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Waste Generation (tons/day)
              </label>
              <input
                type="number"
                name="wasteGeneration"
                value={formData.wasteGeneration}
                onChange={handleInputChange}
                step="10"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Water Usage (m³/day)
              </label>
              <input
                type="number"
                name="waterUsage"
                value={formData.waterUsage}
                onChange={handleInputChange}
                step="10"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">Cubic meters per day</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Energy Consumption (MWh/day)
              </label>
              <input
                type="number"
                name="energyConsumption"
                value={formData.energyConsumption}
                onChange={handleInputChange}
                step="10"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">Megawatt hours per day</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                CO2 Emissions (kg/day)
              </label>
              <input
                type="number"
                name="emissions"
                value={formData.emissions}
                onChange={handleInputChange}
                step="100"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">Kilograms of CO2 equivalent</p>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Leaf size={20} />
                  <span>Analyze Environmental Impact</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">Impact Assessment</h2>
          </div>
          <div className="card-body">
            {error && (
              <div className="p-4 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg text-red-200">
                {error}
              </div>
            )}

            {analysis ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-red-900 bg-opacity-20 border border-red-700 p-3 rounded">
                    <p className="text-xs text-red-200">Waste Impact</p>
                    <p className="text-lg font-bold text-red-300">High</p>
                  </div>
                  <div className="bg-orange-900 bg-opacity-20 border border-orange-700 p-3 rounded">
                    <p className="text-xs text-orange-200">Emissions</p>
                    <p className="text-lg font-bold text-orange-300">Moderate</p>
                  </div>
                  <div className="bg-yellow-900 bg-opacity-20 border border-yellow-700 p-3 rounded">
                    <p className="text-xs text-yellow-200">Water Usage</p>
                    <p className="text-lg font-bold text-yellow-300">High</p>
                  </div>
                  <div className="bg-blue-900 bg-opacity-20 border border-blue-700 p-3 rounded">
                    <p className="text-xs text-blue-200">Energy</p>
                    <p className="text-lg font-bold text-blue-300">Moderate</p>
                  </div>
                </div>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-3">AI Recommendations</h3>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">
                    {analysis}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-slate-400">
                  {loading
                    ? 'AI is analyzing environmental impact...'
                    : 'Fill in your process metrics and click "Analyze Environmental Impact" to see sustainability recommendations'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalImpact;
