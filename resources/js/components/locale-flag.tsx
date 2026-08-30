import { useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * Flag icons for the language switcher.
 *
 * These are drawn here rather than pulled from a package: mcamara's
 * localization package stores locale metadata only and ships no artwork, and
 * emoji flags are not an option because Windows renders them as bare letters.
 * Inline SVG stays crisp at any size, needs no network request, and is not
 * blocked by the CSP.
 *
 * Which flag stands for which language is a config decision — see the `flag`
 * key in config/laravellocalization.php.
 */

/** Points of a five-pointed star, `rotation` degrees clockwise from upright. */
function star(cx: number, cy: number, radius: number, rotation = 0): string {
    const inner = radius * 0.38197; // sin(18°)/sin(126°)
    const points: string[] = [];

    for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? radius : inner;
        const angle = ((i * 36 + rotation - 90) * Math.PI) / 180;
        points.push(
            `${(cx + r * Math.cos(angle)).toFixed(3)},${(cy + r * Math.sin(angle)).toFixed(3)}`,
        );
    }

    return points.join(' ');
}

/** Angle a small star must be rotated through to point at the large one. */
function facing(cx: number, cy: number): number {
    return (Math.atan2(5 - cy, 5 - cx) * 180) / Math.PI + 90;
}

type FlagProps = { title: string };

const FLAGS: Record<
    string,
    (props: FlagProps & { id: string }) => React.ReactElement
> = {
    // Union Jack. The diagonals need clipping so the red saltire sits in the
    // correct half of each white one; the clip id must be unique per render.
    GB: ({ id }) => (
        <>
            <clipPath id={id}>
                <path d="M15,0 h15 v10 z v10 h-15 z h-15 v-10 z v-10 h15 z" />
            </clipPath>
            <rect width="30" height="20" fill="#012169" />
            <path d="M0,0 L30,20 M30,0 L0,20" stroke="#fff" strokeWidth="4" />
            <path
                d="M0,0 L30,20 M30,0 L0,20"
                clipPath={`url(#${id})`}
                stroke="#C8102E"
                strokeWidth="2.4"
            />
            <path d="M15,0 v20 M0,10 h30" stroke="#fff" strokeWidth="6.6" />
            <path d="M15,0 v20 M0,10 h30" stroke="#C8102E" strokeWidth="4" />
        </>
    ),
    // Palestine: three equal bands with a red triangle at the hoist.
    PS: () => (
        <>
            <rect width="30" height="6.667" fill="#000" />
            <rect y="6.667" width="30" height="6.667" fill="#fff" />
            <rect y="13.333" width="30" height="6.667" fill="#007A3D" />
            <path d="M0,0 L13,10 L0,20 z" fill="#CE1126" />
        </>
    ),
    // People's Republic of China, laid out to the official 30×20 construction.
    CN: () => (
        <>
            <rect width="30" height="20" fill="#EE1C25" />
            <polygon points={star(5, 5, 3)} fill="#FFDE00" />
            <polygon points={star(10, 2, 1, facing(10, 2))} fill="#FFDE00" />
            <polygon points={star(12, 4, 1, facing(12, 4))} fill="#FFDE00" />
            <polygon points={star(12, 7, 1, facing(12, 7))} fill="#FFDE00" />
            <polygon points={star(10, 9, 1, facing(10, 9))} fill="#FFDE00" />
        </>
    ),
    // United Arab Emirates.
    AE: () => (
        <>
            <rect width="30" height="6.667" fill="#00732F" />
            <rect y="6.667" width="30" height="6.667" fill="#fff" />
            <rect y="13.333" width="30" height="6.667" fill="#000" />
            <rect width="7.5" height="20" fill="#FF0000" />
        </>
    ),
    // Saudi Arabia, simplified to the field and sword — the shahada is
    // calligraphy and is not reproduced at icon size.
    SA: () => (
        <>
            <rect width="30" height="20" fill="#006C35" />
            <rect x="7" y="13" width="16" height="1.2" rx="0.6" fill="#fff" />
            <path d="M7,13.6 L5,12.2 v2.8 z" fill="#fff" />
        </>
    ),
};

export function LocaleFlag({
    region,
    label,
    className,
}: {
    region: string;
    label: string;
    className?: string;
}) {
    const id = useId();
    const code = region.toUpperCase();
    const Flag = FLAGS[code];

    const shared = cn(
        // A hairline keeps flags with white edges readable on a white surface.
        'inline-block h-3.5 w-5 shrink-0 rounded-[2px] ring-1 ring-black/10 dark:ring-white/15',
        className,
    );

    // Any language whose flag has not been drawn yet degrades to its region
    // code, which reads as deliberate rather than as a missing image.
    if (!Flag) {
        return (
            <span
                role="img"
                aria-label={label}
                className={cn(
                    shared,
                    'force-ltr grid place-items-center bg-muted text-[8px] leading-none font-semibold text-muted-foreground',
                )}
            >
                {code}
            </span>
        );
    }

    return (
        <svg
            viewBox="0 0 30 20"
            className={shared}
            role="img"
            aria-label={label}
            preserveAspectRatio="xMidYMid slice"
        >
            <title>{label}</title>
            <Flag title={label} id={id} />
        </svg>
    );
}
