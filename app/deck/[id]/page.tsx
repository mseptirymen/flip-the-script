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
import { PokemonSpriteSelect } from "@/components/tournaments/pokemon-sprite-select"
import { getDeck, updateDeck, Deck } from "@/lib/db"

export default function DeckDetailPage() {
  const router = useRouter()
  const params = useParams()
  const deckId = params.id as string

  const [deck, setDeck] = useState<Deck | null>(null)
  const [deckName, setDeckName] = useState("")
  const [spriteId1, setSpriteId1] = useState<number | null>(null)
  const [spriteId2, setSpriteId2] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadDeck()
  }, [deckId])

  async function loadDeck() {
    try {
      const data = await getDeck(deckId)
      if (data) {
        setDeck(data)
        setDeckName(data.name)
        setSpriteId1(data.sprite_id_1)
        setSpriteId2(data.sprite_id_2)
      }
    } catch (error) {
      console.error("Failed to load deck:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!deckName.trim()) return
    setSaving(true)
    try {
      await updateDeck(deckId, {
        name: deckName.trim(),
        sprite_id_1: spriteId1 ?? deck?.sprite_id_1 ?? 6,
        sprite_id_2: spriteId2 ?? deck?.sprite_id_2 ?? 9,
      })
      router.push("/deck")
    } catch (error) {
      console.error("Failed to update deck:", error)
    } finally {
      setSaving(false)
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
            <div className="grid gap-6 max-w-lg">
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
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => router.push("/deck")}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!deckName.trim() || saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}