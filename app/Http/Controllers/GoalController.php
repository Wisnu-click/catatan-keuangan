<?php

namespace App\Http\Controllers;

use App\Models\GoalContribution;
use App\Models\SavingsGoal;
use App\Models\SavingReminder;
use App\Models\Wallet;
use App\Services\SavingReminderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class GoalController extends Controller
{
    /**
     * Tampilkan semua savings goals milik user yang sedang login
     */
    public function index(): Response
    {
        $user = Auth::user();

        $goals = SavingsGoal::where('user_id', $user->id)
            ->with(['wallet:id,name,icon,color_hex', 'contributions'])
            ->orderByRaw("FIELD(status, 'active', 'completed', 'cancelled')")
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($goal) {
                $currentAmount = (float) $goal->contributions->sum('amount');
                $targetAmount = (float) $goal->target_amount;
                $percentage = $targetAmount > 0
                    ? min(round(($currentAmount / $targetAmount) * 100, 0), 100)
                    : 0;

                return [
                    'id' => $goal->id,
                    'name' => $goal->name,
                    'wallet_id' => $goal->wallet_id,
                    'wallet_name' => $goal->wallet?->name ?? '-',
                    'target_amount' => $targetAmount,
                    'current_amount' => $currentAmount,
                    'percentage' => $percentage,
                    'target_date' => $goal->target_date?->format('Y-m-d'),
                    'target_date_display' => $goal->target_date?->translatedFormat('M Y') ?? '-',
                    'icon' => $goal->icon ?? 'savings',
                    'status' => $goal->status,
                    'is_completed' => $goal->status === 'completed',
                    'created_at' => $goal->created_at->toDateTimeString(),
                    'contributions' => $goal->contributions
                        ->sortByDesc('contribution_date')
                        ->take(10)
                        ->map(fn($c) => [
                            'id' => $c->id,
                            'amount' => (float) $c->amount,
                            'description' => $c->description,
                            'date' => $c->contribution_date->format('Y-m-d'),
                        ])
                        ->values(),
                ];
            });

        $wallets = Wallet::where('user_id', $user->id)
            ->where('is_active', true)
            ->get()
            ->map(fn($w) => [
                'id' => $w->id,
                'name' => $w->name,
                'icon' => $w->icon,
                'current_balance' => $w->current_balance,
            ]);

        // Fetch saving-type reminders for Goals
        $reminders = SavingReminder::where('user_id', $user->id)
            ->where(function ($q) {
                $q->where('type', 'saving')->orWhereNull('type');
            })
            ->with(['goal:id,name', 'wallet:id,name'])
            ->orderBy('is_active', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($r) => [
                'id'               => $r->id,
                'title'            => $r->title,
                'goal_id'          => $r->goal_id,
                'wallet_id'        => $r->wallet_id,
                'goal_name'        => $r->goal?->name ?? 'Tabungan Umum',
                'wallet_name'      => $r->wallet?->name ?? '-',
                'amount'           => (float) $r->amount,
                'amount_formatted' => 'Rp ' . number_format($r->amount, 0, ',', '.'),
                'type'             => $r->type ?? 'saving',
                'frequency'        => $r->frequency,
                'frequency_label'  => $r->frequency_label,
                'day_of_week'      => $r->day_of_week,
                'day_of_month'     => $r->day_of_month,
                'is_active'        => $r->is_active,
            ]);

        // Trigger notification check for due reminders
        SavingReminderService::checkAndNotifyDueReminders($user);

        return Inertia::render('Goals/Index', [
            'goals' => $goals,
            'wallets' => $wallets,
            'reminders' => $reminders,
        ]);
    }

    /**
     * Simpan savings goal baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'wallet_id' => ['required', 'exists:wallets,id'],
            'target_amount' => ['required', 'numeric', 'min:1000', 'max:9999999999999'],
            'target_date' => ['nullable', 'date', 'after:today'],
            'icon' => ['nullable', 'string', 'max:50'],
        ], [
            'name.required' => 'Nama target wajib diisi.',
            'wallet_id.required' => 'Wallet wajib dipilih.',
            'target_amount.required' => 'Jumlah target wajib diisi.',
            'target_amount.min' => 'Target minimal Rp 1.000.',
            'target_amount.max' => 'Target melebihi batas maksimal (Rp 9,99 Triliun).',
            'target_date.after' => 'Tanggal target harus di masa depan.',
        ]);

        $user = Auth::user();

        // Pastikan wallet milik user
        $wallet = Wallet::where('id', $validated['wallet_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        SavingsGoal::create([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'name' => $validated['name'],
            'target_amount' => $validated['target_amount'],
            'target_date' => $validated['target_date'] ?? null,
            'icon' => $validated['icon'] ?? 'savings',
            'status' => 'active',
        ]);

        return redirect()->route('goals.index')->with('success', 'Target tabungan berhasil dibuat!');
    }

    /**
     * Update savings goal yang sudah ada
     */
    public function update(Request $request, SavingsGoal $goal)
    {
        $user = Auth::user();

        if ($goal->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'wallet_id' => ['required', 'exists:wallets,id'],
            'target_amount' => ['required', 'numeric', 'min:1000', 'max:9999999999999'],
            'target_date' => ['nullable', 'date'],
            'icon' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'in:active,completed,cancelled'],
        ], [
            'target_amount.max' => 'Target melebihi batas maksimal (Rp 9,99 Triliun).',
        ]);

        // Pastikan wallet milik user
        Wallet::where('id', $validated['wallet_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        $goal->update([
            'name' => $validated['name'],
            'wallet_id' => $validated['wallet_id'],
            'target_amount' => $validated['target_amount'],
            'target_date' => $validated['target_date'] ?? $goal->target_date,
            'icon' => $validated['icon'] ?? $goal->icon,
            'status' => $validated['status'] ?? $goal->status,
        ]);

        return redirect()->route('goals.index')->with('success', 'Target tabungan berhasil diperbarui!');
    }

    /**
     * Hapus savings goal dan semua kontribusinya
     */
    public function destroy(SavingsGoal $goal)
    {
        $user = Auth::user();

        if ($goal->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $goal->delete();

        return redirect()->route('goals.index')->with('success', 'Target tabungan berhasil dihapus.');
    }

    /**
     * Tambah kontribusi (nabung) ke savings goal
     */
    public function deposit(Request $request, SavingsGoal $goal)
    {
        $user = Auth::user();

        if ($goal->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1000', 'max:9999999999999'],
            'description' => ['nullable', 'string', 'max:255'],
        ], [
            'amount.required' => 'Jumlah nabung wajib diisi.',
            'amount.min' => 'Minimal nabung Rp 1.000.',
            'amount.max' => 'Jumlah nabung melebihi batas maksimal (Rp 9,99 Triliun).',
        ]);

        GoalContribution::create([
            'goal_id' => $goal->id,
            'amount' => $validated['amount'],
            'source' => 'web',
            'description' => $validated['description'] ?? null,
            'contribution_date' => now()->toDateString(),
        ]);

        // Auto-complete if target reached
        $currentAmount = (float) $goal->contributions()->sum('amount');
        if ($currentAmount >= (float) $goal->target_amount && $goal->status === 'active') {
            $goal->update(['status' => 'completed']);
        }

        $percentage = (float) $goal->target_amount > 0 
            ? ($currentAmount / (float) $goal->target_amount) * 100 
            : 0;
            
        \App\Services\NotificationService::notifyGoalProgress($user->id, $goal->name, $percentage);

        return redirect()->route('goals.index')->with('success', 'Tabungan berhasil ditambahkan!');
    }

    /**
     * Tarik dana dari savings goal (kontribusi negatif)
     */
    public function withdraw(Request $request, SavingsGoal $goal)
    {
        $user = Auth::user();

        if ($goal->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $currentAmount = (float) $goal->contributions()->sum('amount');

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1000', 'max:' . $currentAmount],
            'description' => ['nullable', 'string', 'max:255'],
        ], [
            'amount.required' => 'Jumlah penarikan wajib diisi.',
            'amount.min' => 'Minimal penarikan Rp 1.000.',
            'amount.max' => 'Jumlah penarikan melebihi saldo terkumpul (Rp ' . number_format($currentAmount, 0, ',', '.') . ').',
        ]);

        GoalContribution::create([
            'goal_id' => $goal->id,
            'amount' => -abs($validated['amount']),
            'source' => 'web',
            'description' => $validated['description'] ?? 'Penarikan dana',
            'contribution_date' => now()->toDateString(),
        ]);

        // Revert completed status if balance dropped below target
        $newAmount = (float) $goal->contributions()->sum('amount');
        if ($newAmount < (float) $goal->target_amount && $goal->status === 'completed') {
            $goal->update(['status' => 'active']);
        }

        return redirect()->route('goals.index')->with('success', 'Dana berhasil ditarik dari target tabungan.');
    }
}
