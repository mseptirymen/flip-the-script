import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  try {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=2000`
    const res = await fetch(url, {
      headers: {
        "User-Agent": "FlipTheScript/1.0",
      },
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch" }, { status: res.status })
    }

    const data = await res.json()
    const allResults = data.results || []
    const filtered = allResults.filter((p: { name: string }) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    )
    const results = filtered.slice(0, 10).map((p: { url: string; name: string }) => {
      const parts = p.url.split("/").filter(Boolean)
      const id = parseInt(parts[parts.length - 1] || "0")
      return { id, name: p.name }
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Pokemon search error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}