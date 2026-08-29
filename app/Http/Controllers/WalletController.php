<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Wallet;
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

        return Inertia::render('Wallets/Index', [
            'wallets' => $wallets,
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
            'initial_balance' => ['required', 'numeric', 'min:0'],
            'icon' => ['nullable', 'string', 'max:50'],
            'color_hex' => ['nullable', 'string', 'max:7'],
        ], [
            'name.required' => 'Nama wallet wajib diisi.',
            'initial_balance.required' => 'Saldo awal wajib diisi.',
        ]);

        $user = Auth::user();

        Wallet::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'initial_balance' => $validated['initial_balance'],
            'icon' => $validated['icon'] ?? 'account_balance_wallet',
            'color_hex' => $validated['color_hex'] ?? '#C4B5FD',
            'is_active' => true,
            'display_order' => Wallet::where('user_id', $user->id)->count() + 1,
        ]);

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

        // Group transactions by date
        $transactionsGrouped = $rawTransactions->groupBy(function ($tx) {
            return \Carbon\Carbon::parse($tx->transaction_date)->translatedFormat('d F Y');
        })->map(function ($items, $dateStr) {
            return [
                'date' => $dateStr,
                'items' => $items->map(function ($tx) {
                    return [
                        'id' => $tx->id,
                        'title' => $tx->description ?: ($tx->category?->name ?: ($tx->type === 'income' ? 'Pemasukan' : 'Pengeluaran')),
                        'category' => $tx->category?->name ?: ($tx->type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
                        'subtitle' => $tx->created_at ? $tx->created_at->format('H:i') . ' WIB' : '',
                        'amount' => 'Rp ' . number_format($tx->amount, 0, ',', '.'),
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
            'initial_balance' => ['required', 'numeric', 'min:0'],
            'icon' => ['nullable', 'string', 'max:50'],
            'color_hex' => ['nullable', 'string', 'max:7'],
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
            'limit_amount' => ['required', 'numeric', 'min:0'],
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
