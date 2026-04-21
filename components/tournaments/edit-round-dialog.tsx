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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { deleteRound, updateRound } from "@/lib/db"
import type { Round } from "@/lib/types"
import { cn } from "@/lib/utils"

interface EditRoundDialogProps {
  round: Round
  onRoundUpdated?: () => void
  children: React.ReactNode
  className?: string
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
  const [result, setResult] = useState<"win" | "loss" | "tie" | "bye" | "no_show">(round.result)
  const [wentFirst, setWentFirst] = useState<boolean | null>(round.went_first)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pokemon1 === null || pokemon2 === null) return

    setIsSubmitting(true)
    try {
      await updateRound(round.id, {
        opponent_pokemon_1: pokemon1,
        opponent_pokemon_2: pokemon2,
        result,
        went_first: wentFirst,
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
      setResult(round.result)
      setWentFirst(round.went_first)
      setShowDeleteConfirm(false)
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild className={cn("", className)}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {showDeleteConfirm ? (
          <>
            <DialogHeader>
              <DialogTitle>Delete Round {round.round_number}?</DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
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
              <div className="grid gap-2">
                <Label>Result *</Label>
                <RadioGroup
                  value={result}
                  onValueChange={(value) => setResult(value as "win" | "loss" | "tie" | "bye" | "no_show")}
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
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tie" id="tie" />
                    <Label htmlFor="tie">Tie</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bye" id="bye" />
                    <Label htmlFor="bye">Bye</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no_show" id="no_show" />
                    <Label htmlFor="no_show">No Show</Label>
                  </div>
                </RadioGroup>
              </div>
              {result === "win" || result === "loss" || result === "tie" ? (
                <div className="grid gap-2">
                  <Label>You went *</Label>
                  <RadioGroup
                    value={wentFirst === true ? "first" : wentFirst === false ? "second" : ""}
                    onValueChange={(value) => setWentFirst(value === "first")}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="first" id="first" />
                      <Label htmlFor="first">First</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="second" id="second" />
                      <Label htmlFor="second">Second</Label>
                    </div>
                  </RadioGroup>
                </div>
              ) : null}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="mr-auto text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pokemon1 === null || pokemon2 === null || isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
