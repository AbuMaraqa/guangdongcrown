<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Foundation tables for the CMS.
     *
     * Two tables that used to live here are now owned by packages:
     *
     *  - `settings` belongs to spatie/laravel-settings;
     *  - `media` belongs to spatie/laravel-medialibrary.
     *
     * `media_assets` is the piece medialibrary deliberately does not provide:
     * a shared library where a file is uploaded once and referenced from many
     * records. Each asset owns exactly one medialibrary file in its `file`
     * collection, and content tables hold a foreign key to the asset.
     */
    public function up(): void
    {
        Schema::create('media_assets', function (Blueprint $table): void {
            $table->id();
            $table->string('alt')->nullable();
            $table->string('title')->nullable();
            $table->string('folder')->nullable()->index();
            $table->string('hash', 64)->nullable()->index();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('mediables', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('media_asset_id')->constrained('media_assets')->cascadeOnDelete();
            $table->morphs('mediable');
            $table->string('collection')->default('gallery');
            $table->unsignedInteger('position')->default(0);

            $table->unique(['media_asset_id', 'mediable_id', 'mediable_type', 'collection'], 'mediables_unique');
            $table->index(['mediable_type', 'mediable_id', 'collection'], 'mediables_lookup');
        });

        Schema::create('seos', function (Blueprint $table): void {
            $table->id();
            $table->morphs('seoable');
            $table->string('locale', 8)->index();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('canonical_url')->nullable();
            $table->string('og_title')->nullable();
            $table->text('og_description')->nullable();
            $table->foreignId('og_image_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->string('robots')->default('index,follow');
            $table->timestamps();

            $table->unique(['seoable_type', 'seoable_id', 'locale'], 'seos_unique');
        });

        Schema::create('activities', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 32)->index();
            $table->nullableMorphs('subject');
            $table->string('description');
            $table->json('properties')->nullable();
            $table->timestamp('created_at')->nullable()->index();
        });

        Schema::create('page_views', function (Blueprint $table): void {
            $table->id();
            $table->string('path', 500);
            $table->string('page_type', 64)->nullable()->index();
            $table->string('locale', 8)->nullable()->index();
            $table->string('referrer', 500)->nullable();
            $table->string('visitor_hash', 64)->nullable()->index();
            $table->timestamp('viewed_at')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_views');
        Schema::dropIfExists('activities');
        Schema::dropIfExists('seos');
        Schema::dropIfExists('mediables');
        Schema::dropIfExists('media_assets');
    }
};
