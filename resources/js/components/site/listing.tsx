import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useSyncedState } from '@/hooks/use-synced-state';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types/site';

/**
 * Shared listing chrome: search + facet filters that update the URL, and a
 * numbered pager. Both preserve scroll so filtering never jumps the page.
 */

type Facet = { name: string; slug: string; count?: number };

export function FilterBar({
    basePath,
    search,
    facets,
    activeFacet,
    facetKey = 'category',
    searchPlaceholder = 'Search',
    className,
}: {
    basePath: string;
    search: string;
    facets: Facet[];
    activeFacet: string;
    facetKey?: string;
    searchPlaceholder?: string;
    className?: string;
}) {
    const [term, setTerm] = useSyncedState(search);

    const visit = (params: Record<string, string>) => {
        const query: Record<string, string> = {
            search: term,
            [facetKey]: activeFacet,
            ...params,
        };

        router.get(
            basePath,
            Object.fromEntries(
                Object.entries(query).filter(([, v]) => v !== ''),
            ),
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <div
            className={cn(
                'flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between',
                className,
            )}
        >
            <div className="-mx-1 flex flex-wrap gap-1 overflow-x-auto">
                <FacetButton
                    active={activeFacet === ''}
                    onClick={() => visit({ [facetKey]: '' })}
                >
                    All
                </FacetButton>
                {facets.map((facet) => (
                    <FacetButton
                        key={facet.slug}
                        active={activeFacet === facet.slug}
                        onClick={() => visit({ [facetKey]: facet.slug })}
                    >
                        {facet.name}
                        {typeof facet.count === 'number' && (
                            <span className="ms-1.5 font-mono text-[0.6875rem] opacity-60">
                                {facet.count}
                            </span>
                        )}
                    </FacetButton>
                ))}
            </div>

            <form
                className="relative w-full lg:w-72"
                onSubmit={(event) => {
                    event.preventDefault();
                    visit({});
                }}
            >
                <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 start-3.5 size-4 -translate-y-1/2 text-[var(--site-muted)]"
                />
                <input
                    type="search"
                    value={term}
                    onChange={(event) => setTerm(event.target.value)}
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder}
                    className="h-11 w-full border border-[var(--site-line)] bg-[var(--site-surface)] pe-10 ps-10 text-sm transition-colors outline-none placeholder:text-[var(--site-muted)] focus:border-[var(--site-accent)]"
                />
                {term && (
                    <button
                        type="button"
                        onClick={() => {
                            setTerm('');
                            router.get(
                                basePath,
                                activeFacet ? { [facetKey]: activeFacet } : {},
                                {
                                    preserveScroll: true,
                                    preserveState: true,
                                    replace: true,
                                },
                            );
                        }}
                        className="absolute top-1/2 end-3 -translate-y-1/2 text-[var(--site-muted)] transition-colors hover:text-[var(--site-fg)]"
                    >
                        <span className="sr-only">Clear search</span>
                        <X className="size-4" />
                    </button>
                )}
            </form>
        </div>
    );
}

function FacetButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                'shrink-0 rounded-sm px-4 py-2.5 font-display text-[0.8125rem] font-medium whitespace-nowrap transition-colors',
                active
                    ? 'bg-[var(--site-fg)] text-[var(--site-bg)]'
                    : 'text-[var(--site-muted)] hover:bg-[var(--color-graphite-100)] hover:text-[var(--site-fg)]',
            )}
        >
            {children}
        </button>
    );
}

export function Pagination<T>({
    page,
    className,
}: {
    page: Paginated<T>;
    className?: string;
}) {
    if (page.last_page <= 1) {
        return null;
    }

    const go = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveScroll: false, preserveState: true });
        }
    };

    const numbered = page.links.slice(1, -1);
    const previous = page.links[0];
    const next = page.links[page.links.length - 1];

    return (
        <nav
            aria-label="Pagination"
            className={cn(
                'flex items-center justify-between gap-4 border-t border-[var(--site-line)] pt-8',
                className,
            )}
        >
            <p className="text-[0.8125rem] text-[var(--site-muted)]">
                {page.from}–{page.to} of {page.total}
            </p>

            <div className="flex items-center gap-1">
                <PagerButton
                    disabled={!previous.url}
                    onClick={() => go(previous.url)}
                    label="Previous page"
                >
                    <ChevronLeft className="size-4" />
                </PagerButton>

                <ul className="hidden items-center gap-1 sm:flex">
                    {numbered.map((link, index) => (
                        <li key={`${link.label}-${index}`}>
                            <button
                                type="button"
                                onClick={() => go(link.url)}
                                aria-current={link.active ? 'page' : undefined}
                                disabled={!link.url}
                                className={cn(
                                    'size-10 font-mono text-[0.8125rem] transition-colors',
                                    link.active
                                        ? 'bg-[var(--site-fg)] text-[var(--site-bg)]'
                                        : 'text-[var(--site-muted)] hover:text-[var(--site-fg)] disabled:opacity-40',
                                )}
                            >
                                {link.label}
                            </button>
                        </li>
                    ))}
                </ul>

                <PagerButton
                    disabled={!next.url}
                    onClick={() => go(next.url)}
                    label="Next page"
                >
                    <ChevronRight className="size-4" />
                </PagerButton>
            </div>
        </nav>
    );
}

function PagerButton({
    disabled,
    onClick,
    label,
    children,
}: {
    disabled: boolean;
    onClick: () => void;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="inline-flex size-10 items-center justify-center border border-[var(--site-line)] text-[var(--site-fg)] transition-colors hover:border-[var(--site-accent)] hover:text-[var(--site-accent)] disabled:pointer-events-none disabled:opacity-40"
        >
            <span className="sr-only">{label}</span>
            {children}
        </button>
    );
}

/**
 * Renders CMS rich text. The editor stores sanitised HTML, so this is the
 * single controlled place where it is injected into the document.
 */
export function Prose({
    html,
    className,
}: {
    html: string | null;
    className?: string;
}) {
    if (!html) {
        return null;
    }

    return (
        <div
            className={cn('site-prose', className)}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
