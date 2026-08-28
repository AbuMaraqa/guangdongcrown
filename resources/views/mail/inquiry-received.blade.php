<x-mail::message>
# {{ $inquiry->type->label() }} enquiry received

**Reference:** {{ $inquiry->reference }}

@component('mail::table')
| Field | Value |
| :--- | :--- |
| Name | {{ $inquiry->name }} |
@if ($inquiry->company)
| Company | {{ $inquiry->company }} |
@endif
| Email | {{ $inquiry->email }} |
@if ($inquiry->phone)
| Phone | {{ $inquiry->phone }} |
@endif
@if ($inquiry->country)
| Country | {{ $inquiry->country }} |
@endif
@if ($inquiry->service)
| Service | {{ $inquiry->service->name }} |
@endif
@if ($inquiry->product)
| Product | {{ $inquiry->product->name }} |
@endif
@if ($inquiry->quantity)
| Quantity | {{ $inquiry->quantity }} |
@endif
@endcomponent

**Message**

{{ $inquiry->message }}

@if ($inquiry->attachment_name)
An attachment was included: {{ $inquiry->attachment_name }}
@endif

<x-mail::button :url="route('admin.inquiries.show', $inquiry)">
Open in dashboard
</x-mail::button>
</x-mail::message>
