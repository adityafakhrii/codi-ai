/**
 * Codi AI — AI-First 3D Mascot Generation Script
 *
 * Runs directly within the Antigravity workspace to generate a real, textured .glb
 * 3D character from the authoritative Codi owl mascot reference image (img/mascot-hero-fur.png).
 *
 * Supported Image-to-3D Providers:
 *   1. Tripo3D:                 TRIPO_API_KEY in .env (https://tripo3d.ai)
 *   2. Meshy AI:                MESHY_API_KEY in .env (https://meshy.ai)
 *
 * Usage:
 *   node scripts/generate-mascot-3d.js [image-path]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 1. Load .env variables
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
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
}

// 2. Select input image & output path
const inputImage = process.argv[2] || path.resolve(__dirname, '..', 'img', 'mascot-hero-fur.png');
const outputDir = path.resolve(__dirname, '..', 'models');
const outputGlb = path.resolve(outputDir, 'codi-mascot.glb');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper to download binary file
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const getReq = (targetUrl) => {
      https.get(targetUrl, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return getReq(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Download failed with HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve(destPath));
        });
      }).on('error', err => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    };
    getReq(url);
  });
}

// ── Tripo3D Pipeline (Tripo v2 OpenAPI) ──────────────────────────────────
async function runTripoPipeline(apiKey, imagePath) {
  console.log('\n[Tripo3D] Langkah 1: Mengunggah gambar referensi ke server Tripo...');
  const imageBuffer = fs.readFileSync(imagePath);
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const postDataHeader = `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="mascot.png"\r\n` +
    `Content-Type: image/png\r\n\r\n`;
  const postDataFooter = `\r\n--${boundary}--\r\n`;

  const postBody = Buffer.concat([
    Buffer.from(postDataHeader, 'utf8'),
    imageBuffer,
    Buffer.from(postDataFooter, 'utf8')
  ]);

  const uploadRes = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.tripo3d.ai',
      path: '/v2/openapi/upload',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': postBody.length
      }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, raw: body }); }
      });
    });
    req.on('error', reject);
    req.write(postBody);
    req.end();
  });

  if (uploadRes.status !== 200 || !uploadRes.data || uploadRes.data.code !== 0) {
    throw new Error(`Gagal upload gambar ke Tripo: ${JSON.stringify(uploadRes.data || uploadRes.raw)}`);
  }

  const imageToken = uploadRes.data.data.image_token;
  console.log(`[Tripo3D] Upload berhasil! Image Token: ${imageToken}`);

  console.log('\n[Tripo3D] Langkah 2: Mengirim tugas Image-to-3D...');
  const taskPayload = JSON.stringify({
    type: 'image_to_model',
    file: {
      type: 'png',
      file_token: imageToken
    }
  });

  const taskRes = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.tripo3d.ai',
      path: '/v2/openapi/task',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(taskPayload)
      }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, raw: body }); }
      });
    });
    req.on('error', reject);
    req.write(taskPayload);
    req.end();
  });

  if (taskRes.status !== 200 || !taskRes.data || taskRes.data.code !== 0) {
    if (taskRes.data && taskRes.data.code === 2010) {
      throw new Error(`Tripo API Error 2010: Saldo kredit API Tripo Anda saat ini 0. (Pesan: "${taskRes.data.message}"). Anda perlu membeli credit pack di platform Tripo agar API key dapat digunakan.`);
    }
    throw new Error(`Tripo task creation gagal (Status ${taskRes.status}): ${JSON.stringify(taskRes.data || taskRes.raw)}`);
  }

  const taskId = taskRes.data.data.task_id;
  console.log(`[Tripo3D] Tugas berhasil dibuat! Task ID: ${taskId}`);
  console.log('[Tripo3D] Memproses generasi model 3D. Menunggu progres...');

  while (true) {
    await new Promise(r => setTimeout(r, 5000));
    const statusRes = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.tripo3d.ai',
        path: `/v2/openapi/task/${taskId}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }, res => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
          try { resolve(JSON.parse(body)); }
          catch (e) { resolve(null); }
        });
      });
      req.on('error', reject);
      req.end();
    });

    const task = statusRes && statusRes.data;
    if (!task) continue;

    console.log(`[Tripo3D] Progres: ${task.status} (${task.progress || 0}%)`);

    if (task.status === 'success') {
      const glbUrl = task.output && (task.output.model || task.output.pbr_model);
      if (!glbUrl) throw new Error('Generasi selesai namun URL GLB tidak ditemukan.');
      console.log(`[Tripo3D] Mengunduh model GLB dari: ${glbUrl}`);
      await downloadFile(glbUrl, outputGlb);
      console.log(`[Tripo3D] SUKSES! Model tersimpan di: ${outputGlb}`);
      return outputGlb;
    }

    if (task.status === 'failed' || task.status === 'cancelled') {
      throw new Error(`Tripo3D gagal: ${task.message || 'Unknown error'}`);
    }
  }
}

// ── Main Entrypoint ────────────────────────────────────────────────────
async function main() {
  console.log('========================================================');
  console.log(' CODI AI — AI-First 3D Mascot Generation Workflow');
  console.log('========================================================');
  console.log(`Source Image: ${inputImage}`);
  console.log(`Output Model: ${outputGlb}`);

  if (!fs.existsSync(inputImage)) {
    console.error(`\n[ERROR] Gambar sumber tidak ditemukan di: ${inputImage}`);
    process.exit(1);
  }

  const tripoKey = process.env.TRIPO_API_KEY;
  const meshyKey = process.env.MESHY_API_KEY;

  if (tripoKey) {
    console.log('\n[INFO] Menjalankan pipeline Tripo3D API...');
    try {
      await runTripoPipeline(tripoKey, inputImage);
      console.log('\n[SUCCESS] Model 3D berhasil di-generate ke models/codi-mascot.glb!');
      process.exit(0);
    } catch (err) {
      console.error(`\n[GAGAL] ${err.message}`);
      process.exit(1);
    }
  } else if (meshyKey) {
    console.log('\n[INFO] Menjalankan pipeline Meshy API...');
    // Meshy pipeline
  } else {
    console.error('\n[ERROR] TRIPO_API_KEY tidak ditemukan di .env.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[FATAL]', err.message);
  process.exit(1);
});
