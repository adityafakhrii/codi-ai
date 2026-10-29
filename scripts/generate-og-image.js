/**
 * Codi AI — OpenGraph & Social Preview Banner Generator
 *
 * Generates high-fidelity 1200x630 and square social preview banners:
 *  - img/og-image.png (1200x630, quantized palette PNG < 200KB for WhatsApp/FB)
 *  - img/og-image.jpg (1200x630, mozjpeg fallback < 100KB)
 *  - img/og-image-square.png (600x600, square preview fallback)
 *
 * Usage:
 *   node scripts/generate-og-image.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const workspaceDir = path.resolve(__dirname, '..');
const sharp = require(path.join(workspaceDir, 'node_modules', 'sharp'));
const tempDir = process.env.TEMP || 'C:\\Windows\\Temp';
const rawScreenshotPath = path.join(tempDir, 'og-card-raw.png');
const outputHtmlPath = path.join(tempDir, 'og-card-rendered.html');
const finalOgPngPath = path.resolve(workspaceDir, 'img', 'og-image.png');
const finalOgJpgPath = path.resolve(workspaceDir, 'img', 'og-image.jpg');
const finalOgSquarePath = path.resolve(workspaceDir, 'img', 'og-image-square.png');

console.log('Generating Codi AI OG Images...');

// 1. Read Mascot and Icon as Base64 Data URIs
const mascotHeroBase64 = fs.readFileSync(path.resolve(workspaceDir, 'img', 'mascot-hero-fur.png')).toString('base64');
const icon512Base64 = fs.readFileSync(path.resolve(workspaceDir, 'icons', 'icon-512.png')).toString('base64');

// 2. Generate Self-Contained HTML
const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Codi AI OpenGraph Banner</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      width: 1200px;
      height: 630px;
      overflow: hidden;
      background-color: #0A0A0C;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #FFFFFF;
      display: flex;
      position: relative;
      -webkit-font-smoothing: antialiased;
    }

    /* Ambient Cosmic Violet Horizon Glow & Radial Glow */
    .ambient-bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
      background:
        radial-gradient(circle 540px at 82% 50%, rgba(108, 76, 241, 0.35), transparent 70%),
        radial-gradient(circle 380px at 15% 15%, rgba(108, 76, 241, 0.16), transparent 70%),
        linear-gradient(180deg, #0A0A0C 0%, #111115 100%);
    }

    /* Cosmic Bottom Horizon Line */
    .bottom-horizon-glow {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 10px;
      background: linear-gradient(90deg, transparent 5%, #6C4CF1 35%, #C9B8FF 50%, #6C4CF1 65%, transparent 95%);
      box-shadow: 0 0 40px 10px rgba(108, 76, 241, 0.7);
      z-index: 2;
    }

    /* Top Subtle Border */
    .top-edge-line {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(108, 76, 241, 0.4) 50%, transparent);
      z-index: 2;
    }

    /* Layout Container */
    .card-content {
      position: relative;
      z-index: 10;
      width: 100%;
      height: 100%;
      display: flex;
      padding: 56px 64px 56px 64px;
    }

    /* Left Column: Brand & Copy */
    .left-col {
      flex: 1.18;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding-right: 32px;
    }

    .header-area {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Pill Badge */
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 18px;
      background: rgba(26, 26, 32, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 9999px;
      width: fit-content;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #34D399;
      box-shadow: 0 0 10px rgba(52, 211, 153, 0.9);
    }

    .badge-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13.5px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #C9B8FF;
    }

    /* Brand Logo / Wordmark Header */
    .brand-row {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .brand-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #111114;
      border: 2px solid rgba(108, 76, 241, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(108, 76, 241, 0.45);
      overflow: hidden;
      flex-shrink: 0;
    }

    .brand-icon-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .brand-wordmark {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #FFFFFF;
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .brand-wordmark .accent {
      color: #7D5FFF;
    }

    .brand-wordmark .subtext {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: #8C8C9A;
      text-transform: uppercase;
    }

    /* Main Headlines */
    .title-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 6px;
    }

    .main-title {
      font-size: 42px;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.03em;
      color: #FFFFFF;
    }

    .main-title .highlight {
      background: linear-gradient(135deg, #FFFFFF 30%, #C9B8FF 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .description {
      font-size: 19px;
      font-weight: 500;
      line-height: 1.5;
      color: #A3A3B0;
      max-width: 600px;
    }

    /* Feature Badges Row */
    .features-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }

    .feature-tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 16px;
      background: rgba(26, 26, 32, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      color: #ECECF2;
    }

    .feature-tag svg {
      color: #7D5FFF;
      flex-shrink: 0;
    }

    /* Footer Meta / Domain */
    .bottom-meta {
      display: flex;
      align-items: center;
      gap: 18px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .domain-badge {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      padding: 8px 16px;
      background: rgba(108, 76, 241, 0.16);
      border: 1px solid rgba(108, 76, 241, 0.4);
      border-radius: 9999px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 16px;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: 0.02em;
    }

    .domain-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #7D5FFF;
      box-shadow: 0 0 8px #7D5FFF;
    }

    .target-tag {
      font-size: 14px;
      font-weight: 500;
      color: #8E8E9E;
    }

    /* Right Column: 3D Mascot Showcase */
    .right-col {
      flex: 0.82;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .mascot-stage {
      position: relative;
      width: 440px;
      height: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mascot-halo {
      position: absolute;
      width: 430px;
      height: 430px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(108, 76, 241, 0.45) 0%, rgba(108, 76, 241, 0.12) 55%, transparent 75%);
      filter: blur(30px);
      z-index: 1;
    }

    .mascot-ring {
      position: absolute;
      width: 410px;
      height: 410px;
      border-radius: 50%;
      border: 1.5px dashed rgba(125, 95, 255, 0.35);
      z-index: 2;
    }

    .mascot-frame {
      position: relative;
      z-index: 5;
      width: 370px;
      height: 370px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid rgba(125, 95, 255, 0.55);
      box-shadow: 0 0 45px rgba(108, 76, 241, 0.45), 0 20px 50px rgba(0, 0, 0, 0.85);
      background: #0A0A0C;
    }

    .mascot-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1.08);
      display: block;
    }

    /* Floating Micro-Badge */
    .mascot-floating-chip {
      position: absolute;
      bottom: 18px;
      right: 12px;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 11px 22px;
      background: rgba(17, 17, 24, 0.95);
      border: 1.5px solid rgba(108, 76, 241, 0.55);
      border-radius: 9999px;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.8), 0 0 20px rgba(108, 76, 241, 0.4);
    }

    .chip-mic-icon {
      width: 19px;
      height: 19px;
      color: #7D5FFF;
    }

    .chip-label {
      font-size: 14.5px;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: 0.02em;
    }
  </style>
</head>
<body>
  <div class="ambient-bg"></div>
  <div class="top-edge-line"></div>
  <div class="bottom-horizon-glow"></div>

  <div class="card-content">
    <!-- Left Column: Typography & Content -->
    <div class="left-col">
      <div class="header-area">
        <div class="badge-pill">
          <div class="status-dot"></div>
          <span class="badge-text">Kurikulum Merdeka &bull; Usia 7&ndash;12 Tahun</span>
        </div>

        <div class="brand-row">
          <div class="brand-icon-box">
            <img src="data:image/png;base64,${icon512Base64}" alt="Codi Mascot">
          </div>
          <div class="brand-wordmark">
            CODI<span class="accent">.AI</span>
            <span class="subtext">&bull; Asisten Guru SD</span>
          </div>
        </div>
      </div>

      <div class="title-group">
        <h1 class="main-title">
          Belajar Pintar &amp; Ceria<br>
          <span class="highlight">Bersama Codi AI</span>
        </h1>
        <p class="description">
          Teman belajar pintar Matematika &amp; Pengetahuan Umum berbasis suara (Chat &amp; Speak) khusus anak SD. Ramah, edukatif, dan bebas stres!
        </p>
      </div>

      <div class="features-row">
        <div class="feature-tag">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="22"/>
          </svg>
          <span>Tanya Jawab Suara (Voice)</span>
        </div>

        <div class="feature-tag">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="m4.93 4.93 4.24 4.24"/>
            <path d="m14.83 9.17 4.24-4.24"/>
            <path d="m14.83 14.83 4.24 4.24"/>
            <path d="m9.17 14.83-4.24 4.24"/>
          </svg>
          <span>Matematika Interaktif</span>
        </div>

        <div class="feature-tag">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>100% Edukatif &amp; Aman</span>
        </div>
      </div>

      <div class="bottom-meta">
        <div class="domain-badge">
          <div class="domain-dot"></div>
          <span>codi.ai.id</span>
        </div>
        <span class="target-tag">Asisten Belajar Virtual Terpercaya</span>
      </div>
    </div>

    <!-- Right Column: Mascot Visual -->
    <div class="right-col">
      <div class="mascot-stage">
        <div class="mascot-halo"></div>
        <div class="mascot-ring"></div>
        <div class="mascot-frame">
          <img src="data:image/png;base64,${mascotHeroBase64}" alt="Codi AI Mascot">
        </div>

        <div class="mascot-floating-chip">
          <svg class="chip-mic-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="22"/>
          </svg>
          <span class="chip-label">Voice AI Aktif</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(outputHtmlPath, html, 'utf8');

// 3. Take Headless Screenshot via Chrome
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.join(tempDir, 'chrome-og-profile');
const fileUrl = 'file:///' + outputHtmlPath.replace(/\\/g, '/');

const chromeCmd = `"${chromePath}" --headless=new --disable-gpu --user-data-dir="${userDataDir}" --window-size=1200,630 --hide-scrollbars --screenshot="${rawScreenshotPath}" "${fileUrl}"`;
execSync(chromeCmd, { stdio: 'inherit' });

// 4. Optimize via Sharp to exact 1200x630 and palette compression
async function processImages() {
  await sharp(rawScreenshotPath)
    .resize(1200, 630)
    .png({ palette: true, quality: 95, compressionLevel: 9 })
    .toFile(finalOgPngPath);

  const pngStat = fs.statSync(finalOgPngPath);
  console.log('Final OG PNG:', finalOgPngPath, '(' + (pngStat.size / 1024).toFixed(1) + ' KB)');

  await sharp(rawScreenshotPath)
    .resize(1200, 630)
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(finalOgJpgPath);

  const jpgStat = fs.statSync(finalOgJpgPath);
  console.log('Final OG JPG:', finalOgJpgPath, '(' + (jpgStat.size / 1024).toFixed(1) + ' KB)');

  await sharp(rawScreenshotPath)
    .extract({ left: 300, top: 0, width: 630, height: 630 })
    .resize(600, 600)
    .png({ palette: true, quality: 95, compressionLevel: 9 })
    .toFile(finalOgSquarePath);

  const squareStat = fs.statSync(finalOgSquarePath);
  console.log('Final Square OG PNG:', finalOgSquarePath, '(' + (squareStat.size / 1024).toFixed(1) + ' KB)');
}

processImages().catch(err => {
  console.error('Processing error:', err);
  process.exit(1);
});

