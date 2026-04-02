import axios from 'axios';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

const apiClient = axios.create({
  baseURL: OPENROUTER_BASE_URL,
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'HTTP-Referer': window.location.href,
    'X-Title': 'AI Metallurgy Dashboard',
    'Content-Type': 'application/json',
  },
});

/**
 * Get AI optimization recommendations for a specific metallurgy process
 */
export const getProcessOptimization = async (processData) => {
  try {
    const prompt = `
      You are an expert AI in extractive metallurgy. Analyze the following process data and provide optimization recommendations:
      
      Process Data:
      - Process Type: ${processData.processType}
      - Current Efficiency: ${processData.efficiency}%
      - Temperature: ${processData.temperature} C
      - Pressure: ${processData.pressure} atm
      - Current Issues: ${processData.issues}
      
      Provide:
      1. Specific recommendations to improve efficiency
      2. Expected improvement percentage
      3. Implementation timeline
      4. Risk factors
      
      Format as JSON with keys: recommendations, expectedImprovement, timeline, risks
    `;

    const response = await apiClient.post('/chat/completions', {
      model: 'openrouter/auto',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching process optimization:', error);
    throw error;
  }
};

/**
 * Predict metal recovery rate based on process parameters
 */
export const predictRecoveryRate = async (parameters) => {
  try {
    const prompt = `
      As an AI expert in metal extraction, predict the recovery rate based on these parameters:
      - Ore Grade: ${parameters.oreGrade}%
      - Leaching Time: ${parameters.leachingTime} hours
      - Temperature: ${parameters.temperature} C
      - Chemical Concentration: ${parameters.chemicalConcentration}%
      - pH Level: ${parameters.pH}
      
      Provide a prediction with:
      1. Expected recovery rate (%)
      2. Confidence level
      3. Factors affecting the prediction
      
      Format as JSON with keys: recoveryRate, confidence, factors
    `;

    const response = await apiClient.post('/chat/completions', {
      model: 'openrouter/auto',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error predicting recovery rate:', error);
    throw error;
  }
};

/**
 * Analyze environmental impact and suggest improvements
 */
export const analyzeEnvironmentalImpact = async (processMetrics) => {
  try {
    const prompt = `
      Analyze the environmental impact of this metallurgical process:
      - Waste Generation: ${processMetrics.wasteGeneration} tons/day
      - Water Usage: ${processMetrics.waterUsage} m3/day
      - Energy Consumption: ${processMetrics.energyConsumption} MWh/day
      - Emissions: ${processMetrics.emissions} kg CO2/day
      
      Provide:
      1. Environmental impact assessment
      2. Sustainability recommendations
      3. Cost-benefit analysis of improvements
      
      Format as JSON with keys: impact, recommendations, costBenefit
    `;

    const response = await apiClient.post('/chat/completions', {
      model: 'openrouter/auto',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing environmental impact:', error);
    throw error;
  }
};

/**
 * Analyze a dataset and return a compact insights table
 */
export const analyzeDatasetInsights = async ({ focus, columns, rows }) => {
  try {
    const prompt = `
      You are an expert AI in extractive metallurgy. Analyze the dataset sample below and produce a concise insights table.

      Focus question (if any): ${focus || 'General process optimization and byproduct recovery.'}

      Dataset sample (JSON):
      ${JSON.stringify({ columns, rows }, null, 2)}

      Return JSON with:
      - columns: array of column names for the insights table
      - rows: array of rows (each row is an array of values)

      The table should highlight:
      1) Process or group
      2) Key issue or opportunity
      3) Suggested action
      4) Expected efficiency gain (% or range)
      5) Notes (short)

      Keep 5-8 rows maximum. Avoid extra text outside JSON.
    `;

    const response = await apiClient.post('/chat/completions', {
      model: 'openrouter/auto',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing dataset insights:', error);
    throw error;
  }
};

/**
 * Answer a general metallurgy question (non-table, explanatory)
 */
export const askMetallurgyQuestion = async (question) => {
  try {
    const prompt = `
      You are an expert in extractive metallurgy. Answer the user's question clearly and concisely.

      Question: ${question}

      Keep the response in plain text. Avoid JSON.
    `;

    const response = await apiClient.post('/chat/completions', {
      model: 'openrouter/auto',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error answering metallurgy question:', error);
    throw error;
  }
};

export default apiClient;



