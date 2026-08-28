import { ImageReveal, Reveal } from '@/animation';
import { Prose } from '@/components/site/listing';
import { PageHeader } from '@/components/site/page-header';
import { Container, Section } from '@/components/site/primitives';
import { SeoHead } from '@/components/site/seo-head';
import type { Crumb, MediaImage, SeoPayload } from '@/types/site';

type Props = {
    seo: SeoPayload;
    page: {
        title: string;
        excerpt: string | null;
        content: string | null;
        image: MediaImage | null;
        updatedAt: string | null;
    };
    breadcrumbs: Crumb[];
};

export default function CmsPage({ seo, page, breadcrumbs }: Props) {
    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                title={page.title}
                lead={page.excerpt}
                breadcrumbs={breadcrumbs}
            />

            {page.image && (
                <Container width="narrow">
                    <ImageReveal
                        src={page.image.url}
                        alt={page.image.alt || page.title}
                        className="aspect-[16/9] w-full"
                        width={page.image.width}
                        height={page.image.height}
                        priority
                    />
                </Container>
            )}

            <Section>
                <Container width="narrow">
                    <Reveal>
                        <Prose html={page.content} />
                    </Reveal>

                    {page.updatedAt && (
                        <p className="mt-14 border-t border-[var(--site-line)] pt-6 text-[0.8125rem] text-[var(--site-muted)]">
                            Last updated{' '}
                            {new Date(page.updatedAt).toLocaleDateString(
                                undefined,
                                {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                },
                            )}
                        </p>
                    )}
                </Container>
            </Section>
        </>
    );
}
