<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InquiryReceived extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Inquiry $inquiry) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: sprintf('[%s] %s enquiry from %s',
                $this->inquiry->reference,
                $this->inquiry->type->label(),
                $this->inquiry->company ?: $this->inquiry->name,
            ),
            replyTo: [$this->inquiry->email],
        );
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.inquiry-received');
    }
}
