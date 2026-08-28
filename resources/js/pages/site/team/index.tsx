import { Users } from 'lucide-react';
import { Stagger } from '@/animation';
import { TeamCard } from '@/components/site/cards';
import { PageHeader } from '@/components/site/page-header';
import {
    Container,
    Section,
    SectionHeading,
} from '@/components/site/primitives';
import { CtaBand, EmptyState } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import type { Crumb, SeoPayload, TeamMember } from '@/types/site';

type Props = {
    seo: SeoPayload;
    leadership: TeamMember[];
    members: TeamMember[];
    breadcrumbs: Crumb[];
};

export default function TeamIndex({
    seo,
    leadership,
    members,
    breadcrumbs,
}: Props) {
    const empty = leadership.length === 0 && members.length === 0;

    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                eyebrow="Team"
                title="The people behind the commitments"
                lead="Named contacts, not a generic inbox. You will know who is accountable for your order."
                breadcrumbs={breadcrumbs}
            />

            <Section>
                <Container>
                    {empty ? (
                        <EmptyState
                            icon={Users}
                            title="Team profiles are being prepared"
                            description="Profiles are managed from the dashboard and will appear here once published."
                        />
                    ) : (
                        <div className="space-y-24">
                            {leadership.length > 0 && (
                                <div>
                                    <SectionHeading
                                        eyebrow="Leadership"
                                        title="Directors and heads of function"
                                    />
                                    <Stagger className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                        {leadership.map((member) => (
                                            <TeamCard
                                                key={member.id}
                                                member={member}
                                            />
                                        ))}
                                    </Stagger>
                                </div>
                            )}

                            {members.length > 0 && (
                                <div>
                                    <SectionHeading
                                        eyebrow="Specialists"
                                        title="Commercial, technical and operations"
                                    />
                                    <Stagger className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                        {members.map((member) => (
                                            <TeamCard
                                                key={member.id}
                                                member={member}
                                            />
                                        ))}
                                    </Stagger>
                                </div>
                            )}
                        </div>
                    )}
                </Container>
            </Section>

            <CtaBand
                title="Want to speak to someone specific?"
                body="Tell us what the enquiry concerns and we will route it to the right desk."
                primary={{ label: 'Contact us', href: '/contact' }}
            />
        </>
    );
}
