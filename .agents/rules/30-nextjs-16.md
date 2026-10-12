---
trigger: glob
globs: frontend/app/**/*.tsx,frontend/app/**/*.ts,frontend/lib/wp/**/*.ts,frontend/next.config.ts
description: Next.js 16 App Router specifics for this project — async params, caching and revalidation, data fetching, metadata.
---

# Next.js 16 in this project

**Next.js 16 is not the Next.js in most training data.** Before writing routing, data
fetching, caching, metadata, fonts, images, route handlers or server actions, read the
matching file under `frontend/node_modules/next/dist/docs/01-app/`. The installed version is
authoritative; a blog post is not.

Differences that bite:

- `params` and `searchParams` are **Promises**: `const { slug } = await params;`
- `revalidateTag(tag, 'max')` takes **two** arguments. The one-argument form is deprecated.
- Middleware is now called **Proxy** (`proxy.ts`). This project does not need one.

## Data

- All WordPress calls go through `lib/wp/api.ts`, which uses `lib/wp/client.ts` (`server-only`).
  **Never fetch WordPress from a client component or the browser.**
- Endpoints are called as `{WORDPRESS_URL}/?rest_route=/snc/v1/…`, not `/wp-json/…`, because
  the local install uses plain permalinks.
- Fetches carry `{ next: { revalidate: 300, tags: [...] } }`. WordPress POSTs to
  `/api/revalidate` on save with the matching tags.
- `WORDPRESS_URL` is server-only. It must never become `NEXT_PUBLIC_*`.
- If WordPress is unreachable the build must still succeed and pages must render their empty
  states. Test with `WORDPRESS_URL=http://127.0.0.1:9 npm run build`.

## Types

TypeScript strict. No `any` — use `unknown` and narrow. No `@ts-ignore`. The API contract
lives in `lib/wp/types.ts`; the PHP serializers must produce exactly those shapes. Change
both sides together, or the mismatch only shows up at runtime.

## Metadata

Every route exports `generateMetadata` with a unique title, description and canonical, and an
Open Graph image falling back to `settings.default_og_image`. Breadcrumbs emit
`BreadcrumbList` JSON-LD; the homepage emits `CollegeOrUniversity`.

## Images

Always `next/image` with explicit `sizes`. `next.config.ts` restricts `remotePatterns` to the
WordPress host — do not widen it to `**`. Hero first slide gets `priority`.

## Navigation

`frontend/config/navigation.ts` is the single source for the header, mobile drawer, footer,
section sidebars, breadcrumbs and the sitemap. Change navigation there and nowhere else.
Note that it deliberately follows the college's own menu, not design system §7.2 — see the
"Phase 10 follow-up" entry in `docs/PROGRESS.md` before you "fix" the discrepancy.
