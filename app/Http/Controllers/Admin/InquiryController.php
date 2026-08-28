<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\InquiryNote;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InquiryController extends Controller
{
    public function __construct(private readonly ActivityLogger $activity) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Inquiry::class);

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'string', 'in:new,contacted,in_progress,completed,archived'],
            'type' => ['nullable', 'string', 'in:contact,quote'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $paginator = Inquiry::query()
            ->with(['assignee:id,name'])
            ->search($filters['search'] ?? null)
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filters['type'] ?? null, fn ($q, $type) => $q->where('type', $type))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/inquiries/index', [
            'rows' => $paginator->through(fn (Inquiry $inquiry): array => [
                'id' => $inquiry->id,
                'reference' => $inquiry->reference,
                'type' => $inquiry->type->value,
                'typeLabel' => $inquiry->type->label(),
                'name' => $inquiry->name,
                'company' => $inquiry->company,
                'email' => $inquiry->email,
                'country' => $inquiry->country,
                'status' => $inquiry->status->value,
                'statusLabel' => $inquiry->status->label(),
                'tone' => $inquiry->status->tone(),
                'assignee' => $inquiry->assignee?->name,
                'unread' => $inquiry->read_at === null,
                'createdAt' => $inquiry->created_at?->toIso8601String(),
            ]),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? '',
                'type' => $filters['type'] ?? '',
            ],
            'statuses' => InquiryStatus::options(),
            'types' => InquiryType::options(),
            'counts' => [
                'total' => Inquiry::query()->count(),
                'new' => Inquiry::query()->where('status', InquiryStatus::New)->count(),
                'quotes' => Inquiry::query()->where('type', InquiryType::Quote)->count(),
            ],
        ]);
    }

    public function show(Inquiry $inquiry): Response
    {
        $this->authorize('view', $inquiry);

        $inquiry->loadMissing(['service:id,name', 'product:id,name', 'assignee:id,name', 'notes.user:id,name']);

        if ($inquiry->read_at === null) {
            $inquiry->forceFill(['read_at' => now()])->save();
        }

        return Inertia::render('admin/inquiries/show', [
            'inquiry' => [
                'id' => $inquiry->id,
                'reference' => $inquiry->reference,
                'type' => $inquiry->type->value,
                'typeLabel' => $inquiry->type->label(),
                'name' => $inquiry->name,
                'company' => $inquiry->company,
                'email' => $inquiry->email,
                'phone' => $inquiry->phone,
                'country' => $inquiry->country,
                'quantity' => $inquiry->quantity,
                'message' => $inquiry->message,
                'service' => $inquiry->service?->name,
                'product' => $inquiry->product?->name,
                'status' => $inquiry->status->value,
                'assignedTo' => $inquiry->assigned_to,
                'sourceUrl' => $inquiry->source_url,
                'attachment' => $inquiry->attachment_path ? [
                    'name' => $inquiry->attachment_name,
                    'url' => route('admin.inquiries.attachment', $inquiry),
                ] : null,
                'createdAt' => $inquiry->created_at?->toIso8601String(),
                'notes' => $inquiry->notes->map(fn (InquiryNote $note): array => [
                    'id' => $note->id,
                    'body' => $note->body,
                    'author' => $note->user?->name,
                    'createdAt' => $note->created_at?->toIso8601String(),
                ])->all(),
            ],
            'statuses' => InquiryStatus::options(),
            'assignees' => User::query()->active()->orderBy('name')->get(['id', 'name'])
                ->map(fn (User $user): array => ['value' => $user->id, 'label' => $user->name])->all(),
        ]);
    }

    public function update(Request $request, Inquiry $inquiry): RedirectResponse
    {
        $this->authorize('update', $inquiry);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:new,contacted,in_progress,completed,archived'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $inquiry->update($validated);
        $this->activity->log('updated', $inquiry, 'Updated enquiry '.$inquiry->reference);

        return back()->with('success', 'Enquiry updated.');
    }

    public function addNote(Request $request, Inquiry $inquiry): RedirectResponse
    {
        $this->authorize('update', $inquiry);

        $inquiry->notes()->create([
            'user_id' => $request->user()->id,
            'body' => $request->validate(['body' => ['required', 'string', 'max:4000']])['body'],
        ]);

        return back()->with('success', 'Note added.');
    }

    public function attachment(Inquiry $inquiry): StreamedResponse
    {
        $this->authorize('view', $inquiry);

        abort_if($inquiry->attachment_path === null, 404);
        abort_unless(Storage::disk('local')->exists($inquiry->attachment_path), 404);

        return Storage::disk('local')->download(
            $inquiry->attachment_path,
            $inquiry->attachment_name ?? 'attachment',
        );
    }

    public function destroy(Inquiry $inquiry): RedirectResponse
    {
        $this->authorize('delete', $inquiry);

        $this->activity->log('deleted', null, 'Deleted enquiry '.$inquiry->reference);
        $inquiry->delete();

        return redirect()->route('admin.inquiries.index')->with('success', 'Enquiry deleted.');
    }
}
