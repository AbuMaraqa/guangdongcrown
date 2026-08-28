import { Link, router, usePage } from '@inertiajs/react';
import {
    ChevronsUpDown,
    ExternalLink,
    Inbox,
    LayoutDashboard,
    LogOut,
    Image as MediaIcon,
    Menu,
    Settings,
    UserCog,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { AdminIcon } from '@/components/admin/admin-icon';
import AppearanceToggleTab from '@/components/appearance-tabs';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth';

type AdminShared = {
    navigation: Record<string, { key: string; label: string; icon: string }[]>;
    unreadInquiries: number;
};

type StaticLink = {
    label: string;
    href: string;
    icon: LucideIcon;
    ability?: string;
    badge?: number;
};

/**
 * Dashboard chrome: a fixed rail on desktop, a slide-over on mobile, and a
 * top bar carrying the page title slot, theme switch and account menu.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
    const page = usePage();
    const admin = page.props.admin as AdminShared | null;
    const user = page.props.auth.user as User;
    const abilities = (page.props.auth.abilities ?? []) as string[];
    const flash = page.props.flash as
        { success: string | null; error: string | null } | undefined;
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash?.error, flash?.success]);

    // Close the slide-over when an Inertia visit changes the page. Adjusting
    // state during render avoids the extra commit an effect would schedule.
    const [lastUrl, setLastUrl] = useState(page.url);

    if (page.url !== lastUrl) {
        setLastUrl(page.url);
        setMobileOpen(false);
    }

    const can = (ability?: string) =>
        !ability || abilities.includes('*') || abilities.includes(ability);

    const primary: StaticLink[] = [
        { label: 'Overview', href: '/admin', icon: LayoutDashboard },
        {
            label: 'Enquiries',
            href: '/admin/enquiries',
            icon: Inbox,
            ability: 'inquiries.view',
            badge: admin?.unreadInquiries,
        },
        {
            label: 'Media library',
            href: '/admin/media',
            icon: MediaIcon,
            ability: 'media.view',
        },
    ];

    const system: StaticLink[] = [
        {
            label: 'Settings',
            href: '/admin/settings',
            icon: Settings,
            ability: 'settings.view',
        },
        {
            label: 'Accounts',
            href: '/admin/users',
            icon: UserCog,
            ability: 'users.manage',
        },
    ];

    const sidebar = (
        <div className="flex h-full flex-col">
            <div className="flex h-16 shrink-0 items-center justify-between border-b px-5">
                <Link href="/admin" className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-md bg-primary font-semibold text-primary-foreground">
                        GC
                    </span>
                    <span className="text-sm leading-tight font-semibold">
                        {page.props.name as string}
                        <span className="block text-xs font-normal text-muted-foreground">
                            Content dashboard
                        </span>
                    </span>
                </Link>
                <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="-me-2 rounded-md p-2 hover:bg-accent lg:hidden"
                >
                    <span className="sr-only">Close navigation</span>
                    <X className="size-4" />
                </button>
            </div>

            <nav
                className="flex-1 space-y-6 overflow-y-auto px-3 py-5"
                aria-label="Dashboard"
            >
                <NavGroup>
                    {primary
                        .filter((link) => can(link.ability))
                        .map((link) => (
                            <NavLink
                                key={link.href}
                                href={link.href}
                                active={isActive(page.url, link.href)}
                                badge={link.badge}
                            >
                                <link.icon
                                    aria-hidden="true"
                                    className="size-4"
                                />
                                {link.label}
                            </NavLink>
                        ))}
                </NavGroup>

                {Object.entries(admin?.navigation ?? {}).map(
                    ([group, items]) => (
                        <NavGroup key={group} label={group}>
                            {items.map((item) => (
                                <NavLink
                                    key={item.key}
                                    href={`/admin/content/${item.key}`}
                                    active={isActive(
                                        page.url,
                                        `/admin/content/${item.key}`,
                                    )}
                                >
                                    <AdminIcon name={item.icon} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </NavGroup>
                    ),
                )}

                {system.some((link) => can(link.ability)) && (
                    <NavGroup label="System">
                        {system
                            .filter((link) =>
                                link.ability === 'users.manage'
                                    ? abilities.includes('*')
                                    : can(link.ability),
                            )
                            .map((link) => (
                                <NavLink
                                    key={link.href}
                                    href={link.href}
                                    active={isActive(page.url, link.href)}
                                >
                                    <link.icon
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                    {link.label}
                                </NavLink>
                            ))}
                    </NavGroup>
                )}
            </nav>

            <div className="border-t p-3">
                <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                    <ExternalLink aria-hidden="true" className="size-4" />
                    View website
                </a>
            </div>
        </div>
    );

    return (
        <div className="min-h-dvh bg-muted/30">
            <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 border-e bg-background lg:block">
                {sidebar}
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        aria-label="Close navigation"
                        onClick={() => setMobileOpen(false)}
                        className="absolute inset-0 bg-black/50"
                    />
                    <aside className="absolute inset-y-0 start-0 w-72 animate-in border-e bg-background duration-200 slide-in-from-left">
                        {sidebar}
                    </aside>
                </div>
            )}

            <div className="lg:ps-64">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/85 px-4 backdrop-blur-lg sm:px-6">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className="-ms-2 rounded-md p-2 hover:bg-accent lg:hidden"
                    >
                        <span className="sr-only">Open navigation</span>
                        <Menu className="size-5" />
                    </button>

                    <div id="admin-topbar" className="min-w-0 flex-1" />

                    <div className="flex items-center gap-2">
                        <AppearanceToggleTab className="hidden sm:flex" />

                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent">
                                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                    {initials(user.name)}
                                </span>
                                <span className="hidden text-start leading-tight sm:block">
                                    <span className="block font-medium">
                                        {user.name}
                                    </span>
                                    <span className="block text-xs text-muted-foreground">
                                        {String(user.role ?? '').replace(
                                            '_',
                                            ' ',
                                        )}
                                    </span>
                                </span>
                                <ChevronsUpDown
                                    aria-hidden="true"
                                    className="size-3.5 opacity-50"
                                />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-normal">
                                    <span className="block text-sm font-medium">
                                        {user.name}
                                    </span>
                                    <span className="block text-xs text-muted-foreground">
                                        {user.email}
                                    </span>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/settings/profile">
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings/security">
                                        Security
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onSelect={() => router.post('/logout')}
                                    className="text-destructive"
                                >
                                    <LogOut
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}

function NavGroup({
    label,
    children,
}: {
    label?: string;
    children: ReactNode;
}) {
    return (
        <div>
            {label && (
                <p className="px-3 pb-2 text-[0.6875rem] font-semibold tracking-widest text-muted-foreground uppercase">
                    {label}
                </p>
            )}
            <ul className="space-y-0.5">{children}</ul>
        </div>
    );
}

function NavLink({
    href,
    active,
    badge,
    children,
}: {
    href: string;
    active: boolean;
    badge?: number;
    children: ReactNode;
}) {
    return (
        <li>
            <Link
                href={href}
                className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    active
                        ? 'bg-primary font-medium text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
            >
                {children}
                {badge !== undefined && badge > 0 && (
                    <Badge
                        variant={active ? 'secondary' : 'default'}
                        className="ms-auto h-5 px-1.5"
                    >
                        {badge}
                    </Badge>
                )}
            </Link>
        </li>
    );
}

function isActive(url: string, href: string): boolean {
    const path = url.split('?')[0];

    return href === '/admin' ? path === '/admin' : path.startsWith(href);
}

function initials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}
