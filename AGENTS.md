# Agent Guidance

## Dev Commands

```bash
pnpm dev          # Next.js dev with Turbopack
pnpm build        # Production build
pnpm lint         # Biome lint + autofix (--write --unsafe)
pnpm format       # Biome format + autofix
pnpm typecheck    # tsc --noEmit
```

Run `lint` before `typecheck`; fixing lint first avoids some type errors.

## Toolchain

- **Package manager**: pnpm (pnpm-lock.yaml, pnpm-workspace.yaml)
- **Linter/formatter**: Biome (biome.json), not ESLint. ESLint config exists but is not run via npm scripts.
- **CSS**: Tailwind CSS v4 via PostCSS. Config is inline in `app/globals.css` via `@theme` blocks — no `tailwind.config.*`.
- **UI library**: shadcn/ui (style: radix-vega, components in `components/ui/`)

## Components

* One component per file
* Small, composable components
* Props interface above component (`ComponentNameProps`)
* Accept `className` and merge with `cn()`

## Styling

* Tailwind only
* Always use `cn()` for conditional classes
* Prefer shadcn defaults + semantic tokens
* Responsive + dark mode by default

## Path Aliases

`@/*` maps to project root. Example: `import { Button } from "@/components/ui/button"`

## shadcn/ui Components

```bash
npx shadcn@latest add button   # adds to components/ui/
```

## Styling Conventions

- CSS vars defined in `app/globals.css` under `:root` and `.dark`
- `@import "tailwindcss"` not a standard tailwind config file
- Tab indentation (configured in biome.json)

## Key Files

- `app/` — Next.js App Router pages and layout
- `components/ui/` — shadcn/ui components
- `lib/utils.ts` — `cn()` utility
- `components/theme-provider.tsx` — Theme context (used in `app/layout.tsx`)

## General Rules

* Only commit changes when explicitly asked to by the user
* Server Components by default
* Add `"use client"` only when needed
* Named exports only (no default exports)
* Never modify `./components/ui` when asked to make changes to a shadcn component
* Run `pnpm lint` after changes
* Only commit when asked to, not after every change
* always prefer cuid2 to UUID.


## Design Principles

* Responsive first (mobile → desktop)
* Clear empty states
* Flat, readable code
* Duplicate components > overloading