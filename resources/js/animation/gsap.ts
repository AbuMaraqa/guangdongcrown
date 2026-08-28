import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Central GSAP setup for the public site.
 *
 * Everything animated here is limited to `transform` and `opacity` so the
 * compositor can handle it without layout or paint work, and every helper
 * checks `prefers-reduced-motion` before it runs.
 */
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    gsap.defaults({ ease: 'power3.out', duration: 0.9 });

    // Reveal triggers are one-shot; refreshing on resize keeps them accurate
    // when responsive layout changes the document height.
    ScrollTrigger.config({ ignoreMobileResize: true });
}

export const REVEAL_EASE = 'power3.out';

export const REVEAL_START = 'top 85%';

export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) {
        return false;
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export { gsap, ScrollTrigger };
