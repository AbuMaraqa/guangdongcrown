import { usePage } from '@inertiajs/react';
import {
    HorizontalScroll,
    ImageReveal,
    Parallax,
    Reveal,
    Stagger,
} from '@/animation';
import {
    IndustryCard,
    ProductCard,
    SolutionCard,
} from '@/components/site/cards';
import { CapabilityStack } from '@/components/site/immersive/capability-stack';
import { CrownHero } from '@/components/site/immersive/crown-hero';
import { ElectricMark } from '@/components/site/immersive/electric-mark';
import { LogoStory } from '@/components/site/immersive/logo-story';
import type { StoryChapter } from '@/components/site/immersive/logo-story';
import { ScrollExpand } from '@/components/site/immersive/scroll-expand';
import { ScrollPortal } from '@/components/site/immersive/scroll-portal';
import type { PortalFrame } from '@/components/site/immersive/scroll-portal';
import {
    Container,
    Eyebrow,
    Section as Band,
    SectionHeading,
    SiteLink,
    TextArrowLink,
} from '@/components/site/primitives';
import { CoverageMap } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import { useTranslations } from '@/hooks/use-translations';
import type {
    IndustryCard as IndustryCardType,
    MediaImage,
    ProductCard as ProductCardType,
    SeoPayload,
    ServiceCard as ServiceCardType,
    SiteChrome,
    SiteLocation,
    SolutionCard as SolutionCardType,
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
    intro: {
        eyebrow: string | null;
        heading: string | null;
        body: string | null;
    };
    services: ServiceCardType[];
    products: ProductCardType[];
    solutions: SolutionCardType[];
    industries: IndustryCardType[];
    coverage: { countries: string[]; facilities: SiteLocation[] };
};

const photo = (id: string) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2400&q=80`;

/** Editorial photography for the scroll scenes (Unsplash licence). */
const SCENE_IMAGES = {
    port: photo('1494412574643-ff11b0a5c1c3'),
    network: photo('1451187580459-43490279c0fa'),
    ship: photo('1605745341112-85968b19335b'),
    warehouse: photo('1586528116311-ad8dd3c8310d'),
    facade: photo('1486406146926-c627a92ad1ab'),
};

export default function Home({
    seo,
    hero,
    intro,
    services,
    products,
    solutions,
    industries,
    coverage,
}: HomeProps) {
    const { t } = useTranslations();
    const chrome = usePage().props.site as SiteChrome | null;
    const companyName = chrome?.company.name ?? 'Guang Dong Crown';

    // Five chapters, matching the five beats of the 3D story timeline.
    const chapters: StoryChapter[] = [
        {
            label: t('The specification'),
            title: t('It starts with a single mark.'),
            body: t(
                'An alloy, a temper, a tolerance. Every order begins as a drawing we are accountable for.',
            ),
        },
        {
            label: t('The material'),
            title: t('Extruded, finished, certified.'),
            body: t(
                'Material is produced to your drawing and checked against its published standard before it leaves the line.',
            ),
        },
        {
            label: t('Block by block'),
            title: t('Structures rise from the material.'),
            body: t(
                'Facades, frames and systems take shape from the profiles, sheet and coil we supply.',
            ),
        },
        {
            label: t('Connected'),
            title: t('Freight, storage and delivery, lit end to end.'),
            body: t(
                'Ocean and air freight, bonded warehousing and inland transport, coordinated as one network.',
            ),
        },
        {
            label: t('Delivered'),
            title: t('From above, it was always the mark.'),
            body: t(
                'Material and movement held by one accountable partner, in the same shape we started with.',
            ),
        },
    ];

    const portalFrames: PortalFrame[] = [
        {
            eyebrow: t('The network'),
            title: t('Material moving across borders.'),
            body: t(
                'Ocean and air freight coordinated against one schedule and one point of contact.',
            ),
            src: SCENE_IMAGES.network,
            alt: t('City lights spread across the Earth at night'),
        },
        {
            eyebrow: t('Ocean freight'),
            title: t('Packed, loaded and tracked.'),
            body: t(
                'Profiles, sheet and coil packed for transit and followed from the port of loading.',
            ),
            src: SCENE_IMAGES.ship,
            alt: t('A loaded container ship at sea'),
        },
        {
            eyebrow: t('Warehousing'),
            title: t('Stored, staged, released on time.'),
            body: t(
                'Bonded storage and inland delivery keep material close to the programme it serves.',
            ),
            src: SCENE_IMAGES.warehouse,
            alt: t('Racked goods inside a large warehouse'),
        },
        {
            eyebrow: t('On site'),
            title: t('Down to a single facade.'),
            body: t(
                'The work is measured where it lands: in the frames, curtain walls and structures it becomes.',
            ),
            src: SCENE_IMAGES.facade,
            alt: t('Glass and aluminium office towers seen from street level'),
        },
    ];

    return (
        <>
            <SeoHead seo={seo} />

            <CrownHero hero={hero} companyName={companyName} />

            <section aria-labelledby="scale-title" className="site-invert">
                <ScrollExpand
                    src={hero.image?.url ?? SCENE_IMAGES.port}
                    alt={
                        hero.image?.alt ||
                        t('Container cranes and stacked containers at a port')
                    }
                    title={t('Built to move')}
                    scrollHint={t('Scroll')}
                >
                    <h2
                        id="scale-title"
                        className="site-display text-3xl text-balance text-white sm:text-5xl"
                    >
                        {t('Made to specification. Moved to site.')}
                    </h2>
                    <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                        {t(
                            'From the extrusion line to the job site, one partner carries the material and the responsibility for getting it there.',
                        )}
                    </p>
                </ScrollExpand>
            </section>

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
                <Band
                    spacing="tight"
                    className="border-t border-[var(--site-line)] pb-0 sm:pb-0 lg:pb-0"
                >
                    <Container>
                        <SectionHeading
                            eyebrow={t('What we do')}
                            title={t(
                                'Four capabilities, one accountable partner',
                            )}
                            description={t(
                                'Material and movement handled by the same team, so specification, packing and transit decisions are never made in isolation.',
                            )}
                            action={
                                <TextArrowLink href="/capabilities">
                                    {t('All capabilities')}
                                </TextArrowLink>
                            }
                        />
                    </Container>
                    <div className="mx-auto max-w-[88rem] pt-14 pb-24 lg:pb-32">
                        <CapabilityStack services={services.slice(0, 4)} />
                    </div>
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

            <LogoStory
                eyebrow={t('From material to network')}
                heading={t('How a specification becomes a skyline.')}
                chapters={chapters}
            />

            {solutions.length > 0 && <LogisticsBand solutions={solutions} />}

            <section aria-labelledby="reach-title" className="site-invert">
                <Container className="pt-24 pb-16 lg:pt-32">
                    <Eyebrow>{t('Reach')}</Eyebrow>
                    <h2
                        id="reach-title"
                        className="site-display mt-5 max-w-2xl text-3xl text-balance sm:text-4xl"
                    >
                        {t('From the global network down to a single facade.')}
                    </h2>
                </Container>

                <ScrollPortal frames={portalFrames} />
            </section>

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

            <Band className="border-t border-[var(--site-line)]">
                <Container>
                    <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
                        <Reveal>
                            <Eyebrow className="mb-5">
                                {t('Always connected')}
                            </Eyebrow>
                            <h2 className="site-display text-3xl text-balance sm:text-4xl">
                                {t(
                                    'One mark, carried from the mill to the site.',
                                )}
                            </h2>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <p className="text-lg leading-relaxed text-pretty text-[var(--site-muted)]">
                                {t(
                                    'Material and movement run through the same team, so the specification that leaves the extrusion line is the one that arrives on site.',
                                )}
                            </p>
                        </Reveal>
                    </div>

                    <div className="mt-16 grid gap-6 lg:grid-cols-2">
                        {(
                            [
                                {
                                    theme: 'dark',
                                    panel: 'bg-[var(--color-graphite-950)] ring-[var(--color-graphite-950)]',
                                    caption: 'text-white/60',
                                    color: '#c8f3f7',
                                    glowColor: '#0aa6b8',
                                    fill: 0.25,
                                },
                                {
                                    theme: 'light',
                                    panel: 'bg-[var(--site-surface)] ring-[var(--site-line)]',
                                    caption: 'text-[var(--site-muted)]',
                                    color: '#0aa6b8',
                                    glowColor: '#077d8b',
                                    fill: 0.15,
                                },
                            ] as const
                        ).map((panel) => (
                            <figure
                                key={panel.theme}
                                className={`relative h-[360px] overflow-hidden ring-1 sm:h-[480px] ${panel.panel}`}
                            >
                                <ElectricMark
                                    theme={panel.theme}
                                    color={panel.color}
                                    glowColor={panel.glowColor}
                                    fill={panel.fill}
                                    scale={0.55}
                                    strands={4}
                                    bend={0.6}
                                    crackle={1.5}
                                    arcs={1}
                                    speed={2.5}
                                />
                                <figcaption
                                    className={`pointer-events-none absolute inset-x-0 bottom-0 p-6 text-xs tracking-[0.2em] uppercase ${panel.caption}`}
                                >
                                    {t('Hover to charge · Click to discharge')}
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </Container>
            </Band>
        </>
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
