<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Category;
use App\Models\SavingReminder;
use App\Models\SavingsGoal;
use App\Models\Wallet;
use App\Models\WalletGroup;
use App\Services\SavingReminderService;
use App\Services\DanaIntegrationService;
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
            ->with('walletGroup:id,name')
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
                    'walletGroupId' => $w->wallet_group_id,
                    'parentWalletId' => $w->parent_wallet_id,
                    'walletGroupName' => $w->walletGroup?->name,
                    'balanceNum' => (float) $w->current_balance,
                    'balance' => 'Rp ' . number_format($w->current_balance, 0, ',', '.'),
                    'initialBalance' => 'Rp ' . number_format($w->initial_balance, 0, ',', '.'),
                    'income' => '+Rp ' . number_format($w->transactions()->where('type', 'income')->sum('amount'), 0, ',', '.'),
                    'expense' => '-Rp ' . number_format($w->transactions()->where('type', 'expense')->sum('amount'), 0, ',', '.'),
                    'icon' => $w->icon ?: 'account_balance_wallet',
                    'colorHex' => $w->color_hex ?: '#C4B5FD',
                    'bg' => match ($w->color_hex) {
                        '#8455EF', '#8B5CF6' => 'bg-[#8455EF]',
                        '#118EEA' => 'bg-[#118EEA]',
                        '#FFFFFF' => 'bg-white',
                        default => 'bg-[#C4B5FD]',
                    },
                    'rotate' => $rot,
                    // DANA Integration Props
                    'isDanaSynced' => (bool) $w->is_dana_synced,
                    'danaPhoneNumber' => $w->dana_phone_number,
                    'danaAccountName' => $w->dana_account_name,
                    'danaSyncMode' => $w->dana_sync_mode,
                    'danaLastSyncedAt' => $w->dana_last_synced_at ? $w->dana_last_synced_at->isoFormat('D MMM Y, HH:mm:ss') . ' WIB' : null,
                    'danaSyncStatus' => $w->dana_sync_status,
                ];
            });

        $totalBalanceSum = $wallets->whereNull('parentWalletId')->sum('balanceNum');
        $walletGroups = WalletGroup::where('user_id', $user->id)
            ->with(['wallets' => fn ($query) => $query->where('is_active', true)->orderBy('display_order')])
            ->orderBy('display_order')
            ->orderBy('id')
            ->get()
            ->map(function ($group) {
                $members = $group->wallets->map(fn ($wallet) => [
                    'id' => $wallet->id,
                    'name' => $wallet->name,
                    'balance' => 'Rp ' . number_format($wallet->current_balance, 0, ',', '.'),
                    'balanceNum' => $wallet->current_balance,
                    'icon' => $wallet->icon ?: 'account_balance_wallet',
                ])->values();

                $balance = $members->sum('balanceNum');

                return [
                    'id' => $group->id,
                    'name' => $group->name,
                    'description' => $group->description,
                    'icon' => $group->icon ?: 'account_tree',
                    'colorHex' => $group->color_hex ?: '#3B4CCA',
                    'walletIds' => $members->pluck('id')->values(),
                    'wallets' => $members,
                    'walletCount' => $members->count(),
                    'balanceNum' => $balance,
                    'balance' => 'Rp ' . number_format($balance, 0, ',', '.'),
                ];
            })
            ->values();

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
            'walletGroups' => $walletGroups,
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
            'wallet_group_id' => ['nullable', 'integer'],
            'parent_wallet_id' => ['nullable', 'integer'],
        ], [
            'name.required' => 'Nama wallet wajib diisi.',
            'initial_balance.required' => 'Saldo awal wajib diisi.',
            'initial_balance.max' => 'Saldo awal melebihi batas maksimal yang diizinkan (Rp 9,99 Triliun).',
        ]);

        $user = Auth::user();

        $this->ensureWalletGroupBelongsToUser($validated['wallet_group_id'] ?? null, $user->id);
        $this->ensureParentWalletBelongsToUser($validated['parent_wallet_id'] ?? null, $user->id);

        $wallet = Wallet::create([
            'user_id' => $user->id,
            'wallet_group_id' => $validated['wallet_group_id'] ?? null,
            'parent_wallet_id' => $validated['parent_wallet_id'] ?? null,
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
     * READ (Show): Detail & Mutasi Wallet Spesifik dengan fitur Penggabungan Saldo E-Wallet Anti-Minus
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

        if (!$wallet) {
            return redirect()->route('wallets.index')->with('error', 'Belum ada wallet.');
        }

        $allWallets = Wallet::where('user_id', $user->id)
            ->where('is_active', true)
            ->get()
            ->map(fn ($w) => [
                'id' => $w->id,
                'name' => $w->name,
                'balance' => 'Rp ' . number_format($w->current_balance, 0, ',', '.'),
            ]);

        // 1. Saldo Murni Wallet Ini (tanpa saldo anak)
        $ownIncome = (float) $wallet->transactions()->where('type', 'income')->sum('amount');
        $ownExpense = (float) $wallet->transactions()->where('type', 'expense')->sum('amount');
        $ownTransfersIn = (float) $wallet->transfersIn()->sum('amount');
        $ownTransfersOut = (float) $wallet->transfersOut()->sum('amount');
        $ownBalanceNum = (float) ($wallet->initial_balance + $ownIncome - $ownExpense + $ownTransfersIn - $ownTransfersOut);

        // 2. E-Wallet yang saat ini digabungkan (child wallets)
        $childWallets = $wallet->childWallets()->where('is_active', true)->get();
        $childWalletsBalanceSum = (float) $childWallets->sum(fn ($c) => $c->current_balance);
        $linkedWalletIds = $childWallets->pluck('id')->toArray();

        // 3. Total Saldo Gabungan (Murni + Topangan E-Wallet)
        $totalCombinedBalanceNum = $ownBalanceNum + $childWalletsBalanceSum;

        // 4. Daftar Wallet lain yang bisa digabungkan / dihubungkan
        $otherWallets = Wallet::where('user_id', $user->id)
            ->where('id', '!=', $wallet->id)
            ->where('is_active', true)
            ->get()
            ->map(function ($w) use ($linkedWalletIds) {
                $isLinked = in_array($w->id, $linkedWalletIds);
                return [
                    'id' => $w->id,
                    'name' => $w->name,
                    'type' => $w->type,
                    'icon' => $w->icon ?: 'account_balance_wallet',
                    'color_hex' => $w->color_hex ?: '#C4B5FD',
                    'balanceNum' => (float) $w->current_balance,
                    'balance' => 'Rp ' . number_format($w->current_balance, 0, ',', '.'),
                    'isLinked' => $isLinked,
                    'isDanaSynced' => (bool) $w->is_dana_synced,
                    'danaPhoneNumber' => $w->dana_phone_number,
                    'danaAccountName' => $w->dana_account_name,
                    'danaLastSyncedAt' => $w->dana_last_synced_at ? $w->dana_last_synced_at->isoFormat('D MMM Y, HH:mm:ss') . ' WIB' : null,
                ];
            });

        $monthlyIncome = $wallet->transactions()->where('type', 'income')->sum('amount');
        $monthlyExpense = $wallet->transactions()->where('type', 'expense')->sum('amount');

        // Fetch budget for this wallet
        $budget = Budget::where('user_id', $user->id)->where('wallet_id', $wallet->id)->first();

        $budgetLimitNum = $budget ? (float) $budget->limit_amount : 5000000;
        $targetProgress = $budgetLimitNum > 0 ? min(100, round(($monthlyExpense / $budgetLimitNum) * 100)) : 0;

        // Fetch transactions for this wallet
        $rawTransactions = $wallet->transactions()->with('category')->orderBy('transaction_date', 'desc')->orderBy('id', 'desc')->get();

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
                        'name' => $tx->category?->name ?: ($tx->description ?: ($tx->type === 'income' ? 'Pemasukan' : 'Pengeluaran')),
                        'description' => $tx->description,
                        'amount' => ($tx->type === 'income' ? '+' : '-') . 'Rp ' . number_format($tx->amount, 0, ',', '.'),
                        'amountNum' => (float) $tx->amount,
                        'type' => $tx->type,
                        'category_id' => $tx->category_id,
                        'category_name' => $tx->category?->name ?: 'Umum',
                        'category_icon' => $tx->category?->icon ?: 'category',
                        'category_color' => $tx->category?->color_hex ?: '#3B4CCA',
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
            'wallet' => [
                'id' => $wallet->id,
                'name' => $wallet->name,
                'type' => $wallet->type,
                'ownBalanceNum' => $ownBalanceNum,
                'ownBalance' => 'Rp ' . number_format($ownBalanceNum, 0, ',', '.'),
                'totalCombinedBalanceNum' => $totalCombinedBalanceNum,
                'totalCombinedBalance' => 'Rp ' . number_format($totalCombinedBalanceNum, 0, ',', '.'),
                'currentBalanceNum' => $wallet->current_balance,
                'currentBalance' => 'Rp ' . number_format($wallet->current_balance, 0, ',', '.'),
                'initialBalance' => 'Rp ' . number_format($wallet->initial_balance, 0, ',', '.'),
                'colorHex' => $wallet->color_hex,
                'icon' => $wallet->icon,
                'linkedCount' => count($linkedWalletIds),
                'linkedWalletIds' => $linkedWalletIds,
                // DANA props for single wallet
                'isDanaSynced' => (bool) $wallet->is_dana_synced,
                'danaPhoneNumber' => $wallet->dana_phone_number,
                'danaAccountName' => $wallet->dana_account_name,
                'danaSyncMode' => $wallet->dana_sync_mode,
                'danaLastSyncedAt' => $wallet->dana_last_synced_at ? $wallet->dana_last_synced_at->isoFormat('D MMM Y, HH:mm:ss') . ' WIB' : null,
                'danaSyncStatus' => $wallet->dana_sync_status,
            ],
            'otherWallets' => $otherWallets,
            'allWallets' => $allWallets,
            'categories' => $categories,
            'walletId' => $wallet->id,
            'walletName' => $wallet->name,
            'totalBalance' => 'Rp ' . number_format($totalCombinedBalanceNum, 0, ',', '.'),
            'ownBalanceFormatted' => 'Rp ' . number_format($ownBalanceNum, 0, ',', '.'),
            'linkedBalanceFormatted' => 'Rp ' . number_format($childWalletsBalanceSum, 0, ',', '.'),
            'monthlyIncome' => '+Rp ' . number_format($monthlyIncome, 0, ',', '.'),
            'monthlyExpense' => '-Rp ' . number_format($monthlyExpense, 0, ',', '.'),
            'budgetLimit' => 'Rp ' . number_format($budgetLimitNum, 0, ',', '.'),
            'budgetLimitNum' => $budgetLimitNum,
            'targetProgress' => $targetProgress,
            'transactionsGrouped' => $transactionsGrouped,
        ]);
    }

    /**
     * Link / Gabungkan Saldo E-Wallet ke Wallet ini agar total tidak minus
     */
    public function linkWallets(Request $request, Wallet $wallet)
    {
        if ($wallet->user_id !== Auth::id()) {
            abort(403, 'Akses ditolak.');
        }

        $validated = $request->validate([
            'linked_wallet_ids' => ['nullable', 'array'],
            'linked_wallet_ids.*' => ['integer', 'exists:wallets,id'],
        ]);

        $selectedIds = array_map('intval', $validated['linked_wallet_ids'] ?? []);

        // 1. Putuskan relasi anak yang sudah tidak dicentang
        Wallet::where('user_id', Auth::id())
            ->where('parent_wallet_id', $wallet->id)
            ->whereNotIn('id', $selectedIds)
            ->update(['parent_wallet_id' => null]);

        // 2. Hubungkan e-wallet yang dipilih sebagai anak dari wallet ini
        if (!empty($selectedIds)) {
            $filteredIds = array_filter($selectedIds, fn ($id) => $id !== $wallet->id);

            Wallet::where('user_id', Auth::id())
                ->whereIn('id', $filteredIds)
                ->update(['parent_wallet_id' => $wallet->id]);
        }

        return redirect()->back()->with('success', 'Penggabungan saldo e-wallet berhasil diperbarui!');
    }

    /**
     * CONNECT DANA: Hubungkan akun DANA ke wallet
     */
    public function connectDana(Request $request, Wallet $wallet, DanaIntegrationService $danaService)
    {
        if ($wallet->user_id !== Auth::id()) {
            abort(403, 'Akses ditolak.');
        }

        $validated = $request->validate([
            'phone_number' => ['required', 'string', 'max:30'],
            'account_name' => ['required', 'string', 'max:150'],
            'initial_dana_balance' => ['nullable', 'numeric', 'min:0'],
            'sync_mode' => ['nullable', 'string', 'in:simulation,snap_openapi'],
            'api_key' => ['nullable', 'string'],
        ]);

        $danaService->connect($wallet, $validated);

        return redirect()->back()->with('success', 'Akun DANA (' . $validated['account_name'] . ') berhasil terhubung secara Live!');
    }

    /**
     * SYNC DANA: Sinkronkan saldo DANA secara live
     */
    public function syncDana(Request $request, Wallet $wallet, DanaIntegrationService $danaService)
    {
        if ($wallet->user_id !== Auth::id()) {
            abort(403, 'Akses ditolak.');
        }

        $forcedBalance = $request->filled('new_balance') ? (float) $request->input('new_balance') : null;
        $result = $danaService->syncBalance($wallet, $forcedBalance);

        if ($request->wantsJson()) {
            return response()->json($result);
        }

        if ($result['success']) {
            return redirect()->back()->with('success', $result['message']);
        }

        return redirect()->back()->with('error', $result['message']);
    }

    /**
     * DISCONNECT DANA: Putuskan koneksi DANA dari wallet
     */
    public function disconnectDana(Wallet $wallet, DanaIntegrationService $danaService)
    {
        if ($wallet->user_id !== Auth::id()) {
            abort(403, 'Akses ditolak.');
        }

        $danaService->disconnect($wallet);

        return redirect()->back()->with('success', 'Koneksi akun DANA berhasil diputuskan.');
    }

    /**
     * QUICK CREATE DANA: Buat dompet DANA baru & langsung hubungkan live
     */
    public function quickCreateDana(Request $request, DanaIntegrationService $danaService)
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:50'],
            'phone_number' => ['required', 'string', 'max:30'],
            'account_name' => ['required', 'string', 'max:150'],
            'initial_dana_balance' => ['nullable', 'numeric', 'min:0'],
            'sync_mode' => ['nullable', 'string', 'in:simulation,snap_openapi'],
        ]);

        $walletName = !empty($validated['name']) ? $validated['name'] : 'DANA - ' . $validated['account_name'];

        $wallet = Wallet::create([
            'user_id' => Auth::id(),
            'name' => $walletName,
            'type' => 'e-wallet',
            'initial_balance' => 0,
            'icon' => 'account_balance_wallet',
            'color_hex' => '#118EEA',
            'is_active' => true,
            'display_order' => Wallet::where('user_id', Auth::id())->count() + 1,
        ]);

        $danaService->connect($wallet, $validated);

        return redirect()->back()->with('success', 'Dompet DANA baru (' . $walletName . ') berhasil dibuat dan terhubung secara Live!');
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
            'wallet_group_id' => ['nullable', 'integer'],
            'parent_wallet_id' => ['nullable', 'integer'],
        ], [
            'initial_balance.max' => 'Saldo awal melebihi batas maksimal yang diizinkan (Rp 9,99 Triliun).',
        ]);

        $this->ensureWalletGroupBelongsToUser($validated['wallet_group_id'] ?? null, Auth::id());
        $this->ensureValidParentWallet($wallet, $validated['parent_wallet_id'] ?? null);

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

    public function storeGroup(Request $request)
    {
        $user = Auth::user();
        $validated = $this->validateWalletGroup($request);
        $walletIds = $this->validatedOwnedWalletIds($validated['wallet_ids'] ?? [], $user->id);

        $group = WalletGroup::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'color_hex' => $validated['color_hex'] ?? '#3B4CCA',
            'icon' => $validated['icon'] ?? 'account_tree',
            'display_order' => WalletGroup::where('user_id', $user->id)->count() + 1,
        ]);

        Wallet::where('user_id', $user->id)->whereIn('id', $walletIds)->update(['wallet_group_id' => $group->id]);

        return redirect()->back()->with('success', 'Kelompok saldo berhasil dibuat.');
    }

    public function updateGroup(Request $request, WalletGroup $walletGroup)
    {
        $this->ensureGroupModelBelongsToUser($walletGroup);
        $user = Auth::user();
        $validated = $this->validateWalletGroup($request);
        $walletIds = $this->validatedOwnedWalletIds($validated['wallet_ids'] ?? [], $user->id);

        $walletGroup->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'color_hex' => $validated['color_hex'] ?? '#3B4CCA',
            'icon' => $validated['icon'] ?? 'account_tree',
        ]);

        Wallet::where('user_id', $user->id)->where('wallet_group_id', $walletGroup->id)->update(['wallet_group_id' => null]);
        Wallet::where('user_id', $user->id)->whereIn('id', $walletIds)->update(['wallet_group_id' => $walletGroup->id]);

        return redirect()->back()->with('success', 'Kelompok saldo berhasil diperbarui.');
    }

    public function destroyGroup(WalletGroup $walletGroup)
    {
        $this->ensureGroupModelBelongsToUser($walletGroup);
        $user = Auth::user();

        Wallet::where('user_id', $user->id)->where('wallet_group_id', $walletGroup->id)->update(['wallet_group_id' => null]);
        $walletGroup->delete();

        return redirect()->back()->with('success', 'Kelompok saldo berhasil dihapus.');
    }

    private function validateWalletGroup(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:255'],
            'color_hex' => ['nullable', 'string', 'max:7'],
            'icon' => ['nullable', 'string', 'max:50'],
            'wallet_ids' => ['nullable', 'array'],
            'wallet_ids.*' => ['integer', 'exists:wallets,id'],
        ]);
    }

    private function validatedOwnedWalletIds(array $walletIds, int $userId): array
    {
        $walletIds = collect($walletIds)->filter()->map(fn ($id) => (int) $id)->unique()->values();
        $ownedIds = Wallet::where('user_id', $userId)->whereIn('id', $walletIds)->pluck('id');

        if ($ownedIds->count() !== $walletIds->count()) {
            abort(403, 'Wallet tidak valid.');
        }

        return $ownedIds->all();
    }

    private function ensureWalletGroupBelongsToUser(?int $groupId, int $userId): void
    {
        if ($groupId && !WalletGroup::where('id', $groupId)->where('user_id', $userId)->exists()) {
            abort(403, 'Kelompok saldo tidak valid.');
        }
    }

    private function ensureGroupModelBelongsToUser(WalletGroup $walletGroup): void
    {
        if ($walletGroup->user_id !== Auth::id()) {
            abort(403, 'Akses ditolak.');
        }
    }

    private function ensureParentWalletBelongsToUser(?int $parentWalletId, int $userId): void
    {
        if ($parentWalletId && !Wallet::where('id', $parentWalletId)->where('user_id', $userId)->exists()) {
            abort(403, 'Wallet induk tidak valid.');
        }
    }

    private function ensureValidParentWallet(Wallet $wallet, ?int $parentWalletId): void
    {
        $this->ensureParentWalletBelongsToUser($parentWalletId, Auth::id());

        if (!$parentWalletId) return;
        if ($wallet->id === $parentWalletId) abort(422, 'Wallet tidak dapat menjadi induk dirinya sendiri.');

        $ancestor = Wallet::find($parentWalletId);
        while ($ancestor) {
            if ($ancestor->id === $wallet->id) abort(422, 'Struktur wallet tidak boleh membentuk putaran.');
            $ancestor = $ancestor->parentWallet;
        }
    }
}
