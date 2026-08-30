<?php

declare(strict_types=1);

use App\Support\Locales;
use Database\Seeders\CatalogueSeeder;

beforeEach(function () {
    $this->seed([CatalogueSeeder::class]);
});

test('a translated page keeps its prefix on every server generated url', function () {
    // Regression: Application::setLocale() rewrites config('app.locale'), so
    // reading the default from there made every URL on a translated page look
    // like a default-locale URL and lose its prefix.
    $this->get('/ar/catalogue')
        ->assertOk()
        ->assertSee('rel="canonical" href="'.url('/ar/catalogue').'"', escape: false)
        ->assertSee('property="og:url" content="'.url('/ar/catalogue').'"', escape: false);
});

test('each language reaches the catalogue under its own prefix', function () {
    foreach (Locales::codes() as $code) {
        $path = $code === Locales::default() ? '/catalogue' : "/{$code}/catalogue";

        $this->get($path)->assertOk();
    }
});

test('the canonical and alternates point at the language being read', function () {
    $this->get('/ar/products')
        ->assertOk()
        ->assertSee('hreflang="en-GB" href="'.url('/products').'"', escape: false)
        ->assertSee('hreflang="ar-AE" href="'.url('/ar/products').'"', escape: false)
        ->assertSee('hreflang="zh-CN" href="'.url('/zh/products').'"', escape: false);
});
