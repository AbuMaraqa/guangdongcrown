import { Link } from '@inertiajs/react';
import { ArrowUpRight, Quote as QuoteIcon, Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { DynamicIcon } from '@/components/site/dynamic-icon';
import { cn } from '@/lib/utils';
import type {
    IndustryCard as IndustryCardType,
    MediaImage,
    PostCard as PostCardType,
    ProductCard as ProductCardType,
    ProjectCard as ProjectCardType,
    ServiceCard as ServiceCardType,
    SolutionCard as SolutionCardType,
    TeamMember,
    Testimonial,
} from '@/types/site';

/**
 * The card vocabulary shared across listings.
 *
 * Every card uses the same interaction language: a hairline border that warms
 * to the accent, a slow image scale, and content that lifts a few pixels.
 */

function CardImage({
    image,
    alt,
    className,
    ratio = 'aspect-[4/3]',
}: {
    image: MediaImage | null;
    alt: string;
    className?: string;
    ratio?: string;
}) {
    return (
        <div
            className={cn(
                'relative overflow-hidden bg-[var(--color-graphite-100)]',
                ratio,
                className,
            )}
        >
            {image ? (
                <img
                    src={image.medium}
                    alt={image.alt || alt}
                    width={image.width ?? undefined}
                    height={image.height ?? undefined}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                />
            ) : (
                <div
                    aria-hidden="true"
                    className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,var(--color-graphite-100),var(--color-graphite-200))]"
                >
                    <span className="font-mono text-[0.6875rem] tracking-widest text-[var(--color-graphite-500)] uppercase">
                        No image
                    </span>
                </div>
            )}
        </div>
    );
}

function CardShell({
    href,
    children,
    className,
}: {
    href: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <Link
            href={href}
            className={cn(
                'group relative flex h-full flex-col border border-[var(--site-line)] bg-[var(--site-surface)] transition-colors duration-500 hover:border-[var(--site-accent)]',
                className,
            )}
        >
            {children}
        </Link>
    );
}

export function ProductCard({ product }: { product: ProductCardType }) {
    return (
        <CardShell href={`/products/${product.slug}`}>
            <CardImage image={product.image} alt={product.name} />
            <div className="flex flex-1 flex-col p-6">
                {product.category && (
                    <p className="site-eyebrow mb-3">{product.category.name}</p>
                )}
                <h3 className="font-display text-lg leading-snug font-semibold transition-transform duration-500 group-hover:-translate-y-0.5">
                    {product.name}
                </h3>
                {product.excerpt && (
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--site-muted)]">
                        {product.excerpt}
                    </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-6">
                    {product.sku && (
                        <span className="font-mono text-xs text-[var(--site-muted)]">
                            {product.sku}
                        </span>
                    )}
                    <ArrowUpRight
                        aria-hidden="true"
                        className="ms-auto size-4 text-[var(--site-muted)] transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--site-accent)] rtl-flip"
                    />
                </div>
            </div>
        </CardShell>
    );
}

export function ProjectCard({ project }: { project: ProjectCardType }) {
    return (
        <CardShell href={`/projects/${project.slug}`}>
            <CardImage
                image={project.image}
                alt={project.title}
                ratio="aspect-[3/2]"
            />
            <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-[var(--site-muted)]">
                    {project.category && (
                        <span className="site-eyebrow">
                            {project.category.name}
                        </span>
                    )}
                    {project.country && <span>{project.country}</span>}
                </div>
                <h3 className="font-display text-lg leading-snug font-semibold transition-transform duration-500 group-hover:-translate-y-0.5">
                    {project.title}
                </h3>
                {project.excerpt && (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--site-muted)]">
                        {project.excerpt}
                    </p>
                )}
                <div className="mt-auto flex items-center justify-between border-t border-[var(--site-line)] pt-5 text-[0.8125rem] text-[var(--site-muted)]">
                    <span>{project.client ?? project.location ?? ''}</span>
                    {project.completedAt && (
                        <span className="font-mono">{project.completedAt}</span>
                    )}
                </div>
            </div>
        </CardShell>
    );
}

export function PostCard({ post }: { post: PostCardType }) {
    return (
        <CardShell href={`/insights/${post.slug}`}>
            <CardImage
                image={post.image}
                alt={post.title}
                ratio="aspect-[16/10]"
            />
            <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center gap-3 text-[0.8125rem] text-[var(--site-muted)]">
                    {post.category && (
                        <span className="site-eyebrow">
                            {post.category.name}
                        </span>
                    )}
                    <span>{post.readingMinutes} min read</span>
                </div>
                <h3 className="font-display text-lg leading-snug font-semibold transition-transform duration-500 group-hover:-translate-y-0.5">
                    {post.title}
                </h3>
                {post.excerpt && (
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--site-muted)]">
                        {post.excerpt}
                    </p>
                )}
                {post.publishedLabel && (
                    <p className="mt-auto pt-6 font-mono text-xs text-[var(--site-muted)]">
                        {post.publishedLabel}
                    </p>
                )}
            </div>
        </CardShell>
    );
}

export function ServiceCard({
    service,
    index,
}: {
    service: ServiceCardType;
    index?: number;
}) {
    return (
        <Link
            href={`/capabilities/${service.slug}`}
            className="group relative flex h-full flex-col border border-[var(--site-line)] bg-[var(--site-surface)] p-8 transition-colors duration-500 hover:border-[var(--site-accent)]"
        >
            <div className="flex items-start justify-between">
                <span className="inline-flex size-12 items-center justify-center border border-[var(--site-line)] text-[var(--site-accent)] transition-colors duration-500 group-hover:border-[var(--site-accent)] group-hover:bg-[var(--site-accent)] group-hover:text-white">
                    <DynamicIcon name={service.icon} className="size-5" />
                </span>
                {typeof index === 'number' && (
                    <span className="font-mono text-xs text-[var(--site-muted)]">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                )}
            </div>
            <h3 className="mt-8 font-display text-xl leading-snug font-semibold">
                {service.name}
            </h3>
            {service.excerpt && (
                <p className="mt-3 text-sm leading-relaxed text-[var(--site-muted)]">
                    {service.excerpt}
                </p>
            )}
            <span className="mt-auto flex items-center gap-2 pt-8 font-display text-[0.8125rem] font-semibold tracking-[0.08em] text-[var(--site-fg)] uppercase">
                Explore
                <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl-flip"
                />
            </span>
        </Link>
    );
}

export function SolutionCard({ solution }: { solution: SolutionCardType }) {
    return (
        <CardShell
            href={`/solutions/${solution.slug}`}
            className="overflow-hidden"
        >
            <CardImage
                image={solution.image}
                alt={solution.title}
                ratio="aspect-[16/9]"
            />
            <div className="flex flex-1 flex-col p-7">
                <div className="flex items-center gap-3">
                    <DynamicIcon
                        name={solution.icon}
                        className="size-5 text-[var(--site-accent)]"
                    />
                    <h3 className="font-display text-lg leading-snug font-semibold">
                        {solution.title}
                    </h3>
                </div>
                {solution.excerpt && (
                    <p className="mt-4 text-sm leading-relaxed text-[var(--site-muted)]">
                        {solution.excerpt}
                    </p>
                )}
            </div>
        </CardShell>
    );
}

export function IndustryCard({ industry }: { industry: IndustryCardType }) {
    return (
        <CardShell href={`/industries/${industry.slug}`}>
            <CardImage
                image={industry.image}
                alt={industry.name}
                ratio="aspect-[5/4]"
            />
            <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3">
                    <DynamicIcon
                        name={industry.icon}
                        className="size-4.5 text-[var(--site-accent)]"
                    />
                    <h3 className="font-display text-base font-semibold">
                        {industry.name}
                    </h3>
                </div>
                {industry.excerpt && (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--site-muted)]">
                        {industry.excerpt}
                    </p>
                )}
            </div>
        </CardShell>
    );
}

export function TeamCard({ member }: { member: TeamMember }) {
    return (
        <CardShell
            href={`/team/${member.slug}`}
            className="border-0 bg-transparent hover:border-0"
        >
            <CardImage
                image={member.photo}
                alt={member.name}
                ratio="aspect-[4/5]"
                className="border border-[var(--site-line)] transition-colors duration-500 group-hover:border-[var(--site-accent)]"
            />
            <div className="pt-5">
                <h3 className="font-display text-base font-semibold">
                    {member.name}
                </h3>
                {member.position && (
                    <p className="mt-1 text-sm text-[var(--site-muted)]">
                        {member.position}
                    </p>
                )}
            </div>
        </CardShell>
    );
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
    return (
        <figure className="flex h-full flex-col border border-[var(--site-line)] bg-[var(--site-surface)] p-8">
            <QuoteIcon
                aria-hidden="true"
                className="size-7 text-[var(--site-accent)]"
            />

            {testimonial.rating !== null && (
                <div
                    className="mt-5 flex gap-0.5"
                    aria-label={`${testimonial.rating} out of 5`}
                >
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                            key={index}
                            aria-hidden="true"
                            className={cn(
                                'size-3.5',
                                index < (testimonial.rating ?? 0)
                                    ? 'fill-[var(--site-accent)] text-[var(--site-accent)]'
                                    : 'text-[var(--color-graphite-300)]',
                            )}
                        />
                    ))}
                </div>
            )}

            <blockquote className="mt-6 text-[1.0625rem] leading-relaxed text-pretty text-[var(--site-fg)]">
                {testimonial.content}
            </blockquote>

            <figcaption className="mt-auto flex items-center gap-4 pt-8">
                {testimonial.avatar && (
                    <img
                        src={testimonial.avatar.thumb}
                        alt=""
                        loading="lazy"
                        className="size-11 shrink-0 rounded-full object-cover"
                    />
                )}
                <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-[0.8125rem] text-[var(--site-muted)]">
                        {[
                            testimonial.role,
                            testimonial.company,
                            testimonial.country,
                        ]
                            .filter(Boolean)
                            .join(' · ')}
                    </p>
                </div>
            </figcaption>
        </figure>
    );
}
