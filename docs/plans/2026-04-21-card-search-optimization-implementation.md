# Card Search Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Speed up card search from 10+ seconds to <100ms for subsequent searches using two-tier caching (server-side in-memory cache + client-side pre-fetch).

**Architecture:** Server uses in-memory Map with TTL to cache all Pokemon sets. Client pre-fetches data on page load and searches locally.

**Tech Stack:** Next.js App Router, React hooks (useRef, useEffect), TypeScript

---

### Task 1: Add Server-Side Cache to Cards API

**Files:**
- Modify: `app/api/cards/route.ts`

**Step 1: Add cache interface and storage**

Add after the existing interfaces:
```typescript
interface CacheEntry {
  products: TCGProduct[]
  timestamp: number
}

const setCache = new Map<string, CacheEntry>()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes
```

**Step 2: Add cache helpers**

```typescript
function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL
}

async function fetchSetWithCache(setId: string): Promise<TCGProduct[]> {
  const cached = setCache.get(setId)
  if (cached && isCacheValid(cached)) {
    return cached.products
  }

  const res = await fetch(`https://tcgtracking.com/tcgapi/v1/3/sets/${setId}`)
  const data = await res.json()
  const products: TCGProduct[] = data.products || []
  const cards = products.filter(isCardProduct)

  setCache.set(setId, { products: cards, timestamp: Date.now() })
  return cards
}
```

**Step 3: Replace sequential loop with parallel fetching**

Replace the `for` loop:
```typescript
const allProducts: TCGProduct[] = []

for (const set of pokemonSets) {
  try {
    const res = await fetch(`https://tcgtracking.com/tcgapi/v1/3/sets/${set.id}`)
    const data = await res.json()
    const products: TCGProduct[] = data.products || []
    const cards = products.filter(isCardProduct)
    allProducts.push(...cards)
  } catch {
    continue
  }
}
```

With:
```typescript
const allProducts: TCGProduct[] = []

const results = await Promise.all(
  pokemonSets.map(async (set) => {
    try {
      return await fetchSetWithCache(set.id)
    } catch {
      return []
    }
  })
)

for (const cards of results) {
  allProducts.push(...cards)
}
```

**Step 4: Add cache-warmer endpoint**

Add after the GET handler:
```typescript
export async function POST() {
  try {
    const setsRes = await fetch("https://tcgtracking.com/tcgapi/v1/3/sets")
    const setsData = await setsRes.json()
    const sets: TCGSet[] = setsData.sets || []

    const pokemonSets = sets.filter((s) => {
      const name = s.name.toLowerCase()
      const excludeTerms = ["magic", "yu-gi-oh", "mtg", "yugioh", "force", "weiss", "digimon", "onepiece", "dragonball", "world championship", "prize", "jumbo"]
      return !excludeTerms.some((term) => name.includes(term))
    })

    await Promise.all(pokemonSets.map((set) => fetchSetWithCache(set.id)))

    return NextResponse.json({ cached: setCache.size })
  } catch (error) {
    console.error("Cache warm error:", error)
    return NextResponse.json({ error: "Failed to warm cache" }, { status: 500 })
  }
}
```

**Step 5: Run lint and typecheck**

Run: `pnpm lint && pnpm typecheck`

**Step 6: Commit**

```bash
git add app/api/cards/route.ts
git commit -m "feat(api): add server-side cache with parallel fetching"
```

---

### Task 2: Add Client-Side Pre-Fetch to Deck Page

**Files:**
- Modify: `app/deck/[id]/page.tsx`

**Step 1: Add pre-fetch state and ref**

Add to the DeckDetailPage component:
```typescript
const cardCacheRef = useRef<CardSearchResult[]>([])
const [cacheReady, setCacheReady] = useState(false)
```

**Step 2: Add pre-fetch useEffect**

Add after the existing useEffect:
```typescript
useEffect(() => {
  async function preFetchCards() {
    try {
      const res = await fetch("/api/cards?q=")
      const data = await res.json()
      cardCacheRef.current = data
      setCacheReady(true)
    } catch (error) {
      console.error("Pre-fetch failed:", error)
    }
  }
  preFetchCards()
}, [])
```

**Step 3: Update handleSearch to use cache**

Replace the handleSearch function:
```typescript
async function handleSearch() {
  if (!searchQuery.trim()) return

  setSearching(true)
  try {
    if (cacheReady && cardCacheRef.current.length > 0) {
      const query = searchQuery.toLowerCase()
      const filtered = cardCacheRef.current.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.number?.toLowerCase().includes(query)
      )
      setSearchResults(filtered.slice(0, 20))
    } else {
      const params = new URLSearchParams()
      params.set("q", searchQuery)
      const res = await fetch(`/api/cards?${params}`)
      const data = await res.json()
      setSearchResults(data)
    }
  } catch (error) {
    console.error("Search failed:", error)
  } finally {
    setSearching(false)
  }
}
```

**Step 4: Run lint and typecheck**

Run: `pnpm lint && pnpm typecheck`

**Step 5: Commit**

```bash
git add app/deck/[id]/page.tsx
git commit -m "feat(deck): add client-side pre-fetch for instant search"
```

---

### Task 3: Final Verification

**Step 1: Run full test**

1. Run `pnpm dev`
2. Open deck builder page
3. Wait 2-3 seconds for pre-fetch
4. Search "Charizard" — should be instant (<100ms)
5. Search "Crispin" — should be instant

**Step 2: Verify no console errors**

**Step 3: Final commit if changes made**

```bash
git add -A && git commit -m "fix: resolve any final issues"
```

---

**Plan complete.** Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**