<?php

use App\Cms\ResourceRegistry;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\InquiryController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\ResourceController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'staff'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function (): void {
        Route::get('/', DashboardController::class)->name('dashboard');

        /*
        | Media library
        */
        Route::get('media', [MediaController::class, 'index'])->name('media.index');
        Route::get('media/browse', [MediaController::class, 'browse'])->name('media.browse');
        Route::post('media', [MediaController::class, 'store'])->name('media.store');
        Route::patch('media/{medium}', [MediaController::class, 'update'])->name('media.update');
        Route::delete('media/{medium}', [MediaController::class, 'destroy'])->name('media.destroy');

        /*
        | Enquiries
        */
        Route::get('enquiries', [InquiryController::class, 'index'])->name('inquiries.index');
        Route::get('enquiries/{inquiry}', [InquiryController::class, 'show'])->name('inquiries.show');
        Route::patch('enquiries/{inquiry}', [InquiryController::class, 'update'])->name('inquiries.update');
        Route::post('enquiries/{inquiry}/notes', [InquiryController::class, 'addNote'])->name('inquiries.notes.store');
        Route::get('enquiries/{inquiry}/attachment', [InquiryController::class, 'attachment'])->name('inquiries.attachment');
        Route::delete('enquiries/{inquiry}', [InquiryController::class, 'destroy'])->name('inquiries.destroy');

        /*
        | Global settings
        */
        Route::get('settings/{group?}', [SettingsController::class, 'edit'])->name('settings.edit');
        Route::put('settings/{group}', [SettingsController::class, 'update'])->name('settings.update');

        /*
        | Dashboard accounts
        */
        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::patch('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

        /*
        | Schema-driven content resources
        */
        Route::prefix('content/{resource}')
            ->name('resources.')
            ->where(['resource' => implode('|', app(ResourceRegistry::class)->keys())])
            ->group(function (): void {
                Route::get('/', [ResourceController::class, 'index'])->name('index');
                Route::get('create', [ResourceController::class, 'create'])->name('create');
                Route::post('/', [ResourceController::class, 'store'])->name('store');
                Route::post('reorder', [ResourceController::class, 'reorder'])->name('reorder');
                Route::get('{record}/edit', [ResourceController::class, 'edit'])->name('edit');
                Route::put('{record}', [ResourceController::class, 'update'])->name('update');
                Route::post('{record}/toggle', [ResourceController::class, 'toggle'])->name('toggle');
                Route::post('{record}/restore', [ResourceController::class, 'restore'])->name('restore');
                Route::delete('{record}', [ResourceController::class, 'destroy'])->name('destroy');
            });
    });
