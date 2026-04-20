import React, { useState, useMemo } from 'react';
import { analyzeEnvironmentalImpact } from '../services/openRouterService';
import { Loader, Leaf, AlertTriangle, Lightbulb, DollarSign, ChevronRight } from 'lucide-react';

/* ───── Helpers ───── */

const safeJsonParse = (text) => {
  try { return JSON.parse(text); } catch { return null; }
};

const extractJsonObject = (text) => {
  if (!text) return null;
  const cleaned = String(text).replace(/```json/gi, '```').replace(/```/g, '').trim();
  const direct = safeJsonParse(cleaned);
  if (direct) return direct;
  const match = cleaned.match(/\{[\s\S]*\}/);
  return match ? safeJsonParse(match[0]) : null;
};

const formatLabel = (key) =>
  key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Recursively flatten any value to readable text */
const flatten = (v) => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map(flatten).filter(Boolean);
  if (typeof v === 'object') {
    return Object.entries(v).map(([k, val]) => `${formatLabel(k)}: ${Array.isArray(val) ? flatten(val).join('; ') : flatten(val)}`);
  }
  return String(v);
};

/** Extract a flat array of strings from any shape */
const toStringList = (val) => {
  if (!val) return [];
  if (typeof val === 'string') return val.split('\n').map((l) => l.trim()).filter(Boolean);
  if (Array.isArray(val)) {
    return val.flatMap((item) => {
      if (typeof item === 'string') return [item.trim()];
      if (item && typeof item === 'object') {
        const desc = item.recommendation || item.description || item.action || item.suggestion || item.title || item.details;
        if (desc) return [desc];
        return flatten(item) || [];
      }
      return [];
    }).filter(Boolean);
  }
  if (typeof val === 'object') {
    return Object.entries(val).map(([k, v]) => {
      const flat = Array.isArray(v) ? toStringList(v).join('; ') : (typeof v === 'string' ? v : JSON.stringify(v));
      return `${formatLabel(k)}: ${flat}`;
    });
  }
  return [String(val)];
};

/** Extract readable text from a potentially nested value */
const toReadable = (val) => {
  if (!val) return 'N/A';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) return toStringList(val).join('\n');
  if (typeof val === 'object') {
    return Object.entries(val)
      .map(([k, v]) => `${formatLabel(k)}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
      .join('\n');
  }
  return String(val);
};

/* ───── Component ───── */

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

  const parsed = useMemo(() => {
    if (!analysis) return null;
    return extractJsonObject(analysis);
  }, [analysis]);

  const impactText = useMemo(() => toReadable(parsed?.impact), [parsed]);
  const recItems = useMemo(() => toStringList(parsed?.recommendations), [parsed]);
  const costText = useMemo(() => toReadable(parsed?.costBenefit), [parsed]);

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

  const severityColors = {
    red: { bg: 'bg-red-900/20', border: 'border-red-700', text: 'text-red-200', bold: 'text-red-300' },
    orange: { bg: 'bg-orange-900/20', border: 'border-orange-700', text: 'text-orange-200', bold: 'text-orange-300' },
    yellow: { bg: 'bg-yellow-900/20', border: 'border-yellow-700', text: 'text-yellow-200', bold: 'text-yellow-300' },
    green: { bg: 'bg-green-900/20', border: 'border-green-700', text: 'text-green-200', bold: 'text-green-300' },
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Environmental Impact Analysis
        </h1>
        <p className="text-slate-400">AI/ML-driven analysis of your process's environmental footprint</p>
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
                {/* Severity indicators */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { key: 'waste', label: 'Waste Impact' },
                    { key: 'emissions', label: 'Emissions' },
                    { key: 'water', label: 'Water Usage' },
                    { key: 'energy', label: 'Energy' },
                  ].map(({ key, label }) => {
                    const s = severities[key];
                    const c = severityColors[s.color];
                    return (
                      <div key={key} className={`${c.bg} border ${c.border} p-3 rounded`}>
                        <p className={`text-xs ${c.text}`}>{label}</p>
                        <p className={`text-lg font-bold ${c.bold}`}>{s.label}</p>
                      </div>
                    );
                  })}
                </div>

                {parsed ? (
                  <div className="space-y-4">
                    {/* Impact Summary */}
                    <div className="bg-gradient-to-r from-red-900/20 to-orange-900/15 border border-red-800/40 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={18} className="text-red-400" />
                        <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Impact Summary</h3>
                      </div>
                      <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{impactText}</p>
                    </div>

                    {/* Recommendations */}
                    {recItems.length > 0 && (
                      <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb size={18} className="text-green-400" />
                          <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Sustainability Recommendations</h3>
                        </div>
                        <ul className="space-y-2">
                          {recItems.map((item, idx) => (
                            <li key={idx} className="flex gap-2 text-sm text-slate-200">
                              <ChevronRight size={16} className="text-green-400 mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Cost-Benefit */}
                    <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={18} className="text-yellow-400" />
                        <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Cost-Benefit Analysis</h3>
                      </div>
                      <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{costText}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-3">AI/ML Recommendations</h3>
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
                    ? 'AI/ML is analyzing environmental impact...'
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
