import { router, useForm } from '@inertiajs/react';
import { ImagePlus, Loader2, Search, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    AdminEmptyState,
    AdminPagination,
    ConfirmAction,
    PageShell,
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
import { useSyncedState } from '@/hooks/use-synced-state';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types/site';

type MediaItem = {
    id: number;
    url: string;
    thumb: string;
    name: string;
    mime: string;
    extension: string;
    size: string;
    width: number | null;
    height: number | null;
    alt: string | null;
    title: string | null;
    isImage: boolean;
    createdAt: string | null;
};

type Props = {
    items: Paginated<MediaItem>;
    filters: { search: string; type: string };
    usage: { files: number; bytes: number };
};

export default function MediaIndex({ items, filters, usage }: Props) {
    const [search, setSearch] = useSyncedState(filters.search);
    const [active, setActive] = useState<MediaItem | null>(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);

    const visit = (params: Record<string, string>) =>
        router.get(
            '/admin/media',
            Object.fromEntries(
                Object.entries({
                    search,
                    type: filters.type,
                    ...params,
                }).filter(([, v]) => v !== ''),
            ),
            { preserveScroll: true, preserveState: true, replace: true },
        );

    const upload = (files: FileList | null) => {
        if (!files || files.length === 0) {
            return;
        }

        setUploading(true);

        router.post(
            '/admin/media',
            { files: Array.from(files) },
            {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => {
                    setUploading(false);

                    if (fileInput.current) {
                        fileInput.current.value = '';
                    }
                },
            },
        );
    };

    return (
        <PageShell
            title="Media library"
            description={`${usage.files} file${usage.files === 1 ? '' : 's'} · ${formatBytes(usage.bytes)} stored`}
            breadcrumbs={[
                { label: 'Dashboard', href: '/admin' },
                { label: 'Media library' },
            ]}
            actions={
                <Button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    disabled={uploading}
                >
                    {uploading ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Upload className="size-4" />
                    )}
                    Upload files
                </Button>
            }
        >
            <input
                ref={fileInput}
                type="file"
                multiple
                className="sr-only"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                onChange={(event) => upload(event.target.files)}
            />

            <div
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    upload(event.dataTransfer.files);
                }}
                className={cn(
                    'rounded-xl border bg-card transition-colors',
                    dragging && 'border-primary bg-primary/5',
                )}
            >
                <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
                    <form
                        className="relative w-full sm:max-w-xs"
                        onSubmit={(event) => {
                            event.preventDefault();
                            visit({});
                        }}
                    >
                        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by file name or alt text"
                            aria-label="Search media"
                            className="ps-9"
                        />
                    </form>

                    <select
                        value={filters.type}
                        aria-label="Filter by type"
                        onChange={(event) =>
                            visit({ type: event.target.value })
                        }
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    >
                        <option value="">All files</option>
                        <option value="image">Images</option>
                        <option value="document">Documents</option>
                    </select>

                    <p className="ms-auto hidden text-xs text-muted-foreground sm:block">
                        Drop files anywhere on this panel to upload
                    </p>
                </div>

                {items.data.length === 0 ? (
                    <AdminEmptyState
                        icon={ImagePlus}
                        title={
                            filters.search || filters.type
                                ? 'No files match'
                                : 'The library is empty'
                        }
                        description="Upload images, drawings and documents once and reuse them anywhere on the site."
                        action={
                            <Button
                                type="button"
                                onClick={() => fileInput.current?.click()}
                            >
                                <Upload className="size-4" />
                                Upload files
                            </Button>
                        }
                    />
                ) : (
                    <>
                        <ul className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                            {items.data.map((item) => (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        onClick={() => setActive(item)}
                                        className="group w-full overflow-hidden rounded-lg border text-start transition-colors hover:border-primary"
                                    >
                                        {item.isImage ? (
                                            <img
                                                src={item.thumb}
                                                alt={item.alt ?? ''}
                                                loading="lazy"
                                                className="aspect-square w-full object-cover"
                                            />
                                        ) : (
                                            <span className="flex aspect-square items-center justify-center bg-muted text-xs font-semibold uppercase">
                                                {item.extension}
                                            </span>
                                        )}
                                        <span className="block border-t p-2">
                                            <span className="block truncate text-xs font-medium">
                                                {item.name}
                                            </span>
                                            <span className="block text-[0.6875rem] text-muted-foreground">
                                                {item.size}
                                                {item.width
                                                    ? ` · ${item.width}×${item.height}`
                                                    : ''}
                                            </span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <AdminPagination page={items} />
                    </>
                )}
            </div>

            <MediaDetails item={active} onClose={() => setActive(null)} />
        </PageShell>
    );
}

function MediaDetails({
    item,
    onClose,
}: {
    item: MediaItem | null;
    onClose: () => void;
}) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        alt: item?.alt ?? '',
        title: item?.title ?? '',
    });

    useEffect(() => {
        if (item) {
            setData({ alt: item.alt ?? '', title: item.title ?? '' });
        } else {
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item?.id]);

    if (!item) {
        return null;
    }

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="truncate">{item.name}</DialogTitle>
                    <DialogDescription>
                        {item.mime} · {item.size}
                        {item.width ? ` · ${item.width}×${item.height} px` : ''}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="overflow-hidden rounded-lg bg-muted">
                        {item.isImage ? (
                            <img
                                src={item.url}
                                alt={item.alt ?? ''}
                                className="w-full object-contain"
                            />
                        ) : (
                            <div className="flex aspect-video items-center justify-center text-sm font-semibold uppercase">
                                {item.extension}
                            </div>
                        )}
                    </div>

                    <form
                        className="flex flex-col gap-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            patch(`/admin/media/${item.id}`, {
                                preserveScroll: true,
                                onSuccess: onClose,
                            });
                        }}
                    >
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="media-alt"
                                className="text-sm font-medium"
                            >
                                Alt text
                            </label>
                            <Input
                                id="media-alt"
                                value={data.alt}
                                onChange={(event) =>
                                    setData('alt', event.target.value)
                                }
                                placeholder="Describe the image for screen readers"
                            />
                            {errors.alt && (
                                <p className="text-xs text-destructive">
                                    {errors.alt}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="media-title"
                                className="text-sm font-medium"
                            >
                                Title
                            </label>
                            <Input
                                id="media-title"
                                value={data.title}
                                onChange={(event) =>
                                    setData('title', event.target.value)
                                }
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium">
                                Public URL
                            </span>
                            <Input
                                readOnly
                                value={item.url}
                                className="font-mono text-xs"
                            />
                        </div>

                        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                            <ConfirmAction
                                title="Delete this file?"
                                description="It will be removed from storage permanently. Anywhere it is used on the site will fall back to an empty state."
                                onConfirm={() =>
                                    router.delete(`/admin/media/${item.id}`, {
                                        preserveScroll: true,
                                        onSuccess: onClose,
                                    })
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

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onClose}
                                >
                                    <X className="size-4" />
                                    Close
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Save details
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function formatBytes(bytes: number): string {
    if (bytes === 0) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(
        units.length - 1,
        Math.floor(Math.log(bytes) / Math.log(1024)),
    );

    return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
