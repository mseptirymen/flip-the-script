# Multi-Round Results Tracker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow users to enter match results across multiple rounds (up to 3) in a single dialog session, with W/L/T/Bye/No Show result types and First/Second tracking.

**Architecture:** Replace single-round AddRoundDialog with multi-round entry. Update Round type to include 'tie', 'bye', 'no_show' results and nullable went_first. Database uses existing schema with new enum values.

**Tech Stack:** Next.js, Supabase, shadcn/ui, React hooks

---

## Task 1: Update Round Type

**Files:**
- Modify: `lib/types.ts:10-18`

**Step 1: Update the Round interface**

```typescript
export interface Round {
  id: string;
  tournament_id: string;
  round_number: number;
  opponent_pokemon_1: number;
  opponent_pokemon_2: number;
  result: 'win' | 'loss' | 'tie' | 'bye' | 'no_show';
  went_first: boolean | null;
  created_at: string;
}
```

**Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat(types): add tie, bye, no_show results and went_first to Round"
```

---

## Task 2: Update Database Functions

**Files:**
- Modify: `lib/db.ts:87-97`

**Step 1: Update updateRound function to handle went_first**

Current code:
```typescript
export async function updateRound(
  id: string,
  updates: Partial<Pick<Round, 'opponent_pokemon_1' | 'opponent_pokemon_2' | 'result'>>
): Promise<void>
```

New code:
```typescript
export async function updateRound(
  id: string,
  updates: Partial<Pick<Round, 'opponent_pokemon_1' | 'opponent_pokemon_2' | 'result' | 'went_first'>>
): Promise<void>
```

**Step 2: Commit**

```bash
git add lib/db.ts
git commit -m "feat(db): add went_first to updateRound"
```

---

## Task 3: Create Multi-Round Add Round Dialog

**Files:**
- Create: `components/tournaments/add-round-dialog.tsx` (replace existing)

**Step 1: Write the new multi-round dialog**

The dialog should have:
- State: `rounds: Array<{pokemon1, pokemon2, result, wentFirst}>`
- Initial state has 1 round with null values
- When result is selected for round N, round N+1 becomes available
- First/Second toggle appears after result selection (except bye/no_show)
- Result buttons: W, L, T, Bye, No Show as ghost buttons
- Badge for each round showing W/L/T/B/N

Key UI sections:
```
Round 1:
  - Pokemon 1 combobox
  - Pokemon 2 combobox
  - Result buttons: [W] [L] [T] [Bye] [No Show]
  - (After result) You went: [First] [Second]
  - [+ Add Round 2]

Round 2 (conditional):
  - Same structure as Round 1
  - [+ Add Round 3]

Round 3 (conditional):
  - Same structure
```

For the result buttons, use Button with variant="ghost":
```tsx
<Button
  variant="ghost"
  size="sm"
  className={cn(
    result === 'win' && 'bg-emerald-500/20 text-emerald-600'
  )}
  onClick={() => setResult('win')}
>
  W
</Button>
```

For First/Second toggle, use RadioGroup or two ghost buttons:
```tsx
<div className="flex gap-2">
  <Button
    variant="ghost"
    size="sm"
    className={cn(wentFirst === true && 'bg-primary/20')}
    onClick={() => setWentFirst(true)}
  >
    First
  </Button>
  <Button
    variant="ghost"
    size="sm"
    className={cn(wentFirst === false && 'bg-primary/20')}
    onClick={() => setWentFirst(false)}
  >
    Second
  </Button>
</div>
```

**Step 2: Run lint**

```bash
pnpm lint
```

**Step 3: Commit**

```bash
git add components/tournaments/add-round-dialog.tsx
git commit -m "feat(tournaments): multi-round entry with W/L/T/Bye/NoShow and First/Second"
```

---

## Task 4: Update Edit Round Dialog

**Files:**
- Modify: `components/tournaments/edit-round-dialog.tsx`

**Step 1: Add tie/bye/no_show to result options**

Update the RadioGroup options to include:
```tsx
<RadioGroupItem value="win" id="win" />
<Label htmlFor="win">Win</Label>

<RadioGroupItem value="loss" id="loss" />
<Label htmlFor="loss">Loss</Label>

<RadioGroupItem value="tie" id="tie" />
<Label htmlFor="tie">Tie</Label>

<RadioGroupItem value="bye" id="bye" />
<Label htmlFor="bye">Bye</Label>

<RadioGroupItem value="no_show" id="no_show" />
<Label htmlFor="no_show">No Show</Label>
```

**Step 2: Add First/Second toggle**

Add after the result RadioGroup:
```tsx
<div className="grid gap-2">
  <Label>You went *</Label>
  <div className="flex gap-4">
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="first" id="first" checked={wentFirst === true} />
      <Label htmlFor="first">First</Label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="second" id="second" checked={wentFirst === false} />
      <Label htmlFor="second">Second</Label>
    </div>
  </div>
</div>
```

**Step 3: Update state and submit**

```typescript
const [wentFirst, setWentFirst] = useState<boolean | null>(round.went_first)
```

In submit:
```typescript
await updateRound(round.id, {
  opponent_pokemon_1: pokemon1,
  opponent_pokemon_2: pokemon2,
  result,
  went_first: wentFirst,
})
```

**Step 4: Run lint**

```bash
pnpm lint
```

**Step 5: Commit**

```bash
git add components/tournaments/edit-round-dialog.tsx
git commit -m "feat(tournaments): add First/Second and new result types to edit dialog"
```

---

## Task 5: Update Tournament Rounds Card Badges

**Files:**
- Modify: `components/tournaments/tournament-rounds.tsx`

**Step 1: Update badge display and styling**

Current:
```tsx
<Badge
  variant={round.result === "win" ? "success" : "destructive"}
>
  {round.result === "win" ? "W" : "L"}
</Badge>
```

New - handle all result types:
```tsx
<Badge
  variant={
    round.result === "win" ? "success" :
    round.result === "loss" ? "destructive" :
    round.result === "tie" ? "secondary" :
    "outline"
  }
  className="h-7 px-3 text-sm font-semibold min-w-[2.5rem] text-center"
>
  {round.result === "win" ? "W" :
   round.result === "loss" ? "L" :
   round.result === "tie" ? "T" :
   round.result === "bye" ? "B" : "N"}
</Badge>
```

Also update the card background color logic:
```tsx
className={cn(
  "p-4 cursor-pointer transition-colors border-0 shadow-none ring-0",
  round.result === "win" && "bg-emerald-500/10 hover:bg-emerald-500/20",
  round.result === "loss" && "bg-red-500/10 hover:bg-red-500/20",
  round.result === "tie" && "bg-yellow-500/10 hover:bg-yellow-500/20",
  (round.result === "bye" || round.result === "no_show") && "bg-muted hover:bg-muted/80"
)}
```

**Step 2: Run lint**

```bash
pnpm lint
```

**Step 3: Commit**

```bash
git add components/tournaments/tournament-rounds.tsx
git commit -m "fix(tournaments): handle all result types in round card badges"
```

---

## Task 6: Verify Everything Works

**Step 1: Run typecheck**

```bash
pnpm typecheck
```

**Step 2: Test the flow**

1. Open a tournament
2. Click "Add Round"
3. Select Pokemon for Round 1
4. Click W button - First/Second should appear
5. Select First
6. "Add Round 2" button should appear
7. Click it - Round 2 inputs appear
8. Fill Round 2, select L, select Second
9. "Add Round 3" button should appear
10. Click it - Round 3 inputs appear
11. Fill Round 3, select T, select First
12. Click "Save All Rounds"
13. Should see 3 rounds in tournament view with correct badges

---

## Final Commit

```bash
git add . && git commit -m "feat(tournaments): multi-round entry with W/L/T/Bye/NoShow results"
```
