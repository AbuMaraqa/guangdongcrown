import { Layers } from 'lucide-react';
import { Stagger } from '@/animation';
import { ServiceCard } from '@/components/site/cards';
import { PageHeader } from '@/components/site/page-header';
import { Container, Section } from '@/components/site/primitives';
import { CtaBand, EmptyState } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import type {
    Crumb,
    SeoPayload,
    ServiceCard as ServiceCardType,
} from '@/types/site';

type Props = {
    seo: SeoPayload;
    services: ServiceCardType[];
    breadcrumbs: Crumb[];
};

export default function ServiceIndex({ seo, services, breadcrumbs }: Props) {
    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                eyebrow="Capabilities"
                title="Everything between the mill and your loading dock"
                lead="Material, documentation and movement handled by one team, so nothing is lost in the handover between supplier and forwarder."
                breadcrumbs={breadcrumbs}
            />

            <Section>
                <Container>
                    {services.length > 0 ? (
                        <Stagger className="grid gap-px bg-[var(--site-line)] sm:grid-cols-2 lg:grid-cols-3">
                            {services.map((service, index) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    index={index}
                                />
                            ))}
                        </Stagger>
                    ) : (
                        <EmptyState
                            icon={Layers}
                            title="Capabilities are being published"
                            description="This section is managed from the dashboard and will fill in as capabilities are added."
                        />
                    )}
                </Container>
            </Section>

            <CtaBand
                eyebrow="Work with us"
                title="Tell us what you need moved or made"
                primary={{
                    label: 'Request a quotation',
                    href: '/request-a-quotation',
                }}
                secondary={{ label: 'Contact the team', href: '/contact' }}
            />
        </>
    );
}
