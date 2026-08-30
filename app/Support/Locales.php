<?php

declare(strict_types=1);

namespace App\Support;

/**
 * Single point of truth for "which languages exist, and which way do they run".
 *
 * Everything reads from `config('laravellocalization.supportedLocales')`, so
 * adding a language is a config edit plus a `lang/<code>.json` dictionary —
 * no code in Blade, React or the CMS needs to know the list.
 */
final class Locales
{
    /**
     * Scripts written right to left. Anything else is treated as LTR.
     *
     * @var list<string>
     */
    private const RTL_SCRIPTS = ['Arab', 'Hebr', 'Thaa', 'Nkoo', 'Syrc', 'Samr', 'Mand'];

    /**
     * @return array<string, array{name: string, script: string, native: string, regional: string, flag?: string}>
     */
    public static function supported(): array
    {
        /** @var array<string, array{name: string, script: string, native: string, regional: string, flag?: string}> */
        return config('laravellocalization.supportedLocales', []);
    }

    /**
     * @return list<string>
     */
    public static function codes(): array
    {
        return array_keys(self::supported());
    }

    /**
     * The language served from clean URLs.
     *
     * Deliberately not config('app.locale'): Laravel's setLocale() writes the
     * active language back into that key, so on an Arabic request app.locale
     * is 'ar' and every "is this the default?" check would answer yes.
     */
    public static function default(): string
    {
        return (string) config('laravellocalization.defaultLocale', 'en');
    }

    public static function current(): string
    {
        $current = app()->getLocale();

        return self::isSupported($current) ? $current : self::default();
    }

    public static function isSupported(string $locale): bool
    {
        return array_key_exists($locale, self::supported());
    }

    public static function isRtl(?string $locale = null): bool
    {
        $script = self::supported()[$locale ?? self::current()]['script'] ?? 'Latn';

        return in_array($script, self::RTL_SCRIPTS, true);
    }

    public static function direction(?string $locale = null): string
    {
        return self::isRtl($locale) ? 'rtl' : 'ltr';
    }

    /**
     * URL for a named site route in a given locale.
     *
     * Route names are shared across locales and the default locale is
     * registered last, so `route()` alone always returns the un-prefixed URL.
     * This adds the prefix back for whichever language is being rendered.
     *
     * @param  array<array-key, mixed>  $parameters  positional or keyed, exactly as route() accepts
     */
    public static function url(string $name, array $parameters = [], ?string $locale = null): string
    {
        $url = route($name, $parameters);
        $locale ??= self::current();

        if ($locale === self::default()) {
            return $url;
        }

        $path = ltrim((string) parse_url($url, PHP_URL_PATH), '/');
        $query = parse_url($url, PHP_URL_QUERY);

        return url($locale.($path === '' ? '' : '/'.$path)).($query ? '?'.$query : '');
    }

    /**
     * The region code whose flag represents this language in the switcher.
     *
     * Cosmetic only. Falls back to the region half of `regional`, and then to
     * the language code itself, so a language added to the config without a
     * `flag` still renders something sensible instead of an empty slot.
     */
    public static function flag(?string $locale = null): string
    {
        $locale ??= self::current();
        $meta = self::supported()[$locale] ?? [];

        $region = $meta['flag']
            ?? (str_contains($meta['regional'] ?? '', '_')
                ? explode('_', $meta['regional'])[1]
                : $locale);

        return strtoupper(substr($region, 0, 2));
    }

    /**
     * Locale metadata for the language switcher, including the equivalent URL
     * for the page currently being rendered.
     *
     * @return list<array{code: string, name: string, native: string, direction: string, flag: string, url: string, current: bool}>
     */
    public static function forSwitcher(): array
    {
        $current = self::current();
        $switcher = [];

        foreach (self::supported() as $code => $meta) {
            $switcher[] = [
                'code' => $code,
                'name' => $meta['name'],
                'native' => $meta['native'],
                'direction' => self::direction($code),
                'flag' => self::flag($code),
                'url' => self::currentUrlIn($code),
                'current' => $code === $current,
            ];
        }

        return $switcher;
    }

    /**
     * The URL of the page being rendered, in another language.
     *
     * Derived from the request path rather than the matched route, so it works
     * for every page including the CMS catch-all.
     */
    public static function currentUrlIn(string $locale): string
    {
        $request = request();
        $segments = $request->segments();

        // Drop the prefix of whichever locale is currently being served.
        if (isset($segments[0]) && self::isSupported($segments[0])) {
            array_shift($segments);
        }

        if ($locale !== self::default()) {
            array_unshift($segments, $locale);
        }

        $query = $request->getQueryString();

        return url(implode('/', $segments)).($query ? '?'.$query : '');
    }

    /**
     * The `hreflang` alternates for the page being rendered, plus x-default.
     *
     * @return list<array{hreflang: string, href: string}>
     */
    public static function alternates(): array
    {
        $alternates = [];

        foreach (self::supported() as $code => $meta) {
            $url = self::currentUrlIn($code);

            $alternates[] = ['hreflang' => str_replace('_', '-', $meta['regional'] ?: $code), 'href' => $url];

            if ($code === self::default()) {
                $alternates[] = ['hreflang' => 'x-default', 'href' => $url];
            }
        }

        return $alternates;
    }
}
