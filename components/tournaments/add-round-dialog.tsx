"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { getTournament, updateTournament, Round } from "@/lib/db"
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
  const [opponentArchetype, setOpponentArchetype] = useState("")
  const [result, setResult] = useState<"win" | "loss">("win")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!opponentArchetype.trim()) return

    setIsSubmitting(true)
    try {
      const tournament = await getTournament(tournamentId)
      if (!tournament) return

      const newRound: Round = {
        id: crypto.randomUUID(),
        roundNumber: nextRoundNumber,
        opponentDeckArchetype: opponentArchetype.trim(),
        result,
      }

      await updateTournament({
        ...tournament,
        rounds: [...tournament.rounds, newRound],
      })

      setOpponentArchetype("")
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
            <div className="grid gap-2">
              <Label htmlFor="archetype">Opponent Deck Archetype *</Label>
              <Input
                id="archetype"
                value={opponentArchetype}
                onChange={(e) => setOpponentArchetype(e.target.value)}
                placeholder="Charizard ex"
                required
              />
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
            <Button type="submit" disabled={!opponentArchetype.trim() || isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Round"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
