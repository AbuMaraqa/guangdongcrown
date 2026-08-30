import { useEffect } from 'react';
import { useTranslations } from '@/hooks/use-translations';

/**
 * Keeps `<html lang>` and `<html dir>` in step with the active locale.
 *
 * Blade sets both on the initial page load, but switching language inside the
 * dashboard is an Inertia visit: React re-renders with the new dictionary
 * while the document element keeps whatever direction it was served with. This
 * syncs it, so the layout flips without needing a full reload.
 */
export function useDocumentLocale(): void {
    const { locale, direction } = useTranslations();

    useEffect(() => {
        const root = document.documentElement;

        if (root.lang !== locale) {
            root.lang = locale;
        }

        if (root.dir !== direction) {
            root.dir = direction;
        }
    }, [direction, locale]);
}
