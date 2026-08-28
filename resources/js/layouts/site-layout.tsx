import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
// Imported from the leaf modules rather than the barrel so the layout does
// not drag the whole animation component set into the app entry chunk.
import { ScrollTrigger } from '@/animation/gsap';
import { useSmoothScroll } from '@/animation/use-smooth-scroll';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import type { SiteChrome } from '@/types/site';

const EMPTY_CHROME: SiteChrome = {
    company: {
        name: 'Guang Dong Crown',
        legalName: null,
        tagline: null,
        description: null,
        email: null,
        phone: null,
        whatsapp: null,
        address: null,
        logo: null,
        logoInverse: null,
        founded: null,
    },
    social: {},
    footer: {},
    navigation: { productCategories: [], services: [], solutions: [] },
    legalPages: [],
    headquarters: null,
};

/**
 * Chrome for every public page: fixed header, smooth scroll, brand palette
 * and footer. Pages whose first section is a dark hero opt into an overlaid
 * transparent header via `data-overlay-header`.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
    const page = usePage();
    const chrome = (page.props.site as SiteChrome | null) ?? EMPTY_CHROME;
    const flash = page.props.flash as
        { success: string | null; error: string | null } | undefined;
    const accent = chrome.footer.accent;

    // The home page is the only route with a full-bleed dark hero behind
    // the header; everywhere else the header sits on the page background.
    const overlay = page.component === 'site/home';

    useSmoothScroll();

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash?.error, flash?.success]);

    // Content height changes between Inertia visits; ScrollTrigger needs to
    // recompute its start/end positions once the new page has painted.
    useEffect(() => {
        const frame = requestAnimationFrame(() => ScrollTrigger.refresh());

        return () => cancelAnimationFrame(frame);
    }, [page.component, page.url]);

    return (
        <div
            className="site-root flex min-h-dvh flex-col"
            style={
                accent
                    ? ({ '--brand-accent': accent } as React.CSSProperties)
                    : undefined
            }
        >
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[60] focus:rounded-sm focus:bg-[var(--site-accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
            >
                Skip to content
            </a>

            <SiteHeader chrome={chrome} overlay={overlay} />

            <main
                id="main"
                className={overlay ? 'flex-1' : 'flex-1 pt-18 lg:pt-20'}
            >
                {children}
            </main>

            <SiteFooter chrome={chrome} />
        </div>
    );
}
