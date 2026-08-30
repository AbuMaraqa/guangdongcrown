<?php

use App\Http\Controllers\Site\CapabilityController;
use App\Http\Controllers\Site\CatalogueController;
use App\Http\Controllers\Site\CompanyController;
use App\Http\Controllers\Site\ContactController;
use App\Http\Controllers\Site\HomeController;
use App\Http\Controllers\Site\InsightController;
use App\Http\Controllers\Site\ProductController;
use App\Http\Controllers\Site\ProjectController;
use App\Http\Controllers\Site\SitemapController;
use App\Support\Locales;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Dashboard and account routes
|--------------------------------------------------------------------------
|
| Registered first so the localized {page} catch-all below can never shadow
| them. These are not locale-prefixed: the dashboard has one interface
| language, while the content it edits is translated per locale.
|
*/
require __DIR__.'/admin.php';
require __DIR__.'/settings.php';

Route::get('sitemap.xml', [SitemapController::class, 'sitemap'])->name('sitemap');
Route::get('robots.txt', [SitemapController::class, 'robots'])->name('robots');

/*
|--------------------------------------------------------------------------
| Public website
|--------------------------------------------------------------------------
|
| The same routes are registered once per language: the default locale keeps
| the clean URLs (/products) and every other locale gets a static prefix
| (/ar/products).
|
| The prefix is deliberately a literal string rather than resolved from the
| incoming request. Request-time resolution breaks anywhere routes are
| registered before a request exists — `route:cache` and the test harness
| both do exactly that — and would silently serve the default language.
|
| Route names are shared across locales, and Laravel keeps the *first* route
| registered under a given name in its name lookup. The default locale is
| therefore registered first, so `route('site.products.index')` yields the
| clean URL; server-side code that needs the URL for the *active* locale calls
| Locales::url(). The prefixed groups still match their own URLs — the names
| only decide which one route() generates.
|
*/
$site = function (): void {
    Route::middleware('track.views')->name('site.')->group(function (): void {
        Route::get('/', HomeController::class)->name('home');

        Route::get('about', [CompanyController::class, 'about'])->name('about');
        Route::get('global-presence', [CompanyController::class, 'presence'])->name('presence');
        Route::get('faq', [CompanyController::class, 'faq'])->name('faq');

        Route::get('team', [CompanyController::class, 'team'])->name('team.index');
        Route::get('team/{member}', [CompanyController::class, 'member'])->name('team.show');

        Route::get('our-products', [CatalogueController::class, 'products'])->name('products.categories');
        Route::get('catalogue', [CatalogueController::class, 'index'])->name('catalogues.index');
        Route::get('catalogue/{catalogue}/pages', [CatalogueController::class, 'pages'])->name('catalogues.pages');

        Route::get('products', [ProductController::class, 'index'])->name('products.index');
        Route::get('products/{product}', [ProductController::class, 'show'])->name('products.show');

        Route::get('capabilities', [CapabilityController::class, 'services'])->name('services.index');
        Route::get('capabilities/{service}', [CapabilityController::class, 'service'])->name('services.show');

        Route::get('logistics', [CapabilityController::class, 'logistics'])->name('logistics');

        Route::get('solutions', [CapabilityController::class, 'solutions'])->name('solutions.index');
        Route::get('solutions/{solution}', [CapabilityController::class, 'solution'])->name('solutions.show');

        Route::get('industries', [CapabilityController::class, 'industries'])->name('industries.index');
        Route::get('industries/{industry}', [CapabilityController::class, 'industry'])->name('industries.show');

        Route::get('projects', [ProjectController::class, 'index'])->name('projects.index');
        Route::get('projects/{project}', [ProjectController::class, 'show'])->name('projects.show');

        Route::get('insights', [InsightController::class, 'index'])->name('insights.index');
        Route::get('insights/{post}', [InsightController::class, 'show'])->name('insights.show');

        Route::get('contact', [ContactController::class, 'contact'])->name('contact');
        Route::get('request-a-quotation', [ContactController::class, 'quote'])->name('quote');
        Route::post('enquiries', [ContactController::class, 'store'])
            ->middleware('throttle:6,1')
            ->name('inquiries.store');

        // Free-form CMS pages. Declared last, and constrained so it can never
        // shadow the dashboard, auth, storage or locale-prefixed routes.
        //
        // The exclusions are anchored with $ so they reject only the reserved
        // word itself: a page legitimately slugged "admin-guide" still resolves.
        Route::get('{page}', [CompanyController::class, 'show'])
            ->where('page', '(?!(?:'.implode('|', [
                'admin', 'settings', 'login', 'logout', 'storage', 'build',
                ...Locales::codes(),
            ]).')$)[a-z0-9]+(?:-[a-z0-9]+)*')
            ->name('page');
    });
};

/*
| The default language is served un-prefixed, so /en/... is a duplicate of
| the canonical URL. Redirect it permanently rather than serving or 404ing,
| in case it was ever linked externally.
*/
Route::get(Locales::default().'/{path?}', fn (?string $path = null) => redirect('/'.($path ?? ''), 301))
    ->where('path', '.*')
    ->name('locale.canonical');

Route::middleware('setlocale:'.Locales::default())->group($site);

foreach (Locales::codes() as $locale) {
    if ($locale === Locales::default()) {
        continue;
    }

    Route::prefix($locale)->middleware("setlocale:{$locale}")->group($site);
}
