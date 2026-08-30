import {
    Facebook,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Youtube,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { Reveal } from '@/animation';
import { Link } from '@/components/site/link';
import { Container, SiteLink } from '@/components/site/primitives';
import { useTranslations } from '@/hooks/use-translations';
import type { SiteChrome } from '@/types/site';

const SOCIAL_ICONS: Record<string, ComponentType<{ className?: string }>> = {
    linkedin: Linkedin,
    facebook: Facebook,
    instagram: Instagram,
    youtube: Youtube,
    x: MessageCircle,
    wechat: MessageCircle,
};

const SOCIAL_LABELS: Record<string, string> = {
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    instagram: 'Instagram',
    youtube: 'YouTube',
    x: 'X',
    wechat: 'WeChat',
};

const COLUMNS: {
    titleKey: string;
    links: { labelKey: string; href: string }[];
}[] = [
    {
        titleKey: 'Company',
        links: [
            { labelKey: 'About us', href: '/about' },
            { labelKey: 'Global presence', href: '/global-presence' },
            { labelKey: 'Our team', href: '/team' },
            { labelKey: 'Insights', href: '/insights' },
        ],
    },
    {
        titleKey: 'What we do',
        links: [
            { labelKey: 'Our products', href: '/our-products' },
            { labelKey: 'Catalogue', href: '/catalogue' },
            { labelKey: 'Logistics', href: '/logistics' },
            { labelKey: 'Solutions', href: '/solutions' },
            { labelKey: 'Industries', href: '/industries' },
        ],
    },
    {
        titleKey: 'Evidence',
        links: [
            { labelKey: 'Projects', href: '/projects' },
            { labelKey: 'Frequently asked questions', href: '/faq' },
            { labelKey: 'Contact', href: '/contact' },
            { labelKey: 'Request a quotation', href: '/request-a-quotation' },
        ],
    },
];

export function SiteFooter({ chrome }: { chrome: SiteChrome }) {
    const { t } = useTranslations();
    const { company, footer, social, headquarters } = chrome;
    const year = new Date().getFullYear();
    const socialEntries = Object.entries(social).filter(([, url]) =>
        Boolean(url),
    );

    return (
        <footer className="site-invert">
            {(footer.cta_heading || footer.cta_body) && (
                <div className="border-b border-[var(--site-line)]">
                    <Container>
                        <Reveal className="flex flex-col gap-8 py-20 lg:flex-row lg:items-end lg:justify-between lg:py-24">
                            <div className="max-w-2xl">
                                {footer.cta_heading && (
                                    <h2 className="site-display text-3xl sm:text-4xl lg:text-[2.75rem]">
                                        {footer.cta_heading}
                                    </h2>
                                )}
                                {footer.cta_body && (
                                    <p className="mt-5 text-[1.0625rem] leading-relaxed text-pretty text-[var(--site-muted)]">
                                        {footer.cta_body}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <SiteLink href="/request-a-quotation" magnetic>
                                    Request a quotation
                                </SiteLink>
                                <SiteLink
                                    href="/contact"
                                    tone="outline"
                                    withArrow={false}
                                >
                                    Talk to us
                                </SiteLink>
                            </div>
                        </Reveal>
                    </Container>
                </div>
            )}

            <Container>
                <div className="grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr] lg:gap-20">
                    <div>
                        <p className="font-display text-xl font-semibold tracking-tight">
                            {company.name}
                        </p>
                        {company.description && (
                            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--site-muted)]">
                                {company.description}
                            </p>
                        )}

                        <ul className="mt-8 space-y-3 text-sm">
                            {(headquarters?.address || company.address) && (
                                <li className="flex gap-3 text-[var(--site-muted)]">
                                    <MapPin
                                        aria-hidden="true"
                                        className="mt-0.5 size-4 shrink-0"
                                    />
                                    <span>
                                        {headquarters?.address ??
                                            company.address}
                                    </span>
                                </li>
                            )}
                            {company.email && (
                                <li>
                                    <a
                                        href={`mailto:${company.email}`}
                                        className="flex gap-3 text-[var(--site-muted)] transition-colors hover:text-[var(--site-fg)]"
                                    >
                                        <Mail
                                            aria-hidden="true"
                                            className="mt-0.5 size-4 shrink-0"
                                        />
                                        {company.email}
                                    </a>
                                </li>
                            )}
                            {company.phone && (
                                <li>
                                    <a
                                        href={`tel:${company.phone.replace(/\s+/g, '')}`}
                                        className="flex gap-3 text-[var(--site-muted)] transition-colors hover:text-[var(--site-fg)]"
                                    >
                                        <Phone
                                            aria-hidden="true"
                                            className="mt-0.5 size-4 shrink-0"
                                        />
                                        {company.phone}
                                    </a>
                                </li>
                            )}
                        </ul>

                        {socialEntries.length > 0 && (
                            <ul className="mt-8 flex flex-wrap gap-3">
                                {socialEntries.map(([platform, url]) => {
                                    const Icon =
                                        SOCIAL_ICONS[platform] ?? MessageCircle;

                                    return (
                                        <li key={platform}>
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                className="inline-flex size-10 items-center justify-center rounded-sm border border-[var(--site-line)] text-[var(--site-muted)] transition-colors hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]"
                                            >
                                                <span className="sr-only">
                                                    {SOCIAL_LABELS[platform] ??
                                                        platform}
                                                </span>
                                                <Icon className="size-4" />
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <div className="grid gap-10 sm:grid-cols-3">
                        {COLUMNS.map((column) => (
                            <div key={column.titleKey}>
                                <p className="site-eyebrow">
                                    {t(column.titleKey)}
                                </p>
                                <ul className="mt-5 space-y-3">
                                    {column.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="text-sm text-[var(--site-muted)] transition-colors hover:text-[var(--site-fg)]"
                                            >
                                                {t(link.labelKey)}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-[var(--site-line)] py-8 text-xs text-[var(--site-muted)] sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        {footer.copyright ??
                            `© ${year} ${company.legalName ?? company.name}. All rights reserved.`}
                    </p>
                    {chrome.legalPages.length > 0 && (
                        <div className="flex flex-wrap gap-6">
                            {chrome.legalPages.map((page) => (
                                <Link
                                    key={page.slug}
                                    href={`/${page.slug}`}
                                    className="transition-colors hover:text-[var(--site-fg)]"
                                >
                                    {page.title}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </Container>
        </footer>
    );
}
