import { usePage } from '@inertiajs/react';
import { useCallback } from 'react';

export type LocaleOption = {
    code: string;
    name: string;
    native: string;
    direction: 'ltr' | 'rtl';
    /** ISO 3166-1 alpha-2 region code for the switcher icon. */
    flag: string;
    url: string;
    current: boolean;
};

export type LocaleState = {
    current: string;
    default: string;
    direction: 'ltr' | 'rtl';
    rtl: boolean;
    available: LocaleOption[];
};

/**
 * UI string lookup, following Laravel's JSON translation convention: the
 * English copy *is* the key, so `lang/en.json` never needs to exist and an
 * untranslated string degrades to readable English rather than a blank.
 *
 * `:name` placeholders are replaced the same way Laravel replaces them.
 */
export function useTranslations() {
    const page = usePage();
    const shared = page.props.translations as
        Record<string, string> | undefined;
    const locale = (page.props.locale ?? {
        current: 'en',
        default: 'en',
        direction: 'ltr',
        rtl: false,
        available: [],
    }) as LocaleState;

    const t = useCallback(
        (
            key: string,
            replace: Record<string, string | number> = {},
        ): string => {
            let line = shared?.[key] ?? key;

            for (const [token, value] of Object.entries(replace)) {
                line = line.replace(`:${token}`, String(value));
            }

            return line;
        },
        [shared],
    );

    return {
        t,
        locale: locale.current,
        defaultLocale: locale.default,
        direction: locale.direction,
        rtl: locale.rtl,
        locales: locale.available,
    };
}
