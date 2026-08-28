<?php

use App\Enums\Role;
use App\Models\Inquiry;
use App\Models\User;

test('guests cannot reach any admin screen', function (string $path) {
    $this->get($path)->assertRedirect(route('login'));
})->with([
    '/admin',
    '/admin/media',
    '/admin/enquiries',
    '/admin/settings',
    '/admin/users',
    '/admin/content/products',
]);

test('editors can manage content', function () {
    $this->actingAs(User::factory()->create(['role' => Role::Editor]));

    $this->get('/admin/content/products')->assertOk();
    $this->get('/admin/content/products/create')->assertOk();
});

test('editors cannot read customer enquiries', function () {
    $this->actingAs(User::factory()->create(['role' => Role::Editor]));

    $this->get('/admin/enquiries')->assertForbidden();
});

test('editors cannot open settings', function () {
    $this->actingAs(User::factory()->create(['role' => Role::Editor]));

    $this->get('/admin/settings')->assertForbidden();
});

test('editors cannot change settings', function () {
    $this->actingAs(User::factory()->create(['role' => Role::Editor]));

    $this->put('/admin/settings/company', ['name' => 'Hijacked'])->assertForbidden();
});

test('administrators can read enquiries but not manage accounts', function () {
    $this->actingAs(User::factory()->create(['role' => Role::Admin]));

    $this->get('/admin/enquiries')->assertOk();
    $this->get('/admin/settings')->assertOk();
    $this->get('/admin/users')->assertForbidden();
});

test('super admins can manage accounts', function () {
    $this->actingAs(User::factory()->superAdmin()->create());

    $this->get('/admin/users')->assertOk();
});

test('an unknown content resource is not routable', function () {
    $this->actingAs(User::factory()->superAdmin()->create());

    $this->get('/admin/content/users')->assertNotFound();
});

test('an enquiry attachment is only downloadable by authorised staff', function () {
    $inquiry = Inquiry::query()->create([
        'type' => 'contact',
        'name' => 'Test Sender',
        'email' => 'sender@example.com',
        'message' => 'A message long enough to pass validation rules.',
        'attachment_path' => 'inquiries/2026/01/missing.pdf',
        'attachment_name' => 'missing.pdf',
    ]);

    $this->actingAs(User::factory()->create(['role' => Role::Editor]));
    $this->get(route('admin.inquiries.attachment', $inquiry))->assertForbidden();

    $this->actingAs(User::factory()->create(['role' => Role::Admin]));
    $this->get(route('admin.inquiries.attachment', $inquiry))->assertNotFound();
});

test('a user cannot demote or deactivate themselves', function () {
    $user = User::factory()->superAdmin()->create();
    $this->actingAs($user);

    $this->patch(route('admin.users.update', $user), [
        'name' => $user->name,
        'email' => $user->email,
        'role' => Role::Editor->value,
        'is_active' => true,
    ])->assertSessionHasErrors('role');

    $this->patch(route('admin.users.update', $user), [
        'name' => $user->name,
        'email' => $user->email,
        'role' => Role::SuperAdmin->value,
        'is_active' => false,
    ])->assertSessionHasErrors('is_active');
});
