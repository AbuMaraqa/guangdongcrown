<?php

declare(strict_types=1);

use App\Enums\Role;
use App\Models\MediaAsset;
use App\Models\User;
use App\Settings\CompanySettings;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

test('a row left by a failed upload does not swallow the retry', function () {
    $this->actingAs(User::factory()->create(['role' => Role::Admin]));

    $file = UploadedFile::fake()->image('logo.png', 300, 120);

    // What an interrupted upload used to leave behind: the row, no file.
    $orphan = MediaAsset::query()->create([
        'hash' => hash_file('sha256', $file->getRealPath()),
        'title' => 'Logo',
    ]);

    $response = $this->postJson('/admin/media', ['files' => [$file]])->assertOk();

    $id = $response->json('items.0.id');

    expect($id)->not->toBe($orphan->id)
        ->and($response->json('items.0.isImage'))->toBeTrue()
        ->and($response->json('items.0.url'))->not->toBe('');
});

test('an uploaded logo is saved to company settings', function () {
    $this->actingAs(User::factory()->create(['role' => Role::Admin]));

    $id = $this->postJson('/admin/media', ['files' => [UploadedFile::fake()->image('logo.png', 300, 120)]])
        ->assertOk()
        ->json('items.0.id');

    $this->put('/admin/settings/company', [
        'name' => ['en' => 'Guang Dong Crown', 'ar' => 'قوانغدونغ كراون', 'zh' => '广东皇冠'],
        'logo_id' => $id,
    ])->assertSessionHasNoErrors();

    expect(app(CompanySettings::class)->logo_id)->toBe($id);
});

test('a missing translation is reported against its own locale', function () {
    $this->actingAs(User::factory()->create(['role' => Role::Admin]));

    $this->put('/admin/settings/company', [
        'name' => ['en' => 'Guang Dong Crown', 'ar' => 'قوانغدونغ كراون'],
    ])->assertSessionHasErrors(['name.zh']);
});
