import { useRef } from 'react';
import {
    gsap,
    prefersReducedMotion,
    useIsomorphicLayoutEffect,
} from '@/animation';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';

/**
 * Two freight containers on crane cables, drawn as inline SVG.
 *
 * Vector rather than an image so it scales cleanly, inherits the brand
 * palette, and can be animated per element. The two containers swing on
 * slightly different periods, which reads as physical rather than looped —
 * and the whole thing sits still under `prefers-reduced-motion`.
 */
export function HangingContainers({ className }: { className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const { t } = useTranslations();

    useIsomorphicLayoutEffect(() => {
        const element = ref.current;

        if (!element || prefersReducedMotion()) {
            return;
        }

        const context = gsap.context(() => {
            // Each container hangs from its hook, so the pivot is the top of
            // the cable rather than the centre of the box.
            gsap.set('[data-swing="export"]', { transformOrigin: '50% 0%' });
            gsap.set('[data-swing="import"]', { transformOrigin: '50% 0%' });

            gsap.timeline({
                repeat: -1,
                yoyo: true,
                defaults: { ease: 'sine.inOut' },
            })
                .fromTo(
                    '[data-swing="export"]',
                    { rotate: -2.2 },
                    { rotate: 2.2, duration: 3.4 },
                    0,
                )
                .fromTo(
                    '[data-swing="import"]',
                    { rotate: 1.8 },
                    { rotate: -1.8, duration: 4.1 },
                    0,
                );

            // A slow vertical drift suggests the crane is still paying out line.
            gsap.to('[data-lift]', {
                y: 10,
                duration: 5.5,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
            });

            gsap.from(element, {
                opacity: 0,
                y: 26,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 88%',
                    once: true,
                },
            });
        }, element);

        return () => context.revert();
    }, []);

    return (
        <div
            ref={ref}
            className={cn('pointer-events-none select-none', className)}
            aria-hidden="true"
        >
            <svg
                viewBox="0 0 300 320"
                className="h-full w-full"
                role="presentation"
            >
                <defs>
                    <linearGradient
                        id="gdc-container-a"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                    >
                        <stop offset="0%" stopColor="var(--color-brand-400)" />
                        <stop
                            offset="100%"
                            stopColor="var(--color-brand-600)"
                        />
                    </linearGradient>
                    <linearGradient
                        id="gdc-container-b"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="var(--color-graphite-700)"
                        />
                        <stop
                            offset="100%"
                            stopColor="var(--color-graphite-900)"
                        />
                    </linearGradient>
                </defs>

                <g data-lift>
                    {/* Crane lines converging on the shared hook. */}
                    <g
                        stroke="var(--site-line)"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        <line x1="150" y1="0" x2="150" y2="40" />
                        <line x1="150" y1="40" x2="86" y2="92" />
                        <line x1="150" y1="40" x2="214" y2="92" />
                    </g>
                    <circle
                        cx="150"
                        cy="42"
                        r="6"
                        fill="var(--color-graphite-600)"
                    />

                    {/* Upper container — export. */}
                    <g data-swing="export" transform="translate(150 44)">
                        <g stroke="var(--site-line)" strokeWidth="2">
                            <line x1="-58" y1="0" x2="-58" y2="46" />
                            <line x1="58" y1="0" x2="58" y2="46" />
                        </g>
                        <g transform="translate(-78 46)">
                            <rect
                                width="156"
                                height="62"
                                rx="4"
                                fill="url(#gdc-container-a)"
                            />
                            {/* Corrugation. */}
                            <g stroke="rgb(255 255 255 / 0.22)" strokeWidth="2">
                                {[16, 28, 40, 116, 128, 140].map((x) => (
                                    <line
                                        key={x}
                                        x1={x}
                                        y1="8"
                                        x2={x}
                                        y2="54"
                                    />
                                ))}
                            </g>
                            <rect
                                width="156"
                                height="62"
                                rx="4"
                                fill="none"
                                stroke="rgb(0 0 0 / 0.18)"
                                strokeWidth="2"
                            />
                            <text
                                x="78"
                                y="38"
                                textAnchor="middle"
                                className="fill-white font-display text-[17px] font-bold tracking-[0.08em]"
                            >
                                {t('EXPORT')}
                            </text>
                        </g>
                    </g>

                    {/* Lower container — import, hung slightly off-centre. */}
                    <g data-swing="import" transform="translate(128 150)">
                        <g stroke="var(--site-line)" strokeWidth="2">
                            <line x1="-52" y1="0" x2="-52" y2="40" />
                            <line x1="52" y1="0" x2="52" y2="40" />
                        </g>
                        <g transform="translate(-72 40)">
                            <rect
                                width="144"
                                height="58"
                                rx="4"
                                fill="url(#gdc-container-b)"
                            />
                            <g stroke="rgb(255 255 255 / 0.14)" strokeWidth="2">
                                {[14, 26, 38, 106, 118, 130].map((x) => (
                                    <line
                                        key={x}
                                        x1={x}
                                        y1="8"
                                        x2={x}
                                        y2="50"
                                    />
                                ))}
                            </g>
                            <rect
                                width="144"
                                height="58"
                                rx="4"
                                fill="none"
                                stroke="rgb(0 0 0 / 0.22)"
                                strokeWidth="2"
                            />
                            <text
                                x="72"
                                y="36"
                                textAnchor="middle"
                                className="fill-white font-display text-[16px] font-bold tracking-[0.08em]"
                            >
                                {t('IMPORT')}
                            </text>
                        </g>
                    </g>
                </g>
            </svg>
        </div>
    );
}
