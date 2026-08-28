import { Stagger } from '@/animation';
import { ServiceCard, TeamCard } from '@/components/site/cards';
import { PageHeader } from '@/components/site/page-header';
import {
    Container,
    Section,
    SectionHeading,
    TextArrowLink,
} from '@/components/site/primitives';
import {
    CoverageMap,
    CredentialStrip,
    CtaBand,
} from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import type {
    Credential,
    Crumb,
    Milestone,
    SeoPayload,
    ServiceCard as ServiceCardType,
    SiteLocation,
    TeamMember,
} from '@/types/site';

type Props = {
    seo: SeoPayload;
    company: {
        name: string;
        tagline: string | null;
        description: string | null;
        founded: string | number | null;
    };
    services: ServiceCardType[];
    milestones: Milestone[];
    credentials: Credential[];
    leadership: TeamMember[];
    locations: SiteLocation[];
    breadcrumbs: Crumb[];
};

export default function About({
    seo,
    company,
    services,
    milestones,
    credentials,
    leadership,
    locations,
    breadcrumbs,
}: Props) {
    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                eyebrow="About"
                title={company.tagline ?? `Who ${company.name} is`}
                lead={company.description}
                breadcrumbs={breadcrumbs}
            />

            {services.length > 0 && (
                <Section>
                    <Container>
                        <SectionHeading
                            eyebrow="Capabilities"
                            title="What we are accountable for"
                            description="One organisation covering material and movement, so responsibility never sits in the gap between two suppliers."
                            action={
                                <TextArrowLink href="/capabilities">
                                    Capability detail
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
                </Section>
            )}

            {milestones.length > 0 && <Timeline milestones={milestones} />}

            {credentials.length > 0 && (
                <Section className="border-t border-[var(--site-line)]">
                    <Container>
                        <SectionHeading
                            eyebrow="Assurance"
                            title="Certifications, memberships and awards"
                            description="Each entry names its issuing body and reference so you can verify it independently."
                        />
                        <div className="mt-12">
                            <CredentialStrip credentials={credentials} />
                        </div>
                    </Container>
                </Section>
            )}

            {locations.length > 0 && (
                <Section invert>
                    <Container>
                        <SectionHeading
                            eyebrow="Footprint"
                            title="Where we operate"
                            action={
                                <TextArrowLink href="/global-presence">
                                    Full coverage
                                </TextArrowLink>
                            }
                        />
                        <div className="mt-14">
                            <CoverageMap locations={locations} />
                        </div>
                    </Container>
                </Section>
            )}

            {leadership.length > 0 && (
                <Section>
                    <Container>
                        <SectionHeading
                            eyebrow="Leadership"
                            title="The people accountable"
                            action={
                                <TextArrowLink href="/team">
                                    Meet the team
                                </TextArrowLink>
                            }
                        />
                        <Stagger className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {leadership.slice(0, 4).map((member) => (
                                <TeamCard key={member.id} member={member} />
                            ))}
                        </Stagger>
                    </Container>
                </Section>
            )}

            <CtaBand
                eyebrow="Work with us"
                title="Bring us something difficult"
                body="A tight tolerance, an awkward destination, a deadline that has already slipped. That is where we are most useful."
                primary={{
                    label: 'Request a quotation',
                    href: '/request-a-quotation',
                }}
                secondary={{ label: 'Contact us', href: '/contact' }}
            />
        </>
    );
}

/**
 * Vertical timeline with a rule that draws itself as the section scrolls.
 */
function Timeline({ milestones }: { milestones: Milestone[] }) {
    return (
        <Section className="border-t border-[var(--site-line)]">
            <Container>
                <SectionHeading
                    eyebrow="Timeline"
                    title="How the company grew"
                />

                <div className="relative mt-16 ps-8 sm:ps-0">
                    <span
                        aria-hidden="true"
                        className="absolute top-0 bottom-0 start-1.5 w-px bg-[var(--site-line)] sm:start-[9.5rem]"
                    />

                    <Stagger className="space-y-14" y={24} stagger={0.1}>
                        {milestones.map((milestone) => (
                            <div
                                key={milestone.id}
                                className="relative grid gap-4 sm:grid-cols-[9.5rem_1fr] sm:gap-12"
                            >
                                <div className="sm:pe-12 sm:text-end">
                                    <span className="font-display text-2xl font-semibold text-[var(--site-accent)]">
                                        {milestone.year}
                                    </span>
                                </div>

                                <div className="relative">
                                    <span
                                        aria-hidden="true"
                                        className="absolute top-2.5 -start-[1.85rem] size-3 rounded-full border-2 border-[var(--site-bg)] bg-[var(--site-accent)] sm:-start-[1.9rem]"
                                    />
                                    <p className="font-display text-xl leading-snug font-semibold">
                                        {milestone.title}
                                    </p>
                                    {milestone.description && (
                                        <p className="mt-3 max-w-2xl leading-relaxed text-[var(--site-muted)]">
                                            {milestone.description}
                                        </p>
                                    )}
                                    {milestone.image && (
                                        <img
                                            src={milestone.image.medium}
                                            alt={
                                                milestone.image.alt ||
                                                milestone.title
                                            }
                                            loading="lazy"
                                            className="mt-6 aspect-[16/9] w-full max-w-lg object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </Stagger>
                </div>
            </Container>
        </Section>
    );
}
