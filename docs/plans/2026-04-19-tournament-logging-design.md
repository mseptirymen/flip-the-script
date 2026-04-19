# Tournament Logging Feature Design

## Overview

Allow Pokémon TCG players to log tournaments they participated in and track their round-by-round results. Player-focused, not tournament organizer-focused.

## Data Model

### Tournament Entity
- `id`: string (uuid)
- `name`: string (required)
- `date`: string | null (ISO date, optional)
- `rounds`: Round[]
- `createdAt`: timestamp

### Round Entity
- `id`: string (uuid)
- `roundNumber`: number (auto-incremented sequentially per tournament)
- `opponentDeckArchetype`: string (required)
- `result`: "win" | "loss" (required)

## Storage

**IndexedDB** database `flip-the-script` with `tournaments` store.

Why: Better performance for larger datasets, supports indexes, and consistent with future Supabase migration.

## UI Flow

1. `/tournaments` page shows list of user's tournaments with "Add Tournament" button
2. "Add Tournament" opens dialog with `name` (required) and `date` (optional) fields
3. Clicking a tournament navigates to `/tournaments/[id]` showing tournament details
4. Tournament detail page has breadcrumbs: `Tournaments > [Tournament Name]`
5. "Add Round" button opens dialog with `opponentDeckArchetype` (required) and `result` (required, win/loss toggle)
6. Rounds displayed as a list showing round number, opponent archetype, and win/loss badge

## Tournament Detail Page Layout

- Header shows tournament name and date (if set)
- "Add Round" button positioned top-right of content area
- Rounds displayed as cards or rows, sorted by round number (ascending)
- Each round shows: "Round [N]" label, opponent archetype, win/loss badge (green "W" / red "L")
- Empty state: "No rounds recorded yet. Click 'Add Round' to log your first round."
- Delete round: small trash icon on hover, confirmation before removing

## Components Needed

1. **Add Tournament Dialog** — name input (required), date picker (optional)
2. **Add Round Dialog** — text input for opponent archetype, win/loss radio/toggle
3. **Tournament Card** — displays tournament in list view
4. **Round Card/Row** — displays single round with result badge
5. **Empty States** — for no tournaments and no rounds