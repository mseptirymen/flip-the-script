import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch("https://tcgtracking.com/tcgapi/v1/3/sets/24380")
    const data = await res.json()
    const venusaurCards = (data.products || []).filter((p: { name?: string; rarity?: string }) =>
      p.name?.toLowerCase().includes("venusaur") && p.rarity === "Double Rare"
    )
    return NextResponse.json(venusaurCards)
  } catch (error) {
    console.error("TCG Tracking API error:", error)
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 })
  }
}