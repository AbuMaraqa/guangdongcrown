import { router, usePage } from '@inertiajs/react';
import { Languages } from 'lucide-react';
import { LocaleFlag } from '@/components/locale-flag';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth';

/**
 * Interface language for the dashboard.
 *
 * Saved against the signed-in user rather than the URL: the language someone
 * works in is a personal preference, independent of which language of the
 * public site they happen to be editing.
 */
export function AdminLanguageSwitcher() {
    const { t, locales } = useTranslations();
    const user = usePage().props.auth.user as User;
    const active = (user.locale as string | null) ?? null;
    const selected =
        locales.find((option) => option.code === active) ??
        locales.find((option) => option.current);

    if (locales.length < 2) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={t('Change language')}
                className="inline-flex size-9 items-center justify-center rounded-md transition-colors hover:bg-accent"
            >
                {selected ? (
                    <LocaleFlag region={selected.flag} label={selected.name} />
                ) : (
                    <Languages aria-hidden="true" className="size-4" />
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>{t('Interface language')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {locales.map((option) => (
                    <DropdownMenuItem
                        key={option.code}
                        lang={option.code}
                        dir={option.direction}
                        onSelect={() =>
                            router.put(
                                '/admin/locale',
                                { locale: option.code },
                                { preserveScroll: true },
                            )
                        }
                        className={cn(
                            'text-start',
                            option.code === active &&
                                'font-medium text-primary',
                        )}
                    >
                        <LocaleFlag region={option.flag} label={option.name} />
                        <span>{option.native}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
