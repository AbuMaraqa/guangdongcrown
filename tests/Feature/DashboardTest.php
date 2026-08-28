<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
});

test('staff can visit the dashboard', function () {
    $this->actingAs(User::factory()->superAdmin()->create());

    $this->get(route('admin.dashboard'))->assertOk();
});

test('deactivated accounts are locked out of the dashboard', function () {
    $this->actingAs(User::factory()->create(['is_active' => false]));

    $this->get(route('admin.dashboard'))->assertForbidden();
});
