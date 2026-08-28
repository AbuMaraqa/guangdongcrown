import { ImageReveal, Reveal } from '@/animation';
import { ProjectCard, SolutionCard } from '@/components/site/cards';
import { Prose } from '@/components/site/listing';
import { PageHeader } from '@/components/site/page-header';
import { Container, Section } from '@/components/site/primitives';
import { CtaBand, RelatedGrid } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import type {
    Crumb,
    IndustryDetail,
    ProjectCard as ProjectCardType,
    SeoPayload,
    SolutionCard as SolutionCardType,
} from '@/types/site';

type Props = {
    seo: SeoPayload;
    industry: IndustryDetail;
    solutions: SolutionCardType[];
    projects: ProjectCardType[];
    breadcrumbs: Crumb[];
};

export default function IndustryShow({
    seo,
    industry,
    solutions,
    projects,
    breadcrumbs,
}: Props) {
    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                eyebrow="Industry"
                title={industry.name}
                lead={industry.excerpt}
                breadcrumbs={breadcrumbs}
            />

            {industry.image && (
                <Container>
                    <ImageReveal
                        src={industry.image.url}
                        alt={industry.image.alt || industry.name}
                        className="aspect-[21/9] w-full"
                        width={industry.image.width}
                        height={industry.image.height}
                        parallax={4}
                        priority
                    />
                </Container>
            )}

            {industry.description && (
                <Section>
                    <Container width="narrow">
                        <Reveal>
                            <Prose html={industry.description} />
                        </Reveal>
                    </Container>
                </Section>
            )}

            {solutions.length > 0 && (
                <Section className="border-t border-[var(--site-line)]">
                    <RelatedGrid
                        title={`Solutions for ${industry.name.toLowerCase()}`}
                        action={{ label: 'All solutions', href: '/solutions' }}
                    >
                        {solutions.map((solution) => (
                            <SolutionCard
                                key={solution.id}
                                solution={solution}
                            />
                        ))}
                    </RelatedGrid>
                </Section>
            )}

            {projects.length > 0 && (
                <Section
                    className="border-t border-[var(--site-line)]"
                    spacing="tight"
                >
                    <RelatedGrid
                        title="Delivered in this sector"
                        action={{ label: 'All projects', href: '/projects' }}
                    >
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </RelatedGrid>
                </Section>
            )}

            <CtaBand
                title={`Supplying ${industry.name.toLowerCase()}?`}
                body="Send us the specification and delivery window and we will confirm what we can commit to."
                primary={{
                    label: 'Request a quotation',
                    href: '/request-a-quotation',
                }}
            />
        </>
    );
}
