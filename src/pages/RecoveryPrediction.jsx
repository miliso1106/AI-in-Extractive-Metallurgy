import React, { useState } from 'react';
import { predictRecoveryRate } from '../services/openRouterService';
import { Loader, TrendingUp } from 'lucide-react';

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
                <div className="bg-gradient-to-r from-green-900 to-green-800 p-6 rounded-lg border border-green-700">
                  <p className="text-sm text-green-200 mb-2">Predicted Recovery Rate</p>
                  <p className="text-4xl font-bold text-green-300">
                    {(() => {
                      try {
                        const parsed = JSON.parse(prediction);
                        if (parsed.recoveryRate) return `${parsed.recoveryRate}%`;
                      } catch {}
                      const match = prediction.match(/(\d+\.?\d*)\s*%/);
                      return match ? `~${match[1]}%` : 'See analysis';
                    })()}
                  </p>
                </div>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-3">AI Analysis</h3>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">
                    {prediction}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-700 p-3 rounded">
                    <p className="text-slate-400">Confidence Level</p>
                    <p className="text-blue-300 font-semibold">
                      {(() => {
                        try {
                          const parsed = JSON.parse(prediction);
                          if (parsed.confidence) return parsed.confidence;
                        } catch {}
                        return 'See analysis';
                      })()}
                    </p>
                  </div>
                  <div className="bg-slate-700 p-3 rounded">
                    <p className="text-slate-400">Key Factors</p>
                    <p className="text-yellow-300 font-semibold">
                      {(() => {
                        try {
                          const parsed = JSON.parse(prediction);
                          if (parsed.factors) return parsed.factors;
                        } catch {}
                        return 'See analysis';
                      })()}
                    </p>
                  </div>
                </div>
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
