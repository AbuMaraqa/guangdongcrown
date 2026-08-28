<?php

use App\Models\Post;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Service;
use Database\Seeders\CatalogueSeeder;
use Database\Seeders\EditorialSeeder;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->seed([CatalogueSeeder::class, EditorialSeeder::class]);
});

test('the home page renders with its seo payload', function () {
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('site/home')
            ->has('seo.title')
            ->has('services')
            ->has('hero.headline')
        );
});

test('every top-level public page responds', function (string $path) {
    $this->get($path)->assertOk();
})->with([
    '/about',
    '/capabilities',
    '/products',
    '/logistics',
    '/solutions',
    '/industries',
    '/projects',
    '/global-presence',
    '/team',
    '/insights',
    '/faq',
    '/contact',
    '/request-a-quotation',
]);

test('a product detail page renders its specifications', function () {
    $product = Product::query()->active()->firstOrFail();

    $this->get("/products/{$product->slug}")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('site/products/show')
            ->where('product.slug', $product->slug)
            ->has('product.specifications')
        );
});

test('inactive records are not reachable', function () {
    $product = Product::query()->firstOrFail();
    $product->update(['is_active' => false]);

    $this->get("/products/{$product->slug}")->assertNotFound();
});

test('the product catalogue can be filtered by category', function () {
    $category = ProductCategory::query()->firstOrFail();

    $this->get("/products?category={$category->slug}")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->where('filters.category', $category->slug));
});

test('published articles are readable and drafts are not', function () {
    $published = Post::query()->published()->firstOrFail();
    $this->get("/insights/{$published->slug}")->assertOk();

    $published->update(['status' => 'draft']);
    $this->get("/insights/{$published->slug}")->assertNotFound();
});

test('the sitemap lists live content', function () {
    $service = Service::query()->active()->firstOrFail();

    $this->get('/sitemap.xml')
        ->assertOk()
        ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
        ->assertSee(route('site.services.show', $service->slug), escape: false);
});

test('robots.txt keeps crawlers out of the dashboard', function () {
    $this->get('/robots.txt')
        ->assertOk()
        ->assertSee('Disallow: /admin')
        ->assertSee('Sitemap:');
});
