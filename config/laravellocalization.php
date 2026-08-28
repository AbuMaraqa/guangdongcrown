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
    | To add a language: add an entry here, add a `lang/<code>.json` UI
    | dictionary, and translate the content per locale in the dashboard. No
    | other code change is required.
    |
    */

    'supportedLocales' => [
        'en' => ['name' => 'English', 'script' => 'Latn', 'native' => 'English', 'regional' => 'en_GB'],
        'ar' => ['name' => 'Arabic', 'script' => 'Arab', 'native' => 'العربية', 'regional' => 'ar_AE'],
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
