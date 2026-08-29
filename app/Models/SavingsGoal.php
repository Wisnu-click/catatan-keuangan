<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavingsGoal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'wallet_id',
        'name',
        'target_amount',
        'target_date',
        'icon',
        'status',
    ];

    protected $casts = [
        'target_amount' => 'decimal:2',
        'target_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    public function contributions()
    {
        return $this->hasMany(GoalContribution::class, 'goal_id');
    }

    public function getCurrentAmountAttribute(): float
    {
        return (float) $this->contributions()->sum('amount');
    }
}

