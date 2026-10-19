const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// 1. Load environment variables from .env with automatic file watching
const envPath = path.join(__dirname, '.env');

function loadEnv() {
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            process.env[key] = val;
          }
        }
      });
      console.log('Berkas .env berhasil dimuat.');
    } catch (err) {
      console.warn('Peringatan saat membaca .env:', err.message);
    }
  }
}

loadEnv();

// Watch .env for changes asynchronously without blocking HTTP requests (server-hoist-static-io)
if (fs.existsSync(envPath)) {
  try {
    fs.watch(envPath, (eventType) => {
      if (eventType === 'change') {
        console.log('Perubahan pada .env terdeteksi, memuat ulang konfigurasi...');
        loadEnv();
      }
    });
  } catch (watchErr) {
    console.warn('Tidak dapat memasang watcher pada .env:', watchErr.message);
  }
}

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// High-performance In-Memory Static File Compression Cache (server-cache-lru)
const COMPRESSION_CACHE = new Map();
const MAX_CACHE_ENTRIES = 60;

// Pedagogical System Prompts for Elementary Students (Ages 7-12)
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

// Read JSON Body Helper with high-performance buffer accumulation
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalLength = 0;
    req.on('data', chunk => {
      chunks.push(chunk);
      totalLength += chunk.length;
      if (totalLength > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Helper to parse configured models (supports comma-separated list for auto-failover)
function getConfiguredModels() {
  const rawList = process.env.LLM_MODELS || process.env.LLM_MODEL || '';
  const parsed = rawList
    .split(',')
    .map(m => m.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);

  if (parsed.length === 0) {
    return ['@makers/deepseek-v4.1-flash'];
  }
  return parsed;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Endpoint 1: Status LLM Configuration
  if (req.method === 'GET' && pathname === '/api/status') {
    const isConfigured = Boolean(process.env.LLM_API_KEY && process.env.LLM_API_KEY.trim().length > 0);
    const models = getConfiguredModels();

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      configured: isConfigured,
      models: models,
      activeModel: models[0],
      totalModels: models.length,
      baseUrl: process.env.LLM_BASE_URL || 'https://api.openai.com/v1'
    }));
    return;
  }

  // Endpoint 2: Real LLM Chat Stream with Multi-Model Automatic Failover
  if (req.method === 'POST' && pathname === '/api/chat') {
    const apiKey = (process.env.LLM_API_KEY || '').trim();
    const baseUrl = (process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const models = getConfiguredModels();

    try {
      const data = await readJsonBody(req);
      const teacherId = data.teacherId || 'math';
      const userMessage = (data.message || '').trim();
      const history = Array.isArray(data.history) ? data.history : [];
      const userSelectedModel = (data.selectedModel || '').trim();

      if (!userMessage) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Pesan pengguna tidak boleh kosong.' }));
        return;
      }

      // Check if LLM API key is present
      if (!apiKey) {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });

        const helpMsg = `Halo adik pintar! Kunci API LLM belum diisi di berkas .env pada komputer ini. Silakan masukkan LLM_API_KEY di file .env agar Codi bisa langsung terhubung ke AI asli. Sambil menunggu, Pak Codi dan Bu Codi tetap siap menjawab pertanyaan dasar dengan ceria!`;
        const payload = JSON.stringify({
          choices: [{ delta: { content: helpMsg } }]
        });
        res.write(`data: ${payload}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      // Susun urutan model kandidat: jika user memilih model tertentu, jadikan prioritas pertama
      let candidateModels = [...models];
      if (userSelectedModel && userSelectedModel !== 'auto') {
        candidateModels = [userSelectedModel, ...models.filter(m => m !== userSelectedModel)];
      }

      // Construct Messages Array with Pedagogical System Prompt
      const systemPrompt = getSystemPrompt(teacherId);
      const messages = [
        { role: 'system', content: systemPrompt }
      ];

      // Add recent history context (last 6 exchanges to maintain context without token bloat)
      const recentHistory = history.slice(-6);
      recentHistory.forEach(item => {
        if (item.text && item.sender) {
          messages.push({
            role: item.sender === 'user' ? 'user' : 'assistant',
            content: item.text
          });
        }
      });

      // Add latest user message
      messages.push({
        role: 'user',
        content: userMessage
      });

      const endpoint = `${baseUrl}/chat/completions`;
      let streamDispatched = false;
      const failedAttempts = [];

      // Multi-Model Fallback Loop: coba berurutan sampai menemukan model yang sukses
      for (let i = 0; i < candidateModels.length; i++) {
        const currentModel = candidateModels[i];
        console.log(`[LLM] Mencoba model (${i + 1}/${candidateModels.length}): ${currentModel}...`);

        try {
          const controller = new AbortController();
          // Failover agresif: 9 detik jika masih ada model cadangan lain, 20 detik jika model terakhir
          const timeoutMs = (i < candidateModels.length - 1) ? 9000 : 20000;
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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
            const errBody = await apiRes.text().catch(() => '');
            console.warn(`[LLM Failover] Model ${currentModel} mengembalikan status ${apiRes.status}: ${errBody.slice(0, 100)}`);
            failedAttempts.push({ model: currentModel, status: apiRes.status });
            // Langsung lanjut ke model cadangan berikutnya
            continue;
          }

          // Model berhasil! Stream respons SSE ke browser klien
          console.log(`[LLM Sukses] Berhasil terhubung ke model: ${currentModel}`);
          res.writeHead(200, {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Served-Model': currentModel
          });

          for await (const chunk of apiRes.body) {
            res.write(chunk);
          }
          res.end();
          streamDispatched = true;
          break; // Berhenti karena respons telah berhasil dialirkan
        } catch (callErr) {
          console.warn(`[LLM Failover] Kendala koneksi/timeout pada model ${currentModel}: ${callErr.message}`);
          failedAttempts.push({ model: currentModel, error: callErr.message });
          // Lanjut mencoba model berikutnya
        }
      }

      // Jika seluruh model cadangan gagal dihubungi
      if (!streamDispatched) {
        console.error('[LLM Error] Semua model cadangan gagal merespons:', failedAttempts);
        res.writeHead(200, {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });

        const fallbackMsg = `Maaf adik pintar, seluruh server AI (${models.length} model cadangan) sedang padat atau mengalami kendala teknis sementara. Pak Codi sarankan untuk mengulangi pertanyaan adik sebentar lagi ya!`;
        const payload = JSON.stringify({
          choices: [{ delta: { content: fallbackMsg } }]
        });
        res.write(`data: ${payload}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }

    } catch (err) {
      console.error('Chat endpoint error:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
      }
    }
    return;
  }

  // 3. Static File Serving with Compression & Caching Headers
  let reqPath = decodeURI(pathname);
  if (reqPath === '/') {
    reqPath = '/index.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const etag = `W/"${stats.size.toString(16)}-${stats.mtime.getTime().toString(16)}"`;

    // 304 Not Modified validation
    const clientEtag = req.headers['if-none-match'];
    if (clientEtag && clientEtag === etag) {
      res.writeHead(304, { 'ETag': etag });
      res.end();
      return;
    }

    const headers = {
      'Content-Type': contentType,
      'ETag': etag
    };

    if (reqPath === '/sw.js') {
      headers['Service-Worker-Allowed'] = '/';
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    } else if (reqPath === '/index.html') {
      // HTML is fast-cached with revalidation
      headers['Cache-Control'] = 'no-cache';
    } else if (reqPath.startsWith('/js/vendor/') || ext === '.woff2' || ext === '.woff' || ext === '.svg' || ext === '.png' || ext === '.jpg') {
      // Static assets cached for 1 year
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else {
      // Application CSS & JS cached with stale-while-revalidate
      headers['Cache-Control'] = 'public, max-age=86400, stale-while-revalidate=604800';
    }

    const acceptEncoding = req.headers['accept-encoding'] || '';
    const compressible = ['.html', '.css', '.js', '.json', '.svg'].includes(ext);

    let encoding = null;
    if (compressible) {
      if (/\bbr\b/.test(acceptEncoding) && typeof zlib.brotliCompress === 'function') {
        encoding = 'br';
      } else if (/\bgzip\b/.test(acceptEncoding)) {
        encoding = 'gzip';
      }
    }

    if (encoding) {
      const cacheKey = `${filePath}:${encoding}`;
      const cached = COMPRESSION_CACHE.get(cacheKey);

      if (cached && cached.mtime === stats.mtimeMs) {
        headers['Content-Encoding'] = encoding;
        headers['Content-Length'] = cached.buffer.length;
        res.writeHead(200, headers);
        res.end(cached.buffer);
        return;
      }

      // Read file and compress to cache
      fs.readFile(filePath, (readErr, rawBuffer) => {
        if (readErr) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('500 Internal Server Error');
          return;
        }

        const compressFn = encoding === 'br' ? zlib.brotliCompress : zlib.gzip;
        compressFn(rawBuffer, (compErr, compressedBuffer) => {
          if (compErr) {
            // Fallback uncompressed
            res.writeHead(200, headers);
            res.end(rawBuffer);
            return;
          }

          if (COMPRESSION_CACHE.size >= MAX_CACHE_ENTRIES) {
            const firstKey = COMPRESSION_CACHE.keys().next().value;
            COMPRESSION_CACHE.delete(firstKey);
          }
          COMPRESSION_CACHE.set(cacheKey, {
            buffer: compressedBuffer,
            mtime: stats.mtimeMs
          });

          headers['Content-Encoding'] = encoding;
          headers['Content-Length'] = compressedBuffer.length;
          res.writeHead(200, headers);
          res.end(compressedBuffer);
        });
      });
    } else {
      res.writeHead(200, headers);
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

server.listen(PORT, () => {
  const models = getConfiguredModels();
  console.log(`Codi AI Web Server is running at http://localhost:${PORT}`);
  console.log(`LLM Models (${models.length} model aktif/cadangan): ${models.join(', ')}`);
  console.log(`LLM Base URL: ${process.env.LLM_BASE_URL || 'https://api.openai.com/v1'}`);
  console.log(`LLM API Key: ${process.env.LLM_API_KEY ? 'Tersedia [OK]' : 'Belum diisi di .env'}`);
});

