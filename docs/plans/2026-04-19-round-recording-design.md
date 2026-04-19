# Round Recording Design

## Overview

Replace the single-text `opponent_deck_archetype` field with two separate Pokemon selections, using PokeAPI for search and local sprites for display.

## Database Schema

### Change: `rounds` table

| Field | Type | Notes |
|-------|------|-------|
| `opponent_deck_archetype` | **REMOVE** | |
| `opponent_pokemon_1` | integer, not null | Dex number of first Pokemon |
| `opponent_pokemon_2` | integer, not null | Dex number of second Pokemon |

Both fields are required. Composite queries supported: `.eq('opponent_pokemon_1', 35).eq('opponent_pokemon_2', 36)` for exact pair matching.

## Components

### 1. PokemonCombobox

Reusable combobox component for searching and selecting Pokemon.

**Props**:
- `value`: number | null
- `onChange`: (dexNumber: number) => void
- `className`?: string

**Behavior**:
- Debounced search (300ms) against PokeAPI
- Search endpoint: `GET https://api.pokeapi.co/v2/pokemon?limit=100000&q={search}&name`
- Parse dex number from response `url` field: `/pokemon/{id}`
- Display up to 10 results with name + sprite
- Loading, empty, and error states handled
- Clear button when value selected

**Selected state display**: Sprite only (`/icons/{dex}.png`)

### 2. Add Round Dialog

Replaces `opponent_archetype` input with two `PokemonCombobox` instances.

**Fields**:
1. Pokemon 1 — `PokemonCombobox` (required)
2. Pokemon 2 — `PokemonCombobox` (required)
3. Result — RadioGroup (Win/Loss, default: Win)

**Validation**: Both Pokemon must be selected before submission.

**On submit**: Save `opponent_pokemon_1`, `opponent_pokemon_2`, `result`. Clear form and close dialog.

### 3. Round Display (TournamentRounds)

Replace text display `vs {opponent_deck_archetype}` with two sprites side-by-side.

**Layout**:
```
[⭐35] [⭐36] | W | Delete
```

**Sprite path logic**:
- Base Pokemon: `/icons/{dex_number}.png`
- Variants (mega, etc.): `/icons/100{dex_number}.png`

**Fallback**: If sprite file not found, display dex number as text.

## Sprite Naming Convention

- Base Pokemon: `{dex_number}.png` (e.g., `35.png` for Clefairy)
- Variants: `100{dex_number}.png` (e.g., `10036.png` for Mega Blastoise)

Variant detection: Parse Pokemon name for forms like "mega", "galarian", "alolan" in the PokeAPI response and apply `100` prefix mapping.

## Implementation Notes

- Add `PokemonCombobox` to `components/ui/` or `components/tournaments/`
- Update `Round` type in `lib/types.ts`
- Update `addRound` in `lib/db.ts` to accept new fields
- Update `tournament-rounds.tsx` for sprite display