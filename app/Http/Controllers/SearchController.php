<?php

namespace App\Http\Controllers;

use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SearchController extends Controller
{
    /**
     * Cari Wallets, Transaksi, dan Target Tabungan secara Real-Time
     */
    public function search(Request $request): JsonResponse
    {
        $user = Auth::user();
        $query = trim($request->query('q', ''));

        if (strlen($query) < 1) {
            return response()->json([
                'query' => '',
                'wallets' => [],
                'transactions' => [],
                'goals' => [],
                'total_count' => 0,
            ]);
        }

        // 1. Search Wallets
        $wallets = Wallet::where('user_id', $user->id)
            ->where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('type', 'LIKE', "%{$query}%");
            })
            ->limit(5)
            ->get()
            ->map(fn ($w) => [
                'id' => $w->id,
                'name' => $w->name,
                'type' => $w->type,
                'balance' => 'Rp ' . number_format($w->current_balance, 0, ',', '.'),
                'icon' => $w->icon ?: 'account_balance_wallet',
                'url' => route('wallets.show', $w->id),
            ]);

        // 2. Search Transactions
        $transactions = Transaction::with(['wallet', 'category'])
            ->where('user_id', $user->id)
            ->where(function ($q) use ($query) {
                $q->where('description', 'LIKE', "%{$query}%")
                  ->orWhere('amount', 'LIKE', "%{$query}%")
                  ->orWhereHas('category', fn ($cat) => $cat->where('name', 'LIKE', "%{$query}%"))
                  ->orWhereHas('wallet', fn ($wal) => $wal->where('name', 'LIKE', "%{$query}%"));
            })
            ->orderBy('transaction_date', 'desc')
            ->limit(7)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'title' => $t->description ?: ($t->category ? $t->category->name : 'Transaksi'),
                'category' => $t->category ? $t->category->name : 'Umum',
                'amount' => ($t->type === 'income' ? '+' : '-') . 'Rp ' . number_format($t->amount, 0, ',', '.'),
                'is_income' => $t->type === 'income',
                'date' => $t->transaction_date ? $t->transaction_date->translatedFormat('d M Y') : '',
                'wallet_name' => $t->wallet ? $t->wallet->name : 'Wallet',
                'wallet_id' => $t->wallet_id,
                'url' => $t->wallet_id ? route('wallets.show', $t->wallet_id) : route('wallets.index'),
            ]);

        // 3. Search Goals
        $goals = SavingsGoal::where('user_id', $user->id)
            ->where(function ($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('status', 'LIKE', "%{$query}%");
            })
            ->limit(5)
            ->get()
            ->map(fn ($g) => [
                'id' => $g->id,
                'name' => $g->name,
                'target_amount' => 'Rp ' . number_format($g->target_amount, 0, ',', '.'),
                'current_amount' => 'Rp ' . number_format($g->current_amount, 0, ',', '.'),
                'progress_percentage' => $g->progress_percentage,
                'status' => $g->status,
                'icon' => $g->icon ?: 'target',
                'url' => route('goals.index'),
            ]);

        return response()->json([
            'query' => $query,
            'wallets' => $wallets,
            'transactions' => $transactions,
            'goals' => $goals,
            'total_count' => count($wallets) + count($transactions) + count($goals),
        ]);
    }
}

