<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\GoldTransaction;
use App\Models\Wallet;
use App\Services\GoldPriceService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        $wallets = Wallet::where('user_id', $user->id)
            ->where('is_active', true)
            ->orderBy('display_order')
            ->get()
            ->map(function ($w, $idx) {
                $rotations = ['rotate-[-0.5deg]', 'rotate-[1deg]', 'rotate-[-1deg]', 'rotate-[0.5deg]'];
                return [
                    'id' => $w->id,
                    'name' => $w->name,
                    'balanceNum' => $w->current_balance,
                    'balance' => 'Rp ' . number_format($w->current_balance, 0, ',', '.'),
                    'icon' => $w->icon ?: 'account_balance_wallet',
                    'bg' => match ($w->color_hex) {
                        '#8455EF', '#8B5CF6' => 'bg-[#8455EF]',
                        '#FFFFFF' => 'bg-white',
                        default => 'bg-[#C4B5FD]',
                    },
                    'rotate' => $rotations[$idx % count($rotations)],
                ];
            });

        $totalBalanceSum = $wallets->sum('balanceNum');

        $totalIncome = Transaction::where('user_id', $user->id)->where('type', 'income')->sum('amount');
        $totalExpense = Transaction::where('user_id', $user->id)->where('type', 'expense')->sum('amount');

        $goldTransactions = GoldTransaction::where('user_id', $user->id)->get(['type', 'weight_grams']);
        $activeGoldGrams = max(0, (float) $goldTransactions->where('type', 'buy')->sum('weight_grams') - (float) $goldTransactions->where('type', 'sell')->sum('weight_grams'));
        $liveGoldPrice = (float) (GoldPriceService::getLiveGoldPrice()['price_per_gram'] ?? 2500000);
        $goldValue = $activeGoldGrams * $liveGoldPrice;

        $recentTransactions = Transaction::where('user_id', $user->id)
            ->with('category')
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get()
            ->map(function ($tx) {
                return [
                    'id' => $tx->id,
                    'walletId' => $tx->wallet_id,
                    'title' => $tx->description ?: ($tx->category?->name ?: ($tx->type === 'income' ? 'Pemasukan' : 'Pengeluaran')),
                    'subtitle' => \Carbon\Carbon::parse($tx->transaction_date)->translatedFormat('d M Y'),
                    'category' => $tx->category?->name ?: ($tx->type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
                    'amount' => 'Rp ' . number_format($tx->amount, 0, ',', '.'),
                    'isIncome' => $tx->type === 'income',
                    'icon' => $tx->category?->icon ?: ($tx->type === 'income' ? 'arrow_downward' : 'shopping_cart'),
                    'iconBg' => $tx->type === 'income' ? 'bg-[#A7F3D0]' : 'bg-[#FFDAD6]',
                ];
            });

        return Inertia::render('Dashboard', [
            'totalBalance' => 'Rp ' . number_format($totalBalanceSum, 0, ',', '.'),
            'monthlyIncrease' => 'REAL TIME BALANCE',
            'wallets' => $wallets,
            'stats' => [
                'income' => '+Rp ' . number_format($totalIncome, 0, ',', '.'),
                'expense' => '-Rp ' . number_format($totalExpense, 0, ',', '.'),
            ],
            'financialOverview' => [
                ['key' => 'income', 'label' => 'Uang Masuk', 'amount' => (float) $totalIncome, 'formatted' => 'Rp ' . number_format($totalIncome, 0, ',', '.'), 'description' => 'Total pemasukan', 'icon' => 'arrow_downward', 'color' => 'bg-[#4ADE80]', 'iconBg' => 'bg-[#A7F3D0]'],
                ['key' => 'expense', 'label' => 'Uang Keluar', 'amount' => (float) $totalExpense, 'formatted' => 'Rp ' . number_format($totalExpense, 0, ',', '.'), 'description' => 'Total pengeluaran', 'icon' => 'arrow_upward', 'color' => 'bg-[#F87171]', 'iconBg' => 'bg-[#FECACA]'],
                ['key' => 'cash', 'label' => 'Saldo Wallet', 'amount' => (float) $totalBalanceSum, 'formatted' => 'Rp ' . number_format($totalBalanceSum, 0, ',', '.'), 'description' => 'Dana tersedia', 'icon' => 'account_balance_wallet', 'color' => 'bg-[#8B5CF6]', 'iconBg' => 'bg-[#C4B5FD]'],
                ['key' => 'gold', 'label' => 'Nilai Emas', 'amount' => $goldValue, 'formatted' => 'Rp ' . number_format($goldValue, 0, ',', '.'), 'description' => number_format($activeGoldGrams, 4, ',', '.') . ' gr aktif', 'icon' => 'monetization_on', 'color' => 'bg-[#F59E0B]', 'iconBg' => 'bg-[#FEF08A]'],
            ],
            'recentTransactions' => $recentTransactions,
        ]);
    }
}

