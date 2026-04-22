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
      const excludeTerms = ["magic", "yu-gi-oh", "mtg", "yugioh", "force", "weiss", "digimon", "onepiece", "dragonball", "world championship"]
      const isExcluded = excludeTerms.some((term) => name.includes(term))
      return !isExcluded
    })

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

    const query = q.toLowerCase()
    const filtered = allProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(query) ||
        p.set_abbreviation?.toLowerCase().includes(query) ||
        p.set_name?.toLowerCase().includes(query) ||
        p.number?.toLowerCase().includes(query)
    )

    const results = filtered.slice(0, 20).map((p) => ({
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