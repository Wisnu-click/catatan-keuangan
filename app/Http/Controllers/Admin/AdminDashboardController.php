<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        // 1. User Metrics
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $adminCount = User::where('role', 'admin')->count();
        $newUsersThisMonth = User::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count();

        // 2. Financial Metrics Across Entire System
        $totalWallets = Wallet::count();
        $totalSystemBalance = (float) Wallet::whereNull('parent_wallet_id')->get()->sum(fn ($w) => (float) $w->current_balance);
        $totalTransactionsCount = Transaction::count();

        $startOfMonth = now()->startOfMonth()->toDateString();
        $endOfMonth = now()->endOfMonth()->toDateString();

        $monthlyIncomeVolume = (float) Transaction::where('type', 'income')
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $monthlyExpenseVolume = (float) Transaction::where('type', 'expense')
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $totalAllTimeVolume = (float) Transaction::sum('amount');

        // 3. Savings Goals Metrics
        $totalGoals = SavingsGoal::count();
        $completedGoals = SavingsGoal::where('status', 'completed')->count();

        // 4. AI & System Logs Metrics
        $totalAiMessages = ChatMessage::where('sender', 'ai')->count();
        $totalUserPrompts = ChatMessage::where('sender', 'user')->count();

        // 5. Recent System Activities
        $recentUsers = User::latest()->take(5)->get()->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'role' => $u->role ?? 'pengguna',
            'is_active' => (bool) $u->is_active,
            'avatar_url' => $u->avatar_url ?: 'https://api.dicebear.com/7.x/bottts/svg?seed=' . urlencode($u->name),
            'created_at' => $u->created_at ? $u->created_at->format('d M Y H:i') : '-',
        ]);

        $recentTransactions = Transaction::with(['user', 'wallet', 'category'])
            ->latest('id')
            ->take(8)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'user_name' => $t->user->name ?? 'User #' . $t->user_id,
                'type' => $t->type,
                'amount' => (float) $t->amount,
                'amount_formatted' => 'Rp ' . number_format($t->amount, 0, ',', '.'),
                'category' => $t->category->name ?? 'Umum',
                'wallet' => $t->wallet->name ?? 'Dompet',
                'description' => $t->description ?: '-',
                'date' => $t->transaction_date ? $t->transaction_date->format('d M Y') : $t->created_at->format('d M Y'),
            ]);

        // Monthly Breakdown Chart Data (Last 6 Months)
        $chartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = now()->subMonths($i);
            $m = $monthDate->month;
            $y = $monthDate->year;
            $mLabel = $monthDate->translatedFormat('M Y');

            $inc = (float) Transaction::where('type', 'income')
                ->whereMonth('transaction_date', $m)
                ->whereYear('transaction_date', $y)
                ->sum('amount');

            $exp = (float) Transaction::where('type', 'expense')
                ->whereMonth('transaction_date', $m)
                ->whereYear('transaction_date', $y)
                ->sum('amount');

            $chartData[] = [
                'month' => $mLabel,
                'income' => $inc,
                'expense' => $exp,
            ];
        }

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'admin_count' => $adminCount,
                'new_users_month' => $newUsersThisMonth,
                'total_wallets' => $totalWallets,
                'total_system_balance' => $totalSystemBalance,
                'total_system_balance_formatted' => 'Rp ' . number_format($totalSystemBalance, 0, ',', '.'),
                'total_transactions' => $totalTransactionsCount,
                'monthly_income' => $monthlyIncomeVolume,
                'monthly_income_formatted' => 'Rp ' . number_format($monthlyIncomeVolume, 0, ',', '.'),
                'monthly_expense' => $monthlyExpenseVolume,
                'monthly_expense_formatted' => 'Rp ' . number_format($monthlyExpenseVolume, 0, ',', '.'),
                'total_goals' => $totalGoals,
                'completed_goals' => $completedGoals,
                'total_ai_messages' => $totalAiMessages,
                'total_user_prompts' => $totalUserPrompts,
            ],
            'recent_users' => $recentUsers,
            'recent_transactions' => $recentTransactions,
            'chart_data' => $chartData,
            'system_info' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'server_time' => now()->translatedFormat('d F Y - H:i:s T'),
                'app_env' => config('app.env'),
            ],
        ]);
    }
}

