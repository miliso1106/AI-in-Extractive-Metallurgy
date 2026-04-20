import React, { useState, useMemo } from 'react';
import { getProcessOptimization } from '../services/openRouterService';
import { Loader, Send, TrendingUp, Clock, AlertTriangle, Lightbulb, ChevronRight } from 'lucide-react';

/* ───── JSON helpers ───── */

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const extractJsonObject = (text) => {
  if (!text) return null;
  const cleaned = String(text).replace(/```json/gi, '```').replace(/```/g, '').trim();
  const direct = safeJsonParse(cleaned);
  if (direct) return direct;

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  return safeJsonParse(match[0]);
};

/* ───── Render helpers ───── */

/** Flatten any value to a human-readable string */
const flatten = (v) => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map(flatten).filter(Boolean).join(', ');
  if (typeof v === 'object') {
    return Object.entries(v)
      .map(([k, val]) => `${formatLabel(k)}: ${flatten(val)}`)
      .join('; ');
  }
  return String(v);
};

/** Turn camelCase / snake_case keys into readable labels */
const formatLabel = (key) =>
  key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** Pull a flat list of strings from any recommendations shape */
const extractRecommendations = (recs) => {
  if (!recs) return [];
  if (typeof recs === 'string') return recs.split('\n').map((l) => l.trim()).filter(Boolean);
  if (Array.isArray(recs)) {
    return recs
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') {
          return (
            item.recommendation ||
            item.description ||
            item.details ||
            item.action ||
            item.suggestion ||
            item.title ||
            flatten(item)
          );
        }
        return '';
      })
      .filter(Boolean);
  }
  if (typeof recs === 'object') {
    return Object.values(recs).map(flatten).filter(Boolean);
  }
  return [];
};

/** Normalise the expected-improvement value to a readable string */
const extractImprovement = (val) => {
  if (!val) return 'N/A';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return `${val}%`;
  if (typeof val === 'object') {
    // e.g. { efficiency: "5-15%", notes: "..." }
    const efficiency =
      val.efficiency ||
      val.percentage ||
      val.improvement ||
      val.expected ||
      val.value;
    const notes = val.notes || val.description || val.details;
    const parts = [];
    if (efficiency) parts.push(typeof efficiency === 'string' ? efficiency : `${efficiency}%`);
    if (notes) parts.push(notes);
    if (parts.length) return parts.join(' — ');
    return flatten(val) || 'N/A';
  }
  return String(val);
};

/** Pull an array of { name, duration, activities } from any timeline shape */
const extractTimeline = (val) => {
  if (!val) return [];
  // Could be an array directly, or { PHASES: [...] }, or { "Phase 1": "...", ... }
  let arr = val;
  if (!Array.isArray(val) && typeof val === 'object') {
    // Check if there's a single array-valued key like PHASES or phases
    const keys = Object.keys(val);
    const arrayKey = keys.find((k) => Array.isArray(val[k]));
    if (arrayKey) {
      arr = val[arrayKey];
    } else {
      // Flat object like { "Phase 1": "desc", "Phase 2": "desc" }
      return keys.map((k) => ({
        name: formatLabel(k),
        description: flatten(val[k]),
      }));
    }
  }
  if (typeof val === 'string') {
    return [{ name: 'Timeline', description: val }];
  }
  if (!Array.isArray(arr)) return [];
  return arr.map((phase, i) => {
    if (typeof phase === 'string') return { name: `Phase ${i + 1}`, description: phase };
    return {
      name: phase.name || phase.phase || phase.title || `Phase ${i + 1}`,
      duration: phase.duration || phase.timeframe || phase.time,
      description: phase.description || phase.details,
      activities: Array.isArray(phase.activities)
        ? phase.activities
        : phase.activities
        ? [phase.activities]
        : [],
    };
  });
};

/** Pull an array of risk objects */
const extractRisks = (val) => {
  if (!val) return [];
  if (typeof val === 'string') return [{ summary: val }];
  if (Array.isArray(val)) {
    return val.map((item) => {
      if (typeof item === 'string') return { summary: item };
      return {
        summary: item.risk || item.summary || item.title || item.description || item.factor || flatten(item),
        probability: item.probability || item.likelihood,
        impact: item.impact || item.severity,
        mitigation: item.mitigation || item.solution || item.action,
      };
    });
  }
  if (typeof val === 'object') {
    // Could be a single risk object
    if (val.risk || val.summary || val.title) {
      return [{
        summary: val.risk || val.summary || val.title,
        probability: val.probability,
        impact: val.impact,
        mitigation: val.mitigation,
      }];
    }
    // Or keyed by risk name
    return Object.entries(val).map(([k, v]) => ({
      summary: formatLabel(k),
      mitigation: flatten(v),
    }));
  }
  return [];
};

/* ───── Component ───── */

const ProcessAnalyzer = () => {
  const [formData, setFormData] = useState({
    processType: 'Copper Leaching',
    efficiency: 85,
    temperature: 70,
    pressure: 2.5,
    issues: 'Slow leaching rate, higher energy consumption',
  });

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);

  const parsed = useMemo(() => {
    if (!recommendations) return null;
    return extractJsonObject(recommendations);
  }, [recommendations]);

  const recItems = useMemo(() => extractRecommendations(parsed?.recommendations), [parsed]);
  const improvement = useMemo(() => extractImprovement(parsed?.expectedImprovement), [parsed]);
  const timeline = useMemo(() => extractTimeline(parsed?.timeline), [parsed]);
  const risks = useMemo(() => extractRisks(parsed?.risks), [parsed]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(value) ? value : parseFloat(value),
    }));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProcessOptimization(formData);
      setRecommendations(result);
    } catch (err) {
      setError('Failed to get recommendations. Please check your API key and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Process Analyzer
        </h1>
        <p className="text-slate-400">Get AI-powered optimization recommendations for your extraction process</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">Process Parameters</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Process Type
              </label>
              <input
                type="text"
                name="processType"
                value={formData.processType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Efficiency (%)
                </label>
                <input
                  type="number"
                  name="efficiency"
                  value={formData.efficiency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Pressure (atm)
                </label>
                <input
                  type="number"
                  name="pressure"
                  value={formData.pressure}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Current Issues
              </label>
              <textarea
                name="issues"
                value={formData.issues}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
              />
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
                  <Send size={20} />
                  <span>Get AI Recommendations</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">AI Recommendations</h2>
          </div>
          <div className="card-body">
            {error && (
              <div className="p-4 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg text-red-200">
                {error}
              </div>
            )}

            {parsed ? (
              <div className="space-y-5">
                {/* Expected Improvement */}
                <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/20 border border-green-800/40 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={18} className="text-green-400" />
                    <h3 className="font-semibold text-green-300 text-sm uppercase tracking-wide">Expected Improvement</h3>
                  </div>
                  <p className="text-lg font-semibold text-white leading-relaxed">{improvement}</p>
                </div>

                {/* Recommendations */}
                {recItems.length > 0 && (
                  <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb size={18} className="text-yellow-400" />
                      <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Recommendations</h3>
                    </div>
                    <ul className="space-y-2">
                      {recItems.map((item, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-slate-200">
                          <ChevronRight size={16} className="text-blue-400 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Timeline */}
                {timeline.length > 0 && (
                  <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={18} className="text-blue-400" />
                      <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Implementation Timeline</h3>
                    </div>
                    <div className="space-y-3">
                      {timeline.map((phase, idx) => (
                        <div key={idx} className="relative pl-4 border-l-2 border-blue-500/40">
                          <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-400" />
                          <p className="text-sm font-semibold text-blue-300">{phase.name}</p>
                          {phase.duration && (
                            <p className="text-xs text-slate-400 mt-0.5">{phase.duration}</p>
                          )}
                          {phase.description && (
                            <p className="text-sm text-slate-300 mt-1">{phase.description}</p>
                          )}
                          {phase.activities?.length > 0 && (
                            <ul className="mt-1 space-y-0.5">
                              {phase.activities.map((a, i) => (
                                <li key={i} className="text-xs text-slate-400 flex gap-1.5">
                                  <span className="text-slate-500">•</span>
                                  <span>{typeof a === 'string' ? a : flatten(a)}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risks */}
                {risks.length > 0 && (
                  <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={18} className="text-amber-400" />
                      <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Risk Factors</h3>
                    </div>
                    <div className="space-y-3">
                      {risks.map((risk, idx) => (
                        <div key={idx} className="bg-slate-800/50 rounded border border-slate-600/40 p-3">
                          <p className="text-sm font-semibold text-white">{risk.summary}</p>
                          {(risk.probability || risk.impact) && (
                            <div className="flex gap-4 mt-1.5">
                              {risk.probability && (
                                <span className="text-xs text-slate-400">
                                  Probability: <span className="text-amber-300">{risk.probability}</span>
                                </span>
                              )}
                              {risk.impact && (
                                <span className="text-xs text-slate-400">
                                  Impact: <span className="text-amber-300">{risk.impact}</span>
                                </span>
                              )}
                            </div>
                          )}
                          {risk.mitigation && (
                            <p className="text-xs text-slate-300 mt-1.5">
                              <span className="text-slate-500">Mitigation: </span>{risk.mitigation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : recommendations ? (
              /* Fallback: raw text if JSON parsing fails */
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="whitespace-pre-wrap text-sm text-slate-200">
                  {recommendations}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-slate-400">
                  {loading
                    ? 'AI is analyzing your process parameters...'
                    : 'Fill in the parameters and click "Get AI Recommendations" to see optimization suggestions'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessAnalyzer;
