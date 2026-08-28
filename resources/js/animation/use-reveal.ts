import { useEffect, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';
import {
    gsap,
    prefersReducedMotion,
    REVEAL_START,
    ScrollTrigger,
} from './gsap';

/**
 * `useLayoutEffect` on the client so the "from" state is written before the
 * browser paints — no flash of un-animated content — while staying safe if
 * the app is ever rendered on the server.
 */
export const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export type RevealOptions = {
    /** Vertical offset the element travels from, in pixels. */
    y?: number;
    /** Horizontal offset the element travels from, in pixels. */
    x?: number;
    /** Starting scale, for image and card reveals. */
    scale?: number;
    /** Seconds before the tween starts. */
    delay?: number;
    duration?: number;
    /** Stagger applied when `selector` matches more than one node. */
    stagger?: number;
    /** Animate descendants matching this selector instead of the element. */
    selector?: string;
    /** ScrollTrigger start position. */
    start?: string;
    /** Skip the scroll trigger and play immediately (used for hero content). */
    immediate?: boolean;
    disabled?: boolean;
};

/**
 * Reveals an element — or a set of its children — as it scrolls into view.
 *
 * Nothing is hidden by CSS, so with JavaScript unavailable the page still
 * renders in full; the hidden "from" state is only ever written by GSAP.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
    options: RevealOptions = {},
): RefObject<T | null> {
    const ref = useRef<T>(null);
    const {
        y = 28,
        x = 0,
        scale = 1,
        delay = 0,
        duration = 0.9,
        stagger = 0.08,
        selector,
        start = REVEAL_START,
        immediate = false,
        disabled = false,
    } = options;

    useIsomorphicLayoutEffect(() => {
        const element = ref.current;

        if (!element || disabled || prefersReducedMotion()) {
            return;
        }

        const targets: Element[] = selector
            ? Array.from(element.querySelectorAll(selector))
            : [element];

        if (targets.length === 0) {
            return;
        }

        const context = gsap.context(() => {
            gsap.fromTo(
                targets,
                { opacity: 0, y, x, scale },
                {
                    opacity: 1,
                    y: 0,
                    x: 0,
                    scale: 1,
                    duration,
                    delay,
                    stagger: targets.length > 1 ? stagger : 0,
                    clearProps: 'transform',
                    scrollTrigger: immediate
                        ? undefined
                        : { trigger: element, start, once: true },
                },
            );
        }, element);

        ScrollTrigger.refresh();

        return () => context.revert();
    }, [
        delay,
        disabled,
        duration,
        immediate,
        scale,
        selector,
        stagger,
        start,
        x,
        y,
    ]);

    return ref;
}
