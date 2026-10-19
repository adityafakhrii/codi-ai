# Design Specification Document (DESIGN.md)
## Codi AI — Visual System, Interaction Specs & Design Architecture
### *Mobile-First & Progressive Web App (PWA) Design System*

* **Dokumen Versi:** 1.4.0
* **Status:** Final Design Blueprint (Ultra-Minimal Mobile Hero, Frameless Nav, Clean Velvety 3D Mascot)
* **Form Factor Prioritas:** Mobile Smartphone (Viewport 360px – 430px) & Tablet, responsif ke Desktop
* **Referensi Estetika:** Dark-mode Precision, Refined Pill Geometry, Monospace Micro-labels, Single Violet Accent (https://www.agibot.sh/)
* **Hero Headline:** Strictly 1 Single Responsive Line (`clamp`, `white-space: nowrap`)
* **Minimalist Hero Hierarchy:** Subjudul ringkas 2 baris terukur, input email pill ramping, trust counter bersih tanpa bullet gantung, dan penghapusan kartu badge sekunder demi kelegaan visual.
* **Frameless Navigation:** Navbar mengambang transparan tanpa garis batas bawah (`border-bottom: none`), sisi kanan mobile hanya menampilkan teks tautan bersih *"Kontak"*.
* **Clean & Velvety 3D Mascot:** Karakter 3D Three.js tampil murni tanpa cincin orbit yang memotong wajah atau border tebal, menggunakan gradasi vertikal prosedural lembut berlapis dari mahkota lavender bercahaya (`#EAE0FF`) ke violet beludru (`#6C4CF1`) dan bayangan indigo (`#16084C`).
* **Logo Geometry:** Perfectly Circular (`border-radius: 50%`)
* **Footer Horizon:** 1:1 Agibot atmospheric cosmic violet horizon glow and letter-by-letter clipped gradient
* **Kebijakan Ikonografi:** Zero-Emoji Policy — Standar Resmi **Lucide Icons**
* **Aksesibilitas:** WCAG 2.2 Level AA Mobile Compliant

---

## 1. Filosofi Desain: "Mobile Precision Meets Warm Child Empathy"

Desain Codi AI mengadopsi prinsip **Mobile-First Progressive Web App (PWA)** yang memadukan keanggunan antarmuka modern bereputasi tinggi (*near-black dark canvas*, tipografi terukur berskala besar, aksen tunggal *electric violet*) dengan kehangatan ramah anak (*tactile pill buttons, organic 3D mascot, micro-expressions, haptic feedback*).

1. **Teks Hero Utama 1 Baris & Subjudul Ringkas:** Judul utama *"Belajar Pintar [Logo Bulet] Bersama Codi"* terformat tepat 1 baris. Subjudul disederhanakan menjadi 2 baris bersih agar ruang pandang ponsel lega dan tidak terasa menumpuk (*uncluttered*).
2. **Navigasi Minimalis Tanpa Garis:** Header mengambang tanpa garis pembatas (`border-bottom: none`) dengan latar transparan. Pada tampilan ponsel, tombol login disembunyikan sehingga hanya menyisakan teks *"Kontak"* yang rapi.
3. **Karakter 3D yang Menjulang Bersih:** Seluruh chip atau badge mengambang disembunyikan pada layar ponsel dan tablet agar kepala karakter Codi tampil lapang, anggun, dan menjadi fokus utama di separuh bawah layar. Layar visor obsidian hitam dibuat menyatu mulus tanpa bingkai tebal, dan cincin halo dinonaktifkan di ponsel agar tidak memotong wajah.
4. **Gradasi Footer Atmosferik Referensi Agibot:** Latar belakang halaman menyatu dalam hitam pekat (`#000000`), mengalir mulus ke bagian footer yang memiliki gradasi cakrawala planet ungu kosmis berlapis (`radial-gradient` + `linear-gradient`), efek *breathing horizon glow* 6.4s, serta wordmark raksasa `CODI AI` di mana tiap huruf memiliki gradasi kliping vertikal per huruf.
5. **Kebijakan Bebas Emoji (Zero-Emoji Policy):** Tidak ada karakter emoji bawaan OS pada badge, kartu, tombol, maupun teks UI. Seluruh indikator fitur dan akreditasi menggunakan ikon garis SVG (**Lucide Icons**).

---

## 2. Design System & Design Tokens (Mobile-First)

### 2.1 Color Palette & Contrast Tokens

| Token Name | Nilai Hex / HSL | Penggunaan & Rasio Kontras |
|:-----------|:----------------|:---------------------------|
| `--bg-base` | `#0A0A0C` | Latar belakang utama halaman (near-black pekat) |
| `--bg-surface` | `#111114` | Permukaan panel FAQ, kartu modal asisten, dan bottom sheet |
| `--bg-surface-elevated` | `#1A1A20` | Balon chat siswa & state hover/active kartu |
| `--accent-violet` | `#6C4CF1` | Warna aksen utama: tombol mic aktif, pendaran suara, toggle akordeon |
| `--accent-violet-hover` | `#7D5FFF` | State sentuh/hover tombol aksen |
| `--accent-violet-glow` | `rgba(108, 76, 241, 0.35)` | Bayangan glow pendar karakter 3D & dock input |
| `--accent-lavender` | `#C9B8FF` | Gradasi wordmark raksasa penutup, pendar cahaya lembut |
| `--accent-green` | `#34D399` | Dot status "Online" / "Siswa sedang menunggu" (emerald green) |
| `--text-primary` | `#FFFFFF` | Teks judul utama, pertanyaan aktif (Kontras 18.2:1 vs base) |
| `--text-muted` | `#9A9AA2` | Subheadline, jawaban FAQ, teks penjelasan (Kontras 5.8:1 vs base - WCAG AA Pass) |
| `--text-dimmed` | `#60606A` | Micro-labels, baris kedua judul FAQ |
| `--border-subtle` | `rgba(255, 255, 255, 0.12)` | Border 1px pada badge pill melayang, input bar, dan bottom sheet |
| `--border-hairline` | `rgba(255, 255, 255, 0.08)` | Garis pemisah tipis 1px pada daftar pertanyaan FAQ |

```css
/* CSS Root Variables (Mobile-First PWA) */
:root {
  /* Color Palette */
  --bg-base: #0A0A0C;
  --bg-surface: #111114;
  --bg-surface-elevated: #1A1A20;
  --accent-violet: #6C4CF1;
  --accent-violet-hover: #7D5FFF;
  --accent-violet-glow: rgba(108, 76, 241, 0.35);
  --accent-lavender: #C9B8FF;
  --accent-green: #34D399;
  
  --text-primary: #FFFFFF;
  --text-muted: #9A9AA2;
  --text-dimmed: #60606A;
  
  --border-subtle: rgba(255, 255, 255, 0.12);
  --border-hairline: rgba(255, 255, 255, 0.08);

  /* Typography */
  --font-sans: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Space Mono', monospace;
  
  /* Geometry & Radii */
  --radius-pill: 9999px;
  --radius-card: 20px;
  --radius-sheet: 24px 24px 0 0;

  /* Mobile Viewport & Ergonomics */
  --app-height: 100dvh;
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 16px);
  --thumb-dock-height: 80px;
  --min-touch-target: 48px;
}
```

---

### 2.2 Tipografi & Breakpoints Responsif

| Tingkat | Ukuran Mobile (< 768px) | Ukuran Desktop (> 768px) | Weight | Keterangan |
|:---|:---|:---|:---|:---|
| **Display XL** | 42px – 52px | 72px – 88px | 800 (Bold) | Headline Hero Utama |
| **Headline L** | 28px – 32px | 36px – 44px | 700 (Bold) | Judul FAQ & Modal Asisten |
| **Headline M** | 20px – 22px | 24px – 28px | 600 (SemiBold) | Judul Kartu Guru |
| **Body Large** | 16px – 18px | 18px – 20px | 400 (Regular) | Balon Chat Jawaban Codi (jelas di layar HP) |
| **Body Regular** | 14px – 15px | 15px – 16px | 400 (Regular) | Subheadline & Paragraf FAQ |
| **Micro Monospace** | 10px – 11px | 11px – 12px | 500 (Medium) | Eyebrow `FAQ`, `PWA READY`, Copyright |
| **Giant Wordmark** | ~24vw | ~20vw | 900 (Black) | Penutup megah di dasar halaman |

---

### 2.3 Karakter Visual 3D: Codi (Procedural Three.js Specs)

* **Bentuk Fisik:** Bentuk tubuh organik halus bulat-lonjong proporsional (*smooth rounded pear-capsule*), dilapisi material silikon satin violet cerah dengan clearcoat mengilap halus.
* **Mata Ekspresif:** Dua bola mata hitam obsidian berkilau (*glossy dark eyes*) dengan titik pantulan cahaya ganda (*specular dots*) di permukaannya. Berkedip halus dengan interpolasi skala Y setiap 3.2–6.5 detik.
* **Pipi & Senyum:** Pipi merona lembut transparan (`#FF8EC7`) dan garis senyum kurva melengkung ramah.
* **Aksesoris:** Sepasang bantalan headphone (*ear-cups*) bulat menempel pas di sisi kepala, terhubung bando lengkung, dan antena kecil di puncak kepala dengan bola lampu lavender bercahaya.
* **Interaktivitas:** Mengambang lembut di tempat, menoleh halus mengikuti arah kursor/sentuhan jari, dan melonjak gembira saat diklik/disentuh.

---

## 3. Spesifikasi Landing Page Mobile-First (Pre-Login)

```
┌─────────────────────────────────────────┐
│ [Header] (•) CODI AI      [Masuk] (⋯)   │
├─────────────────────────────────────────┤
│                                         │
│ [Hero Mobile]                           │
│           Belajar Pintar                │
│       ✦ [3D Codi Icon] ✦ Bersama Codi   │
│                                         │
│       Asisten guru virtual ramah anak   │
│       untuk matematika & pengetahuan    │
│       umum berbasis suara.              │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ Masukkan email orang tua...     │   │
│   │ [  Daftar Akses Awal ➜  ]       │   │
│   └─────────────────────────────────┘   │
│                                         │
│   (•) 3.420 siswa & guru menunggu       │
│   [Star SVG] Kurikulum Merdeka SD       │
│   [Download SVG] Pasang di Layar HP     │
│                                         │
│      [Mic SVG]          [Math SVG]      │
│              ╭───────────╮              │
│              │  3D CODI  │              │
│              │  MASCOT   │              │
│      [Shield]╰───────────╯[Globe SVG]   │
│            (Cropped by Fold)            │
├─────────────────────────────────────────┤
│ [FAQ Mobile]                            │
│ FAQ                                     │
│ Frequently asked questions              │
│ Anything else? Write to halo@codi.ai    │
│                                         │
│ Q: Untuk kelas berapa Codi AI?      [-] │
│ A: Dirancang untuk kelas 1-6 SD...      │
│ ─────────────────────────────────────── │
│ Q: Bagaimana Codi menjaga aman?     [+] │
│ ─────────────────────────────────────── │
│ Q: Bisa bicara lewat suara di HP?   [+] │
├─────────────────────────────────────────┤
│ [Footer Bersih Sesuai Referensi]        │
│ (•) Codi AI                             │
│ Asisten guru virtual ramah anak         │
│ untuk SD di Indonesia.                  │
│                                         │
│ Daftar Akses Awal   FAQ   Kontak        │
│                                         │
│ © 2026 Codi AI        Pengaturan Cookie │
├─────────────────────────────────────────┤
│           C O D I   A I  (~20vw)        │
│    (Lavender glow rising from bottom)   │
└─────────────────────────────────────────┘
```

### 3.1 Header (Slim Bar)
* Kiri: Maskot mini 3D Codi + wordmark `CODI AI`.
* Kanan: Tombol cepat Google Sign-In *"Masuk"* dan link teks *"Kontak"*.

### 3.2 Hero Section & Zero-Emoji Badges
* Headline besar dengan ikon aplikasi Codi inline: `Belajar Pintar [3D-Icon] Bersama Codi`.
* Unit email input pill melengkung dengan tombol putih *"Daftar Akses Awal"*.
* Trust row dengan titik hijau berdenyut (*pulsing green dot* `#34D399`) + counter live.
* Lencana kurikulum dengan **ikon bintang SVG garis emas**, dan banner PWA dengan **ikon unduh SVG**.
* 4 Lencana Fitur Melayang (*Orbit Badges*) dengan **ikon garis SVG monokromatik**:
  1. `[SVG Mic Line]` — Suara Ramah Anak
  2. `[SVG Triangle Line]` — Guru Matematika Cerdas
  3. `[SVG Shield Check Line]` — 100% Aman & Bebas SARA
  4. `[SVG Globe Line]` — Pengetahuan Umum SD

### 3.3 FAQ Section
* Kolom kiri: Monospace eyebrow `FAQ`, headline dua baris: `Frequently asked` (putih) / `questions` (abu-abu redup), dan email kontak `halo@codi.ai`.
* Kolom kanan: 5 akordeon dipisahkan garis *hairline* 1px dengan tombol toggle bulat ungu.

### 3.4 Footer & Signature Close (Exact Reference Match)
* **Baris Atas:** Logo mark mini + wordmark `Codi AI` dengan tagline 2 baris muted di kiri; 3 teks link navigasi (*Daftar Akses Awal*, *FAQ*, *Kontak*) di kanan. **Tanpa garis batas horizontal bawah.**
* **Baris Bawah:** Spasi lega ke bawah; teks monospace `© 2026 Codi AI` di kiri dan `Pengaturan Cookie` di kanan.
* **Signature Close:** Wordmark kapital raksasa **`CODI AI`** (~20vw) bergradasi lavender pucat di atas **pendaran cahaya radial ungu (*purple radial glow*)** yang memancar dari dasar viewport ke atas.

---

## 4. Audit & Kepatuhan WCAG 2.2 Level AA Mobile

* **Zero-Emoji Policy:** Memastikan screen reader membaca ikon dengan tepat melalui atribut `aria-hidden="true"` pada ikon dekoratif dan teks deskriptif yang bersih tanpa artefak emoji.
* **Target Sentuh Minimum:** 48 × 48px untuk tombol navigasi, 64 × 64px untuk tombol mikrofon.
* **Kontras Warna Tinggi:** 18.2:1 untuk judul utama dan 5.8:1 untuk teks pendukung.
* **Pencegahan Pergeseran Layout:** Menggunakan unit `100dvh` dan safe-area insets.
