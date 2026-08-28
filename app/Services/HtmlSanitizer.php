<?php

declare(strict_types=1);

namespace App\Services;

use HTMLPurifier;
use HTMLPurifier_Config;

/**
 * Cleans rich-text submitted through the CMS before it is stored.
 *
 * Editor accounts are trusted to write copy, not markup: sanitising on the
 * way in means the public site can render stored HTML without any client-side
 * escaping gymnastics, and a compromised editor account cannot plant script.
 */
class HtmlSanitizer
{
    private ?HTMLPurifier $purifier = null;

    public function clean(?string $html): ?string
    {
        if ($html === null || trim($html) === '') {
            return null;
        }

        return $this->purifier()->purify($html);
    }

    private function purifier(): HTMLPurifier
    {
        if ($this->purifier !== null) {
            return $this->purifier;
        }

        $config = HTMLPurifier_Config::createDefault();

        $config->set('Cache.SerializerPath', storage_path('framework/cache/htmlpurifier'));
        $config->set('HTML.Doctype', 'HTML 4.01 Transitional');
        $config->set('HTML.Allowed', implode(',', [
            'p', 'br', 'strong', 'em', 'u', 's',
            'h2', 'h3', 'h4',
            'ul', 'ol', 'li',
            'blockquote',
            'a[href|title|rel|target]',
            'img[src|alt|title|width|height|loading]',
            'figure', 'figcaption',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'hr', 'code', 'pre',
        ]));
        $config->set('HTML.TargetBlank', true);
        $config->set('HTML.Nofollow', true);
        $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true, 'mailto' => true, 'tel' => true]);
        $config->set('AutoFormat.RemoveEmpty', true);
        $config->set('AutoFormat.AutoParagraph', false);

        if (! is_dir($path = storage_path('framework/cache/htmlpurifier'))) {
            mkdir($path, 0o775, true);
        }

        return $this->purifier = new HTMLPurifier($config);
    }
}
