<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('role', 32)->default('editor')->after('email')->index();
            $table->boolean('is_active')->default(true)->after('role');
            $table->string('job_title')->nullable()->after('is_active');
            $table->timestamp('last_login_at')->nullable()->after('job_title');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['role', 'is_active', 'job_title', 'last_login_at']);
        });
    }
};
