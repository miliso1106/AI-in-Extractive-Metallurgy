import React, { useMemo, useState } from 'react';
import { Cpu, TrendingUp } from 'lucide-react';
import defaultModelArtifact from '../data/ml_model.json';
import perProcessModels from '../data/ml_models_by_process.json';
import bestModelsSummary from '../data/best_models_summary.json';

const PROCESS_META = {
  'Copper Heap Leach': {
    labels: ['oreGrade (g/t Cu)', 'temperature (degC)', 'pressure (atm)', 'leachingTime (hr)'],
    defaults: [2.34, 61.75, 1.305, 709.8],
  },
  'Copper Flotation': {
    labels: ['oreGrade (% Cu)', 'temperature (degC)', 'pH', 'reagentDosage (g/t)'],
    defaults: [2.255, 38.15, 8.495, 18.6],
  },
  'Aluminum Bauxite (Bayer)': {
    labels: ['Al2O3 Grade (%)', 'temperature (degC)', 'pressure (bar)', 'NaOH Conc (mol/L)'],
    defaults: [45.45, 161.05, 30.4, 5.565],
  },
  'Iron Magnetite': {
    labels: ['Fe Grade (%)', 'grindSize (mm)', 'magneticIntensity (Oe)', 'feedRate (t/hr)'],
    defaults: [58.05, 0.265, 17875, 90.2],
  },
  'Zinc Roasting': {
    labels: ['Zn Grade (%)', 'temperature (degC)', 'SO2 Concentration (%)', 'feedRate (t/hr)'],
    defaults: [55.4, 901, 10.2, 3.11],
  },
  'Gold Cyanidation': {
    labels: ['oreGrade (g/t Au)', 'cyanideConc (mol/L)', 'pH', 'leachTime (hr)'],
    defaults: [4.13, 0.051, 10.675, 23.75],
  },
  'Silver Leaching': {
    labels: ['oreGrade (g/t Ag)', 'cyanideConc (mol/L)', 'pH', 'leachTime (hr)'],
    defaults: [284, 0.311, 11.655, 24.15],
  },
  'Cobalt Leaching (PAL)': {
    labels: ['coGrade (%)', 'temperature (degC)', 'pressure (bar)', 'H2SO4 Conc (mol/L)'],
    defaults: [1.048, 172.9, 62.95, 1.9],
  },
  'Lead Smelting': {
    labels: ['pbGrade (%)', 'temperature (degC)', 'O2 Enrichment (%)', 'recoveryTarget (%)'],
    defaults: [68, 1251.5, 15.65, 89.5],
  },
  'Nickel Laterite (HPAL)': {
    labels: ['niGrade (%)', 'temperature (degC)', 'pressure (bar)', 'H2SO4 Conc (mol/L)'],
    defaults: [1.602, 262.1, 51.85, 2.108],
  },
};

const processOptions = Object.keys(PROCESS_META);
const defaultProcess = processOptions[0];

const getProcessModel = (processName) => perProcessModels.processes?.[processName] || defaultModelArtifact;
const bestModelLookup = Object.fromEntries(
  (bestModelsSummary.best_model_per_process || []).map((row) => [row.processName, row]),
);
const getBestModelStats = (processName) => bestModelLookup[processName] || null;

const getFormDataFromDefaults = (values) => ({
  condition_1_value: values[0],
  condition_2_value: values[1],
  condition_3_value: values[2],
  condition_4_value: values[3],
});

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const predictFromArtifact = (artifact, formData) => {
  if (artifact.model_type !== 'linear_regression') return NaN;
  const x = artifact.features.map((f) => Number(formData[f] ?? 0));
  let y = Number(artifact.intercept || 0);
  for (let i = 0; i < x.length; i += 1) {
    y += x[i] * Number(artifact.coefficients[i] || 0);
  }
  return y;
};

const getStep = (min, max) => {
  const span = Math.abs(max - min);
  if (span <= 1) return '0.001';
  if (span <= 10) return '0.01';
  if (span <= 100) return '0.1';
  return '1';
};

const MLPrediction = () => {
  const [selectedProcess, setSelectedProcess] = useState(defaultProcess);
  const [formData, setFormData] = useState(getFormDataFromDefaults(PROCESS_META[defaultProcess].defaults));

  const model = getProcessModel(selectedProcess);
  const bestStats = getBestModelStats(selectedProcess);
  const featureKeys = model.features;
  const ranges = model.ranges || [];
  const labels = PROCESS_META[selectedProcess].labels;

  const handleProcessChange = (e) => {
    const processName = e.target.value;
    setSelectedProcess(processName);
    setFormData(getFormDataFromDefaults(PROCESS_META[processName].defaults));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return;

    setFormData((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
  };

  const handleInputBlur = (key, idx) => {
    const range = ranges[idx];
    if (!range) return;
    setFormData((prev) => ({
      ...prev,
      [key]: clamp(Number(prev[key]), Number(range.min), Number(range.max)),
    }));
  };

  const prediction = useMemo(() => predictFromArtifact(model, formData), [model, formData]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Cpu className="text-blue-400" size={32} />
          ML Recovery Prediction
        </h1>
        <p className="text-slate-400">Per-process model with input guardrails from dataset min/max values</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">Input Features</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Process</label>
              <select
                value={selectedProcess}
                onChange={handleProcessChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {processOptions.map((processName) => (
                  <option key={processName} value={processName}>
                    {processName}
                  </option>
                ))}
              </select>
            </div>

            {featureKeys.map((key, index) => {
              const range = ranges[index];
              const min = range ? Number(range.min) : undefined;
              const max = range ? Number(range.max) : undefined;

              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{labels[index] || key}</label>
                  <input
                    type="number"
                    name={key}
                    min={min}
                    max={max}
                    step={range ? getStep(min, max) : 'any'}
                    value={formData[key]}
                    onChange={handleInputChange}
                    onBlur={() => handleInputBlur(key, index)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                  {range && (
                    <p className="text-xs text-slate-400 mt-1">
                      Allowed range: {min} to {max}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">Prediction Output</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 rounded-lg border border-blue-700">
              <p className="text-sm text-blue-200 mb-2">Predicted Recovery Rate</p>
              <p className="text-4xl font-bold text-blue-300">
                {Number.isFinite(prediction) ? `${prediction.toFixed(2)}%` : 'N/A'}
              </p>
            </div>

            <div className="bg-emerald-900/35 border border-emerald-700 p-4 rounded-lg text-sm text-emerald-100">
              <p className="font-semibold text-emerald-200 mb-2">Best Offline Model (from latest training)</p>
              <p className="text-white">{bestStats?.model || model.best_candidate || model.model_type}</p>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg text-sm text-slate-200">
              <p className="font-semibold text-white mb-2">Best Model Metrics</p>
              <p>CV MAE: {bestStats?.cv_mae?.toFixed?.(4) ?? model.metrics?.mae?.toFixed?.(4) ?? 'N/A'}</p>
              <p>CV R2: {bestStats?.cv_r2?.toFixed?.(4) ?? model.metrics?.r2?.toFixed?.(4) ?? 'N/A'}</p>
              <p>Holdout MAE: {bestStats?.holdout_mae?.toFixed?.(4) ?? 'N/A'}</p>
              <p>Holdout R2: {bestStats?.holdout_r2?.toFixed?.(4) ?? 'N/A'}</p>
            </div>

            <div className="bg-amber-900/30 border border-amber-700 p-4 rounded-lg text-xs text-amber-100">
              <p className="font-semibold text-amber-200 mb-1">Live Prediction Engine</p>
              <p>
                The UI currently computes prediction using a linear surrogate formula for transparent weights and fast
                response.
              </p>
            </div>

            {Array.isArray(model.coefficients) && (
              <div className="bg-slate-700 p-4 rounded-lg text-xs text-slate-300">
                <p className="font-semibold text-white mb-2">Linear Weights (Surrogate Reference)</p>
                <p>{model.coefficients.map((w) => Number(w).toFixed(6)).join(', ')}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <TrendingUp size={14} />
              Inputs used by live predictor: {featureKeys.join(', ')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLPrediction;


