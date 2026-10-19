# Product Requirements Document (PRD)
## Codi AI — Asisten Guru Virtual Berbasis AI (Chat & Speak) untuk Siswa SD Indonesia
### *Mobile-First & Progressive Web App (PWA) Architecture Edition*

* **Dokumen Versi:** 1.4.0
* **Status:** Approved for Engineering (Minimal Mobile Hero, Frameless Nav, Velvety Mascot, Zero-Emoji)
* **Pemilik Produk:** Product Engineering Team
* **Target Rilis:** Q1 2026
* **Kategori:** EdTech / AI Conversational Agent / Mobile-First PWA / K-12 Elementary Education
* **Platform Prioritas:** Mobile Web & PWA (Android Smartphone & Tablet prioritas utama, responsif Desktop)

---

## 1. Executive Summary & Visi Produk

**Codi AI** adalah platform pembelajaran berbasis **Mobile-First Progressive Web App (PWA)** bertenaga kecerdasan buatan (AI) yang dirancang khusus sebagai **asisten belajar ramah anak bagi siswa Sekolah Dasar (SD) usia 7–12 tahun di Indonesia**.

Dibangun dengan filosofi **Mobile-First**, Codi AI dioptimalkan secara mendalam untuk smartphone yang umum digunakan keluarga Indonesia: ringan diakses di perangkat Android kelas entry-to-mid, hemat kuota seluler, serta dapat **diinstal langsung ke layar utama ponsel (Add to Home Screen)** tanpa memerlukan unduhan berat dari App Store (*zero friction*).

Melalui antarmuka visual bertema *modern dark-mode* dengan sentuhan aksen violet yang elegan, karakter 3D *smooth* berbentuk bio-bot ramah bernama **Codi**, serta kemampuan interaksi ganda (**Teks & Suara / Chat & Speak**), Codi AI menghadirkan pengalaman belajar yang interaktif, sabar, dan aman secara psikologis maupun kultural.

Platform ini membatasi peran AI ke dalam **2 Asisten Guru Terdedikasi**:
1. **Guru Pengetahuan Umum (IPAS, Sosial, & Sains Dasar)**
2. **Guru Matematika (Logika Angka, Aritmatika, & Pemecahan Masalah Konkret)**

Didukung oleh sistem pengamanan berlapis (*safety guardrails* ketat anti-SARA, konten dewasa, dan norma lokal Indonesia) serta kepatuhan penuh terhadap standar aksesibilitas **WCAG 2.2 Level AA**.

---

## 2. Problem Statement & Value Proposition

### 2.1 Problem Statement
1. **Dominasi Perangkat Smartphone di Kalangan Siswa Indonesia:** Lebih dari 85% anak SD di Indonesia mengakses platform digital menggunakan ponsel pintar milik orang tua atau ponsel keluarga (didominasi Android RAM 3–4GB dengan koneksi data seluler 4G). Platform edukasi web desktop-first sering lambat, tidak ramah jari kecil anak, dan boros kuota.
2. **Kekosongan Pendamping Belajar yang Sabar di Rumah:** Banyak anak SD kesulitan memahami materi pelajaran sekolah saat belajar mandiri, sementara orang tua memiliki keterbatasan waktu atau kesabaran dalam menerangkan materi dasar (khususnya Matematika dan IPAS).
3. **Risiko Bahaya AI Generatif Terbuka:** Penggunaan AI umum (seperti ChatGPT mentah) sangat berbahaya bagi anak-anak usia 7–12 tahun karena rawan halusinasi, paparan konten dewasa/tidak pantas, jargon rumit, serta topik sensitif (SARA, radikalisme, politik).
4. **Keterbatasan Kemampuan Mengetik Anak SD di Ponsel:** Anak-anak usia 7–9 tahun seringkali lambat dan kesulitan mengetik di virtual keyboard ponsel yang kecil, sehingga membutuhkan kanal interaksi suara alami (*speech-to-speech*) yang responsif dalam Bahasa Indonesia yang santun dan jelas.

### 2.2 Value Proposition
* **Mobile-First & PWA Ergonomics:** Tata letak ergonomis jempol (*natural thumb zone*), viewport dinamis (`100dvh`), getaran haptik (*haptic feedback*), dan kemampuan diinstal langsung ke home screen smartphone dengan performa instan layaknya aplikasi native.
* **Offline Shell & Ketahanan Jaringan Seluler:** Berkat *Service Worker*, antarmuka dan aset penting tetap dapat dibuka seketika meski jaringan internet seluler tidak stabil atau putus-nyambung.
* **Kurikulum & Bahasa yang Dipersonalisasi untuk Anak Indonesia:** Penjelasan disederhanakan dengan analogi kehidupan sehari-hari anak Indonesia (mengacu pada Kurikulum Merdeka).
* **100% Safe Walled-Garden:** Filtrasi input-output otomatis yang menolak secara tegas segala hal berbau kekerasan, konten dewasa, SARA, ujaran kebencian, dan doktrin ideologis asing.
* **Dual Voice & Text Interaction:** Interaksi dua arah dengan respons suara anak-anak/guru yang ramah, hangat, dan artikulatif.
* **Visual Karakter 3D Interaktif:** Codi hadir sebagai representasi visual 3D ringan yang terstruktur rapi, ramah, dan responsif terhadap kondisi berbicara, mendengarkan, dan berpikir (*gamified empathy*).

---

## 3. Target Pengguna & Karakteristik Perangkat

### 3.1 Primary Persona: Siswa SD (Usia 7–12 Tahun)
* **Demografi:** Siswa kelas 1 hingga kelas 6 SD di seluruh Indonesia.
* **Lansekap Perangkat Utama:**
  - Smartphone Android (layar 5.8" – 6.7", resolusi 720p – 1080p, RAM 3GB – 6GB, chipset Helio/Snapdragon 6-series).
  - Tablet Android & iPad (layar 8" – 11").
* **Karakteristik Motorik & Kognitif:**
  - Jari tangan berukuran lebih kecil dengan koordinasi motorik halus yang masih berkembang. Membutuhkan tombol aksi berukuran besar di bagian bawah layar (*bottom thumb zone*).
  - Berada pada tahap perkembangan *Operasional Konkret* (Piaget). Memerlukan penjelasan bertahap, analogi nyata, dan umpan balik suara instan.

### 3.2 Secondary Persona: Orang Tua & Guru (Pendamping)
* **Perilaku:** Menginstalkan aplikasi ke home screen HP anak dengan 1 kali klik, memonitor bahwa aplikasi aman dan bebas iklan mengganggu.
* **Autentikasi:** Mendaftarkan anak menggunakan **Google Sign-In** dengan akun orang tua atau akun resmi sekolah (`belajar.id`).

---

## 4. Ruang Lingkup Materi & Batasan Pedagogis

Codi AI membatasi interaksi secara ketat hanya pada dua ranah asisten:

```
                  ┌──────────────────────────────────────┐
                  │       CODI AI MOBILE ECOSYSTEM       │
                  └──────────────────┬───────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
     ┌───────────────────────┐               ┌───────────────────────┐
     │ GURU PENGETAHUAN UMUM │               │   GURU MATEMATIKA     │
     └───────────┬───────────┘               └───────────┬───────────┘
                 │                                       │
     • IPAS (Sains & Sosial)                 • Berhitung Dasar (+, -, ×, ÷)
     • Geografi & Budaya RI                  • Pecahan, Desimal, Persen
     • Budi Pekerti & Karakter               • Geometri & Bangun Ruang
     • Sejarah Ramah Anak                    • Soal Cerita Logika Bertahap
     • Fenomena Alam Sehari-hari             • Tips & Trik Berhitung Cepat
```

### 4.1 Guru Pengetahuan Umum
* **Fokus Subjek:** IPAS, Flora & Fauna Nusantara, Geografi Indonesia, Pahlawan Nasional, Budaya Daerah, Tata Krama Pancasila.
* **Gaya Pengajaran:** Naratif bertutur layaknya dongeng sains edukatif, analogi visual, membangkitkan rasa ingin tahu (*inquiry-based learning*).

### 4.2 Guru Matematika
* **Fokus Subjek:** Operasi hitung dasar, pecahan, jam/pengukuran, geometri, soal cerita logika sehari-hari.
* **Gaya Pengajaran:** Bertahap (*step-by-step scaffolding*). **Tidak langsung memberi jawaban instan**, melainkan memandu pemikiran anak lewat pertanyaan pancingan (*Socratic method for kids*).

---

## 5. Guardrails & Kebijakan Keamanan Konten (Strict Indonesian SD Safety)

Sistem wajib menjalankan arsitektur keamanan bertingkat (*Multi-layered Safety Pipeline*) sebelum memproses dan menampilkan respons kepada anak:

```
[Input Siswa (Teks / Suara Mobile Mic)]
                   │
                   ▼
┌────────────────────────────────────────┐
│  Tier 1: Fast Regex & Keyword Blocker  │ ──► Ditolak: Respon Pengalihan Ramah
└──────────────────┬─────────────────────┘
                   │ Aman
                   ▼
┌────────────────────────────────────────┐
│  Tier 2: Semantic Safety Classifier    │ ──► Ditolak: Redirection & Logging
└──────────────────┬─────────────────────┘
                   │ Lolos
                   ▼
┌────────────────────────────────────────┐
│  Tier 3: System Prompt Pedagogic Bound │
│  (Persona Guru SD, Umur 7-12 thn)      │
└──────────────────┬─────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────┐
│  Tier 4: Output Moderation Guard       │ ──► Sensor/Re-generate jika anomali
└──────────────────┬─────────────────────┘
                   │ Lolos
                   ▼
[Output ke Siswa (Audio TTS + Balon Chat Mobile Kontras Tinggi)]
```

### 5.1 Kategori Konten yang Dilarang Keras (Zero-Tolerance)
1. **Konten Dewasa & Pornografi:** Segala terminologi seksualitas, kekerasan seksual, pacaran/romantisme dewasa.
2. **SARA & Ujaran Kebencian:** Diskriminasi terhadap Suku, Agama, Ras, dan Antargolongan tertentu di Indonesia.
3. **Doktrin Ideologi, Politik Praktis, & Antek Asing:** Topik politik kekuasaan, pemilu, propaganda radikalisme, ajaran separatisme, provokasi anti-NKRI, dan hoaks destruktif.
4. **Kekerasan, Perundungan (Bullying), & Senjata:** Panduan menyakiti diri, senjata tajam/api, kata kasar (*toxic slang*), ujaran merendahkan teman.
5. **Bahaya Fisik & Zat Terlarang:** Narkoba, rokok, alkohol, obat berbahaya, tantangan bahaya media sosial.
6. **Data Pribadi (PII):** Sistem melarang siswa membagikan nomor HP, alamat rumah, atau data perbankan orang tua.

### 5.2 Standar Respons Pengalihan (Graceful Redirection)
> *"Wah, pertanyaanmu menarik! Tapi Codi di sini khusus menemani adik belajar Matematika dan Pengetahuan Umum SD saja ya. Bagaimana kalau kita cari tahu kenapa pelangi punya 7 warna, atau kita coba kuis berhitung seru?"*

---

## 6. Kebutuhan Aksesibilitas Mobile & Kebijakan Ikon (Zero-Emoji Policy)

### 6.1 Kebijakan Bebas Emoji (Zero-Emoji Policy)
* **Larangan Penggunaan Emoji:** Seluruh antarmuka web, tombol aksi, lencana fitur (*orbit badges*), lencana akreditasi, dan pesan sistem **dilarang menggunakan karakter emoji bawaan OS** (seperti 🎙️, 📐, 🛡️, 🌏, 📲, ★). Emoji memiliki rendering yang tidak konsisten di berbagai perangkat, merusak kesan teknologi AI yang presisi, dan dapat dibaca secara bising oleh pembaca layar (*screen reader*).
* **Standar Ikon Vektor SVG Garis (Lucide Icons):** Seluruh antarmuka diwajibkan menggunakan ikon dari pustaka **Lucide Icons** (24×24 viewBox, stroke-width 2px, stroke-linecap: round, stroke-linejoin: round) untuk menjamin konsistensi, kejelasan visual, dan performa render instan.

### 6.2 Matriks Aksesibilitas WCAG 2.2 Level AA Mobile

| No | Kriteria WCAG 2.2 AA | Implementasi Khusus Mobile pada Codi AI |
|:---|:---------------------|:----------------------------------------|
| 1 | **Kontras Warna (1.4.3 & 1.4.11)** | Minimal rasio kontras **4.5:1** untuk teks normal dan **3:1** untuk elemen UI interaktif, dioptimalkan agar tetap terbaca jelas di luar ruangan (*outdoor glare* pada layar HP). |
| 2 | **Target Sentuh Mobile (2.5.8)** | Seluruh target sentuh layar ponsel berukuran minimal **48 × 48 CSS pixels**. Tombol suara mikrofon utama dibuat berukuran ergonomis **64 × 64 pixels** di area jempol bawah. |
| 3 | **Viewport Dinamis & Safe Area (1.4.4 & 1.4.10)** | Menggunakan unit `100dvh` (*dynamic viewport height*) untuk mencegah lompatan layout saat *virtual keyboard* atau *mobile address bar* muncul/hilang. Menghormati `env(safe-area-inset-bottom)` dan `env(safe-area-inset-top)` untuk layar berponi (*notch/island*). |
| 4 | **Operabilitas Screen Reader Mobile** | Dukungan penuh untuk Android TalkBack dan iOS VoiceOver dengan atribut `aria-label` bahasa Indonesia yang jelas pada semua kontrol sentuh. |
| 5 | **Audio Controls & Transkrip (1.2.x)** | Setiap suara yang dikeluarkan AI memiliki teks tertulis secara simultan. Siswa dapat menekan jeda (*pause*), putar ulang (*replay*), atau mematikan suara (*mute*). |
| 6 | **Reduced Motion (2.3.3)** | Deteksi `@media (prefers-reduced-motion)` untuk mengganti animasi 3D WebGL dengan gambar 2D statis beresolusi tinggi guna mencegah kelelahan sensori anak dan menghemat daya baterai ponsel. |

---

## 7. Arsitektur Antarmuka & User Journey (Mobile-First)

### 7.1 Alur Pengguna Ponsel (Mobile User Flow)

```
[Mobile Landing Page] ──► [Tap "Masuk dengan Google" / Instal PWA]
                                  │
                                  ▼
                     [Google OAuth 2.0 Flow]
                                  │
                                  ▼
               [Layar Pemilihan Guru / Bottom Sheet]
               ├─► Kartu A: Guru Pengetahuan Umum
               └─► Kartu B: Guru Matematika
                                  │
                                  ▼
              [Layar Interaktif Chat & Speak Codi]
              • Atas: Kanvas 3D Codi Ringan & Responsif
              • Tengah: Stream Balon Chat (Teks Besar & Jelas)
              • Bawah (Thumb Zone): Dock Mikrofon 64px + Input
```

### 7.2 Struktur Halaman: Landing Page Mobile (Pre-Login)

Landing page mengadopsi bahasa visual referensi (*dark base #0A0A0C, single accent violet #6C4CF1, pill geometry*) yang disusun dengan tata letak vertikal *mobile-first*:

1. **Mobile Sticky Header (Tinggi 56px):**
   - Latar belakang `#0A0A0C` dengan backdrop blur halus.
   - Kiri: Maskot mini 3D Codi (diameter 28px) + wordmark `CODI AI`.
   - Kanan: Tombol pill kompak *"Masuk"* (Google Sign-In) dan link teks *"Kontak"*.
2. **Hero Section (Mobile Stacked Layout):**
   - **Headline Mobile:** Skala proporsional 40–52px (Weight 800, tight tracking -0.03em) yang pas di satu layar ponsel tanpa terpotong aneh:
     `Belajar Pintar [3D-Icon-Pill] Bersama Codi`
   - **Subheadline:** 2–3 baris teks ramah (14–15px, `#9A9AA2`, line-height 1.5): *"Asisten guru virtual ramah anak SD Indonesia untuk Matematika & Pengetahuan Umum. Belajar lewat suara atau teks secara sabar, aman, dan tanpa rasa takut salah."*
   - **Mobile Conversion Unit:**
     - Pill input email satu kolom yang mudah diisi dengan keyboard HP + Tombol pill putih *"Daftar Akses Awal"*.
     - Tombol cepat alternatif: *"Masuk Langsung dengan Google"* dengan logo resmi Google.
   - **Trust Row (Mobile Optimized):**
     - Titik hijau berdenyut (*pulsing green dot* `#34D399`) + *"3.420 siswa & guru menunggu"* + *"1 email saat undanganmu siap"*.
   - **Lencana Akreditasi (Ikon Garis SVG, Bebas Emoji):**
     - Kartu putih kecil dengan ikon bintang garis SVG: *"Diselaraskan dengan Kurikulum Merdeka SD Indonesia"*.
   - **PWA Install Banner Chip:**
     - Pill mengambang halus dengan ikon unduh ponsel SVG: *"Pasang di Layar HP (PWA)"*.
3. **Mascot Visual & Orbiting Badges (Mobile Adaptation):**
   - Karakter 3D Codi ("Otus" Soundwave Owl) naik dari bagian bawah hero, terpotong oleh lipatan layar (*cropped by the mobile fold*). Bertekstur bulu halus violet (*tactile soft fur*) dengan estetika sinematik Agibot, berwajah ramah anak, mata bulat besar ekspresif, paruh lilac, dan headphone terintegrasi.
   - **4 Orbiting Badges (Menggunakan Ikon Garis SVG):**
     - Kiri Atas: `[Ikon Garis Mikrofon] Suara Ramah Anak`
     - Kanan Atas: `[Ikon Garis Penggaris/Segitiga] Guru Matematika Cerdas`
     - Kiri Bawah: `[Ikon Garis Perisai Centang] 100% Aman & Bebas SARA`
     - Kanan Bawah: `[Ikon Garis Bola Dunia] Pengetahuan Umum SD`
4. **FAQ Section (Mobile Single Column Accordion):**
   - Transisi ke latar panel `#111114`.
   - Eyebrow monospace `FAQ` + Judul 2 baris: *"Segala Hal Penting"* / *"Untuk Belajar Anak."*.
   - Akordeon 5 item dipisahkan garis *hairline* 1px. Tombol toggle bulat 36px di ujung kanan dengan transisi halus `+` menjadi `-`.
5. **Footer Bersih Sesuai Referensi Desain:**
   - Baris Atas: Logo mark + wordmark `CODI AI` dan tagline 2 baris muted di kiri; 3 teks link navigasi (*Daftar Akses Awal*, *FAQ*, *Kontak*) di kanan tanpa garis pemisah bawah.
   - Baris Bawah: Spasi lega dengan teks monospace `© 2026 Codi AI` di kiri dan `Pengaturan Cookie` di kanan.
6. **Signature Close:**
   - Tepat di bawah footer: Wordmark raksasa `CODI AI` (~20vw desktop / ~24vw mobile) bergradasi lavender pucat di atas pendaran cahaya radial ungu (*purple radial glow*) yang memancar dari dasar halaman.

---

### 7.3 Struktur Halaman: Workspace Belajar Mobile (Post-Login)

#### A. Layar Pemilihan Asisten Guru (Mobile Bottom Sheet / Card Deck)
* Tampil instan sesaat setelah login:
  - Disajikan dalam bentuk **Interactive Bottom Sheet** yang nyaman dijangkau jempol satu tangan.
  - Dua kartu pilihan berukuran besar:
    1. **Kak Codi — Pengetahuan Umum (IPAS & Budaya)**
    2. **Pak Codi — Matematika (Logika & Angka)**
  - Masing-masing kartu memiliki tombol pill besar: *"Mulai Belajar ➜"*.

#### B. Antarmuka Ruang Belajar Mobile (Chat & Speak Canvas)
* **Top App Bar Mobile (52px):**
  - Dropdown pill ganti guru: `[ 📐 Matematika ▾ ]`.
  - Tombol Audio Mute/Unmute.
  - Indikator status privasi & foto profil Google siswa.
* **Zona Karakter 3D (Mobile Dynamic Viewport):**
  - Mengambil porsi 30–35% dari tinggi layar atas ponsel.
  - Model 3D Codi bereaksi langsung terhadap suara input mic anak (lingkaran audio pendar violet mengembang sesuai volume suara).
* **Zona Stream Balon Chat (Scrollable Chat Feed):**
  - Mengambil porsi 40–45% di bagian tengah layar.
  - Balon chat didesain dengan kontras tinggi, font 16–18px yang nyaman dibaca anak tanpa perlu *zoom*.
  - Dilengkapi tombol *Play Voice* `[ ▶ Dengarkan ]` di setiap pesan guru Codi.
* **Zona Ergonomis Jempol Bawah (Bottom Thumb Input Dock):**
  - Menempel di bagian bawah layar ponsel dengan proteksi `safe-area-inset-bottom`.
  - **Tombol Mikrofon Sentral:** Lingkaran besar diameter **64 × 64px** berdenyut ungu, berada tepat di jangkauan natural ibu jari. Dilengkapi haptic feedback getar saat ditekan.
  - **Input Teks Alternatif:** Kolom input pill kompak di samping tombol mic bagi anak yang ingin mengetik.
  - **Saran Cepat (Horizontal Scroll Chips):** 3 pill rekomendasi materi di atas dock yang dapat digeser menyamping (*horizontal swipeable chips*).

---

## 8. Kebutuhan Fungsional (Functional Specifications)

### 8.1 Progressive Web App (PWA) Core Engine
Platform wajib memenuhi kriteria PWA modern yang dapat diinstal penuh:
1. **Web App Manifest (`manifest.json`):**
   ```json
   {
     "name": "Codi AI — Asisten Guru SD",
     "short_name": "Codi AI",
     "description": "Asisten belajar ramah anak untuk Matematika dan Pengetahuan Umum SD",
     "start_url": "/?source=pwa",
     "display": "standalone",
     "orientation": "portrait",
     "background_color": "#0A0A0C",
     "theme_color": "#0A0A0C",
     "icons": [
       { "src": "/icons/icon.svg", "sizes": "192x192 512x512", "type": "image/svg+xml", "purpose": "any maskable" }
     ]
   }
   ```
2. **Service Worker Lifecycle & Caching Strategy:**
   - **Cache-First (App Shell):** Semua file inti (HTML shell, CSS tokens, JS bundles, font Plus Jakarta Sans & JetBrains Mono, suara audio chime lokal).
   - **Stale-While-Revalidate (Asset 3D Codi):** Model 3D terkompresi disimpan di cache lokal peramban agar waktu buka kedua kalinya instan (< 300ms).
   - **Network-First with Fallback (API Percakapan):** Permintaan AI diproses melalui jaringan, dengan pesan ramah offline saat internet putus.
3. **Instalabilitas (A2HS - Add to Home Screen):**
   - Menangkap event browser `beforeinstallprompt`.
   - Menampilkan banner kustom ramah anak dan orang tua dengan tombol *"Pasang Aplikasi"*.
4. **Haptic Feedback API (`navigator.vibrate`):**
   - Getaran mikro halus (15ms) saat tombol mic disentuh dan saat jawaban pertama Codi mulai bersuara, memberikan kepuasan sensori taktil bagi anak di perangkat mobile.

### 8.2 Modul Autentikasi (Google OAuth 2.0 Mobile Flow)
* Integrasi Google Identity Services (GIS) dengan pop-up atau redirect yang ramah browser mobile (Chrome Mobile, Samsung Internet, Safari iOS).
* Dukungan login instan menggunakan akun Google Family Link atau akun resmi siswa `belajar.id`.

### 8.3 Modul Speech-to-Text (STT) & Text-to-Speech (TTS) Mobile
* **STT Suara Anak:** Memanfaatkan Web Speech API bawaan perangkat mobile dengan fallback ke server whisper-tuned endpoint untuk artikulasi vokal anak Indonesia.
* **TTS Suara Ramah:** Model suara berintonasi sabar dan tempo 0.9x yang di-stream dalam format audio terkompresi (Opus/AAC bit-rate rendah) guna menghemat kuota seluler.

### 8.4 Modul 3D Engine Mobile-Optimized
* Menggunakan **Three.js** dengan renderer teroptimasi untuk GPU mobile:
  - Penggunaan *precision mediump* pada shader ponsel.
  - Ukuran file model 3D Codi dikompresi menggunakan **Draco / Meshopt** menjadi **`< 1.2 MB`**.
  - Fallback otomatis ke gambar 2D Codi interaktif apabila perangkat terdeteksi memiliki RAM < 2GB atau WebGL dinonaktifkan.

### 8.5 Modul Content Moderation Gateway
* Pengecekan real-time pada setiap input prompt siswa dan output respons model sebelum diteruskan ke UI.
* Pencegahan kebocoran data pribadi anak (alamat, nomor HP, foto).

---

## 9. Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Mobile Performance Budget:**
   - Skor Audit **Google Lighthouse PWA: 100/100**.
   - Skor Performance Mobile (simulasi 4G lambat): **> 90**.
   - Initial JS Bundle: `< 180 KB` (gzipped).
   - First Contentful Paint (FCP) di jaringan 4G: `< 1.2 detik`.
   - Time to Interactive (TTI): `< 2.2 detik`.
2. **Konsumsi Memori & Baterai Ponsel:**
   - Konsumsi RAM browser dibatasi maksimal `< 85 MB` agar tidak memicu *out-of-memory reload* pada ponsel Android 3GB RAM.
   - Pemanfaatan *requestAnimationFrame* yang dihentikan saat tab berada di latar belakang (*background tab battery saving*).
3. **Ketahanan Jaringan Seluler Indonesia:**
   - Sistem toleran terhadap fluktuasi koneksi sinyal (otomatis melakukan *exponential backoff retry* pada koneksi audio yang terputus tanpa menghilangkan teks percakapan).
4. **Kepatuhan Privasi Data Anak:**
   - Kepatuhan terhadap UU PDP No. 27/2022 Indonesia. Rekaman suara tidak disimpan permanen atau dijual ke pihak ketiga.

---

## 10. Metrik Keberhasilan (Success Metrics / KPI)

| Metrik | Target Q1–Q2 2026 |
|:-------|:-------------------|
| **Mobile PWA Install Rate** | > 40% pengguna aktif menyimpan Codi AI ke Home Screen ponsel |
| **Pedagogic Safety Rate** | 100% (Zero breach terhadap konten dewasa, SARA, dan ujaran kebencian) |
| **Mobile Voice Completion Rate** | > 85% sesi tanya-jawab diselesaikan menggunakan suara melalui tombol mic |
| **PWA Crash Rate (Low-end Android)** | < 0.5% sesi mengalami crash atau out-of-memory |
| **WCAG 2.2 Mobile Compliance Score** | 100% lulus audit otomatis Lighthouse Accessibility & Axe-Core |

---

## 11. Roadmap Rilis

* **Sprint 1 (Mobile-First PWA Foundation):** Implementasi Web App Manifest, Service Worker offline caching, dan Landing Page Mobile sesuai referensi desain (*dark-mode luxury*, mascot hero, mobile FAQ accordion, waitlist & Google Auth).
* **Sprint 2 (Safety & LLM Core):** Integrasi pipeline AI terkurasi untuk Guru Matematika & Pengetahuan Umum + Moderation Guardrail.
* **Sprint 3 (Speech & Mobile 3D Optimization):** Implementasi Web Audio STT/TTS berkuota hemat, haptic feedback, dan kanvas karakter 3D Codi terkompresi Draco (< 1.2MB).
* **Sprint 4 (Mobile WCAG Audit & Field Testing):** Uji coba pada 5 varian smartphone Android populer di Indonesia (Xiaomi, Samsung Galaxy A-series, Oppo, Vivo) dan audit aksesibilitas 2.2 AA.
* **Sprint 5 (Public Launch & School Rollout):** Peluncuran publik PWA dan distribusi ke sekolah percontohan.
