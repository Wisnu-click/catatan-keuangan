<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('saving_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('goal_id')->nullable()->constrained('savings_goals')->nullOnDelete();
            $table->foreignId('wallet_id')->constrained()->cascadeOnDelete();
            $table->string('title', 150);
            $table->decimal('amount', 15, 2);
            $table->enum('frequency', ['daily', 'weekly', 'monthly'])->default('weekly');
            $table->tinyInteger('day_of_week')->nullable()->comment('0=Minggu, 6=Sabtu');
            $table->tinyInteger('day_of_month')->nullable()->comment('1-31');
            $table->boolean('is_active')->default(true);
            $table->date('last_notified_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saving_reminders');
    }
};
