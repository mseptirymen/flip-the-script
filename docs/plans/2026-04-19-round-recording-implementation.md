# Round Recording Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the opponent_deck_archetype text field with two Pokemon comboboxes that search PokeAPI and display sprites.

**Architecture:** A reusable PokemonCombobox component wraps the PokeAPI search with debouncing. The AddRoundDialog uses two instances for Pokemon 1 and 2. TournamentRounds displays sprites using the dex-to-filename convention.

**Tech Stack:** Next.js, React, Supabase, PokeAPI, Tailwind

---

## Task 1: Update Round type

**Files:**
- Modify: `lib/types.ts:10-16`

**Step 1: Update the Round interface**

Replace the interface with:

```typescript
export interface Round {
  id: string;
  tournament_id: string;
  round_number: number;
  opponent_pokemon_1: number;
  opponent_pokemon_2: number;
  result: 'win' | 'loss';
  created_at: string;
}
```

**Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "refactor: replace opponent_deck_archetype with pokemon fields"
```

---

## Task 2: Update database functions

**Files:**
- Modify: `lib/db.ts:69-80`

**Step 1: Update addRound to accept new fields**

The function signature stays the same since `Omit<Round, 'id' | 'created_at'>` will now exclude the new fields too.

**Step 2: Commit**

```bash
git add lib/db.ts
git commit -m "refactor: addRound accepts pokemon_1 and pokemon_2 fields"
```

---

## Task 3: Create PokemonCombobox component

**Files:**
- Create: `components/tournaments/pokemon-combobox.tsx`

**Step 1: Create the component**

```tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PokemonOption {
  id: number
  name: string
}

interface PokemonComboboxProps {
  value: number | null
  onChange: (id: number) => void
  className?: string
}

export function PokemonCombobox({ value, onChange, className }: PokemonComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<PokemonOption[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDisplay, setSelectedDisplay] = useState<PokemonOption | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (value === null) {
      setSelectedDisplay(null)
      return
    }
    fetch(`/icons/${value}.png`)
      .then(res => res.ok)
      .catch(() => false)
      .then(exists => {
        if (exists) {
          setSelectedDisplay({ id: value, name: "" })
        }
      })
  }, [value])

  useEffect(() => {
    if (!search.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.pokeapi.co/v2/pokemon?limit=100000&q=${encodeURIComponent(search)}&name`
        )
        const data = await res.json()
        const options = (data.results || []).slice(0, 10).map((p: { url: string; name: string }) => {
          const id = parseInt(p.url.split("/").filter(Boolean).pop() || "0")
          return { id, name: p.name }
        }).filter((p: PokemonOption) => p.id > 0)
        setResults(options)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [search])

  function handleSelect(pokemon: PokemonOption) {
    onChange(pokemon.id)
    setSearch("")
    setResults([])
    setOpen(false)
  }

  function handleClear() {
    onChange(0)
    setSelectedDisplay(null)
  }

  return (
    <div className={cn("relative", className)}>
      {value !== null && value > 0 ? (
        <div className="flex items-center gap-2">
          <img
            src={`/icons/${value}.png`}
            alt=""
            className="h-10 w-10 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
          />
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              setOpen(true)
              inputRef.current?.focus()
            }}
            className="flex w-full items-center justify-between border rounded-md px-3 py-2 text-sm"
          >
            <span className="text-muted-foreground">Select Pokemon</span>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {open && (
            <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-md max-h-60 overflow-auto">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Pokemon..."
                className="w-full px-3 py-2 text-sm border-b"
                autoFocus
              />
              {results.length === 0 && !loading && search && (
                <div className="px-3 py-2 text-sm text-muted-foreground">No Pokemon found</div>
              )}
              {results.map((pokemon) => (
                <button
                  key={pokemon.id}
                  type="button"
                  onClick={() => handleSelect(pokemon)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                >
                  <img
                    src={`/icons/${pokemon.id}.png`}
                    alt=""
                    className="h-6 w-6 object-contain"
                    onError={(e) => e.currentTarget.style.display = "none"}
                  />
                  <span className="capitalize">{pokemon.name.replace(/-/g, " ")}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {open && <div className="fixed inset-0" onClick={() => setOpen(false)} />}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/tournaments/pokemon-combobox.tsx
git commit -m "feat: add PokemonCombobox component"
```

---

## Task 4: Update AddRoundDialog

**Files:**
- Modify: `components/tournaments/add-round-dialog.tsx`

**Step 1: Replace the dialog content**

Update the imports and form to use PokemonCombobox instead of the archetype input:

```tsx
import { PokemonCombobox } from "./pokemon-combobox"
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
            <div className="grid gap-2">
              <Label htmlFor="pokemon1">Opponent Pokemon 1 *</Label>
              <PokemonCombobox
                value={pokemon1}
                onChange={(id) => setPokemon1(id)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pokemon2">Opponent Pokemon 2 *</Label>
              <PokemonCombobox
                value={pokemon2}
                onChange={(id) => setPokemon2(id)}
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
            <Button type="submit" disabled={pokemon1 === null || pokemon2 === null || isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Round"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Run lint**

```bash
pnpm lint
```

**Step 3: Commit**

```bash
git add components/tournaments/add-round-dialog.tsx
git commit -m "feat: update AddRoundDialog with PokemonCombobox"
```

---

## Task 5: Update TournamentRounds display

**Files:**
- Modify: `components/tournaments/tournament-rounds.tsx:79-103`

**Step 1: Replace the round card content**

Replace the text display in CardContent:

```tsx
<CardContent className="pt-4 pb-4">
  <div className="flex items-end justify-between">
    <div className="flex items-end gap-3">
      <div className="flex items-center gap-1">
        <img
          src={`/icons/${round.opponent_pokemon_1}.png`}
          alt=""
          className="h-8 w-8 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
        />
        <img
          src={`/icons/${round.opponent_pokemon_2}.png`}
          alt=""
          className="h-8 w-8 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
        />
      </div>
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
```

**Step 2: Run lint**

```bash
pnpm lint
```

**Step 3: Commit**

```bash
git add components/tournaments/tournament-rounds.tsx
git commit -m "feat: display opponent pokemon as sprites"
```

---

## Task 6: Run typecheck

**Step 1: Run typecheck**

```bash
pnpm typecheck
```

**Step 2: Fix any type errors if they occur**

---

## Task 7: Test end-to-end

**Step 1: Start dev server**

```bash
pnpm dev
```

**Step 2: Navigate to a tournament and add a round**

Verify:
- Both comboboxes search and show results
- Selection shows sprite
- Form submits successfully
- Round appears in list with sprites

**Step 3: Commit all remaining changes**

```bash
git add -A
git commit -m "feat: complete round recording with pokemon selection"
```

---

**Plan complete and saved to `docs/plans/2026-04-19-round-recording-implementation.md`**

Two execution options:

**1. Subagent-Driven (this session)** — I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** — Open new session with executing-plans, batch execution with checkpoints

Which approach?