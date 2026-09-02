<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Category;
use App\Models\SavingReminder;
use App\Models\SavingsGoal;
use App\Models\Wallet;
use App\Services\SavingReminderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    /**
     * READ (Index): Tampilkan Seluruh Daftar Wallet User
     */
    public function index(): Response
    {
        $user = Auth::user();

        $wallets = Wallet::where('user_id', $user->id)
            ->where('is_active', true)
            ->orderBy('display_order')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($w, $index) {
                $rotations = ['rotate-[-0.5deg]', 'rotate-[1deg]', 'rotate-[-1deg]', 'rotate-[0.5deg]'];
                $rot = $rotations[$index % count($rotations)];

                return [
                    'id' => $w->id,
                    'name' => $w->name,
                    'type' => $w->type,
                    'typeLabel' => match ($w->type) {
                        'personal' => 'Kas Pribadi',
                        'business' => 'Bisnis / Servis',
                        'savings' => 'Tabungan / Goals',
                        default => 'E-Wallet / Digital',
                    },
                    'balanceNum' => $w->current_balance,
                    'balance' => 'Rp ' . number_format($w->current_balance, 0, ',', '.'),
                    'initialBalance' => 'Rp ' . number_format($w->initial_balance, 0, ',', '.'),
                    'income' => '+Rp ' . number_format($w->transactions()->where('type', 'income')->sum('amount'), 0, ',', '.'),
                    'expense' => '-Rp ' . number_format($w->transactions()->where('type', 'expense')->sum('amount'), 0, ',', '.'),
                    'icon' => $w->icon ?: 'account_balance_wallet',
                    'colorHex' => $w->color_hex ?: '#C4B5FD',
                    'bg' => match ($w->color_hex) {
                        '#8455EF', '#8B5CF6' => 'bg-[#8455EF]',
                        '#FFFFFF' => 'bg-white',
                        default => 'bg-[#C4B5FD]',
                    },
                    'rotate' => $rot,
                ];
            });

        $totalBalanceSum = $wallets->sum('balanceNum');

        // Fetch income/expense reminders for Wallets
        $reminders = SavingReminder::where('user_id', $user->id)
            ->whereIn('type', ['income', 'expense'])
            ->with(['wallet:id,name', 'category:id,name'])
            ->orderBy('is_active', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($r) => [
                'id'               => $r->id,
                'title'            => $r->title,
                'wallet_id'        => $r->wallet_id,
                'category_id'      => $r->category_id,
                'wallet_name'      => $r->wallet?->name ?? '-',
                'category_name'    => $r->category?->name ?? '-',
                'amount'           => (float) $r->amount,
                'amount_formatted' => 'Rp ' . number_format($r->amount, 0, ',', '.'),
                'type'             => $r->type,
                'frequency'        => $r->frequency,
                'frequency_label'  => $r->frequency_label,
                'day_of_week'      => $r->day_of_week,
                'day_of_month'     => $r->day_of_month,
                'is_active'        => $r->is_active,
            ]);
            
        // Fetch categories for reminder forms
        $categories = Category::where('user_id', $user->id)
            ->where('is_active', true)
            ->orderBy('type')
            ->get()
            ->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'type' => $c->type,
            ]);

        // Trigger notification check for due reminders
        SavingReminderService::checkAndNotifyDueReminders($user);

        return Inertia::render('Wallets/Index', [
            'wallets' => $wallets,
            'reminders' => $reminders,
            'categories' => $categories,
            'totalCombinedBalance' => 'Rp ' . number_format($totalBalanceSum, 0, ',', '.'),
        ]);
    }

    /**
     * CREATE (Store): Tambah Wallet Baru ke Database
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', 'in:personal,business,savings,other'],
            'initial_balance' => ['required', 'numeric', 'min:0', 'max:9999999999999'],
            'icon' => ['nullable', 'string', 'max:50'],
            'color_hex' => ['nullable', 'string', 'max:7'],
        ], [
            'name.required' => 'Nama wallet wajib diisi.',
            'initial_balance.required' => 'Saldo awal wajib diisi.',
            'initial_balance.max' => 'Saldo awal melebihi batas maksimal yang diizinkan (Rp 9,99 Triliun).',
        ]);

        $user = Auth::user();

        $wallet = Wallet::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'initial_balance' => $validated['initial_balance'],
            'icon' => $validated['icon'] ?? 'account_balance_wallet',
            'color_hex' => $validated['color_hex'] ?? '#C4B5FD',
            'is_active' => true,
            'display_order' => Wallet::where('user_id', $user->id)->count() + 1,
        ]);

        \App\Services\NotificationService::notifyWalletCreated($user->id, $wallet->name, $wallet->id);

        return redirect()->back()->with('success', 'Wallet baru berhasil dibuat!');
    }

    /**
     * READ (Show): Detail & Mutasi Wallet Spesifik
     */
    public function show($id = null): Response
    {
        $user = Auth::user();

        $wallet = $id
            ? Wallet::where('user_id', $user->id)->find($id)
            : Wallet::where('user_id', $user->id)->first();

        if (!$wallet && $id) {
            $wallet = Wallet::where('user_id', $user->id)->first();
        }

        $allWallets = Wallet::where('user_id', $user->id)
            ->where('is_active', true)
            ->get()
            ->map(fn ($w) => [
                'id' => $w->id,
                'name' => $w->name,
                'balance' => 'Rp ' . number_format($w->current_balance, 0, ',', '.'),
            ]);

        $monthlyIncome = $wallet ? $wallet->transactions()->where('type', 'income')->sum('amount') : 0;
        $monthlyExpense = $wallet ? $wallet->transactions()->where('type', 'expense')->sum('amount') : 0;

        // Fetch budget for this wallet
        $budget = $wallet
            ? Budget::where('user_id', $user->id)->where('wallet_id', $wallet->id)->first()
            : null;

        $budgetLimitNum = $budget ? (float) $budget->limit_amount : 5000000;
        $targetProgress = $budgetLimitNum > 0 ? min(100, round(($monthlyExpense / $budgetLimitNum) * 100)) : 0;

        // Fetch transactions for this wallet
        $rawTransactions = $wallet
            ? $wallet->transactions()->with('category')->orderBy('transaction_date', 'desc')->orderBy('id', 'desc')->get()
            : collect();

        // Fetch all categories for user
        $categories = Category::where('user_id', $user->id)
            ->where('is_active', true)
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'type' => $c->type,
                'icon' => $c->icon,
                'color_hex' => $c->color_hex,
            ]);

        // Group transactions by date
        $transactionsGrouped = $rawTransactions->groupBy(function ($tx) {
            return \Carbon\Carbon::parse($tx->transaction_date)->translatedFormat('d F Y');
        })->map(function ($items, $dateStr) {
            return [
                'date' => $dateStr,
                'items' => $items->map(function ($tx) {
                    return [
                        'id' => $tx->id,
                        'wallet_id' => $tx->wallet_id,
                        'title' => $tx->description ?: ($tx->category?->name ?: ($tx->type === 'income' ? 'Pemasukan' : 'Pengeluaran')),
                        'description' => $tx->description ?? '',
                        'category' => $tx->category?->name ?: ($tx->type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
                        'category_id' => $tx->category_id,
                        'type' => $tx->type,
                        'amount_raw' => (float) $tx->amount,
                        'amount' => 'Rp ' . number_format($tx->amount, 0, ',', '.'),
                        'transaction_date' => $tx->transaction_date ? \Carbon\Carbon::parse($tx->transaction_date)->format('Y-m-d') : '',
                        'subtitle' => $tx->created_at ? $tx->created_at->format('H:i') . ' WIB' : '',
                        'isIncome' => $tx->type === 'income',
                        'icon' => $tx->category?->icon ?: ($tx->type === 'income' ? 'arrow_downward' : 'shopping_cart'),
                        'iconBg' => $tx->type === 'income' ? 'bg-[#E7DEFF]' : 'bg-[#FFDAD6]',
                    ];
                })->values(),
            ];
        })->values();

        return Inertia::render('Wallets/Show', [
            'wallet' => $wallet ? [
                'id' => $wallet->id,
                'name' => $wallet->name,
                'type' => $wallet->type,
                'currentBalanceNum' => $wallet->current_balance,
                'currentBalance' => 'Rp ' . number_format($wallet->current_balance, 0, ',', '.'),
                'initialBalance' => 'Rp ' . number_format($wallet->initial_balance, 0, ',', '.'),
                'colorHex' => $wallet->color_hex,
                'icon' => $wallet->icon,
            ] : null,
            'allWallets' => $allWallets,
            'categories' => $categories,
            'walletId' => $wallet?->id ?? 1,
            'walletName' => $wallet?->name ?? 'Wallet Utama',
            'totalBalance' => 'Rp ' . number_format($wallet?->current_balance ?? 0, 0, ',', '.'),
            'monthlyIncome' => '+Rp ' . number_format($monthlyIncome, 0, ',', '.'),
            'monthlyExpense' => '-Rp ' . number_format($monthlyExpense, 0, ',', '.'),
            'budgetLimit' => 'Rp ' . number_format($budgetLimitNum, 0, ',', '.'),
            'budgetLimitNum' => $budgetLimitNum,
            'targetProgress' => $targetProgress,
            'transactionsGrouped' => $transactionsGrouped,
        ]);
    }

    /**
     * UPDATE: Perbarui Data Wallet
     */
    public function update(Request $request, Wallet $wallet)
    {
        if ($wallet->user_id !== Auth::id()) {
            abort(403, 'Akses ditolak.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', 'in:personal,business,savings,other'],
            'initial_balance' => ['required', 'numeric', 'min:0', 'max:9999999999999'],
            'icon' => ['nullable', 'string', 'max:50'],
            'color_hex' => ['nullable', 'string', 'max:7'],
        ], [
            'initial_balance.max' => 'Saldo awal melebihi batas maksimal yang diizinkan (Rp 9,99 Triliun).',
        ]);

        $wallet->update($validated);

        return redirect()->back()->with('success', 'Wallet berhasil diperbarui!');
    }

    /**
     * UPDATE BUDGET: Set / Update Limit Budget Wallet
     */
    public function updateBudget(Request $request, $id)
    {
        $user = Auth::user();
        $wallet = Wallet::where('user_id', $user->id)->findOrFail($id);

        $validated = $request->validate([
            'limit_amount' => ['required', 'numeric', 'min:0', 'max:9999999999999'],
        ], [
            'limit_amount.max' => 'Limit budget melebihi batas maksimal yang diizinkan (Rp 9,99 Triliun).',
        ]);

        Budget::updateOrCreate(
            [
                'user_id' => $user->id,
                'wallet_id' => $wallet->id,
            ],
            [
                'period' => 'monthly',
                'limit_amount' => $validated['limit_amount'],
                'start_date' => now()->startOfMonth(),
                'is_active' => true,
            ]
        );

        return redirect()->back()->with('success', 'Batas budget bulanan berhasil diperbarui!');
    }

    /**
     * DELETE (Destroy): Hapus / Nonaktifkan Wallet
     */
    public function destroy(Wallet $wallet)
    {
        if ($wallet->user_id !== Auth::id()) {
            abort(403, 'Akses ditolak.');
        }

        $wallet->delete();

        return redirect()->route('wallets.index')->with('success', 'Wallet berhasil dihapus!');
    }
}
