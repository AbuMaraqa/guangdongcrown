import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { Counter, Reveal, Stagger } from '@/animation';
import { Link } from '@/components/site/link';
import {
    Container,
    SectionHeading,
    SiteLink,
} from '@/components/site/primitives';
import { cn } from '@/lib/utils';
import type { Credential, FaqItem, SiteLocation, Stat } from '@/types/site';

/**
 * Credibility band. Renders nothing when the company has not yet published
 * any figures, rather than showing invented placeholders.
 */
export function StatBand({
    stats,
    className,
}: {
    stats: Stat[];
    className?: string;
}) {
    if (stats.length === 0) {
        return null;
    }

    return (
        <div className={cn('border-y border-[var(--site-line)]', className)}>
            <Container>
                <Stagger
                    className="grid divide-y divide-[var(--site-line)] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4"
                    y={20}
                >
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="px-0 py-10 sm:px-8 sm:py-14 sm:not-first:border-s sm:not-first:border-[var(--site-line)] sm:first:ps-0"
                        >
                            <p className="site-display text-4xl lg:text-5xl">
                                <Counter value={stat.value} />
                            </p>
                            <p className="mt-4 font-display text-sm font-semibold">
                                {stat.label}
                            </p>
                            {stat.caption && (
                                <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--site-muted)]">
                                    {stat.caption}
                                </p>
                            )}
                        </div>
                    ))}
                </Stagger>
            </Container>
        </div>
    );
}

export function FaqAccordion({
    items,
    className,
}: {
    items: FaqItem[];
    className?: string;
}) {
    if (items.length === 0) {
        return null;
    }

    return (
        <Accordion.Root
            type="single"
            collapsible
            className={cn('border-t border-[var(--site-line)]', className)}
        >
            {items.map((item) => (
                <Accordion.Item
                    key={item.id}
                    value={String(item.id)}
                    className="border-b border-[var(--site-line)]"
                >
                    <Accordion.Header>
                        <Accordion.Trigger className="group flex w-full items-start justify-between gap-6 py-6 text-start transition-colors hover:text-[var(--site-accent)]">
                            <span className="font-display text-lg leading-snug font-medium">
                                {item.question}
                            </span>
                            <ChevronDown
                                aria-hidden="true"
                                className="mt-1 size-5 shrink-0 text-[var(--site-muted)] transition-transform duration-300 group-data-[state=open]:rotate-180"
                            />
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <p className="max-w-3xl pb-7 text-[1.0625rem] leading-relaxed text-pretty text-[var(--site-muted)]">
                            {item.answer}
                        </p>
                    </Accordion.Content>
                </Accordion.Item>
            ))}
        </Accordion.Root>
    );
}

/**
 * Certifications and awards, shown only when the company has published them.
 * Each entry carries its issuing body so the claim is verifiable.
 */
export function CredentialStrip({
    credentials,
}: {
    credentials: Credential[];
}) {
    if (credentials.length === 0) {
        return null;
    }

    return (
        <Stagger className="grid gap-px border border-[var(--site-line)] bg-[var(--site-line)] sm:grid-cols-2 lg:grid-cols-4">
            {credentials.map((credential) => (
                <div
                    key={credential.id}
                    className="flex flex-col gap-4 bg-[var(--site-surface)] p-7"
                >
                    {credential.image ? (
                        <img
                            src={credential.image.thumb}
                            alt={credential.image.alt || credential.name}
                            loading="lazy"
                            className="h-12 w-auto self-start object-contain"
                        />
                    ) : (
                        <span className="site-eyebrow">{credential.type}</span>
                    )}
                    <div>
                        <p className="font-display text-base leading-snug font-semibold">
                            {credential.name}
                        </p>
                        {credential.issuer && (
                            <p className="mt-1.5 text-[0.8125rem] text-[var(--site-muted)]">
                                {credential.issuer}
                                {credential.year ? ` · ${credential.year}` : ''}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </Stagger>
    );
}

/**
 * Coverage panel driven entirely by the locations recorded in the CMS.
 *
 * Facilities with coordinates are plotted on an equirectangular grid; the
 * same data is always available as a readable list beneath it, so the map is
 * decorative rather than load-bearing for accessibility.
 */
export function CoverageMap({ locations }: { locations: SiteLocation[] }) {
    const plotted = locations.filter(
        (location) => location.latitude !== null && location.longitude !== null,
    );

    if (locations.length === 0) {
        return null;
    }

    return (
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
            {plotted.length > 0 && (
                <Reveal className="relative aspect-[2/1] w-full border border-[var(--site-line)] bg-[var(--site-surface)]">
                    <svg
                        viewBox="0 0 360 180"
                        role="img"
                        aria-label={`Map showing ${plotted.length} locations`}
                        className="h-full w-full"
                    >
                        <defs>
                            <pattern
                                id="coverage-grid"
                                width="15"
                                height="15"
                                patternUnits="userSpaceOnUse"
                            >
                                <path
                                    d="M 15 0 L 0 0 0 15"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="0.3"
                                    className="text-[var(--site-line)]"
                                />
                            </pattern>
                        </defs>
                        <rect
                            width="360"
                            height="180"
                            fill="url(#coverage-grid)"
                        />
                        <line
                            x1="0"
                            y1="90"
                            x2="360"
                            y2="90"
                            stroke="currentColor"
                            strokeWidth="0.4"
                            className="text-[var(--site-line)]"
                        />
                        <line
                            x1="180"
                            y1="0"
                            x2="180"
                            y2="180"
                            stroke="currentColor"
                            strokeWidth="0.4"
                            className="text-[var(--site-line)]"
                        />

                        {plotted.map((location) => {
                            const x =
                                ((location.longitude as number) + 180) / 2;
                            const y = (90 - (location.latitude as number)) / 1;

                            return (
                                <g key={`${location.name}-${x}-${y}`}>
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={location.isHeadquarters ? 6 : 4}
                                        className="fill-[var(--site-accent)] opacity-20"
                                    >
                                        <animate
                                            attributeName="r"
                                            values={`${location.isHeadquarters ? 6 : 4};${location.isHeadquarters ? 11 : 8};${location.isHeadquarters ? 6 : 4}`}
                                            dur="3s"
                                            repeatCount="indefinite"
                                        />
                                    </circle>
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={location.isHeadquarters ? 2.6 : 1.8}
                                        className="fill-[var(--site-accent)]"
                                    />
                                </g>
                            );
                        })}
                    </svg>
                </Reveal>
            )}

            <div>
                <Stagger
                    className="divide-y divide-[var(--site-line)] border-y border-[var(--site-line)]"
                    y={16}
                >
                    {locations.map((location) => (
                        <div
                            key={location.name}
                            className="flex items-start justify-between gap-6 py-5"
                        >
                            <div>
                                <p className="font-display text-base font-semibold">
                                    {location.name}
                                </p>
                                <p className="mt-1 text-sm text-[var(--site-muted)]">
                                    {[location.city, location.country]
                                        .filter(Boolean)
                                        .join(', ')}
                                </p>
                            </div>
                            <span className="site-eyebrow shrink-0 pt-1">
                                {location.isHeadquarters ? 'HQ' : location.type}
                            </span>
                        </div>
                    ))}
                </Stagger>
            </div>
        </div>
    );
}

export function EmptyState({
    title,
    description,
    action,
    icon: Icon = Inbox,
    className,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
    icon?: typeof Inbox;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center border border-dashed border-[var(--site-line)] px-8 py-20 text-center',
                className,
            )}
        >
            <Icon
                aria-hidden="true"
                className="size-8 text-[var(--site-muted)]"
            />
            <p className="mt-5 font-display text-lg font-semibold">{title}</p>
            {description && (
                <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--site-muted)]">
                    {description}
                </p>
            )}
            {action && <div className="mt-7">{action}</div>}
        </div>
    );
}

/**
 * Closing conversion band used at the foot of interior pages.
 */
export function CtaBand({
    eyebrow,
    title,
    body,
    primary,
    secondary,
}: {
    eyebrow?: string;
    title: string;
    body?: string;
    primary?: { label: string; href: string };
    secondary?: { label: string; href: string };
}) {
    return (
        <section className="site-invert">
            <Container>
                <Reveal className="flex flex-col gap-8 py-20 lg:flex-row lg:items-end lg:justify-between lg:py-24">
                    <div className="max-w-2xl">
                        {eyebrow && (
                            <p className="site-eyebrow mb-4">{eyebrow}</p>
                        )}
                        <h2 className="site-display text-3xl sm:text-4xl">
                            {title}
                        </h2>
                        {body && (
                            <p className="mt-5 leading-relaxed text-pretty text-[var(--site-muted)]">
                                {body}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {primary && (
                            <SiteLink href={primary.href} magnetic>
                                {primary.label}
                            </SiteLink>
                        )}
                        {secondary && (
                            <SiteLink
                                href={secondary.href}
                                tone="outline"
                                withArrow={false}
                            >
                                {secondary.label}
                            </SiteLink>
                        )}
                    </div>
                </Reveal>
            </Container>
        </section>
    );
}

/**
 * "More like this" rail shared by every detail page.
 */
export function RelatedGrid({
    title,
    action,
    children,
}: {
    title: string;
    action?: { label: string; href: string };
    children: ReactNode;
}) {
    return (
        <Container>
            <SectionHeading
                title={title}
                action={
                    action && (
                        <Link
                            href={action.href}
                            className="font-display text-[0.8125rem] font-semibold tracking-[0.08em] uppercase transition-colors hover:text-[var(--site-accent)]"
                        >
                            {action.label}
                        </Link>
                    )
                }
            />
            <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {children}
            </Stagger>
        </Container>
    );
}
