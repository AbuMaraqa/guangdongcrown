import { ImageReveal, Reveal, Stagger } from '@/animation';
import { ProjectCard, ServiceCard } from '@/components/site/cards';
import { Prose } from '@/components/site/listing';
import { PageHeader } from '@/components/site/page-header';
import { Container, Eyebrow, Section } from '@/components/site/primitives';
import { CtaBand, RelatedGrid } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import type {
    Crumb,
    ProjectCard as ProjectCardType,
    SeoPayload,
    ServiceCard as ServiceCardType,
    ServiceDetail,
} from '@/types/site';

type Props = {
    seo: SeoPayload;
    service: ServiceDetail;
    projects: ProjectCardType[];
    others: ServiceCardType[];
    breadcrumbs: Crumb[];
};

export default function ServiceShow({
    seo,
    service,
    projects,
    others,
    breadcrumbs,
}: Props) {
    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                eyebrow="Capability"
                title={service.name}
                lead={service.excerpt}
                breadcrumbs={breadcrumbs}
            />

            {service.image && (
                <Container>
                    <ImageReveal
                        src={service.image.url}
                        alt={service.image.alt || service.name}
                        className="-mt-px aspect-[21/9] w-full"
                        width={service.image.width}
                        height={service.image.height}
                        parallax={4}
                        priority
                    />
                </Container>
            )}

            <Section>
                <Container>
                    <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
                        <Reveal>
                            <Prose html={service.description} />
                        </Reveal>

                        {service.features.length > 0 && (
                            <div>
                                <Eyebrow className="mb-6">
                                    What is included
                                </Eyebrow>
                                <Stagger className="divide-y divide-[var(--site-line)] border-y border-[var(--site-line)]">
                                    {service.features.map((feature) => (
                                        <div
                                            key={feature.title}
                                            className="py-5"
                                        >
                                            <p className="font-display text-base font-semibold">
                                                {feature.title}
                                            </p>
                                            {feature.description && (
                                                <p className="mt-2 text-sm leading-relaxed text-[var(--site-muted)]">
                                                    {feature.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </Stagger>
                            </div>
                        )}
                    </div>

                    {service.gallery.length > 0 && (
                        <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {service.gallery.map((image) => (
                                <ImageReveal
                                    key={image.id}
                                    src={image.medium}
                                    alt={image.alt || service.name}
                                    className="aspect-[4/3] w-full"
                                    width={image.width}
                                    height={image.height}
                                />
                            ))}
                        </Stagger>
                    )}
                </Container>
            </Section>

            {projects.length > 0 && (
                <Section className="border-t border-[var(--site-line)]">
                    <RelatedGrid
                        title="Delivered with this capability"
                        action={{ label: 'All projects', href: '/projects' }}
                    >
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </RelatedGrid>
                </Section>
            )}

            {others.length > 0 && (
                <Section
                    className="border-t border-[var(--site-line)]"
                    spacing="tight"
                >
                    <RelatedGrid
                        title="Other capabilities"
                        action={{
                            label: 'All capabilities',
                            href: '/capabilities',
                        }}
                    >
                        {others.map((other, index) => (
                            <ServiceCard
                                key={other.id}
                                service={other}
                                index={index}
                            />
                        ))}
                    </RelatedGrid>
                </Section>
            )}

            <CtaBand
                title={`Need ${service.name.toLowerCase()}?`}
                body="Send us the scope and we will respond with an approach, a schedule and a price."
                primary={{
                    label: 'Request a quotation',
                    href: `/request-a-quotation?service=${service.slug}`,
                }}
            />
        </>
    );
}
