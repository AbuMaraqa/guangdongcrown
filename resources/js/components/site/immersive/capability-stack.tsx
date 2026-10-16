import { ArrowRight } from 'lucide-react';
import { Link } from '@/components/site/link';
import { useTranslations } from '@/hooks/use-translations';
import type { ServiceCard } from '@/types/site';
import ScrollStack, { ScrollStackItem } from './scroll-stack';

const CARD_THEMES = [
    'bg-[var(--site-surface)] text-[var(--color-graphite-900)]',
    'bg-[var(--color-graphite-950)] text-white',
    'bg-[var(--color-brand-100)] text-[var(--color-graphite-900)]',
    'bg-[var(--color-brand-500)] text-[var(--color-graphite-950)]',
];

/**
 * The company's capabilities as cards that pin and stack on top of each
 * other while the page scrolls. Page scroll is already smoothed by Lenis, so
 * the stack's own wheel smoothing stays off.
 */
export function CapabilityStack({ services }: { services: ServiceCard[] }) {
    const { t } = useTranslations();

    return (
        <ScrollStack
            useWindowScroll
            smoothScroll={false}
            stackPosition="18%"
            itemDistance={80}
            itemStackDistance={28}
            baseScale={0.85}
            holdDistance={120}
        >
            {services.map((service, index) => (
                <ScrollStackItem
                    key={service.id}
                    itemClassName={`flex h-auto min-h-80 flex-col justify-between gap-10 rounded-[28px] p-8 sm:p-12 ${CARD_THEMES[index % CARD_THEMES.length]}`}
                >
                    <span className="text-sm font-semibold tracking-[0.3em] uppercase tabular-nums opacity-60">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-2xl">
                            <h3 className="site-display text-2xl sm:text-4xl">
                                {service.name}
                            </h3>
                            {service.excerpt && (
                                <p className="mt-4 text-base leading-relaxed opacity-80 sm:text-lg">
                                    {service.excerpt}
                                </p>
                            )}
                        </div>
                        <Link
                            href={`/capabilities/${service.slug}`}
                            className="group/link inline-flex shrink-0 items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
                        >
                            {t('Explore capability')}
                            <ArrowRight
                                aria-hidden="true"
                                className="rtl-flip size-4 transition-transform duration-300 group-hover/link:translate-x-1"
                            />
                        </Link>
                    </div>
                </ScrollStackItem>
            ))}
        </ScrollStack>
    );
}
