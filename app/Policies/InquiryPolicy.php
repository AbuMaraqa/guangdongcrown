<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Inquiry;
use App\Models\User;

class InquiryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAbility('inquiries.view');
    }

    public function view(User $user, Inquiry $inquiry): bool
    {
        return $user->hasAbility('inquiries.view');
    }

    public function update(User $user, Inquiry $inquiry): bool
    {
        return $user->hasAbility('inquiries.update');
    }

    public function delete(User $user, Inquiry $inquiry): bool
    {
        return $user->hasAbility('inquiries.delete');
    }
}
