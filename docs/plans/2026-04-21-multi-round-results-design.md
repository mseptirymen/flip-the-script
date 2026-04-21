# Design: Multi-Round Results Tracker

## Overview

An enhanced round entry dialog that allows users to enter match results across multiple rounds (up to 3) in a single session, with progressive disclosure for each round.

## Data Model

### Round Type Changes

```typescript
// Before
result: 'win' | 'loss'

// After
result: 'win' | 'loss' | 'tie' | 'bye' | 'no_show'
went_first: boolean | null  // null when result doesn't require it (no show, bye)
```

### Database Considerations

- `went_first` column should be nullable (boolean + null in Postgres)
- New result options don't require additional columns

## UI Structure

### Add Round Dialog Flow

1. **Round 1 Section** (always visible)
   - Opponent's Pokemon (2 comboboxes side by side)
   - Result buttons row: `W` `L` `T` `Bye` `No Show` (ghost buttons)
   - After selecting result → "You went:" `First` / `Second` toggle slides in
   - "Add Round 2" button appears after Round 1 has result

2. **Round 2 Section** (hidden until Round 1 has result)
   - Same structure as Round 1
   - "Add Round 3" button appears after Round 2 has result

3. **Round 3 Section** (hidden until Round 2 has result)
   - Same structure

4. **Footer:** Cancel / Save All Rounds

### Result Button Layout

```
┌──────────────────────────────────────────────┐
│  Opponent's Pokemon                          │
│  [Pikachu ▼]    [Charizard ▼]               │
├──────────────────────────────────────────────┤
│  Result:  [W] [L] [T] [Bye] [No Show]       │
├──────────────────────────────────────────────┤
│  You went:  (First)  (Second)                │
│                                              │
│  [+ Add Round 2]                             │
└──────────────────────────────────────────────┘
```

## Component Changes

### Add Round Dialog

- Replaces single-round dialog with multi-round entry
- State manages array of rounds: `[{pokemon1, pokemon2, result, wentFirst}]`
- Progressive reveal: Round N+1 appears after Round N has result
- Submit creates multiple round records at once

### Edit Round Dialog

- Single round editing remains unchanged
- Result type now includes 'tie' | 'bye' | 'no_show'
- First/Second toggle appears conditionally

### Tournament Rounds Card

- Badge shows appropriate letter: W, L, T, B (bye), N (no show)
- Card styling may need adjustment for tie/bye/no_show results

## Implementation Notes

- First/Second is **required** for win/loss/tie
- First/Second is **optional** for bye/no_show (or could be hidden)
- All rounds are independent records - no match grouping in DB
- If user closes dialog mid-entry, data is lost (no draft state needed)

## Out of Scope

- Match-level grouping (treating rounds 1-3 as a single match)
- Automatic match result calculation (e.g., best of 3)
