import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Reveal, TextReveal } from '@/animation';
import { Link } from '@/components/site/link';
import { Container, Eyebrow } from '@/components/site/primitives';
import { cn } from '@/lib/utils';
import type { Crumb } from '@/types/site';

export function Breadcrumbs({
    items,
    className,
}: {
    items: Crumb[];
    className?: string;
}) {
    if (items.length <= 1) {
        return null;
    }

    return (
        <nav aria-label="Breadcrumb" className={className}>
            <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-[var(--site-muted)]">
                {items.map((item, index) => {
                    const last = index === items.length - 1;

                    return (
                        <li
                            key={item.url}
                            className="flex items-center gap-1.5"
                        >
                            {index > 0 && (
                                <ChevronRight
                                    aria-hidden="true"
                                    className="size-3.5 opacity-50"
                                />
                            )}
                            {last ? (
                                <span
                                    aria-current="page"
                                    className="text-[var(--site-fg)]"
                                >
                                    {item.name}
                                </span>
                            ) : (
                                <Link
                                    href={item.url}
                                    className="transition-colors hover:text-[var(--site-fg)]"
                                >
                                    {item.name}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

/**
 * Standard interior page masthead: breadcrumb trail, eyebrow, animated
 * headline and an optional lead paragraph or aside.
 */
export function PageHeader({
    eyebrow,
    title,
    lead,
    breadcrumbs,
    aside,
    invert = false,
    className,
}: {
    eyebrow?: string | null;
    title: string;
    lead?: string | null;
    breadcrumbs?: Crumb[];
    aside?: ReactNode;
    invert?: boolean;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'border-b border-[var(--site-line)]',
                invert && 'site-invert',
                className,
            )}
        >
            <Container>
                <div className="py-14 lg:py-20">
                    {breadcrumbs && (
                        <Breadcrumbs items={breadcrumbs} className="mb-10" />
                    )}

                    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-16">
                        <div>
                            {eyebrow && (
                                <Eyebrow className="mb-5">{eyebrow}</Eyebrow>
                            )}
                            <TextReveal
                                as="h1"
                                text={title}
                                immediate
                                className="site-display text-4xl sm:text-5xl lg:text-6xl"
                            />
                        </div>

                        {(lead || aside) && (
                            <Reveal delay={0.25} immediate className="lg:pb-2">
                                {lead && (
                                    <p className="text-[1.0625rem] leading-relaxed text-pretty text-[var(--site-muted)]">
                                        {lead}
                                    </p>
                                )}
                                {aside}
                            </Reveal>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}
