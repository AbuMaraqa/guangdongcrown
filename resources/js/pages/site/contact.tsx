import { usePage } from '@inertiajs/react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Reveal } from '@/animation';
import { InquiryForm } from '@/components/site/inquiry-form';
import { PageHeader } from '@/components/site/page-header';
import { Container, Eyebrow, Section } from '@/components/site/primitives';
import { FaqAccordion } from '@/components/site/sections';
import { SeoHead } from '@/components/site/seo-head';
import type {
    Crumb,
    FaqItem,
    SelectOption,
    SeoPayload,
    SiteChrome,
    SiteLocation,
} from '@/types/site';

type Props = {
    seo: SeoPayload;
    type: 'contact';
    services: SelectOption[];
    products: SelectOption[];
    locations: SiteLocation[];
    faqs: FaqItem[];
    breadcrumbs: Crumb[];
};

export default function Contact({
    seo,
    services,
    products,
    locations,
    faqs,
    breadcrumbs,
}: Props) {
    const chrome = usePage().props.site as SiteChrome | null;

    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                eyebrow="Contact"
                title="Talk to the people who will handle your order"
                lead="Tell us what you need. We route enquiries to the right desk and reply within one business day."
                breadcrumbs={breadcrumbs}
            />

            <Section>
                <Container>
                    <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
                        <Reveal>
                            <InquiryForm
                                type="contact"
                                services={services}
                                products={products}
                            />
                        </Reveal>

                        <Reveal delay={0.1} className="space-y-12">
                            <div>
                                <Eyebrow className="mb-6">Direct lines</Eyebrow>
                                <ul className="divide-y divide-[var(--site-line)] border-y border-[var(--site-line)]">
                                    {chrome?.company.email && (
                                        <li className="py-5">
                                            <a
                                                href={`mailto:${chrome.company.email}`}
                                                className="flex items-center gap-3 transition-colors hover:text-[var(--site-accent)]"
                                            >
                                                <Mail
                                                    aria-hidden="true"
                                                    className="size-4 text-[var(--site-accent)]"
                                                />
                                                {chrome.company.email}
                                            </a>
                                        </li>
                                    )}
                                    {chrome?.company.phone && (
                                        <li className="py-5">
                                            <a
                                                href={`tel:${chrome.company.phone.replace(/\s+/g, '')}`}
                                                className="flex items-center gap-3 transition-colors hover:text-[var(--site-accent)]"
                                            >
                                                <Phone
                                                    aria-hidden="true"
                                                    className="size-4 text-[var(--site-accent)]"
                                                />
                                                {chrome.company.phone}
                                            </a>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            {locations.length > 0 && (
                                <div>
                                    <Eyebrow className="mb-6">
                                        Offices and facilities
                                    </Eyebrow>
                                    <ul className="space-y-6">
                                        {locations.map((location) => (
                                            <li
                                                key={location.name}
                                                className="border border-[var(--site-line)] p-6"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <p className="font-display text-base font-semibold">
                                                        {location.name}
                                                    </p>
                                                    {location.isHeadquarters && (
                                                        <span className="site-eyebrow shrink-0">
                                                            HQ
                                                        </span>
                                                    )}
                                                </div>
                                                {location.address && (
                                                    <p className="mt-3 flex gap-3 text-sm leading-relaxed text-[var(--site-muted)]">
                                                        <MapPin
                                                            aria-hidden="true"
                                                            className="mt-0.5 size-4 shrink-0"
                                                        />
                                                        {location.address}
                                                    </p>
                                                )}
                                                {location.phone && (
                                                    <a
                                                        href={`tel:${location.phone.replace(/\s+/g, '')}`}
                                                        className="mt-3 block text-sm transition-colors hover:text-[var(--site-accent)]"
                                                    >
                                                        {location.phone}
                                                    </a>
                                                )}
                                                {location.email && (
                                                    <a
                                                        href={`mailto:${location.email}`}
                                                        className="mt-1 block text-sm transition-colors hover:text-[var(--site-accent)]"
                                                    >
                                                        {location.email}
                                                    </a>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </Reveal>
                    </div>
                </Container>
            </Section>

            {faqs.length > 0 && (
                <Section
                    className="border-t border-[var(--site-line)]"
                    spacing="tight"
                >
                    <Container>
                        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
                            <Reveal>
                                <Eyebrow className="mb-5">
                                    Before you write
                                </Eyebrow>
                                <h2 className="site-display text-3xl">
                                    Common questions
                                </h2>
                            </Reveal>
                            <Reveal delay={0.1}>
                                <FaqAccordion items={faqs} />
                            </Reveal>
                        </div>
                    </Container>
                </Section>
            )}
        </>
    );
}
