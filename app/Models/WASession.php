<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WASession extends Model
{
    use HasFactory;

    protected $table = 'wa_sessions';

    protected $fillable = [
        'user_id',
        'phone_number',
        'context_json',
        'last_intent',
        'expires_at',
    ];

    protected $casts = [
        'context_json' => 'array',
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

