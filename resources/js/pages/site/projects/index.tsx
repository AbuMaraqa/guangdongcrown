import { FolderSearch } from 'lucide-react';
import { Stagger } from '@/animation';
import { ProjectCard } from '@/components/site/cards';
import { FilterBar, Pagination } from '@/components/site/listing';
import { PageHeader } from '@/components/site/page-header';
import { Container, Section, SiteLink } from '@/components/site/primitives';
import { CtaBand, EmptyState } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import type {
    Crumb,
    Paginated,
    ProjectCard as ProjectCardType,
    SeoPayload,
} from '@/types/site';

type Props = {
    seo: SeoPayload;
    projects: Paginated<ProjectCardType>;
    categories: { name: string; slug: string }[];
    filters: { search: string; category: string };
    breadcrumbs: Crumb[];
};

export default function ProjectIndex({
    seo,
    projects,
    categories,
    filters,
    breadcrumbs,
}: Props) {
    const filtering = Boolean(filters.search || filters.category);

    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                eyebrow="Evidence"
                title="Programmes we have delivered"
                lead="Named work, the constraint it was solving and the outcome it was measured against."
                breadcrumbs={breadcrumbs}
            />

            <Section spacing="tight">
                <Container>
                    <FilterBar
                        basePath="/projects"
                        search={filters.search}
                        activeFacet={filters.category}
                        facets={categories}
                        searchPlaceholder="Search projects or clients"
                    />

                    {projects.data.length > 0 ? (
                        <>
                            <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {projects.data.map((project) => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                    />
                                ))}
                            </Stagger>
                            <Pagination page={projects} className="mt-14" />
                        </>
                    ) : (
                        <EmptyState
                            className="mt-12"
                            icon={FolderSearch}
                            title={
                                filtering
                                    ? 'No projects match those filters'
                                    : 'Case studies are being prepared'
                            }
                            description={
                                filtering
                                    ? 'Try a different category or clear the search.'
                                    : 'Published case studies will appear here. Ask us directly for references in the meantime.'
                            }
                            action={
                                <SiteLink href="/contact" tone="outline">
                                    Ask for references
                                </SiteLink>
                            }
                        />
                    )}
                </Container>
            </Section>

            <CtaBand
                title="Your programme could be next"
                body="Bring us the constraint. We will show you how we have solved something like it before."
                primary={{ label: 'Start a conversation', href: '/contact' }}
            />
        </>
    );
}
