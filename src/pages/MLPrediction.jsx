import React, { useMemo, useState } from 'react';
import processDataFile from '../data/processData.json';
import { Cpu, TrendingUp } from 'lucide-react';

const featureKeys = ['oreGrade', 'temperature', 'leachingTime', 'pressure'];

const buildMatrix = (rows, cols, fill = 0) => Array.from({ length: rows }, () => Array(cols).fill(fill));

const transpose = (m) => m[0].map((_, i) => m.map((row) => row[i]));

const multiply = (a, b) => {
  const rows = a.length;
  const cols = b[0].length;
  const shared = b.length;
  const out = buildMatrix(rows, cols, 0);
  for (let i = 0; i < rows; i += 1) {
    for (let k = 0; k < shared; k += 1) {
      for (let j = 0; j < cols; j += 1) {
        out[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return out;
};

const invert = (matrix) => {
  const n = matrix.length;
  const aug = matrix.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);

  for (let i = 0; i < n; i += 1) {
    let pivot = aug[i][i];
    if (Math.abs(pivot) < 1e-12) {
      let swapRow = -1;
      for (let r = i + 1; r < n; r += 1) {
        if (Math.abs(aug[r][i]) > 1e-12) {
          swapRow = r;
          break;
        }
      }
      if (swapRow === -1) return null;
      [aug[i], aug[swapRow]] = [aug[swapRow], aug[i]];
      pivot = aug[i][i];
    }

    for (let j = 0; j < 2 * n; j += 1) {
      aug[i][j] /= pivot;
    }

    for (let r = 0; r < n; r += 1) {
      if (r === i) continue;
      const factor = aug[r][i];
      for (let j = 0; j < 2 * n; j += 1) {
        aug[r][j] -= factor * aug[i][j];
      }
    }
  }

  return aug.map((row) => row.slice(n));
};

const trainLinearRegression = (data, features, targetKey) => {
  const X = data.map((row) => [1, ...features.map((k) => Number(row[k] ?? 0))]);
  const y = data.map((row) => [Number(row[targetKey] ?? 0)]);

  const Xt = transpose(X);
  const XtX = multiply(Xt, X);
  const XtXInv = invert(XtX);
  if (!XtXInv) return null;
  const XtY = multiply(Xt, y);
  const weights = multiply(XtXInv, XtY);
  return weights.map((row) => row[0]);
};

const predict = (weights, features) => {
  if (!weights) return 0;
  let result = weights[0] || 0;
  for (let i = 0; i < features.length; i += 1) {
    result += (weights[i + 1] || 0) * features[i];
  }
  return result;
};

const MLPrediction = () => {
  const data = processDataFile.processes;
  const [formData, setFormData] = useState({
    oreGrade: 2.5,
    temperature: 70,
    leachingTime: 8,
    pressure: 2.5,
  });

  const weights = useMemo(() => trainLinearRegression(data, featureKeys, 'recoveryRate'), [data]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  const prediction = useMemo(() => {
    const features = featureKeys.map((k) => Number(formData[k] ?? 0));
    return predict(weights, features);
  }, [formData, weights]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Cpu className="text-blue-400" size={32} />
          ML Recovery Prediction
        </h1>
        <p className="text-slate-400">Simple linear regression trained on the sample dataset</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">Input Features</h2>
          </div>
          <div className="card-body space-y-4">
            {featureKeys.map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {key}
                </label>
                <input
                  type="number"
                  name={key}
                  value={formData[key]}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
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
                {Number.isFinite(prediction) ? `${prediction.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg text-sm text-slate-200">
              <p className="font-semibold text-white mb-2">Model Summary</p>
              <p>This tab uses a tiny linear regression trained on the sample data in the project. It does not affect the rest of the app.</p>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg text-xs text-slate-300">
              <p className="font-semibold text-white mb-2">Weights (for reference)</p>
              <p>{weights ? weights.map((w) => w.toFixed(4)).join(', ') : 'Not available'}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <TrendingUp size={14} />
              Prediction uses features: {featureKeys.join(', ')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLPrediction;
