<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRequest;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(private readonly ActivityLogger $activity) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $search = $request->validate(['search' => ['nullable', 'string', 'max:120']])['search'] ?? null;

        $paginator = User::query()
            ->when($search, fn ($query, $term) => $query->where(
                fn ($inner) => $inner->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%")
            ))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'rows' => $paginator->through(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'jobTitle' => $user->job_title,
                'role' => $user->role->value,
                'roleLabel' => $user->role->label(),
                'isActive' => $user->is_active,
                'twoFactor' => $user->two_factor_confirmed_at !== null,
                'lastLoginAt' => $user->last_login_at?->toIso8601String(),
                'isSelf' => $request->user()->is($user),
            ]),
            'filters' => ['search' => $search ?? ''],
            'roles' => Role::options(),
        ]);
    }

    public function store(UserRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $user = User::query()->create([
            ...$data,
            'password' => Hash::make($data['password']),
            'email_verified_at' => now(),
        ]);

        $this->activity->log('created', $user, 'Created dashboard account for '.$user->email);

        return back()->with('success', 'Account created.');
    }

    public function update(UserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();

        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);
        $this->activity->log('updated', $user, 'Updated dashboard account '.$user->email);

        return back()->with('success', 'Account updated.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        abort_if(
            $user->isSuperAdmin() && User::query()->where('role', Role::SuperAdmin)->active()->count() <= 1,
            422,
            'The last super admin cannot be removed.',
        );

        $this->activity->log('deleted', null, 'Removed dashboard account '.$user->email);
        $user->delete();

        return back()->with('success', 'Account removed.');
    }
}
