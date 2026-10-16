import { useRef } from 'react';
import { useIsomorphicLayoutEffect } from './use-reveal';

export type SceneLoader<T extends HTMLElement, O> = (
    element: T,
    options: O,
) => Promise<() => void>;

/**
 * Mounts an imperative scene module (the WebGL and scroll scenes in
 * `./scenes`) on the returned element and tears it down on unmount.
 *
 * Loaders wrap a dynamic import so three.js and OGL never enter the entry
 * chunk; define them at module scope so they stay referentially stable.
 * `options` must be JSON-serialisable — the scene remounts when they change.
 *
 * A layout effect is used on purpose: scenes that pin with ScrollTrigger have
 * to revert their pin spacer before React removes the node.
 */
export function useScene<T extends HTMLElement, O>(
    load: SceneLoader<T, O>,
    options: O,
) {
    const ref = useRef<T>(null);
    const signature = JSON.stringify(options ?? null);

    useIsomorphicLayoutEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        let dispose: (() => void) | null = null;
        let cancelled = false;

        void load(element, JSON.parse(signature) as O).then((cleanup) => {
            if (cancelled) {
                cleanup();

                return;
            }

            dispose = cleanup;
        });

        return () => {
            cancelled = true;
            dispose?.();
        };
    }, [load, signature]);

    return ref;
}
