"use client"

import { useState } from "react"
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
import { addRound } from "@/lib/db"
import { cn } from "@/lib/utils"

type GameResult = 'win' | 'loss' | 'tie'
type RoundResult = 'bye' | 'no_show'

interface GameEntry {
  result: GameResult | null
  wentFirst: boolean | null
}

interface AddRoundDialogProps {
  tournamentId: string
  nextRoundNumber: number
  onRoundAdded?: () => void
  className?: string
}

function calculateRoundResult(games: GameEntry[]): GameResult | null {
  const completedGames = games.filter((g) => g.result !== null)
  if (completedGames.length === 0) return null

  const wins = completedGames.filter((g) => g.result === 'win').length
  const losses = completedGames.filter((g) => g.result === 'loss').length

  if (wins > losses) return 'win'
  if (losses > wins) return 'loss'
  if (wins === losses && wins > 0) return 'tie'
  return null
}

export function AddRoundDialog({
  tournamentId,
  nextRoundNumber,
  onRoundAdded,
  className,
}: AddRoundDialogProps) {
  const [open, setOpen] = useState(false)
  const [pokemon1, setPokemon1] = useState<number | null>(null)
  const [pokemon2, setPokemon2] = useState<number | null>(null)
  const [isByeOrNoShow, setIsByeOrNoShow] = useState(false)
  const [byeNoShowType, setByeNoShowType] = useState<RoundResult | null>(null)
  const [games, setGames] = useState<GameEntry[]>([
    { result: null, wentFirst: null },
    { result: null, wentFirst: null },
    { result: null, wentFirst: null }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateGame(index: number, updates: Partial<GameEntry>) {
    setGames((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...updates }
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (isByeOrNoShow && byeNoShowType) {
      setIsSubmitting(true)
      try {
        await addRound({
          tournament_id: tournamentId,
          round_number: nextRoundNumber,
          opponent_pokemon_1: 0,
          opponent_pokemon_2: 0,
          games: [{ result: byeNoShowType, went_first: null }],
        })

        resetForm()
        setOpen(false)
        onRoundAdded?.()
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (pokemon1 === null || pokemon2 === null) return

    const roundResult = calculateRoundResult(games)
    if (!roundResult) return

    const completeGames: { result: GameResult | RoundResult; went_first: boolean }[] = games
      .filter((g) => g.result !== null)
      .map((g) => ({
        result: g.result as GameResult,
        went_first: g.wentFirst ?? false
      }))

    if (completeGames.length === 0) return

    setIsSubmitting(true)
    try {
      await addRound({
        tournament_id: tournamentId,
        round_number: nextRoundNumber,
        opponent_pokemon_1: pokemon1,
        opponent_pokemon_2: pokemon2,
        games: completeGames,
      })

      resetForm()
      setOpen(false)
      onRoundAdded?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setPokemon1(null)
    setPokemon2(null)
    setIsByeOrNoShow(false)
    setByeNoShowType(null)
    setGames([
      { result: null, wentFirst: null },
      { result: null, wentFirst: null },
      { result: null, wentFirst: null }
    ])
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      resetForm()
    }
    setOpen(newOpen)
  }

  const gameResultOptions: { value: GameResult; label: string }[] = [
    { value: 'win', label: 'W' },
    { value: 'loss', label: 'L' },
    { value: 'tie', label: 'T' },
  ]

  const isValid = isByeOrNoShow
    ? byeNoShowType !== null
    : pokemon1 !== null && pokemon2 !== null && games[0].result !== null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className={cn("", className)}>
          Add Round
        </Button>
      </DialogTrigger>
    <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Round {nextRoundNumber}</DialogTitle>
            <DialogDescription>
              Log your match result.
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
                    !isByeOrNoShow && "bg-primary/20"
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
                    isByeOrNoShow && byeNoShowType === 'bye' && "bg-primary/20"
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
                    isByeOrNoShow && byeNoShowType === 'no_show' && "bg-primary/20"
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

                          <div className="flex items-center gap-1">
                            {gameResultOptions.map((option) => (
                              <Button
                                key={option.value}
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "w-10 h-8",
                                  game.result === option.value && "bg-primary/20"
                                )}
                                onClick={() => updateGame(index, { result: game.result === option.value ? null : option.value })}
                              >
                                {option.label}
                              </Button>
                            ))}
                          </div>

                          {game.result !== null ? (
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "w-10 h-8",
                                  game.wentFirst === true && "bg-primary/20"
                                )}
                                onClick={() => updateGame(index, { wentFirst: game.wentFirst === true ? null : true })}
                              >
                                1st
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "w-10 h-8",
                                  game.wentFirst === false && "bg-primary/20"
                                )}
                                onClick={() => updateGame(index, { wentFirst: game.wentFirst === false ? null : false })}
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
