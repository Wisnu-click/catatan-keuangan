<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ChatMessage;
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

        // Cek API Key yang terpasang di .env / config
        $openaiKey = env('OPENAI_API_KEY') ?: config('services.openai.api_key');
        $geminiKey = env('GEMINI_API_KEY') ?: config('services.gemini.api_key');
        $anthropicKey = env('ANTHROPIC_API_KEY') ?: config('services.anthropic.api_key');
        $deepseekKey = env('DEEPSEEK_API_KEY') ?: config('services.deepseek.api_key');
        $defaultModel = env('DEFAULT_AI_MODEL', 'gpt-4o');

        // Generasi daftar AI Models secara dinamis berdasarkan status .env
        $allModels = [
            [
                'id' => 'gpt-4o',
                'name' => 'GPT-4o (OpenAI)',
                'provider' => 'OpenAI',
                'has_key' => !empty($openaiKey),
                'badge' => !empty($openaiKey) ? 'LIVE API (.ENV)' : 'ENGINE LOKAL',
                'icon' => 'smart_toy',
                'description' => !empty($openaiKey)
                    ? 'Terhubung live ke OpenAI API (.env). Multimodal parser tercepat.'
                    : 'API Key OPENAI_API_KEY di .env belum diisi. Menggunakan parser lokal.',
            ],
            [
                'id' => 'gemini-1.5-pro',
                'name' => 'Gemini 1.5 Pro',
                'provider' => 'Google AI',
                'has_key' => !empty($geminiKey),
                'badge' => !empty($geminiKey) ? 'LIVE API (.ENV)' : 'ENGINE LOKAL',
                'icon' => 'auto_awesome',
                'description' => !empty($geminiKey)
                    ? 'Terhubung live ke Google Gemini API (.env). Visual OCR struk presisi.'
                    : 'API Key GEMINI_API_KEY di .env belum diisi. Menggunakan parser lokal.',
            ],
            [
                'id' => 'claude-3.5-sonnet',
                'name' => 'Claude 3.5 Sonnet',
                'provider' => 'Anthropic',
                'has_key' => !empty($anthropicKey),
                'badge' => !empty($anthropicKey) ? 'LIVE API (.ENV)' : 'ENGINE LOKAL',
                'icon' => 'psychology',
                'description' => !empty($anthropicKey)
                    ? 'Terhubung live ke Anthropic Claude API (.env). Penalaran finansial mendalam.'
                    : 'API Key ANTHROPIC_API_KEY di .env belum diisi. Menggunakan parser lokal.',
            ],
            [
                'id' => 'deepseek-v3',
                'name' => 'DeepSeek V3',
                'provider' => 'DeepSeek',
                'has_key' => !empty($deepseekKey),
                'badge' => !empty($deepseekKey) ? 'LIVE API (.ENV)' : 'ENGINE LOKAL',
                'icon' => 'bolt',
                'description' => !empty($deepseekKey)
                    ? 'Terhubung live ke DeepSeek API (.env). Penalaran logika efisien.'
                    : 'API Key DEEPSEEK_API_KEY di .env belum diisi. Menggunakan parser lokal.',
            ],
            [
                'id' => 'raw-logic-core',
                'name' => 'RAW LOGIC Core AI',
                'provider' => 'Local Database Engine',
                'has_key' => true,
                'badge' => 'LOKAL NATIVE',
                'icon' => 'memory',
                'description' => 'Engine parser internal terintegrasi langsung dengan database lokal MySQL.',
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
                'content' => "Halo {$user->name}! Saya RAW AI Assistant 🤖.\nKetik transaksi seperti 'Beli kuota 50rb pake Usaha E-Wallet' atau upload foto struk untuk dicatat otomatis.",
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

        // 2. Memanggil Real AI Service Engine (OpenAI / Gemini / Claude / DeepSeek / Local)
        $userWalletsArray = Wallet::where('user_id', $user->id)
            ->where('is_active', true)
            ->get()
            ->map(fn ($w) => [
                'id' => $w->id,
                'name' => $w->name,
                'balance' => 'Rp ' . number_format($w->current_balance, 0, ',', '.'),
            ])
            ->toArray();

        $imageAbsPath = null;
        if ($imagePath && file_exists(public_path($imagePath))) {
            $imageAbsPath = public_path($imagePath);
        }

        $aiService = new AiService();
        $aiResult = $aiService->askAi($aiModel, $content, $imageAbsPath, $userWalletsArray);

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
     * Bersihkan Riwayat Chat
     */
    public function clearHistory()
    {
        $user = Auth::user();
        ChatMessage::where('user_id', $user->id)->delete();

        return redirect()->route('chat.index')->with('success', 'Riwayat chat telah dibersihkan.');
    }
}
