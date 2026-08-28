import { PackageSearch } from 'lucide-react';
import { Stagger } from '@/animation';
import { ProductCard } from '@/components/site/cards';
import { FilterBar, Pagination } from '@/components/site/listing';
import { PageHeader } from '@/components/site/page-header';
import { Container, Section, SiteLink } from '@/components/site/primitives';
import { CtaBand, EmptyState } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import type {
    Crumb,
    Paginated,
    ProductCard as ProductCardType,
    SeoPayload,
} from '@/types/site';

type Props = {
    seo: SeoPayload;
    products: Paginated<ProductCardType>;
    categories: { name: string; slug: string; count: number }[];
    filters: { search: string; category: string };
    breadcrumbs: Crumb[];
};

export default function ProductIndex({
    seo,
    products,
    categories,
    filters,
    breadcrumbs,
}: Props) {
    const filtering = Boolean(filters.search || filters.category);

    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                eyebrow="Aluminium"
                title="Profiles, sheet and billet built to your specification"
                lead="Browse the standard catalogue, or send a drawing and we will confirm alloy, temper, tolerance and lead time."
                breadcrumbs={breadcrumbs}
            />

            <Section spacing="tight">
                <Container>
                    <FilterBar
                        basePath="/products"
                        search={filters.search}
                        activeFacet={filters.category}
                        facets={categories.map((c) => ({
                            name: c.name,
                            slug: c.slug,
                            count: c.count,
                        }))}
                        searchPlaceholder="Search products or SKU"
                    />

                    {products.data.length > 0 ? (
                        <>
                            <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {products.data.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </Stagger>
                            <Pagination page={products} className="mt-14" />
                        </>
                    ) : (
                        <EmptyState
                            className="mt-12"
                            icon={PackageSearch}
                            title={
                                filtering
                                    ? 'No products match those filters'
                                    : 'The catalogue is being prepared'
                            }
                            description={
                                filtering
                                    ? 'Try a broader search, or clear the category filter.'
                                    : 'Products will appear here as soon as they are published. In the meantime, send us your specification directly.'
                            }
                            action={
                                <SiteLink
                                    href="/request-a-quotation"
                                    tone="outline"
                                >
                                    Send a specification
                                </SiteLink>
                            }
                        />
                    )}
                </Container>
            </Section>

            <CtaBand
                eyebrow="Next step"
                title="Send us the drawing, we will send back the numbers"
                body="Alloy, temper, tolerance, finish and volume — we confirm feasibility and indicative pricing within one business day."
                primary={{
                    label: 'Request a quotation',
                    href: '/request-a-quotation',
                }}
                secondary={{ label: 'Talk to an engineer', href: '/contact' }}
            />
        </>
    );
}
