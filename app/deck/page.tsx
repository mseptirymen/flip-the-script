"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusIcon, LayersIcon } from "lucide-react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PokemonSpriteSelect } from "@/components/tournaments/pokemon-sprite-select"
import { getAllDecks, addDeck, deleteDeck, Deck } from "@/lib/db"

export default function DeckPage() {
  const router = useRouter()
  const [decks, setDecks] = useState<Deck[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deckName, setDeckName] = useState("")
  const [spriteId1, setSpriteId1] = useState<number | null>(null)
  const [spriteId2, setSpriteId2] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDecks()
  }, [])

  async function loadDecks() {
    try {
      const data = await getAllDecks()
      setDecks(data)
    } catch (error) {
      console.error("Failed to load decks:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddDeck() {
    if (!deckName.trim()) return
    try {
      await addDeck({
        name: deckName.trim(),
        sprite_id_1: spriteId1 ?? 6,
        sprite_id_2: spriteId2 ?? 9,
      })
      setDeckName("")
      setSpriteId1(null)
      setSpriteId2(null)
      setDialogOpen(false)
      loadDecks()
    } catch (error) {
      console.error("Failed to add deck:", error)
    }
  }

  async function handleDeleteDeck(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    try {
      await deleteDeck(id)
      setDecks(decks.filter((d) => d.id !== id))
    } catch (error) {
      console.error("Failed to delete deck:", error)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="self-auto mr-2 h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/deck">Deck Builder</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-medium">Deck Builder</h1>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Deck
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Deck</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="deck-name">Deck Name</Label>
                    <Input
                      id="deck-name"
                      value={deckName}
                      onChange={(e) => setDeckName(e.target.value)}
                      placeholder="My Awesome Deck"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Deck Icon</Label>
                    <div className="flex gap-2">
                      <PokemonSpriteSelect
                        value={spriteId1}
                        onChange={setSpriteId1}
                        placeholder="Select first Pokemon"
                        className="flex-1"
                      />
                      <PokemonSpriteSelect
                        value={spriteId2}
                        onChange={setSpriteId2}
                        placeholder="Select second Pokemon"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddDeck}
                    disabled={!deckName.trim()}
                  >
                    Create Deck
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex max-h-[400px] flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : decks.length === 0 ? (
            <div className="flex max-h-[400px] flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8">
              <LayersIcon className="h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                No decks yet. Create your first deck to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {decks.map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => router.push(`/deck/${deck.id}`)}
                  className="flex flex-col items-center gap-2 rounded-lg border p-4 text-left hover:bg-accent"
                >
                  <div className="flex gap-2">
                    <img
                      src={`/icons/${deck.sprite_id_1}.png`}
                      alt=""
                      className="h-16 w-16 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                    <img
                      src={`/icons/${deck.sprite_id_2}.png`}
                      alt=""
                      className="h-16 w-16 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                  <p className="text-center text-sm font-medium">{deck.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}