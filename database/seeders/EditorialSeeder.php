<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\ContentStatus;
use App\Models\Category;
use App\Models\Faq;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Database\Seeder;

/**
 * Seeds the FAQ and the opening set of insight articles.
 *
 * The articles cover internationally standardised aluminium and shipping
 * conventions — verifiable public technical fact — so nothing here asserts
 * anything about this company's own performance, stock or customers.
 */
class EditorialSeeder extends Seeder
{
    public function run(): void
    {
        $this->faqs();
        $this->articles();
    }

    private function faqs(): void
    {
        $faqs = [
            [
                'category' => 'Ordering',
                'question' => 'What information do you need to prepare a quotation?',
                'answer' => 'At minimum: the alloy and temper, the section or thickness, the quantity, the destination and the date you need it. A drawing removes most of the back-and-forth. If you are unsure of the alloy, describe the application and we will propose one.',
            ],
            [
                'category' => 'Ordering',
                'question' => 'Can you work from a drawing rather than a catalogue reference?',
                'answer' => 'Yes. Custom extrusion profiles are produced from your drawing, with a die made to suit and first-article samples submitted for approval before the production run.',
            ],
            [
                'category' => 'Specification',
                'question' => 'Which aluminium alloys do you supply?',
                'answer' => 'Most work sits in the 6xxx series for extrusion (6063, 6061, 6082) and the 1xxx, 3xxx and 5xxx series for rolled products. If your application calls for something outside those families, tell us what it has to do and we will confirm whether we can source it.',
            ],
            [
                'category' => 'Specification',
                'question' => 'What is the difference between T5 and T6 temper?',
                'answer' => 'Both are artificially aged. T5 is cooled from the extrusion press and then aged, which preserves surface quality and suits architectural work. T6 is solution heat-treated before ageing, giving higher strength at some cost to finish. T6 is the usual choice for structural sections.',
            ],
            [
                'category' => 'Specification',
                'question' => 'Do shipments include mill certificates?',
                'answer' => 'Yes. Every consignment ships with the mill certificate for its cast, so the material can be traced. Dimensional reports are issued where the order specifies them.',
            ],
            [
                'category' => 'Logistics',
                'question' => 'Can you arrange shipping as well as supply?',
                'answer' => 'That is the point of the business. Ocean and air freight, customs documentation, warehousing and inland delivery are handled by the same team that manages the material, so packing and routing decisions are made together.',
            ],
            [
                'category' => 'Logistics',
                'question' => 'Which Incoterms do you work under?',
                'answer' => 'We quote against whichever Incoterm you prefer, and we confirm in writing where cost and risk transfer before the booking is made. If you have no preference, we will explain the practical difference for your route.',
            ],
            [
                'category' => 'Logistics',
                'question' => 'Can delivery be phased to match a construction programme?',
                'answer' => 'Yes. Material can be produced in one run and held in storage, then released in phases against your programme and packed in installation sequence.',
            ],
        ];

        foreach ($faqs as $position => $attributes) {
            Faq::query()->updateOrCreate(
                ['question' => $attributes['question']],
                [...$attributes, 'position' => $position, 'is_active' => true],
            );
        }
    }

    private function articles(): void
    {
        $categories = [
            ['name' => 'Material knowledge', 'description' => 'How aluminium alloys, tempers and finishes behave in practice.'],
            ['name' => 'Logistics', 'description' => 'Freight, documentation and the mechanics of moving metal across borders.'],
        ];

        $created = [];

        foreach ($categories as $position => $attributes) {
            $created[$attributes['name']] = Category::query()->updateOrCreate(
                ['slug' => str($attributes['name'])->slug()->value()],
                [...$attributes, 'position' => $position, 'is_active' => true],
            );
        }

        $articles = [
            [
                'category' => 'Material knowledge',
                'title' => 'Reading an aluminium alloy designation',
                'excerpt' => 'The four digits and the letter that follow tell you almost everything about how a piece of aluminium will behave. Here is how to read them.',
                'tags' => ['Alloys', 'Specification'],
                'content' => <<<'HTML'
                    <p>Aluminium designations look opaque until you know that the first digit carries most of the meaning. Under the International Alloy Designation System, that digit identifies the principal alloying element — and with it, the broad behaviour of the metal.</p>
                    <h2>The series</h2>
                    <ul>
                        <li><strong>1xxx</strong> — at least 99% aluminium. Soft, highly conductive, extremely formable. Chosen for reflectors, chemical handling and deep-drawn parts, never for strength.</li>
                        <li><strong>3xxx</strong> — manganese. Roughly 20% stronger than pure aluminium with most of the formability retained. The standard substrate for coated roofing and cladding.</li>
                        <li><strong>5xxx</strong> — magnesium. Strong corrosion resistance, including saltwater, with good weldability. The marine and pressure-vessel family.</li>
                        <li><strong>6xxx</strong> — magnesium and silicon. Heat treatable, extrudes cleanly, anodises well. Almost all architectural and structural extrusion sits here.</li>
                        <li><strong>7xxx</strong> — zinc. The highest strengths available in aluminium, at the cost of corrosion resistance and weldability. Aerospace territory.</li>
                    </ul>
                    <h2>The temper suffix</h2>
                    <p>The letter after the four digits describes what was done to the metal after it was formed, and it matters as much as the alloy. <strong>O</strong> is annealed — soft and maximally formable. <strong>H</strong> indicates strain hardening, used for non-heat-treatable alloys such as the 3xxx and 5xxx series. <strong>T</strong> indicates heat treatment, which is where the 6xxx and 7xxx series live.</p>
                    <p>Within the T tempers, the two most commonly specified for extrusion are T5 and T6. Both are artificially aged. T5 is cooled directly from the extrusion press and then aged; T6 is solution heat-treated first. T6 reaches higher mechanical properties; T5 tends to give the better surface, which is why architectural sections are usually specified T5 and structural ones T6.</p>
                    <h2>Why it changes the quotation</h2>
                    <p>Two orders for &ldquo;aluminium angle&rdquo; can differ by a factor of two in price and by weeks in lead time, purely on alloy and temper. Sending the designation with the enquiry — or describing the application clearly enough that we can propose one — is the single fastest way to get an accurate number back.</p>
                HTML,
            ],
            [
                'category' => 'Material knowledge',
                'title' => 'Anodising and powder coating: choosing a finish before you order',
                'excerpt' => 'Finish is not something applied at the end. It constrains the alloy, the tolerance and the handling from the moment the order is placed.',
                'tags' => ['Finishes', 'Specification'],
                'content' => <<<'HTML'
                    <p>Finish decisions made late are expensive. Both of the common architectural finishes place demands on the material and the process that have to be known before extrusion starts.</p>
                    <h2>Anodising</h2>
                    <p>Anodising grows an oxide layer out of the aluminium itself by electrochemical means. Because the layer is part of the metal rather than a coating on top of it, it will not chip or peel, and it wears well.</p>
                    <p>The consequence is that anodising shows everything. Alloy variation between casts appears as colour variation across a facade; die lines and handling marks are amplified rather than hidden. If a project is being anodised, sections that must match visually should be produced from the same cast, and that has to be specified at order.</p>
                    <h2>Powder coating</h2>
                    <p>Powder coating applies a polymer layer electrostatically and cures it. It offers effectively unlimited colour, hides minor surface variation, and is generally the cheaper route.</p>
                    <p>It is a coating, so it can chip, and edge coverage depends on the section geometry. Pre-treatment quality drives long-term adhesion more than the powder itself does — which is why coating specifications reference the pre-treatment standard, not just the colour.</p>
                    <h2>The practical rule</h2>
                    <p>Decide the finish at the same time as the alloy. It determines which casts can be used together, how the sections must be racked and interleaved, and how they have to be packed for transport. Retrofitting a finish decision onto an order already in production usually means starting the run again.</p>
                HTML,
            ],
            [
                'category' => 'Logistics',
                'title' => 'Incoterms in practice: where cost and risk actually change hands',
                'excerpt' => 'Most freight disputes are not about the freight. They are about a three-letter term that both parties read differently.',
                'tags' => ['Freight', 'Documentation'],
                'content' => <<<'HTML'
                    <p>Incoterms are published by the International Chamber of Commerce and define, for an international sale, who arranges transport, who pays for it, and at what precise point risk passes from seller to buyer. They do not define when title passes, and they are not a substitute for a contract.</p>
                    <h2>The terms that come up most</h2>
                    <ul>
                        <li><strong>EXW</strong> (Ex Works) — the buyer collects from the seller's premises and carries every cost and risk from that point, including export clearance. Simple for the seller; frequently underestimated by the buyer.</li>
                        <li><strong>FOB</strong> (Free On Board) — the seller delivers on board the vessel at the named port and clears for export. Risk passes once the goods are on board. Only meaningful for sea freight.</li>
                        <li><strong>CIF</strong> (Cost, Insurance and Freight) — the seller pays freight and minimum insurance to the destination port, but risk still passes at the origin port. This split is the most common source of confusion.</li>
                        <li><strong>DAP</strong> (Delivered At Place) — the seller delivers to the named destination, ready for unloading. The buyer handles import clearance and duty.</li>
                        <li><strong>DDP</strong> (Delivered Duty Paid) — the seller carries everything, including import duty. Maximum obligation on the seller.</li>
                    </ul>
                    <h2>Where things go wrong</h2>
                    <p>Two patterns account for most disputes. The first is CIF being read as &ldquo;covered until it arrives&rdquo;; it is not — the insurance is minimum cover and the risk transferred at the origin port. The second is a term being quoted without naming the place, which leaves the transfer point undefined and therefore arguable.</p>
                    <h2>What to insist on</h2>
                    <p>Always pair the term with a named place, and always confirm it in writing before booking. A quotation that says &ldquo;CIF Jebel Ali, Incoterms 2020&rdquo; is unambiguous. One that says &ldquo;CIF&rdquo; is not.</p>
                HTML,
            ],
        ];

        foreach ($articles as $index => $article) {
            $post = Post::query()->updateOrCreate(
                ['slug' => str($article['title'])->slug()->value()],
                [
                    'category_id' => $created[$article['category']]->id,
                    'title' => $article['title'],
                    'excerpt' => $article['excerpt'],
                    'content' => $article['content'],
                    'status' => ContentStatus::Published,
                    'published_at' => now()->subDays(($index + 1) * 6),
                    'is_featured' => $index === 0,
                ],
            );

            $post->tags()->sync(
                collect($article['tags'])
                    ->map(fn (string $name): int => Tag::query()->firstOrCreate(['name' => $name])->id)
                    ->all(),
            );
        }
    }
}
