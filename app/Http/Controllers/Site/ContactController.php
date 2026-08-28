<?php

declare(strict_types=1);

namespace App\Http\Controllers\Site;

use App\Enums\InquiryType;
use App\Http\Requests\Site\InquiryRequest;
use App\Mail\InquiryReceived;
use App\Models\Faq;
use App\Models\Inquiry;
use App\Models\Location;
use App\Models\Product;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Response;

class ContactController extends SiteController
{
    public function contact(): Response
    {
        return $this->page('site/contact', [
            ...$this->formData(),
            'type' => InquiryType::Contact->value,
            'breadcrumbs' => $this->trail([['name' => 'Contact', 'url' => route('site.contact')]]),
        ], [
            'title' => 'Contact us',
            'description' => 'Talk to our aluminium supply and logistics team.',
        ]);
    }

    public function quote(Request $request): Response
    {
        $preselect = $request->validate([
            'product' => ['nullable', 'string', 'max:140'],
            'service' => ['nullable', 'string', 'max:140'],
        ]);

        return $this->page('site/quote', [
            ...$this->formData(),
            'type' => InquiryType::Quote->value,
            'preselect' => [
                'product_id' => Product::query()->active()->where('slug', $preselect['product'] ?? null)->value('id'),
                'service_id' => Service::query()->active()->where('slug', $preselect['service'] ?? null)->value('id'),
            ],
            'breadcrumbs' => $this->trail([['name' => 'Request a quotation', 'url' => route('site.quote')]]),
        ], [
            'title' => 'Request a quotation',
            'description' => 'Send us your specification and we will come back with pricing and lead times.',
        ]);
    }

    public function store(InquiryRequest $request): RedirectResponse
    {
        $data = $request->safe()->except(['attachment', 'consent', 'website']);

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $data['attachment_path'] = $file->store('inquiries/'.now()->format('Y/m'), 'local');
            $data['attachment_name'] = $file->getClientOriginalName();
        }

        $inquiry = Inquiry::query()->create([
            ...$data,
            'source_url' => $request->headers->get('referer'),
            'ip_hash' => hash('sha256', $request->ip().'|'.config('app.key')),
        ]);

        $this->notify($inquiry);

        return redirect()
            ->route($inquiry->type === InquiryType::Quote ? 'site.quote' : 'site.contact')
            ->with('success', 'Thank you. Your enquiry reference is '.$inquiry->reference.'. We reply within one business day.');
    }

    private function notify(Inquiry $inquiry): void
    {
        $recipient = $this->company->email;

        if (! $recipient) {
            return;
        }

        Mail::to($recipient)->send(new InquiryReceived($inquiry));
    }

    /**
     * @return array<string, mixed>
     */
    private function formData(): array
    {
        return [
            'services' => Service::query()->active()->ordered()->get(['id', 'name'])
                ->map(fn (Service $s): array => ['value' => $s->id, 'label' => $s->name])->all(),
            'products' => Product::query()->active()->ordered()->get(['id', 'name'])
                ->map(fn (Product $p): array => ['value' => $p->id, 'label' => $p->name])->all(),
            'locations' => Location::query()->active()->ordered()
                ->whereIn('type', ['office', 'facility', 'warehouse'])
                ->get()
                ->map(fn (Location $l): array => [
                    'id' => $l->id,
                    'name' => $l->name,
                    'type' => $l->type,
                    'city' => $l->city,
                    'country' => $l->country,
                    'address' => $l->address,
                    'phone' => $l->phone,
                    'email' => $l->email,
                    'isHeadquarters' => $l->is_headquarters,
                ])->all(),
            'faqs' => Faq::query()->active()->ordered()->limit(5)->get()
                ->map(fn (Faq $f): array => ['id' => $f->id, 'question' => $f->question, 'answer' => $f->answer])->all(),
        ];
    }
}
