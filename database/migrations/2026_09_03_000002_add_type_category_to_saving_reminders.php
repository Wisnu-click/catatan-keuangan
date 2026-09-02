<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('saving_reminders', function (Blueprint $table) {
            $table->string('type', 20)->default('saving')->after('amount')->comment('saving, income, expense');
            $table->foreignId('category_id')->nullable()->after('wallet_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('saving_reminders', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn(['type', 'category_id']);
        });
    }
};
