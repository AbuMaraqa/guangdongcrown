import { ImagePlus, Loader2, Search, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type MediaItem = {
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

/**
 * Shared media browser. Lists the library, uploads new files and returns the
 * chosen ids. Used by both the single-image field and the gallery field.
 */
export function MediaLibraryDialog({
    open,
    onOpenChange,
    onSelect,
    multiple = false,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (items: MediaItem[]) => void;
    multiple?: boolean;
}) {
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<number[]>([]);
    const fileInput = useRef<HTMLInputElement>(null);

    const load = useCallback(async (term: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/admin/media/browse?${new URLSearchParams(term ? { search: term } : {})}`,
                {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                },
            );

            if (!response.ok) {
                throw new Error('Unable to load the media library.');
            }

            const payload = (await response.json()) as { items: MediaItem[] };
            setItems(payload.items);
        } catch {
            setError(
                'The media library could not be loaded. Please try again.',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // Clear the previous selection as soon as the dialog re-opens.
    const [wasOpen, setWasOpen] = useState(open);

    if (open !== wasOpen) {
        setWasOpen(open);

        if (open) {
            setSelected([]);
        }
    }

    useEffect(() => {
        if (!open) {
            return;
        }

        const timer = setTimeout(() => load(search), search ? 300 : 0);

        return () => clearTimeout(timer);
    }, [load, open, search]);

    const upload = async (files: FileList | null) => {
        if (!files || files.length === 0) {
            return;
        }

        setUploading(true);
        setError(null);

        const body = new FormData();
        Array.from(files).forEach((file) => body.append('files[]', file));

        try {
            const response = await fetch('/admin/media', {
                method: 'POST',
                body,
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        readCookie('XSRF-TOKEN') ?? '',
                    ),
                },
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => null);

                throw new Error(payload?.message ?? 'Upload failed.');
            }

            const payload = (await response.json()) as { items: MediaItem[] };
            setItems((current) => [
                ...payload.items,
                ...current.filter(
                    (item) =>
                        !payload.items.some((fresh) => fresh.id === item.id),
                ),
            ]);
            setSelected(payload.items.map((item) => item.id));
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Upload failed.',
            );
        } finally {
            setUploading(false);

            if (fileInput.current) {
                fileInput.current.value = '';
            }
        }
    };

    const toggle = (item: MediaItem) => {
        setSelected((current) => {
            if (!multiple) {
                return [item.id];
            }

            return current.includes(item.id)
                ? current.filter((id) => id !== item.id)
                : [...current, item.id];
        });
    };

    const confirm = () => {
        onSelect(items.filter((item) => selected.includes(item.id)));
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Media library</DialogTitle>
                    <DialogDescription>
                        {multiple
                            ? 'Select one or more files, or upload new ones.'
                            : 'Select a file, or upload a new one.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-48 flex-1">
                        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search files"
                            className="ps-9"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInput.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Upload className="size-4" />
                        )}
                        Upload
                    </Button>
                    <input
                        ref={fileInput}
                        type="file"
                        multiple
                        className="sr-only"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                        onChange={(event) => upload(event.target.files)}
                    />
                </div>

                {error && (
                    <p role="alert" className="text-sm text-destructive">
                        {error}
                    </p>
                )}

                <div className="-mx-1 min-h-64 flex-1 overflow-y-auto px-1">
                    {loading ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                            {Array.from({ length: 10 }).map((_, index) => (
                                <Skeleton
                                    key={index}
                                    className="aspect-square rounded-md"
                                />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-muted-foreground">
                            <ImagePlus className="size-7" />
                            <p className="text-sm">
                                {search
                                    ? 'No files match that search.'
                                    : 'The library is empty.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => toggle(item)}
                                    aria-pressed={selected.includes(item.id)}
                                    className={cn(
                                        'group relative aspect-square overflow-hidden rounded-md border-2 transition-colors',
                                        selected.includes(item.id)
                                            ? 'border-primary'
                                            : 'border-transparent hover:border-muted-foreground/40',
                                    )}
                                >
                                    {item.isImage ? (
                                        <img
                                            src={item.thumb}
                                            alt={item.alt ?? ''}
                                            loading="lazy"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-full w-full flex-col items-center justify-center gap-1 bg-muted p-2 text-center">
                                            <span className="text-xs font-semibold uppercase">
                                                {item.extension}
                                            </span>
                                            <span className="line-clamp-2 text-[0.6875rem] text-muted-foreground">
                                                {item.name}
                                            </span>
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                        {selected.length} selected
                    </p>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={confirm}
                            disabled={selected.length === 0}
                        >
                            Use{' '}
                            {multiple && selected.length > 1
                                ? `${selected.length} files`
                                : 'file'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Single-image control backed by the library dialog.
 */
export function MediaField({
    value,
    onChange,
    label,
}: {
    value: number | null;
    onChange: (id: number | null) => void;
    label: string;
}) {
    const [open, setOpen] = useState(false);
    const [preview, setPreview] = useState<MediaItem | null>(null);

    // Only show the cached record while it still matches the selected id, so
    // clearing the field needs no state reset of its own.
    const shown = value !== null && preview?.id === value ? preview : null;

    useEffect(() => {
        if (!value || preview?.id === value) {
            return;
        }

        let cancelled = false;

        fetchMedia([value])
            .then((found) => {
                if (!cancelled) {
                    setPreview(found[0] ?? null);
                }
            })
            .catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, [preview?.id, value]);

    return (
        <>
            {shown ? (
                <div className="group relative overflow-hidden rounded-lg border">
                    {shown.isImage ? (
                        <img
                            src={shown.thumb}
                            alt={shown.alt ?? ''}
                            className="aspect-video w-full object-cover"
                        />
                    ) : (
                        <div className="flex aspect-video items-center justify-center bg-muted text-sm">
                            {shown.name}
                        </div>
                    )}
                    <div className="flex items-center justify-between gap-2 border-t p-2">
                        <span className="truncate text-xs text-muted-foreground">
                            {shown.name}
                        </span>
                        <div className="flex gap-1">
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => setOpen(true)}
                            >
                                Replace
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => onChange(null)}
                            >
                                <span className="sr-only">Remove {label}</span>
                                <X className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground"
                >
                    <ImagePlus className="size-6" />
                    <span className="text-sm">
                        Choose {label.toLowerCase()}
                    </span>
                </button>
            )}

            <MediaLibraryDialog
                open={open}
                onOpenChange={setOpen}
                onSelect={(picked) => {
                    const item = picked[0];

                    if (item) {
                        setPreview(item);
                        onChange(item.id);
                    }
                }}
            />
        </>
    );
}

/**
 * Ordered multi-image gallery control.
 */
export function GalleryField({
    value,
    onChange,
}: {
    value: number[];
    onChange: (ids: number[]) => void;
}) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Record<number, MediaItem>>({});

    useEffect(() => {
        const missing = value.filter((id) => !items[id]);

        if (missing.length === 0) {
            return;
        }

        let cancelled = false;

        fetchMedia(missing)
            .then((found) => {
                if (cancelled || found.length === 0) {
                    return;
                }

                setItems((current) => {
                    const next = { ...current };
                    found.forEach((item) => {
                        next[item.id] = item;
                    });

                    return next;
                });
            })
            .catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, [items, value]);

    const move = (from: number, to: number) => {
        if (to < 0 || to >= value.length) {
            return;
        }

        const next = [...value];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        onChange(next);
    };

    return (
        <div className="space-y-3">
            {value.length > 0 && (
                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {value.map((id, index) => {
                        const item = items[id];

                        return (
                            <li
                                key={id}
                                className="group relative overflow-hidden rounded-md border"
                            >
                                {item?.isImage ? (
                                    <img
                                        src={item.thumb}
                                        alt={item.alt ?? ''}
                                        className="aspect-square w-full object-cover"
                                    />
                                ) : (
                                    <div className="aspect-square bg-muted" />
                                )}
                                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                                    <button
                                        type="button"
                                        onClick={() => move(index, index - 1)}
                                        disabled={index === 0}
                                        className="px-1.5 text-xs text-white disabled:opacity-40"
                                    >
                                        <span className="sr-only">
                                            Move earlier
                                        </span>
                                        ←
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onChange(
                                                value.filter((v) => v !== id),
                                            )
                                        }
                                        className="px-1.5 text-white"
                                    >
                                        <span className="sr-only">
                                            Remove from gallery
                                        </span>
                                        <Trash2 className="size-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => move(index, index + 1)}
                                        disabled={index === value.length - 1}
                                        className="px-1.5 text-xs text-white disabled:opacity-40"
                                    >
                                        <span className="sr-only">
                                            Move later
                                        </span>
                                        →
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
            >
                <ImagePlus className="size-4" />
                Add images
            </Button>

            <MediaLibraryDialog
                open={open}
                onOpenChange={setOpen}
                multiple
                onSelect={(picked) => {
                    setItems((current) => {
                        const next = { ...current };
                        picked.forEach((item) => {
                            next[item.id] = item;
                        });

                        return next;
                    });
                    onChange([
                        ...value,
                        ...picked
                            .map((item) => item.id)
                            .filter((id) => !value.includes(id)),
                    ]);
                }}
            />
        </div>
    );
}

/**
 * Rehydrates the media records a form already references, by id.
 */
async function fetchMedia(ids: number[]): Promise<MediaItem[]> {
    if (ids.length === 0) {
        return [];
    }

    const response = await fetch(`/admin/media/browse?ids=${ids.join(',')}`, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
    });

    if (!response.ok) {
        return [];
    }

    const payload = (await response.json()) as { items: MediaItem[] };

    return payload.items;
}

function readCookie(name: string): string | null {
    return (
        document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
            ?.split('=')[1] ?? null
    );
}
