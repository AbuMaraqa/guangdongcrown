<?php

declare(strict_types=1);

use App\Support\Locales;
use Spatie\LaravelSettings\Migrations\SettingsMigration;

/**
 * Seeds the settings each group needs to exist with.
 *
 * Values a visitor reads are stored per locale. Anything that would be a
 * factual claim about the business — contact details, the founding year,
 * credibility figures — is deliberately left empty for the company to fill in
 * from the dashboard.
 */
return new class extends SettingsMigration
{
    public function up(): void
    {
        $this->migrator->add('company.name', $this->text([
            'en' => 'Guang Dong Crown',
            'ar' => 'قوانغدونغ كراون',
        ]));
        $this->migrator->add('company.legal_name', $this->text([]));
        $this->migrator->add('company.tagline', $this->text([
            'en' => 'Complete aluminium and logistics solutions',
            'ar' => 'حلول متكاملة للألمنيوم والخدمات اللوجستية',
        ]));
        $this->migrator->add('company.description', $this->text([
            'en' => 'Guang Dong Crown supplies aluminium and manages the freight, storage and inland transport that gets it to site — one partner accountable for both the material and its movement.',
            'ar' => 'توفّر قوانغدونغ كراون الألمنيوم وتدير الشحن والتخزين والنقل البري حتى الموقع — شريك واحد مسؤول عن المادة وعن حركتها معاً.',
        ]));
        $this->migrator->add('company.address', $this->text([]));
        $this->migrator->add('company.founded_year', null);
        $this->migrator->add('company.email', null);
        $this->migrator->add('company.phone', null);
        $this->migrator->add('company.whatsapp', null);
        $this->migrator->add('company.logo_id', null);
        $this->migrator->add('company.logo_inverse_id', null);

        $this->migrator->add('home.hero_eyebrow', $this->text([
            'en' => 'Aluminium supply and global logistics',
            'ar' => 'توريد الألمنيوم والخدمات اللوجستية العالمية',
        ]));
        $this->migrator->add('home.hero_headline', $this->text([
            'en' => 'Precision in aluminium. Confidence in global logistics.',
            'ar' => 'دقة في الألمنيوم. ثقة في الخدمات اللوجستية العالمية.',
        ]));
        $this->migrator->add('home.hero_subheadline', $this->text([
            'en' => 'We manufacture and supply aluminium to specification, then move it across borders on a schedule you can plan around — with one team answerable for both.',
            'ar' => 'نصنّع الألمنيوم ونورّده وفق المواصفات، ثم ننقله عبر الحدود بجدول زمني يمكنك التخطيط عليه — بفريق واحد مسؤول عن الأمرين.',
        ]));
        $this->migrator->add('home.hero_primary_label', $this->text([
            'en' => 'Request a quotation',
            'ar' => 'اطلب عرض سعر',
        ]));
        $this->migrator->add('home.hero_primary_url', '/request-a-quotation');
        $this->migrator->add('home.hero_secondary_label', $this->text([
            'en' => 'Explore capabilities',
            'ar' => 'استكشف قدراتنا',
        ]));
        $this->migrator->add('home.hero_secondary_url', '/capabilities');
        $this->migrator->add('home.hero_image_id', null);
        // Publish a figure only once it can be evidenced.
        $this->migrator->add('home.stats', []);
        $this->migrator->add('home.intro_eyebrow', $this->text([
            'en' => 'Who we are',
            'ar' => 'من نحن',
        ]));
        $this->migrator->add('home.intro_heading', $this->text([
            'en' => 'Two disciplines that usually sit with two suppliers, held by one.',
            'ar' => 'تخصّصان يوزَّعان عادةً على مورّدين، نجمعهما تحت مسؤولية واحدة.',
        ]));
        $this->migrator->add('home.intro_body', $this->text([
            'en' => 'Most aluminium problems are not metallurgy problems. They are handover problems — a mill that will not talk to a forwarder, a specification that changes after the booking, a container that clears customs without the mill certificate. We hold both halves, so the specification, the packing and the routing are decided together rather than in sequence.',
            'ar' => 'معظم مشكلات الألمنيوم ليست مشكلات معادن، بل مشكلات تسليم بين الأطراف — مصنع لا يتواصل مع وكيل الشحن، ومواصفة تتغيّر بعد الحجز، وحاوية تُخلَّص جمركياً دون شهادة المصنع. نحن نمسك الطرفين معاً، فتُتّخذ قرارات المواصفة والتغليف والمسار في وقت واحد بدل أن تأتي بالتتابع.',
        ]));

        $this->migrator->add('social.linkedin', null);
        $this->migrator->add('social.facebook', null);
        $this->migrator->add('social.instagram', null);
        $this->migrator->add('social.youtube', null);
        $this->migrator->add('social.x', null);
        $this->migrator->add('social.wechat', null);

        $this->migrator->add('seo.default_title', $this->text([
            'en' => 'Guang Dong Crown — Aluminium supply and global logistics',
            'ar' => 'قوانغدونغ كراون — توريد الألمنيوم والخدمات اللوجستية العالمية',
        ]));
        $this->migrator->add('seo.default_description', $this->text([
            'en' => 'Aluminium profiles, sheet and billet supplied to international specification, with freight, warehousing and supply chain management handled by the same team.',
            'ar' => 'قطاعات ألمنيوم وألواح وبيليت تُورَّد وفق المواصفات الدولية، مع إدارة الشحن والتخزين وسلسلة التوريد من الفريق نفسه.',
        ]));
        $this->migrator->add('seo.default_og_image_id', null);
        $this->migrator->add('seo.google_verification', null);
        $this->migrator->add('seo.indexable', true);

        $this->migrator->add('footer.cta_heading', $this->text([
            'en' => 'Send us the specification. We will send back the numbers.',
            'ar' => 'أرسل لنا المواصفة، ونرسل لك الأرقام.',
        ]));
        $this->migrator->add('footer.cta_body', $this->text([
            'en' => 'Alloy, temper, tolerance, destination and volume — we confirm what is feasible and what it costs, landed.',
            'ar' => 'السبيكة والمعالجة والتفاوت المسموح والوجهة والكمية — نؤكّد ما هو ممكن وكم يكلّف حتى الوصول.',
        ]));
        $this->migrator->add('footer.copyright', $this->text([
            'en' => '© '.date('Y').' Guang Dong Crown. All rights reserved.',
            'ar' => '© '.date('Y').' قوانغدونغ كراون. جميع الحقوق محفوظة.',
        ]));
        // Sampled from the company logo.
        $this->migrator->add('footer.accent', '#0AA6B8');
    }

    /**
     * Keeps only the locales that actually have copy. A missing key means
     * "not translated yet" and falls back to the default locale at read time.
     *
     * @param  array<string, string>  $values
     * @return array<string, string>
     */
    private function text(array $values): array
    {
        $filled = [];

        foreach (Locales::codes() as $code) {
            if (filled($values[$code] ?? null)) {
                $filled[$code] = $values[$code];
            }
        }

        return $filled;
    }
};
