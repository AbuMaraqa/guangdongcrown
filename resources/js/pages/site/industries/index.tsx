import { Building2 } from 'lucide-react';
import { Stagger } from '@/animation';
import { IndustryCard } from '@/components/site/cards';
import { PageHeader } from '@/components/site/page-header';
import { Container, Section } from '@/components/site/primitives';
import { CtaBand, EmptyState } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import type {
    Crumb,
    IndustryCard as IndustryCardType,
    SeoPayload,
} from '@/types/site';

type Props = {
    seo: SeoPayload;
    industries: IndustryCardType[];
    breadcrumbs: Crumb[];
};

export default function IndustryIndex({ seo, industries, breadcrumbs }: Props) {
    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                eyebrow="Industries"
                title="Sectors we supply and ship for"
                lead="Different industries fail in different ways. These are the ones whose tolerances, documentation and schedules we know well."
                breadcrumbs={breadcrumbs}
            />

            <Section>
                <Container>
                    {industries.length > 0 ? (
                        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {industries.map((industry) => (
                                <IndustryCard
                                    key={industry.id}
                                    industry={industry}
                                />
                            ))}
                        </Stagger>
                    ) : (
                        <EmptyState
                            icon={Building2}
                            title="Industries are being published"
                            description="This list is managed from the dashboard."
                        />
                    )}
                </Container>
            </Section>

            <CtaBand
                title="Working in a sector not listed here?"
                body="Tell us the requirement. If we cannot serve it well, we will say so."
                primary={{ label: 'Contact us', href: '/contact' }}
            />
        </>
    );
}
