import type { CSSProperties } from 'react';
import { useScene } from '@/animation/use-scene';
import { useTranslations } from '@/hooks/use-translations';

export type StoryChapter = {
    label: string;
    title: string;
    body: string;
};

const loadLogoStory = (element: HTMLElement, options: { mirror: boolean }) =>
    import('@/animation/scenes/logo-story-scene').then(({ mountLogoStory }) =>
        mountLogoStory(element, options),
    );

const STAGE_STYLE = {
    '--story-bg': '#f6f8f9',
    '--story-ink': '#1a2b31',
    '--story-muted': '#55656b',
    '--story-accent': '#077d8b',
    '--story-line': 'rgb(18 48 58 / 0.14)',
} as CSSProperties;

/**
 * Scroll-driven 3D story: the mark is drawn, lands on a first structure and a
 * city grows along its stroke until, seen from above, it was always the mark.
 *
 * Exactly five chapters line up with the scene's timeline. Without WebGL, or
 * under reduced motion, the chapters render as a static timeline instead.
 */
export function LogoStory({
    eyebrow,
    heading,
    chapters,
}: {
    eyebrow: string;
    heading: string;
    chapters: StoryChapter[];
}) {
    const { t, rtl } = useTranslations();
    const ref = useScene(loadLogoStory, { mirror: rtl });

    return (
        <section
            ref={ref}
            id="story"
            data-logo-story
            aria-labelledby="story-title"
            className="group/story relative border-t border-[var(--site-line)] bg-[var(--site-bg)]"
        >
            <h2 id="story-title" className="sr-only">
                {heading}
            </h2>

            <div className="mx-auto max-w-[88rem] px-6 py-24 group-data-[story-state=ready]/story:hidden sm:px-8 lg:px-12 lg:py-32">
                <p className="site-eyebrow">{eyebrow}</p>
                <p className="site-display mt-4 max-w-2xl text-3xl text-balance sm:text-4xl">
                    {heading}
                </p>

                <ol className="mt-16 grid gap-px overflow-hidden bg-[var(--site-line)] ring-1 ring-[var(--site-line)] sm:grid-cols-2 lg:grid-cols-5">
                    {chapters.map((chapter, index) => (
                        <li
                            key={chapter.label}
                            className="bg-[var(--site-surface)] p-8"
                        >
                            <p className="text-sm font-semibold text-[var(--site-accent)] tabular-nums">
                                {String(index + 1).padStart(2, '0')} ·{' '}
                                {chapter.label}
                            </p>
                            <h3 className="mt-8 text-lg font-medium">
                                {chapter.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--site-muted)]">
                                {chapter.body}
                            </p>
                        </li>
                    ))}
                </ol>
            </div>

            <div
                data-logo-story-track
                className="relative hidden h-[640svh] group-data-[story-state=ready]/story:block"
            >
                <div
                    data-logo-story-stage
                    className="sticky top-0 h-svh overflow-hidden bg-(--story-bg) text-(--story-ink)"
                    style={STAGE_STYLE}
                >
                    <canvas
                        data-logo-story-canvas
                        aria-hidden="true"
                        className="absolute inset-0 block size-full"
                    />

                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-linear-to-t from-(--story-bg) via-(--story-bg)/40 via-35% to-transparent to-60% lg:landscape:bg-linear-to-r lg:landscape:via-(--story-bg)/50 lg:landscape:via-25% lg:landscape:to-45% rtl:lg:landscape:bg-linear-to-l"
                    />

                    <div className="relative z-10 mx-auto flex h-full max-w-[88rem] flex-col px-6 pt-28 pb-8 sm:px-8 lg:px-12 lg:pt-32 lg:pb-10">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.3em] whitespace-nowrap text-(--story-accent) uppercase">
                                <span className="h-px w-10 bg-(--story-accent)" />
                                {eyebrow}
                            </p>

                            <dl
                                aria-hidden="true"
                                className="flex gap-8 sm:gap-10 sm:text-end"
                            >
                                {(
                                    [
                                        ['stage', t('Stage'), '01'],
                                        ['buildings', t('Structures'), '0'],
                                        ['floors', t('Floors'), '0'],
                                    ] as const
                                ).map(([key, label, initial]) => (
                                    <div key={key}>
                                        <dt className="text-[0.65rem] tracking-[0.25em] text-(--story-muted) uppercase">
                                            {label}
                                        </dt>
                                        <dd
                                            data-logo-story-stat={key}
                                            className="force-ltr mt-1 text-xl font-medium tabular-nums sm:text-2xl"
                                        >
                                            {initial}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        <div className="mt-auto grid lg:landscape:my-auto lg:landscape:max-w-md">
                            {chapters.map((chapter, index) => (
                                <article
                                    key={chapter.label}
                                    data-logo-story-chapter
                                    className="col-start-1 row-start-1 translate-y-6 opacity-0 blur-sm transition duration-700 ease-out data-active:translate-y-0 data-active:opacity-100 data-active:blur-none data-past:-translate-y-6"
                                >
                                    <p className="text-sm font-semibold text-(--story-accent) tabular-nums">
                                        {String(index + 1).padStart(2, '0')} ·{' '}
                                        {chapter.label}
                                    </p>
                                    <h3 className="site-display mt-4 text-3xl leading-[1.08] text-balance sm:text-4xl lg:text-5xl">
                                        {chapter.title}
                                    </h3>
                                    <p className="mt-5 max-w-md text-base leading-relaxed text-(--story-muted) sm:text-lg">
                                        {chapter.body}
                                    </p>
                                </article>
                            ))}
                        </div>

                        <div
                            aria-hidden="true"
                            className="mt-10 lg:landscape:mt-0"
                        >
                            <div className="relative h-px bg-(--story-line)">
                                <div
                                    data-logo-story-progress
                                    className="absolute inset-0 origin-left bg-(--story-accent) rtl:origin-right"
                                    style={{ transform: 'scaleX(0)' }}
                                />
                            </div>
                            <ol className="mt-4 grid grid-cols-5 gap-2 text-[0.65rem] tracking-[0.15em] uppercase sm:text-xs">
                                {chapters.map((chapter, index) => (
                                    <li
                                        key={chapter.label}
                                        data-logo-story-tick
                                        className="text-(--story-muted) transition-colors duration-500 data-active:text-(--story-ink) data-past:text-(--story-ink)"
                                    >
                                        <span className="block tabular-nums">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <span className="mt-1 hidden sm:block">
                                            {chapter.label}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
