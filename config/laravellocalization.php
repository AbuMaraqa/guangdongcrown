<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Supported locales
    |--------------------------------------------------------------------------
    |
    | The locales the public website is published in. `script` drives the text
    | direction: mcamara resolves anything in the Arab/Hebr/Thaa families to
    | RTL, which is what App\Support\Locales exposes to Blade and React.
    |
    | `flag` is an ISO 3166-1 alpha-2 region code and is purely cosmetic: it
    | picks the icon shown in the language switcher. It is kept separate from
    | `regional`, which drives hreflang — a language is not a country, so the
    | flag shown to readers and the region targeted for search are two
    | different decisions. Arabic is flagged PS for this company; changing that
    | one value changes the flag and nothing else.
    |
    | To add a language: add an entry here, add a `lang/<code>.json` UI
    | dictionary, and translate the content per locale in the dashboard. No
    | other code change is required.
    |
    */

    'supportedLocales' => [
        'en' => ['name' => 'English', 'script' => 'Latn', 'native' => 'English', 'regional' => 'en_GB', 'flag' => 'GB'],
        'ar' => ['name' => 'Arabic', 'script' => 'Arab', 'native' => 'العربية', 'regional' => 'ar_AE', 'flag' => 'PS'],
        'zh' => ['name' => 'Chinese', 'script' => 'Hans', 'native' => '简体中文', 'regional' => 'zh_CN', 'flag' => 'CN'],
    ],

    /*
    |--------------------------------------------------------------------------
    | URL shape
    |--------------------------------------------------------------------------
    |
    | English is the default and stays un-prefixed (/products), so every URL
    | that was already published keeps working and keeps its ranking. Arabic
    | is served from /ar/products.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Default locale
    |--------------------------------------------------------------------------
    |
    | The language served from clean, un-prefixed URLs.
    |
    | Read from its own key rather than from config('app.locale'), because
    | Application::setLocale() writes back into app.locale: once a request for
    | another language has been handled, app.locale IS that language, and using
    | it as "the default" would make every generated URL drop its prefix. Both
    | come from APP_LOCALE, so they cannot drift apart.
    |
    */

    'defaultLocale' => env('APP_LOCALE', 'en'),

    'hideDefaultLocaleInURL' => true,

    /*
    | Browser-language redirects are off on purpose: they make a URL return
    | different content to different visitors, which confuses crawlers and
    | breaks shared links. Visitors choose their language from the switcher,
    | and the choice is remembered in the session.
    */

    'useAcceptLanguageHeader' => false,

    'localesOrder' => [],

    'localesMapping' => [],

    'utf8suffix' => '.UTF-8',

    'urlsIgnored' => ['/skipped'],

    'httpMethodsIgnored' => ['POST', 'PUT', 'PATCH', 'DELETE'],

];
