import { Link } from '@inertiajs/react';
import { Newspaper } from 'lucide-react';
import { ImageReveal, Reveal, Stagger } from '@/animation';
import { PostCard } from '@/components/site/cards';
import { FilterBar, Pagination } from '@/components/site/listing';
import { PageHeader } from '@/components/site/page-header';
import {
    Container,
    Eyebrow,
    Section,
    SiteLink,
} from '@/components/site/primitives';
import { CtaBand, EmptyState } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import type {
    Crumb,
    Paginated,
    PostCard as PostCardType,
    PostDetail,
    SeoPayload,
} from '@/types/site';

type Props = {
    seo: SeoPayload;
    featured: PostDetail | null;
    posts: Paginated<PostCardType>;
    categories: { name: string; slug: string }[];
    tags: { name: string; slug: string }[];
    filters: { search: string; category: string; tag: string };
    breadcrumbs: Crumb[];
};

export default function InsightIndex({
    seo,
    featured,
    posts,
    categories,
    tags,
    filters,
    breadcrumbs,
}: Props) {
    const filtering = Boolean(
        filters.search || filters.category || filters.tag,
    );

    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                eyebrow="Insights"
                title="Notes on aluminium, freight and the space between them"
                lead="Technical explainers, market context and what we are learning on live programmes."
                breadcrumbs={breadcrumbs}
            />

            {featured && (
                <Section spacing="tight">
                    <Container>
                        <Link
                            href={`/insights/${featured.slug}`}
                            className="group grid gap-10 border border-[var(--site-line)] p-6 transition-colors hover:border-[var(--site-accent)] lg:grid-cols-2 lg:gap-14 lg:p-10"
                        >
                            {featured.image ? (
                                <ImageReveal
                                    src={featured.image.medium}
                                    alt={featured.image.alt || featured.title}
                                    className="aspect-[16/10] w-full"
                                    width={featured.image.width}
                                    height={featured.image.height}
                                    imageClassName="transition-transform duration-[900ms] group-hover:scale-[1.04]"
                                    priority
                                />
                            ) : (
                                <div className="aspect-[16/10] bg-[var(--color-graphite-100)]" />
                            )}

                            <Reveal className="flex flex-col justify-center">
                                <Eyebrow className="mb-5">Featured</Eyebrow>
                                <h2 className="site-display text-2xl leading-snug sm:text-3xl lg:text-[2.25rem]">
                                    {featured.title}
                                </h2>
                                {featured.excerpt && (
                                    <p className="mt-5 leading-relaxed text-pretty text-[var(--site-muted)]">
                                        {featured.excerpt}
                                    </p>
                                )}
                                <p className="mt-8 flex items-center gap-3 text-[0.8125rem] text-[var(--site-muted)]">
                                    {featured.category && (
                                        <span className="site-eyebrow">
                                            {featured.category.name}
                                        </span>
                                    )}
                                    {featured.publishedLabel}
                                    <span aria-hidden="true">·</span>
                                    {featured.readingMinutes} min read
                                </p>
                            </Reveal>
                        </Link>
                    </Container>
                </Section>
            )}

            <Section spacing="tight">
                <Container>
                    <FilterBar
                        basePath="/insights"
                        search={filters.search}
                        activeFacet={filters.category}
                        facets={categories}
                        searchPlaceholder="Search articles"
                    />

                    {posts.data.length > 0 ? (
                        <>
                            <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {posts.data.map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))}
                            </Stagger>
                            <Pagination page={posts} className="mt-14" />
                        </>
                    ) : (
                        <EmptyState
                            className="mt-12"
                            icon={Newspaper}
                            title={
                                filtering
                                    ? 'No articles match those filters'
                                    : 'The first articles are being written'
                            }
                            description={
                                filtering
                                    ? 'Try a broader search or a different category.'
                                    : 'Published articles will appear here.'
                            }
                            action={
                                filtering ? (
                                    <SiteLink
                                        href="/insights"
                                        tone="outline"
                                        withArrow={false}
                                    >
                                        Clear filters
                                    </SiteLink>
                                ) : undefined
                            }
                        />
                    )}

                    {tags.length > 0 && (
                        <div className="mt-16 border-t border-[var(--site-line)] pt-10">
                            <Eyebrow className="mb-5">Browse by topic</Eyebrow>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <Link
                                        key={tag.slug}
                                        href={`/insights?tag=${tag.slug}`}
                                        className={`border px-3.5 py-2 text-[0.8125rem] transition-colors ${
                                            filters.tag === tag.slug
                                                ? 'border-[var(--site-accent)] text-[var(--site-accent)]'
                                                : 'border-[var(--site-line)] hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]'
                                        }`}
                                    >
                                        {tag.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </Container>
            </Section>

            <CtaBand
                title="Have a question we have not answered?"
                primary={{ label: 'Ask the team', href: '/contact' }}
            />
        </>
    );
}
