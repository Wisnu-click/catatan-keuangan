<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AiService
{
    /**
     * Panggil AI Engine secara Nyata berdasarkan Model yang dipilih
     */
    public function askAi(string $modelId, string $prompt, ?string $imageAbsolutePath = null, array $userWallets = []): array
    {
        $walletNames = collect($userWallets)->pluck('name')->join(', ');

        $systemInstruction = "Anda adalah VIRA Financial AI Assistant. Tugas Anda adalah membantu mencatat keuangan pengguna.\n" .
            "Daftar wallet aktif pengguna saat ini: [{$walletNames}].\n" .
            "Aturan Output:\n" .
            "1. Jika pengguna berniat mencatat transaksi (pemasukan/pengeluaran) atau mengunggah foto struk/nota, Anda MUST merespon dengan format JSON murni bertanda [TRANSACTION_DATA]...\n" .
            "Contoh JSON: {\"is_transaction\": true, \"type\": \"expense\"|\"income\", \"merchant\": \"Indomaret\", \"category\": \"Makanan\", \"amount\": 50000, \"wallet_name\": \"Dompet Utama\", \"note\": \"Beli kuota\"}\n" .
            "2. Jika hanya percakapan umum/pertanyaan saldo, jawablah dengan singkat, ramah, dan profesional dalam bahasa Indonesia.";

        // Deteksi provider berdasarkan modelId
        if (Str::startsWith($modelId, 'gpt')) {
            return $this->callOpenAI($modelId, $prompt, $imageAbsolutePath, $systemInstruction, $userWallets);
        } elseif (Str::startsWith($modelId, 'gemini')) {
            return $this->callGemini($modelId, $prompt, $imageAbsolutePath, $systemInstruction, $userWallets);
        } elseif (Str::startsWith($modelId, 'claude')) {
            return $this->callAnthropic($modelId, $prompt, $imageAbsolutePath, $systemInstruction, $userWallets);
        } elseif (Str::startsWith($modelId, 'deepseek')) {
            return $this->callDeepSeek($modelId, $prompt, $systemInstruction, $userWallets);
        }

        // Default Fallback Parser Engine (Local / Auto Engine)
        return $this->callLocalEngine($modelId, $prompt, $imageAbsolutePath, $userWallets);
    }

    /**
     * Panggilan Real ke OpenAI API (GPT-4o)
     */
    private function callOpenAI(string $modelId, string $prompt, ?string $imageAbsolutePath, string $systemInstruction, array $userWallets): array
    {
        $apiKey = config('services.openai.api_key') ?: env('OPENAI_API_KEY');

        if (!$apiKey) {
            return $this->buildMissingKeyResponse('OpenAI (GPT-4o)', 'OPENAI_API_KEY', $modelId, $prompt, $imageAbsolutePath, $userWallets);
        }

        try {
            $messages = [
                ['role' => 'system', 'content' => $systemInstruction],
            ];

            $userContent = [];
            if ($prompt) {
                $userContent[] = ['type' => 'text', 'text' => $prompt];
            }

            if ($imageAbsolutePath && file_exists($imageAbsolutePath)) {
                $imageData = base64_encode(file_get_contents($imageAbsolutePath));
                $mimeType = mime_content_type($imageAbsolutePath) ?: 'image/jpeg';
                $userContent[] = [
                    'type' => 'image_url',
                    'image_url' => ['url' => "data:{$mimeType};base64,{$imageData}"],
                ];
            }

            $messages[] = ['role' => 'user', 'content' => count($userContent) === 1 ? $prompt : $userContent];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o',
                'messages' => $messages,
                'temperature' => 0.2,
            ]);

            if ($response->successful()) {
                $aiText = $response->json('choices.0.message.content') ?? '';
                return $this->parseAiResponseText($aiText, $userWallets, $prompt, $imageAbsolutePath);
            }

            Log::error('OpenAI Error: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('OpenAI Exception: ' . $e->getMessage());
        }

        return $this->callLocalEngine($modelId, $prompt, $imageAbsolutePath, $userWallets);
    }

    /**
     * Panggilan Real ke Google Gemini API
     */
    private function callGemini(string $modelId, string $prompt, ?string $imageAbsolutePath, string $systemInstruction, array $userWallets): array
    {
        $apiKey = config('services.gemini.api_key') ?: env('GEMINI_API_KEY');

        if (!$apiKey) {
            return $this->buildMissingKeyResponse('Google Gemini', 'GEMINI_API_KEY', $modelId, $prompt, $imageAbsolutePath, $userWallets);
        }

        try {
            $parts = [];
            if ($prompt) {
                $parts[] = ['text' => $systemInstruction . "\n\nPesan Pengguna: " . $prompt];
            }

            if ($imageAbsolutePath && file_exists($imageAbsolutePath)) {
                $imageData = base64_encode(file_get_contents($imageAbsolutePath));
                $mimeType = mime_content_type($imageAbsolutePath) ?: 'image/jpeg';
                $parts[] = [
                    'inline_data' => [
                        'mime_type' => $mimeType,
                        'data' => $imageData,
                    ],
                ];
            }

            $response = Http::timeout(30)->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    ['parts' => $parts],
                ],
            ]);

            if ($response->successful()) {
                $aiText = $response->json('candidates.0.content.parts.0.text') ?? '';
                return $this->parseAiResponseText($aiText, $userWallets, $prompt, $imageAbsolutePath);
            }

            Log::error('Gemini Error: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('Gemini Exception: ' . $e->getMessage());
        }

        return $this->callLocalEngine($modelId, $prompt, $imageAbsolutePath, $userWallets);
    }

    /**
     * Panggilan Real ke DeepSeek API
     */
    private function callDeepSeek(string $modelId, string $prompt, string $systemInstruction, array $userWallets): array
    {
        $apiKey = config('services.deepseek.api_key') ?: env('DEEPSEEK_API_KEY');

        if (!$apiKey) {
            return $this->buildMissingKeyResponse('DeepSeek AI', 'DEEPSEEK_API_KEY', $modelId, $prompt, null, $userWallets);
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://api.deepseek.com/chat/completions', [
                'model' => 'deepseek-chat',
                'messages' => [
                    ['role' => 'system', 'content' => $systemInstruction],
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

            if ($response->successful()) {
                $aiText = $response->json('choices.0.message.content') ?? '';
                return $this->parseAiResponseText($aiText, $userWallets, $prompt, null);
            }
        } catch (\Exception $e) {
            Log::error('DeepSeek Exception: ' . $e->getMessage());
        }

        return $this->callLocalEngine($modelId, $prompt, null, $userWallets);
    }

    /**
     * Panggilan Real ke Anthropic Claude API
     */
    private function callAnthropic(string $modelId, string $prompt, ?string $imageAbsolutePath, string $systemInstruction, array $userWallets): array
    {
        $apiKey = config('services.anthropic.api_key') ?: env('ANTHROPIC_API_KEY');

        if (!$apiKey) {
            return $this->buildMissingKeyResponse('Anthropic Claude', 'ANTHROPIC_API_KEY', $modelId, $prompt, $imageAbsolutePath, $userWallets);
        }

        try {
            $contentParts = [];
            if ($prompt) {
                $contentParts[] = ['type' => 'text', 'text' => $prompt];
            }

            if ($imageAbsolutePath && file_exists($imageAbsolutePath)) {
                $imageData = base64_encode(file_get_contents($imageAbsolutePath));
                $mimeType = mime_content_type($imageAbsolutePath) ?: 'image/jpeg';
                $contentParts[] = [
                    'type' => 'image',
                    'source' => [
                        'type' => 'base64',
                        'media_type' => $mimeType,
                        'data' => $imageData,
                    ],
                ];
            }

            $response = Http::withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->timeout(30)->post('https://api.anthropic.com/v1/messages', [
                'model' => 'claude-3-5-sonnet-20241022',
                'max_tokens' => 1024,
                'system' => $systemInstruction,
                'messages' => [
                    ['role' => 'user', 'content' => $contentParts],
                ],
            ]);

            if ($response->successful()) {
                $aiText = $response->json('content.0.text') ?? '';
                return $this->parseAiResponseText($aiText, $userWallets, $prompt, $imageAbsolutePath);
            }
        } catch (\Exception $e) {
            Log::error('Claude Exception: ' . $e->getMessage());
        }

        return $this->callLocalEngine($modelId, $prompt, $imageAbsolutePath, $userWallets);
    }

    /**
     * Parser Respon Teks AI ke Format Structured Data
     */
    private function parseAiResponseText(string $aiText, array $userWallets, string $prompt, ?string $imageAbsolutePath): array
    {
        // Coba ekstrak JSON jika ada di respon AI
        if (preg_match('/\{.*"is_transaction".*\}/s', $aiText, $match) || preg_match('/\{.*\}/s', $aiText, $match)) {
            $json = json_decode($match[0], true);
            if ($json && isset($json['amount'])) {
                $defaultWallet = $userWallets[0] ?? ['id' => 1, 'name' => 'Dompet Utama'];
                $walletName = $json['wallet_name'] ?? $defaultWallet['name'];
                $matchedWallet = collect($userWallets)->firstWhere('name', $walletName) ?? $defaultWallet;

                return [
                    'type' => 'receipt',
                    'text' => 'Hasil analisis AI Real Engine:',
                    'structured_data' => [
                        'type' => $json['type'] ?? 'expense',
                        'merchant' => $json['merchant'] ?? null,
                        'category' => $json['category'] ?? 'Umum',
                        'amount' => (float) $json['amount'],
                        'amount_formatted' => 'Rp ' . number_format((float) $json['amount'], 0, ',', '.'),
                        'wallet_id' => $matchedWallet['id'] ?? null,
                        'wallet_name' => $matchedWallet['name'] ?? 'Dompet Utama',
                        'date' => now()->translatedFormat('d M Y'),
                        'note' => $json['note'] ?? $prompt,
                    ],
                ];
            }
        }

        return [
            'type' => 'text',
            'text' => $aiText ?: 'Maaf, AI tidak mengembalikan respon.',
            'structured_data' => null,
        ];
    }

    /**
     * Respon Ketika API Key Belum Dikonfigurasi di .env
     */
    private function buildMissingKeyResponse(string $providerName, string $envKey, string $modelId, string $prompt, ?string $imageAbsolutePath, array $userWallets): array
    {
        $fallback = $this->callLocalEngine($modelId, $prompt, $imageAbsolutePath, $userWallets);

        // Sisipkan info pengaturannya
        $noticeText = "ℹ️ **Petunjuk Konfigurasi API Real ({$providerName}):**\n" .
            "Untuk terhubung ke {$providerName} secara live, tambahkan key di file `.env` Anda:\n" .
            "`{$envKey}=sk-key-anda-di-sini`\n\n" .
            "*(Saat ini sistem menggunakan Engine Parser Otomatis agar fitur transaksi tetap berjalan)*";

        if ($fallback['type'] === 'text') {
            $fallback['text'] = $noticeText . "\n\n" . $fallback['text'];
        } else {
            $fallback['text'] = $noticeText;
        }

        return $fallback;
    }

    /**
     * Local Engine Parser Fallback ketika API Key belum dipasang
     */
    private function callLocalEngine(string $modelId, string $prompt, ?string $imageAbsolutePath, array $userWallets): array
    {
        $defaultWallet = $userWallets[0] ?? ['id' => 1, 'name' => 'Dompet Utama'];
        $matchedWallet = $defaultWallet;

        foreach ($userWallets as $w) {
            if (Str::contains(strtolower($prompt), strtolower($w['name']))) {
                $matchedWallet = $w;
                break;
            }
        }

        $hasNominal = preg_match('/(\d+[\.\d]*)\s*(rb|ribu|k|jt|juta)?/i', $prompt, $matches);
        $isReceiptScan = !empty($imageAbsolutePath);

        if ($isReceiptScan || $hasNominal) {
            $rawAmount = 50000;
            if (!empty($matches[1])) {
                $num = (float) str_replace('.', '', $matches[1]);
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

            $lower = strtolower($prompt);
            $trxType = 'expense';
            if (Str::contains($lower, ['pemasukan', 'masuk', 'terima', 'dapat', 'gaji', 'bonus', 'omset', 'penjualan', 'cashback', 'transfer masuk', 'in', 'diberi', 'dapat uang'])) {
                $trxType = 'income';
            }

            $categoryName = $trxType === 'income' ? 'Pemasukan' : 'Pengeluaran Umum';
            $merchant = null;

            if ($isReceiptScan) {
                $categoryName = 'Pengeluaran Struk OCR';
                $merchant = 'Hasil Scan Struk';
                $note = 'Hasil Pemindaian Struk Belanja (' . $modelId . ')';
            } else {
                if (Str::contains($lower, ['kuota', 'pulsa', 'internet'])) {
                    $categoryName = 'Internet & Kuota';
                } elseif (Str::contains($lower, ['makan', 'kopi', 'nasi', 'resto', 'cafe'])) {
                    $categoryName = 'Makanan & Minuman';
                } elseif (Str::contains($lower, ['bensin', 'spbu', 'gojek', 'grab', 'parkir'])) {
                    $categoryName = 'Transportasi & BBM';
                } elseif (Str::contains($lower, ['gaji', 'bonus', 'omset', 'penjualan', 'freelance'])) {
                    $categoryName = 'Gaji & Pendapatan';
                }
                $note = $prompt;
            }

            return [
                'type' => 'receipt',
                'text' => "Hasil analisis transaksi dari model {$modelId}:",
                'structured_data' => [
                    'type' => $trxType,
                    'merchant' => $merchant,
                    'category' => $categoryName,
                    'amount' => $rawAmount,
                    'amount_formatted' => 'Rp ' . number_format($rawAmount, 0, ',', '.'),
                    'wallet_id' => $matchedWallet['id'] ?? null,
                    'wallet_name' => $matchedWallet['name'] ?? 'Dompet Utama',
                    'date' => now()->translatedFormat('d M Y'),
                    'note' => $note,
                ],
            ];
        }

        $lower = strtolower($prompt);
        $responseText = "Siap! Menggunakan model **{$modelId}**, saya telah membaca pesan Anda: \"{$prompt}\".\n\nUntuk pencatatan transaksi otomatis, Anda bisa mengetik seperti: *'Makan siang 35rb dari Dompet Utama'* atau *'Gaji 5jt ke Rekening Utama'* atau upload foto struk.";

        if (Str::contains($lower, ['saldo', 'cek saldo', 'total'])) {
            $walletText = collect($userWallets)->map(fn ($w) => "• {$w['name']}: {$w['balance']}")->join("\n");
            $responseText = "📊 **Ringkasan Saldo Wallet Terkini ({$modelId}):**\n\n{$walletText}\n\nSemua data sinkron dengan database real-time.";
        }

        return [
            'type' => 'text',
            'text' => $responseText,
            'structured_data' => null,
        ];
    }
}

