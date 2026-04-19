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
import { addTournament } from "@/lib/db"
import { cn } from "@/lib/utils"

interface AddTournamentDialogProps {
  onTournamentAdded?: () => void
  className?: string
}

export function AddTournamentDialog({ onTournamentAdded, className }: AddTournamentDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [date, setDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await addTournament({
        name: name.trim(),
        date: date || null,
      })
      setName("")
      setDate("")
      setOpen(false)
      onTournamentAdded?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn("", className)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Tournament
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Tournament</DialogTitle>
            <DialogDescription>
              Log a tournament you participated in.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tournament Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Regional Championship"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Tournament"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
