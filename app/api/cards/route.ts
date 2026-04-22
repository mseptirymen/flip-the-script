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

function isCardProduct(product: TCGProduct): boolean {
  return Boolean(product.number)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const setId = searchParams.get("set") || "24380"
  const q = searchParams.get("q") || ""

  try {
    const res = await fetch(`https://tcgtracking.com/tcgapi/v1/3/sets/${setId}`)
    const data = await res.json()
    let products: TCGProduct[] = data.products || []

    products = products.filter(isCardProduct)

    if (q) {
      const query = q.toLowerCase()
      products = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.set_abbreviation?.toLowerCase().includes(query) ||
          p.set_name?.toLowerCase().includes(query) ||
          p.number?.toLowerCase().includes(query)
      )
    }

    const results = products.slice(0, 20).map((p) => ({
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