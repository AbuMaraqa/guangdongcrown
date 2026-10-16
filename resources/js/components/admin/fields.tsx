import { GripVertical, Plus, Trash2, X } from 'lucide-react';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { GalleryField, MediaField } from '@/components/admin/media-picker';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { SITE_ICON_NAMES, DynamicIcon } from '@/components/site/dynamic-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';

export type FieldSchema = {
    type: string;
    name: string;
    label: string;
    help?: string;
    placeholder?: string;
    panel?: 'main' | 'side';
    section?: string;
    width?: 'full' | 'half';
    options?: { value: string | number; label: string }[];
    relation?: string;
    from?: string;
    required?: boolean;
    translatable?: boolean;
    subfields?: FieldSchema[];
};

export type FieldErrors = Record<string, string>;

/**
 * Payload shape for the schema-driven CMS forms.
 *
 * Inertia's `FormDataType` is a deeply recursive mapped type that cannot
 * describe a bag whose keys are only known at runtime, so the values are
 * intentionally loose here. Correctness is enforced where it matters: every
 * field is validated server side by `CmsResourceRequest`, from the same
 * schema that renders this form.
 */

export type CmsFormData = Record<string, any>;

type FieldProps = {
    field: FieldSchema;
    value: unknown;
    onChange: (value: unknown) => void;
    errors: FieldErrors;
    /** Server-provided select options keyed by field name. */
    options?: Record<
        string,
        { value: string | number; label: string }[] | string[]
    >;
    /** Sibling values, used by the slug field to derive from its source. */
    siblings?: Record<string, unknown>;
};

/**
 * Renders one control from the CMS field schema.
 *
 * The schema is authored once in PHP (`App\Cms\Field`) and drives both the
 * server-side validation rules and this UI, so a new field never needs a new
 * bespoke screen.
 */
export function SchemaField(props: FieldProps) {
    return props.field.translatable ? (
        <TranslatableField {...props} />
    ) : (
        <PlainField {...props} />
    );
}

/**
 * One input per supported locale, for a value stored as `{ en, ar, … }`.
 *
 * The server validates each locale under `name.code`, so every input reads
 * its own error rather than the field's.
 */
function TranslatableField({ field, value, onChange, errors }: FieldProps) {
    const { locales } = useTranslations();
    const values =
        value !== null && typeof value === 'object'
            ? (value as Record<string, unknown>)
            : {};
    const error = errors[field.name];

    return (
        <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">
                {field.label}
                {field.required && (
                    <span aria-hidden="true" className="ms-1 text-destructive">
                        *
                    </span>
                )}
            </legend>

            <div className="grid gap-3 rounded-lg border p-3">
                {locales.map((locale) => (
                    <div key={locale.code} dir={locale.direction}>
                        <PlainField
                            field={{
                                ...field,
                                translatable: false,
                                help: undefined,
                                label: locale.native,
                            }}
                            value={values[locale.code] ?? ''}
                            errors={{
                                [field.name]:
                                    errors[`${field.name}.${locale.code}`] ??
                                    '',
                            }}
                            onChange={(next) =>
                                onChange({ ...values, [locale.code]: next })
                            }
                        />
                    </div>
                ))}
            </div>

            {field.help && !error && (
                <p className="text-xs text-muted-foreground">{field.help}</p>
            )}
            {error && (
                <p role="alert" className="text-xs text-destructive">
                    {error}
                </p>
            )}
        </fieldset>
    );
}

function PlainField({
    field,
    value,
    onChange,
    errors,
    options,
    siblings,
}: FieldProps) {
    const id = useId();
    const error = errors[field.name];
    const choices = resolveChoices(field, options);

    const control = (() => {
        switch (field.type) {
            case 'textarea':
                return (
                    <Textarea
                        id={id}
                        rows={4}
                        value={asString(value)}
                        placeholder={field.placeholder}
                        aria-invalid={Boolean(error)}
                        onChange={(event) => onChange(event.target.value)}
                    />
                );

            case 'richtext':
                return (
                    <RichTextEditor
                        value={asString(value)}
                        invalid={Boolean(error)}
                        placeholder={field.placeholder}
                        onChange={onChange}
                    />
                );

            case 'slug':
                return (
                    <SlugInput
                        id={id}
                        value={asString(value)}
                        source={
                            field.from ? asString(siblings?.[field.from]) : ''
                        }
                        invalid={Boolean(error)}
                        onChange={onChange}
                    />
                );

            case 'number':
                return (
                    <Input
                        id={id}
                        type="number"
                        value={
                            value === null || value === undefined
                                ? ''
                                : String(value)
                        }
                        placeholder={field.placeholder}
                        aria-invalid={Boolean(error)}
                        onChange={(event) =>
                            onChange(
                                event.target.value === ''
                                    ? null
                                    : Number(event.target.value),
                            )
                        }
                    />
                );

            case 'date':
            case 'datetime':
                return (
                    <Input
                        id={id}
                        type={field.type === 'date' ? 'date' : 'datetime-local'}
                        value={asString(value)}
                        aria-invalid={Boolean(error)}
                        onChange={(event) =>
                            onChange(event.target.value || null)
                        }
                    />
                );

            case 'toggle':
                return (
                    <div className="flex items-center gap-3 pt-1">
                        <Switch
                            id={id}
                            checked={Boolean(value)}
                            onCheckedChange={(checked) => onChange(checked)}
                        />
                        <label
                            htmlFor={id}
                            className="cursor-pointer text-sm text-muted-foreground"
                        >
                            {value ? 'Enabled' : 'Disabled'}
                        </label>
                    </div>
                );

            case 'select':
                return (
                    <select
                        id={id}
                        value={
                            value === null || value === undefined
                                ? ''
                                : String(value)
                        }
                        aria-invalid={Boolean(error)}
                        onChange={(event) =>
                            onChange(
                                event.target.value === ''
                                    ? null
                                    : coerceOptionValue(
                                          event.target.value,
                                          choices,
                                      ),
                            )
                        }
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30"
                    >
                        <option value="">Not set</option>
                        {choices.map((choice) => (
                            <option
                                key={String(choice.value)}
                                value={String(choice.value)}
                            >
                                {choice.label}
                            </option>
                        ))}
                    </select>
                );

            case 'multiselect':
                return (
                    <CheckboxGroup
                        choices={choices}
                        value={
                            Array.isArray(value)
                                ? (value as (string | number)[])
                                : []
                        }
                        onChange={onChange}
                    />
                );

            case 'icon':
                return (
                    <IconPicker
                        id={id}
                        value={asString(value)}
                        onChange={onChange}
                    />
                );

            case 'image':
                return (
                    <MediaField
                        label={field.label}
                        value={typeof value === 'number' ? value : null}
                        onChange={onChange}
                    />
                );

            case 'gallery':
                return (
                    <GalleryField
                        value={Array.isArray(value) ? (value as number[]) : []}
                        onChange={onChange}
                    />
                );

            case 'list':
                return (
                    <StringList
                        value={Array.isArray(value) ? (value as string[]) : []}
                        onChange={onChange}
                        placeholder={field.placeholder}
                    />
                );

            case 'tags':
                return (
                    <TagInput
                        value={Array.isArray(value) ? (value as string[]) : []}
                        onChange={onChange}
                        suggestions={
                            (options?.tagSuggestions as string[] | undefined) ??
                            []
                        }
                    />
                );

            case 'repeater':
                return (
                    <Repeater
                        field={field}
                        value={
                            Array.isArray(value)
                                ? (value as Record<string, unknown>[])
                                : []
                        }
                        onChange={onChange}
                        errors={errors}
                    />
                );

            default:
                return (
                    <Input
                        id={id}
                        type={
                            field.type === 'email'
                                ? 'email'
                                : field.type === 'url'
                                  ? 'url'
                                  : 'text'
                        }
                        value={asString(value)}
                        placeholder={field.placeholder}
                        aria-invalid={Boolean(error)}
                        onChange={(event) => onChange(event.target.value)}
                    />
                );
        }
    })();

    return (
        <div
            className={cn(
                'flex flex-col gap-2',
                field.width === 'half' && 'sm:col-span-1',
            )}
        >
            {field.type !== 'toggle' && (
                <label htmlFor={id} className="text-sm font-medium">
                    {field.label}
                    {field.required && (
                        <span
                            aria-hidden="true"
                            className="ms-1 text-destructive"
                        >
                            *
                        </span>
                    )}
                </label>
            )}
            {field.type === 'toggle' && (
                <span className="text-sm font-medium">{field.label}</span>
            )}

            {control}

            {field.help && !error && (
                <p className="text-xs text-muted-foreground">{field.help}</p>
            )}
            {error && (
                <p role="alert" className="text-xs text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}

function SlugInput({
    id,
    value,
    source,
    invalid,
    onChange,
}: {
    id: string;
    value: string;
    source: string;
    invalid: boolean;
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex gap-2">
            <Input
                id={id}
                value={value}
                aria-invalid={invalid}
                placeholder="auto-generated"
                onChange={(event) => onChange(slugify(event.target.value))}
                className="font-mono text-xs"
            />
            <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!source}
                onClick={() => onChange(slugify(source))}
            >
                Generate
            </Button>
        </div>
    );
}

function CheckboxGroup({
    choices,
    value,
    onChange,
}: {
    choices: { value: string | number; label: string }[];
    value: (string | number)[];
    onChange: (value: (string | number)[]) => void;
}) {
    if (choices.length === 0) {
        return (
            <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                Nothing to link yet — create some first.
            </p>
        );
    }

    return (
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border p-2">
            {choices.map((choice) => {
                const checked = value.some(
                    (item) => String(item) === String(choice.value),
                );

                return (
                    <label
                        key={String(choice.value)}
                        className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 text-sm hover:bg-accent"
                    >
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                                onChange(
                                    checked
                                        ? value.filter(
                                              (item) =>
                                                  String(item) !==
                                                  String(choice.value),
                                          )
                                        : [...value, choice.value],
                                )
                            }
                            className="size-4 accent-primary"
                        />
                        {choice.label}
                    </label>
                );
            })}
        </div>
    );
}

function IconPicker({
    id,
    value,
    onChange,
}: {
    id: string;
    value: string;
    onChange: (value: string | null) => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                    <DynamicIcon name={value} className="size-4" />
                </span>
                <Input
                    id={id}
                    value={value}
                    placeholder="none"
                    onChange={(event) => onChange(event.target.value || null)}
                    className="font-mono text-xs"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOpen((o) => !o)}
                >
                    {open ? 'Close' : 'Browse'}
                </Button>
            </div>

            {open && (
                <div className="grid max-h-48 grid-cols-8 gap-1 overflow-y-auto rounded-md border p-2">
                    {SITE_ICON_NAMES.map((name) => (
                        <button
                            key={name}
                            type="button"
                            title={name}
                            onClick={() => {
                                onChange(name);
                                setOpen(false);
                            }}
                            className={cn(
                                'flex aspect-square items-center justify-center rounded hover:bg-accent',
                                value === name &&
                                    'bg-primary text-primary-foreground',
                            )}
                        >
                            <span className="sr-only">{name}</span>
                            <DynamicIcon name={name} className="size-4" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function StringList({
    value,
    onChange,
    placeholder,
}: {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
}) {
    return (
        <div className="space-y-2">
            {value.map((entry, index) => (
                <div key={index} className="flex gap-2">
                    <Input
                        value={entry}
                        placeholder={placeholder}
                        onChange={(event) => {
                            const next = [...value];
                            next[index] = event.target.value;
                            onChange(next);
                        }}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            onChange(value.filter((_, i) => i !== index))
                        }
                    >
                        <span className="sr-only">Remove item</span>
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange([...value, ''])}
            >
                <Plus className="size-4" />
                Add item
            </Button>
        </div>
    );
}

function TagInput({
    value,
    onChange,
    suggestions,
}: {
    value: string[];
    onChange: (value: string[]) => void;
    suggestions: string[];
}) {
    const [draft, setDraft] = useState('');
    const listId = useId();

    const add = (tag: string) => {
        const clean = tag.trim();

        if (clean && !value.includes(clean)) {
            onChange([...value, clean]);
        }

        setDraft('');
    };

    return (
        <div className="space-y-2">
            {value.length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                    {value.map((tag) => (
                        <li
                            key={tag}
                            className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() =>
                                    onChange(
                                        value.filter((item) => item !== tag),
                                    )
                                }
                                className="opacity-60 hover:opacity-100"
                            >
                                <span className="sr-only">Remove {tag}</span>
                                <X className="size-3" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <Input
                value={draft}
                list={listId}
                placeholder="Type a tag and press Enter"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ',') {
                        event.preventDefault();
                        add(draft);
                    }
                }}
                onBlur={() => draft && add(draft)}
            />
            <datalist id={listId}>
                {suggestions.map((suggestion) => (
                    <option key={suggestion} value={suggestion} />
                ))}
            </datalist>
        </div>
    );
}

function Repeater({
    field,
    value,
    onChange,
    errors,
}: {
    field: FieldSchema;
    value: Record<string, unknown>[];
    onChange: (value: Record<string, unknown>[]) => void;
    errors: FieldErrors;
}) {
    const subfields = field.subfields ?? [];

    const blank = () =>
        Object.fromEntries(
            subfields.map((sub) => [
                sub.name,
                sub.type === 'toggle' ? false : '',
            ]),
        );

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
            {value.map((row, index) => (
                <div key={index} className="rounded-lg border bg-muted/30 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <GripVertical className="size-3.5" />
                            Item {index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={index === 0}
                                onClick={() => move(index, index - 1)}
                            >
                                <span className="sr-only">Move up</span>↑
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={index === value.length - 1}
                                onClick={() => move(index, index + 1)}
                            >
                                <span className="sr-only">Move down</span>↓
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                    onChange(
                                        value.filter((_, i) => i !== index),
                                    )
                                }
                            >
                                <span className="sr-only">
                                    Remove item {index + 1}
                                </span>
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {subfields.map((sub) => (
                            <div
                                key={sub.name}
                                className={cn(
                                    sub.width === 'half'
                                        ? 'sm:col-span-1'
                                        : 'sm:col-span-2',
                                )}
                            >
                                <SchemaField
                                    field={sub}
                                    value={row[sub.name] ?? ''}
                                    errors={rowErrors(
                                        errors,
                                        `${field.name}.${index}.`,
                                    )}
                                    onChange={(next) => {
                                        const rows = [...value];
                                        rows[index] = {
                                            ...rows[index],
                                            [sub.name]: next,
                                        };
                                        onChange(rows);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange([...value, blank()])}
            >
                <Plus className="size-4" />
                Add {field.label.toLowerCase()}
            </Button>
        </div>
    );
}

/**
 * Groups fields into the labelled cards used by the form layout.
 */
export function FieldSection({
    title,
    children,
    className,
}: {
    title: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn('rounded-xl border bg-card p-5 sm:p-6', className)}
        >
            <h2 className="mb-5 text-sm font-semibold tracking-wide uppercase">
                {title}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">{children}</div>
        </section>
    );
}

function resolveChoices(
    field: FieldSchema,
    options?: Record<
        string,
        { value: string | number; label: string }[] | string[]
    >,
): { value: string | number; label: string }[] {
    if (field.options && field.options.length > 0) {
        return field.options;
    }

    const provided = options?.[field.relation ?? field.name];

    if (
        Array.isArray(provided) &&
        provided.length > 0 &&
        typeof provided[0] === 'object'
    ) {
        return provided as { value: string | number; label: string }[];
    }

    return [];
}

function coerceOptionValue(
    raw: string,
    choices: { value: string | number; label: string }[],
): string | number {
    const match = choices.find((choice) => String(choice.value) === raw);

    return match ? match.value : raw;
}

/**
 * Re-keys a repeater row's errors relative to the row, so a sub-field —
 * including a translatable one reading `name.code` — finds its own messages.
 */
function rowErrors(errors: FieldErrors, prefix: string): FieldErrors {
    return Object.fromEntries(
        Object.entries(errors)
            .filter(([key]) => key.startsWith(prefix))
            .map(([key, message]) => [key.slice(prefix.length), message]),
    );
}

function asString(value: unknown): string {
    return value === null || value === undefined ? '' : String(value);
}

export function slugify(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
