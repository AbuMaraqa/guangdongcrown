import { ImageReveal, Reveal, Stagger } from '@/animation';
import { ProjectCard, ServiceCard } from '@/components/site/cards';
import { Prose } from '@/components/site/listing';
import { PageHeader } from '@/components/site/page-header';
import {
    Container,
    Eyebrow,
    Section,
    SectionHeading,
    TextArrowLink,
} from '@/components/site/primitives';
import { CoverageMap, CtaBand, RelatedGrid } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import type {
    Crumb,
    ProjectCard as ProjectCardType,
    SeoPayload,
    ServiceCard as ServiceCardType,
    SiteLocation,
    SolutionDetail,
} from '@/types/site';

type Props = {
    seo: SeoPayload;
    solution: SolutionDetail | null;
    services: ServiceCardType[];
    locations: SiteLocation[];
    projects: ProjectCardType[];
    breadcrumbs: Crumb[];
};

export default function Logistics({
    seo,
    solution,
    services,
    locations,
    projects,
    breadcrumbs,
}: Props) {
    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                eyebrow="Logistics"
                title={
                    solution?.title ??
                    'Freight, warehousing and inland delivery under one schedule'
                }
                lead={
                    solution?.excerpt ??
                    'Ocean and air freight, bonded storage and last-mile transport coordinated by the team that also controls the material.'
                }
                breadcrumbs={breadcrumbs}
            />

            {solution?.image && (
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

            {services.length > 0 && (
                <Section>
                    <Container>
                        <SectionHeading
                            eyebrow="Services"
                            title="What we move, store and manage"
                            action={
                                <TextArrowLink href="/capabilities">
                                    Capability detail
                                </TextArrowLink>
                            }
                        />
                        <Stagger className="mt-14 grid gap-px bg-[var(--site-line)] sm:grid-cols-2 lg:grid-cols-3">
                            {services.map((service, index) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    index={index}
                                />
                            ))}
                        </Stagger>
                    </Container>
                </Section>
            )}

            {solution?.content && (
                <Section className="border-t border-[var(--site-line)]">
                    <Container width="narrow">
                        <Reveal>
                            <Prose html={solution.content} />
                        </Reveal>
                    </Container>
                </Section>
            )}

            {solution && solution.process.length > 0 && (
                <Section invert>
                    <Container>
                        <SectionHeading
                            eyebrow="Delivery process"
                            title="From booking to proof of delivery"
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

            {locations.length > 0 && (
                <Section className="border-t border-[var(--site-line)]">
                    <Container>
                        <SectionHeading
                            eyebrow="Coverage"
                            title="Where we ship from and to"
                            action={
                                <TextArrowLink href="/global-presence">
                                    Global presence
                                </TextArrowLink>
                            }
                        />
                        <div className="mt-14">
                            <CoverageMap locations={locations} />
                        </div>
                    </Container>
                </Section>
            )}

            {solution && solution.benefits.length > 0 && (
                <Section>
                    <Container>
                        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
                            <Reveal>
                                <Eyebrow className="mb-5">
                                    Why it matters
                                </Eyebrow>
                                <h2 className="site-display text-3xl sm:text-4xl">
                                    One owner, one schedule, one invoice
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

            {projects.length > 0 && (
                <Section
                    className="border-t border-[var(--site-line)]"
                    spacing="tight"
                >
                    <RelatedGrid
                        title="Logistics work we have delivered"
                        action={{ label: 'All projects', href: '/projects' }}
                    >
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </RelatedGrid>
                </Section>
            )}

            <CtaBand
                eyebrow="Get moving"
                title="Send us the shipment"
                body="Origin, destination, Incoterm and cargo detail. We will come back with routing options and a landed cost."
                primary={{
                    label: 'Request a quotation',
                    href: '/request-a-quotation',
                }}
                secondary={{ label: 'Talk to the desk', href: '/contact' }}
            />
        </>
    );
}
