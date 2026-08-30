/**
 * Paths that exist once, outside the localized site.
 *
 * Mirrors the exclusions on the server's page catch-all: the dashboard has a
 * single interface language of its own, and uploads and build assets are
 * files, not pages. Prefixing any of these would 404.
 */
const UNLOCALIZED = new Set([
    'admin',
    'settings',
    'login',
    'logout',
    'register',
    'storage',
    'build',
    'sitemap.xml',
    'robots.txt',
]);

/**
 * Prefixes an app-internal path with the language currently being read.
 *
 * The default language is served from clean URLs (/catalogue) and every other
 * language from a prefix (/ar/catalogue). Links written in the pages use the
 * clean form, so without this every click from an Arabic page would land back
 * on the English site.
 *
 * Only app-internal, root-relative page paths are touched. Absolute URLs,
 * mailto:, tel:, anchors, uploads, and paths that already carry a locale
 * prefix come back unchanged — which also makes this safe to apply twice.
 */
export function localizePath(
    href: string,
    locale: string,
    defaultLocale: string,
    codes: string[],
): string {
    // Anything that is not a root-relative path belongs somewhere else:
    // another origin, the mail client, the dialler, or the current page.
    if (!href.startsWith('/') || href.startsWith('//')) {
        return href;
    }

    if (locale === defaultLocale) {
        return href;
    }

    const [first] = href.slice(1).split(/[/?#]/, 1);

    // Already localized, or not part of the localized site at all.
    if (codes.includes(first) || UNLOCALIZED.has(first)) {
        return href;
    }

    return href === '/' ? `/${locale}` : `/${locale}${href}`;
}
