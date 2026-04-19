# Tournament Logging Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow Pokémon TCG players to log tournaments and rounds they participated in, storing data in IndexedDB locally.

**Architecture:** IndexedDB as primary storage. React state for UI. Dialogs for forms. UUID generation for IDs.

**Tech Stack:** Next.js App Router, shadcn/ui (dialog, button, input, label, radio-group), idb library for IndexedDB, lucide-react for icons.

---

## Task 1: Set Up IndexedDB Storage Layer

**Files:**
- Create: `lib/db.ts`

**Step 1: Write the IndexedDB setup**

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface TournamentDBSchema extends DBSchema {
  tournaments: {
    key: string;
    value: Tournament;
    indexes: { 'by-date': string };
  };
}

export interface Round {
  id: string;
  roundNumber: number;
  opponentDeckArchetype: string;
  result: 'win' | 'loss';
}

export interface Tournament {
  id: string;
  name: string;
  date: string | null;
  rounds: Round[];
  createdAt: number;
}

const DB_NAME = 'flip-the-script';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<TournamentDBSchema>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<TournamentDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('tournaments', { keyPath: 'id' });
        store.createIndex('by-date', 'date');
      },
    });
  }
  return dbPromise;
}

export async function getAllTournaments(): Promise<Tournament[]> {
  const db = await getDB();
  return db.getAll('tournaments');
}

export async function getTournament(id: string): Promise<Tournament | undefined> {
  const db = await getDB();
  return db.get('tournaments', id);
}

export async function addTournament(tournament: Tournament): Promise<string> {
  const db = await getDB();
  await db.add('tournaments', tournament);
  return tournament.id;
}

export async function updateTournament(tournament: Tournament): Promise<void> {
  const db = await getDB();
  await db.put('tournaments', tournament);
}

export async function deleteTournament(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tournaments', id);
}
```

**Step 2: Commit**

```bash
git add lib/db.ts
git commit -m "feat(storage): add IndexedDB layer for tournament storage"
```

---

## Task 2: Create Add Tournament Dialog

**Files:**
- Create: `components/tournaments/add-tournament-dialog.tsx`

**Step 1: Write the Add Tournament Dialog component**

```tsx
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
      const tournament = {
        id: crypto.randomUUID(),
        name: name.trim(),
        date: date || null,
        rounds: [],
        createdAt: Date.now(),
      }
      await addTournament(tournament)
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
```

**Step 2: Commit**

```bash
git add components/tournaments/add-tournament-dialog.tsx
git commit -m "feat(tournaments): add AddTournamentDialog component"
```

---

## Task 3: Create Tournament List Page

**Files:**
- Modify: `app/tournaments/page.tsx`

**Step 1: Update tournaments page to show list**

```tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AddTournamentDialog } from "@/components/tournaments/add-tournament-dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrophyIcon } from "lucide-react"
import { getAllTournaments, Tournament } from "@/lib/db"

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTournaments()
  }, [])

  async function loadTournaments() {
    const data = await getAllTournaments()
    setTournaments(data)
    setIsLoading(false)
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
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/tournaments">Tournaments</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-medium">My Tournaments</h1>
            <AddTournamentDialog onTournamentAdded={loadTournaments} />
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : tournaments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center">
                  <TrophyIcon className="mb-2 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No tournaments yet. Click "Add Tournament" to log your first one.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tournaments.map((tournament) => (
                <Link key={tournament.id} href={`/tournaments/${tournament.id}`}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{tournament.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {tournament.date && <span>{tournament.date}</span>}
                        <span>{tournament.rounds.length} rounds</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

**Step 2: Run lint and typecheck**

```bash
pnpm lint && pnpm typecheck
```

**Step 3: Commit**

```bash
git add app/tournaments/page.tsx
git commit -m "feat(tournaments): add tournament list page with add functionality"
```

---

## Task 4: Create Tournament Detail Page

**Files:**
- Create: `app/tournaments/[id]/page.tsx`
- Create: `components/tournaments/tournament-rounds.tsx`

**Step 1: Write TournamentRounds component**

```tsx
"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddRoundDialog } from "@/components/tournaments/add-round-dialog"
import { getTournament, updateTournament, Tournament, Round } from "@/lib/db"

interface TournamentRoundsProps {
  tournamentId: string
}

export function TournamentRounds({ tournamentId }: TournamentRoundsProps) {
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTournament()
  }, [tournamentId])

  async function loadTournament() {
    const data = await getTournament(tournamentId)
    setTournament(data || null)
    setIsLoading(false)
  }

  async function handleRoundAdded() {
    await loadTournament()
  }

  async function handleDeleteRound(roundId: string) {
    if (!tournament) return
    const updatedRounds = tournament.rounds.filter((r) => r.id !== roundId)
    await updateTournament({ ...tournament, rounds: updatedRounds })
    await loadTournament()
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>
  }

  if (!tournament) {
    return <p className="text-sm text-muted-foreground">Tournament not found.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Rounds</h2>
        <AddRoundDialog
          nextRoundNumber={tournament.rounds.length + 1}
          onRoundAdded={handleRoundAdded}
        />
      </div>

      {tournament.rounds.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">
                No rounds recorded yet. Click "Add Round" to log your first round.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {tournament.rounds
            .sort((a, b) => a.roundNumber - b.roundNumber)
            .map((round) => (
              <Card key={round.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        Round {round.roundNumber}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        vs {round.opponentDeckArchetype}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={round.result === "win" ? "default" : "destructive"}>
                        {round.result === "win" ? "W" : "L"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRound(round.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Write Tournament Detail page**

```tsx
import { notFound } from "next/navigation"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { TournamentRounds } from "@/components/tournaments/tournament-rounds"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { getTournament } from "@/lib/db"

interface TournamentDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TournamentDetailPage({ params }: TournamentDetailPageProps) {
  const { id } = await params
  const tournament = await getTournament(id)

  if (!tournament) {
    notFound()
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
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/tournaments">Tournaments</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{tournament.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div>
            <h1 className="text-2xl font-bold">{tournament.name}</h1>
            {tournament.date && (
              <p className="text-sm text-muted-foreground mt-1">{tournament.date}</p>
            )}
          </div>
          <TournamentRounds tournamentId={id} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

**Step 3: Run lint and typecheck**

```bash
pnpm lint && pnpm typecheck
```

**Step 4: Commit**

```bash
git add app/tournaments/[id]/page.tsx components/tournaments/tournament-rounds.tsx
git commit -m "feat(tournaments): add tournament detail page with rounds"
```

---

## Task 5: Create Add Round Dialog

**Files:**
- Create: `components/tournaments/add-round-dialog.tsx`

**Step 1: Write the Add Round Dialog component**

```tsx
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
```

**Step 2: Commit**

```bash
git add components/tournaments/add-round-dialog.tsx
git commit -m "feat(tournaments): add AddRoundDialog component"
```

---

## Task 6: Final Verification

**Step 1: Run lint and typecheck**

```bash
pnpm lint && pnpm typecheck
```

**Step 2: Test the flow**
1. Navigate to `/tournaments`
2. Click "Add Tournament", fill in name and optional date, submit
3. Click on the tournament card to open detail page
4. Click "Add Round", fill in archetype and select result, submit
5. Verify round appears with correct badge
6. Verify delete works

**Step 3: Commit final**

```bash
git add . && git commit -m "feat(tournaments): complete tournament logging feature"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Set up IndexedDB storage layer in `lib/db.ts` |
| 2 | Create AddTournamentDialog component |
| 3 | Update tournaments list page |
| 4 | Create tournament detail page with rounds display |
| 5 | Create AddRoundDialog component |
| 6 | Final verification and commit |