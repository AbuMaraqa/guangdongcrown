import { Globe } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';

/**
 * Language switcher.
 *
 * Each option is a real link to the equivalent URL in that language — built
 * server-side by mcamara — so switching keeps the visitor on the page they
 * were reading, and search engines can crawl every translation.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
    const { t, locales, locale } = useTranslations();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        const onClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);

        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    if (locales.length < 2) {
        return null;
    }

    const active = locales.find((option) => option.current);

    return (
        <div ref={ref} className={cn('relative', className)}>
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-haspopup="true"
                aria-label={t('Change language')}
                className="flex items-center gap-2 rounded-sm px-2.5 py-2 text-sm text-[var(--site-muted)] transition-colors hover:text-[var(--site-fg)]"
            >
                <Globe aria-hidden="true" className="size-4" />
                <span className="font-medium">{active?.native ?? locale}</span>
            </button>

            {open && (
                <ul
                    className="absolute end-0 top-full z-50 mt-1 min-w-40 border border-[var(--site-line)] bg-[var(--site-surface)] py-1 shadow-[0_18px_40px_-24px_rgb(0_0_0/0.4)]"
                    role="menu"
                >
                    {locales.map((option) => (
                        <li key={option.code} role="none">
                            <a
                                href={option.url}
                                lang={option.code}
                                dir={option.direction}
                                role="menuitem"
                                aria-current={option.current ? 'true' : undefined}
                                className={cn(
                                    'block px-4 py-2.5 text-sm transition-colors hover:bg-[var(--color-graphite-100)]',
                                    option.current
                                        ? 'text-[var(--site-accent)]'
                                        : 'text-[var(--site-fg)]',
                                )}
                            >
                                {option.native}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
