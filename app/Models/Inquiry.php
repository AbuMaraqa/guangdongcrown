<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * @property string $reference
 * @property InquiryType $type
 * @property InquiryStatus $status
 * @property CarbonImmutable|null $read_at
 * @property CarbonImmutable|null $created_at
 */
#[Fillable([
    'reference', 'type', 'name', 'company', 'email', 'phone', 'country',
    'service_id', 'product_id', 'quantity', 'message',
    'attachment_path', 'attachment_name', 'status', 'source_url', 'ip_hash',
    'assigned_to', 'read_at',
])]
class Inquiry extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'type' => InquiryType::class,
            'status' => InquiryStatus::class,
            'read_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $inquiry): void {
            $inquiry->reference ??= 'GDC-'.now()->format('ymd').'-'.Str::upper(Str::random(5));
        });
    }

    /**
     * @return BelongsTo<Service, $this>
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * @return HasMany<InquiryNote, $this>
     */
    public function notes(): HasMany
    {
        return $this->hasMany(InquiryNote::class)->latest();
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        return $query->when($term, fn (Builder $q, string $t): Builder => $q->where(
            fn (Builder $inner) => $inner
                ->where('name', 'like', "%{$t}%")
                ->orWhere('email', 'like', "%{$t}%")
                ->orWhere('company', 'like', "%{$t}%")
                ->orWhere('reference', 'like', "%{$t}%")
        ));
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeUnread(Builder $query): Builder
    {
        return $query->whereNull('read_at');
    }
}
