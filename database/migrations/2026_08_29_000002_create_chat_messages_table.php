<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('sender', ['user', 'ai']);
            $table->enum('type', ['text', 'image', 'receipt'])->default('text');
            $table->text('content')->nullable();
            $table->string('image_path')->nullable();
            $table->json('structured_data')->nullable();
            $table->string('ai_model', 50)->default('gpt-4o');
            $table->boolean('is_confirmed')->default(false);
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->onDelete('set null');
            $table->timestamps();

            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};

