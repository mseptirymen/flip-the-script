# Card Search Optimization Design

**Date:** 2026-04-21

## Problem

Card search is slow because the API fetches sets sequentially. With 50+ Pokemon sets, each search takes 10+ seconds.

## Solution: Two-Tier Caching

### 1. Server-Side In-Memory Cache

**Structure:**
```typescript
interface CacheEntry {
  products: TCGProduct[]
  timestamp: number
}

const setCache = new Map<string, CacheEntry>()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes
```

**Flow:**
1. Check `setCache` for set ID
2. If found and not expired → return cached products
3. If missing/expired → fetch from TCG Tracking, store in cache

**Parallel Fetching:**
Replace sequential loop with `Promise.all`:
```typescript
const results = await Promise.all(
  pokemonSets.map(set => fetchSetWithCache(set.id))
)
```

### 2. Client-Side Pre-Fetch

**Implementation:**
- `useRef<TCGProduct[]>` to store full card dataset
- `useEffect` on page mount triggers silent pre-fetch
- Search function first checks ref data, falls back to API if not ready

**Flow:**
1. User opens deck page → background fetch populates ref
2. User searches → instant local filter from ref
3. If ref empty → API call (slower but functional)

### 3. API Route Update

- Remove `?q=` dependency — always returns all cards for caching
- Rename param to `setId` for specific set lookup if needed later
- Results mapped to card products only (filter during cache, not retrieval)

## Performance Target

| Scenario | Before | After |
|----------|--------|-------|
| First search | 10+ sec | 2-3 sec |
| Subsequent searches | 10+ sec | <100ms |
| Pre-fetch complete | N/A | 2-3 sec |

## Files to Modify

- `app/api/cards/route.ts` — Add server cache + parallel fetching
- `app/deck/[id]/page.tsx` — Add client-side pre-fetch with useRef

## Out of Scope

- Cache invalidation on product updates (TTL is sufficient)
- Redis/memory store (in-memory Map sufficient for this scale)