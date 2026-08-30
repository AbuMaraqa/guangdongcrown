import { usePage } from '@inertiajs/react';
import { ChevronDown, Menu, Phone, X } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { gsap, prefersReducedMotion } from '@/animation';
import { DynamicIcon } from '@/components/site/dynamic-icon';
import { LanguageSwitcher } from '@/components/site/language-switcher';
import { Link } from '@/components/site/link';
import { Container, SiteLink } from '@/components/site/primitives';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import type { NavEntry, SiteChrome } from '@/types/site';

type MenuLink = {
    label: string;
    href: string;
    description?: string | null;
    icon?: string | null;
};

type MenuGroup = {
    label: string;
    href: string;
    links?: MenuLink[];
    /** Optional promotional column shown on the right of the panel. */
    feature?: { title: string; body: string; href: string; cta: string };
};

function buildMenu(
    chrome: SiteChrome,
    t: (key: string) => string,
): MenuGroup[] {
    const { navigation } = chrome;

    const toLinks = (entries: NavEntry[], base: string): MenuLink[] =>
        entries.map((entry) => ({
            label: entry.name,
            href: `${base}/${entry.slug}`,
            description: entry.excerpt,
            icon: entry.icon,
        }));

    return [
        {
            label: t('Company'),
            href: '/about',
            links: [
                {
                    label: t('About us'),
                    href: '/about',
                    description: 'Who we are and how we operate.',
                },
                {
                    label: t('Global presence'),
                    href: '/global-presence',
                    description: 'Where we are and the markets we ship to.',
                },
                {
                    label: t('Our team'),
                    href: '/team',
                    description: 'The people accountable for your order.',
                },
                {
                    label: t('Insights'),
                    href: '/insights',
                    description: 'Technical notes and market commentary.',
                },
            ],
        },
        {
            label: t('Aluminium'),
            href: '/products',
            links: [
                {
                    label: t('Our products'),
                    href: '/our-products',
                    description: t('Systems grouped by application.'),
                },
                {
                    label: t('Catalogue'),
                    href: '/catalogue',
                    description: t('Profile drawings, page by page.'),
                },
                {
                    label: t('All products'),
                    href: '/products',
                    description: t('The full catalogue.'),
                },
                ...navigation.productCategories.map((category) => ({
                    label: category.name,
                    href: `/products?category=${category.slug}`,
                })),
            ],
            feature: {
                title: t('Need a specification checked?'),
                body: t(
                    'Send us a drawing or alloy requirement and we will confirm feasibility, tolerance and lead time.',
                ),
                href: '/request-a-quotation',
                cta: t('Request a quotation'),
            },
        },
        {
            label: t('Logistics'),
            href: '/logistics',
            links: [
                {
                    label: t('Logistics overview'),
                    href: '/logistics',
                    description: 'Freight, warehousing and inland transport.',
                },
                ...toLinks(navigation.services, '/capabilities'),
            ],
        },
        {
            label: t('Solutions'),
            href: '/solutions',
            links: [
                { label: t('All solutions'), href: '/solutions' },
                ...toLinks(navigation.solutions, '/solutions'),
                { label: t('Industries served'), href: '/industries' },
            ],
        },
        { label: t('Projects'), href: '/projects' },
        { label: t('Contact'), href: '/contact' },
    ];
}

function isCurrent(pathname: string, href: string): boolean {
    const target = href.split('?')[0];

    if (target === '/') {
        return pathname === '/';
    }

    return pathname === target || pathname.startsWith(`${target}/`);
}

export function SiteHeader({
    chrome,
    overlay,
}: {
    chrome: SiteChrome;
    overlay: boolean;
}) {
    const { url } = usePage();
    const { t } = useTranslations();
    const pathname = url.split('?')[0];
    const menu = buildMenu(chrome, t);

    const [scrolled, setScrolled] = useState(false);
    const [openGroup, setOpenGroup] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Dismiss any open menu when an Inertia visit changes the page. Adjusting
    // state during render avoids the extra commit an effect would schedule.
    const [lastUrl, setLastUrl] = useState(url);

    if (url !== lastUrl) {
        setLastUrl(url);
        setOpenGroup(null);
        setMobileOpen(false);
    }

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpenGroup(null);
                setMobileOpen(false);
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const openPanel = useCallback((label: string) => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
        }

        setOpenGroup(label);
    }, []);

    const schedulePanelClose = useCallback(() => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
        }

        closeTimer.current = setTimeout(() => setOpenGroup(null), 140);
    }, []);

    const transparent = overlay && !scrolled && !openGroup && !mobileOpen;

    return (
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-500',
                transparent
                    ? 'site-invert border-b border-transparent bg-transparent'
                    : 'border-b border-[var(--site-line)] bg-[var(--site-surface)]/92 backdrop-blur-xl',
            )}
            onMouseLeave={schedulePanelClose}
        >
            <Container width="wide">
                <div className="flex h-20 items-center justify-between gap-8 lg:h-24">
                    <Link
                        href="/"
                        className="flex shrink-0 items-center gap-3"
                        aria-label={`${chrome.company.name} — home`}
                    >
                        <Wordmark chrome={chrome} inverted={transparent} />
                    </Link>

                    <nav aria-label="Primary" className="hidden lg:block">
                        <ul className="flex items-center gap-1">
                            {menu.map((group) => (
                                <li key={group.label}>
                                    <MenuTrigger
                                        group={group}
                                        active={isCurrent(pathname, group.href)}
                                        open={openGroup === group.label}
                                        onOpen={() =>
                                            group.links
                                                ? openPanel(group.label)
                                                : setOpenGroup(null)
                                        }
                                        onClose={schedulePanelClose}
                                    />
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="flex items-center gap-3">
                        {chrome.company.phone && (
                            <a
                                href={`tel:${chrome.company.phone.replace(/\s+/g, '')}`}
                                className="hidden items-center gap-2 text-sm text-[var(--site-muted)] transition-colors hover:text-[var(--site-fg)] xl:flex"
                            >
                                <Phone aria-hidden="true" className="size-4" />
                                {chrome.company.phone}
                            </a>
                        )}
                        <SiteLink
                            href="/request-a-quotation"
                            className="hidden py-3 sm:inline-flex"
                            magnetic
                        >
                            {t('Request a quotation')}
                        </SiteLink>
                        <LanguageSwitcher className="hidden sm:block" />

                        <button
                            type="button"
                            onClick={() => setMobileOpen((open) => !open)}
                            aria-expanded={mobileOpen}
                            aria-controls="site-mobile-nav"
                            className="inline-flex size-11 items-center justify-center rounded-sm border border-[var(--site-line)] lg:hidden"
                        >
                            <span className="sr-only">
                                {mobileOpen ? t('Close menu') : t('Open menu')}
                            </span>
                            {mobileOpen ? (
                                <X className="size-5" />
                            ) : (
                                <Menu className="size-5" />
                            )}
                        </button>
                    </div>
                </div>
            </Container>

            {menu.map((group) =>
                group.links ? (
                    <MegaPanel
                        key={group.label}
                        group={group}
                        open={openGroup === group.label}
                        pathname={pathname}
                        onMouseEnter={() => openPanel(group.label)}
                        onMouseLeave={schedulePanelClose}
                    />
                ) : null,
            )}

            <MobileNav
                open={mobileOpen}
                menu={menu}
                chrome={chrome}
                pathname={pathname}
            />
        </header>
    );
}

function Wordmark({
    chrome,
    inverted,
}: {
    chrome: SiteChrome;
    inverted: boolean;
}) {
    const logo = inverted
        ? (chrome.company.logoInverse ?? chrome.company.logo)
        : chrome.company.logo;

    if (logo) {
        return (
            <img
                src={logo}
                alt={chrome.company.name}
                className="h-12 w-auto lg:h-16"
            />
        );
    }

    const [first, ...rest] = chrome.company.name.split(' ');

    return (
        <span className="font-display text-xl leading-none font-semibold tracking-tight lg:text-2xl">
            {first}
            {rest.length > 0 && (
                <span className="ms-1.5 text-[var(--site-accent)]">
                    {rest.join(' ')}
                </span>
            )}
        </span>
    );
}

function MenuTrigger({
    group,
    active,
    open,
    onOpen,
    onClose,
}: {
    group: MenuGroup;
    active: boolean;
    open: boolean;
    onOpen: () => void;
    onClose: () => void;
}) {
    const classes = cn(
        'group/nav relative flex items-center gap-1.5 rounded-sm px-3.5 py-2.5 text-sm font-medium transition-colors',
        active || open
            ? 'text-[var(--site-fg)]'
            : 'text-[var(--site-muted)] hover:text-[var(--site-fg)]',
    );

    const indicator = (
        <span
            aria-hidden="true"
            className={cn(
                'absolute inset-x-3.5 bottom-1 h-px origin-left bg-[var(--site-accent)] transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]',
                active || open
                    ? 'scale-x-100'
                    : 'scale-x-0 group-hover/nav:scale-x-100',
            )}
        />
    );

    if (!group.links) {
        return (
            <Link href={group.href} className={classes} onMouseEnter={onOpen}>
                {group.label}
                {indicator}
            </Link>
        );
    }

    return (
        <button
            type="button"
            className={classes}
            aria-expanded={open}
            aria-haspopup="true"
            onMouseEnter={onOpen}
            onFocus={onOpen}
            onClick={() => (open ? onClose() : onOpen())}
        >
            {group.label}
            <ChevronDown
                aria-hidden="true"
                className={cn(
                    'size-3.5 transition-transform duration-300',
                    open && 'rotate-180',
                )}
            />
            {indicator}
        </button>
    );
}

function MegaPanel({
    group,
    open,
    pathname,
    onMouseEnter,
    onMouseLeave,
}: {
    group: MenuGroup;
    open: boolean;
    pathname: string;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    // The panel stays mounted through its close animation, so it is added
    // during render as soon as it opens and removed by the tween's callback.
    if (open && !mounted) {
        setMounted(true);
    }

    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        if (prefersReducedMotion()) {
            gsap.set(element, { opacity: open ? 1 : 0, y: 0 });

            if (!open) {
                const frame = requestAnimationFrame(() => setMounted(false));

                return () => cancelAnimationFrame(frame);
            }

            return;
        }

        const tween = gsap.to(element, {
            opacity: open ? 1 : 0,
            y: open ? 0 : -8,
            duration: open ? 0.32 : 0.2,
            ease: open ? 'power3.out' : 'power2.in',
            onComplete: () => {
                if (!open) {
                    setMounted(false);
                }
            },
        });

        return () => {
            tween.kill();
        };
    }, [open]);

    useEffect(() => {
        const element = ref.current;

        if (!element || !open || prefersReducedMotion()) {
            return;
        }

        const context = gsap.context(() => {
            gsap.fromTo(
                element.querySelectorAll('[data-panel-item]'),
                { opacity: 0, y: 10 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.03,
                    ease: 'power3.out',
                },
            );
        }, element);

        return () => context.revert();
    }, [open]);

    return (
        <div
            ref={ref}
            hidden={!mounted && !open}
            aria-hidden={!open}
            style={{ opacity: 0 }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={cn(
                'absolute inset-x-0 top-full hidden border-b border-[var(--site-line)] bg-[var(--site-surface)] shadow-[0_24px_60px_-32px_rgb(0_0_0/0.35)] lg:block',
                open ? 'pointer-events-auto' : 'pointer-events-none',
            )}
        >
            <Container width="wide">
                <div
                    className={cn(
                        'grid gap-10 py-10',
                        group.feature
                            ? 'lg:grid-cols-[1fr_20rem]'
                            : 'lg:grid-cols-1',
                    )}
                >
                    <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                        {group.links?.map((link) => (
                            <li key={link.href} data-panel-item>
                                <Link
                                    href={link.href}
                                    className={cn(
                                        'group/item flex gap-3 rounded-sm p-3 transition-colors hover:bg-[var(--color-graphite-50)]',
                                        isCurrent(pathname, link.href) &&
                                            'bg-[var(--color-graphite-50)]',
                                    )}
                                >
                                    {link.icon && (
                                        <DynamicIcon
                                            name={link.icon}
                                            className="mt-0.5 size-4.5 shrink-0 text-[var(--site-accent)]"
                                        />
                                    )}
                                    <span>
                                        <span className="block text-sm font-medium text-[var(--site-fg)]">
                                            {link.label}
                                        </span>
                                        {link.description && (
                                            <span className="mt-1 block text-[0.8125rem] leading-relaxed text-[var(--site-muted)]">
                                                {link.description}
                                            </span>
                                        )}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {group.feature && (
                        <div
                            data-panel-item
                            className="flex flex-col justify-between gap-6 border border-[var(--site-line)] bg-[var(--color-graphite-50)] p-7"
                        >
                            <div>
                                <p className="font-display text-lg leading-snug font-semibold">
                                    {group.feature.title}
                                </p>
                                <p className="mt-3 text-sm leading-relaxed text-[var(--site-muted)]">
                                    {group.feature.body}
                                </p>
                            </div>
                            <SiteLink
                                href={group.feature.href}
                                tone="outline"
                                className="w-full"
                            >
                                {group.feature.cta}
                            </SiteLink>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}

function MobileNav({
    open,
    menu,
    chrome,
    pathname,
}: {
    open: boolean;
    menu: MenuGroup[];
    chrome: SiteChrome;
    pathname: string;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;

        if (!element || prefersReducedMotion()) {
            return;
        }

        const context = gsap.context(() => {
            if (open) {
                gsap.fromTo(
                    element.querySelectorAll('[data-mobile-item]'),
                    { opacity: 0, y: 16 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.045,
                        ease: 'power3.out',
                        delay: 0.08,
                    },
                );
            }
        }, element);

        return () => context.revert();
    }, [open]);

    return (
        <div
            id="site-mobile-nav"
            ref={ref}
            hidden={!open}
            className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-[var(--site-line)] bg-[var(--site-surface)] lg:hidden"
        >
            <Container className="py-8">
                <nav aria-label="Mobile">
                    <ul className="divide-y divide-[var(--site-line)]">
                        {menu.map((group) => (
                            <li
                                key={group.label}
                                data-mobile-item
                                className="py-2"
                            >
                                <MobileGroup
                                    group={group}
                                    pathname={pathname}
                                />
                            </li>
                        ))}
                    </ul>
                </nav>

                <div data-mobile-item className="mt-8 space-y-4">
                    <SiteLink href="/request-a-quotation" className="w-full">
                        Request a quotation
                    </SiteLink>
                    {chrome.company.phone && (
                        <a
                            href={`tel:${chrome.company.phone.replace(/\s+/g, '')}`}
                            className="flex items-center justify-center gap-2 text-sm text-[var(--site-muted)]"
                        >
                            <Phone aria-hidden="true" className="size-4" />
                            {chrome.company.phone}
                        </a>
                    )}
                </div>
            </Container>
        </div>
    );
}

function MobileGroup({
    group,
    pathname,
}: {
    group: MenuGroup;
    pathname: string;
}) {
    const [expanded, setExpanded] = useState(false);
    const panelId = useId();

    if (!group.links) {
        return (
            <Link
                href={group.href}
                className={cn(
                    'flex items-center justify-between py-3 font-display text-base font-medium',
                    isCurrent(pathname, group.href) &&
                        'text-[var(--site-accent)]',
                )}
            >
                {group.label}
            </Link>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
                aria-controls={panelId}
                className="flex w-full items-center justify-between py-3 font-display text-base font-medium"
            >
                {group.label}
                <ChevronDown
                    aria-hidden="true"
                    className={cn(
                        'size-4 transition-transform duration-300',
                        expanded && 'rotate-180',
                    )}
                />
            </button>
            <ul id={panelId} hidden={!expanded} className="space-y-1 ps-1 pb-3">
                {group.links.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className={cn(
                                'block py-2 text-sm text-[var(--site-muted)]',
                                isCurrent(pathname, link.href) &&
                                    'text-[var(--site-accent)]',
                            )}
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    );
}

export function HeaderSpacer({ children }: { children?: ReactNode }) {
    return <div className="h-20 lg:h-24">{children}</div>;
}
