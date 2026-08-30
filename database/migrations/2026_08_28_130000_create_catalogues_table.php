<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Downloadable / browsable product catalogues.
     *
     * A catalogue is a cover plus an ordered run of page images — the profile
     * drawings and specification sheets customers actually flick through. The
     * pages themselves live in the shared media gallery (the `mediables`
     * pivot), so a drawing can be reused on a product page as well.
     */
    public function up(): void
    {
        Schema::create('catalogues', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('code', 40)->nullable()->index();
            $table->text('excerpt')->nullable();
            $table->foreignId('image_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->string('file_url', 2048)->nullable();
            $table->unsignedSmallInteger('year')->nullable();
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catalogues');
    }
};
