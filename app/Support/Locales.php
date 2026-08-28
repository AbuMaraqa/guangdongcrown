<?php

declare(strict_types=1);

namespace App\Support;

use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

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
     * @return array<string, array{name: string, script: string, native: string, regional: string}>
     */
    public static function supported(): array
    {
        /** @var array<string, array{name: string, script: string, native: string, regional: string}> */
        return config('laravellocalization.supportedLocales', []);
    }

    /**
     * @return list<string>
     */
    public static function codes(): array
    {
        return array_keys(self::supported());
    }

    public static function default(): string
    {
        return (string) config('app.locale', 'en');
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
     * Locale metadata for the language switcher, including the equivalent URL
     * for the page currently being rendered.
     *
     * @return list<array{code: string, name: string, native: string, direction: string, url: string, current: bool}>
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
                'url' => LaravelLocalization::getLocalizedURL($code, null, [], true) ?: '/',
                'current' => $code === $current,
            ];
        }

        return $switcher;
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
            $url = LaravelLocalization::getLocalizedURL($code, null, [], true);

            if (! $url) {
                continue;
            }

            $alternates[] = ['hreflang' => str_replace('_', '-', $meta['regional'] ?: $code), 'href' => $url];

            if ($code === self::default()) {
                $alternates[] = ['hreflang' => 'x-default', 'href' => $url];
            }
        }

        return $alternates;
    }
}
