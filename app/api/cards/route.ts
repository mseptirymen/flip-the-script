import { NextResponse } from "next/server"

interface TCGProduct {
  id: number
  name: string
  number: string
  image_url: string
  rarity: string
  set_abbreviation?: string
  set_name?: string
  cardtrader?: {
    product_type?: string
  }
}

interface TCGSet {
  id: number
  name: string
  abbreviation?: string
}

interface CacheEntry {
  products: TCGProduct[]
  timestamp: number
}

const setCache = new Map<string, CacheEntry>()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

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

function isCardProduct(product: TCGProduct): boolean {
  return Boolean(product.number)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || ""

  if (!q) {
    return NextResponse.json([])
  }

  try {
    const setsRes = await fetch("https://tcgtracking.com/tcgapi/v1/3/sets")
    const setsData = await setsRes.json()
    const sets: TCGSet[] = setsData.sets || []

    const pokemonSets = sets.filter((s) => {
      const name = s.name.toLowerCase()
      const abbr = s.abbreviation?.toLowerCase() || ""
      const excludeTerms = ["magic", "yu-gi-oh", "mtg", "yugioh", "force", "weiss", "digimon", "onepiece", "dragonball", "world championship", "prize", "jumbo"]
      const isExcluded = excludeTerms.some((term) => name.includes(term))
      return !isExcluded
    })

    const allProducts: TCGProduct[] = []

    const results = await Promise.all(
      pokemonSets.map(async (set) => {
        try {
          return await fetchSetWithCache(String(set.id))
        } catch {
          return []
        }
      })
    )

    for (const cards of results) {
      allProducts.push(...cards)
    }

    const query = q.toLowerCase()
    const filtered = allProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(query) ||
        p.set_abbreviation?.toLowerCase().includes(query) ||
        p.set_name?.toLowerCase().includes(query) ||
        p.number?.toLowerCase().includes(query)
    )

    const mapped = filtered.slice(0, 20).map((p) => ({
      product_id: p.id,
      name: p.name,
      number: p.number,
      image_url: p.image_url,
      rarity: p.rarity,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("TCG Tracking API error:", error)
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 })
  }
}

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

    await Promise.all(pokemonSets.map((set) => fetchSetWithCache(String(set.id))))

    return NextResponse.json({ cached: setCache.size })
  } catch (error) {
    console.error("Cache warm error:", error)
    return NextResponse.json({ error: "Failed to warm cache" }, { status: 500 })
  }
}