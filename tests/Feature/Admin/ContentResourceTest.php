<?php

use App\Models\MediaAsset;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\CatalogueSeeder;

beforeEach(function () {
    $this->seed([CatalogueSeeder::class]);
    $this->actingAs(User::factory()->superAdmin()->create());
});

test('a product can be created through the schema-driven form', function () {
    $category = ProductCategory::query()->firstOrFail();

    $this->post('/admin/content/products', [
        'name' => '5083 marine plate',
        'slug' => '',
        'excerpt' => 'High-magnesium plate for structural marine fabrication.',
        'description' => '<p>Supplied to EN 485.</p>',
        'product_category_id' => $category->id,
        'specifications' => [
            ['label' => 'Alloy', 'value' => '5083'],
            ['label' => '', 'value' => ''],
        ],
        'applications' => ['Hull plating', ''],
        'is_active' => true,
        'is_featured' => false,
        'position' => 0,
    ])->assertRedirect();

    $product = Product::query()->where('name', '5083 marine plate')->sole();

    expect($product->slug)->toBe('5083-marine-plate')
        ->and($product->specifications)->toHaveCount(1)
        ->and($product->applications)->toBe(['Hull plating']);
});

test('rich text is sanitised before it is stored', function () {
    $this->post('/admin/content/products', [
        'name' => 'Sanitised product',
        'description' => '<p>Safe copy.</p><script>alert(1)</script><img src=x onerror="alert(2)">',
        'is_active' => true,
        'position' => 0,
    ])->assertRedirect();

    $product = Product::query()->where('name', 'Sanitised product')->sole();

    expect($product->description)
        ->toContain('Safe copy.')
        ->not->toContain('<script')
        ->not->toContain('onerror');
});

test('slugs stay unique across records', function () {
    $existing = Product::query()->firstOrFail();

    $this->post('/admin/content/products', [
        'name' => 'Another product',
        'slug' => $existing->slug,
        'is_active' => true,
        'position' => 0,
    ])->assertSessionHasErrors('slug');
});

test('validation errors are returned from the schema rules', function () {
    $this->post('/admin/content/products', ['name' => ''])
        ->assertSessionHasErrors('name');
});

test('an image id must reference a real media record', function () {
    $this->post('/admin/content/products', [
        'name' => 'Bad image reference',
        'image_id' => 99999,
        'is_active' => true,
        'position' => 0,
    ])->assertSessionHasErrors('image_id');
});

test('a product can be updated, soft deleted and restored', function () {
    $product = Product::query()->firstOrFail();

    $this->put("/admin/content/products/{$product->id}", [
        'name' => 'Renamed product',
        'slug' => $product->slug,
        'is_active' => true,
        'position' => 0,
    ])->assertRedirect();

    expect($product->fresh()->name)->toBe('Renamed product');

    $this->delete("/admin/content/products/{$product->id}")->assertRedirect();
    expect(Product::query()->find($product->id))->toBeNull();

    $this->post("/admin/content/products/{$product->id}/restore")->assertRedirect();
    expect(Product::query()->find($product->id))->not->toBeNull();
});

test('a boolean column can be toggled from the index', function () {
    $product = Product::query()->firstOrFail();
    $before = $product->is_featured;

    $this->post("/admin/content/products/{$product->id}/toggle", ['column' => 'is_featured'])
        ->assertRedirect();

    expect($product->fresh()->is_featured)->toBe(! $before);
});

test('only whitelisted columns can be toggled', function () {
    $product = Product::query()->firstOrFail();

    $this->post("/admin/content/products/{$product->id}/toggle", ['column' => 'name'])
        ->assertSessionHasErrors('column');
});

test('seo overrides are stored and cleared with the record', function () {
    $product = Product::query()->firstOrFail();

    $this->put("/admin/content/products/{$product->id}", [
        'name' => $product->name,
        'slug' => $product->slug,
        'is_active' => true,
        'position' => 0,
        'seo' => ['meta_title' => 'Custom title', 'robots' => 'noindex,follow'],
    ])->assertRedirect();

    expect($product->fresh()->seo?->meta_title)->toBe('Custom title');

    $this->put("/admin/content/products/{$product->id}", [
        'name' => $product->name,
        'slug' => $product->slug,
        'is_active' => true,
        'position' => 0,
        'seo' => ['meta_title' => '', 'robots' => ''],
    ])->assertRedirect();

    expect($product->fresh()->seo)->toBeNull();
});

test('a gallery only accepts existing media', function () {
    $product = Product::query()->firstOrFail();

    $media = MediaAsset::query()->create(['title' => 'Test asset']);

    $this->put("/admin/content/products/{$product->id}", [
        'name' => $product->name,
        'slug' => $product->slug,
        'is_active' => true,
        'position' => 0,
        'gallery' => [$media->id],
    ])->assertRedirect();

    expect($product->fresh()->gallery)->toHaveCount(1);

    $this->put("/admin/content/products/{$product->id}", [
        'name' => $product->name,
        'slug' => $product->slug,
        'is_active' => true,
        'position' => 0,
        'gallery' => [424242],
    ])->assertSessionHasErrors('gallery.0');
});

test('reordering persists the new positions', function () {
    $ids = Product::query()->ordered()->pluck('id')->all();
    $reversed = array_reverse($ids);

    $this->post('/admin/content/products/reorder', ['ids' => $reversed])->assertRedirect();

    expect(Product::query()->ordered()->pluck('id')->all())->toBe($reversed);
});
