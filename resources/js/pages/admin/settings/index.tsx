import { Link, useForm } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { AdminIcon } from '@/components/admin/admin-icon';
import { FieldSection, SchemaField } from '@/components/admin/fields';
import type { CmsFormData, FieldSchema } from '@/components/admin/fields';
import { PageShell } from '@/components/admin/shell';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
    tabs: { key: string; label: string; icon: string }[];
    schema: {
        key: string;
        label: string;
        icon: string;
        description: string;
        fields: FieldSchema[];
    };
    values: CmsFormData;
    canEdit: boolean;
};

export default function SettingsIndex({
    tabs,
    schema,
    values,
    canEdit,
}: Props) {
    const form = useForm<CmsFormData>(values);
    const { data, setData, processing, errors } = form;

    return (
        <PageShell
            title="Settings"
            description="Company details, social profiles, SEO defaults and the home page message."
            breadcrumbs={[
                { label: 'Dashboard', href: '/admin' },
                { label: 'Settings' },
            ]}
        >
            <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
                <nav aria-label="Settings sections">
                    <ul className="space-y-0.5">
                        {tabs.map((tab) => (
                            <li key={tab.key}>
                                <Link
                                    href={`/admin/settings/${tab.key}`}
                                    className={cn(
                                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                                        tab.key === schema.key
                                            ? 'bg-primary font-medium text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                                    )}
                                >
                                    <AdminIcon name={tab.icon} />
                                    {tab.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.put(`/admin/settings/${schema.key}`, {
                            preserveScroll: true,
                            // The failing field may be far above the save
                            // button, so say so where the editor is looking.
                            onError: () =>
                                toast.error(
                                    'Settings were not saved. Check the fields marked in red.',
                                ),
                        });
                    }}
                    className="space-y-6"
                >
                    {!canEdit && (
                        <div className="rounded-lg border bg-muted p-4 text-sm text-muted-foreground">
                            You have read-only access to settings. Ask an
                            administrator to make changes.
                        </div>
                    )}

                    <FieldSection title={schema.label}>
                        <p className="-mt-2 text-sm text-muted-foreground sm:col-span-2">
                            {schema.description}
                        </p>

                        {schema.fields.map((field) => (
                            <div
                                key={field.name}
                                className={cn(
                                    field.width === 'half'
                                        ? 'sm:col-span-1'
                                        : 'sm:col-span-2',
                                    !canEdit &&
                                        'pointer-events-none opacity-60',
                                )}
                            >
                                <SchemaField
                                    field={field}
                                    value={data[field.name]}
                                    errors={errors as Record<string, string>}
                                    siblings={data}
                                    onChange={(value) =>
                                        setData(field.name, value)
                                    }
                                />
                            </div>
                        ))}
                    </FieldSection>

                    {canEdit && (
                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Save className="size-4" />
                                )}
                                Save settings
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </PageShell>
    );
}
