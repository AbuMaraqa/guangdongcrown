<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Activity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

/**
 * Records admin actions for the dashboard activity feed.
 */
class ActivityLogger
{
    /**
     * @param  array<string, mixed>  $properties
     */
    public function log(string $action, ?Model $subject = null, ?string $description = null, array $properties = []): Activity
    {
        return Activity::query()->create([
            'user_id' => Auth::id(),
            'action' => $action,
            'subject_type' => $subject ? $subject::class : null,
            'subject_id' => $subject?->getKey(),
            'description' => $description ?? $this->describe($action, $subject),
            'properties' => $properties ?: null,
            'created_at' => now(),
        ]);
    }

    public function created(Model $subject): Activity
    {
        return $this->log('created', $subject);
    }

    public function updated(Model $subject): Activity
    {
        return $this->log('updated', $subject);
    }

    public function deleted(Model $subject): Activity
    {
        return $this->log('deleted', $subject);
    }

    private function describe(string $action, ?Model $subject): string
    {
        if (! $subject) {
            return Str::ucfirst($action);
        }

        $label = Str::headline(class_basename($subject));
        $title = $subject->getAttribute('title')
            ?? $subject->getAttribute('name')
            ?? $subject->getAttribute('reference')
            ?? ('#'.$subject->getKey());

        return sprintf('%s %s "%s"', Str::ucfirst($action), Str::lower($label), $title);
    }
}
