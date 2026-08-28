import { Link } from '@inertiajs/react';
import { Counter, ImageReveal, Reveal, Stagger } from '@/animation';
import { ProjectCard } from '@/components/site/cards';
import { Prose } from '@/components/site/listing';
import { PageHeader } from '@/components/site/page-header';
import { Container, Eyebrow, Section } from '@/components/site/primitives';
import { CtaBand, RelatedGrid } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import type {
    Crumb,
    ProjectCard as ProjectCardType,
    ProjectDetail,
    SeoPayload,
} from '@/types/site';

type Props = {
    seo: SeoPayload;
    project: ProjectDetail;
    related: ProjectCardType[];
    breadcrumbs: Crumb[];
};

export default function ProjectShow({
    seo,
    project,
    related,
    breadcrumbs,
}: Props) {
    const facts = [
        { label: 'Client', value: project.client },
        {
            label: 'Location',
            value:
                [project.location, project.country]
                    .filter(Boolean)
                    .join(', ') || null,
        },
        { label: 'Completed', value: project.completedAt },
        { label: 'Category', value: project.category?.name ?? null },
    ].filter((fact) => Boolean(fact.value));

    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                eyebrow="Case study"
                title={project.title}
                lead={project.excerpt}
                breadcrumbs={breadcrumbs}
            />

            {project.image && (
                <Container>
                    <ImageReveal
                        src={project.image.url}
                        alt={project.image.alt || project.title}
                        className="aspect-[16/9] w-full"
                        width={project.image.width}
                        height={project.image.height}
                        parallax={5}
                        priority
                    />
                </Container>
            )}

            <Section>
                <Container>
                    <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
                        <Reveal>
                            <Prose html={project.description} />
                        </Reveal>

                        <div className="space-y-12">
                            {facts.length > 0 && (
                                <Reveal>
                                    <Eyebrow className="mb-5">
                                        Project facts
                                    </Eyebrow>
                                    <dl className="divide-y divide-[var(--site-line)] border-y border-[var(--site-line)]">
                                        {facts.map((fact) => (
                                            <div
                                                key={fact.label}
                                                className="flex justify-between gap-6 py-3.5"
                                            >
                                                <dt className="text-sm text-[var(--site-muted)]">
                                                    {fact.label}
                                                </dt>
                                                <dd className="text-end text-sm font-medium">
                                                    {fact.value}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </Reveal>
                            )}

                            {project.services &&
                                project.services.length > 0 && (
                                    <Reveal>
                                        <Eyebrow className="mb-5">
                                            Capabilities used
                                        </Eyebrow>
                                        <div className="flex flex-wrap gap-2">
                                            {project.services.map((service) => (
                                                <Link
                                                    key={service.slug}
                                                    href={`/capabilities/${service.slug}`}
                                                    className="border border-[var(--site-line)] px-3.5 py-2 text-[0.8125rem] transition-colors hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]"
                                                >
                                                    {service.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </Reveal>
                                )}
                        </div>
                    </div>
                </Container>
            </Section>

            {project.results.length > 0 && (
                <Section invert spacing="tight">
                    <Container>
                        <Eyebrow className="mb-10">Measured outcome</Eyebrow>
                        <Stagger
                            className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4"
                            y={20}
                        >
                            {project.results.map((result) => (
                                <div
                                    key={result.label}
                                    className="border-t border-[var(--site-line)] pt-6"
                                >
                                    <p className="site-display text-4xl">
                                        <Counter value={result.value} />
                                    </p>
                                    <p className="mt-3 text-sm text-[var(--site-muted)]">
                                        {result.label}
                                    </p>
                                </div>
                            ))}
                        </Stagger>
                    </Container>
                </Section>
            )}

            {project.gallery.length > 0 && (
                <Section>
                    <Container>
                        <Stagger className="grid gap-6 sm:grid-cols-2">
                            {project.gallery.map((image) => (
                                <ImageReveal
                                    key={image.id}
                                    src={image.medium}
                                    alt={image.alt || project.title}
                                    className="aspect-[4/3] w-full"
                                    width={image.width}
                                    height={image.height}
                                />
                            ))}
                        </Stagger>
                    </Container>
                </Section>
            )}

            {related.length > 0 && (
                <Section className="border-t border-[var(--site-line)]">
                    <RelatedGrid
                        title="Related projects"
                        action={{ label: 'All projects', href: '/projects' }}
                    >
                        {related.map((item) => (
                            <ProjectCard key={item.id} project={item} />
                        ))}
                    </RelatedGrid>
                </Section>
            )}

            <CtaBand
                title="Have a comparable programme?"
                body="We will walk you through how this was scoped, priced and delivered."
                primary={{ label: 'Talk to the team', href: '/contact' }}
            />
        </>
    );
}
