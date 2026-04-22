# Deck Card Management Design

## Date: 2026-04-22

## Overview

Allow users to add TCG cards from the tcgtracking API to their deck of 60 cards. Users can search by name, set abbreviation, or collector number. Cards are stored in Supabase with full card data.

## Layout

- **Left column (60%):** User's deck with up to 60 cards, grouped by card type
- **Right column (40%):** Search panel with name/set/number inputs and results grid

## Search Flow

1. User types in name, set abbreviation, or collector number
2. API fetches from tcgtracking `/sets/{id}` or `/search` endpoint
3. Results show as card thumbnails in a scrollable grid
4. Click card → add to deck (if deck < 60 cards)

## Data Storage

### New `deck_cards` Table
```sql
deck_id UUID → decks(id) ON DELETE CASCADE
product_id INTEGER
name TEXT
set_name TEXT
set_abbreviation TEXT
collector_number TEXT
rarity TEXT
image_url TEXT
attack_name TEXT
attack_damage TEXT
hp INTEGER
pokemon_type TEXT
quantity INTEGER DEFAULT 1
```

### API Route Updates
- `/api/cards` — Accepts `?set=id&name=&number=` params
- Fetches from tcgtracking and returns filtered results

## Key UX

- Show deck count (e.g., "32/60 cards")
- Prevent adding if deck is full
- Cards in deck show quantity badge if > 1
- Click card in deck to remove it
- Deck cards persisted to Supabase (survives refresh, works across devices)

## Implementation

See `docs/plans/2026-04-22-deck-card-management-implementation.md` for implementation plan.