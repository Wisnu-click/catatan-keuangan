<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GoalContribution extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'goal_id',
        'amount',
        'source',
        'description',
        'contribution_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'contribution_date' => 'date',
    ];

    public function goal()
    {
        return $this->belongsTo(SavingsGoal::class, 'goal_id');
    }
}

