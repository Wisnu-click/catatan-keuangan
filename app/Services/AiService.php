<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AiService
{
    // OpenRouter endpoint (OpenAI-compatible)
    private const OR_URL = 'https://openrouter.ai/api/v1/chat/completions';

    /**
     * Panggil AI Engine melalui OpenRouter (1 key untuk semua model)
     * atau fallback ke engine lokal jika key belum dikonfigurasi.
     */
    public function askAi(string $modelId, string $prompt, ?string $imageAbsolutePath = null, array $userContext = []): array
    {
        $apiKey = config('services.openrouter.api_key') ?: env('OPENROUTER_API_KEY');

        // Jika OpenRouter key belum diisi, gunakan engine lokal
        if (!$apiKey) {
            return $this->buildMissingKeyResponse($modelId, $prompt, $imageAbsolutePath, $userContext);
        }

        // Jika model adalah VIRA Core AI (lokal), tidak perlu API
        if ($modelId === 'raw-logic-core') {
            return $this->callLocalEngine($modelId, $prompt, $imageAbsolutePath, $userContext);
        }

        return $this->callOpenRouter($modelId, $prompt, $imageAbsolutePath, $userContext, $apiKey);
    }

    /**
     * Panggil OpenRouter API dengan Dataset Lengkap dari Database
     */
    private function callOpenRouter(string $modelId, string $prompt, ?string $imageAbsolutePath, array $userContext, string $apiKey): array
    {
        $systemInstruction = $this->buildSystemInstruction($userContext);

        try {
            $userContent = [];

            if ($prompt) {
                $userContent[] = ['type' => 'text', 'text' => $prompt];
            }

            // Kirim gambar sebagai base64 data URL (OpenAI vision format)
            if ($imageAbsolutePath && file_exists($imageAbsolutePath)) {
                $imageData = base64_encode(file_get_contents($imageAbsolutePath));
                $mimeType  = mime_content_type($imageAbsolutePath) ?: 'image/jpeg';
                $userContent[] = [
                    'type'      => 'image_url',
                    'image_url' => ['url' => "data:{$mimeType};base64,{$imageData}"],
                ];
            }

            $finalUserContent = (count($userContent) === 1 && $userContent[0]['type'] === 'text')
                ? $prompt
                : $userContent;

            $messages = [
                ['role' => 'system', 'content' => $systemInstruction],
                ['role' => 'user',   'content' => $finalUserContent],
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'HTTP-Referer'  => config('services.openrouter.site_url', env('OPENROUTER_SITE_URL', 'http://localhost')),
                'X-Title'       => config('services.openrouter.site_name', env('OPENROUTER_SITE_NAME', 'VIRA Financial AI')),
                'Content-Type'  => 'application/json',
            ])->timeout(45)->post(self::OR_URL, [
                'model'       => $modelId,
                'messages'    => $messages,
                'temperature' => 0.2,
            ]);

            if ($response->successful()) {
                $aiText = $response->json('choices.0.message.content') ?? '';
                return $this->parseAiResponseText($aiText, $userContext, $prompt, $imageAbsolutePath);
            }

            $errBody = $response->body();
            Log::error("OpenRouter Error [{$modelId}] {$response->status()}: {$errBody}");

            return $this->callLocalEngine($modelId, $prompt, $imageAbsolutePath, $userContext);

        } catch (\Exception $e) {
            Log::error("OpenRouter Exception [{$modelId}]: " . $e->getMessage());
            return $this->callLocalEngine($modelId, $prompt, $imageAbsolutePath, $userContext);
        }
    }

    /**
     * Membangun System Prompt Bersih Tanpa Karakter Format yang Berlebihan
     */
    private function buildSystemInstruction(array $context): string
    {
        $user = $context['user'] ?? ['name' => 'Pengguna', 'email' => '-', 'joined_at' => '-'];
        $summary = $context['summary'] ?? [];
        $wallets = $context['wallets'] ?? [];
        $goals = $context['goals'] ?? [];
        $transactions = $context['recent_transactions'] ?? [];
        $categories = $context['categories'] ?? [];
        $reminders = $context['saving_reminders'] ?? [];

        // Format string wallets
        $walletsStr = collect($wallets)->map(fn ($w) => "• {$w['name']}: {$w['balance_formatted']}")->join("\n");
        if (empty($walletsStr)) $walletsStr = "• Belum ada dompet aktif";

        // Format string goals
        $goalsStr = collect($goals)->map(function ($g) {
            $deadline = $g['target_date'] ? " (Target: {$g['target_date']})" : "";
            return "• {$g['name']}: Terkumpul {$g['current_formatted']} dari {$g['target_formatted']} [{$g['progress_percent']}%]{$deadline}, Sisa: {$g['remaining_formatted']}";
        })->join("\n");
        if (empty($goalsStr)) $goalsStr = "• Belum ada target tabungan aktif";

        // Format string transaksi terakhir
        $trxStr = collect($transactions)->map(function ($t) {
            $sign = $t['type'] === 'income' ? '+' : '-';
            return "• {$t['date']} : {$sign}{$t['amount_formatted']} ({$t['category']} via {$t['wallet']}) - {$t['description']}";
        })->join("\n");
        if (empty($trxStr)) $trxStr = "• Belum ada riwayat transaksi";

        // Format string kategori
        $expenseCats = implode(', ', $categories['expense'] ?? ['Makanan', 'Transportasi', 'Belanja', 'Tagihan']);
        $incomeCats  = implode(', ', $categories['income'] ?? ['Gaji', 'Bonus', 'Penjualan', 'Investasi']);

        // Format string reminder
        $remindersStr = collect($reminders)->map(fn ($r) => "• {$r['title']}: {$r['amount']} ({$r['frequency']}) via {$r['wallet']}")->join("\n");
        if (empty($remindersStr)) $remindersStr = "• Tidak ada program menabung";

        return <<<EOT
Anda adalah VIRA Virtual Incoment & Record Assistent. Anda asisten pribadi keuangan yang ramah, sopan, dan solutif.
Anda memiliki akses langsung ke data keuangan pengguna di database:

DATA PENGGUNA TERKINI:
Nama: {$user['name']}
Email: {$user['email']}
Terdaftar: {$user['joined_at']}

TOTAL SALDO: {$summary['total_balance_formatted']} ({$summary['wallet_count']} Dompet)
Daftar Dompet:
{$walletsStr}

TARGET TABUNGAN:
{$goalsStr}

REKAP BULAN INI ({$summary['month_name']}):
Pemasukan: {$summary['monthly_income_formatted']}
Pengeluaran: {$summary['monthly_expense_formatted']}
Arus Kas Bersih: {$summary['monthly_net_formatted']} ({$summary['monthly_status']})

10 TRANSAKSI TERAKHIR:
{$trxStr}

KATEGORI:
Pengeluaran: {$expenseCats}
Pemasukan: {$incomeCats}

ATURAN FORMAT PENULISAN (SANGAT PENTING):
1. Tulis pesan dengan gaya percakapan yang bersih, rapi, dan mudah dibaca manusia.
2. DILARANG menggunakan karakter format berlebihan seperti tanda bintang ganda (**), bintang tunggal (*), tanda kutip berlebihan (" atau '), garis pembatas panjang (=== atau ---), atau backtick (`).
3. Gunakan spasi paragraf yang lega, baris baru, dan bullet point sederhana (• atau angka 1, 2, 3) agar sangat nyaman dibaca.
4. Gunakan emoji yang ramah dan relevan secukupnya.

PERINTAH SHORTCUT:
Jika pengguna mengetik perintah shortcut seperti !help, !saldo, !target, !rekap, !transaksi, !wallet, !kategori, atau !input, berikan rincian data di atas dengan jelas dan bersih tanpa tanda bintang.

PENCATATAN TRANSAKSI BARU:
Jika pengguna berniat mencatat transaksi baru atau mengirim foto struk, Anda WAJIB menyertakan blok JSON berikut di akhir respon:
[TRANSACTION_DATA]
{"is_transaction": true, "type": "expense"|"income", "merchant": "Nama Toko", "category": "Kategori", "amount": 50000, "wallet_name": "Nama Dompet", "note": "Catatan transaksi"}
[/TRANSACTION_DATA]
EOT;
    }

    /**
     * Parser Respon Teks AI ke Format Structured Data dan Membersihkan Format Teks
     */
    private function parseAiResponseText(string $aiText, array $userContext, string $prompt, ?string $imageAbsolutePath): array
    {
        $wallets = $userContext['wallets'] ?? [];
        $defaultWallet = $wallets[0] ?? ['id' => 1, 'name' => 'Dompet Utama'];

        // Cek apakah ada tag [TRANSACTION_DATA]...[/TRANSACTION_DATA] atau blok JSON
        if (preg_match('/\[TRANSACTION_DATA\]\s*(\{.*?\})\s*\[\/TRANSACTION_DATA\]/s', $aiText, $match) ||
            preg_match('/\{.*"is_transaction"\s*:\s*true.*?\}/s', $aiText, $match)) {
            
            $json = json_decode($match[1] ?? $match[0], true);
            if ($json && isset($json['amount'])) {
                $walletName = $json['wallet_name'] ?? $defaultWallet['name'];
                $matchedWallet = collect($wallets)->firstWhere('name', $walletName) ?? $defaultWallet;
                $cleanText = trim(str_replace([$match[0], '[TRANSACTION_DATA]', '[/TRANSACTION_DATA]'], '', $aiText));
                $cleanText = $this->cleanMarkdownFormatting($cleanText);

                return [
                    'type' => 'receipt',
                    'text' => $cleanText ?: 'Hasil analisis transaksi AI Assistant:',
                    'structured_data' => [
                        'type'             => $json['type'] ?? 'expense',
                        'merchant'         => $json['merchant'] ?? null,
                        'category'         => $json['category'] ?? 'Umum',
                        'amount'           => (float) $json['amount'],
                        'amount_formatted' => 'Rp ' . number_format((float) $json['amount'], 0, ',', '.'),
                        'wallet_id'        => $matchedWallet['id'] ?? null,
                        'wallet_name'      => $matchedWallet['name'] ?? $defaultWallet['name'],
                        'date'             => now()->translatedFormat('d M Y'),
                        'note'             => $json['note'] ?? $prompt,
                    ],
                ];
            }
        }

        $cleanedText = $this->cleanMarkdownFormatting($aiText ?: 'Maaf, AI tidak mengembalikan respon.');

        return [
            'type'            => 'text',
            'text'            => $cleanedText,
            'structured_data' => null,
        ];
    }

    /**
     * Helper untuk membersihkan simbol format markdown berlebihan (** * ` " _)
     */
    private function cleanMarkdownFormatting(string $text): string
    {
        // Hilangkan bold markdown **text** -> text
        $text = preg_replace('/\*\*(.*?)\*\*/', '$1', $text);
        // Hilangkan italic markdown *text* atau _text_ -> text
        $text = preg_replace('/\*([^\*\n]+)\*/', '$1', $text);
        $text = preg_replace('/_([^_\n]+)_/', '$1', $text);
        // Hilangkan backticks `code` -> code
        $text = str_replace('`', '', $text);
        // Hilangkan garis pembatas panjang seperti ═══════ atau -------
        $text = preg_replace('/[═=\-]{4,}/', '', $text);
        // Normalisasi spasi berlebih
        $text = preg_replace("/\n{3,}/", "\n\n", $text);

        return trim($text);
    }

    /**
     * Respon ketika OPENROUTER_API_KEY belum dikonfigurasi di .env
     */
    private function buildMissingKeyResponse(string $modelId, string $prompt, ?string $imageAbsolutePath, array $userContext): array
    {
        $fallback = $this->callLocalEngine($modelId, $prompt, $imageAbsolutePath, $userContext);

        $noticeText = "\n\nCatatan: OPENROUTER_API_KEY belum terpasang di file .env. Sistem saat ini menggunakan Engine Lokal Database untuk merespon query Anda.";

        if ($fallback['type'] === 'text') {
            $fallback['text'] = $fallback['text'] . $noticeText;
        }

        return $fallback;
    }

    /**
     * Local Engine Parser — Menangani Perintah Shortcut Bersih Tanpa Simbol Berlebihan
     */
    private function callLocalEngine(string $modelId, string $prompt, ?string $imageAbsolutePath, array $userContext): array
    {
        $wallets = $userContext['wallets'] ?? [];
        $summary = $userContext['summary'] ?? [];
        $goals = $userContext['goals'] ?? [];
        $transactions = $userContext['recent_transactions'] ?? [];
        $categories = $userContext['categories'] ?? [];
        $user = $userContext['user'] ?? ['name' => 'Pengguna'];
        $defaultWallet = $wallets[0] ?? ['id' => 1, 'name' => 'Dompet Utama'];

        $lower = strtolower(trim($prompt));

        // ═════════════════════════════════════════════════════════════════════
        // 1. SHORTCUT COMMAND: !HELP
        // ═════════════════════════════════════════════════════════════════════
        if (in_array($lower, ['!help', '/help', 'help', '!bantuan', '/bantuan', 'bantuan', '!menu', '/menu'])) {
            $helpText = "🤖 PANDUAN PERINTAH SHORTCUT VIRA AI\n\n" .
                "Gunakan tanda seru ! di awal pesan untuk akses cepat:\n\n" .
                "💰 !saldo : Cek saldo seluruh dompet dan total dana\n" .
                "🎯 !target : Cek status dan progres semua target tabungan\n" .
                "🧾 !transaksi : Cek mutasi 10 transaksi terakhir\n" .
                "📊 !rekap : Rekap pemasukan, pengeluaran dan cashflow bulan ini\n" .
                "💳 !wallet : Daftar dompet dan rekening aktif\n" .
                "🏷️ !kategori : Daftar kategori pengeluaran dan pemasukan\n" .
                "✍️ !input : Panduan cara cepat mencatat transaksi\n" .
                "👤 !profil : Info akun dan status sistem\n\n" .
                "💡 Tips Mencatat Cepat:\n" .
                "• Makan siang 35rb dari Dompet Utama\n" .
                "• Gaji 5jt ke Rekening Utama\n" .
                "• Kirim foto struk belanja untuk dipindai otomatis";

            return ['type' => 'text', 'text' => $helpText, 'structured_data' => null];
        }

        // ═════════════════════════════════════════════════════════════════════
        // 2. SHORTCUT COMMAND: !SALDO
        // ═════════════════════════════════════════════════════════════════════
        if (in_array($lower, ['!saldo', '/saldo', 'saldo', 'cek saldo', 'total saldo', '!wallet', '/wallet', 'wallet'])) {
            $walletsList = collect($wallets)->map(fn ($w) => "• {$w['name']} : {$w['balance_formatted']}")->join("\n");
            $total = $summary['total_balance_formatted'] ?? 'Rp 0';

            $saldoText = "💰 RINGKASAN SALDO SELURUH DOMPET\n\n" .
                ($walletsList ?: "• Belum ada dompet aktif") . "\n\n" .
                "💵 Total Saldo Keseluruhan : {$total}\n\n" .
                "Data disinkronkan langsung dari database terkini.";

            return ['type' => 'text', 'text' => $saldoText, 'structured_data' => null];
        }

        // ═════════════════════════════════════════════════════════════════════
        // 3. SHORTCUT COMMAND: !TARGET
        // ═════════════════════════════════════════════════════════════════════
        if (in_array($lower, ['!target', '/target', 'target', '!goals', '/goals', 'goals', 'target tabungan'])) {
            if (empty($goals)) {
                return [
                    'type' => 'text',
                    'text' => "🎯 TARGET TABUNGAN\n\nAnda belum memiliki target tabungan aktif. Buat target tabungan baru di menu Target Tabungan untuk mulai menabung.",
                    'structured_data' => null
                ];
            }

            $goalsList = collect($goals)->map(function ($g) {
                $deadline = $g['target_date'] ? "\n  Target selesai: {$g['target_date']}" : "";
                
                return "🎯 {$g['name']}\n" .
                    "  Progres : {$g['progress_percent']}%\n" .
                    "  Terkumpul : {$g['current_formatted']} dari {$g['target_formatted']}\n" .
                    "  Sisa yang dibutuhkan : {$g['remaining_formatted']}{$deadline}";
            })->join("\n\n");

            $targetText = "🎯 STATUS DAN PROGRES TARGET TABUNGAN\n\n" . $goalsList . "\n\n" .
                "💡 Ketik misalnya: Nabung target 50rb untuk langsung mencatat tabungan.";

            return ['type' => 'text', 'text' => $targetText, 'structured_data' => null];
        }

        // ═════════════════════════════════════════════════════════════════════
        // 4. SHORTCUT COMMAND: !TRANSAKSI
        // ═════════════════════════════════════════════════════════════════════
        if (in_array($lower, ['!transaksi', '/transaksi', 'transaksi', '!mutasi', '/mutasi', 'mutasi', 'riwayat'])) {
            if (empty($transactions)) {
                return [
                    'type' => 'text',
                    'text' => "🧾 MUTASI TRANSAKSI TERAKHIR\n\nBelum ada transaksi tercatat di akun Anda.",
                    'structured_data' => null
                ];
            }

            $trxList = collect($transactions)->map(function ($t) {
                $sign = $t['type'] === 'income' ? '+ ' : '- ';
                return "{$sign}{$t['amount_formatted']} | {$t['category']} ({$t['wallet']})\n{$t['date']} • {$t['description']}";
            })->join("\n\n");

            $trxText = "🧾 10 MUTASI TRANSAKSI TERAKHIR\n\n" . $trxList;

            return ['type' => 'text', 'text' => $trxText, 'structured_data' => null];
        }

        // ═════════════════════════════════════════════════════════════════════
        // 5. SHORTCUT COMMAND: !REKAP
        // ═════════════════════════════════════════════════════════════════════
        if (in_array($lower, ['!rekap', '/rekap', 'rekap', '!bulanini', '/bulanini', 'laporan bulan ini', 'arus kas'])) {
            $month = $summary['month_name'] ?? now()->translatedFormat('F Y');
            $inc = $summary['monthly_income_formatted'] ?? 'Rp 0';
            $exp = $summary['monthly_expense_formatted'] ?? 'Rp 0';
            $net = $summary['monthly_net_formatted'] ?? 'Rp 0';
            $status = $summary['monthly_status'] ?? 'Surplus';

            $rekapText = "📊 REKAP KEUANGAN BULAN {$month}\n\n" .
                "• Total Pemasukan : {$inc}\n" .
                "• Total Pengeluaran : {$exp}\n" .
                "• Arus Kas Bersih : {$net} ({$status})\n\n" .
                "💡 Tips Finansial: " . ($status === 'Surplus (+)' 
                    ? "Arus kas Anda surplus bulan ini. Pertahankan dan alokasikan sebagian ke Target Tabungan."
                    : "Pengeluaran melebihi pemasukan bulan ini. Cek kembali pos pengeluaran terbesar Anda.");

            return ['type' => 'text', 'text' => $rekapText, 'structured_data' => null];
        }

        // ═════════════════════════════════════════════════════════════════════
        // 6. SHORTCUT COMMAND: !KATEGORI
        // ═════════════════════════════════════════════════════════════════════
        if (in_array($lower, ['!kategori', '/kategori', 'kategori', 'daftar kategori'])) {
            $expCats = implode(', ', $categories['expense'] ?? ['Makanan', 'Transportasi', 'Belanja', 'Tagihan']);
            $incCats = implode(', ', $categories['income'] ?? ['Gaji', 'Bonus', 'Penjualan', 'Investasi']);

            $catText = "🏷️ DAFTAR KATEGORI TRANSAKSI\n\n" .
                "Pengeluaran:\n{$expCats}\n\n" .
                "Pemasukan:\n{$incCats}";

            return ['type' => 'text', 'text' => $catText, 'structured_data' => null];
        }

        // ═════════════════════════════════════════════════════════════════════
        // 7. SHORTCUT COMMAND: !PROFIL
        // ═════════════════════════════════════════════════════════════════════
        if (in_array($lower, ['!profil', '/profil', 'profil', '!me', '/me', 'siapa saya'])) {
            $googleStatus = !empty($user['is_google_linked']) ? 'Terhubung Google' : 'Akun Email';
            $profText = "👤 PROFIL PENGGUNA DAN STATUS SISTEM\n\n" .
                "• Nama : {$user['name']}\n" .
                "• Email : {$user['email']}\n" .
                "• Metode Auth : {$googleStatus}\n" .
                "• Terdaftar Sejak : {$user['joined_at']}\n" .
                "• Jumlah Dompet : {$summary['wallet_count']} Dompet Aktif\n" .
                "• Total Saldo : {$summary['total_balance_formatted']}";

            return ['type' => 'text', 'text' => $profText, 'structured_data' => null];
        }

        // ═════════════════════════════════════════════════════════════════════
        // 8. SHORTCUT COMMAND: !INPUT
        // ═════════════════════════════════════════════════════════════════════
        if (in_array($lower, ['!input', '/input', 'input', '!catat', '/catat', 'cara catat'])) {
            $inputText = "✍️ PANDUAN CEPAT MENCATAT TRANSAKSI\n\n" .
                "Anda cukup mengetik pesan alami, contohnya:\n\n" .
                "1. Pengeluaran:\n" .
                "   Beli kuota 50rb pake Dompet Utama\n" .
                "   Makan siang nasi padang 25.000\n" .
                "   Beli bensin pertalite 30rb\n\n" .
                "2. Pemasukan:\n" .
                "   Gaji bulanan 5.000.000 ke Rekening Utama\n" .
                "   Dapat bonus 500rb\n\n" .
                "3. Menabung ke Target:\n" .
                "   Nabung 100rb untuk Target Beli Laptop\n\n" .
                "4. Foto Struk Belanja:\n" .
                "   Klik tombol kamera di bawah untuk memindai struk belanja fisik.";

            return ['type' => 'text', 'text' => $inputText, 'structured_data' => null];
        }

        // ═════════════════════════════════════════════════════════════════════
        // 9. DETEKSI PARSING TRANSAKSI LOKAL (Jika ada nominal uang)
        // ═════════════════════════════════════════════════════════════════════
        $matchedWallet = $defaultWallet;
        foreach ($wallets as $w) {
            if (Str::contains(strtolower($prompt), strtolower($w['name']))) {
                $matchedWallet = $w;
                break;
            }
        }

        $hasNominal   = preg_match('/(\d+[\.\d]*)\s*(rb|ribu|k|jt|juta)?/i', $prompt, $matches);
        $isReceiptScan = !empty($imageAbsolutePath);

        if ($isReceiptScan || $hasNominal) {
            $rawAmount = 50000;
            if (!empty($matches[1])) {
                $num  = (float) str_replace('.', '', $matches[1]);
                $unit = strtolower($matches[2] ?? '');
                if ($unit === 'rb' || $unit === 'ribu' || $unit === 'k') {
                    $num *= 1000;
                } elseif ($unit === 'jt' || $unit === 'juta') {
                    $num *= 1000000;
                }
                $rawAmount = $num > 0 ? $num : 50000;
            } elseif ($isReceiptScan) {
                $rawAmount = 75000;
            }

            $trxType = 'expense';
            if (Str::contains($lower, ['pemasukan', 'masuk', 'terima', 'dapat', 'gaji', 'bonus', 'omset', 'penjualan', 'cashback', 'transfer masuk', 'in', 'diberi', 'dapat uang'])) {
                $trxType = 'income';
            }

            $categoryName = $trxType === 'income' ? 'Pemasukan' : 'Pengeluaran Umum';
            $merchant = null;
            $note     = $prompt;

            if ($isReceiptScan) {
                $categoryName = 'Pengeluaran Struk OCR';
                $merchant     = 'Hasil Scan Struk';
                $note         = 'Hasil Pemindaian Struk Belanja';
            } else {
                if (Str::contains($lower, ['kuota', 'pulsa', 'internet', 'paket data'])) {
                    $categoryName = 'Internet & Kuota';
                } elseif (Str::contains($lower, ['makan', 'kopi', 'nasi', 'resto', 'cafe', 'sarapan', 'jajan'])) {
                    $categoryName = 'Makanan & Minuman';
                } elseif (Str::contains($lower, ['bensin', 'spbu', 'pertalite', 'pertamax', 'gojek', 'grab', 'parkir', 'tol'])) {
                    $categoryName = 'Transportasi & BBM';
                } elseif (Str::contains($lower, ['gaji', 'bonus', 'omset', 'penjualan', 'freelance'])) {
                    $categoryName = 'Gaji & Pendapatan';
                } elseif (Str::contains($lower, ['listrik', 'pln', 'air', 'pdam', 'kontrakan', 'sewa'])) {
                    $categoryName = 'Tagihan & Utilitas';
                }
            }

            return [
                'type' => 'receipt',
                'text' => "Hasil analisis transaksi:",
                'structured_data' => [
                    'type'             => $trxType,
                    'merchant'         => $merchant,
                    'category'         => $categoryName,
                    'amount'           => $rawAmount,
                    'amount_formatted' => 'Rp ' . number_format($rawAmount, 0, ',', '.'),
                    'wallet_id'        => $matchedWallet['id'] ?? null,
                    'wallet_name'      => $matchedWallet['name'] ?? $defaultWallet['name'],
                    'date'             => now()->translatedFormat('d M Y'),
                    'note'             => $note,
                ],
            ];
        }

        // ═════════════════════════════════════════════════════════════════════
        // 10. DEFAULT CONVERSATION FALLBACK
        // ═════════════════════════════════════════════════════════════════════
        $responseText = "Halo {$user['name']}! Saya membaca pesan Anda: {$prompt}\n\n" .
            "💡 Ketik !help untuk melihat seluruh perintah shortcut, atau ketik langsung transaksi seperti Makan siang 35rb.";

        return [
            'type'            => 'text',
            'text'            => $responseText,
            'structured_data' => null,
        ];
    }
}
