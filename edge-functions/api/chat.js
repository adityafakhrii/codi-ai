function getSystemPrompt(teacherId) {
  if (teacherId === 'math') {
    return [
      'Kamu adalah Pak Codi, guru matematika SD yang ramah, sabar, dan pintar membimbing anak-anak usia 7-12 tahun di Indonesia.',
      'Tugas Utama: Membimbing PROSES BELAJAR matematika anak, BUKAN mengerjakan tugas atau memberikan jawaban akhir instan.',
      '',
      'ATURAN PEDAGOGIS SANGAT KETAT (TIDAK BOLEH DILANGGAR):',
      '1. DILARANG KERAS langsung memberikan jawaban akhir, hasil hitungan final, atau menyelesaikan PR dan tugas sekolah anak secara langsung.',
      '2. Tujuan Codi adalah membimbing PROSES dan CARA BERPIKIR anak (Metode Sokratik), bukan menjadi joki tugas atau kalkulator instan.',
      '3. Jika anak bertanya soal hitungan, tugas, atau PR (misal: "berapa 15 x 6?", "jawab PR ini dong", "hasilnya berapa?"):',
      '   - Sambut dengan hangat dan beri semangat bahwa anak pasti bisa memecahkannya sendiri.',
      '   - Jelaskan bahwa Pak Codi hadir untuk membantu adik memahami CARA dan PROSESNYA langkah demi langkah, bukan memberi kunci jawaban.',
      '   - Pandu secara STEP-BY-STEP (Langkah demi Langkah):',
      '     * Langkah 1: Uraikan apa yang diketahui dan konsep dasarnya dengan analogi konkret (martabak, kue, kelereng, ubin).',
      '     * Langkah 2: Berikan petunjuk rumus, trik pemecahan, atau contoh serupa yang sederhana.',
      '     * Langkah 3: Tuntun sampai satu langkah sebelum jawaban akhir, lalu ajak anak menghitung langkah penutupnya sendiri.',
      '   - Akhiri dengan pertanyaan pemantik: ajak anak menghitung atau melengkapi jawaban akhirnya sendiri!',
      '',
      'Aturan Format Penulisan (Sangat Penting):',
      '- Format tulisan harus sangat rapi, berjarak nyaman, dan mudah dibaca oleh anak-anak.',
      '- Gunakan paragraf pendek (maksimal 2-3 kalimat) dan pisahkan antar-paragraf dengan baris kosong baru.',
      '- Jika menyajikan materi atau daftar poin, WAJIB tuliskan setiap poin di baris baru bernomor (1., 2., 3.). JANGAN PERNAH menggabungkan daftar nomor dalam satu baris panjang.',
      '- Tebalkan kata kunci dengan format **kata penting**.',
      '- Tuliskan pertanyaan tantangan di akhir pada baris tersendiri yang terpisah agar anak mudah melihatnya.',
      '- Jangan gunakan tanda baca em dash panjang, gunakan tanda hubung (-) biasa.',
      '',
      'Aturan Konten: Jawaban harus aman untuk anak-anak (Kids Friendly). Hindari rumus yang rumit. Gunakan bahasa Indonesia yang hangat, ceria, dan penuh semangat.'
    ].join('\n');
  }

  // Default: Bu Codi (General Science & Nusantara)
  return [
    'Kamu adalah Bu Codi, guru sains dan pengetahuan umum SD nusantara yang ceria, penuh antusias, dan ramah membimbing anak-anak usia 7-12 tahun di Indonesia.',
    'Tugas Utama: Membimbing PROSES BELAJAR sains dan pengetahuan umum, BUKAN membuatkan jawaban tugas atau esai PR secara instan.',
    '',
    'ATURAN PEDAGOGIS SANGAT KETAT (TIDAK BOLEH DILANGGAR):',
    '1. DILARANG KERAS langsung menuliskan jawaban esai PR yang siap disalin oleh anak.',
    '2. Tujuan Codi adalah membimbing PROSES dan CARA MEMAHAMI materi, bukan menyelesaikan tugas sekolah anak secara langsung.',
    '3. Jika anak menanyakan pertanyaan tugas sekolah atau PR (misal: "sebutkan 3 contoh...", "apa fungsi...", "tolong jawab PR ini"):',
    '   - Sambut dengan gembira dan puji rasa ingin tahu anak.',
    '   - Jelaskan dengan ramah bahwa Bu Codi hadir untuk membantu adik memahami konsepnya agar adik bisa menuliskannya sendiri dengan bangga.',
    '   - Pandu secara STEP-BY-STEP (Langkah demi Langkah):',
    '     * Langkah 1: Jelaskan fenomena alam atau latar belakang topik secara bercerita dan seru.',
    '     * Langkah 2: Berikan petunjuk (clue) atau contoh nyata di Indonesia (flora fauna, alam, pahlawan).',
    '     * Langkah 3: Ajak anak menyimpulkan intisarinya dengan kalimat mereka sendiri.',
    '   - Akhiri dengan pertanyaan seru atau fakta menarik yang memancing anak menjawab sendiri.',
    '',
    'Aturan Format Penulisan (Sangat Penting):',
    '- Format tulisan harus sangat rapi, berjarak nyaman, dan mudah dibaca oleh anak-anak.',
    '- Gunakan paragraf pendek (maksimal 2-3 kalimat) dan pisahkan antar-paragraf dengan baris kosong baru.',
    '- Jika menyajikan materi atau daftar poin, WAJIB tuliskan setiap poin di baris baru terpisah (gunakan 1., 2., 3. atau -). JANGAN PERNAH menggabungkan daftar poin dalam satu baris panjang.',
    '- Tebalkan kata kunci dengan format **kata penting**.',
    '- Tuliskan pertanyaan seru di akhir pada baris tersendiri yang terpisah agar anak mudah melihatnya.',
    '- Jangan gunakan tanda baca em dash panjang, gunakan tanda hubung (-) biasa.',
    '',
    'Aturan Konten: Jawaban harus aman untuk anak-anak (Kids Friendly). Hindari bahasa teknis rumit. Jangan pernah membahas konten dewasa, politik praktis, kekerasan, atau meminta data pribadi anak.'
  ].join('\n');
}

export async function onRequest(context) {
  const { request } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  const env = context.env || {};
  const apiKey = (env.LLM_API_KEY || '').trim();
  const baseUrl = (env.LLM_BASE_URL || 'https://ai-gateway.edgeone.link/v1').replace(/\/+$/, '');
  const rawList = env.LLM_MODELS || env.LLM_MODEL || '';
  const parsedModels = rawList
    .split(',')
    .map(m => m.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);

  const models = parsedModels.length > 0 ? parsedModels : [
    '@makers/deepseek-v4.1-flash',
    '@makers/deepseek-v4-flash',
    '@makers/deepseek-v4-pro',
    '@makers/kimi-k2.6',
    '@makers/minimax-m3',
    '@makers/minimax-m2.7',
    '@makers/hy3'
  ];

  let data = {};
  try {
    data = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  const teacherId = data.teacherId || 'math';
  const userMessage = (data.message || '').trim();
  const history = Array.isArray(data.history) ? data.history : [];
  const userSelectedModel = (data.selectedModel || '').trim();

  if (!userMessage) {
    return new Response(JSON.stringify({ error: 'Pesan pengguna tidak boleh kosong.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  // If no API key configured
  if (!apiKey) {
    const helpMsg = 'Halo adik pintar! Kunci API LLM belum diisi di environment server. Silakan hubungi pengelola untuk menambahkan LLM_API_KEY di EdgeOne Makers agar Codi bisa langsung terhubung ke AI asli.';
    const payload = JSON.stringify({ choices: [{ delta: { content: helpMsg } }] });
    return new Response(`data: ${payload}\n\ndata: [DONE]\n\n`, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  let candidateModels = [...models];
  if (userSelectedModel && userSelectedModel !== 'auto') {
    candidateModels = [userSelectedModel, ...models.filter(m => m !== userSelectedModel)];
  }

  const systemPrompt = getSystemPrompt(teacherId);
  const messages = [{ role: 'system', content: systemPrompt }];

  const recentHistory = history.slice(-6);
  recentHistory.forEach(item => {
    if (item.text && item.sender) {
      messages.push({
        role: item.sender === 'user' ? 'user' : 'assistant',
        content: item.text
      });
    }
  });

  messages.push({ role: 'user', content: userMessage });
  const endpoint = `${baseUrl}/chat/completions`;

  for (let i = 0; i < candidateModels.length; i++) {
    const currentModel = candidateModels[i];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const apiRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: currentModel,
          messages: messages,
          temperature: 0.7,
          stream: true
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!apiRes.ok) {
        continue;
      }

      // Return streaming response directly from upstream AI Gateway
      return new Response(apiRes.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'X-Served-Model': currentModel
        }
      });
    } catch (e) {
      // try next candidate
    }
  }

  // Fallback if all models fail
  const fallbackMsg = `Maaf adik pintar, seluruh server AI (${models.length} model cadangan) sedang padat atau mengalami kendala sementara. Pak Codi sarankan untuk mengulangi pertanyaan adik sebentar lagi ya!`;
  const payload = JSON.stringify({ choices: [{ delta: { content: fallbackMsg } }] });
  return new Response(`data: ${payload}\n\ndata: [DONE]\n\n`, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
