import { ArrowUpRight, PackageSearch } from 'lucide-react';
import { Stagger } from '@/animation';
import { HangingContainers } from '@/components/site/hanging-containers';
import { Link } from '@/components/site/link';
import { PageHeader } from '@/components/site/page-header';
import {
    Container,
    Section,
    SectionHeading,
    SiteLink,
    TextArrowLink,
} from '@/components/site/primitives';
import { CtaBand, EmptyState } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import { useTranslations } from '@/hooks/use-translations';
import type { Crumb, MediaImage, SeoPayload } from '@/types/site';

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    count: number;
    image: MediaImage | null;
    children: { name: string; slug: string }[];
};

type FeaturedProduct = {
    id: number;
    name: string;
    slug: string;
    excerpt: string | null;
    image: MediaImage | null;
};

type Props = {
    seo: SeoPayload;
    categories: Category[];
    featured: FeaturedProduct[];
    breadcrumbs: Crumb[];
};

export default function OurProducts({
    seo,
    categories,
    featured,
    breadcrumbs,
}: Props) {
    const { t } = useTranslations();

    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                eyebrow={t('Our products')}
                title={t('Aluminium systems, grouped by what they have to do')}
                lead={t(
                    'Every family below is supplied to specification and shipped by the same team that made it.',
                )}
                breadcrumbs={breadcrumbs}
            />

            <Section spacing="tight">
                <Container>
                    {categories.length > 0 ? (
                        <Stagger
                            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                            y={22}
                        >
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/products?category=${category.slug}`}
                                    className="group flex h-full flex-col border border-[var(--site-line)] bg-[var(--site-surface)] transition-colors duration-500 hover:border-[var(--site-accent)]"
                                >
                                    <span className="relative block aspect-[16/10] overflow-hidden bg-[var(--color-graphite-100)]">
                                        {category.image ? (
                                            <img
                                                src={category.image.medium}
                                                alt={
                                                    category.image.alt ||
                                                    category.name
                                                }
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                                            />
                                        ) : (
                                            <span className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,var(--color-graphite-100),var(--color-graphite-200))]">
                                                <PackageSearch className="size-7 text-[var(--color-graphite-400)]" />
                                            </span>
                                        )}
                                    </span>

                                    <span className="flex flex-1 flex-col p-6">
                                        <span className="flex items-start justify-between gap-3">
                                            <span className="font-display text-lg leading-snug font-semibold">
                                                {category.name}
                                            </span>
                                            <ArrowUpRight
                                                aria-hidden="true"
                                                className="rtl-flip mt-1 size-4 shrink-0 text-[var(--site-muted)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-[var(--site-accent)]"
                                            />
                                        </span>

                                        {category.description && (
                                            <span className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--site-muted)]">
                                                {category.description}
                                            </span>
                                        )}

                                        {category.children.length > 0 && (
                                            <span className="mt-4 flex flex-wrap gap-1.5">
                                                {category.children
                                                    .slice(0, 4)
                                                    .map((child) => (
                                                        <span
                                                            key={child.slug}
                                                            className="border border-[var(--site-line)] px-2.5 py-1 text-[0.75rem] text-[var(--site-muted)]"
                                                        >
                                                            {child.name}
                                                        </span>
                                                    ))}
                                            </span>
                                        )}

                                        <span className="mt-auto pt-5 font-mono text-xs text-[var(--site-muted)]">
                                            {t(':count products', {
                                                count: category.count,
                                            })}
                                        </span>
                                    </span>
                                </Link>
                            ))}
                        </Stagger>
                    ) : (
                        <EmptyState
                            icon={PackageSearch}
                            title={t('Product families are being published')}
                            description={t(
                                'Categories are managed from the dashboard and appear here once added.',
                            )}
                            action={
                                <SiteLink
                                    href="/request-a-quotation"
                                    tone="outline"
                                >
                                    {t('Send a specification')}
                                </SiteLink>
                            }
                        />
                    )}
                </Container>
            </Section>

            {/* Freight motif: the half of the business that moves the metal. */}
            <Section
                invert
                className="relative overflow-hidden border-y border-[var(--site-line)]"
            >
                <Container>
                    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-20">
                        <HangingContainers className="mx-auto h-64 w-56 lg:h-80 lg:w-72" />

                        <div>
                            <SectionHeading
                                eyebrow={t('Supplied and shipped')}
                                title={t(
                                    'The same team that makes it, moves it',
                                )}
                                description={t(
                                    'Material leaves the line packed for the route it is actually taking — so what arrives on site is what left the mill.',
                                )}
                                action={
                                    <TextArrowLink href="/logistics">
                                        {t('Logistics')}
                                    </TextArrowLink>
                                }
                            />
                        </div>
                    </div>
                </Container>
            </Section>

            {featured.length > 0 && (
                <Section>
                    <Container>
                        <SectionHeading
                            eyebrow={t('Featured')}
                            title={t('Frequently specified')}
                            action={
                                <TextArrowLink href="/products">
                                    {t('Full catalogue')}
                                </TextArrowLink>
                            }
                        />

                        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {featured.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/products/${product.slug}`}
                                    className="group flex h-full flex-col border border-[var(--site-line)] bg-[var(--site-surface)] transition-colors duration-500 hover:border-[var(--site-accent)]"
                                >
                                    <span className="block aspect-[4/3] overflow-hidden bg-[var(--color-graphite-100)]">
                                        {product.image && (
                                            <img
                                                src={product.image.medium}
                                                alt={
                                                    product.image.alt ||
                                                    product.name
                                                }
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.06]"
                                            />
                                        )}
                                    </span>
                                    <span className="flex flex-1 flex-col p-6">
                                        <span className="font-display text-base font-semibold">
                                            {product.name}
                                        </span>
                                        {product.excerpt && (
                                            <span className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--site-muted)]">
                                                {product.excerpt}
                                            </span>
                                        )}
                                    </span>
                                </Link>
                            ))}
                        </Stagger>
                    </Container>
                </Section>
            )}

            <CtaBand
                eyebrow={t('Next step')}
                title={t('Tell us the system and the opening')}
                body={t(
                    'We confirm the profile, the finish and the lead time before quoting a number.',
                )}
                primary={{
                    label: t('Request a quotation'),
                    href: '/request-a-quotation',
                }}
                secondary={{
                    label: t('Browse the catalogue'),
                    href: '/catalogue',
                }}
            />
        </>
    );
}
