import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Mail, Paperclip, Phone, Trash2 } from 'lucide-react';
import { ConfirmAction, PageShell } from '@/components/admin/shell';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Note = {
    id: number;
    body: string;
    author: string | null;
    createdAt: string | null;
};

type Props = {
    inquiry: {
        id: number;
        reference: string;
        type: string;
        typeLabel: string;
        name: string;
        company: string | null;
        email: string;
        phone: string | null;
        country: string | null;
        quantity: string | null;
        message: string;
        service: string | null;
        product: string | null;
        status: string;
        assignedTo: number | null;
        sourceUrl: string | null;
        attachment: { name: string | null; url: string } | null;
        createdAt: string | null;
        notes: Note[];
    };
    statuses: { value: string; label: string; tone: string }[];
    assignees: { value: number; label: string }[];
};

export default function InquiryShow({ inquiry, statuses, assignees }: Props) {
    const status = useForm({
        status: inquiry.status,
        assigned_to: inquiry.assignedTo ?? '',
    });

    const note = useForm({ body: '' });

    const facts = [
        { label: 'Reference', value: inquiry.reference },
        { label: 'Type', value: inquiry.typeLabel },
        { label: 'Company', value: inquiry.company },
        { label: 'Country', value: inquiry.country },
        { label: 'Service', value: inquiry.service },
        { label: 'Product', value: inquiry.product },
        { label: 'Quantity', value: inquiry.quantity },
        {
            label: 'Received',
            value: inquiry.createdAt
                ? new Date(inquiry.createdAt).toLocaleString()
                : null,
        },
        { label: 'Submitted from', value: inquiry.sourceUrl },
    ].filter((fact) => Boolean(fact.value));

    return (
        <PageShell
            title={inquiry.name}
            description={`${inquiry.typeLabel} enquiry · ${inquiry.reference}`}
            breadcrumbs={[
                { label: 'Dashboard', href: '/admin' },
                { label: 'Enquiries', href: '/admin/enquiries' },
                { label: inquiry.reference },
            ]}
            actions={
                <>
                    <Button asChild variant="ghost">
                        <Link href="/admin/enquiries">
                            <ArrowLeft className="size-4" />
                            Back
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <a
                            href={`mailto:${inquiry.email}?subject=Re: ${inquiry.reference}`}
                        >
                            <Mail className="size-4" />
                            Reply by email
                        </a>
                    </Button>
                    <ConfirmAction
                        title="Delete this enquiry?"
                        description="The message and its notes will be removed from the dashboard."
                        onConfirm={() =>
                            router.delete(`/admin/enquiries/${inquiry.id}`)
                        }
                        trigger={
                            <Button
                                type="button"
                                variant="outline"
                                className="text-destructive"
                            >
                                <Trash2 className="size-4" />
                                Delete
                            </Button>
                        }
                    />
                </>
            }
        >
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="space-y-6">
                    <section className="rounded-xl border bg-card p-6">
                        <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">
                            Message
                        </h2>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {inquiry.message}
                        </p>

                        {inquiry.attachment && (
                            <a
                                href={inquiry.attachment.url}
                                className="mt-6 inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm transition-colors hover:border-primary"
                            >
                                <Paperclip className="size-4" />
                                {inquiry.attachment.name ??
                                    'Download attachment'}
                            </a>
                        )}
                    </section>

                    <section className="rounded-xl border bg-card">
                        <h2 className="border-b p-6 pb-4 text-sm font-semibold tracking-wide uppercase">
                            Internal notes
                        </h2>

                        <form
                            className="space-y-3 border-b p-6"
                            onSubmit={(event) => {
                                event.preventDefault();
                                note.post(
                                    `/admin/enquiries/${inquiry.id}/notes`,
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => note.reset(),
                                    },
                                );
                            }}
                        >
                            <label htmlFor="note-body" className="sr-only">
                                Add a note
                            </label>
                            <Textarea
                                id="note-body"
                                rows={3}
                                value={note.data.body}
                                onChange={(event) =>
                                    note.setData('body', event.target.value)
                                }
                                placeholder="Record what was discussed, agreed or sent."
                            />
                            {note.errors.body && (
                                <p className="text-xs text-destructive">
                                    {note.errors.body}
                                </p>
                            )}
                            <Button
                                type="submit"
                                size="sm"
                                disabled={note.processing || !note.data.body}
                            >
                                Add note
                            </Button>
                        </form>

                        {inquiry.notes.length > 0 ? (
                            <ul className="divide-y">
                                {inquiry.notes.map((entry) => (
                                    <li key={entry.id} className="p-6">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {entry.body}
                                        </p>
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {entry.author ?? 'Unknown'}
                                            {entry.createdAt &&
                                                ` · ${new Date(entry.createdAt).toLocaleString()}`}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="p-6 text-sm text-muted-foreground">
                                No notes yet. Notes are visible to your team
                                only.
                            </p>
                        )}
                    </section>
                </div>

                <div className="space-y-6">
                    <form
                        className="space-y-4 rounded-xl border bg-card p-6"
                        onSubmit={(event) => {
                            event.preventDefault();
                            status.patch(`/admin/enquiries/${inquiry.id}`, {
                                preserveScroll: true,
                            });
                        }}
                    >
                        <h2 className="text-sm font-semibold tracking-wide uppercase">
                            Handling
                        </h2>

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="status"
                                className="text-sm font-medium"
                            >
                                Status
                            </label>
                            <select
                                id="status"
                                value={status.data.status}
                                onChange={(event) =>
                                    status.setData('status', event.target.value)
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                            >
                                {statuses.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {status.errors.status && (
                                <p className="text-xs text-destructive">
                                    {status.errors.status}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="assignee"
                                className="text-sm font-medium"
                            >
                                Owner
                            </label>
                            <select
                                id="assignee"
                                value={String(status.data.assigned_to ?? '')}
                                onChange={(event) =>
                                    status.setData(
                                        'assigned_to',
                                        event.target.value === ''
                                            ? ''
                                            : Number(event.target.value),
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                            >
                                <option value="">Unassigned</option>
                                {assignees.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={status.processing}
                        >
                            Update enquiry
                        </Button>
                    </form>

                    <section className="rounded-xl border bg-card p-6">
                        <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">
                            Contact
                        </h2>
                        <div className="space-y-2 text-sm">
                            <a
                                href={`mailto:${inquiry.email}`}
                                className="flex items-center gap-2 transition-colors hover:text-primary"
                            >
                                <Mail className="size-4 shrink-0" />
                                <span className="truncate">
                                    {inquiry.email}
                                </span>
                            </a>
                            {inquiry.phone && (
                                <a
                                    href={`tel:${inquiry.phone.replace(/\s+/g, '')}`}
                                    className="flex items-center gap-2 transition-colors hover:text-primary"
                                >
                                    <Phone className="size-4 shrink-0" />
                                    {inquiry.phone}
                                </a>
                            )}
                        </div>

                        <dl className="mt-6 space-y-3 border-t pt-4 text-sm">
                            {facts.map((fact) => (
                                <div
                                    key={fact.label}
                                    className="flex justify-between gap-4"
                                >
                                    <dt className="shrink-0 text-muted-foreground">
                                        {fact.label}
                                    </dt>
                                    <dd className="truncate text-end">
                                        {fact.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                </div>
            </div>
        </PageShell>
    );
}
