import { MapPinned } from 'lucide-react';
import { Stagger } from '@/animation';
import { PageHeader } from '@/components/site/page-header';
import { Container, Eyebrow, Section } from '@/components/site/primitives';
import { CoverageMap, CtaBand, EmptyState } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import type { Crumb, SeoPayload, SiteLocation } from '@/types/site';

type Props = {
    seo: SeoPayload;
    locations: SiteLocation[];
    breadcrumbs: Crumb[];
};

const TYPE_LABELS: Record<string, string> = {
    office: 'Offices',
    facility: 'Facilities',
    warehouse: 'Warehousing',
    market: 'Served markets',
};

export default function GlobalPresence({ seo, locations, breadcrumbs }: Props) {
    const countries = [
        ...new Set(locations.map((location) => location.country)),
    ];
    const grouped = Object.entries(
        locations.reduce<Record<string, SiteLocation[]>>(
            (accumulator, location) => {
                (accumulator[location.type] ??= []).push(location);

                return accumulator;
            },
            {},
        ),
    );

    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                eyebrow="Global presence"
                title={
                    countries.length > 0
                        ? `Present in ${countries.length} ${countries.length === 1 ? 'country' : 'countries'}`
                        : 'Where we operate'
                }
                lead="Offices, facilities and the markets we ship into. Everything listed here is a location we actually operate in or serve."
                breadcrumbs={breadcrumbs}
            />

            <Section>
                <Container>
                    {locations.length > 0 ? (
                        <>
                            <CoverageMap locations={locations} />

                            <div className="mt-20 space-y-16">
                                {grouped.map(([type, items]) => (
                                    <div key={type}>
                                        <Eyebrow className="mb-8">
                                            {TYPE_LABELS[type] ?? type}
                                        </Eyebrow>
                                        <Stagger className="grid gap-px bg-[var(--site-line)] sm:grid-cols-2 lg:grid-cols-3">
                                            {items.map((location) => (
                                                <div
                                                    key={location.name}
                                                    className="bg-[var(--site-surface)] p-7"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <p className="font-display text-lg font-semibold">
                                                            {location.name}
                                                        </p>
                                                        {location.isHeadquarters && (
                                                            <span className="site-eyebrow shrink-0">
                                                                HQ
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-1.5 text-sm text-[var(--site-muted)]">
                                                        {[
                                                            location.city,
                                                            location.country,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(', ')}
                                                    </p>
                                                    {location.address && (
                                                        <p className="mt-4 text-sm leading-relaxed text-[var(--site-muted)]">
                                                            {location.address}
                                                        </p>
                                                    )}
                                                    <div className="mt-5 space-y-1.5 text-sm">
                                                        {location.phone && (
                                                            <a
                                                                href={`tel:${location.phone.replace(/\s+/g, '')}`}
                                                                className="block transition-colors hover:text-[var(--site-accent)]"
                                                            >
                                                                {location.phone}
                                                            </a>
                                                        )}
                                                        {location.email && (
                                                            <a
                                                                href={`mailto:${location.email}`}
                                                                className="block transition-colors hover:text-[var(--site-accent)]"
                                                            >
                                                                {location.email}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </Stagger>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <EmptyState
                            icon={MapPinned}
                            title="Locations are being published"
                            description="Offices, facilities and served markets are managed from the dashboard and will appear here once added."
                        />
                    )}
                </Container>
            </Section>

            <CtaBand
                title="Shipping somewhere not listed?"
                body="Ask us. Coverage extends further than the locations we maintain a permanent presence in."
                primary={{ label: 'Contact us', href: '/contact' }}
            />
        </>
    );
}
