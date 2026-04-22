"use client"

import { useState, useEffect } from "react"
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
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  getDeck,
  updateDeck,
  getDeckCards,
  addDeckCard,
  deleteDeckCard,
  Deck,
  DeckCard,
} from "@/lib/db"

interface CardSearchResult {
  product_id: number
  name: string
  number: string
  image_url: string
  rarity: string
}

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
  const [setQuery, setSetQuery] = useState("")
  const [numberQuery, setNumberQuery] = useState("")
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    loadDeck()
    loadDeckCards()
  }, [deckId])

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

  async function handleAddCard(card: CardSearchResult) {
    if (deckCards.length >= 60) return

    try {
      await addDeckCard({
        deck_id: deckId,
        product_id: card.product_id,
        name: card.name,
        set_name: "",
        set_abbreviation: setQuery || "",
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

  const pokemonCards = deckCards.filter((c) => c.pokemon_type)
  const trainerCards = deckCards.filter(
    (c) => !c.pokemon_type && c.name.toLowerCase().includes("trainer")
  )
  const energyCards = deckCards.filter(
    (c) =>
      !c.pokemon_type &&
      !c.name.toLowerCase().includes("trainer") &&
      c.name.toLowerCase().includes("energy")
  )
  const otherCards = deckCards.filter(
    (c) =>
      !c.pokemon_type &&
      !c.name.toLowerCase().includes("trainer") &&
      !c.name.toLowerCase().includes("energy")
  )

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
            <>
              <h1>{deck?.name}</h1>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-[60%] flex flex-col gap-4">

                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Deck Cards</h2>
                  <Badge
                    variant={deckCards.length >= 60 ? "destructive" : "secondary"}
                  >
                    {deckCards.length}/60 cards
                  </Badge>
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
                  <div className="flex flex-col gap-4">
                    {pokemonCards.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Pokémon ({pokemonCards.length})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {pokemonCards.map((card) => (
                            <DeckCardItem
                              key={card.id}
                              card={card}
                              onRemove={handleRemoveCard}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {trainerCards.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Trainers ({trainerCards.length})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {trainerCards.map((card) => (
                            <DeckCardItem
                              key={card.id}
                              card={card}
                              onRemove={handleRemoveCard}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {energyCards.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Energy ({energyCards.length})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {energyCards.map((card) => (
                            <DeckCardItem
                              key={card.id}
                              card={card}
                              onRemove={handleRemoveCard}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {otherCards.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Other ({otherCards.length})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {otherCards.map((card) => (
                            <DeckCardItem
                              key={card.id}
                              card={card}
                              onRemove={handleRemoveCard}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-auto">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/deck")}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>

              <div className="w-full lg:w-[40%] flex flex-col gap-4">
                <Card className="p-4 flex flex-col gap-4">
                  <h2 className="text-lg font-semibold">Search Cards</h2>
                  <div className="grid gap-2">
                    <Label htmlFor="search-name">Name</Label>
                    <Input
                      id="search-name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Card name..."
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <Label htmlFor="search-set">Set</Label>
                      <Input
                        id="search-set"
                        value={setQuery}
                        onChange={(e) => setSetQuery(e.target.value)}
                        placeholder="Set ID..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="search-number">Number</Label>
                      <Input
                        id="search-number"
                        value={numberQuery}
                        onChange={(e) => setNumberQuery(e.target.value)}
                        placeholder="Card #..."
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSearch} disabled={searching}>
                    {searching ? "Searching..." : "Search"}
                  </Button>
                </Card>

                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Results
                  </h3>
                  {searchResults.length === 0 ? (
                    <Card className="flex items-center justify-center p-8 min-h-[150px]">
                      <p className="text-muted-foreground text-center text-sm">
                        Search for cards to add to your deck.
                      </p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
                      {searchResults.map((card) => (
                        <SearchCardItem
                          key={card.product_id}
                          card={card}
                          onAdd={handleAddCard}
                          disabled={deckCards.length >= 60}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

interface DeckCardItemProps {
  card: DeckCard
  onRemove: (id: string) => void
}

function DeckCardItem({ card, onRemove }: DeckCardItemProps) {
  return (
    <Card
      className="relative group cursor-pointer overflow-hidden"
      onClick={() => onRemove(card.id)}
    >
      {card.image_url && (
        <img
          src={card.image_url}
          alt={card.name}
          className="w-full aspect-[5/7] object-cover"
        />
      )}
      <div className="absolute top-1 right-1">
        {card.quantity > 1 && (
          <Badge className="bg-primary text-primary-foreground">
            {card.quantity}
          </Badge>
        )}
      </div>
      <div className="p-2">
        <p className="text-xs font-medium truncate">{card.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">
          {card.set_abbreviation} #{card.collector_number}
        </p>
      </div>
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <p className="text-xs text-white">Click to remove</p>
      </div>
    </Card>
  )
}

interface SearchCardItemProps {
  card: CardSearchResult
  onAdd: (card: CardSearchResult) => void
  disabled?: boolean
}

function SearchCardItem({ card, onAdd, disabled }: SearchCardItemProps) {
  return (
    <Card
      className={cn(
        "relative group cursor-pointer overflow-hidden",
        disabled && "opacity-50 pointer-events-none"
      )}
      onClick={() => onAdd(card)}
    >
      {card.image_url && (
        <img
          src={card.image_url}
          alt={card.name}
          className="w-full aspect-[5/7] object-cover"
        />
      )}
      <div className="p-2">
        <p className="text-xs font-medium truncate">{card.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">
          #{card.number}
        </p>
      </div>
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <p className="text-xs text-white">Click to add</p>
      </div>
    </Card>
  )
}
