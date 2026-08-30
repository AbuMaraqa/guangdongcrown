import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Download,
    Loader2,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Stagger } from '@/animation';
import { FilterBar } from '@/components/site/listing';
import { PageHeader } from '@/components/site/page-header';
import { Container, Section, SiteLink } from '@/components/site/primitives';
import { CtaBand, EmptyState } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import { useLocalePath } from '@/hooks/use-locale-path';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import type { Crumb, MediaImage, SeoPayload } from '@/types/site';

type CatalogueCard = {
    id: number;
    name: string;
    slug: string;
    code: string | null;
    excerpt: string | null;
    year: number | null;
    fileUrl: string | null;
    cover: MediaImage | null;
    category: string | null;
};

type CatalogueDetail = {
    id: number;
    name: string;
    code: string | null;
    excerpt: string | null;
    fileUrl: string | null;
    cover: MediaImage | null;
    pages: MediaImage[];
};

type Props = {
    seo: SeoPayload;
    catalogues: CatalogueCard[];
    categories: { name: string; slug: string }[];
    filters: { search: string; category: string };
    breadcrumbs: Crumb[];
};

export default function CatalogueIndex({
    seo,
    catalogues,
    categories,
    filters,
    breadcrumbs,
}: Props) {
    const { t } = useTranslations();
    const [open, setOpen] = useState<CatalogueCard | null>(null);
    const filtering = Boolean(filters.search || filters.category);

    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                eyebrow={t('Catalogue')}
                title={t('Every profile, drawn to scale')}
                lead={t(
                    'Browse the system drawings and specification sheets page by page, or download the print edition.',
                )}
                breadcrumbs={breadcrumbs}
            />

            <Section spacing="tight">
                <Container>
                    {categories.length > 0 && (
                        <FilterBar
                            basePath="/catalogue"
                            search={filters.search}
                            activeFacet={filters.category}
                            facets={categories}
                            searchPlaceholder={t('Search catalogues')}
                        />
                    )}

                    {catalogues.length > 0 ? (
                        <Stagger
                            className="mt-12 grid gap-px bg-[var(--site-line)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            y={20}
                        >
                            {catalogues.map((catalogue) => (
                                <button
                                    key={catalogue.id}
                                    type="button"
                                    onClick={() => setOpen(catalogue)}
                                    className="group relative flex flex-col bg-[var(--site-surface)] p-6 text-start transition-colors hover:bg-[var(--color-graphite-50)]"
                                >
                                    <span className="relative mb-5 block aspect-[3/4] overflow-hidden bg-[var(--color-graphite-100)]">
                                        {catalogue.cover ? (
                                            <img
                                                src={catalogue.cover.medium}
                                                alt=""
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                                            />
                                        ) : (
                                            <span className="flex h-full w-full items-center justify-center">
                                                <BookOpen className="size-7 text-[var(--color-graphite-400)]" />
                                            </span>
                                        )}
                                    </span>

                                    {catalogue.code && (
                                        <span className="site-eyebrow force-ltr mb-2">
                                            {catalogue.code}
                                        </span>
                                    )}

                                    <span className="font-display text-base leading-snug font-semibold">
                                        {catalogue.name}
                                    </span>

                                    {catalogue.excerpt && (
                                        <span className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--site-muted)]">
                                            {catalogue.excerpt}
                                        </span>
                                    )}

                                    <span className="mt-auto flex items-center gap-2 pt-5 font-display text-[0.8125rem] font-semibold tracking-[0.08em] text-[var(--site-accent)] uppercase">
                                        {t('Open catalogue')}
                                        <BookOpen className="size-4" />
                                    </span>
                                </button>
                            ))}
                        </Stagger>
                    ) : (
                        <EmptyState
                            className="mt-12"
                            icon={BookOpen}
                            title={
                                filtering
                                    ? t('No catalogues match those filters')
                                    : t('Catalogues are being prepared')
                            }
                            description={t(
                                'Published catalogues appear here. Ask us directly for a specific system drawing in the meantime.',
                            )}
                            action={
                                <SiteLink href="/contact" tone="outline">
                                    {t('Ask for a drawing')}
                                </SiteLink>
                            }
                        />
                    )}
                </Container>
            </Section>

            <CtaBand
                title={t('Need a system that is not in the catalogue?')}
                body={t(
                    'Send us the opening size, the load case and the finish. We will tell you what fits.',
                )}
                primary={{
                    label: t('Request a quotation'),
                    href: '/request-a-quotation',
                }}
            />

            <CatalogueViewer catalogue={open} onClose={() => setOpen(null)} />
        </>
    );
}

/**
 * Full-screen catalogue reader.
 *
 * Pages are fetched only when a catalogue is opened, so the index stays light
 * no matter how many pages the library runs to. On desktop it reads as a
 * two-page spread; below `md` it falls back to one page at a time, which is
 * the only legible option on a phone.
 */
function CatalogueViewer({
    catalogue,
    onClose,
}: {
    catalogue: CatalogueCard | null;
    onClose: () => void;
}) {
    const { t, rtl } = useTranslations();
    const localize = useLocalePath();
    const [detail, setDetail] = useState<CatalogueDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [spread, setSpread] = useState(0);
    const [single, setSingle] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(max-width: 767px)');
        const update = () => setSingle(query.matches);

        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    // Opening a different catalogue resets the reader. Done during render
    // rather than in the fetch effect, which would schedule an extra commit.
    const [loadedFor, setLoadedFor] = useState<number | null>(null);

    if (catalogue && loadedFor !== catalogue.id) {
        setLoadedFor(catalogue.id);
        setDetail(null);
        setError(false);
        setLoading(true);
        setSpread(0);
    }

    useEffect(() => {
        if (!catalogue) {
            return;
        }

        let cancelled = false;

        fetch(localize(`/catalogue/${catalogue.slug}/pages`), {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        })
            .then((response) =>
                response.ok
                    ? response.json()
                    : Promise.reject(new Error('failed')),
            )
            .then((payload: CatalogueDetail) => {
                if (!cancelled) {
                    setDetail(payload);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError(true);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [catalogue, localize]);

    useEffect(() => {
        document.body.style.overflow = catalogue ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [catalogue]);

    const pages = detail?.pages ?? [];
    const perSpread = single ? 1 : 2;
    const spreadCount = Math.max(1, Math.ceil(pages.length / perSpread));

    const go = useCallback(
        (direction: number) =>
            setSpread((current) =>
                Math.min(spreadCount - 1, Math.max(0, current + direction)),
            ),
        [spreadCount],
    );

    useEffect(() => {
        if (!catalogue) {
            return;
        }

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }

            // Arrow keys follow reading order, so they reverse in Arabic.
            if (event.key === 'ArrowRight') {
                go(rtl ? -1 : 1);
            }

            if (event.key === 'ArrowLeft') {
                go(rtl ? 1 : -1);
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [catalogue, go, onClose, rtl]);

    if (!catalogue) {
        return null;
    }

    const visible = pages.slice(
        spread * perSpread,
        spread * perSpread + perSpread,
    );

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={catalogue.name}
            className="fixed inset-0 z-[60] flex flex-col bg-[var(--color-graphite-950)]/95 backdrop-blur-sm"
        >
            <header className="site-invert flex items-center justify-between gap-4 border-b border-[var(--site-line)] px-5 py-4">
                <div className="min-w-0">
                    <p className="truncate font-display text-base font-semibold text-[var(--site-fg)]">
                        {catalogue.name}
                    </p>
                    {catalogue.code && (
                        <p className="force-ltr text-xs text-[var(--site-muted)]">
                            {catalogue.code}
                        </p>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {detail?.fileUrl && (
                        <a
                            href={detail.fileUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-2 rounded-sm border border-[var(--site-line)] px-4 py-2 text-sm text-[var(--site-fg)] transition-colors hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]"
                        >
                            <Download className="size-4" />
                            <span className="hidden sm:inline">
                                {t('Download PDF')}
                            </span>
                        </a>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex size-10 items-center justify-center rounded-sm border border-[var(--site-line)] text-[var(--site-fg)] transition-colors hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]"
                    >
                        <span className="sr-only">{t('Close')}</span>
                        <X className="size-5" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 items-center justify-center overflow-hidden p-4 sm:p-8">
                {loading && (
                    <Loader2 className="size-8 animate-spin text-white/70" />
                )}

                {error && (
                    <p
                        role="alert"
                        className="max-w-sm text-center text-sm text-white/80"
                    >
                        {t(
                            'This catalogue could not be loaded. Please try again.',
                        )}
                    </p>
                )}

                {!loading && !error && pages.length === 0 && (
                    <p className="max-w-sm text-center text-sm text-white/80">
                        {t('No pages have been added to this catalogue yet.')}
                    </p>
                )}

                {visible.length > 0 && (
                    <div
                        className={cn(
                            'flex h-full w-full max-w-6xl items-center justify-center gap-3',
                            rtl && 'flex-row-reverse',
                        )}
                    >
                        {visible.map((page) => (
                            <img
                                key={page.id}
                                src={page.medium}
                                alt={page.alt || t('Catalogue page')}
                                className="h-full max-h-full w-auto max-w-[48%] rounded-sm bg-white object-contain shadow-[0_24px_60px_-20px_rgb(0_0_0/0.6)] md:max-w-[48%]"
                            />
                        ))}
                    </div>
                )}
            </div>

            {pages.length > 0 && (
                <footer className="site-invert flex items-center justify-center gap-6 border-t border-[var(--site-line)] px-5 py-4">
                    <button
                        type="button"
                        onClick={() => go(-1)}
                        disabled={spread === 0}
                        className="inline-flex size-11 items-center justify-center rounded-sm border border-[var(--site-line)] text-[var(--site-fg)] transition-colors hover:border-[var(--site-accent)] disabled:pointer-events-none disabled:opacity-35"
                    >
                        <span className="sr-only">{t('Previous page')}</span>
                        <ChevronLeft className="rtl-flip size-5" />
                    </button>

                    <p className="font-mono text-sm text-[var(--site-muted)] tabular-nums">
                        {spread + 1} / {spreadCount}
                    </p>

                    <button
                        type="button"
                        onClick={() => go(1)}
                        disabled={spread >= spreadCount - 1}
                        className="inline-flex size-11 items-center justify-center rounded-sm border border-[var(--site-line)] text-[var(--site-fg)] transition-colors hover:border-[var(--site-accent)] disabled:pointer-events-none disabled:opacity-35"
                    >
                        <span className="sr-only">{t('Next page')}</span>
                        <ChevronRight className="rtl-flip size-5" />
                    </button>
                </footer>
            )}
        </div>
    );
}
