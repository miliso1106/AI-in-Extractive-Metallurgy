import React, { useState, useMemo } from 'react';
import { analyzeEnvironmentalImpact } from '../services/openRouterService';
import { Loader, Leaf } from 'lucide-react';

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

  const parsedAnalysis = useMemo(() => {
    if (!analysis) return null;
    try {
      return JSON.parse(analysis);
    } catch {
      return null;
    }
  }, [analysis]);

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

  const getSeverity = (value, thresholds) => {
    if (value >= thresholds[2]) return { label: 'Critical', color: 'red' };
    if (value >= thresholds[1]) return { label: 'High', color: 'orange' };
    if (value >= thresholds[0]) return { label: 'Moderate', color: 'yellow' };
    return { label: 'Low', color: 'green' };
  };

  const severities = useMemo(() => ({
    waste: getSeverity(formData.wasteGeneration, [100, 200, 300]),
    emissions: getSeverity(formData.emissions, [800, 1500, 2500]),
    water: getSeverity(formData.waterUsage, [300, 600, 900]),
    energy: getSeverity(formData.energyConsumption, [150, 300, 450]),
  }), [formData]);

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
                Water Usage (m3/day)
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
                  {[
                    { key: 'waste', label: 'Waste Impact' },
                    { key: 'emissions', label: 'Emissions' },
                    { key: 'water', label: 'Water Usage' },
                    { key: 'energy', label: 'Energy' },
                  ].map(({ key, label }) => {
                    const s = severities[key];
                    return (
                      <div key={key} className={`bg-${s.color}-900 bg-opacity-20 border border-${s.color}-700 p-3 rounded`}>
                        <p className={`text-xs text-${s.color}-200`}>{label}</p>
                        <p className={`text-lg font-bold text-${s.color}-300`}>{s.label}</p>
                      </div>
                    );
                  })}
                </div>

                {parsedAnalysis ? (
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <h3 className="font-semibold text-white mb-2">Impact Summary</h3>
                      <p className="text-sm text-slate-200 whitespace-pre-wrap">
                        {parsedAnalysis.impact || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <h3 className="font-semibold text-white mb-2">Recommendations</h3>
                      <p className="text-sm text-slate-200 whitespace-pre-wrap">
                        {parsedAnalysis.recommendations || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <h3 className="font-semibold text-white mb-2">Cost-Benefit</h3>
                      <p className="text-sm text-slate-200 whitespace-pre-wrap">
                        {parsedAnalysis.costBenefit || 'N/A'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-3">AI Recommendations</h3>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">
                      {analysis}
                    </p>
                  </div>
                )}
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
