import { useEffect, useState } from 'react';
import { ImageReveal, Reveal } from '@/animation';
import { PostCard } from '@/components/site/cards';
import { Link } from '@/components/site/link';
import { Prose } from '@/components/site/listing';
import { Breadcrumbs } from '@/components/site/page-header';
import { Container, Eyebrow, Section } from '@/components/site/primitives';
import { CtaBand, RelatedGrid } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import type {
    Crumb,
    PostCard as PostCardType,
    PostDetail,
    SeoPayload,
} from '@/types/site';

type Props = {
    seo: SeoPayload;
    post: PostDetail;
    related: PostCardType[];
    breadcrumbs: Crumb[];
};

export default function InsightShow({
    seo,
    post,
    related,
    breadcrumbs,
}: Props) {
    return (
        <>
            <SeoHead seo={seo} />
            <ReadingProgress />

            <Section spacing="tight">
                <Container width="narrow">
                    <Breadcrumbs items={breadcrumbs} className="mb-10" />

                    {post.category && (
                        <Eyebrow className="mb-6">{post.category.name}</Eyebrow>
                    )}

                    <h1 className="site-display text-3xl sm:text-4xl lg:text-[3rem]">
                        {post.title}
                    </h1>

                    <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-[var(--site-line)] py-5 text-[0.8125rem] text-[var(--site-muted)]">
                        {post.author && (
                            <span className="text-[var(--site-fg)]">
                                {post.author.name}
                            </span>
                        )}
                        {post.publishedLabel && (
                            <span>{post.publishedLabel}</span>
                        )}
                        <span>{post.readingMinutes} min read</span>
                    </div>
                </Container>
            </Section>

            {post.image && (
                <Container width="narrow">
                    <ImageReveal
                        src={post.image.url}
                        alt={post.image.alt || post.title}
                        className="aspect-[16/9] w-full"
                        width={post.image.width}
                        height={post.image.height}
                        priority
                    />
                </Container>
            )}

            <Section spacing="tight">
                <Container width="narrow">
                    <Reveal>
                        <Prose
                            html={post.content}
                            className="text-[1.125rem]"
                        />
                    </Reveal>

                    {post.tags && post.tags.length > 0 && (
                        <div className="mt-14 flex flex-wrap gap-2 border-t border-[var(--site-line)] pt-8">
                            {post.tags.map((tag) => (
                                <Link
                                    key={tag.slug}
                                    href={`/insights?tag=${tag.slug}`}
                                    className="border border-[var(--site-line)] px-3.5 py-2 text-[0.8125rem] transition-colors hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]"
                                >
                                    {tag.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </Container>
            </Section>

            {related.length > 0 && (
                <Section className="border-t border-[var(--site-line)]">
                    <RelatedGrid
                        title="Related reading"
                        action={{ label: 'All insights', href: '/insights' }}
                    >
                        {related.map((item) => (
                            <PostCard key={item.id} post={item} />
                        ))}
                    </RelatedGrid>
                </Section>
            )}

            <CtaBand
                title="Turn the theory into a quotation"
                body="If any of this applies to a live requirement, send us the detail."
                primary={{
                    label: 'Request a quotation',
                    href: '/request-a-quotation',
                }}
            />
        </>
    );
}

/**
 * Thin progress rule pinned under the header while an article is read.
 */
function ReadingProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const update = () => {
            const scrollable =
                document.documentElement.scrollHeight - window.innerHeight;
            setProgress(
                scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0,
            );
        };

        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);

        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, []);

    return (
        <div
            aria-hidden="true"
            className="fixed inset-x-0 top-20 z-40 h-0.5 origin-left bg-[var(--site-accent)] lg:top-24"
            style={{ transform: `scaleX(${progress})` }}
        />
    );
}
