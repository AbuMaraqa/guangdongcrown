import { Link } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    Eye,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { AdminIcon } from '@/components/admin/admin-icon';
import {
    AdminEmptyState,
    PageShell,
    StatusBadge,
} from '@/components/admin/shell';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Kpi = {
    key: string;
    label: string;
    value: number;
    delta: number | null;
    caption: string;
};

type Props = {
    kpis: Kpi[];
    traffic: { date: string; views: number }[];
    topPages: { path: string; views: number }[];
    inquiryBreakdown:
        { status: string; label: string; tone: string; total: number }[] | null;
    recentInquiries:
        | {
              id: number;
              reference: string;
              typeLabel: string;
              name: string;
              company: string | null;
              country: string | null;
              statusLabel: string;
              tone: string;
              unread: boolean;
              createdAt: string | null;
          }[]
        | null;
    activity: {
        id: number;
        action: string;
        description: string;
        user: string | null;
        createdAt: string | null;
    }[];
    library: { label: string; total: number; icon: string; href: string }[];
};

export default function Dashboard({
    kpis,
    traffic,
    topPages,
    inquiryBreakdown,
    recentInquiries,
    activity,
    library,
}: Props) {
    const hasTraffic = traffic.some((point) => point.views > 0);

    return (
        <PageShell
            title="Overview"
            description="Traffic, enquiries and recent changes across the website."
        >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.key}
                        className="rounded-xl border bg-card p-5"
                    >
                        <p className="text-sm text-muted-foreground">
                            {kpi.label}
                        </p>
                        <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
                            {kpi.value.toLocaleString()}
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-xs">
                            {kpi.delta !== null && kpi.delta !== 0 && (
                                <span
                                    className={cn(
                                        'flex items-center gap-1 font-medium',
                                        kpi.delta > 0
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-destructive',
                                    )}
                                >
                                    {kpi.delta > 0 ? (
                                        <TrendingUp className="size-3.5" />
                                    ) : (
                                        <TrendingDown className="size-3.5" />
                                    )}
                                    {Math.abs(kpi.delta)}%
                                </span>
                            )}
                            <span className="text-muted-foreground">
                                {kpi.caption}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="rounded-xl border bg-card">
                    <div className="flex items-center justify-between border-b p-5">
                        <div>
                            <h2 className="font-semibold">Website traffic</h2>
                            <p className="text-sm text-muted-foreground">
                                Page views over the last 30 days
                            </p>
                        </div>
                        <Eye
                            aria-hidden="true"
                            className="size-4 text-muted-foreground"
                        />
                    </div>

                    <div className="p-5">
                        {hasTraffic ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={traffic}
                                        margin={{
                                            top: 4,
                                            right: 4,
                                            bottom: 0,
                                            left: -20,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="views"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="var(--chart-1)"
                                                    stopOpacity={0.35}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor="var(--chart-1)"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            stroke="var(--border)"
                                            strokeDasharray="3 3"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{
                                                fontSize: 11,
                                                fill: 'var(--muted-foreground)',
                                            }}
                                            tickFormatter={(value: string) =>
                                                new Date(
                                                    value,
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        day: 'numeric',
                                                        month: 'short',
                                                    },
                                                )
                                            }
                                            minTickGap={28}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                            tick={{
                                                fontSize: 11,
                                                fill: 'var(--muted-foreground)',
                                            }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'var(--popover)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.8125rem',
                                            }}
                                            labelFormatter={(label) =>
                                                new Date(
                                                    String(label),
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        dateStyle: 'medium',
                                                    },
                                                )
                                            }
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="views"
                                            name="Views"
                                            stroke="var(--chart-1)"
                                            strokeWidth={2}
                                            fill="url(#views)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <AdminEmptyState
                                icon={Eye}
                                title="No traffic recorded yet"
                                description="Visits to the public website are counted here from the moment the site goes live."
                            />
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {inquiryBreakdown && (
                        <div className="rounded-xl border bg-card">
                            <div className="border-b p-5">
                                <h2 className="font-semibold">
                                    Enquiry pipeline
                                </h2>
                            </div>
                            <ul className="divide-y">
                                {inquiryBreakdown.map((entry) => (
                                    <li
                                        key={entry.status}
                                        className="flex items-center justify-between px-5 py-3"
                                    >
                                        <StatusBadge
                                            label={entry.label}
                                            tone={entry.tone}
                                        />
                                        <span className="font-medium tabular-nums">
                                            {entry.total}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className="border-t p-3">
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="w-full"
                                >
                                    <Link href="/admin/enquiries">
                                        Open enquiries
                                        <ArrowUpRight className="size-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="rounded-xl border bg-card">
                        <div className="border-b p-5">
                            <h2 className="font-semibold">Most viewed pages</h2>
                        </div>
                        {topPages.length > 0 ? (
                            <ul className="divide-y">
                                {topPages.map((row) => (
                                    <li
                                        key={row.path}
                                        className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                                    >
                                        <a
                                            href={row.path}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="truncate font-mono text-xs transition-colors hover:text-primary"
                                        >
                                            {row.path}
                                        </a>
                                        <span className="shrink-0 text-muted-foreground tabular-nums">
                                            {row.views}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="p-5 text-sm text-muted-foreground">
                                Nothing recorded in this period yet.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                {recentInquiries && (
                    <div className="rounded-xl border bg-card">
                        <div className="flex items-center justify-between border-b p-5">
                            <h2 className="font-semibold">Latest enquiries</h2>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/admin/enquiries">View all</Link>
                            </Button>
                        </div>

                        {recentInquiries.length > 0 ? (
                            <ul className="divide-y">
                                {recentInquiries.map((inquiry) => (
                                    <li key={inquiry.id}>
                                        <Link
                                            href={`/admin/enquiries/${inquiry.id}`}
                                            className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-accent/50"
                                        >
                                            <div className="min-w-0">
                                                <p className="flex items-center gap-2 truncate font-medium">
                                                    {inquiry.unread && (
                                                        <span
                                                            aria-label="Unread"
                                                            className="size-1.5 shrink-0 rounded-full bg-primary"
                                                        />
                                                    )}
                                                    {inquiry.name}
                                                    {inquiry.company && (
                                                        <span className="truncate font-normal text-muted-foreground">
                                                            · {inquiry.company}
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {inquiry.reference} ·{' '}
                                                    {inquiry.typeLabel}
                                                    {inquiry.country
                                                        ? ` · ${inquiry.country}`
                                                        : ''}
                                                </p>
                                            </div>
                                            <StatusBadge
                                                label={inquiry.statusLabel}
                                                tone={inquiry.tone}
                                            />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="p-5 text-sm text-muted-foreground">
                                No enquiries received yet.
                            </p>
                        )}
                    </div>
                )}

                <div className="space-y-6">
                    <div className="rounded-xl border bg-card">
                        <div className="border-b p-5">
                            <h2 className="font-semibold">Content library</h2>
                        </div>
                        <ul className="divide-y">
                            {library.map((entry) => (
                                <li key={entry.label}>
                                    <Link
                                        href={entry.href}
                                        className="flex items-center justify-between px-5 py-3 text-sm transition-colors hover:bg-accent/50"
                                    >
                                        <span className="flex items-center gap-2.5">
                                            <AdminIcon
                                                name={entry.icon}
                                                className="text-muted-foreground"
                                            />
                                            {entry.label}
                                        </span>
                                        <span className="font-medium tabular-nums">
                                            {entry.total}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-xl border bg-card">
                        <div className="flex items-center gap-2 border-b p-5">
                            <Activity
                                aria-hidden="true"
                                className="size-4 text-muted-foreground"
                            />
                            <h2 className="font-semibold">Recent activity</h2>
                        </div>
                        {activity.length > 0 ? (
                            <ul className="divide-y">
                                {activity.map((entry) => (
                                    <li key={entry.id} className="px-5 py-3">
                                        <p className="text-sm">
                                            {entry.description}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {entry.user ?? 'System'}
                                            {entry.createdAt &&
                                                ` · ${new Date(entry.createdAt).toLocaleString()}`}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="p-5 text-sm text-muted-foreground">
                                Changes made in the dashboard will be listed
                                here.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
