import { ClipboardList, Clock, ShieldCheck } from 'lucide-react';
import { Reveal, Stagger } from '@/animation';
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
    SiteLocation,
} from '@/types/site';

type Props = {
    seo: SeoPayload;
    type: 'quote';
    services: SelectOption[];
    products: SelectOption[];
    locations: SiteLocation[];
    faqs: FaqItem[];
    preselect: { service_id: number | null; product_id: number | null };
    breadcrumbs: Crumb[];
};

const ASSURANCES = [
    {
        icon: Clock,
        title: 'Reply within one business day',
        body: 'Every enquiry is acknowledged with a reference and an owner.',
    },
    {
        icon: ClipboardList,
        title: 'Priced against your specification',
        body: 'Alloy, temper and tolerance are confirmed before a number is quoted.',
    },
    {
        icon: ShieldCheck,
        title: 'Your details stay with us',
        body: 'Specifications and drawings are used only to prepare your quotation.',
    },
];

export default function Quote({
    seo,
    services,
    products,
    preselect,
    faqs,
    breadcrumbs,
}: Props) {
    return (
        <>
            <SeoHead seo={seo} />

            <PageHeader
                eyebrow="Quotation"
                title="Send us the specification"
                lead="The more precise the input, the tighter the price. Attach a drawing if you have one."
                breadcrumbs={breadcrumbs}
            />

            <Section>
                <Container>
                    <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
                        <Reveal>
                            <InquiryForm
                                type="quote"
                                services={services}
                                products={products}
                                preselect={preselect}
                            />
                        </Reveal>

                        <Reveal delay={0.1}>
                            <Eyebrow className="mb-6">
                                What happens next
                            </Eyebrow>
                            <Stagger className="divide-y divide-[var(--site-line)] border-y border-[var(--site-line)]">
                                {ASSURANCES.map((item) => (
                                    <div
                                        key={item.title}
                                        className="flex gap-4 py-6"
                                    >
                                        <item.icon
                                            aria-hidden="true"
                                            className="mt-0.5 size-5 shrink-0 text-[var(--site-accent)]"
                                        />
                                        <div>
                                            <p className="font-display text-base font-semibold">
                                                {item.title}
                                            </p>
                                            <p className="mt-1.5 text-sm leading-relaxed text-[var(--site-muted)]">
                                                {item.body}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </Stagger>
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
                                <Eyebrow className="mb-5">Questions</Eyebrow>
                                <h2 className="site-display text-3xl">
                                    Before you send
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
