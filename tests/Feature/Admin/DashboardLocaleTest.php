<?php

use App\Models\User;

test('the dashboard renders left to right by default', function () {
    $this->actingAs(User::factory()->superAdmin()->create());

    $this->get('/admin')
        ->assertOk()
        ->assertSee('dir="ltr"', escape: false)
        ->assertSee('lang="en"', escape: false);
});

test('an arabic preference flips the dashboard to rtl', function () {
    $this->actingAs(User::factory()->superAdmin()->create(['locale' => 'ar']));

    $this->get('/admin')
        ->assertOk()
        ->assertSee('dir="rtl"', escape: false)
        ->assertSee('lang="ar"', escape: false);
});

test('the interface language is saved against the user', function () {
    $user = User::factory()->superAdmin()->create();
    $this->actingAs($user);

    $this->put('/admin/locale', ['locale' => 'ar'])->assertRedirect();

    expect($user->fresh()->locale)->toBe('ar');
});

test('an unsupported interface language is rejected', function () {
    $this->actingAs(User::factory()->superAdmin()->create());

    $this->put('/admin/locale', ['locale' => 'de'])->assertSessionHasErrors('locale');
});

test('the dashboard language is independent of the public site language', function () {
    $this->actingAs(User::factory()->superAdmin()->create(['locale' => 'ar']));

    // The public site still serves English from its un-prefixed URLs even
    // while the operator works in Arabic.
    $this->get('/')->assertOk()->assertSee('dir="ltr"', escape: false);
    $this->get('/admin')->assertOk()->assertSee('dir="rtl"', escape: false);
});

test('the dashboard receives the company logo', function () {
    $this->actingAs(User::factory()->superAdmin()->create());

    $this->get('/admin')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            // The site chrome is withheld from the dashboard, but branding is
            // not: the rail shows the company mark on every screen.
            ->where('site', null)
            ->has('brand.name')
            ->has('brand.logo')
        );
});

test('every language offers a flag for the switcher', function () {
    $this->actingAs(User::factory()->superAdmin()->create());

    $this->get('/admin')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('locale.available.0.flag', 'GB')
            ->where('locale.available.1.flag', 'PS')
        );
});
