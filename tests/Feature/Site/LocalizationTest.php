<?php

use App\Enums\ContentStatus;
use App\Models\Page;
use App\Support\Locales;
use Database\Seeders\CatalogueSeeder;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->seed([CatalogueSeeder::class]);
});

test('the default locale is served without a prefix', function () {
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('locale.current', 'en')
            ->where('locale.direction', 'ltr')
            ->where('locale.rtl', false)
        );
});

test('a prefixed url serves the other language', function () {
    $this->get('/ar')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('locale.current', 'ar')
            ->where('locale.direction', 'rtl')
            ->where('locale.rtl', true)
        );
});

test('the default locale prefix redirects to the clean url', function () {
    $this->get('/en/products')->assertRedirect('/products');
});

test('an unsupported locale prefix is not a locale', function () {
    // `de` is not published, so it falls through to the CMS page route
    // and 404s rather than serving English from a German URL.
    $this->get('/de/products')->assertNotFound();
});

test('the document carries the right language and direction', function () {
    $this->get('/')->assertSee('lang="en"', escape: false)->assertSee('dir="ltr"', escape: false);
    $this->get('/ar')->assertSee('lang="ar"', escape: false)->assertSee('dir="rtl"', escape: false);
});

test('every page advertises its translations with hreflang', function () {
    $response = $this->get('/products');

    $response->assertSee('hreflang="en-GB"', escape: false)
        ->assertSee('hreflang="ar-AE"', escape: false)
        ->assertSee('hreflang="x-default"', escape: false);
});

test('the arabic ui dictionary is shared with the page', function () {
    $this->get('/ar')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->where(
            'translations.Request a quotation',
            'اطلب عرض سعر',
        ));
});

test('english falls back to the key, so no dictionary is needed', function () {
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->where('translations', []));
});

test('content settings resolve per locale', function () {
    $this->get('/')->assertInertia(
        fn (AssertableInertia $page) => $page->where(
            'hero.headline',
            'Precision in aluminium. Confidence in global logistics.',
        ),
    );

    $this->get('/ar')->assertInertia(
        fn (AssertableInertia $page) => $page->where(
            'hero.headline',
            'دقة في الألمنيوم. ثقة في الخدمات اللوجستية العالمية.',
        ),
    );
});

test('the switcher offers every language with its own url', function () {
    // Driven by the configured list rather than a hard-coded pair, so adding
    // a language is a config change and not a test change.
    $this->get('/products')->assertInertia(fn (AssertableInertia $page) => $page
        ->has('locale.available', count(Locales::codes()))
        ->where('locale.available.0.code', 'en')
        ->where('locale.available.1.code', 'ar')
        ->where('locale.available.1.native', 'العربية')
    );
});

test('the locale helper reports direction from the script', function () {
    expect(Locales::isRtl('ar'))->toBeTrue()
        ->and(Locales::isRtl('en'))->toBeFalse()
        ->and(Locales::direction('ar'))->toBe('rtl')
        ->and(Locales::isRtl('zh'))->toBeFalse()
        ->and(Locales::codes())->toContain('en', 'ar', 'zh')
        ->and(Locales::codes()[0])->toBe(Locales::default());
});

test('the sitemap lists every language', function () {
    $response = $this->get('/sitemap.xml')->assertOk();

    $response->assertSee('/products', escape: false);

    foreach (Locales::codes() as $code) {
        if ($code === Locales::default()) {
            continue;
        }

        $response->assertSee("/{$code}/products", escape: false);
    }
});

test('route() generates the unprefixed url for shared route names', function () {
    // Every locale registers the same route names. Laravel keeps the first
    // route registered under a name, so the default locale has to be
    // registered first or route() silently yields /ar/... everywhere.
    expect(route('site.home', absolute: false))->toBe('/')
        ->and(route('site.products.index', absolute: false))->toBe('/products');
});

test('the page catch-all does not swallow the locale prefix', function () {
    // /ar has to reach the Arabic home page, not the CMS page named "ar".
    $this->get('/ar')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('site/home'));
});

test('a page slug may start with a reserved word', function () {
    Page::query()->create([
        'title' => 'Admin guide',
        'slug' => 'admin-guide',
        'status' => ContentStatus::Published,
        'position' => 0,
    ]);

    // The catch-all excludes the reserved words themselves, not everything
    // that happens to begin with one.
    $this->get('/admin-guide')->assertOk();
    $this->get('/admin')->assertRedirect();
});

test('the active locale does not become the default locale', function () {
    // Application::setLocale() writes into config('app.locale'), so anything
    // that treats that key as "the default" starts answering yes to every
    // language and drops the prefix from generated URLs.
    app()->setLocale('ar');

    expect(Locales::default())->toBe('en')
        ->and(Locales::current())->toBe('ar')
        ->and(Locales::url('site.catalogues.index'))->toEndWith('/ar/catalogue');
});

test('a translated page generates links inside its own language', function () {
    $this->get('/ar')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('locale.available.0.url', url('/'))
            ->where('locale.available.1.url', url('/ar'))
        );
});

test('chinese is served from its own prefix', function () {
    $this->get('/zh')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('locale.current', 'zh')
            ->where('locale.direction', 'ltr')
            ->where('locale.rtl', false)
        );

    $this->get('/zh/catalogue')->assertOk();
});

test('every supported language carries a flag and a direction', function () {
    foreach (Locales::forSwitcher() as $option) {
        expect($option['flag'])->toMatch('/^[A-Z]{2}$/')
            ->and($option['direction'])->toBeIn(['ltr', 'rtl']);
    }
});
