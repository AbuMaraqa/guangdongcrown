<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inquiries', function (Blueprint $table): void {
            $table->id();
            $table->string('reference', 24)->unique();
            $table->string('type', 16)->default('contact')->index();
            $table->string('name');
            $table->string('company')->nullable();
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('country')->nullable();
            $table->foreignId('service_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('quantity')->nullable();
            $table->text('message');
            $table->string('attachment_path')->nullable();
            $table->string('attachment_name')->nullable();
            $table->string('status', 24)->default('new')->index();
            $table->string('source_url', 512)->nullable();
            $table->string('ip_hash', 64)->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['type', 'status']);
        });

        Schema::create('inquiry_notes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('inquiry_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->text('body');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inquiry_notes');
        Schema::dropIfExists('inquiries');
    }
};
