"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SearchCardItem, DeckCardItem, type CardSearchResult } from "@/components/deck-card-item"
import {
  getDeck,
  updateDeck,
  getDeckCards,
  addDeckCard,
  deleteDeckCard,
  Deck,
  DeckCard,
} from "@/lib/db"

export default function DeckDetailPage() {
  const router = useRouter()
  const params = useParams()
  const deckId = params.id as string

  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deckCards, setDeckCards] = useState<DeckCard[]>([])
  const [searchResults, setSearchResults] = useState<CardSearchResult[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const cardCacheRef = useRef<CardSearchResult[]>([])
  const [cacheReady, setCacheReady] = useState(false)

  useEffect(() => {
    loadDeck()
    loadDeckCards()
  }, [deckId])

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

  async function loadDeck() {
    try {
      const data = await getDeck(deckId)
      if (data) {
        setDeck(data)
      }
    } catch (error) {
      console.error("Failed to load deck:", error)
    } finally {
      setLoading(false)
    }
  }

  async function loadDeckCards() {
    try {
      const cards = await getDeckCards(deckId)
      setDeckCards(cards)
    } catch (error) {
      console.error("Failed to load deck cards:", error)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateDeck(deckId, {})
      router.push("/deck")
    } catch (error) {
      console.error("Failed to update deck:", error)
    } finally {
      setSaving(false)
    }
  }

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

  async function handleAddCard(card: CardSearchResult) {
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

  async function handleRemoveCard(cardId: string) {
    try {
      await deleteDeckCard(cardId)
      loadDeckCards()
    } catch (error) {
      console.error("Failed to remove card:", error)
    }
  }

  

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="self-auto mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/deck">Deck Builder</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={`/deck/${deckId}`}>
                    {deck?.name || "Edit Deck"}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading...</p>
            </div>
) : (
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-[60%] flex flex-col gap-4">
                <div className="flex items-end justify-between gap-2">
                  <h2 className="text-lg font-semibold">{deck?.name || "Deck Cards"}</h2>
                  <div className="flex items-end gap-2">
                    <Badge
                      variant={deckCards.length >= 60 ? "destructive" : "secondary"}
                    >
                      {deckCards.length}/60 cards
                    </Badge>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>

                {deckCards.length === 0 ? (
                  <Card className="flex items-center justify-center p-8 min-h-[200px]">
                    <p className="text-muted-foreground text-center">
                      No cards in deck yet.
                      <br />
                      Search and add cards from the right panel.
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {deckCards.map((card) => (
                      <DeckCardItem
                        key={card.id}
                        card={card}
                        onRemove={handleRemoveCard}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full lg:w-[40%]">
                <Card className="p-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold">Search Cards</h2>
                    <p className="text-sm text-muted-foreground">Search by name, set, or number</p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Charizard, SWSH, 123..."
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={searching}>
                      {searching ? "Searching..." : "Search"}
                    </Button>
                  </div>
                  {searchResults.length === 0 ? (
                    <div className="flex items-center justify-center p-8 min-h-[150px]">
                      <p className="text-muted-foreground text-center text-sm">
                        Search for cards to add to your deck.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col max-h-150 overflow-y-auto">
                      <div className="grid grid-cols-3 gap-2 p-2">
                        {searchResults.map((card) => (
                          <SearchCardItem
                            key={card.product_id}
                            card={card}
                            onAdd={handleAddCard}
                            disabled={deckCards.length >= 60}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
