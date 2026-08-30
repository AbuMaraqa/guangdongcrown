<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MediaUploadRequest;
use App\Models\MediaAsset;
use App\Services\ActivityLogger;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function __construct(
        private readonly MediaService $media,
        private readonly ActivityLogger $activity,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', MediaAsset::class);

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'type' => ['nullable', 'in:image,document'],
        ]);

        $type = $filters['type'] ?? null;

        $paginator = MediaAsset::query()
            ->with('media')
            ->search($filters['search'] ?? null)
            ->when($type === 'image', fn ($query) => $query->images())
            ->when($type === 'document', fn ($query) => $query->documents())
            ->latest()
            ->paginate(48)
            ->withQueryString();

        return Inertia::render('admin/media/index', [
            'items' => $paginator->through(fn (MediaAsset $item): array => $this->present($item)),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'type' => $type ?? '',
            ],
            'usage' => [
                'files' => MediaAsset::query()->count(),
                // Byte totals live on medialibrary's own table.
                'bytes' => (int) DB::table('media')->sum('size'),
            ],
        ]);
    }

    /**
     * JSON endpoint backing the media picker inside content forms.
     */
    public function browse(Request $request): JsonResponse
    {
        $this->authorize('viewAny', MediaAsset::class);

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'page' => ['nullable', 'integer', 'min:1'],
            'ids' => ['nullable', 'string', 'max:512'],
        ]);

        // Resolving specific ids lets a form rehydrate its existing selection
        // without paging through the whole library.
        if (! empty($filters['ids'])) {
            $ids = array_slice(array_filter(array_map('intval', explode(',', $filters['ids']))), 0, 60);

            $found = MediaAsset::query()->with('media')->whereIn('id', $ids)->get();

            return response()->json([
                'items' => $found->map(fn (MediaAsset $item): array => $this->present($item))->values()->all(),
                'hasMore' => false,
                'total' => $found->count(),
            ]);
        }

        $paginator = MediaAsset::query()
            ->with('media')
            ->search($filters['search'] ?? null)
            ->latest()
            ->paginate(30, page: (int) ($filters['page'] ?? 1));

        return response()->json([
            'items' => $paginator->getCollection()->map(fn (MediaAsset $item): array => $this->present($item))->all(),
            'hasMore' => $paginator->hasMorePages(),
            'total' => $paginator->total(),
        ]);
    }

    public function store(MediaUploadRequest $request): JsonResponse|RedirectResponse
    {
        $uploaded = [];

        foreach ($request->file('files', []) as $file) {
            $uploaded[] = $this->present($this->media->upload($file, $request->user()->id, $request->input('folder')));
        }

        $this->activity->log('uploaded', null, count($uploaded).' file(s) uploaded to the media library.');

        if ($request->wantsJson()) {
            return response()->json(['items' => $uploaded]);
        }

        return back()->with('success', count($uploaded).' file(s) uploaded.');
    }

    public function update(Request $request, MediaAsset $medium): RedirectResponse
    {
        $this->authorize('update', $medium);

        $medium->update($request->validate([
            'alt' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
        ]));

        return back()->with('success', 'File details saved.');
    }

    public function destroy(MediaAsset $medium): RedirectResponse
    {
        $this->authorize('delete', $medium);

        $this->activity->log('deleted', null, 'Deleted media file "'.$medium->file_name.'"');
        $this->media->delete($medium);

        return back()->with('success', 'File deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function present(MediaAsset $asset): array
    {
        return [
            'id' => $asset->id,
            'url' => $asset->url,
            'thumb' => $asset->thumb_url,
            'name' => $asset->file_name,
            'mime' => $asset->mime_type,
            'extension' => $asset->extension,
            'size' => $asset->readable_size,
            'width' => $asset->width(),
            'height' => $asset->height(),
            'alt' => $asset->alt,
            'title' => $asset->title,
            'isImage' => $asset->is_image,
            'createdAt' => $asset->created_at?->toIso8601String(),
        ];
    }
}
