<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GoldTarget extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'target_grams',
        'target_date',
        'notes',
    ];

    protected $casts = [
        'target_grams' => 'decimal:4',
        'target_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

