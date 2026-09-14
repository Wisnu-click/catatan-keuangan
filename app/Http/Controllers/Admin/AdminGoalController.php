<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminGoalController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim($request->input('search', ''));
        $status = $request->input('status', 'all');

        $query = SavingsGoal::with(['user', 'wallet', 'contributions']);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            });
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $goals = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        $formatted = $goals->through(function ($g) {
            $current = (float) $g->contributions->sum('amount');
            $target = (float) $g->target_amount;
            $pct = $target > 0 ? round(($current / $target) * 100, 1) : 0;
            $remaining = max(0, $target - $current);

            return [
                'id' => $g->id,
                'name' => $g->name,
                'user_name' => $g->user->name ?? 'User #' . $g->user_id,
                'user_email' => $g->user->email ?? '-',
                'wallet_name' => $g->wallet->name ?? 'Default',
                'target_amount' => $target,
                'target_amount_formatted' => 'Rp ' . number_format($target, 0, ',', '.'),
                'current_amount' => $current,
                'current_amount_formatted' => 'Rp ' . number_format($current, 0, ',', '.'),
                'remaining_formatted' => 'Rp ' . number_format($remaining, 0, ',', '.'),
                'progress_percent' => $pct,
                'target_date' => $g->target_date ? $g->target_date->format('d M Y') : '-',
                'status' => $g->status ?: 'active',
                'created_at' => $g->created_at ? $g->created_at->format('d M Y') : '-',
            ];
        });

        return Inertia::render('Admin/Goals/Index', [
            'goals' => $formatted,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'summary' => [
                'total_goals' => SavingsGoal::count(),
                'active_goals' => SavingsGoal::where('status', 'active')->orWhereNull('status')->count(),
                'completed_goals' => SavingsGoal::where('status', 'completed')->count(),
                'total_target_volume' => (float) SavingsGoal::sum('target_amount'),
                'total_target_volume_formatted' => 'Rp ' . number_format((float) SavingsGoal::sum('target_amount'), 0, ',', '.'),
            ],
        ]);
    }
}

