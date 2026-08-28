import { CircleHelp } from 'lucide-react';
import { Reveal } from '@/animation';
import { PageHeader } from '@/components/site/page-header';
import { Container, Eyebrow, Section } from '@/components/site/primitives';
import { CtaBand, EmptyState, FaqAccordion } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import type { Crumb, FaqItem, SeoPayload } from '@/types/site';

type Props = {
    seo: SeoPayload;
    groups: { name: string; items: FaqItem[] }[];
    breadcrumbs: Crumb[];
};

export default function Faq({ seo, groups, breadcrumbs }: Props) {
    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                eyebrow="FAQ"
                title="Frequently asked questions"
                lead="Ordering, specification, shipping and payment — the questions we are asked most often."
                breadcrumbs={breadcrumbs}
            />

            <Section>
                <Container>
                    {groups.length > 0 ? (
                        <div className="space-y-20">
                            {groups.map((group) => (
                                <div
                                    key={group.name}
                                    className="grid gap-10 lg:grid-cols-[0.6fr_1.4fr] lg:gap-16"
                                >
                                    <Reveal>
                                        <Eyebrow>{group.name}</Eyebrow>
                                    </Reveal>
                                    <Reveal delay={0.08}>
                                        <FaqAccordion items={group.items} />
                                    </Reveal>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={CircleHelp}
                            title="Questions are being collected"
                            description="This page is managed from the dashboard and will fill in as questions are published."
                        />
                    )}
                </Container>
            </Section>

            <CtaBand
                title="Still not answered?"
                body="Send the question directly and we will reply — and probably add it here."
                primary={{ label: 'Ask us', href: '/contact' }}
            />
        </>
    );
}
