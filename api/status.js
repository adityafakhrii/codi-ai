export const config = {
  runtime: 'edge'
};

export default async function handler(requestOrContext, possibleContext) {
  let request = requestOrContext;
  let env = (typeof process !== 'undefined' && process.env) ? process.env : {};

  if (requestOrContext && requestOrContext.request) {
    request = requestOrContext.request;
    if (requestOrContext.env) {
      env = { ...env, ...requestOrContext.env };
    }
  } else if (possibleContext && possibleContext.env) {
    env = { ...env, ...possibleContext.env };
  }

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

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

  return new Response(JSON.stringify({
    configured: Boolean(apiKey && apiKey.length > 0),
    models: finalModels,
    activeModel: finalModels[0],
    totalModels: finalModels.length
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache'
    }
  });
}

export { handler as onRequest };
