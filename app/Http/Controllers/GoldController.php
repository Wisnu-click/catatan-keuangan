<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\GoldTarget;
use App\Models\GoldTransaction;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Services\GoldPriceService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class GoldController extends Controller
{
    /**
     * Tampilkan Halaman Utama Portofolio & Tabungan Emas
     */
    public function index(): Response
    {
        $user = Auth::user();

        // 1. Ambil Harga Emas Live dari API
        $livePriceData = GoldPriceService::getLiveGoldPrice();
        $livePricePerGram = (float) ($livePriceData['price_per_gram'] ?? 2500000);

        // 2. Ambil Semua Transaksi Emas User
        $rawTransactions = GoldTransaction::where('user_id', $user->id)
            ->with('wallet:id,name,color_hex')
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        // 3. Kalkulasi Portofolio Emas
        $totalBuyGrams = (float) $rawTransactions->where('type', 'buy')->sum('weight_grams');
        $totalSellGrams = (float) $rawTransactions->where('type', 'sell')->sum('weight_grams');
        $activeGrams = max(0, $totalBuyGrams - $totalSellGrams);

        $totalBuyAmount = (float) $rawTransactions->where('type', 'buy')->sum('total_amount');
        $totalSellAmount = (float) $rawTransactions->where('type', 'sell')->sum('total_amount');

        // Rata-rata harga beli (Average Cost Basis per Gram)
        $avgBuyPrice = $totalBuyGrams > 0 ? ($totalBuyAmount / $totalBuyGrams) : 0;

        // Modal aktif yang masih tersimpan dalam bentuk emas
        $activeCostBasis = $activeGrams * $avgBuyPrice;

        // Nilai aset emas saat ini berdasarkan harga live
        $currentValuation = $activeGrams * $livePricePerGram;

        // Keuntungan / Kerugian yang belum direalisasikan (Unrealized Profit/Loss)
        $unrealizedProfitLoss = $currentValuation - $activeCostBasis;
        $unrealizedRoiPct = $activeCostBasis > 0 ? (($unrealizedProfitLoss / $activeCostBasis) * 100) : 0;

        // Keuntungan / Kerugian dari penjualan yang sudah terealisasi (Realized Profit/Loss)
        $realizedProfitLoss = $totalSellAmount - ($totalSellGrams * $avgBuyPrice);

        // 4. Target Tabungan Emas
        $goldTarget = GoldTarget::where('user_id', $user->id)->first();
        $targetGrams = $goldTarget ? (float) $goldTarget->target_grams : 0;
        $targetProgressPct = $targetGrams > 0 ? min(100, round(($activeGrams / $targetGrams) * 100, 1)) : 0;

        // 5. Format Daftar Transaksi untuk UI
        $transactions = $rawTransactions->map(function ($tx) use ($livePricePerGram) {
            $isBuy = $tx->type === 'buy';
            $weight = (float) $tx->weight_grams;
            $pricePerGram = (float) $tx->price_per_gram;
            $totalAmount = (float) $tx->total_amount;

            // Estimasi nilai sekarang dari transaksi ini jika beli
            $currentVal = $weight * $livePricePerGram;
            $diffAmount = $isBuy ? ($currentVal - $totalAmount) : 0;
            $diffPct = ($isBuy && $totalAmount > 0) ? (($diffAmount / $totalAmount) * 100) : 0;

            return [
                'id' => $tx->id,
                'type' => $tx->type,
                'type_label' => $isBuy ? 'Beli Emas' : 'Jual Emas',
                'weight_grams' => $weight,
                'weight_formatted' => number_format($weight, 4, ',', '.') . ' gr',
                'price_per_gram' => $pricePerGram,
                'price_per_gram_formatted' => 'Rp ' . number_format($pricePerGram, 0, ',', '.'),
                'total_amount' => $totalAmount,
                'total_amount_formatted' => 'Rp ' . number_format($totalAmount, 0, ',', '.'),
                'fee' => (float) $tx->fee,
                'fee_formatted' => 'Rp ' . number_format((float) $tx->fee, 0, ',', '.'),
                'brand' => $tx->brand ?: 'Antam',
                'purity' => $tx->purity ?: '24K',
                'notes' => $tx->notes ?: '-',
                'transaction_date' => $tx->transaction_date ? $tx->transaction_date->format('Y-m-d') : '',
                'transaction_date_display' => $tx->transaction_date ? $tx->transaction_date->translatedFormat('d M Y') : '',
                'wallet_id' => $tx->wallet_id,
                'wallet_name' => $tx->wallet?->name ?? 'Kas Luar / Tunai',
                'wallet_color' => $tx->wallet?->color_hex ?? '#C4B5FD',
                'diff_amount' => $diffAmount,
                'diff_amount_formatted' => ($diffAmount >= 0 ? '+' : '') . 'Rp ' . number_format($diffAmount, 0, ',', '.'),
                'diff_percentage' => $diffPct,
                'diff_percentage_formatted' => ($diffPct >= 0 ? '+' : '') . number_format($diffPct, 2, ',', '.') . '%',
                'is_profitable' => $diffAmount >= 0,
            ];
        });

        // 6. Daftar Wallets User untuk Sumber/Tujuan Dana
        $wallets = Wallet::where('user_id', $user->id)
            ->where('is_active', true)
            ->orderBy('display_order')
            ->get()
            ->map(fn ($w) => [
                'id' => $w->id,
                'name' => $w->name,
                'balance' => 'Rp ' . number_format($w->current_balance, 0, ',', '.'),
                'current_balance_raw' => $w->current_balance,
            ]);

        return Inertia::render('Gold/Index', [
            'livePrice' => $livePriceData,
            'portfolio' => [
                'active_grams' => $activeGrams,
                'active_grams_formatted' => number_format($activeGrams, 4, ',', '.') . ' gr',
                'total_buy_grams' => $totalBuyGrams,
                'total_sell_grams' => $totalSellGrams,
                'active_cost_basis' => $activeCostBasis,
                'active_cost_basis_formatted' => 'Rp ' . number_format($activeCostBasis, 0, ',', '.'),
                'current_valuation' => $currentValuation,
                'current_valuation_formatted' => 'Rp ' . number_format($currentValuation, 0, ',', '.'),
                'avg_buy_price' => $avgBuyPrice,
                'avg_buy_price_formatted' => 'Rp ' . number_format($avgBuyPrice, 0, ',', '.'),
                'unrealized_profit_loss' => $unrealizedProfitLoss,
                'unrealized_profit_loss_formatted' => ($unrealizedProfitLoss >= 0 ? '+' : '') . 'Rp ' . number_format($unrealizedProfitLoss, 0, ',', '.'),
                'unrealized_roi_pct' => $unrealizedRoiPct,
                'unrealized_roi_pct_formatted' => ($unrealizedRoiPct >= 0 ? '+' : '') . number_format($unrealizedRoiPct, 2, ',', '.') . '%',
                'is_profitable' => $unrealizedProfitLoss >= 0,
                'realized_profit_loss' => $realizedProfitLoss,
                'realized_profit_loss_formatted' => ($realizedProfitLoss >= 0 ? '+' : '') . 'Rp ' . number_format($realizedProfitLoss, 0, ',', '.'),
                'total_transactions_count' => $rawTransactions->count(),
            ],
            'target' => [
                'target_grams' => $targetGrams,
                'target_grams_formatted' => number_format($targetGrams, 4, ',', '.') . ' gr',
                'target_date' => $goldTarget?->target_date ? $goldTarget->target_date->format('Y-m-d') : null,
                'target_date_display' => $goldTarget?->target_date ? $goldTarget->target_date->translatedFormat('d M Y') : null,
                'progress_pct' => $targetProgressPct,
                'remaining_grams' => max(0, $targetGrams - $activeGrams),
                'remaining_grams_formatted' => number_format(max(0, $targetGrams - $activeGrams), 4, ',', '.') . ' gr',
                'notes' => $goldTarget?->notes ?? '',
            ],
            'transactions' => $transactions,
            'wallets' => $wallets,
        ]);
    }

    /**
     * Simpan Transaksi Beli / Jual Emas Baru
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'type' => ['required', 'in:buy,sell'],
            'weight_grams' => ['required', 'numeric', 'min:0.0001', 'max:99999'],
            'price_per_gram' => ['required', 'numeric', 'min:1000', 'max:9999999999999'],
            'total_amount' => ['required', 'numeric', 'min:1000', 'max:9999999999999'],
            'fee' => ['nullable', 'numeric', 'min:0', 'max:9999999999999'],
            'brand' => ['nullable', 'string', 'max:50'],
            'purity' => ['nullable', 'string', 'max:10'],
            'notes' => ['nullable', 'string', 'max:255'],
            'transaction_date' => ['required', 'date'],
            'wallet_id' => ['nullable', 'exists:wallets,id'],
        ], [
            'weight_grams.required' => 'Berat gram emas wajib diisi.',
            'weight_grams.min' => 'Berat emas minimal 0.0001 gram.',
            'price_per_gram.required' => 'Harga per gram wajib diisi.',
            'total_amount.required' => 'Total nominal wajib diisi.',
            'transaction_date.required' => 'Tanggal transaksi wajib diisi.',
        ]);

        // Jika Transaksi JUAL: Validasi apakah saldo gram emas mencukupi
        if ($validated['type'] === 'sell') {
            $totalBuy = (float) GoldTransaction::where('user_id', $user->id)->where('type', 'buy')->sum('weight_grams');
            $totalSell = (float) GoldTransaction::where('user_id', $user->id)->where('type', 'sell')->sum('weight_grams');
            $availableGrams = max(0, $totalBuy - $totalSell);

            if ((float) $validated['weight_grams'] > $availableGrams) {
                return redirect()->back()->withErrors([
                    'weight_grams' => "Gram emas yang ingin dijual (" . number_format($validated['weight_grams'], 4, ',', '.') . " gr) melebihi saldo emas yang dimiliki (" . number_format($availableGrams, 4, ',', '.') . " gr).",
                ]);
            }
        }

        // Jika user memilih Wallet, sinkronkan mutasi kas
        $linkedTransactionId = null;
        if (!empty($validated['wallet_id'])) {
            $wallet = Wallet::where('id', $validated['wallet_id'])->where('user_id', $user->id)->firstOrFail();

            $isBuy = $validated['type'] === 'buy';
            $trxType = $isBuy ? 'expense' : 'income';
            $brandName = $validated['brand'] ?: 'Emas';
            $desc = ($isBuy ? 'Beli Emas ' : 'Jual Emas ') . "{$brandName} (" . number_format($validated['weight_grams'], 4, ',', '.') . " gr)";

            // Cari kategori investasi jika ada
            $cat = Category::where('user_id', $user->id)
                ->where('type', $trxType)
                ->where(function ($q) {
                    $q->where('name', 'LIKE', '%emas%')
                      ->orWhere('name', 'LIKE', '%investasi%');
                })
                ->first();

            $walletTrx = Transaction::create([
                'user_id' => $user->id,
                'wallet_id' => $wallet->id,
                'category_id' => $cat?->id,
                'type' => $trxType,
                'amount' => $validated['total_amount'],
                'description' => $desc,
                'source' => 'web',
                'transaction_date' => $validated['transaction_date'],
            ]);

            $linkedTransactionId = $walletTrx->id;
        }

        // Buat Gold Transaction
        $goldTx = GoldTransaction::create([
            'user_id' => $user->id,
            'wallet_id' => $validated['wallet_id'] ?? null,
            'transaction_id' => $linkedTransactionId,
            'type' => $validated['type'],
            'weight_grams' => $validated['weight_grams'],
            'price_per_gram' => $validated['price_per_gram'],
            'total_amount' => $validated['total_amount'],
            'fee' => $validated['fee'] ?? 0,
            'brand' => $validated['brand'] ?: 'Antam',
            'purity' => $validated['purity'] ?: '24K',
            'notes' => $validated['notes'] ?? null,
            'transaction_date' => $validated['transaction_date'],
        ]);

        $formattedGrams = number_format((float) $goldTx->weight_grams, 4, ',', '.') . ' gr';
        $formattedRp = 'Rp ' . number_format((float) $goldTx->total_amount, 0, ',', '.');
        $actionText = $goldTx->type === 'buy' ? 'Pembelian' : 'Penjualan';

        NotificationService::create(
            $user->id,
            'gold',
            "{$actionText} Emas Berhasil",
            "Transaksi {$actionText} emas {$formattedGrams} senilai {$formattedRp} berhasil dicatat.",
            'monetization_on',
            $goldTx->type === 'buy' ? '#F59E0B' : '#10B981',
            route('gold.index')
        );

        return redirect()->route('gold.index')->with('success', "Transaksi {$actionText} Emas berhasil dicatat!");
    }

    /**
     * Update Transaksi Emas
     */
    public function update(Request $request, GoldTransaction $gold)
    {
        $user = Auth::user();
        if ($gold->user_id !== $user->id) {
            abort(403, 'Akses ditolak.');
        }

        $validated = $request->validate([
            'price_per_gram' => ['required', 'numeric', 'min:1000', 'max:9999999999999'],
            'total_amount' => ['required', 'numeric', 'min:1000', 'max:9999999999999'],
            'fee' => ['nullable', 'numeric', 'min:0'],
            'brand' => ['nullable', 'string', 'max:50'],
            'purity' => ['nullable', 'string', 'max:10'],
            'notes' => ['nullable', 'string', 'max:255'],
            'transaction_date' => ['required', 'date'],
        ]);

        $gold->update($validated);

        // Update nominal di transaksi wallet jika terhubung
        if ($gold->transaction_id && $gold->transaction) {
            $gold->transaction->update([
                'amount' => $validated['total_amount'],
                'transaction_date' => $validated['transaction_date'],
            ]);
        }

        return redirect()->route('gold.index')->with('success', 'Transaksi emas berhasil diperbarui!');
    }

    /**
     * Hapus Transaksi Emas
     */
    public function destroy(GoldTransaction $gold)
    {
        $user = Auth::user();
        if ($gold->user_id !== $user->id) {
            abort(403, 'Akses ditolak.');
        }

        // Hapus transaksi kas terkait jika ada
        if ($gold->transaction_id && $gold->transaction) {
            $gold->transaction->delete();
        }

        $gold->delete();

        return redirect()->route('gold.index')->with('success', 'Transaksi emas berhasil dihapus.');
    }

    /**
     * Pasang / Perbarui Target Tabungan Emas
     */
    public function updateTarget(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'target_grams' => ['required', 'numeric', 'min:0.1', 'max:99999'],
            'target_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:255'],
        ], [
            'target_grams.required' => 'Target gram emas wajib diisi.',
            'target_grams.min' => 'Target gram minimal 0.1 gram.',
        ]);

        GoldTarget::updateOrCreate(
            ['user_id' => $user->id],
            [
                'target_grams' => $validated['target_grams'],
                'target_date' => $validated['target_date'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]
        );

        return redirect()->route('gold.index')->with('success', 'Target tabungan emas berhasil disimpan!');
    }

    /**
     * API Refresh Harga Live Emas secara Instan (JSON)
     */
    public function refreshPrice(): JsonResponse
    {
        $freshPrice = GoldPriceService::getLiveGoldPrice(true);
        return response()->json([
            'status' => 'success',
            'data' => $freshPrice,
        ]);
    }
}

