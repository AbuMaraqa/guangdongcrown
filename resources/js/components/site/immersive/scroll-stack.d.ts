import type { CSSProperties, ReactNode } from 'react';

export type ScrollStackProps = {
    children?: ReactNode;
    className?: string;
    /** Gap between cards before they pin, in px. */
    itemDistance?: number;
    /** Vertical offset between pinned cards, in px. */
    itemStackDistance?: number;
    /** Where the first card pins, as px or a percentage of the viewport. */
    stackPosition?: string | number;
    itemScale?: number;
    baseScale?: number;
    dimAmount?: number;
    blurAmount?: number;
    tiltAmount?: number;
    rotationAmount?: number;
    /** Extra scroll after the last card lands, in px. */
    holdDistance?: number;
    /** Glide wheel input; leave off when the page already uses Lenis. */
    smoothScroll?: boolean;
    snap?: boolean;
    useWindowScroll?: boolean;
    onStackComplete?: () => void;
};

export type ScrollStackItemProps = {
    children?: ReactNode;
    itemClassName?: string;
    style?: CSSProperties;
};

export function ScrollStackItem(props: ScrollStackItemProps): ReactNode;

export default function ScrollStack(props: ScrollStackProps): ReactNode;
