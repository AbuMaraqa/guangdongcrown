import { useForm } from '@inertiajs/react';
import { CheckCircle2, Loader2, Paperclip, X } from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { countryOptions } from '@/components/site/countries';
import { SiteButton } from '@/components/site/primitives';
import { cn } from '@/lib/utils';
import type { SelectOption } from '@/types/site';

type InquiryFormProps = {
    type: 'contact' | 'quote';
    services: SelectOption[];
    products: SelectOption[];
    preselect?: { service_id: number | null; product_id: number | null };
};

type FormShape = {
    type: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    country: string;
    service_id: string;
    product_id: string;
    quantity: string;
    message: string;
    attachment: File | null;
    consent: boolean;
    website: string;
};

/**
 * The single public enquiry form, used for both general contact and
 * quotation requests. Every constraint here is mirrored server side by
 * `InquiryRequest`; the client-side hints are convenience only.
 */
export function InquiryForm({
    type,
    services,
    products,
    preselect,
}: InquiryFormProps) {
    const isQuote = type === 'quote';
    const countries = useMemo(() => countryOptions(), []);
    const fileInput = useRef<HTMLInputElement>(null);
    const [submitted, setSubmitted] = useState(false);

    const { data, setData, post, processing, errors, reset, progress } =
        useForm<FormShape>({
            type,
            name: '',
            company: '',
            email: '',
            phone: '',
            country: '',
            service_id: preselect?.service_id
                ? String(preselect.service_id)
                : '',
            product_id: preselect?.product_id
                ? String(preselect.product_id)
                : '',
            quantity: '',
            message: '',
            attachment: null,
            consent: false,
            website: '',
        });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        post('/enquiries', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSubmitted(true);

                if (fileInput.current) {
                    fileInput.current.value = '';
                }
            },
        });
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-start border border-[var(--site-line)] bg-[var(--site-surface)] p-10">
                <CheckCircle2
                    aria-hidden="true"
                    className="size-8 text-[var(--site-accent)]"
                />
                <h3 className="mt-5 font-display text-xl font-semibold">
                    Enquiry received
                </h3>
                <p className="mt-3 max-w-md leading-relaxed text-[var(--site-muted)]">
                    Thank you. Your reference has been emailed to you and our
                    team replies within one business day.
                </p>
                <SiteButton
                    tone="outline"
                    className="mt-8"
                    onClick={() => setSubmitted(false)}
                >
                    Send another enquiry
                </SiteButton>
            </div>
        );
    }

    return (
        <form onSubmit={submit} noValidate className="space-y-6">
            {/* Honeypot: a real person never fills this in. */}
            <div
                aria-hidden="true"
                className="absolute h-0 w-0 overflow-hidden"
            >
                <label htmlFor="website-field">Website</label>
                <input
                    id="website-field"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={data.website}
                    onChange={(event) => setData('website', event.target.value)}
                />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Full name" error={errors.name} required>
                    {(id) => (
                        <Input
                            id={id}
                            value={data.name}
                            autoComplete="name"
                            onChange={(value) => setData('name', value)}
                            invalid={Boolean(errors.name)}
                        />
                    )}
                </Field>

                <Field
                    label="Company"
                    error={errors.company}
                    required={isQuote}
                >
                    {(id) => (
                        <Input
                            id={id}
                            value={data.company}
                            autoComplete="organization"
                            onChange={(value) => setData('company', value)}
                            invalid={Boolean(errors.company)}
                        />
                    )}
                </Field>

                <Field label="Work email" error={errors.email} required>
                    {(id) => (
                        <Input
                            id={id}
                            type="email"
                            value={data.email}
                            autoComplete="email"
                            onChange={(value) => setData('email', value)}
                            invalid={Boolean(errors.email)}
                        />
                    )}
                </Field>

                <Field
                    label="Phone"
                    error={errors.phone}
                    hint="Include your country code."
                >
                    {(id) => (
                        <Input
                            id={id}
                            type="tel"
                            value={data.phone}
                            autoComplete="tel"
                            onChange={(value) => setData('phone', value)}
                            invalid={Boolean(errors.phone)}
                        />
                    )}
                </Field>

                <Field label="Country" error={errors.country}>
                    {(id) => (
                        <Select
                            id={id}
                            value={data.country}
                            onChange={(value) => setData('country', value)}
                            invalid={Boolean(errors.country)}
                            placeholder="Select a country"
                            options={countries.map((c) => ({
                                value: c.label,
                                label: c.label,
                            }))}
                        />
                    )}
                </Field>

                {services.length > 0 && (
                    <Field
                        label="Service of interest"
                        error={errors.service_id}
                    >
                        {(id) => (
                            <Select
                                id={id}
                                value={data.service_id}
                                onChange={(value) =>
                                    setData('service_id', value)
                                }
                                invalid={Boolean(errors.service_id)}
                                placeholder="Any service"
                                options={services.map((s) => ({
                                    value: String(s.value),
                                    label: s.label,
                                }))}
                            />
                        )}
                    </Field>
                )}

                {isQuote && products.length > 0 && (
                    <Field label="Product" error={errors.product_id}>
                        {(id) => (
                            <Select
                                id={id}
                                value={data.product_id}
                                onChange={(value) =>
                                    setData('product_id', value)
                                }
                                invalid={Boolean(errors.product_id)}
                                placeholder="Not listed / other"
                                options={products.map((p) => ({
                                    value: String(p.value),
                                    label: p.label,
                                }))}
                            />
                        )}
                    </Field>
                )}

                {isQuote && (
                    <Field
                        label="Quantity"
                        error={errors.quantity}
                        hint="Tonnes, metres or pieces — whatever fits."
                    >
                        {(id) => (
                            <Input
                                id={id}
                                value={data.quantity}
                                onChange={(value) => setData('quantity', value)}
                                invalid={Boolean(errors.quantity)}
                            />
                        )}
                    </Field>
                )}
            </div>

            <Field
                label={
                    isQuote
                        ? 'Specification and requirements'
                        : 'How can we help?'
                }
                error={errors.message}
                required
                hint={
                    isQuote
                        ? 'Alloy, temper, dimensions, tolerance, finish, destination port and target date.'
                        : undefined
                }
            >
                {(id) => (
                    <textarea
                        id={id}
                        rows={6}
                        value={data.message}
                        onChange={(event) =>
                            setData('message', event.target.value)
                        }
                        aria-invalid={Boolean(errors.message)}
                        className={cn(
                            'w-full resize-y border bg-[var(--site-surface)] px-4 py-3 text-sm leading-relaxed transition-colors outline-none placeholder:text-[var(--site-muted)] focus:border-[var(--site-accent)]',
                            errors.message
                                ? 'border-red-500'
                                : 'border-[var(--site-line)]',
                        )}
                    />
                )}
            </Field>

            <Field
                label="Attachment"
                error={errors.attachment}
                hint="Drawing, specification or RFQ. Max 10 MB."
            >
                {(id) => (
                    <div className="flex items-center gap-3">
                        <label
                            htmlFor={id}
                            className="inline-flex cursor-pointer items-center gap-2 border border-[var(--site-line)] px-5 py-3 text-sm transition-colors hover:border-[var(--site-accent)]"
                        >
                            <Paperclip aria-hidden="true" className="size-4" />
                            Choose file
                        </label>
                        <input
                            id={id}
                            ref={fileInput}
                            type="file"
                            className="sr-only"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
                            onChange={(event) =>
                                setData(
                                    'attachment',
                                    event.target.files?.[0] ?? null,
                                )
                            }
                        />
                        {data.attachment && (
                            <span className="flex items-center gap-2 text-sm text-[var(--site-muted)]">
                                {data.attachment.name}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData('attachment', null);

                                        if (fileInput.current) {
                                            fileInput.current.value = '';
                                        }
                                    }}
                                    className="text-[var(--site-muted)] transition-colors hover:text-[var(--site-fg)]"
                                >
                                    <span className="sr-only">
                                        Remove attachment
                                    </span>
                                    <X className="size-4" />
                                </button>
                            </span>
                        )}
                    </div>
                )}
            </Field>

            <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--site-muted)]">
                <input
                    type="checkbox"
                    checked={data.consent}
                    onChange={(event) =>
                        setData('consent', event.target.checked)
                    }
                    aria-invalid={Boolean(errors.consent)}
                    className="mt-0.5 size-4 shrink-0 accent-[var(--site-accent)]"
                />
                <span>
                    I agree to be contacted about this enquiry and understand
                    how my details will be used.
                </span>
            </label>
            {errors.consent && (
                <p className="text-sm text-red-600">{errors.consent}</p>
            )}

            {progress && (
                <div
                    role="progressbar"
                    aria-valuenow={progress.percentage ?? 0}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-0.5 w-full bg-[var(--site-line)]"
                >
                    <div
                        className="h-full bg-[var(--site-accent)] transition-[width]"
                        style={{ width: `${progress.percentage ?? 0}%` }}
                    />
                </div>
            )}

            <SiteButton
                type="submit"
                disabled={processing}
                withArrow
                className="w-full sm:w-auto"
            >
                {processing ? (
                    <span className="flex items-center gap-2">
                        <Loader2
                            aria-hidden="true"
                            className="size-4 animate-spin"
                        />
                        Sending
                    </span>
                ) : isQuote ? (
                    'Send quotation request'
                ) : (
                    'Send enquiry'
                )}
            </SiteButton>
        </form>
    );
}

function Field({
    label,
    error,
    hint,
    required = false,
    children,
}: {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    children: (id: string) => ReactNode;
}) {
    const id = useId();

    return (
        <div className="flex flex-col gap-2">
            <label
                htmlFor={id}
                className="font-display text-[0.8125rem] font-semibold"
            >
                {label}
                {required && (
                    <span
                        aria-hidden="true"
                        className="ms-1 text-[var(--site-accent)]"
                    >
                        *
                    </span>
                )}
            </label>
            {children(id)}
            {hint && !error && (
                <p className="text-[0.8125rem] text-[var(--site-muted)]">
                    {hint}
                </p>
            )}
            {error && (
                <p role="alert" className="text-[0.8125rem] text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

function Input({
    id,
    value,
    onChange,
    type = 'text',
    autoComplete,
    invalid,
}: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    autoComplete?: string;
    invalid?: boolean;
}) {
    return (
        <input
            id={id}
            type={type}
            value={value}
            autoComplete={autoComplete}
            aria-invalid={invalid}
            onChange={(event) => onChange(event.target.value)}
            className={cn(
                'h-12 w-full border bg-[var(--site-surface)] px-4 text-sm transition-colors outline-none focus:border-[var(--site-accent)]',
                invalid ? 'border-red-500' : 'border-[var(--site-line)]',
            )}
        />
    );
}

function Select({
    id,
    value,
    onChange,
    options,
    placeholder,
    invalid,
}: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    invalid?: boolean;
}) {
    return (
        <select
            id={id}
            value={value}
            aria-invalid={invalid}
            onChange={(event) => onChange(event.target.value)}
            className={cn(
                'h-12 w-full border bg-[var(--site-surface)] px-4 text-sm transition-colors outline-none focus:border-[var(--site-accent)]',
                invalid ? 'border-red-500' : 'border-[var(--site-line)]',
            )}
        >
            <option value="">{placeholder}</option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}
