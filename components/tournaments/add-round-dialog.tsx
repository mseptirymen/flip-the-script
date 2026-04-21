"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
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

interface RoundEntry {
  pokemon1: number | null
  pokemon2: number | null
  result: 'win' | 'loss' | 'tie' | 'bye' | 'no_show' | null
  wentFirst: boolean | null
}

interface AddRoundDialogProps {
  tournamentId: string
  nextRoundNumber: number
  onRoundAdded?: () => void
  className?: string
}

export function AddRoundDialog({
  tournamentId,
  nextRoundNumber,
  onRoundAdded,
  className,
}: AddRoundDialogProps) {
  const [open, setOpen] = useState(false)
  const [rounds, setRounds] = useState<RoundEntry[]>([
    { pokemon1: null, pokemon2: null, result: null, wentFirst: null }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateRound(index: number, updates: Partial<RoundEntry>) {
    setRounds((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...updates }
      return next
    })
  }

  function addRoundEntry() {
    if (rounds.length < 3) {
      setRounds((prev) => [
        ...prev,
        { pokemon1: null, pokemon2: null, result: null, wentFirst: null }
      ])
    }
  }

  function canAddRound(index: number): boolean {
    return (
      rounds[index].result !== null &&
      rounds[index].pokemon1 !== null &&
      rounds[index].pokemon2 !== null &&
      rounds.length < 3
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const completeRounds = rounds.filter(
      (r) => r.pokemon1 !== null && r.pokemon2 !== null && r.result !== null
    )

    if (completeRounds.length === 0) return

    setIsSubmitting(true)
    try {
      for (let i = 0; i < completeRounds.length; i++) {
        const round = completeRounds[i]
        await addRound({
          tournament_id: tournamentId,
          round_number: nextRoundNumber + i,
          opponent_pokemon_1: round.pokemon1!,
          opponent_pokemon_2: round.pokemon2!,
          result: round.result!,
          went_first: round.wentFirst,
        })
      }

      setRounds([{ pokemon1: null, pokemon2: null, result: null, wentFirst: null }])
      setOpen(false)
      onRoundAdded?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      setRounds([{ pokemon1: null, pokemon2: null, result: null, wentFirst: null }])
    }
    setOpen(newOpen)
  }

  const resultOptions: { value: RoundEntry['result']; label: string }[] = [
    { value: 'win', label: 'W' },
    { value: 'loss', label: 'L' },
    { value: 'tie', label: 'T' },
    { value: 'bye', label: 'Bye' },
    { value: 'no_show', label: 'NS' },
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className={cn("", className)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Round
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Round {nextRoundNumber}</DialogTitle>
            <DialogDescription>
              Log your match result. Add more rounds if needed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {rounds.map((round, index) => (
              <div key={index} className="grid gap-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Round {nextRoundNumber + index}</span>
                </div>

                <div className="grid gap-2">
                  <Label>Opponent's Pokemon *</Label>
                  <div className="flex flex-row gap-4">
                    <div className="flex-1">
                      <PokemonCombobox
                        value={round.pokemon1}
                        onChange={(id) => updateRound(index, { pokemon1: id })}
                      />
                    </div>
                    <div className="flex-1">
                      <PokemonCombobox
                        value={round.pokemon2}
                        onChange={(id) => updateRound(index, { pokemon2: id })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Result *</Label>
                  <div className="flex flex-row gap-2 flex-wrap">
                    {resultOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "min-w-[3rem]",
                          round.result === option.value && "bg-primary/20"
                        )}
                        onClick={() => {
                          updateRound(index, { result: option.value })
                          if (option.value === 'bye' || option.value === 'no_show') {
                            updateRound(index, { wentFirst: null })
                          }
                        }}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {round.result !== null && round.result !== 'bye' && round.result !== 'no_show' && (
                  <div className="grid gap-2">
                    <Label>You went *</Label>
                    <div className="flex flex-row gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "min-w-[4rem]",
                          round.wentFirst === true && "bg-primary/20"
                        )}
                        onClick={() => updateRound(index, { wentFirst: true })}
                      >
                        First
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "min-w-[4rem]",
                          round.wentFirst === false && "bg-primary/20"
                        )}
                        onClick={() => updateRound(index, { wentFirst: false })}
                      >
                        Second
                      </Button>
                    </div>
                  </div>
                )}

                {index === rounds.length - 1 && canAddRound(index) && rounds.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRoundEntry}
                    className="mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Round {nextRoundNumber + index + 1}
                  </Button>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                rounds[0].pokemon1 === null ||
                rounds[0].pokemon2 === null ||
                rounds[0].result === null ||
                (rounds[0].result !== 'bye' && rounds[0].result !== 'no_show' && rounds[0].wentFirst === null) ||
                isSubmitting
              }
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
