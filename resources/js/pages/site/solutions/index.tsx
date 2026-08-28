import { Route } from 'lucide-react';
import { Stagger } from '@/animation';
import { SolutionCard } from '@/components/site/cards';
import { PageHeader } from '@/components/site/page-header';
import { Container, Section } from '@/components/site/primitives';
import { CtaBand, EmptyState } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import type {
    Crumb,
    SeoPayload,
    SolutionCard as SolutionCardType,
} from '@/types/site';

type Props = {
    seo: SeoPayload;
    solutions: SolutionCardType[];
    breadcrumbs: Crumb[];
};

export default function SolutionIndex({ seo, solutions, breadcrumbs }: Props) {
    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                eyebrow="Solutions"
                title="Programmes built around a delivery outcome"
                lead="Where a single service is not enough, we combine material, freight and storage into one managed programme with one owner."
                breadcrumbs={breadcrumbs}
            />

            <Section>
                <Container>
                    {solutions.length > 0 ? (
                        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {solutions.map((solution) => (
                                <SolutionCard
                                    key={solution.id}
                                    solution={solution}
                                />
                            ))}
                        </Stagger>
                    ) : (
                        <EmptyState
                            icon={Route}
                            title="Solutions are being published"
                            description="Managed programmes will be listed here as they are added from the dashboard."
                        />
                    )}
                </Container>
            </Section>

            <CtaBand
                eyebrow="Scoping"
                title="Not sure which programme fits?"
                body="Describe the problem rather than the service. We will propose the shape of the answer."
                primary={{ label: 'Talk to us', href: '/contact' }}
            />
        </>
    );
}
