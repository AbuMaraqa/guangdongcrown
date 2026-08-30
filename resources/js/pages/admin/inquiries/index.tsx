import { Link, router } from '@inertiajs/react';
import { Inbox, Search, X } from 'lucide-react';
import {
    AdminEmptyState,
    AdminPagination,
    PageShell,
    StatusBadge,
} from '@/components/admin/shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useSyncedState } from '@/hooks/use-synced-state';
import type { Paginated } from '@/types/site';

type Row = {
    id: number;
    reference: string;
    type: string;
    typeLabel: string;
    name: string;
    company: string | null;
    email: string;
    country: string | null;
    status: string;
    statusLabel: string;
    tone: string;
    assignee: string | null;
    unread: boolean;
    createdAt: string | null;
};

type Props = {
    rows: Paginated<Row>;
    filters: { search: string; status: string; type: string };
    statuses: { value: string; label: string; tone: string }[];
    types: { value: string; label: string }[];
    counts: { total: number; new: number; quotes: number };
};

export default function InquiryIndex({
    rows,
    filters,
    statuses,
    types,
    counts,
}: Props) {
    const [search, setSearch] = useSyncedState(filters.search);

    const visit = (params: Record<string, string>) =>
        router.get(
            '/admin/enquiries',
            Object.fromEntries(
                Object.entries({ ...filters, search, ...params }).filter(
                    ([, v]) => v !== '',
                ),
            ),
            { preserveScroll: true, preserveState: true, replace: true },
        );

    const filtering = Boolean(filters.search || filters.status || filters.type);

    return (
        <PageShell
            title="Enquiries"
            description={`${counts.total} total · ${counts.new} awaiting a first reply · ${counts.quotes} quotation requests`}
            breadcrumbs={[
                { label: 'Dashboard', href: '/admin' },
                { label: 'Enquiries' },
            ]}
        >
            <div className="rounded-xl border bg-card">
                <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
                    <form
                        className="relative w-full lg:max-w-xs"
                        onSubmit={(event) => {
                            event.preventDefault();
                            visit({});
                        }}
                    >
                        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search name, company, email or reference"
                            aria-label="Search enquiries"
                            className="ps-9"
                        />
                    </form>

                    <select
                        value={filters.status}
                        aria-label="Filter by status"
                        onChange={(event) =>
                            visit({ status: event.target.value })
                        }
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    >
                        <option value="">All statuses</option>
                        {statuses.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.type}
                        aria-label="Filter by type"
                        onChange={(event) =>
                            visit({ type: event.target.value })
                        }
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    >
                        <option value="">All types</option>
                        {types.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>

                    {filtering && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearch('');
                                router.get(
                                    '/admin/enquiries',
                                    {},
                                    { preserveScroll: true, replace: true },
                                );
                            }}
                        >
                            <X className="size-4" />
                            Clear
                        </Button>
                    )}
                </div>

                {rows.data.length === 0 ? (
                    <AdminEmptyState
                        icon={Inbox}
                        title={
                            filtering
                                ? 'No enquiries match those filters'
                                : 'No enquiries yet'
                        }
                        description={
                            filtering
                                ? 'Try widening the search or clearing the filters.'
                                : 'Messages sent through the contact and quotation forms arrive here.'
                        }
                    />
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Country</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Received</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.data.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className="cursor-pointer"
                                    >
                                        <TableCell>
                                            <Link
                                                href={`/admin/enquiries/${row.id}`}
                                                className="block"
                                            >
                                                <span className="flex items-center gap-2 font-medium">
                                                    {row.unread && (
                                                        <span
                                                            aria-label="Unread"
                                                            className="size-1.5 rounded-full bg-primary"
                                                        />
                                                    )}
                                                    {row.name}
                                                </span>
                                                <span className="block text-xs text-muted-foreground">
                                                    {row.company
                                                        ? `${row.company} · `
                                                        : ''}
                                                    {row.email}
                                                </span>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs text-muted-foreground">
                                                {row.reference}
                                            </code>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {row.typeLabel}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {row.country ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {row.assignee ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge
                                                label={row.statusLabel}
                                                tone={row.tone}
                                            />
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {row.createdAt
                                                ? new Date(
                                                      row.createdAt,
                                                  ).toLocaleDateString()
                                                : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <AdminPagination page={rows} />
                    </>
                )}
            </div>
        </PageShell>
    );
}
