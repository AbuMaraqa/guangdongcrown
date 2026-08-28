import { Download } from 'lucide-react';
import { useState } from 'react';
import { ImageReveal, Reveal } from '@/animation';
import { ProductCard } from '@/components/site/cards';
import { Prose } from '@/components/site/listing';
import { Breadcrumbs } from '@/components/site/page-header';
import {
    Container,
    Eyebrow,
    Section,
    SiteLink,
} from '@/components/site/primitives';
import { CtaBand, RelatedGrid } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import { cn } from '@/lib/utils';
import type {
    Crumb,
    ProductCard as ProductCardType,
    ProductDetail,
    SeoPayload,
} from '@/types/site';

type Props = {
    seo: SeoPayload;
    product: ProductDetail;
    related: ProductCardType[];
    breadcrumbs: Crumb[];
};

export default function ProductShow({
    seo,
    product,
    related,
    breadcrumbs,
}: Props) {
    const images = [product.image, ...product.gallery].filter(
        Boolean,
    ) as NonNullable<ProductDetail['image']>[];
    const [active, setActive] = useState(0);
    const current = images[active];

    return (
        <>
            <SeoHead seo={seo} />

            <Section
                spacing="tight"
                className="border-b border-[var(--site-line)]"
            >
                <Container>
                    <Breadcrumbs items={breadcrumbs} className="mb-10" />

                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                        <div>
                            {current ? (
                                <ImageReveal
                                    key={current.id}
                                    src={current.url}
                                    alt={current.alt || product.name}
                                    className="aspect-[4/3] w-full border border-[var(--site-line)]"
                                    width={current.width}
                                    height={current.height}
                                    priority
                                />
                            ) : (
                                <div className="flex aspect-[4/3] w-full items-center justify-center border border-dashed border-[var(--site-line)]">
                                    <span className="font-mono text-xs tracking-widest text-[var(--site-muted)] uppercase">
                                        Image pending
                                    </span>
                                </div>
                            )}

                            {images.length > 1 && (
                                <div className="mt-4 grid grid-cols-5 gap-3">
                                    {images.map((image, index) => (
                                        <button
                                            key={image.id}
                                            type="button"
                                            onClick={() => setActive(index)}
                                            aria-label={`View image ${index + 1}`}
                                            aria-current={index === active}
                                            className={cn(
                                                'aspect-square overflow-hidden border transition-colors',
                                                index === active
                                                    ? 'border-[var(--site-accent)]'
                                                    : 'border-[var(--site-line)] hover:border-[var(--site-muted)]',
                                            )}
                                        >
                                            <img
                                                src={image.thumb}
                                                alt=""
                                                loading="lazy"
                                                className="h-full w-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Reveal delay={0.1}>
                            {product.category && (
                                <Eyebrow className="mb-5">
                                    {product.category.name}
                                </Eyebrow>
                            )}
                            <h1 className="site-display text-3xl sm:text-4xl lg:text-[2.75rem]">
                                {product.name}
                            </h1>
                            {product.sku && (
                                <p className="mt-4 font-mono text-sm text-[var(--site-muted)]">
                                    SKU {product.sku}
                                </p>
                            )}
                            {product.excerpt && (
                                <p className="mt-6 text-[1.0625rem] leading-relaxed text-pretty text-[var(--site-muted)]">
                                    {product.excerpt}
                                </p>
                            )}

                            <div className="mt-9 flex flex-wrap gap-3">
                                <SiteLink
                                    href={`/request-a-quotation?product=${product.slug}`}
                                    magnetic
                                >
                                    Request a quotation
                                </SiteLink>
                                <SiteLink
                                    href="/contact"
                                    tone="outline"
                                    withArrow={false}
                                >
                                    Ask a question
                                </SiteLink>
                            </div>

                            {product.specifications.length > 0 && (
                                <div className="mt-12">
                                    <Eyebrow className="mb-5">
                                        Specifications
                                    </Eyebrow>
                                    <dl className="divide-y divide-[var(--site-line)] border-y border-[var(--site-line)]">
                                        {product.specifications.map((spec) => (
                                            <div
                                                key={spec.label}
                                                className="grid grid-cols-[minmax(0,10rem)_1fr] gap-6 py-3.5"
                                            >
                                                <dt className="text-sm text-[var(--site-muted)]">
                                                    {spec.label}
                                                </dt>
                                                <dd className="text-sm font-medium">
                                                    {spec.value}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                            )}
                        </Reveal>
                    </div>
                </Container>
            </Section>

            {(product.description ||
                product.applications.length > 0 ||
                product.downloads.length > 0) && (
                <Section>
                    <Container>
                        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
                            <Reveal>
                                <Prose html={product.description} />
                            </Reveal>

                            <div className="space-y-12">
                                {product.applications.length > 0 && (
                                    <Reveal>
                                        <Eyebrow className="mb-5">
                                            Typical applications
                                        </Eyebrow>
                                        <ul className="space-y-3">
                                            {product.applications.map(
                                                (application) => (
                                                    <li
                                                        key={application}
                                                        className="flex gap-3 border-b border-[var(--site-line)] pb-3 text-sm"
                                                    >
                                                        <span className="text-[var(--site-accent)]">
                                                            —
                                                        </span>
                                                        {application}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </Reveal>
                                )}

                                {product.downloads.length > 0 && (
                                    <Reveal>
                                        <Eyebrow className="mb-5">
                                            Downloads
                                        </Eyebrow>
                                        <ul className="space-y-2">
                                            {product.downloads.map(
                                                (download) => (
                                                    <li key={download.url}>
                                                        <a
                                                            href={download.url}
                                                            target="_blank"
                                                            rel="noreferrer noopener"
                                                            className="group flex items-center justify-between border border-[var(--site-line)] p-4 text-sm transition-colors hover:border-[var(--site-accent)]"
                                                        >
                                                            {download.label}
                                                            <Download
                                                                aria-hidden="true"
                                                                className="size-4 text-[var(--site-muted)] transition-colors group-hover:text-[var(--site-accent)]"
                                                            />
                                                        </a>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </Reveal>
                                )}
                            </div>
                        </div>
                    </Container>
                </Section>
            )}

            {related.length > 0 && (
                <Section className="border-t border-[var(--site-line)]">
                    <RelatedGrid
                        title="Related products"
                        action={{ label: 'All products', href: '/products' }}
                    >
                        {related.map((item) => (
                            <ProductCard key={item.id} product={item} />
                        ))}
                    </RelatedGrid>
                </Section>
            )}

            <CtaBand
                title="Ready to price this specification?"
                body="Tell us the quantity, destination port and delivery window. We will come back with a full landed cost."
                primary={{
                    label: 'Request a quotation',
                    href: `/request-a-quotation?product=${product.slug}`,
                }}
            />
        </>
    );
}
