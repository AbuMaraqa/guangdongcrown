import { useCallback } from 'react';
import { useTranslations } from '@/hooks/use-translations';
import { localizePath } from '@/lib/locale-path';

/**
 * Returns a function that rewrites an app-internal path into the language
 * currently being read. See localizePath for the rules.
 */
export function useLocalePath(): (href: string) => string {
    const { locale, defaultLocale, locales } = useTranslations();

    return useCallback(
        (href: string) =>
            localizePath(
                href,
                locale,
                defaultLocale,
                locales.map((option) => option.code),
            ),
        [defaultLocale, locale, locales],
    );
}
