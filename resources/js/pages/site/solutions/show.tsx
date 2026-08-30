import { ImageReveal, Reveal, Stagger } from '@/animation';
import { SolutionCard } from '@/components/site/cards';
import { Link } from '@/components/site/link';
import { Prose } from '@/components/site/listing';
import { PageHeader } from '@/components/site/page-header';
import {
    Container,
    Eyebrow,
    Section,
    SectionHeading,
} from '@/components/site/primitives';
import { CtaBand, RelatedGrid } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import type {
    Crumb,
    SeoPayload,
    SolutionCard as SolutionCardType,
    SolutionDetail,
} from '@/types/site';

type Props = {
    seo: SeoPayload;
    solution: SolutionDetail;
    related: SolutionCardType[];
    breadcrumbs: Crumb[];
};

export default function SolutionShow({
    seo,
    solution,
    related,
    breadcrumbs,
}: Props) {
    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                eyebrow="Solution"
                title={solution.title}
                lead={solution.excerpt}
                breadcrumbs={breadcrumbs}
            />

            {solution.image && (
                <Container>
                    <ImageReveal
                        src={solution.image.url}
                        alt={solution.image.alt || solution.title}
                        className="aspect-[21/9] w-full"
                        width={solution.image.width}
                        height={solution.image.height}
                        parallax={4}
                        priority
                    />
                </Container>
            )}

            {solution.content && (
                <Section>
                    <Container width="narrow">
                        <Reveal>
                            <Prose html={solution.content} />
                        </Reveal>
                    </Container>
                </Section>
            )}

            {solution.features.length > 0 && (
                <Section
                    className="border-t border-[var(--site-line)]"
                    spacing="tight"
                >
                    <Container>
                        <SectionHeading
                            eyebrow="Scope"
                            title="What the programme covers"
                        />
                        <Stagger className="mt-12 grid gap-px bg-[var(--site-line)] sm:grid-cols-2 lg:grid-cols-3">
                            {solution.features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="bg-[var(--site-surface)] p-8"
                                >
                                    <p className="font-display text-lg font-semibold">
                                        {feature.title}
                                    </p>
                                    {feature.description && (
                                        <p className="mt-3 text-sm leading-relaxed text-[var(--site-muted)]">
                                            {feature.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </Stagger>
                    </Container>
                </Section>
            )}

            {solution.process.length > 0 && (
                <Section invert>
                    <Container>
                        <SectionHeading
                            eyebrow="How it works"
                            title="From enquiry to delivery"
                        />
                        <Stagger
                            className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
                            y={24}
                        >
                            {solution.process.map((step, index) => (
                                <div
                                    key={step.title}
                                    className="border-t border-[var(--site-line)] pt-6"
                                >
                                    <span className="font-mono text-xs text-[var(--site-accent)]">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <p className="mt-4 font-display text-lg font-semibold">
                                        {step.title}
                                    </p>
                                    {step.description && (
                                        <p className="mt-3 text-sm leading-relaxed text-[var(--site-muted)]">
                                            {step.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </Stagger>
                    </Container>
                </Section>
            )}

            {solution.benefits.length > 0 && (
                <Section>
                    <Container>
                        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
                            <Reveal>
                                <Eyebrow className="mb-5">
                                    Why it matters
                                </Eyebrow>
                                <h2 className="site-display text-3xl sm:text-4xl">
                                    The difference it makes
                                </h2>
                            </Reveal>
                            <Stagger className="divide-y divide-[var(--site-line)] border-y border-[var(--site-line)]">
                                {solution.benefits.map((benefit) => (
                                    <div key={benefit.title} className="py-6">
                                        <p className="font-display text-base font-semibold">
                                            {benefit.title}
                                        </p>
                                        {benefit.description && (
                                            <p className="mt-2 text-sm leading-relaxed text-[var(--site-muted)]">
                                                {benefit.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </Stagger>
                        </div>
                    </Container>
                </Section>
            )}

            {solution.industries && solution.industries.length > 0 && (
                <Section
                    spacing="tight"
                    className="border-t border-[var(--site-line)]"
                >
                    <Container>
                        <Eyebrow className="mb-6">Industries served</Eyebrow>
                        <div className="flex flex-wrap gap-2">
                            {solution.industries.map((industry) => (
                                <Link
                                    key={industry.slug}
                                    href={`/industries/${industry.slug}`}
                                    className="border border-[var(--site-line)] px-4 py-2.5 text-sm transition-colors hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]"
                                >
                                    {industry.name}
                                </Link>
                            ))}
                        </div>
                    </Container>
                </Section>
            )}

            {related.length > 0 && (
                <Section className="border-t border-[var(--site-line)]">
                    <RelatedGrid
                        title="Other solutions"
                        action={{ label: 'All solutions', href: '/solutions' }}
                    >
                        {related.map((item) => (
                            <SolutionCard key={item.id} solution={item} />
                        ))}
                    </RelatedGrid>
                </Section>
            )}

            <CtaBand
                title="Start the conversation"
                body="Send us the constraint you are working against — volume, deadline, destination or cost — and we will map a programme to it."
                primary={{
                    label: 'Request a quotation',
                    href: '/request-a-quotation',
                }}
                secondary={{ label: 'Contact us', href: '/contact' }}
            />
        </>
    );
}
