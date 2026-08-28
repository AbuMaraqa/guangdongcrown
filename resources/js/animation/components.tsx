import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
    gsap,
    prefersReducedMotion,
    REVEAL_START,
    ScrollTrigger,
} from './gsap';
import { useIsomorphicLayoutEffect, useReveal } from './use-reveal';
import type { RevealOptions } from './use-reveal';

type RevealProps = RevealOptions & {
    as?: ElementType;
    className?: string;
    children: ReactNode;
};

/**
 * Fades and lifts its contents into view on scroll.
 */
export function Reveal({
    as: Tag = 'div',
    className,
    children,
    ...options
}: RevealProps) {
    const ref = useReveal<HTMLElement>(options);

    return (
        <Tag ref={ref} className={className}>
            {children}
        </Tag>
    );
}

type StaggerProps = RevealOptions & {
    as?: ElementType;
    className?: string;
    /** Selector for the children to stagger. Defaults to every direct child. */
    childSelector?: string;
    children: ReactNode;
};

/**
 * Reveals direct children one after another — used for card grids, lists
 * and navigation columns.
 */
export function Stagger({
    as: Tag = 'div',
    className,
    childSelector = ':scope > *',
    children,
    ...options
}: StaggerProps) {
    const ref = useReveal<HTMLElement>({ selector: childSelector, ...options });

    return (
        <Tag ref={ref} className={className}>
            {children}
        </Tag>
    );
}

type TextRevealProps = {
    text: string;
    as?: ElementType;
    className?: string;
    /** Word-level stagger reads as cinematic; character-level is noisier. */
    delay?: number;
    stagger?: number;
    immediate?: boolean;
};

/**
 * Splits a headline into words and lifts each one out of a masked line.
 *
 * The full string stays in the DOM as accessible text: the visual split uses
 * `aria-hidden` spans so screen readers announce one clean sentence.
 */
export function TextReveal({
    text,
    as: Tag = 'h2',
    className,
    delay = 0,
    stagger = 0.045,
    immediate = false,
}: TextRevealProps) {
    const ref = useRef<HTMLElement>(null);
    const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

    useIsomorphicLayoutEffect(() => {
        const element = ref.current;

        if (!element || prefersReducedMotion()) {
            return;
        }

        const context = gsap.context(() => {
            gsap.fromTo(
                element.querySelectorAll('[data-word]'),
                { yPercent: 110, opacity: 0 },
                {
                    yPercent: 0,
                    opacity: 1,
                    duration: 1,
                    delay,
                    stagger,
                    ease: 'power4.out',
                    scrollTrigger: immediate
                        ? undefined
                        : { trigger: element, start: REVEAL_START, once: true },
                },
            );
        }, element);

        return () => context.revert();
    }, [delay, immediate, stagger, text]);

    return (
        <Tag ref={ref} className={className}>
            <span className="sr-only">{text}</span>
            <span aria-hidden="true">
                {words.map((word, index) => (
                    <span
                        key={`${word}-${index}`}
                        className="inline-flex overflow-hidden py-[0.06em] align-bottom"
                    >
                        <span
                            data-word
                            className="inline-block will-change-transform"
                        >
                            {word}
                            {index < words.length - 1 ? ' ' : ''}
                        </span>
                    </span>
                ))}
            </span>
        </Tag>
    );
}

type ImageRevealProps = {
    src: string;
    alt: string;
    className?: string;
    imageClassName?: string;
    /** Applies a slow parallax drift while the image is in view. */
    parallax?: number;
    priority?: boolean;
    width?: number | null;
    height?: number | null;
    sizes?: string;
};

/**
 * Uncovers an image behind a wipe while the image itself settles from a
 * slight over-scale — the standard editorial reveal used across the site.
 */
export function ImageReveal({
    src,
    alt,
    className,
    imageClassName,
    parallax = 0,
    priority = false,
    width,
    height,
    sizes,
}: ImageRevealProps) {
    const ref = useRef<HTMLDivElement>(null);

    useIsomorphicLayoutEffect(() => {
        const element = ref.current;

        if (!element || prefersReducedMotion()) {
            return;
        }

        const context = gsap.context(() => {
            const cover = element.querySelector('[data-cover]');
            const image = element.querySelector('img');

            gsap.timeline({
                scrollTrigger: {
                    trigger: element,
                    start: 'top 88%',
                    once: true,
                },
            })
                .fromTo(
                    cover,
                    { scaleY: 1 },
                    {
                        scaleY: 0,
                        duration: 1.05,
                        ease: 'power4.inOut',
                        transformOrigin: 'top',
                    },
                )
                .fromTo(
                    image,
                    { scale: 1.16 },
                    { scale: 1, duration: 1.4, ease: 'power3.out' },
                    0.05,
                );

            if (parallax !== 0 && image) {
                gsap.fromTo(
                    image,
                    { yPercent: -parallax },
                    {
                        yPercent: parallax,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: element,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: true,
                        },
                    },
                );
            }
        }, element);

        return () => context.revert();
    }, [parallax, src]);

    return (
        <div ref={ref} className={cn('relative overflow-hidden', className)}>
            <img
                src={src}
                alt={alt}
                width={width ?? undefined}
                height={height ?? undefined}
                sizes={sizes}
                loading={priority ? 'eager' : 'lazy'}
                decoding={priority ? 'sync' : 'async'}
                fetchPriority={priority ? 'high' : 'auto'}
                className={cn(
                    'h-full w-full object-cover will-change-transform',
                    imageClassName,
                )}
            />
            <span
                data-cover
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 origin-top bg-[var(--site-bg)]"
            />
        </div>
    );
}

type CounterProps = {
    value: string;
    className?: string;
};

/**
 * Counts a statistic up when it scrolls into view.
 *
 * Values arrive from the CMS as free text ("35+", "1.2M t"), so the numeric
 * portion is animated and any prefix/suffix is preserved verbatim.
 */
export function Counter({ value, className }: CounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const [display, setDisplay] = useState(value);

    const parsed = useMemo(() => {
        const match = value.match(/^(\D*?)([\d.,]+)(.*)$/);

        if (!match) {
            return null;
        }

        const numeric = Number(match[2].replace(/,/g, ''));

        return Number.isFinite(numeric)
            ? {
                  prefix: match[1],
                  target: numeric,
                  suffix: match[3],
                  decimals: (match[2].split('.')[1] ?? '').length,
              }
            : null;
    }, [value]);

    useIsomorphicLayoutEffect(() => {
        const element = ref.current;

        if (!element || !parsed || prefersReducedMotion()) {
            return;
        }

        const counter = { current: 0 };

        const context = gsap.context(() => {
            gsap.to(counter, {
                current: parsed.target,
                duration: 1.6,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 90%',
                    once: true,
                },
                onStart: () => setDisplay(`${parsed.prefix}0${parsed.suffix}`),
                onUpdate: () => {
                    const formatted = counter.current.toLocaleString(
                        undefined,
                        {
                            minimumFractionDigits: parsed.decimals,
                            maximumFractionDigits: parsed.decimals,
                        },
                    );
                    setDisplay(`${parsed.prefix}${formatted}${parsed.suffix}`);
                },
                onComplete: () => setDisplay(value),
            });
        }, element);

        return () => context.revert();
    }, [parsed, value]);

    return (
        <span ref={ref} className={className}>
            {display}
        </span>
    );
}

type ParallaxProps = {
    children: ReactNode;
    className?: string;
    /** Percentage of its own height the element drifts across the viewport. */
    speed?: number;
};

export function Parallax({ children, className, speed = 8 }: ParallaxProps) {
    const ref = useRef<HTMLDivElement>(null);

    useIsomorphicLayoutEffect(() => {
        const element = ref.current;

        if (!element || prefersReducedMotion()) {
            return;
        }

        const context = gsap.context(() => {
            gsap.fromTo(
                element,
                { yPercent: -speed },
                {
                    yPercent: speed,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                    },
                },
            );
        }, element);

        return () => context.revert();
    }, [speed]);

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}

type MagneticProps = {
    children: ReactNode;
    className?: string;
    /** Maximum pull toward the pointer, in pixels. */
    strength?: number;
};

/**
 * Pulls an element gently toward the pointer. Pointer-driven only, so it is
 * inert on touch devices and under reduced motion.
 */
export function Magnetic({ children, className, strength = 8 }: MagneticProps) {
    const ref = useRef<HTMLDivElement>(null);

    const handleMove = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            const element = ref.current;

            if (
                !element ||
                event.pointerType !== 'mouse' ||
                prefersReducedMotion()
            ) {
                return;
            }

            const bounds = element.getBoundingClientRect();
            const x =
                ((event.clientX - bounds.left) / bounds.width - 0.5) *
                strength *
                2;
            const y =
                ((event.clientY - bounds.top) / bounds.height - 0.5) *
                strength *
                2;

            gsap.to(element, { x, y, duration: 0.4, ease: 'power3.out' });
        },
        [strength],
    );

    const handleLeave = useCallback(() => {
        const element = ref.current;

        if (element) {
            gsap.to(element, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: 'elastic.out(1, 0.4)',
            });
        }
    }, []);

    return (
        <div
            ref={ref}
            className={cn('inline-block', className)}
            onPointerMove={handleMove}
            onPointerLeave={handleLeave}
        >
            {children}
        </div>
    );
}

type HorizontalScrollProps = {
    children: ReactNode;
    className?: string;
    trackClassName?: string;
};

/**
 * Pins a section and moves its track sideways as the page scrolls.
 *
 * Below `lg` the track falls back to a normal horizontal swipe list, which is
 * the better interaction on touch and avoids pinning on small screens.
 */
export function HorizontalScroll({
    children,
    className,
    trackClassName,
}: HorizontalScrollProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(min-width: 1024px)');
        const update = () =>
            setEnabled(query.matches && !prefersReducedMotion());

        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    useIsomorphicLayoutEffect(() => {
        const element = ref.current;

        if (!element || !enabled) {
            return;
        }

        const track = element.querySelector<HTMLElement>('[data-track]');

        if (!track) {
            return;
        }

        const context = gsap.context(() => {
            const distance = () =>
                Math.max(0, track.scrollWidth - element.clientWidth);

            gsap.to(track, {
                x: () => -distance(),
                ease: 'none',
                scrollTrigger: {
                    trigger: element,
                    start: 'top top',
                    end: () => `+=${distance()}`,
                    pin: true,
                    scrub: 0.6,
                    invalidateOnRefresh: true,
                    anticipatePin: 1,
                },
            });
        }, element);

        ScrollTrigger.refresh();

        return () => context.revert();
    }, [enabled]);

    return (
        <div ref={ref} className={className}>
            <div
                data-track
                className={cn(
                    'flex gap-6',
                    enabled
                        ? 'will-change-transform'
                        : 'snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden',
                    trackClassName,
                )}
            >
                {children}
            </div>
        </div>
    );
}
