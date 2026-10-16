import crownMark from '@/animation/scenes/crown-mark.svg?raw';
import { useScene } from '@/animation/use-scene';
import { cn } from '@/lib/utils';

export type ElectricMarkOptions = {
    color?: string;
    glowColor?: string;
    scale?: number;
    intensity?: number;
    glow?: number;
    thickness?: number;
    strands?: number;
    bend?: number;
    crackle?: number;
    arcs?: number;
    flicker?: number;
    fill?: number;
    speed?: number;
    interactive?: boolean;
    cursorIntensity?: number;
    cursorRadius?: number;
    theme?: 'dark' | 'light';
};

const CROWN_MARK_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(crownMark)}`;

const loadElectricMark = (
    element: HTMLDivElement,
    options: ElectricMarkOptions,
) =>
    import('@/animation/scenes/electric-logo-scene').then(
        ({ mountElectricLogo }) => {
            const scene = mountElectricLogo(element, {
                ...options,
                src: CROWN_MARK_SRC,
            });

            return () => scene.destroy();
        },
    );

/**
 * The mark traced as a field of animated lightning (OGL / WebGL2). Hover
 * charges it, click sends a ripple. Shows the flat mark when WebGL2 is
 * unavailable.
 */
export function ElectricMark({
    className,
    ...options
}: ElectricMarkOptions & { className?: string }) {
    const ref = useScene(loadElectricMark, options);

    return (
        <div
            ref={ref}
            aria-hidden="true"
            className={cn(
                'group/electric relative size-full overflow-hidden',
                className,
            )}
        >
            <div className="absolute inset-0 hidden items-center justify-center group-data-[electric-logo-state=fallback]/electric:flex">
                <div
                    className="w-1/3 [&_svg]:size-full"
                    dangerouslySetInnerHTML={{ __html: crownMark }}
                />
            </div>
        </div>
    );
}
