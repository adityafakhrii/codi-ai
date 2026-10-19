export async function onRequest(context) {
  const env = context.env || {};
  const apiKey = (env.LLM_API_KEY || '').trim();
  const rawList = env.LLM_MODELS || env.LLM_MODEL || '';
  const models = rawList
    .split(',')
    .map(m => m.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);

  const finalModels = models.length > 0 ? models : [
    '@makers/deepseek-v4.1-flash',
    '@makers/deepseek-v4-flash',
    '@makers/deepseek-v4-pro',
    '@makers/kimi-k2.6',
    '@makers/minimax-m3',
    '@makers/minimax-m2.7',
    '@makers/hy3'
  ];

  const baseUrl = env.LLM_BASE_URL || 'https://ai-gateway.edgeone.link/v1';

  return new Response(JSON.stringify({
    configured: Boolean(apiKey && apiKey.length > 0),
    models: finalModels,
    activeModel: finalModels[0],
    totalModels: finalModels.length,
    baseUrl: baseUrl
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-cache'
    }
  });
}
