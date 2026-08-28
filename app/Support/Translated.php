<?php

declare(strict_types=1);

namespace App\Support;

/**
 * Resolves a per-locale value out of a settings array.
 *
 * Translatable settings are stored as `['en' => '…', 'ar' => '…']` rather than
 * in a translations table: they are a handful of singleton strings, not
 * queryable content, and keeping them inside the settings payload means the
 * whole site chrome still loads in one read.
 */
final class Translated
{
    /**
     * @param  array<string, string|null>|string|null  $value
     */
    public static function get(array|string|null $value, ?string $locale = null): ?string
    {
        if ($value === null) {
            return null;
        }

        // Settings written before a second locale existed are plain strings.
        if (is_string($value)) {
            return $value !== '' ? $value : null;
        }

        $locale ??= Locales::current();

        $resolved = $value[$locale] ?? null;

        if (is_string($resolved) && $resolved !== '') {
            return $resolved;
        }

        $fallback = $value[Locales::default()] ?? null;

        return is_string($fallback) && $fallback !== '' ? $fallback : null;
    }

    /**
     * Fills every supported locale, so a form always has a field per language.
     *
     * @param  array<string, string|null>|string|null  $value
     * @return array<string, string|null>
     */
    public static function fill(array|string|null $value): array
    {
        $filled = [];

        foreach (Locales::codes() as $code) {
            $filled[$code] = is_array($value)
                ? ($value[$code] ?? null)
                : ($code === Locales::default() ? $value : null);
        }

        return $filled;
    }

    /**
     * Resolves each row of a repeater whose values are per-locale arrays.
     *
     * @param  list<array<string, mixed>>  $rows
     * @param  list<string>  $keys
     * @return list<array<string, mixed>>
     */
    public static function rows(array $rows, array $keys, ?string $locale = null): array
    {
        return array_map(function (array $row) use ($keys, $locale): array {
            foreach ($keys as $key) {
                if (array_key_exists($key, $row)) {
                    $value = $row[$key];
                    $row[$key] = self::get(is_array($value) || is_string($value) ? $value : null, $locale);
                }
            }

            return $row;
        }, $rows);
    }
}
