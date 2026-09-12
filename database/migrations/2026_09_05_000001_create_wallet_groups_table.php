<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('description', 255)->nullable();
            $table->string('icon', 50)->default('account_tree');
            $table->string('color_hex', 7)->default('#3B4CCA');
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
            $table->index(['user_id', 'display_order']);
        });

        Schema::table('wallets', function (Blueprint $table) {
            $table->foreignId('wallet_group_id')->nullable()->after('user_id')->constrained('wallet_groups')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('wallets', function (Blueprint $table) {
            $table->dropConstrainedForeignId('wallet_group_id');
        });

        Schema::dropIfExists('wallet_groups');
    }
};