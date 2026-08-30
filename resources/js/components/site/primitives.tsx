import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { ComponentProps, ElementType, ReactNode } from 'react';
import { Magnetic, Reveal } from '@/animation';
import { Link } from '@/components/site/link';
import { cn } from '@/lib/utils';

/**
 * The shared editorial primitives every public page is built from: the page
 * gutter, section rhythm, headings, eyebrows and the two button styles.
 */

export function Container({
    className,
    children,
    width = 'default',
}: {
    className?: string;
    children: ReactNode;
    width?: 'default' | 'wide' | 'narrow';
}) {
    return (
        <div
            className={cn(
                'mx-auto w-full px-6 sm:px-8 lg:px-12',
                width === 'default' && 'max-w-[88rem]',
                width === 'wide' && 'max-w-[104rem]',
                width === 'narrow' && 'max-w-3xl',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function Section({
    className,
    children,
    invert = false,
    id,
    spacing = 'default',
}: {
    className?: string;
    children: ReactNode;
    invert?: boolean;
    id?: string;
    spacing?: 'default' | 'tight' | 'loose';
}) {
    return (
        <section
            id={id}
            className={cn(
                spacing === 'default' && 'py-20 sm:py-24 lg:py-32',
                spacing === 'tight' && 'py-14 sm:py-16 lg:py-20',
                spacing === 'loose' && 'py-24 sm:py-32 lg:py-40',
                invert && 'site-invert',
                className,
            )}
        >
            {children}
        </section>
    );
}

export function Eyebrow({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return <p className={cn('site-eyebrow', className)}>{children}</p>;
}

export function SectionHeading({
    eyebrow,
    title,
    description,
    align = 'left',
    className,
    action,
    as = 'h2',
}: {
    eyebrow?: string | null;
    title: string;
    description?: string | null;
    align?: 'left' | 'center';
    className?: string;
    action?: ReactNode;
    as?: ElementType;
}) {
    const Heading = as;

    return (
        <div
            className={cn(
                'flex flex-col gap-6',
                align === 'center' && 'items-center text-center',
                action && 'lg:flex-row lg:items-end lg:justify-between',
                className,
            )}
        >
            <Reveal
                className={cn('max-w-3xl', align === 'center' && 'mx-auto')}
            >
                {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
                <Heading className="site-display text-3xl sm:text-4xl lg:text-[2.75rem]">
                    {title}
                </Heading>
                {description && (
                    <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-pretty text-[var(--site-muted)]">
                        {description}
                    </p>
                )}
            </Reveal>
            {action && <Reveal className="shrink-0">{action}</Reveal>}
        </div>
    );
}

type ButtonTone = 'solid' | 'outline' | 'ghost';

const buttonBase =
    'group/btn relative inline-flex items-center justify-center gap-2.5 rounded-sm px-6 py-3.5 font-display text-[0.8125rem] font-semibold tracking-[0.08em] uppercase transition-colors duration-300 disabled:pointer-events-none disabled:opacity-50';

const buttonTones: Record<ButtonTone, string> = {
    solid: 'bg-[var(--site-accent)] text-white hover:bg-[var(--color-brand-600)]',
    outline:
        'border border-[var(--site-line)] text-[var(--site-fg)] hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]',
    ghost: 'text-[var(--site-fg)] hover:text-[var(--site-accent)] px-0',
};

type SiteButtonProps = {
    tone?: ButtonTone;
    className?: string;
    children: ReactNode;
    withArrow?: boolean;
    magnetic?: boolean;
};

export function SiteLink({
    href,
    tone = 'solid',
    className,
    children,
    withArrow = true,
    magnetic = false,
    external = false,
    ...props
}: SiteButtonProps & { href: string; external?: boolean } & Omit<
        ComponentProps<typeof Link>,
        'href' | 'className' | 'children'
    >) {
    const content = (
        <>
            <span>{children}</span>
            {withArrow && (
                <ArrowRight
                    aria-hidden="true"
                    className="rtl-flip size-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                />
            )}
        </>
    );

    const classes = cn(buttonBase, buttonTones[tone], className);

    const element = external ? (
        <a
            href={href}
            className={classes}
            rel="noreferrer noopener"
            target="_blank"
        >
            {content}
        </a>
    ) : (
        <Link href={href} className={classes} {...props}>
            {content}
        </Link>
    );

    return magnetic ? <Magnetic>{element}</Magnetic> : element;
}

export function SiteButton({
    tone = 'solid',
    className,
    children,
    withArrow = false,
    magnetic = false,
    ...props
}: SiteButtonProps & ComponentProps<'button'>) {
    const element = (
        <button
            className={cn(buttonBase, buttonTones[tone], className)}
            {...props}
        >
            <span>{children}</span>
            {withArrow && (
                <ArrowRight
                    aria-hidden="true"
                    className="rtl-flip size-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                />
            )}
        </button>
    );

    return magnetic ? <Magnetic>{element}</Magnetic> : element;
}

/**
 * Understated inline link with an animated rule — used inside cards and
 * editorial copy where a full button would be too heavy.
 */
export function TextArrowLink({
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
                'group/link inline-flex items-center gap-2 font-display text-[0.8125rem] font-semibold tracking-[0.08em] text-[var(--site-fg)] uppercase transition-colors hover:text-[var(--site-accent)]',
                className,
            )}
        >
            <span className="relative">
                {children}
                <span className="absolute start-0 -bottom-1 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:origin-left group-hover/link:scale-x-100" />
            </span>
            <ArrowUpRight
                aria-hidden="true"
                className="rtl-flip size-4 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
            />
        </Link>
    );
}

/**
 * Numbered rule used to label sections in the editorial grid.
 */
export function SectionIndex({
    index,
    label,
}: {
    index: number;
    label: string;
}) {
    return (
        <div className="flex items-center gap-4 border-t border-[var(--site-line)] pt-4">
            <span className="font-mono text-xs text-[var(--site-muted)]">
                {String(index).padStart(2, '0')}
            </span>
            <span className="site-eyebrow">{label}</span>
        </div>
    );
}
