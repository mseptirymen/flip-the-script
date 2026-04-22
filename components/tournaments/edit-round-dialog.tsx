"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PokemonCombobox } from "./pokemon-combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { deleteRound, updateRound } from "@/lib/db"
import type { Game } from "@/lib/types"
import { cn } from "@/lib/utils"

type GameResult = 'win' | 'loss' | 'tie'
type ByeNoShowResult = 'bye' | 'no_show'

interface EditRoundDialogProps {
  round: Round
  onRoundUpdated?: () => void
  children: React.ReactNode
  className?: string
}

interface Round {
  id: string
  tournament_id: string
  round_number: number
  opponent_pokemon_1: number
  opponent_pokemon_2: number
  games: Game[]
  created_at: string
}

interface GameEntry {
  result: GameResult | null
  went_first: boolean | null
}

function calculateRoundResult(games: GameEntry[]): GameResult | null {
  if (games.length === 0) return null

  const wins = games.filter((g) => g.result === 'win').length
  const losses = games.filter((g) => g.result === 'loss').length

  if (wins > losses) return 'win'
  if (losses > wins) return 'loss'
  if (wins === losses && wins > 0) return 'tie'
  return null
}

function isByeNoShowRound(games: Game[]): boolean {
  return games.length === 1 && (games[0].result === 'bye' || games[0].result === 'no_show')
}

function getByeNoShowType(games: Game[]): ByeNoShowResult | null {
  if (games.length === 1 && (games[0].result === 'bye' || games[0].result === 'no_show')) {
    return games[0].result as ByeNoShowResult
  }
  return null
}

export function EditRoundDialog({
  round,
  onRoundUpdated,
  children,
  className,
}: EditRoundDialogProps) {
  const [open, setOpen] = useState(false)
  const [pokemon1, setPokemon1] = useState<number | null>(round.opponent_pokemon_1)
  const [pokemon2, setPokemon2] = useState<number | null>(round.opponent_pokemon_2)
  const [isByeOrNoShow, setIsByeOrNoShow] = useState(() => isByeNoShowRound(round.games || []))
  const [byeNoShowType, setByeNoShowType] = useState<ByeNoShowResult | null>(() => getByeNoShowType(round.games || []))
  const [games, setGames] = useState<GameEntry[]>(() => {
    const existing: GameEntry[] = (round.games || []).map(g => ({
      result: g.result as GameResult | null,
      went_first: g.went_first
    }))
    while (existing.length < 3) {
      existing.push({ result: null, went_first: null })
    }
    return existing
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (isByeOrNoShow && byeNoShowType) {
      setIsSubmitting(true)
      try {
        await updateRound(round.id, {
          opponent_pokemon_1: 0,
          opponent_pokemon_2: 0,
          games: [{ result: byeNoShowType, went_first: null }],
        })

        setOpen(false)
        setShowDeleteConfirm(false)
        onRoundUpdated?.()
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (pokemon1 === null || pokemon2 === null) return

    const gamesToSave = games
      .filter((g) => g.result !== null)
      .map((g) => ({
        result: g.result as GameResult,
        went_first: g.went_first
      }))

    setIsSubmitting(true)
    try {
      await updateRound(round.id, {
        opponent_pokemon_1: pokemon1,
        opponent_pokemon_2: pokemon2,
        games: gamesToSave,
      })

      setOpen(false)
      setShowDeleteConfirm(false)
      onRoundUpdated?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    setIsSubmitting(true)
    try {
      await deleteRound(round.id)
      setOpen(false)
      setShowDeleteConfirm(false)
      onRoundUpdated?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleOpenChange(newOpen: boolean) {
    if (newOpen) {
      setPokemon1(round.opponent_pokemon_1)
      setPokemon2(round.opponent_pokemon_2)
      setIsByeOrNoShow(isByeNoShowRound(round.games || []))
      setByeNoShowType(getByeNoShowType(round.games || []))
      const existing: GameEntry[] = (round.games || []).map(g => ({
        result: g.result as GameResult | null,
        went_first: g.went_first
      }))
      while (existing.length < 3) {
        existing.push({ result: null, went_first: null })
      }
      setGames(existing)
      setShowDeleteConfirm(false)
    }
    setOpen(newOpen)
  }

  function updateGame(index: number, updates: Partial<GameEntry>) {
    setGames((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...updates }
      return next
    })
  }

  const gameResultOptions: { value: GameResult; label: string }[] = [
    { value: 'win', label: 'W' },
    { value: 'loss', label: 'L' },
    { value: 'tie', label: 'T' },
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild className={cn("", className)}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {showDeleteConfirm ? (
          <>
            <DialogHeader>
              <DialogTitle>Delete Round {round.round_number}?</DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-1 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Round {round.round_number}</DialogTitle>
              <DialogDescription>
                Update your round {round.round_number} result.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Match Type</Label>
                <div className="flex flex-row gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "min-w-[4rem]",
                      !isByeOrNoShow && "bg-input/50"
                    )}
                    onClick={() => {
                      setIsByeOrNoShow(false)
                      setByeNoShowType(null)
                    }}
                  >
                    Regular
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "min-w-[4rem]",
                      isByeOrNoShow && byeNoShowType === 'bye' && "bg-input/50"
                    )}
                    onClick={() => {
                      setIsByeOrNoShow(true)
                      setByeNoShowType('bye')
                    }}
                  >
                    Bye
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "min-w-[4rem]",
                      isByeOrNoShow && byeNoShowType === 'no_show' && "bg-input/50"
                    )}
                    onClick={() => {
                      setIsByeOrNoShow(true)
                      setByeNoShowType('no_show')
                    }}
                  >
                    No Show
                  </Button>
                </div>
              </div>

              {!isByeOrNoShow && (
                <>
                  <div className="grid gap-2">
                    <Label>Opponent's Pokemon *</Label>
                    <div className="flex flex-row gap-4">
                      <div className="flex-1">
                        <PokemonCombobox
                          value={pokemon1}
                          onChange={setPokemon1}
                        />
                      </div>
                      <div className="flex-1">
                        <PokemonCombobox
                          value={pokemon2}
                          onChange={setPokemon2}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-sm">Games</span>
                      {games[0].result && (
                        <span className="text-xs text-muted-foreground">
                          Round: {calculateRoundResult(games)?.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-row gap-4">
                      {games.map((game, index) => {
                        const isVisible = index === 0 || (index > 0 && games[index - 1].result !== null)
                        if (!isVisible) return null

                        return (
                          <div key={index} className="flex flex-col items-start gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Game {index + 1}</span>

                            <div className="flex flex-row gap-1">
                              {gameResultOptions.map((option) => (
                                <Button
                                  key={option.value}
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className={cn(
                                    "w-10 h-8",
                                    game.result === option.value && "bg-input/50"
                                  )}
                                  onClick={() => updateGame(index, { result: game.result === option.value ? null : option.value })}
                                >
                                  {option.label}
                                </Button>
                              ))}
                            </div>

                            {game.result !== null ? (
                              <div className="flex flex-row gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className={cn(
                                    "w-10 h-8",
                                    game.went_first === true && "bg-input/50"
                                  )}
                                  onClick={() => updateGame(index, { went_first: game.went_first === true ? null : true })}
                                >
                                  1st
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className={cn(
                                    "w-10 h-8",
                                    game.went_first === false && "bg-input/50"
                                  )}
                                  onClick={() => updateGame(index, { went_first: game.went_first === false ? null : false })}
                                >
                                  2nd
                                </Button>
                              </div>
                            ) : (
                              <div className="w-[72px]" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter className="gap-1 mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="mr-auto text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
