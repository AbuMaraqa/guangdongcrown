import { useEffect } from 'react';
import { gsap, prefersReducedMotion, ScrollTrigger } from './gsap';

/**
 * Adds inertial smooth scrolling to the public site and keeps ScrollTrigger
 * in sync with it.
 *
 * Lenis is imported dynamically so it never enters the critical entry chunk,
 * and it is skipped entirely under `prefers-reduced-motion`, where hijacking
 * the native scroll would be actively unpleasant.
 */
export function useSmoothScroll(enabled = true): void {
    useEffect(() => {
        if (!enabled || prefersReducedMotion()) {
            return;
        }

        let dispose: (() => void) | null = null;
        let cancelled = false;

        void import('lenis').then(({ default: Lenis }) => {
            if (cancelled) {
                return;
            }

            const lenis = new Lenis({
                // Continuous inertia rather than a fixed-duration tween: each
                // wheel tick adds to the current momentum instead of
                // restarting an animation, which reads as one long glide.
                lerp: 0.075,
                wheelMultiplier: 0.9,
                smoothWheel: true,
                // In-page `#anchor` links glide too, clearing the fixed header.
                anchors: { offset: -96 },
                // Touch devices keep their native momentum; only the pointer
                // experience is smoothed.
                syncTouch: false,
            });

            lenis.on('scroll', ScrollTrigger.update);

            const tick = (time: number) => lenis.raf(time * 1000);

            gsap.ticker.add(tick);
            gsap.ticker.lagSmoothing(0);

            dispose = () => {
                gsap.ticker.remove(tick);
                lenis.destroy();
            };
        });

        return () => {
            cancelled = true;
            dispose?.();
        };
    }, [enabled]);
}
