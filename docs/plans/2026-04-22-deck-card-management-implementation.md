# Deck Card Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow users to add TCG cards from tcgtracking API to their deck of 60 cards with full data persistence.

**Architecture:** Two-column layout with deck on left (60%) and search on right (40%). Card data stored in Supabase `deck_cards` table with full card attributes. Search API route accepts name, set, and number params.

**Tech Stack:** Next.js App Router, Supabase, tcgtracking API, shadcn/ui

---

### Task 1: Create Migration for deck_cards Table

**Files:**
- Create: `supabase/migrations/20260422010000_create_deck_cards_table.sql`

**Step 1: Write migration**

```sql
CREATE TABLE IF NOT EXISTS deck_cards (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  set_name TEXT NOT NULL,
  set_abbreviation TEXT NOT NULL,
  collector_number TEXT NOT NULL,
  rarity TEXT,
  image_url TEXT,
  attack_name TEXT,
  attack_damage TEXT,
  hp INTEGER,
  pokemon_type TEXT,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE deck_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own deck cards"
  ON deck_cards
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = deck_cards.deck_id
      AND decks.user_id = auth.uid()
    )
  );

CREATE INDEX idx_deck_cards_deck_id ON deck_cards(deck_id);
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260422010000_create_deck_cards_table.sql
git commit -m "feat: add deck_cards table migration"
```

---

### Task 2: Add DeckCard Type to Types

**Files:**
- Modify: `lib/types.ts`

**Step 1: Add DeckCard interface**

```typescript
export interface DeckCard {
  id: string;
  deck_id: string;
  product_id: number;
  name: string;
  set_name: string;
  set_abbreviation: string;
  collector_number: string;
  rarity: string | null;
  image_url: string | null;
  attack_name: string | null;
  attack_damage: string | null;
  hp: number | null;
  pokemon_type: string | null;
  quantity: number;
  created_at: string;
}
```

**Step 2: Add deck-related CRUD functions**

Modify `lib/db.ts` to add:
- `getDeckCards(deckId: string): Promise<DeckCard[]>`
- `addDeckCard(card: Omit<DeckCard, 'id' | 'created_at'>): Promise<string>`
- `deleteDeckCard(id: string): Promise<void>`
- `updateDeckCardQuantity(id: string, quantity: number): Promise<void>`

**Step 3: Commit**

```bash
git add lib/types.ts lib/db.ts
git commit -m "feat: add DeckCard type and CRUD functions"
```

---

### Task 3: Update Cards API Route for Search

**Files:**
- Modify: `app/api/cards/route.ts`

**Step 1: Update API route to accept search params**

```typescript
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const setId = searchParams.get("set") || "24380"
  const name = searchParams.get("name") || ""
  const number = searchParams.get("number") || ""

  try {
    const res = await fetch(`https://tcgtracking.com/tcgapi/v1/3/sets/${setId}`)
    const data = await res.json()
    let products = data.products || []

    if (name) {
      products = products.filter((p: { name?: string }) =>
        p.name?.toLowerCase().includes(name.toLowerCase())
      )
    }

    if (number) {
      products = products.filter((p: { number?: string }) =>
        p.number?.toLowerCase().includes(number.toLowerCase())
      )
    }

    const results = products.slice(0, 20).map((p: {
      id: number
      name: string
      number: string
      image_url: string
      rarity: string
    }) => ({
      product_id: p.id,
      name: p.name,
      number: p.number,
      image_url: p.image_url,
      rarity: p.rarity,
    }))

    return NextResponse.json(results)
  } catch (error) {
    console.error("TCG Tracking API error:", error)
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 })
  }
}
```

**Step 2: Commit**

```bash
git add app/api/cards/route.ts
git commit -m "feat: update cards API for search with name and number params"
```

---

### Task 4: Update Deck Detail Page Layout

**Files:**
- Modify: `app/deck/[id]/page.tsx`

**Step 1: Add two-column layout with deck and search panels**

Replace current page content with:
- Left panel: Deck cards list (60% width)
- Right panel: Search input + results grid (40% width)
- Add state for `deckCards`, `searchResults`, `searchQuery`, `setQuery`, `numberQuery`, `loading`

**Step 2: Add deck count display**

Show "X/60 cards" counter at top of deck panel

**Step 3: Commit**

```bash
git add app/deck/[id]/page.tsx
git commit -m "feat: add two-column layout to deck detail page"
```

---

### Task 5: Implement Search Functionality

**Files:**
- Modify: `app/deck/[id]/page.tsx`

**Step 1: Add search handler**

```typescript
async function handleSearch() {
  setSearching(true)
  try {
    const params = new URLSearchParams()
    if (searchQuery) params.set("name", searchQuery)
    if (setQuery) params.set("set", setQuery)
    if (numberQuery) params.set("number", numberQuery)

    const res = await fetch(`/api/cards?${params}`)
    const data = await res.json()
    setSearchResults(data)
  } catch (error) {
    console.error("Search failed:", error)
  } finally {
    setSearching(false)
  }
}
```

**Step 2: Add search input fields and results grid**

- Input for name, set abbreviation, collector number
- Search button
- Grid of card thumbnails (max 3 columns)
- Click card → add to deck

**Step 3: Commit**

```bash
git add app/deck/[id]/page.tsx
git commit -m "feat: implement card search functionality"
```

---

### Task 6: Implement Add/Remove Deck Cards

**Files:**
- Modify: `app/deck/[id]/page.tsx`

**Step 1: Add card to deck**

```typescript
async function handleAddCard(card: Card) {
  if (deckCards.length >= 60) return

  try {
    await addDeckCard({
      deck_id: deckId,
      product_id: card.product_id,
      name: card.name,
      set_name: "",
      set_abbreviation: "",
      collector_number: card.number,
      rarity: card.rarity,
      image_url: card.image_url,
      attack_name: null,
      attack_damage: null,
      hp: null,
      pokemon_type: null,
      quantity: 1,
    })
    loadDeckCards()
  } catch (error) {
    console.error("Failed to add card:", error)
  }
}
```

**Step 2: Remove card from deck**

```typescript
async function handleRemoveCard(cardId: string) {
  try {
    await deleteDeckCard(cardId)
    loadDeckCards()
  } catch (error) {
    console.error("Failed to remove card:", error)
  }
}
```

**Step 3: Commit**

```bash
git add app/deck/[id]/page.tsx
git commit -m "feat: implement add/remove deck cards"
```

---

### Task 7: Style Deck Cards Display

**Files:**
- Modify: `app/deck/[id]/page.tsx`

**Step 1: Display deck cards with quantity badges**

- Show card image + name + set + number
- Quantity badge if > 1
- Click to remove
- Group by type (Pokémon, Trainer, Energy) if feasible

**Step 2: Add loading and empty states**

**Step 3: Commit**

```bash
git add app/deck/[id]/page.tsx
git commit -m "feat: style deck cards display"
```

---

### Task 8: Run Lint and Typecheck

**Step 1: Run checks**

```bash
pnpm lint && pnpm typecheck
```

**Step 2: Fix any errors**

**Step 3: Final commit if changes made**

```bash
git add -A && git commit -m "fix: resolve lint/typecheck issues"
```

---

**Plan complete.** Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**