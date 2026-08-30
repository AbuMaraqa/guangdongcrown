import { router, useForm } from '@inertiajs/react';
import {
    KeyRound,
    Pencil,
    Plus,
    Search,
    ShieldCheck,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import {
    AdminPagination,
    ConfirmAction,
    PageShell,
    StatusBadge,
} from '@/components/admin/shell';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import type { Paginated } from '@/types/site';

type Row = {
    id: number;
    name: string;
    email: string;
    jobTitle: string | null;
    role: string;
    roleLabel: string;
    isActive: boolean;
    twoFactor: boolean;
    lastLoginAt: string | null;
    isSelf: boolean;
};

type RoleOption = { value: string; label: string; description: string };

type Props = {
    rows: Paginated<Row>;
    filters: { search: string };
    roles: RoleOption[];
};

export default function UserIndex({ rows, filters, roles }: Props) {
    const [search, setSearch] = useSyncedState(filters.search);
    const [editing, setEditing] = useState<Row | null>(null);
    const [creating, setCreating] = useState(false);

    return (
        <PageShell
            title="Dashboard accounts"
            description="Who can sign in, and what they are allowed to change."
            breadcrumbs={[
                { label: 'Dashboard', href: '/admin' },
                { label: 'Accounts' },
            ]}
            actions={
                <Button type="button" onClick={() => setCreating(true)}>
                    <Plus className="size-4" />
                    New account
                </Button>
            }
        >
            <div className="grid gap-3 sm:grid-cols-3">
                {roles.map((role) => (
                    <div
                        key={role.value}
                        className="rounded-xl border bg-card p-4"
                    >
                        <p className="flex items-center gap-2 text-sm font-medium">
                            <ShieldCheck className="size-4 text-muted-foreground" />
                            {role.label}
                        </p>
                        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                            {role.description}
                        </p>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border bg-card">
                <div className="border-b p-4">
                    <form
                        className="relative w-full sm:max-w-xs"
                        onSubmit={(event) => {
                            event.preventDefault();
                            router.get(
                                '/admin/users',
                                search ? { search } : {},
                                {
                                    preserveScroll: true,
                                    preserveState: true,
                                    replace: true,
                                },
                            );
                        }}
                    >
                        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search name or email"
                            aria-label="Search accounts"
                            className="ps-9"
                        />
                    </form>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Person</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Two-factor</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead>Last sign-in</TableHead>
                            <TableHead className="w-px text-end">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.data.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>
                                    <p className="font-medium">
                                        {row.name}
                                        {row.isSelf && (
                                            <span className="ms-2 text-xs text-muted-foreground">
                                                (you)
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {row.jobTitle
                                            ? `${row.jobTitle} · `
                                            : ''}
                                        {row.email}
                                    </p>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge
                                        label={row.roleLabel}
                                        tone={
                                            row.role === 'super_admin'
                                                ? 'violet'
                                                : row.role === 'admin'
                                                  ? 'blue'
                                                  : 'slate'
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    {row.twoFactor ? (
                                        <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                                            <KeyRound className="size-3.5" />
                                            Enabled
                                        </span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">
                                            Not set up
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge
                                        label={
                                            row.isActive
                                                ? 'Active'
                                                : 'Suspended'
                                        }
                                        tone={
                                            row.isActive ? 'emerald' : 'slate'
                                        }
                                    />
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {row.lastLoginAt
                                        ? new Date(
                                              row.lastLoginAt,
                                          ).toLocaleDateString()
                                        : '—'}
                                </TableCell>
                                <TableCell className="text-end">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setEditing(row)}
                                        >
                                            <span className="sr-only">
                                                Edit {row.name}
                                            </span>
                                            <Pencil className="size-4" />
                                        </Button>
                                        {!row.isSelf && (
                                            <ConfirmAction
                                                title={`Remove ${row.name}?`}
                                                description="They will lose access to the dashboard immediately."
                                                confirmLabel="Remove account"
                                                onConfirm={() =>
                                                    router.delete(
                                                        `/admin/users/${row.id}`,
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
                                                            Remove {row.name}
                                                        </span>
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                }
                                            />
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <AdminPagination page={rows} />
            </div>

            {(creating || editing) && (
                <AccountDialog
                    user={editing}
                    roles={roles}
                    onClose={() => {
                        setCreating(false);
                        setEditing(null);
                    }}
                />
            )}
        </PageShell>
    );
}

function AccountDialog({
    user,
    roles,
    onClose,
}: {
    user: Row | null;
    roles: RoleOption[];
    onClose: () => void;
}) {
    const isEdit = user !== null;

    const { data, setData, post, patch, processing, errors } = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        job_title: user?.jobTitle ?? '',
        role: user?.role ?? 'editor',
        is_active: user?.isActive ?? true,
        password: '',
        password_confirmation: '',
    });

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? `Edit ${user.name}` : 'New dashboard account'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Leave the password blank to keep the current one.'
                            : 'The account is created verified and can sign in immediately.'}
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    onSubmit={(event) => {
                        event.preventDefault();

                        if (isEdit) {
                            patch(`/admin/users/${user.id}`, {
                                preserveScroll: true,
                                onSuccess: onClose,
                            });
                        } else {
                            post('/admin/users', {
                                preserveScroll: true,
                                onSuccess: onClose,
                            });
                        }
                    }}
                >
                    <TextField
                        id="user-name"
                        label="Full name"
                        value={data.name}
                        error={errors.name}
                        onChange={(value) => setData('name', value)}
                    />
                    <TextField
                        id="user-email"
                        label="Email"
                        type="email"
                        value={data.email}
                        error={errors.email}
                        onChange={(value) => setData('email', value)}
                    />
                    <TextField
                        id="user-job"
                        label="Job title"
                        value={data.job_title}
                        error={errors.job_title}
                        onChange={(value) => setData('job_title', value)}
                    />

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="user-role"
                            className="text-sm font-medium"
                        >
                            Role
                        </label>
                        <select
                            id="user-role"
                            value={data.role}
                            onChange={(event) =>
                                setData('role', event.target.value)
                            }
                            disabled={user?.isSelf}
                            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm disabled:opacity-60"
                        >
                            {roles.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-muted-foreground">
                            {
                                roles.find((role) => role.value === data.role)
                                    ?.description
                            }
                        </p>
                        {errors.role && (
                            <p className="text-xs text-destructive">
                                {errors.role}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                            <p className="text-sm font-medium">
                                Account active
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Suspended accounts cannot sign in.
                            </p>
                        </div>
                        <Switch
                            checked={data.is_active}
                            disabled={user?.isSelf}
                            onCheckedChange={(checked) =>
                                setData('is_active', checked)
                            }
                        />
                    </div>
                    {errors.is_active && (
                        <p className="text-xs text-destructive">
                            {errors.is_active}
                        </p>
                    )}

                    <TextField
                        id="user-password"
                        label={isEdit ? 'New password (optional)' : 'Password'}
                        type="password"
                        value={data.password}
                        error={errors.password}
                        onChange={(value) => setData('password', value)}
                    />
                    <TextField
                        id="user-password-confirm"
                        label="Confirm password"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(value) =>
                            setData('password_confirmation', value)
                        }
                    />

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {isEdit ? 'Save account' : 'Create account'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function TextField({
    id,
    label,
    value,
    onChange,
    type = 'text',
    error,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    error?: string;
}) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-sm font-medium">
                {label}
            </label>
            <Input
                id={id}
                type={type}
                value={value}
                autoComplete={type === 'password' ? 'new-password' : undefined}
                onChange={(event) => onChange(event.target.value)}
                aria-invalid={Boolean(error)}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
