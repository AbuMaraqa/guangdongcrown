import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types/site';

/**
 * Shared dashboard page furniture: title block, breadcrumbs, empty states,
 * pagination and a reusable destructive-action confirmation.
 */

export function PageShell({
    title,
    description,
    actions,
    breadcrumbs,
    children,
}: {
    title: string;
    description?: string | null;
    actions?: ReactNode;
    breadcrumbs?: { label: string; href?: string }[];
    children: ReactNode;
}) {
    return (
        <div className="mx-auto w-full max-w-[100rem] space-y-6">
            <Head title={title} />

            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav aria-label="Breadcrumb">
                    <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                        {breadcrumbs.map((crumb, index) => (
                            <li
                                key={crumb.label}
                                className="flex items-center gap-1.5"
                            >
                                {index > 0 && (
                                    <ChevronRight
                                        aria-hidden="true"
                                        className="size-3.5 opacity-50"
                                    />
                                )}
                                {crumb.href ? (
                                    <Link
                                        href={crumb.href}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-foreground">
                                        {crumb.label}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {actions && (
                    <div className="flex shrink-0 flex-wrap gap-2">
                        {actions}
                    </div>
                )}
            </div>

            {children}
        </div>
    );
}

export function AdminEmptyState({
    title,
    description,
    action,
    icon: Icon = Inbox,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
    icon?: ComponentType<{ className?: string }>;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center">
            <Icon className="size-8 text-muted-foreground" />
            <p className="mt-4 font-medium">{title}</p>
            {description && (
                <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                    {description}
                </p>
            )}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}

export function AdminPagination<T>({ page }: { page: Paginated<T> }) {
    if (page.last_page <= 1) {
        return null;
    }

    const go = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveScroll: true, preserveState: true });
        }
    };

    return (
        <nav
            aria-label="Pagination"
            className="flex items-center justify-between gap-4 border-t px-4 py-3"
        >
            <p className="text-sm text-muted-foreground">
                Showing {page.from ?? 0}–{page.to ?? 0} of {page.total}
            </p>
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!page.links[0].url}
                    onClick={() => go(page.links[0].url)}
                >
                    <ChevronLeft className="size-4" />
                    Previous
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!page.links[page.links.length - 1].url}
                    onClick={() => go(page.links[page.links.length - 1].url)}
                >
                    Next
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </nav>
    );
}

/**
 * Wraps a destructive action in a confirmation dialog so nothing is deleted
 * on a single mis-click.
 */
export function ConfirmAction({
    trigger,
    title,
    description,
    confirmLabel = 'Delete',
    onConfirm,
}: {
    trigger: ReactNode;
    title: string;
    description: string;
    confirmLabel?: string;
    onConfirm: () => void;
}) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-destructive text-white hover:bg-destructive/90"
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

const TONES: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
};

export function StatusBadge({
    label,
    tone = 'slate',
    className,
}: {
    label: string;
    tone?: string;
    className?: string;
}) {
    return (
        <Badge
            variant="secondary"
            className={cn(
                'border-0 font-medium',
                TONES[tone] ?? TONES.slate,
                className,
            )}
        >
            {label}
        </Badge>
    );
}
