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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { addRound } from "@/lib/db"
import type { Round } from "@/lib/types"
import { cn } from "@/lib/utils"

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
  const [pokemon1, setPokemon1] = useState<number | null>(null)
  const [pokemon2, setPokemon2] = useState<number | null>(null)
  const [result, setResult] = useState<"win" | "loss">("win")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pokemon1 === null || pokemon2 === null) return

    setIsSubmitting(true)
    try {
      await addRound({
        tournament_id: tournamentId,
        round_number: nextRoundNumber,
        opponent_pokemon_1: pokemon1,
        opponent_pokemon_2: pokemon2,
        result,
      })

      setPokemon1(null)
      setPokemon2(null)
      setResult("win")
      setOpen(false)
      onRoundAdded?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn("", className)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Round
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Round {nextRoundNumber}</DialogTitle>
            <DialogDescription>
              Log your round {nextRoundNumber} result.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-row gap-4">
              <div className="grid gap-2 flex-1">
                <Label htmlFor="pokemon1">Opponent Pokemon 1 *</Label>
                <PokemonCombobox
                  value={pokemon1}
                  onChange={setPokemon1}
                />
              </div>
              <div className="grid gap-2 flex-1">
                <Label htmlFor="pokemon2">Opponent Pokemon 2 *</Label>
                <PokemonCombobox
                  value={pokemon2}
                  onChange={setPokemon2}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Result *</Label>
              <RadioGroup
                value={result}
                onValueChange={(value) => setResult(value as "win" | "loss")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="win" id="win" />
                  <Label htmlFor="win">Win</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="loss" id="loss" />
                  <Label htmlFor="loss">Loss</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pokemon1 === null || pokemon2 === null || isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Round"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
