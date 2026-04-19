"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { addTournament } from "@/lib/db"
import { cn } from "@/lib/utils"
import { DatePickerInput } from "@/components/ui/date-picker"

const TOURNAMENT_TYPES = [
  { value: "online", label: "Online" },
  { value: "locals", label: "Locals" },
  { value: "challenge", label: "Challenge" },
  { value: "cup", label: "Cup" },
  { value: "regionals", label: "Regionals" },
  { value: "internationals", label: "Internationals" },
  { value: "worlds", label: "Worlds" },
]

interface AddTournamentDialogProps {
  onTournamentAdded?: () => void
  className?: string
}

export function AddTournamentDialog({ onTournamentAdded, className }: AddTournamentDialogProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [date, setDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await addTournament({
        name: name.trim(),
        type: type || null,
        date: date || null,
      })
      setName("")
      setType("")
      setDate("")
      setOpen(false)
      onTournamentAdded?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  function renderTypeSelect() {
    if (isMobile) {
      return (
        <select
          id="type-mobile"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        >
          <option value="">Select tournament type</option>
          {TOURNAMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      )
    }

    return (
      <Select value={type} onValueChange={setType}>
        <SelectTrigger id="type">
          <SelectValue placeholder="Select tournament type" />
        </SelectTrigger>
        <SelectContent position="popper">
          {TOURNAMENT_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  function DrawerForm() {
    return (
      <form onSubmit={handleSubmit} className="grid gap-4 px-4">
        <div className="grid gap-2">
          <Label htmlFor="name-mobile">Tournament Name *</Label>
          <Input
            id="name-mobile"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Regional Championship"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="type-mobile">Type</Label>
          {renderTypeSelect()}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="date-mobile">Date</Label>
          <DatePickerInput
            id="date-mobile"
            value={date}
            onChange={setDate}
            placeholder="Select date"
          />
        </div>
        <DrawerFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim() || isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Tournament"}
          </Button>
        </DrawerFooter>
      </form>
    )
  }

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button className={cn("", className)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Tournament
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add Tournament</DrawerTitle>
            <DrawerDescription>
              Log a tournament you participated in.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerForm />
        </DrawerContent>
      </Drawer>
    )
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
                <Label htmlFor="type">Type</Label>
                {renderTypeSelect()}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <DatePickerInput
                  id="date"
                  value={date}
                  onChange={setDate}
                  placeholder="Select date"
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
