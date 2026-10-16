import { useScene } from '@/animation/use-scene';
import { useTranslations } from '@/hooks/use-translations';

export type PortalFrame = {
    eyebrow?: string;
    title: string;
    body?: string;
    src: string;
    alt: string;
};

export type ScrollPortalOptions = {
    portalScale?: number;
    portalRadius?: number;
    segmentDistance?: number;
    dwell?: number;
    holdDistance?: number;
    depth?: number;
    mediaZoom?: number;
    smoothing?: number;
};

const loadScrollPortal = (element: HTMLDivElement) =>
    import('@/animation/scenes/scroll-portal-scene').then(
        ({ mountScrollPortal }) => mountScrollPortal(element),
    );

/**
 * Nested full-bleed frames: each one waits in a window at the centre of the
 * frame before it, and scrolling dives through the windows one by one.
 */
export function ScrollPortal({
    frames,
    options = {},
}: {
    frames: PortalFrame[];
    options?: ScrollPortalOptions;
}) {
    const { t } = useTranslations();
    const ref = useScene(loadScrollPortal, options);
    const total = String(frames.length).padStart(2, '0');

    return (
        <div
            ref={ref}
            data-scroll-portal={JSON.stringify(options)}
            className="scroll-portal"
        >
            <div data-scroll-portal-track className="scroll-portal__track">
                <div data-scroll-portal-stage className="scroll-portal__stage">
                    {frames.map((frame, index) => (
                        <article
                            key={frame.title}
                            data-scroll-portal-frame
                            className="scroll-portal__frame"
                            style={{ zIndex: index + 1 }}
                        >
                            <img
                                data-scroll-portal-media
                                className="scroll-portal__media"
                                src={frame.src}
                                alt={frame.alt}
                                draggable={false}
                                loading="lazy"
                                decoding="async"
                            />

                            <div className="scroll-portal__scrim" />

                            <div
                                data-scroll-portal-content
                                className="scroll-portal__content flex flex-col justify-between p-6 pe-12 sm:p-10 sm:pe-16 lg:p-14 lg:pe-20"
                            >
                                <div className="max-w-xl">
                                    {frame.eyebrow && (
                                        <p className="text-xs font-semibold tracking-[0.3em] text-[var(--color-brand-400)] uppercase">
                                            {frame.eyebrow}
                                        </p>
                                    )}
                                    <h3 className="site-display mt-3 text-3xl leading-none text-balance text-white sm:text-5xl lg:text-6xl">
                                        {frame.title}
                                    </h3>
                                </div>

                                <div className="flex items-end justify-between gap-6">
                                    <span className="force-ltr shrink-0 text-xs tracking-[0.2em] whitespace-nowrap text-white/60 tabular-nums">
                                        {String(index + 1).padStart(2, '0')} /{' '}
                                        {total}
                                    </span>
                                    {frame.body && (
                                        <p className="max-w-xs text-end text-sm leading-relaxed text-white/80 sm:text-base">
                                            {frame.body}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}

                    <nav
                        className="scroll-portal__dots"
                        aria-label={t('Frames')}
                    >
                        {frames.map((frame, index) => (
                            <button
                                key={frame.title}
                                type="button"
                                data-scroll-portal-dot
                                className="scroll-portal__dot"
                                aria-label={t('Go to :title', {
                                    title: frame.title,
                                })}
                                aria-current={index === 0 ? true : undefined}
                            />
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}
