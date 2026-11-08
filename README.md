# Schema Forge

**A premium, interactive JSON-LD Schema Markup generator.**

Fill out a visual form, watch valid Schema.org JSON-LD generate in real time, and copy production-ready `<script>` tags — no markup knowledge required.

![Stack](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Stack](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Stack](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)
![Stack](https://img.shields.io/badge/Framer%20Motion-14-0055FF?logo=framer)

---

## Features

- **10 Schema.org types out of the box** — Organization, Product, Recipe, LocalBusiness, FAQPage, Article, Event, HowTo, BreadcrumbList, VideoObject
- **Real-time JSON-LD generation** — every keystroke updates the output instantly
- **Smart validation** — fields required by Google for Rich Results are highlighted live in the output
- **One-click copy** — copies the full `<script type="application/ld+json">` block, ready for `<head>`
- **Cinematic scroll animations** — 3D blueprint grid reveal, split-screen panel entrances, and a scroll-velocity-reactive code glitch effect
- **Hybrid Glassmorphism + Neumorphism UI** — dark, tactile, demo-ready design
- **Fully typed & extensible** — add a new schema type in ~30 lines (`src/lib/schemas.ts`)

## Tech Stack

| Layer    | Tech                                          |
| -------- | --------------------------------------------- |
| Framework| Next.js 16 (App Router, Turbopack)            |
| UI       | React 19, TypeScript (strict)                 |
| Styling  | Tailwind CSS v4 + custom glass/neumorphic CSS |
| Motion   | Framer Motion (`useScroll`, `useTransform`, `useVelocity`) |
| Icons    | Lucide React                                  |

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Theme tokens, glass & neumorphic utilities
│   ├── layout.tsx           # Fonts (Geist), metadata
│   └── page.tsx             # Landing composition
├── components/
│   ├── BlueprintBackground.tsx  # Scroll-driven 3D blueprint grid
│   ├── GlitchCodeRain.tsx       # Scroll-velocity code scramble effect
│   ├── Hero.tsx                 # Hero section
│   ├── JsonView.tsx             # Syntax-highlighted JSON renderer w/ missing-field markers
│   └── SchemaForge.tsx          # Main interactive generator (form + live output)
└── lib/
    └── schemas.ts           # Schema definitions, JSON-LD builders, validators
```

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # eslint
```

## Adding a New Schema Type

1. Create a `SchemaDef` in `src/lib/schemas.ts` with `fields`, `build(values)`, and `validate(json)`.
2. Append it to the `SCHEMAS` array.
3. Register its icon in `ICONS` inside `src/components/SchemaForge.tsx`.

The form renderer, JSON preview, validation highlighting, and copy flow pick it up automatically — no other changes needed.

## Deployment

Deploys to Vercel with zero configuration (`vercel deploy` or connect the repo). Fully static — no database, no API routes, no environment variables.

## License

Sold as source code. See Acquire.com listing for terms.
