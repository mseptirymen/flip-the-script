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