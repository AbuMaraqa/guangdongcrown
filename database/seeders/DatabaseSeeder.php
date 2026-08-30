<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * The seeders are idempotent: they can be re-run against an existing
     * database to restore the baseline structure without duplicating records.
     */
    public function run(): void
    {
        $this->firstSuperAdmin();

        $this->call([
            CatalogueSeeder::class,
            SystemsSeeder::class,
            EditorialSeeder::class,
        ]);
    }

    /**
     * Creates the initial dashboard account when none exists yet.
     *
     * The credentials come from the environment so a real password is never
     * committed; the console output makes clear it must be changed.
     */
    private function firstSuperAdmin(): void
    {
        if (User::query()->exists()) {
            return;
        }

        $email = (string) config('cms.admin.email');
        $password = (string) (config('cms.admin.password') ?: 'password');

        $user = User::query()->create([
            'name' => (string) config('cms.admin.name'),
            'email' => $email,
            'password' => Hash::make($password),
            'role' => Role::SuperAdmin,
            'is_active' => true,
        ]);

        $user->forceFill(['email_verified_at' => now()])->save();

        if ($this->command === null) {
            return;
        }

        $this->command->newLine();
        $this->command->info('Super admin created.');
        $this->command->line("  Email:    {$email}");
        $this->command->line("  Password: {$password}");
        $this->command->warn('  Change this password after the first sign-in.');
        $this->command->newLine();
    }
}
