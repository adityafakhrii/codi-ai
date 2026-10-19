/**
 * Codi AI - AI Teacher Engine & Safety Guardrails
 * Pedagogical Assistant for Indonesian Elementary Students (Ages 7-12)
 * 2 Assistants: Pak Codi (Matematika) & Bu Codi (Pengetahuan Umum)
 * Multi-tiered Safety Guardrails: Anti-SARA, Anti-Adult, Anti-Politics, PII Protection
 */

(function () {
  'use strict';

  // 1. Strict Content Safety Guardrails (Zero-Tolerance Rules)
  const FORBIDDEN_PATTERNS = [
    // Adult & Romantic Content
    /\b(porno|bokep|seks|sex|telanjang|cinta|pacar|pacaran|kiss|cium|dewasa|vulgar)\b/i,
    // SARA & Hate Speech
    /\b(sara|kafir|sesat|cina|pribumi|rasis|hina agama|syiah|wahabi|komunis|pki|antek asing)\b/i,
    // Politics, Ideological Doctrines, Subversion
    /\b(pemilu|pilpres|partai|presiden ganti|makar|separatis|opm|khilafah|demonstrasi|jokowi|prabowo)\b/i,
    // Violence, Weapons, Self-harm
    /\b(bunuh|bunuh diri|mati|darah|pisau|senjata|tembak|racun|bom|teroris|bakar|pukul|aniaya)\b/i,
    // Bullying & Toxic Slang
    /\b(bodoh|tolol|bego|goblok|jelek|anjing|babi|bangsat|sampah|tai|lo serakah)\b/i,
    // Drugs & Dangerous Substances
    /\b(narkoba|ganja|sabu|rokok|vape|alkohol|miras|obat terlarang)\b/i,
    // PII Detection (Phone numbers, personal addresses)
    /(\+62|08)[0-9]{8,12}/i,
    /\b(jl\.|jalan|no\.|rt|rw|alamat rumah|nomor hp|kartu kredit|rekening)\b/i
  ];

  function checkSafetyViolation(input) {
    if (!input || typeof input !== 'string') return null;
    const clean = input.trim();

    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(clean)) {
        return {
          violation: true,
          message: 'Wah, pertanyaanmu menarik! Tapi Codi di sini khusus menemani adik belajar Matematika dan Pengetahuan Umum SD saja ya. Yuk, kita tanyakan hal seputar pelajaran sekolah yang seru!'
        };
      }
    }
    return null;
  }

  // 2. Curated Knowledge Bases & Pedagogical Reasoning Engine
  const TEACHER_PROFILES = {
    math: {
      id: 'math',
      title: 'Guru Matematika Cerdas',
      name: 'Pak Codi',
      greeting: 'Halo! Saya Pak Codi, guru matematika pintarmu. Mau belajar operasi hitung, pecahan seru, atau geometri bangun ruang hari ini? Ayo tanyakan!',
      topics: ['Penjumlahan & Pengurangan', 'Perkalian & Pembagian Cepat', 'Pecahan & Desimal', 'Bangun Datar & Ruang', 'Soal Cerita Logika'],
      quickPrompts: [
        'Cara mudah perkalian 7',
        'Bantu hitung 1/2 + 1/4 dong',
        'Apa beda persegi dan persegi panjang?',
        'Rumus luas segitiga apa ya?'
      ]
    },
    general: {
      id: 'general',
      title: 'Guru Pengetahuan Umum SD',
      name: 'Bu Codi',
      greeting: 'Halo adik pintar! Saya Bu Codi, teman belajar sains dan pengetahuan umum nusantara. Mau tahu rahasia alam, pahlawan Indonesia, atau luar angkasa?',
      topics: ['IPAS Sains & Lingkungan', 'Flora & Fauna Nusantara', 'Geografi & Budaya Indonesia', 'Tata Krama & Pancasila', 'Misteri Alam Semesta'],
      quickPrompts: [
        'Kenapa daun warnanya hijau?',
        'Hewan endemik Indonesia apa saja?',
        'Bagaimana proses terjadinya hujan?',
        'Siapa pahlawan dari Maluku?'
      ]
    }
  };

  // Rule-based pedagogical response generator for immediate responsive demo
  function generatePedagogicalResponse(teacherId, userMessage) {
    const violation = checkSafetyViolation(userMessage);
    if (violation) {
      return {
        text: violation.message,
        isWarning: true
      };
    }

    const lower = userMessage.toLowerCase();

    // Deteksi pertanyaan tugas atau PR (Pedagogical Guardrail)
    const isHomeworkRequest = /\b(pr|tugas|pekerjaan rumah|soal nomor|jawabkan|kerjakan|kunci jawaban|jawaban nomor)\b/.test(lower);

    // A. Pak Codi - Matematika
    if (teacherId === 'math') {
      // 1. Deteksi jika anak bertanya tentang topik IPAS / Sains / Alam ke Pak Codi -> Arahkan ke Bu Codi
      const isIpasQuestion = /\b(daun|fotosintesis|klorofil|hujan|awan|hewan|binatang|fauna|flora|tumbuhan|pohon|pahlawan|maluku|pattimura|planet|tata surya|matahari|bumi|antariksa|ekosistem|organ tubuh|jantung|paru|lambung|pencernaan|otot|tulang|kutub|gunung|laut|sungai|samudra|budaya|pancasila|indonesia|provinsi|sejarah|sains|ipas)\b/i.test(lower);
      if (isIpasQuestion) {
        return {
          text: 'Wah, pertanyaan seru tentang sains dan alam ini adalah keahlian **Bu Codi** (Guru IPAS & Pengetahuan Umum SD)!\n\nYuk, tanyakan ke Bu Codi di ruang belajarnya ya agar adik mendapatkan penjelasan yang seru dan lengkap tentang topik ini! ✨',
          followUp: 'Beralih ke Bu Codi untuk membahas topik sains ini ya!'
        };
      }

      if (isHomeworkRequest) {
        return {
          text: 'Halo adik hebat! Pak Codi di sini siap membimbing adik memahami **cara dan proses belajarnya**, bukan untuk mengerjakan tugas atau memberikan kunci jawaban instan.\n\nKalau adik memahami langkah-langkahnya, adik pasti bisa memecahkannya sendiri dengan bangga!\n\n1. Apa konsep atau soal yang sedang dipelajari?\n2. Bagian mana yang terasa paling menantang atau membingungkan?\n\nCeritakan ke Pak Codi, yuk kita bedah bareng-bareng langkah demi langkah!',
          followUp: 'Ketik bagian soal yang ingin kita pelajari cara menyelesaikannya ya!'
        };
      }

      if (lower.includes('perkalian 7') || (lower.includes('kali') && lower.includes('7'))) {
        return {
          text: 'Trik seru perkalian 7! Ingat angka kelipatannya: 7, 14, 21, 28, 35, 42, 49, 56, 63, 70. Kalau adik lupa 7 × 8, cukup ingat 7 × 7 = 49, lalu tambahkan 7 lagi menjadi 56! Mudah kan? Mau coba hitung 7 × 6?',
          followUp: 'Berapa 7 × 6?'
        };
      }
      if (lower.includes('1/2') && lower.includes('1/4')) {
        return {
          text: 'Bayangkan adik punya martabak manis! Setengah martabak (1/2) itu sama dengan 2 potong dari 4 bagian (2/4). Nah, jika 2/4 ditambah 1/4 lagi, martabak adik sekarang ada 3 potong dari 4 bagian, yaitu 3/4! Paham kan konsep menyamakan penyebutnya?',
          followUp: 'Bagaimana kalau 1/4 + 2/4?'
        };
      }
      if (lower.includes('persegi') && lower.includes('panjang')) {
        return {
          text: 'Perbedaan mudahnya begini: Persegi punya 4 sisi yang panjangnya SAMA persis (seperti ubin lantai). Sedangkan Persegi Panjang punya 2 sisi panjang dan 2 sisi pendek (seperti buku tulis atau layar ponsel). Keduanya punya 4 sudut siku-siku 90 derajat!',
          followUp: 'Benda apa di sekitarmu yang bentuknya persegi panjang?'
        };
      }
      if (lower.includes('segitiga') || lower.includes('luas segitiga')) {
        return {
          text: 'Rumus luas segitiga itu sangat sederhana: Luas = 1/2 × Alas × Tinggi. Kenapa ada setengahnya? Karena jika 2 segitiga yang sama digabungkan, mereka membentuk sebuah persegi atau persegi panjang! Keren kan rahasia geometri ini?',
          followUp: 'Mau coba hitung segitiga dengan alas 6 cm dan tinggi 4 cm?'
        };
      }
      if (/\d+\s*[\+\-\*\/x×:]\s*\d+/.test(lower)) {
        // Step-by-step arithmetic guidance without revealing direct answers
        const match = lower.match(/(\d+)\s*([\+\-\*\/x×:])\s*(\d+)/);
        if (match) {
          const a = parseInt(match[1], 10);
          const op = match[2];
          const b = parseInt(match[3], 10);
          let steps = '';
          let promptQuestion = '';

          if (op === '+' || op === 'tambah') {
            const bigger = Math.max(a, b);
            const smaller = Math.min(a, b);
            steps = `Untuk menjumlahkan **${a} + ${b}**, mari gunakan cara langkah demi langkah:\n\n` +
              `1. Mulai dari angka terbesar yaitu **${bigger}**.\n` +
              `2. Bayangkan adik punya ${bigger} kelereng di dalam toples.\n` +
              `3. Sekarang, hitung maju sebanyak **${smaller}** langkah ke depan.`;
            promptQuestion = `Coba adik hitung maju dari ${bigger} sebanyak ${smaller} langkah. Berapa hasil akhirnya?`;
          } else if (op === '-' || op === 'kurang') {
            steps = `Untuk mengurangkan **${a} - ${b}**, mari gunakan analogi berikut:\n\n` +
              `1. Bayangkan adik punya **${a}** buah apel manis.\n` +
              `2. Lalu adik membagikan **${b}** buah apel kepada teman.\n` +
              `3. Kita tinggal menghitung mundur dari ${a} sebanyak ${b} langkah.`;
            promptQuestion = `Coba adik hitung mundur dari ${a} sebanyak ${b} langkah. Sisa berapa apelnya?`;
          } else if (op === '*' || op === 'x' || op === '×' || op === 'kali') {
            steps = `Untuk menghitung perkalian **${a} × ${b}**, kuncinya adalah **penjumlahan berulang**:\n\n` +
              `1. Perkalian ${a} × ${b} artinya ada **${a}** kelompok, dan tiap kelompok berisi **${b}** buah.\n` +
              `2. Jadi kita menjumlahkan angka ${b} sebanyak ${a} kali.\n` +
              `3. Adik bisa menjumlahkannya bertahap dua angka demi dua angka.`;
            promptQuestion = `Jika kita jumlahkan ${b} sebanyak ${a} kali, berapa hasil yang adik dapatkan?`;
          } else if (op === '/' || op === ':' || op === 'bagi') {
            steps = `Untuk pembagian **${a} : ${b}**, kuncinya adalah **pembagian rata atau pengurangan berulang**:\n\n` +
              `1. Bayangkan adik punya **${a}** potong kue.\n` +
              `2. Adik ingin membagikannya sama rata ke **${b}** piring sampai habis.\n` +
              `3. Berapa potong kue yang masuk ke masing-masing piring agar adil?`;
            promptQuestion = `Berapa potong kue yang ada di masing-masing dari ${b} piring tersebut?`;
          }

          return {
            text: `Pak Codi bantu cara memecahkannya ya! Pak Codi tidak memberikan jawaban instan agar adik semakin hebat dan mandiri.\n\n${steps}`,
            followUp: promptQuestion
          };
        }
      }

      // 2. Deteksi jika pertanyaan di luar topik Matematika SD
      const isMathTopic = /\b(hitung|kali|bagi|tambah|kurang|jumlah|selisih|pecahan|persen|desimal|persegi|segitiga|lingkaran|sudut|derajat|keliling|luas|volume|balok|kubus|prisma|tabung|kerucut|bilangan|angka|rumus|matematika|soal)\b/i.test(lower) || /\d+/.test(lower) || /[\+\-\*\/x×:]/.test(lower);
      if (!isMathTopic) {
        return {
          text: 'Halo adik pintar! Pak Codi adalah guru khusus **Matematika SD**.\n\nPak Codi hanya bisa membantu adik belajar operasi hitung, pecahan, geometri bangun ruang, dan logika matematika seru lainnya.\n\nYuk, tanyakan materi matematika atau angka yang ingin kita pelajari bersama!',
          followUp: 'Ketik soal hitungan atau konsep matematika yang ingin adik diskusikan ya!'
        };
      }

      // Default Socratic math response
      return {
        text: `Pertanyaan yang bagus sekali tentang matematika! Untuk menyelesaikannya, mari kita uraikan langkah demi langkah: pertama kita cari tahu apa yang diketahui di soal, lalu pilih cara hitungnya. Mau Pak Codi jelaskan contoh mudahnya?`,
        followUp: 'Ketik atau ucapkan angka yang ingin kita hitung bersama ya!'
      };
    }

    // B. Bu Codi - Pengetahuan Umum SD (IPAS)
    if (teacherId === 'general') {
      // 1. Deteksi jika anak bertanya tentang Matematika ke Bu Codi -> Arahkan ke Pak Codi
      const isMathQuestion = /\b(hitung|kali|bagi|tambah|kurang|jumlah|pecahan|persen|desimal|persegi|segitiga|luas segitiga|keliling|volume|balok|kubus|rumus luas|rumus hitung|matematika)\b/i.test(lower) || /\d+\s*[\+\-\*\/x×:]\s*\d+/.test(lower) || (/berapakah|berapa hasil|berapa/.test(lower) && /\d+/.test(lower));
      if (isMathQuestion) {
        return {
          text: 'Wah, kalau soal hitung-hitungan, rumus, dan matematika yang seru, jagonya adalah **Pak Codi** (Guru Matematika Cerdas)!\n\nYuk, ajukan pertanyaan ini ke Pak Codi di ruang belajarnya ya, beliau siap membimbing adik menemukan caranya langkah demi langkah! 🎯',
          followUp: 'Beralih ke Pak Codi untuk menghitung soal ini ya!'
        };
      }

      if (isHomeworkRequest) {
        return {
          text: 'Halo adik pintar! Bu Codi sangat senang melihat semangat belajarmu. Namun, Bu Codi hadir untuk memandu adik **memahami materi dan konsepnya**, bukan untuk membuatkan jawaban tugas atau esai PR secara langsung.\n\nDengan memahami konsepnya, adik akan jadi pelajar mandiri yang hebat!\n\n1. Apa topik tugas yang sedang adik pelajari?\n2. Pertanyaan apa yang paling membuat adik penasaran?\n\nAyo ceritakan, Bu Codi siap menemani adik memahaminya langkah demi langkah!',
          followUp: 'Ketik topik atau pertanyaan yang ingin kita diskusikan ya!'
        };
      }

      if (lower.includes('daun') && lower.includes('hijau')) {
        return {
          text: 'Daun berwarna hijau karena memiliki zat ajaib bernama Klorofil (zat hijau daun)! Klorofil ini bertugas seperti koki pintar di daun yang menyerap sinar matahari untuk memasak makanan bagi pohon lewat proses Fotosintesis. Hebat ya tumbuhan kita!',
          followUp: 'Tahukah kamu apa yang dihasilkan pohon saat fotosintesis?'
        };
      }
      if (lower.includes('hujan')) {
        return {
          text: 'Hujan terjadi lewat Daur Air (siklus air)! Air di laut dan danau menguap karena panas matahari menjadi awan. Saat awan sudah penuh dan dingin di langit tinggi, uap air berkumpul menjadi titik-titik air yang jatuh ke bumi sebagai hujan. Airnya meresap ke tanah dan kembali ke laut lagi!',
          followUp: 'Adik suka melihat pelangi setelah hujan?'
        };
      }
      if (lower.includes('hewan endemik') || lower.includes('fauna')) {
        return {
          text: 'Indonesia kaya sekali dengan hewan endemik (hewan yang hanya ada di nusantara)! Contohnya: Komodo di Pulau Komodo NTT, Orangutan di hutan Sumatera & Kalimantan, Anoa & Babirusa di Sulawesi, dan Burung Cendrawasih yang indah di Papua. Kita harus bangga dan menjaganya!',
          followUp: 'Hewan asli Indonesia mana yang paling adik sukai?'
        };
      }
      if (lower.includes('pahlawan') || lower.includes('maluku')) {
        return {
          text: 'Pahlawan terkenal dari Maluku adalah Kapitan Pattimura (Thomas Matulessy)! Beliau memimpin perjuangan rakyat Maluku pada tahun 1817 melawan penjajah demi membela tanah air dan rakyatnya dengan gagah berani. Wajah beliau juga pernah diabadikan di uang kertas Rp1.000!',
          followUp: 'Pernah dengar juga pahlawan wanita dari Maluku bernama Christina Martha Tiahahu?'
        };
      }

      // 2. Deteksi jika pertanyaan di luar topik IPAS & Sains SD
      const isIpasTopic = /\b(daun|fotosintesis|klorofil|hujan|awan|hewan|fauna|flora|tumbuhan|pohon|pahlawan|maluku|pattimura|planet|tata surya|matahari|bumi|antariksa|ekosistem|organ|jantung|paru|siklus|wujud|benda|energi|listrik|magnet|alam|lingkungan|pancasila|budaya|provinsi|geografi|sejarah|sains|ipas|ipa|ips)\b/i.test(lower);
      if (!isIpasTopic) {
        return {
          text: 'Halo adik pintar! Bu Codi adalah guru khusus **IPAS dan Pengetahuan Umum SD**.\n\nBu Codi menemani adik mempelajari keajaiban alam, sains, dunia tumbuhan dan hewan, serta kekayaan nusantara Indonesia.\n\nYuk, tanyakan hal-hal seru seputar sains, alam, atau pengetahuan umum SD!',
          followUp: 'Ketik topik sains atau alam yang paling membuatmu penasaran ya!'
        };
      }

      // Default General knowledge response
      return {
        text: `Wah, rasa ingin tahu adik hebat sekali! Di pelajaran Pengetahuan Umum SD, alam dan negeri kita Indonesia punya berjuta rahasia menakjubkan. Bu Codi senang sekali adik menanyakan hal ini. Ada bagian tertentu yang paling membuatmu penasaran?`,
        followUp: 'Tanyakan lagi apa saja tentang bumi, hewan, atau sains ya!'
      };
    }

    return {
      text: 'Halo! Codi siap membantu adik belajar. Tanyakan apa saja seputar pelajaran sekolah ya!'
    };
  }

  // Export to global scope
  window.CodiAI = {
    TEACHER_PROFILES,
    checkSafetyViolation,
    generatePedagogicalResponse
  };
})();
