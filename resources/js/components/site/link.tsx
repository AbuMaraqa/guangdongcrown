import { Link as InertiaLink } from '@inertiajs/react';
import type { ComponentProps } from 'react';
import { useLocalePath } from '@/hooks/use-locale-path';

/**
 * Inertia's Link, with the active language applied to the URL.
 *
 * Public pages are written with clean paths (`/catalogue`). Using this in
 * place of the Inertia import keeps a visitor reading Arabic on the Arabic
 * site instead of dropping them back onto English on the next click.
 */
export function Link({ href, ...props }: ComponentProps<typeof InertiaLink>) {
    const localize = useLocalePath();

    return (
        <InertiaLink
            href={typeof href === 'string' ? localize(href) : href}
            {...props}
        />
    );
}
