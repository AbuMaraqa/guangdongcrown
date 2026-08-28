<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_categories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('product_categories')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignId('image_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->nullable()->unique();
            $table->text('excerpt')->nullable();
            $table->longText('description')->nullable();
            $table->json('specifications')->nullable();
            $table->json('applications')->nullable();
            $table->json('downloads')->nullable();
            $table->foreignId('image_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('services', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon', 64)->nullable();
            $table->text('excerpt')->nullable();
            $table->longText('description')->nullable();
            $table->json('features')->nullable();
            $table->foreignId('image_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('industries', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon', 64)->nullable();
            $table->text('excerpt')->nullable();
            $table->longText('description')->nullable();
            $table->foreignId('image_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('solutions', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('icon', 64)->nullable();
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();
            $table->json('features')->nullable();
            $table->json('benefits')->nullable();
            $table->json('process')->nullable();
            $table->foreignId('image_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('industry_solution', function (Blueprint $table): void {
            $table->foreignId('industry_id')->constrained()->cascadeOnDelete();
            $table->foreignId('solution_id')->constrained()->cascadeOnDelete();
            $table->primary(['industry_id', 'solution_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('industry_solution');
        Schema::dropIfExists('solutions');
        Schema::dropIfExists('industries');
        Schema::dropIfExists('services');
        Schema::dropIfExists('products');
        Schema::dropIfExists('product_categories');
    }
};
