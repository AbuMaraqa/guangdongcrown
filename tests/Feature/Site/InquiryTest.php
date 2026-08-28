<?php

use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use App\Mail\InquiryReceived;
use App\Models\Inquiry;
use App\Models\Service;
use App\Settings\CompanySettings;
use Database\Seeders\CatalogueSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed([CatalogueSeeder::class]);
    Mail::fake();
});

function validInquiry(array $overrides = []): array
{
    return array_merge([
        'type' => InquiryType::Contact->value,
        'name' => 'Amina Haddad',
        'company' => 'Haddad Facades',
        'email' => 'amina@example.com',
        'phone' => '+971 4 555 0100',
        'country' => 'United Arab Emirates',
        'message' => 'We need 6063-T5 sections for a curtain wall package in Dubai.',
        'consent' => true,
    ], $overrides);
}

test('a contact enquiry is stored with a reference', function () {
    $this->post(route('site.inquiries.store'), validInquiry())
        ->assertRedirect(route('site.contact'))
        ->assertSessionHas('success');

    $inquiry = Inquiry::query()->sole();

    expect($inquiry->name)->toBe('Amina Haddad')
        ->and($inquiry->status)->toBe(InquiryStatus::New)
        ->and($inquiry->type)->toBe(InquiryType::Contact)
        ->and($inquiry->reference)->toStartWith('GDC-')
        ->and($inquiry->ip_hash)->not->toBeNull();
});

test('a quotation request can reference a service and carry an attachment', function () {
    Storage::fake('local');

    $service = Service::query()->firstOrFail();

    $this->post(route('site.inquiries.store'), validInquiry([
        'type' => InquiryType::Quote->value,
        'service_id' => $service->id,
        'quantity' => '18 tonnes',
        'attachment' => UploadedFile::fake()->create('specification.pdf', 120, 'application/pdf'),
    ]))->assertRedirect(route('site.quote'));

    $inquiry = Inquiry::query()->sole();

    expect($inquiry->service_id)->toBe($service->id)
        ->and($inquiry->attachment_name)->toBe('specification.pdf');

    Storage::disk('local')->assertExists($inquiry->attachment_path);
});

test('the team is notified when a company email is configured', function () {
    $this->post(route('site.inquiries.store'), validInquiry());

    Mail::assertSent(InquiryReceived::class);
})->skip(fn () => blank(app(CompanySettings::class)->email), 'No company email configured.');

test('validation rejects an incomplete submission', function () {
    $this->post(route('site.inquiries.store'), ['type' => 'contact'])
        ->assertSessionHasErrors(['name', 'email', 'message', 'consent']);

    expect(Inquiry::query()->count())->toBe(0);
});

test('a quotation request requires a company', function () {
    $this->post(route('site.inquiries.store'), validInquiry([
        'type' => InquiryType::Quote->value,
        'company' => '',
    ]))->assertSessionHasErrors('company');
});

test('the honeypot field blocks automated submissions', function () {
    $this->post(route('site.inquiries.store'), validInquiry(['website' => 'https://spam.example']))
        ->assertSessionHasErrors('website');

    expect(Inquiry::query()->count())->toBe(0);
});

test('executable attachments are rejected', function () {
    $this->post(route('site.inquiries.store'), validInquiry([
        'attachment' => UploadedFile::fake()->create('payload.php', 10, 'application/x-php'),
    ]))->assertSessionHasErrors('attachment');
});

test('submissions are rate limited', function () {
    foreach (range(1, 6) as $attempt) {
        $this->post(route('site.inquiries.store'), validInquiry(['email' => "sender{$attempt}@example.com"]));
    }

    $this->post(route('site.inquiries.store'), validInquiry(['email' => 'seventh@example.com']))
        ->assertStatus(429);
});
