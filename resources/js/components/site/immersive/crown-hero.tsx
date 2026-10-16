import crownMark from '@/animation/scenes/crown-mark.svg?raw';
import { useScene } from '@/animation/use-scene';
import { SiteLink } from '@/components/site/primitives';
import { useTranslations } from '@/hooks/use-translations';

type HeroLink = { label: string; url: string };

export type CrownHeroContent = {
    eyebrow: string | null;
    headline: string | null;
    subheadline: string | null;
    primary: HeroLink | null;
    secondary: HeroLink | null;
};

const loadHeroScene = (element: HTMLElement, options: { mirror: boolean }) =>
    import('@/animation/scenes/hero-scene').then(({ mountHeroScene }) =>
        mountHeroScene(element, options),
    );

/**
 * Full-screen light hero: the Guang Dong Crown mark extruded into brushed
 * metal with orbiting particles, scrubbed by scroll while the copy lifts away.
 * The flat SVG mark shows until the 3D scene is ready, and stays when WebGL
 * or the scene module is unavailable.
 */
export function CrownHero({
    hero,
    companyName,
}: {
    hero: CrownHeroContent;
    companyName: string;
}) {
    const { t, rtl } = useTranslations();
    const ref = useScene(loadHeroScene, { mirror: rtl });

    const headline =
        hero.headline ??
        t('Precision in aluminium. Confidence in global logistics.');

    return (
        <section
            ref={ref}
            aria-labelledby="hero-title"
            className="group relative isolate h-svh min-h-[600px] overflow-hidden bg-[var(--site-bg)] text-[var(--site-fg)]"
        >
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_72%_42%,var(--color-brand-100)_0%,color-mix(in_oklab,var(--color-brand-100)_45%,var(--color-graphite-50))_40%,var(--color-graphite-50)_100%)] rtl:bg-[radial-gradient(ellipse_at_28%_42%,var(--color-brand-100)_0%,color-mix(in_oklab,var(--color-brand-100)_45%,var(--color-graphite-50))_40%,var(--color-graphite-50)_100%)]"
            />
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-20 [background-image:linear-gradient(to_right,var(--color-graphite-950)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-graphite-950)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_70%_45%,black,transparent_70%)] [background-size:72px_72px] opacity-[0.07]"
            />

            <div aria-hidden="true" className="absolute inset-0 -z-10">
                <canvas
                    data-hero-canvas
                    className="block size-full opacity-0 transition-opacity duration-700 group-data-[hero-state=ready]:opacity-100"
                />
                <div
                    className="crown-hero-fallback absolute inset-x-0 top-[14%] mx-auto block w-1/2 max-w-xs group-data-[hero-state=ready]:hidden md:landscape:inset-x-auto md:landscape:end-[12%] md:landscape:top-1/2 md:landscape:w-[30%] md:landscape:max-w-md md:landscape:-translate-y-1/2"
                    dangerouslySetInnerHTML={{ __html: crownMark }}
                />
            </div>

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-t from-[var(--site-bg)] via-[var(--site-bg)]/70 to-transparent md:landscape:bg-linear-to-r md:landscape:from-[var(--site-bg)]/90 md:landscape:via-[var(--site-bg)]/40 md:landscape:via-45% md:landscape:to-transparent rtl:md:landscape:bg-linear-to-l"
            />

            <div className="relative z-10 mx-auto flex h-full w-full max-w-[88rem] items-end px-6 pb-24 sm:px-8 lg:px-12 md:landscape:items-center md:landscape:pb-0">
                <div className="max-w-xl md:landscape:max-w-[min(38rem,48%)]">
                    <p
                        data-hero-reveal
                        className="mb-6 flex items-center gap-3 text-sm font-semibold tracking-[0.08em] text-[var(--color-brand-700)]"
                    >
                        <span className="h-px w-10 bg-[var(--site-accent)]" />
                        {hero.eyebrow ?? companyName}
                    </p>
                    <h1
                        id="hero-title"
                        data-hero-reveal
                        className="site-display text-[2.6rem] leading-[1.03] text-balance sm:text-6xl lg:text-[4.25rem]"
                    >
                        {headline}
                    </h1>
                    {hero.subheadline && (
                        <p
                            data-hero-reveal
                            className="mt-6 max-w-md text-base leading-relaxed text-pretty text-[var(--site-muted)] sm:text-lg"
                        >
                            {hero.subheadline}
                        </p>
                    )}
                    {(hero.primary || hero.secondary) && (
                        <div
                            data-hero-reveal
                            className="mt-10 flex flex-wrap items-center gap-3"
                        >
                            {hero.primary && (
                                <SiteLink href={hero.primary.url} magnetic>
                                    {hero.primary.label}
                                </SiteLink>
                            )}
                            {hero.secondary && (
                                <SiteLink
                                    href={hero.secondary.url}
                                    tone="outline"
                                    withArrow={false}
                                >
                                    {hero.secondary.label}
                                </SiteLink>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div
                data-hero-scroll-cue
                aria-hidden="true"
                className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-[0.65rem] tracking-[0.3em] text-[var(--site-muted)] uppercase md:landscape:flex"
            >
                {t('Scroll')}
                <span className="h-10 w-px bg-linear-to-b from-[var(--site-accent)] to-transparent" />
            </div>
        </section>
    );
}
