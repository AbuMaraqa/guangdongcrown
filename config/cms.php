<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Initial dashboard account
    |--------------------------------------------------------------------------
    |
    | Used once, by the database seeder, to create the first super admin when
    | no accounts exist. Leaving the password empty makes the seeder generate
    | a random one and print it to the console.
    |
    */

    'admin' => [
        'name' => env('ADMIN_NAME', 'Site Administrator'),
        'email' => env('ADMIN_EMAIL', 'admin@guangdongcrown.co'),
        'password' => env('ADMIN_PASSWORD'),
    ],

];
