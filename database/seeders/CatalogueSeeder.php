<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Industry;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Service;
use App\Models\Solution;
use Illuminate\Database\Seeder;

/**
 * Seeds the capability and product catalogue.
 *
 * The four services mirror the capabilities the company already publishes.
 * Product entries describe internationally standardised aluminium alloys
 * (EN 573 / ASTM B221 designations) and their published properties — public
 * technical fact, not a claim about this company's stock or capacity.
 */
class CatalogueSeeder extends Seeder
{
    public function run(): void
    {
        $this->services();
        $this->industries();
        $this->products();
        $this->solutions();
    }

    private function services(): void
    {
        $services = [
            [
                'name' => 'Aluminium supply',
                'icon' => 'factory',
                'excerpt' => 'Profiles, sheet, coil and billet produced against your drawing, alloy and temper.',
                'description' => '<p>We supply aluminium against a specification rather than a catalogue line. That starts with confirming the alloy and temper are right for the application, checking the tolerance band is achievable in extrusion or rolling, and agreeing the finish before anything is quoted.</p><p>Every consignment ships with its mill certificate, so the material can be traced back to its cast.</p>',
                'features' => [
                    ['title' => 'Specification review', 'description' => 'Alloy, temper and tolerance checked for manufacturability before a price is given.'],
                    ['title' => 'Tooling and dies', 'description' => 'Custom extrusion profiles from your drawing, with sample approval before production.'],
                    ['title' => 'Finishing', 'description' => 'Mill finish, anodising and powder coating specified as part of the order.'],
                    ['title' => 'Certification', 'description' => 'Mill certificates and dimensional reports issued with every shipment.'],
                ],
            ],
            [
                'name' => 'Global freight',
                'icon' => 'ship',
                'excerpt' => 'Ocean and air freight booked, documented and tracked to the destination port or door.',
                'description' => '<p>Aluminium is awkward freight: long, heavy, easy to mark. We book it as cargo we understand — choosing between FCL, LCL, break bulk or air on the basis of the profile length and the deadline, not on whichever is cheapest per kilo.</p><p>Documentation is prepared alongside the booking so the paperwork and the container leave together.</p>',
                'features' => [
                    ['title' => 'Mode selection', 'description' => 'Ocean, air or a combination, chosen against the delivery window rather than the rate card.'],
                    ['title' => 'Export documentation', 'description' => 'Commercial invoice, packing list, certificate of origin and mill certificates prepared as one set.'],
                    ['title' => 'Incoterms clarity', 'description' => 'Responsibility, cost and risk agreed in writing before the booking is confirmed.'],
                    ['title' => 'Tracking', 'description' => 'Milestone updates from gate-in to arrival, with exceptions flagged rather than buried.'],
                ],
            ],
            [
                'name' => 'Warehousing and storage',
                'icon' => 'warehouse',
                'excerpt' => 'Consolidation, bonded storage and call-off stock held until the site is ready for it.',
                'description' => '<p>Projects rarely need all their material at once. We hold stock so the delivery schedule can follow the build programme instead of the production run — consolidating multiple orders into a single shipment, or releasing against call-off.</p>',
                'features' => [
                    ['title' => 'Consolidation', 'description' => 'Multiple orders combined into one shipment to reduce freight cost and handling.'],
                    ['title' => 'Call-off stock', 'description' => 'Material held and released against your programme rather than ours.'],
                    ['title' => 'Protective handling', 'description' => 'Interleaving, end caps and racking appropriate to finished surfaces.'],
                    ['title' => 'Stock visibility', 'description' => 'What is held, where, and how much remains against the order.'],
                ],
            ],
            [
                'name' => 'Supply chain solutions',
                'icon' => 'route',
                'excerpt' => 'End-to-end programme management where material, freight and storage are one plan.',
                'description' => '<p>When the aluminium, the freight and the storage are managed as one programme, the decisions stop competing. Packing is designed for the transport mode; the production sequence follows the delivery sequence; the documentation is built once.</p><p>This is the service most clients arrive at after the first project.</p>',
                'features' => [
                    ['title' => 'Single point of contact', 'description' => 'One person accountable across supply, freight and storage.'],
                    ['title' => 'Integrated planning', 'description' => 'Production, packing and shipping sequenced against your site programme.'],
                    ['title' => 'Landed cost visibility', 'description' => 'Material, freight, duty and handling priced as one figure.'],
                    ['title' => 'Exception management', 'description' => 'Delays surfaced early with options, not after the fact.'],
                ],
            ],
        ];

        foreach ($services as $position => $attributes) {
            Service::query()->updateOrCreate(
                ['slug' => str($attributes['name'])->slug()->value()],
                [...$attributes, 'position' => $position, 'is_featured' => true, 'is_active' => true],
            );
        }
    }

    private function industries(): void
    {
        $industries = [
            [
                'name' => 'Construction and architecture',
                'icon' => 'building-2',
                'excerpt' => 'Curtain walling, framing, cladding and structural sections for building envelopes.',
                'description' => '<p>Architectural aluminium is judged on the finish as much as the tolerance. Sections have to arrive unmarked, in sequence, and matched across a facade — which makes packing and delivery scheduling part of the specification rather than an afterthought.</p>',
            ],
            [
                'name' => 'Industrial manufacturing',
                'icon' => 'factory',
                'excerpt' => 'Machine framing, enclosures, heat sinks and fabricated assemblies.',
                'description' => '<p>Manufacturing customers usually buy against a drawing and a delivery date that cannot move. The work is in holding the tolerance across a production run and keeping the schedule aligned with the line.</p>',
            ],
            [
                'name' => 'Transportation',
                'icon' => 'truck',
                'excerpt' => 'Sections and sheet for trailers, rail interiors, marine fit-out and vehicle bodies.',
                'description' => '<p>Transport applications trade weight against strength, which usually points toward the 5xxx and 6xxx series. Formability, weldability and corrosion behaviour drive the alloy choice more than headline strength does.</p>',
            ],
            [
                'name' => 'Energy and infrastructure',
                'icon' => 'zap',
                'excerpt' => 'Solar mounting, busbar, cable management and utility structures.',
                'description' => '<p>Infrastructure programmes are volume and schedule problems. The material is often standard; the difficulty is delivering it in phases across dispersed sites without stalling installation crews.</p>',
            ],
            [
                'name' => 'Consumer and retail products',
                'icon' => 'package',
                'excerpt' => 'Display systems, furniture, appliance parts and finished goods components.',
                'description' => '<p>Consumer applications are surface-critical and cost-sensitive at the same time. Anodising and powder coating are specified early, because they constrain both the alloy and the handling.</p>',
            ],
        ];

        foreach ($industries as $position => $attributes) {
            Industry::query()->updateOrCreate(
                ['slug' => str($attributes['name'])->slug()->value()],
                [...$attributes, 'position' => $position, 'is_active' => true],
            );
        }
    }

    private function products(): void
    {
        $categories = [
            ['name' => 'Extruded profiles', 'description' => 'Standard and custom-die sections in the 6xxx series.'],
            ['name' => 'Sheet and plate', 'description' => 'Rolled flat products for fabrication, forming and cladding.'],
            ['name' => 'Coil and strip', 'description' => 'Continuous rolled product for high-volume forming operations.'],
            ['name' => 'Billet and ingot', 'description' => 'Cast feedstock for extrusion and re-melting.'],
        ];

        $created = [];

        foreach ($categories as $position => $attributes) {
            $created[$attributes['name']] = ProductCategory::query()->updateOrCreate(
                ['slug' => str($attributes['name'])->slug()->value()],
                [...$attributes, 'position' => $position, 'is_active' => true],
            );
        }

        $products = [
            [
                'category' => 'Extruded profiles',
                'name' => '6063 architectural profile',
                'sku' => 'EXT-6063-T5',
                'excerpt' => 'The standard architectural extrusion alloy: excellent surface finish, readily anodised, moderate strength.',
                'description' => '<p>6063 is the workhorse of architectural aluminium. It extrudes into thin, complex sections cleanly, takes an anodised finish evenly, and holds enough strength for window, door and curtain wall framing.</p><p>Supplied most often in T5 temper — cooled from the extrusion press and artificially aged — which balances strength against the surface quality that architectural work demands. T6 is available where higher mechanical properties are required.</p>',
                'specifications' => [
                    ['label' => 'Alloy', 'value' => '6063 (EN AW-6063 / AlMg0,7Si)'],
                    ['label' => 'Temper', 'value' => 'T5, T6'],
                    ['label' => 'Standard', 'value' => 'EN 755, ASTM B221'],
                    ['label' => 'Tensile strength (T5)', 'value' => '≥ 150 MPa'],
                    ['label' => 'Yield strength (T5)', 'value' => '≥ 110 MPa'],
                    ['label' => 'Finish options', 'value' => 'Mill, anodised, powder coated'],
                ],
                'applications' => [
                    'Window and door framing',
                    'Curtain wall and facade systems',
                    'Shopfront and partition systems',
                    'Handrail and balustrade sections',
                ],
                'featured' => true,
            ],
            [
                'category' => 'Extruded profiles',
                'name' => '6061 structural profile',
                'sku' => 'EXT-6061-T6',
                'excerpt' => 'Higher-strength structural extrusion with good weldability and corrosion resistance.',
                'description' => '<p>Where 6063 is chosen for its finish, 6061 is chosen for its mechanical properties. In T6 temper it offers substantially higher strength, which makes it the usual choice for load-bearing sections, machine framing and transport structures.</p><p>It welds and machines well, though strength in the heat-affected zone drops and should be accounted for in the design.</p>',
                'specifications' => [
                    ['label' => 'Alloy', 'value' => '6061 (EN AW-6061 / AlMg1SiCu)'],
                    ['label' => 'Temper', 'value' => 'T4, T6'],
                    ['label' => 'Standard', 'value' => 'ASTM B221, EN 755'],
                    ['label' => 'Tensile strength (T6)', 'value' => '≥ 260 MPa'],
                    ['label' => 'Yield strength (T6)', 'value' => '≥ 240 MPa'],
                    ['label' => 'Weldability', 'value' => 'Good (strength reduced in the HAZ)'],
                ],
                'applications' => [
                    'Structural framing and supports',
                    'Machine bases and enclosures',
                    'Transport and trailer structures',
                    'Machined components',
                ],
                'featured' => true,
            ],
            [
                'category' => 'Sheet and plate',
                'name' => '5052 marine-grade sheet',
                'sku' => 'SHT-5052-H32',
                'excerpt' => 'Magnesium-alloyed sheet with strong saltwater corrosion resistance and good formability.',
                'description' => '<p>5052 is the standard choice where aluminium meets a corrosive environment. The magnesium content gives it markedly better resistance to saltwater than the 6xxx series, and it forms and welds well in the annealed and strain-hardened tempers.</p><p>H32 — strain hardened and stabilised to a quarter hard condition — is the most commonly specified temper for sheet-metal work.</p>',
                'specifications' => [
                    ['label' => 'Alloy', 'value' => '5052 (EN AW-5052 / AlMg2,5)'],
                    ['label' => 'Temper', 'value' => 'H32, H34, O'],
                    ['label' => 'Standard', 'value' => 'ASTM B209, EN 485'],
                    ['label' => 'Tensile strength (H32)', 'value' => '≥ 210 MPa'],
                    ['label' => 'Thickness range', 'value' => '0.5 – 6.0 mm'],
                    ['label' => 'Corrosion resistance', 'value' => 'Excellent, including marine atmospheres'],
                ],
                'applications' => [
                    'Marine hulls, tanks and fittings',
                    'Pressure vessels and fuel tanks',
                    'Architectural cladding in coastal environments',
                    'Formed sheet-metal enclosures',
                ],
                'featured' => true,
            ],
            [
                'category' => 'Sheet and plate',
                'name' => '1050 pure aluminium sheet',
                'sku' => 'SHT-1050-H14',
                'excerpt' => '99.5% pure aluminium with high formability, reflectivity and electrical conductivity.',
                'description' => '<p>1050 contains at least 99.5% aluminium. It is soft, extremely formable and highly conductive, which makes it suitable for deep-drawn parts, reflectors, signage and chemical handling rather than anything structural.</p>',
                'specifications' => [
                    ['label' => 'Alloy', 'value' => '1050 (EN AW-1050A / Al 99,5)'],
                    ['label' => 'Temper', 'value' => 'O, H14, H24'],
                    ['label' => 'Standard', 'value' => 'EN 485, ASTM B209'],
                    ['label' => 'Purity', 'value' => '≥ 99.5% Al'],
                    ['label' => 'Tensile strength (H14)', 'value' => '≥ 105 MPa'],
                    ['label' => 'Electrical conductivity', 'value' => 'Approx. 61% IACS'],
                ],
                'applications' => [
                    'Signage and decorative panels',
                    'Reflectors and lighting components',
                    'Chemical and food processing equipment',
                    'Deep-drawn and spun components',
                ],
                'featured' => false,
            ],
            [
                'category' => 'Coil and strip',
                'name' => '3003 coated coil',
                'sku' => 'COL-3003-H14',
                'excerpt' => 'Manganese-alloyed coil for roofing, cladding and high-volume forming.',
                'description' => '<p>3003 adds manganese to commercially pure aluminium, gaining roughly 20% more strength while keeping most of the formability. Supplied in coil it is the standard substrate for coated roofing and cladding, ducting and general sheet-metal work.</p>',
                'specifications' => [
                    ['label' => 'Alloy', 'value' => '3003 (EN AW-3003 / AlMn1Cu)'],
                    ['label' => 'Temper', 'value' => 'H14, H16, H24'],
                    ['label' => 'Standard', 'value' => 'ASTM B209, EN 485'],
                    ['label' => 'Tensile strength (H14)', 'value' => '≥ 140 MPa'],
                    ['label' => 'Coating options', 'value' => 'PE, PVDF, mill finish'],
                    ['label' => 'Coil width', 'value' => 'To order'],
                ],
                'applications' => [
                    'Roofing and wall cladding',
                    'HVAC ducting and heat exchangers',
                    'Cooking utensils and general sheet work',
                    'Roll-formed profiles',
                ],
                'featured' => false,
            ],
            [
                'category' => 'Billet and ingot',
                'name' => '6xxx extrusion billet',
                'sku' => 'BIL-6XXX',
                'excerpt' => 'Homogenised casting billet in 6xxx-series compositions for extrusion feedstock.',
                'description' => '<p>Extrusion billet supplied to the composition and diameter your press requires. Homogenisation and ultrasonic inspection are specified as part of the order, since billet quality shows up directly in surface finish and die life.</p>',
                'specifications' => [
                    ['label' => 'Alloy family', 'value' => '6060, 6063, 6061, 6082'],
                    ['label' => 'Condition', 'value' => 'Homogenised'],
                    ['label' => 'Standard', 'value' => 'EN 1706 / customer specification'],
                    ['label' => 'Diameter', 'value' => 'To order'],
                    ['label' => 'Inspection', 'value' => 'Ultrasonic testing available'],
                ],
                'applications' => [
                    'Extrusion press feedstock',
                    'Re-melt and casting operations',
                ],
                'featured' => false,
            ],
        ];

        foreach ($products as $position => $attributes) {
            Product::query()->updateOrCreate(
                ['slug' => str($attributes['name'])->slug()->value()],
                [
                    'product_category_id' => $created[$attributes['category']]->id,
                    'name' => $attributes['name'],
                    'sku' => $attributes['sku'],
                    'excerpt' => $attributes['excerpt'],
                    'description' => $attributes['description'],
                    'specifications' => $attributes['specifications'],
                    'applications' => $attributes['applications'],
                    'is_featured' => $attributes['featured'],
                    'is_active' => true,
                    'position' => $position,
                ],
            );
        }
    }

    private function solutions(): void
    {
        $solutions = [
            [
                'title' => 'Global logistics',
                'slug' => 'global-logistics',
                'icon' => 'ship',
                'excerpt' => 'Freight, customs, warehousing and inland delivery run as one schedule with one owner.',
                'content' => '<p>Logistics fails at the joins. A mill books a container without knowing the profile length; a forwarder clears customs without the mill certificate; a site takes delivery of the last phase first. Running the whole movement under one plan removes those joins.</p><p>We take responsibility from the moment material leaves production to the moment it is signed for, and we tell you where it is in between.</p>',
                'features' => [
                    ['title' => 'Ocean and air freight', 'description' => 'FCL, LCL, break bulk and air, selected against the deadline and the profile.'],
                    ['title' => 'Customs and documentation', 'description' => 'Export and import paperwork prepared as one set alongside the booking.'],
                    ['title' => 'Bonded and general storage', 'description' => 'Material held near the destination and released against your programme.'],
                    ['title' => 'Inland transport', 'description' => 'Final-leg delivery arranged to site, including oversize sections.'],
                ],
                'benefits' => [
                    ['title' => 'One accountable owner', 'description' => 'No handover between supplier and forwarder, so no gap for a problem to sit in.'],
                    ['title' => 'Packing designed for the route', 'description' => 'Protection specified once the transport mode is known, not before.'],
                    ['title' => 'Landed cost, not ex-works cost', 'description' => 'Material, freight, duty and handling quoted as a single number.'],
                    ['title' => 'Early warning', 'description' => 'Schedule risk raised while there is still time to act on it.'],
                ],
                'process' => [
                    ['title' => 'Scope and route', 'description' => 'Origin, destination, Incoterm, cargo profile and deadline agreed in writing.'],
                    ['title' => 'Book and document', 'description' => 'Space confirmed and the full document set prepared alongside it.'],
                    ['title' => 'Move and monitor', 'description' => 'Milestone tracking from gate-in to arrival, with exceptions flagged.'],
                    ['title' => 'Deliver and close', 'description' => 'Customs clearance, inland delivery and proof of delivery returned to you.'],
                ],
                'featured' => true,
            ],
            [
                'title' => 'Project material supply',
                'slug' => 'project-material-supply',
                'icon' => 'boxes',
                'excerpt' => 'Aluminium supplied in phases that follow the build programme rather than the production run.',
                'content' => '<p>On a construction or infrastructure programme, material arriving early is nearly as expensive as material arriving late — it has to be stored, protected and moved twice. We produce to the full order and release it in phases against your schedule.</p>',
                'features' => [
                    ['title' => 'Phased release', 'description' => 'Production completed once, delivery split across the programme.'],
                    ['title' => 'Sequenced packing', 'description' => 'Consignments packed in installation order, labelled to your zones.'],
                    ['title' => 'Buffer stock', 'description' => 'An agreed reserve held against breakage and rework.'],
                    ['title' => 'Programme alignment', 'description' => 'Delivery dates revised with the programme rather than fixed at order.'],
                ],
                'benefits' => [
                    ['title' => 'Less on-site storage', 'description' => 'Only what the next phase needs is on site at any point.'],
                    ['title' => 'Fewer damaged sections', 'description' => 'Finished aluminium handled once instead of stored and re-handled.'],
                    ['title' => 'Predictable cash flow', 'description' => 'Payment aligned to release rather than the whole order up front.'],
                ],
                'process' => [
                    ['title' => 'Take-off review', 'description' => 'Quantities and sections checked against the drawings before order.'],
                    ['title' => 'Programme mapping', 'description' => 'Delivery phases agreed against the construction sequence.'],
                    ['title' => 'Production and hold', 'description' => 'Full order produced, then stored under our control.'],
                    ['title' => 'Call-off delivery', 'description' => 'Phases released on notice, in installation sequence.'],
                ],
                'featured' => true,
            ],
        ];

        foreach ($solutions as $position => $attributes) {
            $featured = $attributes['featured'];
            unset($attributes['featured']);

            Solution::query()->updateOrCreate(
                ['slug' => $attributes['slug']],
                [...$attributes, 'is_featured' => $featured, 'is_active' => true, 'position' => $position],
            );
        }

        $industries = Industry::query()->pluck('id');

        Solution::query()->where('slug', 'global-logistics')->first()?->industries()->sync($industries);
        Solution::query()->where('slug', 'project-material-supply')->first()?->industries()->sync(
            Industry::query()->whereIn('slug', [
                'construction-and-architecture',
                'energy-and-infrastructure',
            ])->pluck('id'),
        );
    }
}
