<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('projects', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('project_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('client')->nullable();
            $table->string('location')->nullable();
            $table->string('country')->nullable()->index();
            $table->text('excerpt')->nullable();
            $table->longText('description')->nullable();
            $table->json('results')->nullable();
            $table->date('completed_at')->nullable();
            $table->foreignId('image_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('project_service', function (Blueprint $table): void {
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->primary(['project_id', 'service_id']);
        });

        Schema::create('industry_project', function (Blueprint $table): void {
            $table->foreignId('industry_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->primary(['industry_id', 'project_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('industry_project');
        Schema::dropIfExists('project_service');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('project_categories');
    }
};
