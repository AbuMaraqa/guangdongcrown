<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Catalogue;
use App\Models\ProductCategory;
use Illuminate\Database\Seeder;

/**
 * Aluminium system families and their catalogues.
 *
 * The taxonomy mirrors how the group's other operation presents its profile
 * systems, so a customer moving between the two sites finds the same product
 * language. Catalogue records are created without page images: the drawings
 * are the company's own artwork and are uploaded from the dashboard.
 */
class SystemsSeeder extends Seeder
{
    public function run(): void
    {
        $families = [
            [
                'name' => 'External systems',
                'description' => 'Windows, doors and screens forming the outer envelope, engineered for wind load and weather-tightness.',
                'children' => ['Casement systems', 'Tilt and turn systems', 'Entrance doors'],
                'catalogues' => [
                    ['name' => 'External profiles', 'code' => null],
                    ['name' => 'Frames profiles', 'code' => null],
                ],
            ],
            [
                'name' => 'Internal systems',
                'description' => 'Partitions, office fronts and internal doors where sightlines and acoustics matter more than weathering.',
                'children' => ['Office partitions', 'Internal doors', 'Glazed screens'],
                'catalogues' => [
                    ['name' => 'Internal profiles', 'code' => null],
                    ['name' => 'Partitions for interior offices', 'code' => null],
                ],
            ],
            [
                'name' => 'Curtain wall systems',
                'description' => 'Stick and unitised facade systems carrying their own dead load and transferring wind load to the structure.',
                'children' => ['Stick systems', 'Unitised systems', 'Structural glazing'],
                'catalogues' => [
                    ['name' => 'Curtain wall 50 mm', 'code' => 'CW50'],
                    ['name' => 'Curtain wall 55 mm', 'code' => 'CW55'],
                ],
            ],
            [
                'name' => 'Sliding systems',
                'description' => 'Sliding and lift-and-slide assemblies for large openings, from domestic patio doors to terrace walls.',
                'children' => ['Lift and slide', 'Horizontal sliding', 'Slim sliding'],
                'catalogues' => [
                    ['name' => 'Sliding systems', 'code' => null],
                    ['name' => 'Glass wings profiles', 'code' => null],
                ],
            ],
            [
                'name' => 'Ventilated facade systems',
                'description' => 'Rear-ventilated cladding support systems: carrier rails, brackets and the fixings that tie them to the substrate.',
                'children' => ['Carrier systems', 'Cladding brackets'],
                'catalogues' => [
                    ['name' => 'Ventilated facade profiles', 'code' => null],
                ],
            ],
            [
                'name' => 'Industrial profiles',
                'description' => 'Machine framing, structural sections and custom-die extrusions produced to a drawing rather than a catalogue line.',
                'children' => ['Machine framing', 'Structural sections', 'Custom dies'],
                'catalogues' => [
                    ['name' => 'Industrial profiles', 'code' => null],
                    ['name' => 'Solar system profiles', 'code' => null],
                    ['name' => 'Trucks profiles', 'code' => null],
                ],
            ],
            [
                'name' => 'Standard profiles',
                'description' => 'Stock mill sections — angles, channels, tubes and bars — held for fabricators who need them without a lead time.',
                'children' => ['Angles', 'U and C channels', 'Tubes and bars'],
                'catalogues' => [
                    ['name' => 'Standard profiles', 'code' => null],
                    ['name' => 'Angles profiles', 'code' => null],
                    ['name' => 'U profiles', 'code' => null],
                ],
            ],
            [
                'name' => 'Accessories',
                'description' => 'The hardware that makes a system work: gaskets, corner cleats, handles, hinges and locking gear.',
                'children' => ['Gaskets and seals', 'Corner cleats', 'Handles and hinges'],
                'catalogues' => [
                    ['name' => 'Joining angles profiles', 'code' => null],
                    ['name' => 'Boxes profiles', 'code' => null],
                    ['name' => 'Shutters profiles', 'code' => null],
                ],
            ],
        ];

        foreach ($families as $position => $family) {
            $category = ProductCategory::query()->updateOrCreate(
                ['slug' => str($family['name'])->slug()->value()],
                [
                    'name' => $family['name'],
                    'description' => $family['description'],
                    'position' => $position + 10,
                    'is_active' => true,
                ],
            );

            foreach ($family['children'] as $childPosition => $child) {
                ProductCategory::query()->updateOrCreate(
                    ['slug' => str($child)->slug()->value()],
                    [
                        'parent_id' => $category->id,
                        'name' => $child,
                        'position' => $childPosition,
                        'is_active' => true,
                    ],
                );
            }

            foreach ($family['catalogues'] as $cataloguePosition => $catalogue) {
                Catalogue::query()->updateOrCreate(
                    ['slug' => str($catalogue['name'])->slug()->value()],
                    [
                        'product_category_id' => $category->id,
                        'name' => $catalogue['name'],
                        'code' => $catalogue['code'],
                        'excerpt' => 'Section drawings and assembly details for the '.mb_strtolower($catalogue['name']).' range.',
                        'position' => ($position * 10) + $cataloguePosition,
                        'is_active' => true,
                    ],
                );
            }
        }
    }
}
