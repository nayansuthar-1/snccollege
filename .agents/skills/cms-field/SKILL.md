---
name: cms-field
description: Add or change a piece of college-editable content end to end — WordPress field or setting, REST serializer, TypeScript contract, and the React component that renders it. Use whenever content would otherwise be hardcoded in a component, or the college needs to edit something from wp-admin.
---

# Making content editable

Anything factual belongs in WordPress, not in a component. This is the path from "the college
needs to change this" to a working field, in the order that avoids rework.

Worked example: the Google rating added on 2026-10-10 — grep `google_rating` to see all four
layers at once. The college logo (`logo_id`) is the same pattern with an image and a bundled
fallback.

## Decide first: setting or post type?

- **One value for the whole site** (a phone number, a rating, the logo) → a **setting** in
  `includes/settings.php`.
- **A repeating record** (a notice, a review, a faculty member) → a **custom post type**
  field in the registry in `includes/meta.php`.

## 1. WordPress — declare the field

**Setting.** One row in `snc_settings_schema()`:

```php
'google_rating' => ['reviews', 'Google rating', 'text', 'Help text shown under the input.'],
```

`[section, label, input, description]`. A new section also needs a row in
`snc_settings_sections()`.

**Post type field.** One row in the `snc_field_registry()` group for that type:

```php
'snc_rating' => ['input' => 'select', 'label' => 'Star rating',
                 'options' => ['' => 'No rating', '5' => '5 stars'], 'desc' => '…'],
```

Either way, that single line registers the meta, renders the admin input and sanitises the
value. **Do not write a meta box by hand.**

Input types: `text`, `textarea`, `lines`, `url`, `email`, `checkbox`, `select` (needs
`options`), `image`, `file`, `gallery`, `members`. A type that does not exist yet needs a
`case` in `snc_render_field()` (`includes/admin/fields.php`) and usually one in
`snc_sanitize_field_value()` (`includes/meta.php`).

Images and documents are stored as **attachment IDs**, never URLs, so size, MIME and alt can
be resolved later. Name them `*_id`.

## 2. WordPress — expose it

Add it to the serializer in `includes/rest/serializers.php`:

```php
'google_rating' => $s['google_rating'],
'logo'          => snc_img((int) $s['logo_id'], 'large'),   // attachment id → Img | null
```

`snc_img()` returns `null` when nothing is set — that null is what lets the frontend hide the
feature or fall back. Never emit an empty string where the type says `Img | null`.

If this is a new content type, add it to the revalidation tag map in `includes/revalidate.php`
or edits will never reach the site.

Check it: `php -l` the files, then

```bash
curl -s "http://localhost:8881/?rest_route=/snc/v1/settings"
```

## 3. Frontend — the contract

`frontend/lib/wp/types.ts` must match the JSON exactly. Add the field to the type **and** to
`emptySettings`, which is what renders when WordPress is unreachable — its value is always
the empty one (`''`, `null`, `[]`), never a sample.

```ts
google_rating: string;
logo: Img | null;
```

## 4. Frontend — render it

- Read it from `settings` or the item; never hardcode.
- **Empty must be handled.** Hide the element, hide the section, or render `<EmptyState>` —
  §8.2 forbids a fabricated stand-in.
- A bundled asset may be a fallback where the site must never be without one (the logo uses
  `logoSrc()` in `config/site.ts`), but a *fact* never gets a fallback value.
- Thread the value through props from the server component. Do not fetch in a client component.

## 5. Seeding

- Verified content → `seed/content.php`.
- Test records → `snc_seed_samples()`, every title prefixed `[SAMPLE]`.
- **Never seed an unverified fact into settings.** Settings are real content: a sample rating
  or phone number there will be mistaken for the truth. If you need a value to photograph a
  layout, set it temporarily, take the screenshot, then clear it.

## 6. Hand it over

The college cannot use a field they do not know exists. For each field added, record in
`docs/PROGRESS.md` and, if the college must supply the value, in
`docs/03-CONTENT-REQUIREMENTS.md`:

- where it is in wp-admin ("SNC Settings → Reviews → Google rating"),
- exactly what to enter, in their words,
- what the site does while it is empty.
