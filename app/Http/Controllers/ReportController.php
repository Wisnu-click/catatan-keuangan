<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $selectedWalletId = $request->query('wallet_id');
        $selectedPeriod = $request->query('period', 'All'); // 'All', 'Pribadi', 'Bisnis', 'Tabungan'

        // Wallet Filter list
        $wallets = Wallet::where('user_id', $user->id)
            ->where('is_active', true)
            ->get()
            ->map(fn ($w) => [
                'id' => $w->id,
                'name' => $w->name,
                'type' => $w->type,
            ]);

        // Base transaction query
        $txQuery = Transaction::where('user_id', $user->id);

        if ($selectedWalletId) {
            $txQuery->where('wallet_id', $selectedWalletId);
        } elseif ($selectedPeriod && $selectedPeriod !== 'All') {
            $typeMap = [
                'Pribadi' => 'personal',
                'Bisnis' => 'business',
                'Tabungan' => 'savings',
                'Investasi' => 'savings',
            ];
            $targetType = $typeMap[$selectedPeriod] ?? null;
            if ($targetType) {
                $matchingWalletIds = Wallet::where('user_id', $user->id)->where('type', $targetType)->pluck('id');
                $txQuery->whereIn('wallet_id', $matchingWalletIds);
            }
        }

        $transactions = $txQuery->with('category')->get();

        $totalIncomeNum = $transactions->where('type', 'income')->sum('amount');
        $totalExpenseNum = $transactions->where('type', 'expense')->sum('amount');
        $netCashflowNum = $totalIncomeNum - $totalExpenseNum;

        // Group by category for Top Expenses
        $expenseTransactions = $transactions->where('type', 'expense');
        $totalExpenseSum = $expenseTransactions->sum('amount');

        $topExpenses = $expenseTransactions
            ->groupBy('category_id')
            ->map(function ($items, $catId) use ($totalExpenseSum) {
                $catName = $catId ? (Category::find($catId)?->name ?: 'Lainnya') : 'Lainnya';
                $sum = (float) $items->sum('amount');
                $pct = $totalExpenseSum > 0 ? round(($sum / $totalExpenseSum) * 100) : 0;
                return [
                    'name' => $catName,
                    'amount' => 'Rp ' . number_format($sum, 0, ',', '.'),
                    'pct' => $pct,
                ];
            })
            ->sortByDesc('pct')
            ->values();

        // Monthly cashflow trend for bar chart
        $monthlyMap = $transactions
            ->groupBy(function ($tx) {
                return \Carbon\Carbon::parse($tx->transaction_date)->translatedFormat('M Y');
            })
            ->map(function ($items, $monthStr) {
                $inc = (float) $items->where('type', 'income')->sum('amount');
                $exp = (float) $items->where('type', 'expense')->sum('amount');
                $max = max($inc, $exp, 1);
                return [
                    'month' => strtoupper($monthStr),
                    'inc' => round(($inc / $max) * 100),
                    'exp' => round(($exp / $max) * 100),
                    'incomeFormatted' => 'Rp ' . number_format($inc, 0, ',', '.'),
                    'expenseFormatted' => 'Rp ' . number_format($exp, 0, ',', '.'),
                ];
            })
            ->values();

        return Inertia::render('Reports/Index', [
            'wallets' => $wallets,
            'selectedWalletId' => $selectedWalletId,
            'selectedPeriod' => $selectedPeriod,
            'totalIncome' => 'Rp ' . number_format($totalIncomeNum, 0, ',', '.'),
            'totalExpense' => 'Rp ' . number_format($totalExpenseNum, 0, ',', '.'),
            'netCashflow' => 'Rp ' . number_format($netCashflowNum, 0, ',', '.'),
            'topExpenses' => $topExpenses,
            'monthlyTrend' => $monthlyMap,
        ]);
    }
}
