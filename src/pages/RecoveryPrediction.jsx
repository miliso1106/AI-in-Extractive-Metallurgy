import React, { useState, useMemo } from 'react';
import { predictRecoveryRate } from '../services/openRouterService';
import { Loader, TrendingUp, Target, BarChart3, List, ChevronRight } from 'lucide-react';

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

/** Flatten any value to readable text */
const toReadable = (val) => {
  if (val === null || val === undefined || val === '') return 'N/A';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) {
    return val.map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        return item.factor || item.description || item.name || item.title || JSON.stringify(item);
      }
      return String(item);
    }).filter(Boolean);
  }
  if (typeof val === 'object') {
    return Object.entries(val)
      .map(([k, v]) => `${formatLabel(k)}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
      .join('\n');
  }
  return String(val);
};

/* ───── Component ───── */

const RecoveryPrediction = () => {
  const [formData, setFormData] = useState({
    oreGrade: 2.5,
    leachingTime: 8,
    temperature: 65,
    chemicalConcentration: 15,
    pH: 1.5,
  });

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const parsed = useMemo(() => {
    if (!prediction) return null;
    return extractJsonObject(prediction);
  }, [prediction]);

  const recoveryRate = useMemo(() => {
    if (parsed?.recoveryRate) {
      const rate = parsed.recoveryRate;
      if (typeof rate === 'number') return `${rate}%`;
      if (typeof rate === 'string') return rate.includes('%') ? rate : `${rate}%`;
      if (typeof rate === 'object') {
        return rate.value || rate.predicted || rate.estimate || JSON.stringify(rate);
      }
    }
    // Fallback: try to find a percentage in raw text
    const match = prediction?.match(/(\d+\.?\d*)\s*%/);
    return match ? `~${match[1]}%` : 'See analysis';
  }, [parsed, prediction]);

  const confidence = useMemo(() => {
    const c = parsed?.confidence;
    if (!c) return 'N/A';
    if (typeof c === 'string') return c;
    if (typeof c === 'number') return `${c}%`;
    if (typeof c === 'object') {
      return c.level || c.value || c.percentage || JSON.stringify(c);
    }
    return String(c);
  }, [parsed]);

  const factors = useMemo(() => {
    const f = parsed?.factors;
    if (!f) return [];
    if (typeof f === 'string') return f.split('\n').map((l) => l.trim()).filter(Boolean);
    if (Array.isArray(f)) {
      return f.map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') {
          return item.factor || item.name || item.description || item.title || item.detail || JSON.stringify(item);
        }
        return String(item);
      }).filter(Boolean);
    }
    if (typeof f === 'object') {
      return Object.entries(f).map(([k, v]) =>
        `${formatLabel(k)}: ${typeof v === 'string' ? v : JSON.stringify(v)}`
      );
    }
    return [String(f)];
  }, [parsed]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await predictRecoveryRate(formData);
      setPrediction(result);
    } catch (err) {
      setError('Failed to generate prediction. Please check your API key and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Recovery Rate Prediction
        </h1>
        <p className="text-slate-400">AI-powered predictions for metal recovery rates based on process parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">Leaching Parameters</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Ore Grade (%)
              </label>
              <input
                type="number"
                name="oreGrade"
                value={formData.oreGrade}
                onChange={handleInputChange}
                step="0.1"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">Metal content percentage in ore</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Leaching Time (hours)
              </label>
              <input
                type="number"
                name="leachingTime"
                value={formData.leachingTime}
                onChange={handleInputChange}
                step="0.5"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Temperature (C)
                </label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Chem. Conc. (%)
                </label>
                <input
                  type="number"
                  name="chemicalConcentration"
                  value={formData.chemicalConcentration}
                  onChange={handleInputChange}
                  step="0.5"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                pH Level
              </label>
              <input
                type="number"
                name="pH"
                value={formData.pH}
                onChange={handleInputChange}
                step="0.1"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">Acidic (0-7)</p>
            </div>

            <button
              onClick={handlePredict}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>Predicting...</span>
                </>
              ) : (
                <>
                  <TrendingUp size={20} />
                  <span>Predict Recovery Rate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">Prediction Results</h2>
          </div>
          <div className="card-body">
            {error && (
              <div className="p-4 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg text-red-200">
                {error}
              </div>
            )}

            {prediction ? (
              <div className="space-y-4">
                {/* Recovery Rate Hero */}
                <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/30 p-6 rounded-lg border border-green-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Target size={18} className="text-green-400" />
                    <p className="text-sm text-green-200">Predicted Recovery Rate</p>
                  </div>
                  <p className="text-4xl font-bold text-green-300">
                    {recoveryRate}
                  </p>
                </div>

                {parsed ? (
                  <div className="space-y-4">
                    {/* Confidence */}
                    <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 size={18} className="text-blue-400" />
                        <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Confidence Level</h3>
                      </div>
                      <p className="text-lg font-semibold text-blue-300">{confidence}</p>
                    </div>

                    {/* Factors */}
                    {factors.length > 0 && (
                      <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <List size={18} className="text-yellow-400" />
                          <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Key Factors</h3>
                        </div>
                        <ul className="space-y-2">
                          {factors.map((item, idx) => (
                            <li key={idx} className="flex gap-2 text-sm text-slate-200">
                              <ChevronRight size={16} className="text-yellow-400 mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Fallback: raw text */
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-3">AI Analysis</h3>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">
                      {prediction}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-slate-400">
                  {loading
                    ? 'AI is generating your recovery prediction...'
                    : 'Fill in the parameters and click "Predict Recovery Rate" to see results'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoveryPrediction;
