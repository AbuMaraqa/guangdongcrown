import type { ReactNode } from 'react';
import { useScene } from '@/animation/use-scene';

export type ScrollExpandOptions = {
    startWidth?: number;
    startHeight?: number;
    startRadius?: number;
    mediaZoom?: number;
    scrollDistance?: number;
    holdDistance?: number;
    smoothing?: number;
    overlayScrim?: number;
};

const loadScrollExpand = (element: HTMLDivElement) =>
    import('@/animation/scenes/scroll-expand-scene').then(
        ({ mountScrollExpand }) => mountScrollExpand(element),
    );

/**
 * A framed image that opens up to full bleed as the page scrolls, while the
 * title lifts away and `children` fade in over the photograph.
 */
export function ScrollExpand({
    src,
    alt,
    title,
    scrollHint,
    options = {},
    children,
}: {
    src: string;
    alt: string;
    title?: string;
    scrollHint?: string;
    options?: ScrollExpandOptions;
    children?: ReactNode;
}) {
    const settings = { ...options, useWindowScroll: true };
    const ref = useScene(loadScrollExpand, settings);

    return (
        <div
            ref={ref}
            data-scroll-expand={JSON.stringify(settings)}
            className="scroll-expand"
        >
            <div data-scroll-expand-track className="scroll-expand__track">
                <div data-scroll-expand-stage className="scroll-expand__stage">
                    <div
                        data-scroll-expand-frame
                        className="scroll-expand__frame"
                    >
                        <img
                            data-scroll-expand-media
                            className="scroll-expand__media"
                            src={src}
                            alt={alt}
                            draggable={false}
                            loading="lazy"
                            decoding="async"
                        />

                        <div
                            data-scroll-expand-scrim
                            className="scroll-expand__scrim"
                        />

                        {children && (
                            <div
                                data-scroll-expand-overlay
                                className="scroll-expand__overlay"
                            >
                                {children}
                            </div>
                        )}
                    </div>

                    {title && (
                        <div
                            data-scroll-expand-title
                            className="scroll-expand__title"
                        >
                            {title}
                        </div>
                    )}

                    {scrollHint && (
                        <div
                            data-scroll-expand-hint
                            aria-hidden="true"
                            className="scroll-expand__hint"
                        >
                            {scrollHint}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
