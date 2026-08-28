import { Mail } from 'lucide-react';
import { ImageReveal, Reveal, Stagger } from '@/animation';
import { TeamCard } from '@/components/site/cards';
import { Breadcrumbs } from '@/components/site/page-header';
import {
    Container,
    Eyebrow,
    Section,
    SectionHeading,
} from '@/components/site/primitives';
import { CtaBand } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import type { Crumb, SeoPayload, TeamMember } from '@/types/site';

type Props = {
    seo: SeoPayload;
    member: TeamMember;
    colleagues: TeamMember[];
    breadcrumbs: Crumb[];
};

export default function TeamShow({
    seo,
    member,
    colleagues,
    breadcrumbs,
}: Props) {
    return (
        <>
            <SeoHead seo={seo} />

            <Section
                spacing="tight"
                className="border-b border-[var(--site-line)]"
            >
                <Container>
                    <Breadcrumbs items={breadcrumbs} className="mb-10" />

                    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
                        {member.photo ? (
                            <ImageReveal
                                src={member.photo.url}
                                alt={member.photo.alt || member.name}
                                className="aspect-[4/5] w-full border border-[var(--site-line)]"
                                width={member.photo.width}
                                height={member.photo.height}
                                priority
                            />
                        ) : (
                            <div className="flex aspect-[4/5] items-center justify-center border border-dashed border-[var(--site-line)]">
                                <span className="font-display text-5xl text-[var(--color-graphite-300)]">
                                    {member.name.charAt(0)}
                                </span>
                            </div>
                        )}

                        <Reveal delay={0.1} className="lg:pt-6">
                            {member.department && (
                                <Eyebrow className="mb-5">
                                    {member.department}
                                </Eyebrow>
                            )}
                            <h1 className="site-display text-4xl sm:text-5xl">
                                {member.name}
                            </h1>
                            {member.position && (
                                <p className="mt-4 text-lg text-[var(--site-muted)]">
                                    {member.position}
                                </p>
                            )}

                            {member.bio && (
                                <p className="mt-8 max-w-2xl leading-relaxed text-pretty text-[var(--site-muted)]">
                                    {member.bio}
                                </p>
                            )}

                            <div className="mt-10 flex flex-wrap items-center gap-3">
                                {member.email && (
                                    <a
                                        href={`mailto:${member.email}`}
                                        className="inline-flex items-center gap-2 border border-[var(--site-line)] px-5 py-3 text-sm transition-colors hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]"
                                    >
                                        <Mail
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                        {member.email}
                                    </a>
                                )}
                                {member.socials.map((social) => (
                                    <a
                                        key={social.url}
                                        href={social.url}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="border border-[var(--site-line)] px-5 py-3 text-sm transition-colors hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]"
                                    >
                                        {social.platform}
                                    </a>
                                ))}
                            </div>
                        </Reveal>
                    </div>
                </Container>
            </Section>

            {colleagues.length > 0 && (
                <Section>
                    <Container>
                        <SectionHeading title="Also on the team" />
                        <Stagger className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {colleagues.map((colleague) => (
                                <TeamCard
                                    key={colleague.id}
                                    member={colleague}
                                />
                            ))}
                        </Stagger>
                    </Container>
                </Section>
            )}

            <CtaBand
                title="Start a conversation"
                primary={{ label: 'Contact the team', href: '/contact' }}
            />
        </>
    );
}
