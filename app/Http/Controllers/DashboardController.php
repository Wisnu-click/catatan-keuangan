<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Wallet;
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
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
