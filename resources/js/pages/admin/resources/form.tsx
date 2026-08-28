import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, Loader2, Save, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FieldSection, SchemaField } from '@/components/admin/fields';
import type { CmsFormData, FieldSchema } from '@/components/admin/fields';
import { ConfirmAction, PageShell } from '@/components/admin/shell';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type Schema = {
    key: string;
    label: string;
    singular: string;
    fields: FieldSchema[];
    hasSeo: boolean;
    hasGallery: boolean;
    softDeletes: boolean;
};

type Props = {
    schema: Schema;
    options: Record<
        string,
        { value: string | number; label: string }[] | string[]
    >;
    record: {
        id: number;
        title: string;
        updated_at: string | null;
        url: string | null;
    } | null;
    data: CmsFormData;
};

const SEO_FIELDS: FieldSchema[] = [
    {
        type: 'text',
        name: 'meta_title',
        label: 'Meta title',
        help: 'Around 60 characters. Falls back to the record title when empty.',
    },
    {
        type: 'textarea',
        name: 'meta_description',
        label: 'Meta description',
        help: 'Around 155 characters. Shown under the title in search results.',
    },
    { type: 'text', name: 'canonical_url', label: 'Canonical URL' },
    { type: 'text', name: 'og_title', label: 'Social title' },
    { type: 'textarea', name: 'og_description', label: 'Social description' },
    { type: 'image', name: 'og_image_id', label: 'Social share image' },
    {
        type: 'select',
        name: 'robots',
        label: 'Robots directive',
        options: [
            { value: 'index,follow', label: 'Index, follow (default)' },
            { value: 'noindex,follow', label: 'No index, follow' },
            { value: 'index,nofollow', label: 'Index, no follow' },
            { value: 'noindex,nofollow', label: 'No index, no follow' },
        ],
    },
];

/**
 * The one create/edit screen used by every CMS resource, laid out from the
 * schema: main fields on the left, publishing and media in the sidebar, and
 * an SEO tab for anything that carries meta.
 */
export default function ResourceForm({ schema, options, record, data }: Props) {
    const base = `/admin/content/${schema.key}`;
    const isEdit = record !== null;
    const [tab, setTab] = useState('content');

    const initial = useMemo(
        () => ({
            ...data,
            ...(schema.hasGallery
                ? { gallery: (data.gallery as number[]) ?? [] }
                : {}),
            ...(schema.hasSeo
                ? { seo: (data.seo as Record<string, unknown>) ?? {} }
                : {}),
        }),
        [data, schema.hasGallery, schema.hasSeo],
    );

    const form = useForm<CmsFormData>(initial);
    const { setData, processing, errors, isDirty } = form;

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (isEdit) {
            form.put(`${base}/${record.id}`, { preserveScroll: true });
        } else {
            form.post(base, { preserveScroll: true });
        }
    };

    const mainFields = schema.fields.filter(
        (field) => (field.panel ?? 'main') === 'main',
    );
    const sideFields = schema.fields.filter((field) => field.panel === 'side');

    const flatErrors = errors as Record<string, string>;
    const seoErrors = Object.fromEntries(
        Object.entries(flatErrors)
            .filter(([key]) => key.startsWith('seo.'))
            .map(([key, value]) => [key.replace('seo.', ''), value]),
    );
    const hasSeoErrors = Object.keys(seoErrors).length > 0;
    const hasContentErrors = Object.keys(flatErrors).some(
        (key) => !key.startsWith('seo.'),
    );

    return (
        <form onSubmit={submit}>
            <PageShell
                title={
                    isEdit
                        ? record.title ||
                          `Edit ${schema.singular.toLowerCase()}`
                        : `New ${schema.singular.toLowerCase()}`
                }
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: schema.label, href: base },
                    { label: isEdit ? 'Edit' : 'New' },
                ]}
                actions={
                    <>
                        <Button asChild type="button" variant="ghost">
                            <Link href={base}>
                                <ArrowLeft className="size-4" />
                                Back
                            </Link>
                        </Button>

                        {isEdit && record.url && (
                            <Button asChild type="button" variant="outline">
                                <a
                                    href={record.url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <ExternalLink className="size-4" />
                                    View
                                </a>
                            </Button>
                        )}

                        {isEdit && (
                            <ConfirmAction
                                title={`Delete this ${schema.singular.toLowerCase()}?`}
                                description={
                                    schema.softDeletes
                                        ? 'It will be removed from the website and can be restored from the deleted list.'
                                        : 'This cannot be undone.'
                                }
                                onConfirm={() =>
                                    router.delete(`${base}/${record.id}`)
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
                        )}

                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Save className="size-4" />
                            )}
                            {isEdit
                                ? 'Save changes'
                                : `Create ${schema.singular.toLowerCase()}`}
                        </Button>
                    </>
                }
            >
                {schema.hasSeo ? (
                    <Tabs value={tab} onValueChange={setTab}>
                        <TabsList>
                            <TabsTrigger
                                value="content"
                                className={cn(
                                    hasContentErrors && 'text-destructive',
                                )}
                            >
                                Content
                            </TabsTrigger>
                            <TabsTrigger
                                value="seo"
                                className={cn(
                                    hasSeoErrors && 'text-destructive',
                                )}
                            >
                                SEO &amp; sharing
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="content">
                            <Layout
                                mainFields={mainFields}
                                sideFields={sideFields}
                                schema={schema}
                                form={form}
                                options={options}
                            />
                        </TabsContent>

                        <TabsContent value="seo">
                            <div className="max-w-3xl">
                                <FieldSection title="Search and social">
                                    {SEO_FIELDS.map((field) => (
                                        <div
                                            key={field.name}
                                            className={
                                                field.width === 'half'
                                                    ? 'sm:col-span-1'
                                                    : 'sm:col-span-2'
                                            }
                                        >
                                            <SchemaField
                                                field={field}
                                                value={
                                                    (
                                                        form.data.seo as Record<
                                                            string,
                                                            unknown
                                                        >
                                                    )?.[field.name] ?? ''
                                                }
                                                errors={seoErrors}
                                                options={options}
                                                onChange={(value) =>
                                                    setData('seo', {
                                                        ...((form.data
                                                            .seo as Record<
                                                            string,
                                                            unknown
                                                        >) ?? {}),
                                                        [field.name]: value,
                                                    })
                                                }
                                            />
                                        </div>
                                    ))}
                                </FieldSection>
                            </div>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <Layout
                        mainFields={mainFields}
                        sideFields={sideFields}
                        schema={schema}
                        form={form}
                        options={options}
                    />
                )}

                {isEdit && record.updated_at && (
                    <p className="text-xs text-muted-foreground">
                        Last saved{' '}
                        {new Date(record.updated_at).toLocaleString()}
                        {isDirty && ' · unsaved changes'}
                    </p>
                )}
            </PageShell>
        </form>
    );
}

function Layout({
    mainFields,
    sideFields,
    schema,
    form,
    options,
}: {
    mainFields: FieldSchema[];
    sideFields: FieldSchema[];
    schema: Schema;
    form: ReturnType<typeof useForm<CmsFormData>>;
    options: Record<
        string,
        { value: string | number; label: string }[] | string[]
    >;
}) {
    const { data, setData, errors } = form;
    const flatErrors = errors as Record<string, string>;

    const mainSections = groupBySection(mainFields);
    const sideSections = groupBySection(sideFields);

    return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-6">
                {mainSections.map(([section, fields]) => (
                    <FieldSection key={section} title={section}>
                        {fields.map((field) => (
                            <div
                                key={field.name}
                                className={
                                    field.width === 'half'
                                        ? 'sm:col-span-1'
                                        : 'sm:col-span-2'
                                }
                            >
                                <SchemaField
                                    field={field}
                                    value={data[field.name]}
                                    errors={flatErrors}
                                    options={options}
                                    siblings={data}
                                    onChange={(value) =>
                                        setData(field.name, value)
                                    }
                                />
                            </div>
                        ))}
                    </FieldSection>
                ))}

                {schema.hasGallery && (
                    <FieldSection title="Gallery">
                        <div className="sm:col-span-2">
                            <SchemaField
                                field={{
                                    type: 'gallery',
                                    name: 'gallery',
                                    label: 'Gallery',
                                }}
                                value={data.gallery}
                                errors={flatErrors}
                                onChange={(value) => setData('gallery', value)}
                            />
                        </div>
                    </FieldSection>
                )}
            </div>

            <div className="space-y-6">
                {sideSections.map(([section, fields]) => (
                    <FieldSection
                        key={section}
                        title={section}
                        className="sm:grid-cols-1"
                    >
                        {fields.map((field) => (
                            <div key={field.name} className="sm:col-span-2">
                                <SchemaField
                                    field={field}
                                    value={data[field.name]}
                                    errors={flatErrors}
                                    options={options}
                                    siblings={data}
                                    onChange={(value) =>
                                        setData(field.name, value)
                                    }
                                />
                            </div>
                        ))}
                    </FieldSection>
                ))}
            </div>
        </div>
    );
}

function groupBySection(fields: FieldSchema[]): [string, FieldSchema[]][] {
    const groups = new Map<string, FieldSchema[]>();

    for (const field of fields) {
        const section = field.section ?? 'Content';
        groups.set(section, [...(groups.get(section) ?? []), field]);
    }

    return [...groups.entries()];
}
