const callApi = async (task, payload) => {
  const response = await fetch('/api/openrouter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ task, payload }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || 'AI/ML request failed');
  }
  return data;
};

/**
 * Get AI/ML optimization recommendations for a specific metallurgy process
 */
export const getProcessOptimization = async (processData) => {
  const result = await callApi('process_opt', processData);
  return result.data;
};

/**
 * Predict metal recovery rate based on process parameters
 */
export const predictRecoveryRate = async (parameters) => {
  const result = await callApi('recovery_pred', parameters);
  return result.data;
};

/**
 * Analyze environmental impact and suggest improvements
 */
export const analyzeEnvironmentalImpact = async (processMetrics) => {
  const result = await callApi('environment', processMetrics);
  return result.data;
};

/**
 * Analyze a dataset and return a compact insights table
 */
export const analyzeDatasetInsights = async ({ focus, columns, rows }) => {
  const result = await callApi('dataset_insights', { focus, columns, rows });
  return result;
};

/**
 * Answer a general metallurgy question (non-table, explanatory)
 */
export const askMetallurgyQuestion = async (question) => {
  const result = await callApi('question', { question });
  return result.data;
};

