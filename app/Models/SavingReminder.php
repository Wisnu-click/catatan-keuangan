<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavingReminder extends Model
{
    protected $fillable = [
        'user_id',
        'goal_id',
        'wallet_id',
        'category_id',
        'title',
        'amount',
        'type',
        'frequency',
        'day_of_week',
        'day_of_month',
        'is_active',
        'last_notified_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_active' => 'boolean',
        'last_notified_at' => 'date',
        'day_of_week' => 'integer',
        'day_of_month' => 'integer',
    ];

    /* ---- Relations ---- */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function goal()
    {
        return $this->belongsTo(SavingsGoal::class, 'goal_id');
    }

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /* ---- Accessors ---- */

    public function getFrequencyLabelAttribute(): string
    {
        return match ($this->frequency) {
            'daily' => 'Harian',
            'weekly' => 'Mingguan',
            'monthly' => 'Bulanan',
            default => $this->frequency,
        };
    }

    public function getTypeLabelAttribute(): string
    {
        return match ($this->type ?? 'saving') {
            'saving' => 'Tabungan',
            'income' => 'Pemasukan',
            'expense' => 'Pengeluaran',
            default => $this->type,
        };
    }
}
