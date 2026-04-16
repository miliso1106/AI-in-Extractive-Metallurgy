import { OPENROUTER_BASE_URL, buildPrompt, extractFirstJsonObject } from './openrouter.shared.js';


const jsonResponse = (res, status, data) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
};


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { error: 'Method not allowed' });
  }

  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterApiKey) {
    return jsonResponse(res, 500, { error: 'OPENROUTER_API_KEY is not set on the server.' });
  }

  const { task, payload } = req.body || {};
  const prompt = buildPrompt(task, payload || {});
  if (!prompt) {
    return jsonResponse(res, 400, { error: 'Invalid task' });
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const upstreamMessage = data?.error?.message || data?.error || 'OpenRouter request failed.';
      return jsonResponse(res, response.status, { error: upstreamMessage });
    }

    const content = data?.choices?.[0]?.message?.content || '';

    if (task === 'dataset_insights') {
      const parsed = extractFirstJsonObject(content);
      if (!parsed || !parsed.columns || !parsed.rows) {
        return jsonResponse(res, 200, { ok: false, raw: content });
      }
      return jsonResponse(res, 200, { ok: true, data: parsed });
    }

    return jsonResponse(res, 200, { ok: true, data: content });
  } catch (error) {
    return jsonResponse(res, 500, { error: error?.message || 'Failed to call AI/ML service.' });
  }
}

