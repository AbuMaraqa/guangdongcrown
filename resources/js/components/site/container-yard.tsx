import { useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/animation/gsap';
import { useIsomorphicLayoutEffect } from '@/animation/use-reveal';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';

/**
 * A container terminal drawn as a flat technical elevation: a rail-mounted
 * gantry straddling four stacks, lowering one more box onto the short one.
 *
 * Vector rather than photography so it scales to any band width, inherits the
 * brand palette, reads on both the light and inverted surfaces, and can be
 * animated a piece at a time. Every tween is `transform` or `opacity` only.
 *
 * The static markup is already a sensible picture — a crane holding a
 * container over the yard — so the section is intact without JavaScript and
 * under `prefers-reduced-motion`.
 */

const VIEW_WIDTH = 1200;
const VIEW_HEIGHT = 440;

/** Quay level: every stack and both crane legs stand on this line. */
const DECK_Y = 400;
const RAIL_Y = 424;

/** ISO 20ft proportions, near enough: 6.06m x 2.59m is a 2.34:1 elevation. */
const BOX_WIDTH = 196;
const BOX_HEIGHT = 84;

/** Left edge of the first stack, and the centre-to-centre stack spacing. */
const YARD_X = 190;
const STACK_PITCH = 208;

const BOOM_TOP = 40;
const BOOM_BOTTOM = 62;
const BOOM_START = 30;
const BOOM_END = VIEW_WIDTH - 30;

const LEG_TOP_HALF = 26;
const LEG_BASE_HALF = 46;
const LEFT_LEG_X = 96;
const RIGHT_LEG_X = VIEW_WIDTH - 96;

/** Row index counted up from the deck: 0 sits on the ground. */
function rowY(row: number): number {
    return DECK_Y - (row + 1) * BOX_HEIGHT;
}

function stackX(index: number): number {
    return YARD_X + index * STACK_PITCH;
}

/** The trolley parks over the third stack — the one waiting for a box. */
const TROLLEY_X = stackX(2) + BOX_WIDTH / 2;
const CABLE_TOP = 86;
const CABLE_REST = 36;
const SPREADER_Y = CABLE_TOP + CABLE_REST;
const SPREADER_HALF = 100;

/** The payload starts on the hook and ends as row 1 of the third stack. */
const PAYLOAD_X = stackX(2);
const PAYLOAD_Y = SPREADER_Y + 14;
const HOIST_TRAVEL = rowY(1) - PAYLOAD_Y;
const CABLE_SCALE = (CABLE_REST + HOIST_TRAVEL) / CABLE_REST;

/** Origin for everything that pivots or pays out from the trolley. */
const HOIST_ORIGIN = `${TROLLEY_X} ${CABLE_TOP}`;

/** How far the empty trolley wanders once it has set the box down. */
const TRAVERSE_DISTANCE = -430;

type Tone = 'accent' | 'steel' | 'silver';

type Box = {
    stack: number;
    row: number;
    tone: Tone;
    label?: string;
    mark?: string;
};

/**
 * Ordered by row so the entrance stagger builds the yard from the ground up
 * rather than one stack at a time. The boxes never overlap, so paint order is
 * free to serve the animation.
 */
const BOXES: Box[] = [
    { stack: 0, row: 0, tone: 'steel' },
    { stack: 1, row: 0, tone: 'silver' },
    { stack: 2, row: 0, tone: 'steel' },
    { stack: 3, row: 0, tone: 'accent', mark: "40' HC" },
    { stack: 0, row: 1, tone: 'accent', label: 'IMPORT' },
    { stack: 1, row: 1, tone: 'steel', mark: "20' GP" },
    { stack: 3, row: 1, tone: 'silver' },
    { stack: 1, row: 2, tone: 'silver' },
];

/** Corrugation ribs, at roughly the pitch of a real container side panel. */
const RIBS = Array.from({ length: 16 }, (_, index) => 12 + index * 11);

const TONE_FILL: Record<Tone, string> = {
    accent: 'url(#gdc-yard-accent)',
    steel: 'url(#gdc-yard-steel)',
    silver: 'url(#gdc-yard-silver)',
};

function ContainerBox({
    x,
    y,
    tone,
    label,
    mark,
}: {
    x: number;
    y: number;
    tone: Tone;
    label?: string;
    mark?: string;
}) {
    return (
        <g transform={`translate(${x} ${y})`}>
            <rect
                width={BOX_WIDTH}
                height={BOX_HEIGHT}
                rx="2"
                fill={TONE_FILL[tone]}
            />

            <g stroke="rgb(255 255 255 / 0.10)" strokeWidth="3">
                {RIBS.map((rib) => (
                    <line
                        key={rib}
                        x1={rib}
                        y1="14"
                        x2={rib}
                        y2={BOX_HEIGHT - 14}
                    />
                ))}
            </g>

            {/* Top and bottom rails catch the light differently. */}
            <rect width={BOX_WIDTH} height="9" fill="rgb(255 255 255 / 0.12)" />
            <rect
                y={BOX_HEIGHT - 9}
                width={BOX_WIDTH}
                height="9"
                fill="rgb(0 0 0 / 0.16)"
            />

            {/* Door end: cross member, two leaves and their locking bars. */}
            <g stroke="rgb(0 0 0 / 0.22)" strokeWidth="1.5">
                <line x1="140" y1="4" x2="140" y2={BOX_HEIGHT - 4} />
                <line x1="168" y1="12" x2="168" y2={BOX_HEIGHT - 12} />
                <line x1="152" y1="18" x2="152" y2={BOX_HEIGHT - 18} />
                <line x1="184" y1="18" x2="184" y2={BOX_HEIGHT - 18} />
            </g>

            {/* Corner castings. */}
            <g fill="rgb(0 0 0 / 0.22)">
                {[
                    [0, 0],
                    [BOX_WIDTH - 16, 0],
                    [0, BOX_HEIGHT - 11],
                    [BOX_WIDTH - 16, BOX_HEIGHT - 11],
                ].map(([cx, cy]) => (
                    <rect
                        key={`${cx}-${cy}`}
                        x={cx}
                        y={cy}
                        width="16"
                        height="11"
                    />
                ))}
            </g>

            <rect
                width={BOX_WIDTH}
                height={BOX_HEIGHT}
                rx="2"
                fill="none"
                stroke="rgb(0 0 0 / 0.24)"
                strokeWidth="1.5"
            />

            {label && (
                <text
                    x="70"
                    y={BOX_HEIGHT / 2 + 5}
                    textAnchor="middle"
                    className="fill-white/90 font-display text-[15px] font-bold tracking-[0.14em]"
                >
                    {label}
                </text>
            )}

            {mark && (
                <text
                    x="10"
                    y={BOX_HEIGHT - 16}
                    className="fill-white/45 font-mono text-[10px] tracking-[0.08em]"
                >
                    {mark}
                </text>
            )}
        </g>
    );
}

/** One portal leg, tapering outward toward its bogies. */
function CraneLeg({ cx }: { cx: number }) {
    const half = (y: number) =>
        LEG_TOP_HALF +
        ((LEG_BASE_HALF - LEG_TOP_HALF) * (y - BOOM_BOTTOM)) /
            (DECK_Y - BOOM_BOTTOM);

    const lattice = Array.from({ length: 7 }, (_, index) => {
        const y = BOOM_BOTTOM + ((DECK_Y - BOOM_BOTTOM) / 6) * index;
        const x = index % 2 === 0 ? cx - half(y) : cx + half(y);

        return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return (
        <g>
            <path
                d={lattice}
                fill="none"
                stroke="var(--site-muted)"
                strokeWidth="1.5"
                opacity="0.55"
            />
            <g stroke="var(--site-fg)" strokeWidth="3" opacity="0.75">
                <line
                    x1={cx - LEG_TOP_HALF}
                    y1={BOOM_BOTTOM}
                    x2={cx - LEG_BASE_HALF}
                    y2={DECK_Y}
                />
                <line
                    x1={cx + LEG_TOP_HALF}
                    y1={BOOM_BOTTOM}
                    x2={cx + LEG_BASE_HALF}
                    y2={DECK_Y}
                />
            </g>
            <rect
                x={cx - 58}
                y={DECK_Y}
                width="116"
                height="12"
                fill="var(--site-fg)"
                opacity="0.75"
            />
            <g fill="var(--site-muted)" opacity="0.7">
                {[-40, -14, 14, 40].map((offset) => (
                    <circle
                        key={offset}
                        cx={cx + offset}
                        cy={DECK_Y + 18}
                        r="6"
                    />
                ))}
            </g>
        </g>
    );
}

/** The boom: two chords with a lattice web zigzagging between them. */
function CraneBoom() {
    const points: string[] = [];

    for (let x = BOOM_START; x <= BOOM_END; x += 60) {
        points.push(`${x},${BOOM_TOP}`);
        points.push(`${Math.min(x + 30, BOOM_END)},${BOOM_BOTTOM}`);
    }

    return (
        <g>
            <path
                d={`M${points.join(' L')}`}
                fill="none"
                stroke="var(--site-muted)"
                strokeWidth="1.5"
                opacity="0.55"
            />
            <g stroke="var(--site-fg)" strokeWidth="3" opacity="0.75">
                <line
                    x1={BOOM_START}
                    y1={BOOM_TOP}
                    x2={BOOM_END}
                    y2={BOOM_TOP}
                />
                <line
                    x1={BOOM_START}
                    y1={BOOM_BOTTOM}
                    x2={BOOM_END}
                    y2={BOOM_BOTTOM}
                />
                <line
                    x1={BOOM_START}
                    y1={BOOM_TOP}
                    x2={BOOM_START}
                    y2={BOOM_BOTTOM}
                />
                <line
                    x1={BOOM_END}
                    y1={BOOM_TOP}
                    x2={BOOM_END}
                    y2={BOOM_BOTTOM}
                />
            </g>
        </g>
    );
}

export function ContainerYard({ className }: { className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const { t } = useTranslations();

    useIsomorphicLayoutEffect(() => {
        const element = ref.current;

        if (!element || prefersReducedMotion()) {
            return;
        }

        const context = gsap.context(() => {
            // Built paused so they belong to this context and get reverted
            // with it; the entrance hands over to them when it finishes.
            const traverse = gsap.to('[data-trolley]', {
                x: TRAVERSE_DISTANCE,
                duration: 9,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
                paused: true,
            });

            const idleSway = gsap.fromTo(
                '[data-sway]',
                { rotate: -1.3 },
                {
                    rotate: 1.3,
                    svgOrigin: HOIST_ORIGIN,
                    duration: 3.4,
                    ease: 'sine.inOut',
                    yoyo: true,
                    repeat: -1,
                    paused: true,
                },
            );

            const timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: element,
                    start: 'top 78%',
                    once: true,
                },
                onComplete: () => {
                    traverse.play();
                    idleSway.play();
                },
            });

            timeline
                .from('[data-backdrop]', { opacity: 0, duration: 1.2 }, 0)
                .from(
                    '[data-crane]',
                    { opacity: 0, y: -26, duration: 1.1 },
                    0.1,
                )
                // Ground up: the stagger follows row order, not stack order.
                .from(
                    '[data-box]',
                    { opacity: 0, y: 46, duration: 0.85, stagger: 0.07 },
                    0.35,
                )
                // Trolley and its load travel in together from off-frame.
                .from(
                    ['[data-trolley]', '[data-payload]'],
                    { x: 300, opacity: 0, duration: 1.5, ease: 'power2.out' },
                    0.7,
                )
                // Lowering: the cable pays out while spreader and box descend.
                .to(
                    '[data-cable]',
                    {
                        scaleY: CABLE_SCALE,
                        svgOrigin: HOIST_ORIGIN,
                        duration: 2.1,
                        ease: 'power2.inOut',
                    },
                    2.1,
                )
                .to(
                    ['[data-spreader]', '[data-payload]'],
                    { y: HOIST_TRAVEL, duration: 2.1, ease: 'power2.inOut' },
                    2.1,
                )
                // `elastic.out` is a damped pendulum — the load settles on the
                // way down instead of stopping dead.
                .fromTo(
                    ['[data-sway]', '[data-payload]'],
                    { rotate: 2.4 },
                    {
                        rotate: 0,
                        svgOrigin: HOIST_ORIGIN,
                        duration: 3,
                        ease: 'elastic.out(1, 0.4)',
                    },
                    2.1,
                )
                // Twistlocks release; the empty spreader is hoisted back up.
                .to(
                    '[data-cable]',
                    {
                        scaleY: 1,
                        svgOrigin: HOIST_ORIGIN,
                        duration: 1.6,
                        ease: 'power2.inOut',
                    },
                    4.7,
                )
                .to(
                    '[data-spreader]',
                    { y: 0, duration: 1.6, ease: 'power2.inOut' },
                    4.7,
                );

            // A shallow drift on the backdrop only — moving the crane would
            // lift its legs off the deck line it shares with the stacks.
            gsap.fromTo(
                '[data-backdrop]',
                { y: -12 },
                {
                    y: 12,
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
    }, []);

    return (
        <div
            ref={ref}
            className={cn(
                'w-full overflow-hidden',
                'aspect-[16/10] sm:aspect-[2/1] lg:aspect-[1200/440]',
                className,
            )}
        >
            <svg
                viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
                preserveAspectRatio="xMidYMid slice"
                className="h-full w-full"
                role="img"
                aria-label={t(
                    'A gantry crane lowering a freight container onto a stack in a container yard',
                )}
            >
                <defs>
                    <linearGradient
                        id="gdc-yard-accent"
                        x1="0"
                        y1="0"
                        x2="0.4"
                        y2="1"
                    >
                        <stop offset="0%" stopColor="var(--color-brand-500)" />
                        <stop
                            offset="100%"
                            stopColor="var(--color-brand-700)"
                        />
                    </linearGradient>
                    <linearGradient
                        id="gdc-yard-steel"
                        x1="0"
                        y1="0"
                        x2="0.4"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="var(--color-graphite-600)"
                        />
                        <stop
                            offset="100%"
                            stopColor="var(--color-graphite-700)"
                        />
                    </linearGradient>
                    <linearGradient
                        id="gdc-yard-silver"
                        x1="0"
                        y1="0"
                        x2="0.4"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="var(--color-graphite-400)"
                        />
                        <stop
                            offset="100%"
                            stopColor="var(--color-graphite-500)"
                        />
                    </linearGradient>
                    <radialGradient id="gdc-yard-glow">
                        <stop
                            offset="0%"
                            stopColor="var(--site-accent)"
                            stopOpacity="0.16"
                        />
                        <stop
                            offset="100%"
                            stopColor="var(--site-accent)"
                            stopOpacity="0"
                        />
                    </radialGradient>
                    <pattern
                        id="gdc-yard-grid"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M 40 0 L 0 0 0 40"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="0.6"
                            className="text-[var(--site-line)]"
                        />
                    </pattern>
                    <linearGradient
                        id="gdc-yard-fade"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop offset="0%" stopColor="#000000" />
                        <stop offset="60%" stopColor="#ffffff" />
                    </linearGradient>
                    <mask id="gdc-yard-mask">
                        <rect
                            width={VIEW_WIDTH}
                            height={RAIL_Y}
                            fill="url(#gdc-yard-fade)"
                        />
                    </mask>
                </defs>

                <g data-backdrop>
                    <rect
                        width={VIEW_WIDTH}
                        height={RAIL_Y}
                        fill="url(#gdc-yard-grid)"
                        mask="url(#gdc-yard-mask)"
                    />
                    <ellipse
                        cx={TROLLEY_X}
                        cy="300"
                        rx="460"
                        ry="220"
                        fill="url(#gdc-yard-glow)"
                    />
                </g>

                <g data-crane>
                    <CraneBoom />
                    <CraneLeg cx={LEFT_LEG_X} />
                    <CraneLeg cx={RIGHT_LEG_X} />

                    <g data-trolley>
                        {/* One frame straddling the boom: a beam on the top
                            chord, side plates down past it, hoist underneath. */}
                        <g fill="var(--site-fg)" opacity="0.72">
                            <rect
                                x={TROLLEY_X - 84}
                                y={BOOM_TOP - 24}
                                width="168"
                                height="24"
                                rx="2"
                            />
                            <rect
                                x={TROLLEY_X - 84}
                                y={BOOM_TOP - 24}
                                width="12"
                                height={CABLE_TOP - BOOM_TOP + 24}
                            />
                            <rect
                                x={TROLLEY_X + 72}
                                y={BOOM_TOP - 24}
                                width="12"
                                height={CABLE_TOP - BOOM_TOP + 24}
                            />
                            <rect
                                x={TROLLEY_X - 44}
                                y={BOOM_BOTTOM}
                                width="88"
                                height={CABLE_TOP - BOOM_BOTTOM}
                                rx="2"
                            />
                        </g>
                        <g fill="var(--site-muted)">
                            {[-60, -28, 28, 60].map((offset) => (
                                <circle
                                    key={offset}
                                    cx={TROLLEY_X + offset}
                                    cy={BOOM_TOP}
                                    r="6"
                                />
                            ))}
                        </g>

                        <g data-sway>
                            <g data-cable>
                                {/* Vertical lines, so `scaleY` pays the cable
                                    out without distorting its thickness. */}
                                <g
                                    stroke="var(--site-fg)"
                                    strokeWidth="2.5"
                                    opacity="0.65"
                                >
                                    <line
                                        x1={TROLLEY_X - 78}
                                        y1={CABLE_TOP}
                                        x2={TROLLEY_X - 78}
                                        y2={SPREADER_Y}
                                    />
                                    <line
                                        x1={TROLLEY_X + 78}
                                        y1={CABLE_TOP}
                                        x2={TROLLEY_X + 78}
                                        y2={SPREADER_Y}
                                    />
                                </g>
                            </g>

                            <g data-spreader>
                                <rect
                                    x={TROLLEY_X - SPREADER_HALF}
                                    y={SPREADER_Y}
                                    width={SPREADER_HALF * 2}
                                    height="14"
                                    rx="2"
                                    fill="var(--site-accent)"
                                    stroke="rgb(0 0 0 / 0.28)"
                                    strokeWidth="1.5"
                                />
                                <g fill="var(--site-accent)">
                                    <rect
                                        x={TROLLEY_X - SPREADER_HALF - 4}
                                        y={SPREADER_Y - 4}
                                        width="14"
                                        height="22"
                                        rx="1"
                                    />
                                    <rect
                                        x={TROLLEY_X + SPREADER_HALF - 10}
                                        y={SPREADER_Y - 4}
                                        width="14"
                                        height="22"
                                        rx="1"
                                    />
                                </g>
                            </g>
                        </g>
                    </g>
                </g>

                {BOXES.map((box) => (
                    <g data-box key={`${box.stack}-${box.row}`}>
                        <ContainerBox
                            x={stackX(box.stack)}
                            y={rowY(box.row)}
                            tone={box.tone}
                            label={box.label ? t(box.label) : undefined}
                            mark={box.mark}
                        />
                    </g>
                ))}

                {/* Outside the trolley group: once it lands, it stays put. */}
                <g data-payload>
                    <ContainerBox
                        x={PAYLOAD_X}
                        y={PAYLOAD_Y}
                        tone="accent"
                        label={t('EXPORT')}
                    />
                </g>

                <g stroke="var(--site-fg)">
                    <line
                        x1="0"
                        y1={DECK_Y}
                        x2={VIEW_WIDTH}
                        y2={DECK_Y}
                        strokeWidth="2"
                        opacity="0.55"
                    />
                    <line
                        x1="0"
                        y1={RAIL_Y}
                        x2={VIEW_WIDTH}
                        y2={RAIL_Y}
                        strokeWidth="1.5"
                        opacity="0.25"
                    />
                </g>
            </svg>
        </div>
    );
}
