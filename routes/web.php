<?php

use App\Http\Controllers\Site\CapabilityController;
use App\Http\Controllers\Site\CompanyController;
use App\Http\Controllers\Site\ContactController;
use App\Http\Controllers\Site\HomeController;
use App\Http\Controllers\Site\InsightController;
use App\Http\Controllers\Site\ProductController;
use App\Http\Controllers\Site\ProjectController;
use App\Http\Controllers\Site\SitemapController;
use Illuminate\Support\Facades\Route;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

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
| Wrapped in the locale prefix. English is the default and stays un-prefixed
| (/products); other languages are served from /<locale>/products. Route
| names are unchanged, so route('site.products.index') keeps resolving to the
| URL for whichever locale is active.
|
*/
Route::group([
    'prefix' => LaravelLocalization::setLocale(),
    'middleware' => ['localeSessionRedirect', 'localizationRedirect', 'localeViewPath'],
], function (): void {
    Route::middleware('track.views')->name('site.')->group(function (): void {
        Route::get('/', HomeController::class)->name('home');

        Route::get('about', [CompanyController::class, 'about'])->name('about');
        Route::get('global-presence', [CompanyController::class, 'presence'])->name('presence');
        Route::get('faq', [CompanyController::class, 'faq'])->name('faq');

        Route::get('team', [CompanyController::class, 'team'])->name('team.index');
        Route::get('team/{member}', [CompanyController::class, 'member'])->name('team.show');

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
        // shadow the dashboard, auth or storage routes.
        Route::get('{page}', [CompanyController::class, 'show'])
            ->where('page', '(?!admin|settings|login|logout|storage|build)[a-z0-9]+(?:-[a-z0-9]+)*')
            ->name('page');
    });
});
