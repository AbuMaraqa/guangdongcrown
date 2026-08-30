import { ArrowDown } from 'lucide-react';
import { useEffect, useRef } from 'react';
import {
    gsap,
    HorizontalScroll,
    ImageReveal,
    Parallax,
    prefersReducedMotion,
    Reveal,
    Stagger,
    TextReveal,
} from '@/animation';
import {
    IndustryCard,
    PostCard,
    ProductCard,
    ProjectCard,
    ServiceCard,
    SolutionCard,
    TestimonialCard,
} from '@/components/site/cards';
import { Link } from '@/components/site/link';
import {
    Container,
    Eyebrow,
    Section as Band,
    SectionHeading,
    SiteLink,
    TextArrowLink,
} from '@/components/site/primitives';
import {
    CoverageMap,
    CredentialStrip,
    FaqAccordion,
    StatBand,
} from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import type {
    Credential,
    FaqItem,
    IndustryCard as IndustryCardType,
    MediaImage,
    PostCard as PostCardType,
    ProductCard as ProductCardType,
    ProjectCard as ProjectCardType,
    SeoPayload,
    ServiceCard as ServiceCardType,
    SiteLocation,
    SolutionCard as SolutionCardType,
    Stat,
    Testimonial,
} from '@/types/site';

type HomeProps = {
    seo: SeoPayload;
    hero: {
        eyebrow: string | null;
        headline: string | null;
        subheadline: string | null;
        primary: { label: string; url: string } | null;
        secondary: { label: string; url: string } | null;
        image: MediaImage | null;
    };
    stats: Stat[];
    intro: {
        eyebrow: string | null;
        heading: string | null;
        body: string | null;
    };
    services: ServiceCardType[];
    products: ProductCardType[];
    solutions: SolutionCardType[];
    industries: IndustryCardType[];
    projects: ProjectCardType[];
    testimonials: Testimonial[];
    credentials: Credential[];
    coverage: { countries: string[]; facilities: SiteLocation[] };
    faqs: FaqItem[];
    posts: PostCardType[];
};

export default function Home({
    seo,
    hero,
    stats,
    intro,
    services,
    products,
    solutions,
    industries,
    projects,
    testimonials,
    credentials,
    coverage,
    faqs,
    posts,
}: HomeProps) {
    return (
        <>
            <SeoHead seo={seo} />

            <Hero hero={hero} />

            <StatBand stats={stats} />

            {(intro.heading || intro.body) && (
                <Band>
                    <Container>
                        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
                            <Reveal>
                                {intro.eyebrow && (
                                    <Eyebrow className="mb-5">
                                        {intro.eyebrow}
                                    </Eyebrow>
                                )}
                                {intro.heading && (
                                    <h2 className="site-display text-3xl sm:text-4xl lg:text-[2.6rem]">
                                        {intro.heading}
                                    </h2>
                                )}
                            </Reveal>
                            <Reveal delay={0.12}>
                                {intro.body && (
                                    <p className="text-[1.0625rem] leading-relaxed text-pretty text-[var(--site-muted)]">
                                        {intro.body}
                                    </p>
                                )}
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <SiteLink href="/about" tone="outline">
                                        About the company
                                    </SiteLink>
                                    <SiteLink href="/projects" tone="ghost">
                                        See delivered work
                                    </SiteLink>
                                </div>
                            </Reveal>
                        </div>
                    </Container>
                </Band>
            )}

            {services.length > 0 && (
                <Band className="border-t border-[var(--site-line)]">
                    <Container>
                        <SectionHeading
                            eyebrow="What we do"
                            title="Four capabilities, one accountable partner"
                            description="Material and movement handled by the same team, so specification, packing and transit decisions are never made in isolation."
                            action={
                                <TextArrowLink href="/capabilities">
                                    All capabilities
                                </TextArrowLink>
                            }
                        />
                        <Stagger className="mt-14 grid gap-px bg-[var(--site-line)] sm:grid-cols-2 lg:grid-cols-4">
                            {services.slice(0, 4).map((service, index) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    index={index}
                                />
                            ))}
                        </Stagger>
                    </Container>
                </Band>
            )}

            {products.length > 0 && (
                <Band>
                    <Container>
                        <SectionHeading
                            eyebrow="Aluminium"
                            title="Supplied to specification, not to catalogue"
                            description="Extrusion, sheet and billet produced against your drawing, alloy and temper — with mill certificates on every consignment."
                            action={
                                <TextArrowLink href="/products">
                                    Full catalogue
                                </TextArrowLink>
                            }
                        />
                    </Container>

                    <div className="mt-14">
                        <HorizontalScroll className="ps-6 sm:ps-8 lg:ps-12">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="w-[19rem] shrink-0 snap-start sm:w-[22rem]"
                                >
                                    <ProductCard product={product} />
                                </div>
                            ))}
                            <div className="hidden w-[19rem] shrink-0 items-center justify-center lg:flex">
                                <SiteLink href="/products" tone="outline">
                                    View all products
                                </SiteLink>
                            </div>
                        </HorizontalScroll>
                    </div>
                </Band>
            )}

            {solutions.length > 0 && <LogisticsBand solutions={solutions} />}

            {industries.length > 0 && (
                <Band>
                    <Container>
                        <SectionHeading
                            eyebrow="Industries"
                            title="Sectors we supply"
                            action={
                                <TextArrowLink href="/industries">
                                    All industries
                                </TextArrowLink>
                            }
                        />
                        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {industries.map((industry) => (
                                <IndustryCard
                                    key={industry.id}
                                    industry={industry}
                                />
                            ))}
                        </Stagger>
                    </Container>
                </Band>
            )}

            {projects.length > 0 && (
                <Band className="border-t border-[var(--site-line)]">
                    <Container>
                        <SectionHeading
                            eyebrow="Evidence"
                            title="Work we have delivered"
                            description="Named programmes with the outcome we were measured against."
                            action={
                                <TextArrowLink href="/projects">
                                    All projects
                                </TextArrowLink>
                            }
                        />
                        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {projects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                />
                            ))}
                        </Stagger>
                    </Container>
                </Band>
            )}

            {coverage.facilities.length > 0 && (
                <Band invert>
                    <Container>
                        <SectionHeading
                            eyebrow="Global presence"
                            title={
                                coverage.countries.length > 0
                                    ? `Operating across ${coverage.countries.length} ${coverage.countries.length === 1 ? 'country' : 'countries'}`
                                    : 'Where we operate'
                            }
                            action={
                                <TextArrowLink href="/global-presence">
                                    Coverage detail
                                </TextArrowLink>
                            }
                        />
                        <div className="mt-14">
                            <CoverageMap locations={coverage.facilities} />
                        </div>
                    </Container>
                </Band>
            )}

            {credentials.length > 0 && (
                <Band spacing="tight">
                    <Container>
                        <SectionHeading
                            eyebrow="Assurance"
                            title="Certifications and recognition"
                            description="Every credential below names its issuing body so you can verify it independently."
                        />
                        <div className="mt-12">
                            <CredentialStrip credentials={credentials} />
                        </div>
                    </Container>
                </Band>
            )}

            {testimonials.length > 0 && (
                <Band className="border-t border-[var(--site-line)]">
                    <Container>
                        <SectionHeading
                            eyebrow="Clients"
                            title="What partners say"
                        />
                        <Stagger className="mt-14 grid gap-6 lg:grid-cols-3">
                            {testimonials.slice(0, 3).map((testimonial) => (
                                <TestimonialCard
                                    key={testimonial.id}
                                    testimonial={testimonial}
                                />
                            ))}
                        </Stagger>
                    </Container>
                </Band>
            )}

            {posts.length > 0 && (
                <Band>
                    <Container>
                        <SectionHeading
                            eyebrow="Insights"
                            title="Notes from the desk"
                            action={
                                <TextArrowLink href="/insights">
                                    All insights
                                </TextArrowLink>
                            }
                        />
                        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </Stagger>
                    </Container>
                </Band>
            )}

            {faqs.length > 0 && (
                <Band className="border-t border-[var(--site-line)]">
                    <Container>
                        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
                            <Reveal>
                                <Eyebrow className="mb-5">Questions</Eyebrow>
                                <h2 className="site-display text-3xl sm:text-4xl">
                                    Answers before you ask
                                </h2>
                                <p className="mt-5 text-[var(--site-muted)]">
                                    Cannot find what you need?{' '}
                                    <Link
                                        href="/contact"
                                        className="underline underline-offset-4"
                                    >
                                        Ask us directly
                                    </Link>
                                    .
                                </p>
                            </Reveal>
                            <Reveal delay={0.1}>
                                <FaqAccordion items={faqs} />
                            </Reveal>
                        </div>
                    </Container>
                </Band>
            )}
        </>
    );
}

function Hero({ hero }: { hero: HomeProps['hero'] }) {
    const ref = useRef<HTMLDivElement>(null);

    // Slow background drift keeps the hero alive without competing with the
    // headline; scrubbed to scroll so it never animates on its own.
    useEffect(() => {
        const element = ref.current;

        if (!element || prefersReducedMotion()) {
            return;
        }

        const context = gsap.context(() => {
            gsap.to('[data-hero-media]', {
                yPercent: 12,
                scale: 1.06,
                ease: 'none',
                scrollTrigger: {
                    trigger: element,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });

            gsap.to('[data-hero-scrim]', {
                opacity: 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: element,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });
        }, element);

        return () => context.revert();
    }, []);

    const headline =
        hero.headline ??
        'Precision in aluminium. Confidence in global logistics.';

    return (
        <div ref={ref} className="site-invert relative isolate overflow-hidden">
            <div className="absolute inset-0 -z-10">
                {hero.image ? (
                    <img
                        data-hero-media
                        src={hero.image.url}
                        alt=""
                        fetchPriority="high"
                        decoding="sync"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div
                        data-hero-media
                        aria-hidden="true"
                        className="h-full w-full bg-[radial-gradient(120%_120%_at_20%_0%,var(--color-graphite-800),var(--color-graphite-950))]"
                    />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(100deg,var(--color-graphite-950)_18%,rgb(12_14_16/0.72)_58%,rgb(12_14_16/0.35))]" />
                <div
                    data-hero-scrim
                    className="absolute inset-0 bg-[var(--color-graphite-950)] opacity-0"
                />
                <div
                    aria-hidden="true"
                    className="absolute inset-0 [background-image:linear-gradient(to_right,rgb(255_255_255/0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.5)_1px,transparent_1px)] [background-size:120px_120px] opacity-[0.16]"
                />
            </div>

            <Container>
                <div className="flex min-h-dvh flex-col justify-end pt-32 pb-16 lg:min-h-[92vh] lg:pb-20">
                    <div className="max-w-4xl">
                        {hero.eyebrow && (
                            <Reveal immediate delay={0.1}>
                                <Eyebrow>{hero.eyebrow}</Eyebrow>
                            </Reveal>
                        )}

                        <TextReveal
                            as="h1"
                            text={headline}
                            immediate
                            delay={0.2}
                            className="site-display mt-6 text-[2.6rem] leading-[1.03] sm:text-6xl lg:text-[4.75rem]"
                        />

                        {hero.subheadline && (
                            <Reveal
                                immediate
                                delay={0.55}
                                className="mt-8 max-w-2xl"
                            >
                                <p className="text-lg leading-relaxed text-pretty text-[var(--site-muted)]">
                                    {hero.subheadline}
                                </p>
                            </Reveal>
                        )}

                        <Reveal
                            immediate
                            delay={0.7}
                            className="mt-10 flex flex-wrap gap-3"
                        >
                            {hero.primary && (
                                <SiteLink href={hero.primary.url} magnetic>
                                    {hero.primary.label}
                                </SiteLink>
                            )}
                            {hero.secondary && (
                                <SiteLink
                                    href={hero.secondary.url}
                                    tone="outline"
                                    withArrow={false}
                                >
                                    {hero.secondary.label}
                                </SiteLink>
                            )}
                        </Reveal>
                    </div>

                    <Reveal
                        immediate
                        delay={1}
                        className="mt-16 flex items-center gap-3 text-[0.6875rem] tracking-[0.16em] text-[var(--site-muted)] uppercase"
                    >
                        <ArrowDown
                            aria-hidden="true"
                            className="size-4 motion-safe:animate-bounce"
                        />
                        Scroll to explore
                    </Reveal>
                </div>
            </Container>
        </div>
    );
}

function LogisticsBand({ solutions }: { solutions: SolutionCardType[] }) {
    const feature = solutions[0];

    return (
        <Band invert className="border-y border-[var(--site-line)]">
            <Container>
                <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
                    <div>
                        <SectionHeading
                            eyebrow="Logistics"
                            title="Material moved with the same rigour it was made"
                            description="Ocean and air freight, bonded warehousing and inland delivery, coordinated against one schedule and one point of contact."
                        />
                        <Reveal
                            delay={0.1}
                            className="mt-10 flex flex-wrap gap-3"
                        >
                            <SiteLink href="/logistics">
                                Logistics capability
                            </SiteLink>
                            <SiteLink
                                href="/solutions"
                                tone="outline"
                                withArrow={false}
                            >
                                All solutions
                            </SiteLink>
                        </Reveal>
                    </div>

                    <div>
                        {feature?.image ? (
                            <Parallax speed={5}>
                                <ImageReveal
                                    src={feature.image.url}
                                    alt={feature.image.alt || feature.title}
                                    className="aspect-[4/3] w-full"
                                    width={feature.image.width}
                                    height={feature.image.height}
                                />
                            </Parallax>
                        ) : (
                            <Stagger className="grid gap-6 sm:grid-cols-2">
                                {solutions.slice(0, 4).map((solution) => (
                                    <SolutionCard
                                        key={solution.id}
                                        solution={solution}
                                    />
                                ))}
                            </Stagger>
                        )}
                    </div>
                </div>

                {feature?.image && solutions.length > 0 && (
                    <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {solutions.slice(0, 4).map((solution) => (
                            <SolutionCard
                                key={solution.id}
                                solution={solution}
                            />
                        ))}
                    </Stagger>
                )}
            </Container>
        </Band>
    );
}
