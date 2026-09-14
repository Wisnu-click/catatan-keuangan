<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ChatMessage;
use App\Models\SavingReminder;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    /**
     * Tampilkan Halaman Chat AI Assistant dengan Model Dinamis dari .env
     */
    public function index(): Response
    {
        $user = Auth::user();

        $wallets = Wallet::where('user_id', $user->id)
            ->where('is_active', true)
            ->get()
            ->map(fn ($w) => [
                'id' => $w->id,
                'name' => $w->name,
                'balance' => 'Rp ' . number_format($w->current_balance, 0, ',', '.'),
                'current_balance' => (float) $w->current_balance,
            ]);

        // Cek OpenRouter API Key (1 key untuk semua model)
        $openrouterKey = config('services.openrouter.api_key') ?: env('OPENROUTER_API_KEY');
        $hasOrKey      = !empty($openrouterKey);
        $defaultModel  = env('DEFAULT_AI_MODEL', 'openai/gpt-4o');

        $liveBadge = $hasOrKey ? 'VIA OPENROUTER' : 'ENGINE LOKAL';
        $liveDesc  = fn(string $desc) => $hasOrKey
            ? $desc . ' (via OpenRouter — 1 key untuk semua model)'
            : 'OPENROUTER_API_KEY belum diisi di .env. Menggunakan parser lokal.';

        // Semua model menggunakan OpenRouter model ID
        $allModels = [
            [
                'id'          => 'openai/gpt-4o',
                'name'        => 'GPT-4o',
                'provider'    => 'OpenAI via OpenRouter',
                'has_key'     => $hasOrKey,
                'badge'       => $liveBadge,
                'icon'        => 'smart_toy',
                'description' => $liveDesc('Model terkuat OpenAI. Multimodal, mendukung foto struk.'),
            ],
            [
                'id'          => 'openai/gpt-4o-mini',
                'name'        => 'GPT-4o Mini',
                'provider'    => 'OpenAI via OpenRouter',
                'has_key'     => $hasOrKey,
                'badge'       => $hasOrKey ? 'HEMAT & CEPAT' : 'ENGINE LOKAL',
                'icon'        => 'flash_on',
                'description' => $liveDesc('Versi ringan GPT-4o. Lebih hemat kredit, tetap akurat.'),
            ],
            [
                'id'          => 'google/gemini-pro-1.5',
                'name'        => 'Gemini 1.5 Pro',
                'provider'    => 'Google via OpenRouter',
                'has_key'     => $hasOrKey,
                'badge'       => $liveBadge,
                'icon'        => 'auto_awesome',
                'description' => $liveDesc('Google Gemini 1.5 Pro. Konteks panjang, analisis mendalam.'),
            ],
            [
                'id'          => 'google/gemini-flash-1.5',
                'name'        => 'Gemini 1.5 Flash',
                'provider'    => 'Google via OpenRouter',
                'has_key'     => $hasOrKey,
                'badge'       => $hasOrKey ? 'GRATIS & CEPAT' : 'ENGINE LOKAL',
                'icon'        => 'bolt',
                'description' => $liveDesc('Gemini Flash — paling cepat dari Google, cocok untuk scanning struk.'),
            ],
            [
                'id'          => 'anthropic/claude-3.5-sonnet',
                'name'        => 'Claude 3.5 Sonnet',
                'provider'    => 'Anthropic via OpenRouter',
                'has_key'     => $hasOrKey,
                'badge'       => $liveBadge,
                'icon'        => 'psychology',
                'description' => $liveDesc('Anthropic Claude 3.5 Sonnet. Terbaik untuk penalaran logika finansial.'),
            ],
            [
                'id'          => 'deepseek/deepseek-chat',
                'name'        => 'DeepSeek V3',
                'provider'    => 'DeepSeek via OpenRouter',
                'has_key'     => $hasOrKey,
                'badge'       => $liveBadge,
                'icon'        => 'memory',
                'description' => $liveDesc('DeepSeek V3. Model open-source terkuat, efisien dan murah.'),
            ],
            [
                'id'          => 'raw-logic-core',
                'name'        => 'VIRA Core AI',
                'provider'    => 'Local Database Engine',
                'has_key'     => true,
                'badge'       => 'LOKAL NATIVE',
                'icon'        => 'dns',
                'description' => 'Engine parser internal tanpa API. Terintegrasi langsung ke database MySQL.',
            ],
        ];

        // Ambil riwayat chat pengguna dari database
        $dbMessages = ChatMessage::where('user_id', $user->id)
            ->orderBy('created_at', 'asc')
            ->get();

        // Jika belum ada riwayat chat, buat pesan sambutan pertama di DB
        if ($dbMessages->isEmpty()) {
            $welcomeMsg = ChatMessage::create([
                'user_id' => $user->id,
                'sender' => 'ai',
                'type' => 'text',
                'content' => "Halo {$user->name}! Saya VIRA AI Assistant 🤖.\nSaya siap membantu mengelola dan mencatat keuangan Anda.\n\n💡 Pilihan Perintah Cepat:\n• !help : Daftar semua perintah shortcut\n• !saldo : Cek saldo seluruh dompet dan total dana\n• !target : Cek progres target tabungan\n• !rekap : Rekap arus kas bulan ini\n• !transaksi : 10 mutasi transaksi terakhir\n\nAtau langsung ketik transaksi seperti: Makan siang 35rb dari Dompet Utama, atau kirim foto struk belanja.",
                'ai_model' => $defaultModel,
                'is_confirmed' => false,
            ]);

            $dbMessages = collect([$welcomeMsg]);
        }

        // Format pesan untuk dikirim ke Inertia React
        $messages = $dbMessages->map(function ($msg) {
            return [
                'id' => $msg->id,
                'sender' => $msg->sender,
                'type' => $msg->type,
                'text' => $msg->content,
                'image' => $msg->image_path ? asset($msg->image_path) : null,
                'structured_data' => $msg->structured_data,
                'ai_model' => $msg->ai_model,
                'confirmed' => $msg->is_confirmed,
                'transaction_id' => $msg->transaction_id,
                'timestamp' => $msg->created_at->format('H:i'),
                'created_at' => $msg->created_at->toDateTimeString(),
            ];
        })->values()->toArray();

        return Inertia::render('Chat/Index', [
            'userName' => $user->name,
            'wallets' => $wallets->values()->toArray(),
            'aiModels' => $allModels,
            'defaultModel' => $defaultModel,
            'initialMessages' => $messages,
        ]);
    }

    /**
     * Kirim Pesan / Struk Baru dan Simpan ke DB menggunakan Live AI Engine
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'content' => ['nullable', 'string', 'max:2000'],
            'ai_model' => ['nullable', 'string', 'max:50'],
            'image' => ['nullable', 'image', 'max:5120'],
            'has_preset_image' => ['nullable', 'boolean'],
        ]);

        $user = Auth::user();
        $defaultModel = env('DEFAULT_AI_MODEL', 'gpt-4o');
        $aiModel = $request->input('ai_model', $defaultModel);
        $content = trim($request->input('content', ''));
        $imagePath = null;

        // Process image upload if provided
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('receipts', 'public');
            $imagePath = 'storage/' . $path;
        } elseif ($request->boolean('has_preset_image')) {
            $imagePath = 'storage/receipts/sample_receipt.png';
        }

        // 1. Simpan Pesan Pengguna ke DB
        $userMsgType = $imagePath ? 'image' : 'text';
        ChatMessage::create([
            'user_id' => $user->id,
            'sender' => 'user',
            'type' => $userMsgType,
            'content' => $content ?: ($imagePath ? 'Mengirim foto struk belanja' : ''),
            'image_path' => $imagePath,
            'ai_model' => $aiModel,
        ]);

        // 2. Kumpulkan Dataset Lengkap Pengguna dari Database untuk AI
        $userContext = $this->buildUserFinancialContext($user);

        $imageAbsPath = null;
        if ($imagePath && file_exists(public_path($imagePath))) {
            $imageAbsPath = public_path($imagePath);
        }

        $aiService = new AiService();
        $aiResult = $aiService->askAi($aiModel, $content, $imageAbsPath, $userContext);

        // 3. Simpan Pesan Respon AI ke DB
        ChatMessage::create([
            'user_id' => $user->id,
            'sender' => 'ai',
            'type' => $aiResult['type'], // 'text' or 'receipt'
            'content' => $aiResult['text'],
            'structured_data' => $aiResult['structured_data'] ?? null,
            'ai_model' => $aiModel,
            'is_confirmed' => false,
        ]);

        return redirect()->route('chat.index')->with('success', 'Pesan terproses oleh ' . $aiModel);
    }

    /**
     * Kumpulkan Dataset Lengkap Pengguna dari Database untuk AI
     */
    private function buildUserFinancialContext($user): array
    {
        // 1. Wallets
        $wallets = Wallet::where('user_id', $user->id)
            ->where('is_active', true)
            ->get();
        $totalBalance = $wallets->sum('current_balance');
        $walletsData = $wallets->map(fn ($w) => [
            'id' => $w->id,
            'name' => $w->name,
            'type' => $w->type ?? 'general',
            'current_balance' => (float) $w->current_balance,
            'balance_formatted' => 'Rp ' . number_format($w->current_balance, 0, ',', '.'),
        ])->toArray();

        // 2. Savings Goals (Target Tabungan)
        $goals = SavingsGoal::where('user_id', $user->id)
            ->with('contributions')
            ->get()
            ->map(function ($g) {
                $current = (float) $g->contributions->sum('amount');
                $target = (float) $g->target_amount;
                $pct = $target > 0 ? round(($current / $target) * 100, 1) : 0;
                $remaining = max(0, $target - $current);
                return [
                    'id' => $g->id,
                    'name' => $g->name,
                    'target_amount' => $target,
                    'target_formatted' => 'Rp ' . number_format($target, 0, ',', '.'),
                    'current_amount' => $current,
                    'current_formatted' => 'Rp ' . number_format($current, 0, ',', '.'),
                    'remaining_formatted' => 'Rp ' . number_format($remaining, 0, ',', '.'),
                    'progress_percent' => $pct,
                    'target_date' => $g->target_date ? $g->target_date->format('d M Y') : null,
                    'status' => $g->status ?? 'active',
                ];
            })->toArray();

        // 3. Transaksi Terakhir (10 transaksi terbaru)
        $recentTransactions = Transaction::where('user_id', $user->id)
            ->with(['wallet', 'category'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->take(10)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'date' => $t->transaction_date ? $t->transaction_date->format('d M Y') : $t->created_at->format('d M Y'),
                'type' => $t->type,
                'amount' => (float) $t->amount,
                'amount_formatted' => 'Rp ' . number_format($t->amount, 0, ',', '.'),
                'category' => $t->category->name ?? 'Umum',
                'wallet' => $t->wallet->name ?? 'Dompet Utama',
                'description' => $t->description ?? '-',
            ])->toArray();

        // 4. Rekap Keuangan Bulan Berjalan
        $startOfMonth = now()->startOfMonth()->toDateString();
        $endOfMonth = now()->endOfMonth()->toDateString();
        $monthlyIncome = (float) Transaction::where('user_id', $user->id)
            ->where('type', 'income')
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');
        $monthlyExpense = (float) Transaction::where('user_id', $user->id)
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');
        $monthlyNet = $monthlyIncome - $monthlyExpense;

        // 5. Kategori
        $categories = Category::where('user_id', $user->id)
            ->get()
            ->groupBy('type')
            ->map(fn ($group) => $group->pluck('name')->toArray())
            ->toArray();

        // 6. Saving Reminders (Program Nabung Konsisten)
        $reminders = SavingReminder::where('user_id', $user->id)
            ->where('is_active', true)
            ->with('wallet')
            ->get()
            ->map(fn ($r) => [
                'title' => $r->title,
                'amount' => 'Rp ' . number_format($r->amount, 0, ',', '.'),
                'frequency' => $r->frequency,
                'wallet' => $r->wallet->name ?? '-',
            ])->toArray();

        return [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'joined_at' => $user->created_at ? $user->created_at->format('d M Y') : '-',
                'is_google_linked' => !empty($user->google_id),
            ],
            'summary' => [
                'total_balance' => (float) $totalBalance,
                'total_balance_formatted' => 'Rp ' . number_format($totalBalance, 0, ',', '.'),
                'wallet_count' => count($walletsData),
                'month_name' => now()->translatedFormat('F Y'),
                'monthly_income_formatted' => 'Rp ' . number_format($monthlyIncome, 0, ',', '.'),
                'monthly_expense_formatted' => 'Rp ' . number_format($monthlyExpense, 0, ',', '.'),
                'monthly_net_formatted' => 'Rp ' . number_format($monthlyNet, 0, ',', '.'),
                'monthly_status' => $monthlyNet >= 0 ? 'Surplus (+)' : 'Defisit (-)',
            ],
            'wallets' => $walletsData,
            'goals' => $goals,
            'recent_transactions' => $recentTransactions,
            'categories' => $categories,
            'saving_reminders' => $reminders,
        ];
    }

    /**
     * Konfirmasi Transaksi dari Card Struk AI dan Simpan ke DB Real
     */
    public function confirmReceipt(Request $request, ChatMessage $message)
    {
        $user = Auth::user();

        if ($message->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        if ($message->is_confirmed) {
            return redirect()->route('chat.index')->with('info', 'Transaksi sudah pernah dikonfirmasi.');
        }

        // 1. Ambil data struk dan override jika dikirim dari frontend
        $data = $message->structured_data ?? [];
        if (empty($data)) {
            return redirect()->route('chat.index')->with('error', 'Data struk tidak valid.');
        }

        $walletId = $request->input('wallet_id') ?? ($data['wallet_id'] ?? null);
        $trxType = $request->input('type') ?? ($data['type'] ?? 'expense');
        if (!in_array($trxType, ['income', 'expense'])) {
            $trxType = 'expense';
        }

        $amount = $request->has('amount') ? (float) $request->input('amount') : (float) ($data['amount'] ?? 0);
        
        if ($amount > 9999999999999) {
            return redirect()->route('chat.index')->with('error', 'Nominal transaksi melebihi batas maksimal (Rp 9,99 Triliun).');
        }

        $categoryName = $request->input('category') ?? ($data['category'] ?? ($trxType === 'income' ? 'Pemasukan' : 'Pengeluaran'));
        $note = $request->input('note') ?? ($data['note'] ?? ($data['merchant'] ? 'Struk: ' . $data['merchant'] : 'Transaksi AI Assistant'));

        // 2. Cari Wallet pengguna berdasarkan wallet_id terpilih
        $wallet = Wallet::where('id', $walletId)->where('user_id', $user->id)->first();
        if (!$wallet) {
            $wallet = Wallet::where('user_id', $user->id)->first();
        }

        if (!$wallet) {
            return redirect()->route('chat.index')->with('error', 'Tidak ada wallet aktif.');
        }

        // 3. Cari atau buat Kategori yang sesuai
        $category = Category::where('user_id', $user->id)
            ->where('name', $categoryName)
            ->where('type', $trxType)
            ->first();

        if (!$category) {
            $category = Category::create([
                'user_id' => $user->id,
                'wallet_id' => $wallet->id,
                'name' => $categoryName,
                'type' => $trxType,
                'icon' => $trxType === 'income' ? 'arrow_downward' : 'receipt_long',
                'color_hex' => $trxType === 'income' ? '#4ADE80' : '#8B5CF6',
                'is_active' => true,
            ]);
        }

        // 4. Buat Transaksi Real di Database (`transactions` table)
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'category_id' => $category->id,
            'type' => $trxType,
            'amount' => $amount,
            'description' => $note,
            'source' => 'api',
            'raw_input' => json_encode($data),
            'transaction_date' => now()->toDateString(),
        ]);

        \App\Services\NotificationService::notifyTransaction(
            $user->id,
            $trxType,
            $amount,
            $wallet->name,
            $wallet->id
        );

        // 5. Update data structured & status pesan AI menjadi confirmed di DB
        $updatedData = array_merge($data, [
            'type' => $trxType,
            'wallet_id' => $wallet->id,
            'wallet_name' => $wallet->name,
            'amount' => $amount,
            'amount_formatted' => 'Rp ' . number_format($amount, 0, ',', '.'),
            'category' => $categoryName,
            'note' => $note,
        ]);

        $message->update([
            'structured_data' => $updatedData,
            'is_confirmed' => true,
            'transaction_id' => $transaction->id,
        ]);

        return redirect()->route('chat.index')->with('success', 'Berhasil! Transaksi Rp ' . number_format($amount, 0, ',', '.') . ' telah dicatat ke ' . $wallet->name);
    }

    /**
     * Test konektivitas OpenRouter API — 1 key untuk semua model
     */
    public function testAiApi(Request $request): \Illuminate\Http\JsonResponse
    {
        $apiKey   = config('services.openrouter.api_key') ?: env('OPENROUTER_API_KEY');
        $siteUrl  = config('services.openrouter.site_url', 'http://localhost');
        $siteName = config('services.openrouter.site_name', 'VIRA Financial AI');

        // Jika key belum diisi
        if (!$apiKey) {
            return response()->json([
                'results'   => [
                    'openrouter' => [
                        'ok'      => false,
                        'label'   => 'OpenRouter API',
                        'message' => '⚠️ OPENROUTER_API_KEY belum diisi di file .env Anda.',
                        'env_key' => 'OPENROUTER_API_KEY',
                        'get_url' => 'https://openrouter.ai/keys',
                    ],
                ],
                'tested_at' => now()->format('H:i:s d/m/Y'),
                'is_openrouter' => true,
            ]);
        }

        $results   = [];
        // Model yang diuji (pilih model ringan/gratis untuk test ping)
        $testModels = [
            ['id' => 'openai/gpt-4o-mini',         'label' => 'GPT-4o Mini (OpenAI)'],
            ['id' => 'google/gemini-flash-1.5',     'label' => 'Gemini 1.5 Flash (Google)'],
            ['id' => 'anthropic/claude-3-haiku',    'label' => 'Claude 3 Haiku (Anthropic)'],
            ['id' => 'deepseek/deepseek-chat',      'label' => 'DeepSeek V3'],
        ];

        foreach ($testModels as $tm) {
            $start = microtime(true);
            try {
                $resp = \Illuminate\Support\Facades\Http::withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'HTTP-Referer'  => $siteUrl,
                    'X-Title'       => $siteName,
                    'Content-Type'  => 'application/json',
                ])->timeout(15)->post('https://openrouter.ai/api/v1/chat/completions', [
                    'model'      => $tm['id'],
                    'messages'   => [['role' => 'user', 'content' => 'Halo, balas hanya dengan kata: OK']],
                    'max_tokens' => 5,
                ]);

                $latency = round((microtime(true) - $start) * 1000);

                $results[$tm['id']] = [
                    'ok'      => $resp->successful(),
                    'label'   => $tm['label'],
                    'message' => $resp->successful()
                        ? "✅ Model tersedia dan merespons! ({$latency}ms)"
                        : '❌ Error ' . $resp->status() . ': ' . substr($resp->body(), 0, 150),
                    'latency_ms' => $latency,
                ];
            } catch (\Exception $e) {
                $results[$tm['id']] = [
                    'ok'      => false,
                    'label'   => $tm['label'],
                    'message' => '❌ Exception: ' . $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'results'       => $results,
            'tested_at'     => now()->format('H:i:s d/m/Y'),
            'is_openrouter' => true,
            'key_preview'   => 'sk-or-v1-' . substr($apiKey, 9, 4) . '****',
            'env_note'      => 'Semua model di atas diakses via 1 key OPENROUTER_API_KEY di .env',
        ]);
    }


    /**
     * Bersihkan Riwayat Chat
     */
    public function clearHistory()
    {
        $user = Auth::user();
        ChatMessage::where('user_id', $user->id)->delete();

        return redirect()->route('chat.index')->with('success', 'Riwayat chat telah dibersihkan.');
    }
}

