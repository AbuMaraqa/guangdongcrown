<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\InquiryStatus;
use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Inquiry;
use App\Models\MediaAsset;
use App\Models\PageView;
use App\Models\Post;
use App\Models\Product;
use App\Models\Project;
use App\Models\TeamMember;
use App\Support\Locales;
use Carbon\CarbonInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const WINDOW_DAYS = 30;

    /**
     * Switches the interface language for the signed-in user only. The public
     * site's language is decided by the URL and is unaffected.
     */
    public function locale(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', Rule::in(Locales::codes())],
        ]);

        $request->user()->forceFill(['locale' => $validated['locale']])->save();

        return back();
    }

    public function __invoke(): Response
    {
        $since = now()->subDays(self::WINDOW_DAYS)->startOfDay();
        $previousSince = now()->subDays(self::WINDOW_DAYS * 2)->startOfDay();
        $canSeeInquiries = Gate::allows('viewAny', Inquiry::class);

        return Inertia::render('admin/dashboard', [
            'kpis' => $this->kpis($since, $previousSince, $canSeeInquiries),
            'traffic' => $this->traffic($since),
            'topPages' => $this->topPages($since),
            'inquiryBreakdown' => $canSeeInquiries ? $this->inquiryBreakdown() : null,
            'recentInquiries' => $canSeeInquiries ? $this->recentInquiries() : null,
            'activity' => $this->recentActivity(),
            'library' => $this->libraryCounts(),
        ]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function kpis(CarbonInterface $since, CarbonInterface $previousSince, bool $canSeeInquiries): array
    {
        $views = PageView::query()->where('viewed_at', '>=', $since)->count();
        $previousViews = PageView::query()
            ->whereBetween('viewed_at', [$previousSince, $since])
            ->count();

        $visitors = PageView::query()
            ->where('viewed_at', '>=', $since)
            ->distinct('visitor_hash')
            ->count('visitor_hash');

        $kpis = [
            [
                'key' => 'views',
                'label' => 'Page views',
                'value' => $views,
                'delta' => $this->delta($views, $previousViews),
                'caption' => 'Last '.self::WINDOW_DAYS.' days',
            ],
            [
                'key' => 'visitors',
                'label' => 'Unique visitors',
                'value' => $visitors,
                'delta' => null,
                'caption' => 'Last '.self::WINDOW_DAYS.' days',
            ],
        ];

        if ($canSeeInquiries) {
            $inquiries = Inquiry::query()->where('created_at', '>=', $since)->count();
            $previousInquiries = Inquiry::query()->whereBetween('created_at', [$previousSince, $since])->count();

            $kpis[] = [
                'key' => 'inquiries',
                'label' => 'Enquiries',
                'value' => $inquiries,
                'delta' => $this->delta($inquiries, $previousInquiries),
                'caption' => 'Last '.self::WINDOW_DAYS.' days',
            ];
            $kpis[] = [
                'key' => 'unread',
                'label' => 'Awaiting reply',
                'value' => Inquiry::query()->where('status', InquiryStatus::New)->count(),
                'delta' => null,
                'caption' => 'Status: new',
            ];
        }

        return $kpis;
    }

    private function delta(int $current, int $previous): ?float
    {
        if ($previous === 0) {
            return $current === 0 ? 0.0 : null;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    /**
     * Daily view counts for the traffic chart, zero-filled so the line is continuous.
     *
     * @return list<array{date: string, views: int}>
     */
    private function traffic(CarbonInterface $since): array
    {
        $counts = PageView::query()
            ->where('viewed_at', '>=', $since)
            ->selectRaw('date(viewed_at) as day, count(*) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        $series = [];

        for ($date = $since->toMutable(); $date <= now(); $date = $date->addDay()) {
            $key = $date->format('Y-m-d');
            $series[] = ['date' => $key, 'views' => (int) ($counts[$key] ?? 0)];
        }

        return $series;
    }

    /**
     * @return list<array{path: string, views: int}>
     */
    private function topPages(CarbonInterface $since): array
    {
        return array_values(PageView::query()
            ->where('viewed_at', '>=', $since)
            ->select('path', DB::raw('count(*) as views'))
            ->groupBy('path')
            ->orderByDesc('views')
            ->limit(8)
            ->get()
            ->map(fn (PageView $row): array => [
                'path' => '/'.ltrim($row->path, '/'),
                'views' => (int) $row->getAttribute('views'),
            ])
            ->all());
    }

    /**
     * @return list<array{status: string, label: string, tone: string, total: int}>
     */
    private function inquiryBreakdown(): array
    {
        $counts = Inquiry::query()
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        return array_map(fn (array $option): array => [
            'status' => $option['value'],
            'label' => $option['label'],
            'tone' => $option['tone'],
            'total' => (int) ($counts[$option['value']] ?? 0),
        ], InquiryStatus::options());
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function recentInquiries(): array
    {
        return array_values(Inquiry::query()
            ->latest()
            ->limit(6)
            ->get(['id', 'reference', 'type', 'name', 'company', 'country', 'status', 'created_at', 'read_at'])
            ->map(fn (Inquiry $inquiry): array => [
                'id' => $inquiry->id,
                'reference' => $inquiry->reference,
                'type' => $inquiry->type->value,
                'typeLabel' => $inquiry->type->label(),
                'name' => $inquiry->name,
                'company' => $inquiry->company,
                'country' => $inquiry->country,
                'status' => $inquiry->status->value,
                'statusLabel' => $inquiry->status->label(),
                'tone' => $inquiry->status->tone(),
                'unread' => $inquiry->read_at === null,
                'createdAt' => $inquiry->created_at?->toIso8601String(),
            ])
            ->all());
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function recentActivity(): array
    {
        return array_values(Activity::query()
            ->with('user:id,name')
            ->latest('created_at')
            ->limit(10)
            ->get()
            ->map(fn (Activity $activity): array => [
                'id' => $activity->id,
                'action' => $activity->action,
                'description' => $activity->description,
                'user' => $activity->user?->name,
                'createdAt' => $activity->created_at?->toIso8601String(),
            ])
            ->all());
    }

    /**
     * @return list<array{label: string, total: int, icon: string, href: string}>
     */
    private function libraryCounts(): array
    {
        return [
            ['label' => 'Products', 'total' => Product::query()->count(), 'icon' => 'package', 'href' => route('admin.resources.index', 'products')],
            ['label' => 'Projects', 'total' => Project::query()->count(), 'icon' => 'briefcase', 'href' => route('admin.resources.index', 'projects')],
            ['label' => 'Articles', 'total' => Post::query()->count(), 'icon' => 'newspaper', 'href' => route('admin.resources.index', 'posts')],
            ['label' => 'Team', 'total' => TeamMember::query()->count(), 'icon' => 'users', 'href' => route('admin.resources.index', 'team')],
            ['label' => 'Media files', 'total' => MediaAsset::query()->count(), 'icon' => 'image', 'href' => route('admin.media.index')],
        ];
    }
}
