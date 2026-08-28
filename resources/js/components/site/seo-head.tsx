import { Head } from '@inertiajs/react';
import type { SeoPayload } from '@/types/site';

/**
 * Keeps the document title in step during client-side navigation.
 *
 * The rest of the meta block — description, canonical, robots, OpenGraph,
 * Twitter cards and schema.org JSON-LD — is rendered server side in
 * `resources/views/partials/seo.blade.php`, because crawlers and social
 * scrapers always request a URL as a fresh document. Emitting those tags here
 * as well would duplicate every one of them on first load.
 */
export function SeoHead({ seo }: { seo: SeoPayload }) {
    return (
        <Head>
            <title>{seo.title}</title>
        </Head>
    );
}
