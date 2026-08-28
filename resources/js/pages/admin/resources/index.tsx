import { Link, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    FileStack,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useMemo } from 'react';
import {
    AdminEmptyState,
    AdminPagination,
    ConfirmAction,
    PageShell,
    StatusBadge,
} from '@/components/admin/shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useSyncedState } from '@/hooks/use-synced-state';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types/site';

type Column = {
    key: string;
    label: string;
    type: 'primary' | 'text' | 'mono' | 'boolean' | 'date' | 'badge' | 'status';
};

type Schema = {
    key: string;
    label: string;
    singular: string;
    description: string | null;
    columns: Column[];
    filters: {
        key: string;
        label: string;
        options: { value: string | number; label: string }[];
    }[];
    sortable: boolean;
    softDeletes: boolean;
};

type Row = Record<string, unknown> & {
    id: number;
    thumb?: string | null;
    deleted_at?: string | null;
};

type Props = {
    schema: Schema;
    rows: Paginated<Row>;
    filters: Record<string, string | boolean>;
};

/**
 * The one index screen used by every CMS resource. Columns, filters and
 * sortability all come from the resource schema declared in PHP.
 */
export default function ResourceIndex({ schema, rows, filters }: Props) {
    const base = `/admin/content/${schema.key}`;
    const [search, setSearch] = useSyncedState(String(filters.search ?? ''));

    const query = useMemo(
        () =>
            Object.fromEntries(
                Object.entries(filters).filter(
                    ([, value]) =>
                        value !== '' && value !== false && value !== undefined,
                ),
            ) as Record<string, string>,
        [filters],
    );

    const visit = (params: Record<string, string | undefined>) => {
        const next = { ...query, ...params };

        router.get(
            base,
            Object.fromEntries(
                Object.entries(next).filter(
                    ([, value]) => value !== '' && value !== undefined,
                ),
            ),
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const sortBy = (key: string) => {
        const direction =
            filters.sort === key && filters.direction === 'asc'
                ? 'desc'
                : 'asc';

        visit({ sort: key, direction });
    };

    const trashed = filters.trashed === true;
    const hasFilters = Boolean(
        search || trashed || schema.filters.some((filter) => query[filter.key]),
    );

    return (
        <PageShell
            title={schema.label}
            description={schema.description}
            breadcrumbs={[
                { label: 'Dashboard', href: '/admin' },
                { label: schema.label },
            ]}
            actions={
                <Button asChild>
                    <Link href={`${base}/create`}>
                        <Plus className="size-4" />
                        New {schema.singular.toLowerCase()}
                    </Link>
                </Button>
            }
        >
            <div className="rounded-xl border bg-card">
                <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
                    <form
                        className="relative w-full lg:max-w-xs"
                        onSubmit={(event) => {
                            event.preventDefault();
                            visit({ search, page: undefined });
                        }}
                    >
                        <Search className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={`Search ${schema.label.toLowerCase()}`}
                            aria-label={`Search ${schema.label}`}
                            className="ps-9"
                        />
                    </form>

                    <div className="flex flex-wrap items-center gap-2">
                        {schema.filters.map((filter) => (
                            <select
                                key={filter.key}
                                value={query[filter.key] ?? ''}
                                aria-label={filter.label}
                                onChange={(event) =>
                                    visit({
                                        [filter.key]: event.target.value,
                                        page: undefined,
                                    })
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                            >
                                <option value="">
                                    All {filter.label.toLowerCase()}
                                </option>
                                {filter.options.map((option) => (
                                    <option
                                        key={String(option.value)}
                                        value={String(option.value)}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        ))}

                        {schema.softDeletes && (
                            <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Switch
                                    checked={trashed}
                                    onCheckedChange={(checked) =>
                                        visit({
                                            trashed: checked ? '1' : undefined,
                                            page: undefined,
                                        })
                                    }
                                />
                                Deleted only
                            </label>
                        )}

                        {hasFilters && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearch('');
                                    router.get(
                                        base,
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
                </div>

                {rows.data.length === 0 ? (
                    <AdminEmptyState
                        icon={FileStack}
                        title={
                            hasFilters
                                ? 'Nothing matches those filters'
                                : `No ${schema.label.toLowerCase()} yet`
                        }
                        description={
                            hasFilters
                                ? 'Adjust the search or filters to widen the results.'
                                : `Create the first ${schema.singular.toLowerCase()} to see it on the website.`
                        }
                        action={
                            hasFilters ? (
                                <Button
                                    variant="outline"
                                    onClick={() => router.get(base)}
                                >
                                    Clear filters
                                </Button>
                            ) : (
                                <Button asChild>
                                    <Link href={`${base}/create`}>
                                        <Plus className="size-4" />
                                        New {schema.singular.toLowerCase()}
                                    </Link>
                                </Button>
                            )
                        }
                    />
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {schema.columns.map((column) => (
                                        <TableHead key={column.key}>
                                            {column.key.includes('.') ? (
                                                column.label
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        sortBy(column.key)
                                                    }
                                                    className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                                                >
                                                    {column.label}
                                                    <SortIcon
                                                        active={
                                                            filters.sort ===
                                                            column.key
                                                        }
                                                        direction={String(
                                                            filters.direction,
                                                        )}
                                                    />
                                                </button>
                                            )}
                                        </TableHead>
                                    ))}
                                    <TableHead className="w-px text-end">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.data.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className={cn(
                                            row.deleted_at && 'opacity-60',
                                        )}
                                    >
                                        {schema.columns.map((column) => (
                                            <TableCell key={column.key}>
                                                <Cell
                                                    column={column}
                                                    row={row}
                                                    href={`${base}/${row.id}/edit`}
                                                    onToggle={() =>
                                                        router.post(
                                                            `${base}/${row.id}/toggle`,
                                                            {
                                                                column: column.key,
                                                            },
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                        ))}
                                        <TableCell className="text-end">
                                            <div className="flex justify-end gap-1">
                                                {row.deleted_at ? (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.post(
                                                                `${base}/${row.id}/restore`,
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <RotateCcw className="size-4" />
                                                        Restore
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="icon"
                                                        >
                                                            <Link
                                                                href={`${base}/${row.id}/edit`}
                                                            >
                                                                <span className="sr-only">
                                                                    Edit
                                                                </span>
                                                                <Pencil className="size-4" />
                                                            </Link>
                                                        </Button>
                                                        <ConfirmAction
                                                            title={`Delete this ${schema.singular.toLowerCase()}?`}
                                                            description={
                                                                schema.softDeletes
                                                                    ? 'It will be removed from the website and moved to the deleted list, where it can be restored.'
                                                                    : 'This cannot be undone.'
                                                            }
                                                            onConfirm={() =>
                                                                router.delete(
                                                                    `${base}/${row.id}`,
                                                                    {
                                                                        preserveScroll: true,
                                                                    },
                                                                )
                                                            }
                                                            trigger={
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-destructive"
                                                                >
                                                                    <span className="sr-only">
                                                                        Delete
                                                                    </span>
                                                                    <Trash2 className="size-4" />
                                                                </Button>
                                                            }
                                                        />
                                                    </>
                                                )}
                                            </div>
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

function SortIcon({
    active,
    direction,
}: {
    active: boolean;
    direction: string;
}) {
    if (!active) {
        return <ArrowUpDown aria-hidden="true" className="size-3 opacity-40" />;
    }

    return direction === 'asc' ? (
        <ArrowUp aria-hidden="true" className="size-3" />
    ) : (
        <ArrowDown aria-hidden="true" className="size-3" />
    );
}

function Cell({
    column,
    row,
    href,
    onToggle,
}: {
    column: Column;
    row: Row;
    href: string;
    onToggle: () => void;
}) {
    const value = get(row, column.key);

    switch (column.type) {
        case 'primary':
            return (
                <div className="flex items-center gap-3">
                    {row.thumb ? (
                        <img
                            src={row.thumb}
                            alt=""
                            loading="lazy"
                            className="size-9 shrink-0 rounded-md object-cover"
                        />
                    ) : null}
                    <Link
                        href={href}
                        className="font-medium transition-colors hover:text-primary"
                    >
                        {String(value ?? '—')}
                    </Link>
                </div>
            );

        case 'boolean':
            return (
                <Switch
                    checked={Boolean(value)}
                    onCheckedChange={onToggle}
                    aria-label={`Toggle ${column.label}`}
                />
            );

        case 'mono':
            return value ? (
                <code className="text-xs text-muted-foreground">
                    {String(value)}
                </code>
            ) : (
                <span className="text-muted-foreground">—</span>
            );

        case 'date':
            return (
                <span className="text-sm text-muted-foreground">
                    {value ? new Date(String(value)).toLocaleDateString() : '—'}
                </span>
            );

        case 'status':
            return (
                <StatusBadge
                    label={String(value ?? 'draft')}
                    tone={
                        value === 'published'
                            ? 'emerald'
                            : value === 'archived'
                              ? 'slate'
                              : 'amber'
                    }
                />
            );

        case 'badge':
            return value ? (
                <StatusBadge label={String(value)} />
            ) : (
                <span className="text-muted-foreground">—</span>
            );

        default:
            return (
                <span className="text-sm">
                    {value ? (
                        String(value)
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    )}
                </span>
            );
    }
}

function get(row: Row, path: string): unknown {
    // toRow() flattens dotted keys, so prefer the literal key before walking.
    if (path in row) {
        return row[path];
    }

    return path.split('.').reduce<unknown>((carry, key) => {
        if (carry && typeof carry === 'object') {
            return (carry as Record<string, unknown>)[key];
        }

        return undefined;
    }, row);
}
