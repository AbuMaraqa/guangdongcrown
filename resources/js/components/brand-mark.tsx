import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

type Brand = {
    name: string;
    logo: string | null;
    logoInverse: string | null;
};

/**
 * The company mark, used wherever the app needs to identify itself: the
 * sign-in screen, the dashboard rail and the public header.
 *
 * Reads the logo uploaded in Settings → Company. Until one is uploaded it
 * falls back to a typographic wordmark rather than a placeholder graphic, so
 * the screen never shows someone else's branding.
 */
export function BrandMark({
    className,
    inverted = false,
}: {
    className?: string;
    inverted?: boolean;
}) {
    const page = usePage();
    const brand = page.props.brand as Brand | undefined;
    const name =
        brand?.name ?? (page.props.name as string) ?? 'Guang Dong Crown';
    const logo = inverted ? (brand?.logoInverse ?? brand?.logo) : brand?.logo;

    if (logo) {
        return (
            <img
                src={logo}
                alt={name}
                className={cn('w-auto object-contain', className)}
            />
        );
    }

    const [first, ...rest] = name.split(' ');

    return (
        <span
            className={cn(
                'font-display leading-none font-semibold tracking-tight',
                className,
            )}
        >
            {first}
            {rest.length > 0 && (
                <span className="ms-1.5 text-[oklch(0.655_0.115_207)]">
                    {rest.join(' ')}
                </span>
            )}
        </span>
    );
}
