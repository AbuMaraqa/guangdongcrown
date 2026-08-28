<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_members', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('position')->nullable();
            $table->string('department')->nullable();
            $table->text('bio')->nullable();
            $table->string('email')->nullable();
            $table->json('socials')->nullable();
            $table->foreignId('photo_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->boolean('is_leadership')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('position_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('testimonials', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('company')->nullable();
            $table->string('role')->nullable();
            $table->string('country')->nullable();
            $table->text('content');
            $table->unsignedTinyInteger('rating')->nullable();
            $table->foreignId('avatar_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('credentials', function (Blueprint $table): void {
            $table->id();
            $table->string('type', 32)->default('certification')->index();
            $table->string('name');
            $table->string('issuer')->nullable();
            $table->text('description')->nullable();
            $table->string('reference')->nullable();
            $table->unsignedSmallInteger('year')->nullable();
            $table->foreignId('image_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('milestones', function (Blueprint $table): void {
            $table->id();
            $table->string('year', 16);
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('image_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('locations', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('type', 32)->default('office')->index();
            $table->string('country');
            $table->string('country_code', 2)->nullable();
            $table->string('city')->nullable();
            $table->text('address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->boolean('is_headquarters')->default(false);
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('faqs', function (Blueprint $table): void {
            $table->id();
            $table->string('question');
            $table->text('answer');
            $table->string('category', 64)->nullable()->index();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('pages', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();
            $table->foreignId('image_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->string('status', 16)->default('draft')->index();
            $table->boolean('is_system')->default(false);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
        Schema::dropIfExists('faqs');
        Schema::dropIfExists('locations');
        Schema::dropIfExists('milestones');
        Schema::dropIfExists('credentials');
        Schema::dropIfExists('testimonials');
        Schema::dropIfExists('team_members');
    }
};
