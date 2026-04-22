"use client"

import { useEffect, useState } from "react"
import { Plus, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import { AddRoundDialog } from "@/components/tournaments/add-round-dialog"
import { EditRoundDialog } from "@/components/tournaments/edit-round-dialog"
import { getRoundsForTournament, getTournament } from "@/lib/db"
import type { Round, Tournament } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TournamentRoundsProps {
  tournamentId: string
}

export function TournamentRounds({ tournamentId }: TournamentRoundsProps) {
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [rounds, setRounds] = useState<Round[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [tournamentId])

  async function loadData() {
    const [tournamentData, roundsData] = await Promise.all([
      getTournament(tournamentId),
      getRoundsForTournament(tournamentId),
    ])
    setTournament(tournamentData)
    setRounds(roundsData)
    setIsLoading(false)
  }

  async function handleRoundAdded() {
    await loadData()
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>
  }

  if (!tournament) {
    return <p className="text-sm text-muted-foreground">Tournament not found.</p>
  }

  function getResultBadge(result: string) {
    switch (result) {
      case 'win': return { variant: 'success' as const, label: 'W' }
      case 'loss': return { variant: 'destructive' as const, label: 'L' }
      case 'tie': return { variant: 'secondary' as const, label: 'T' }
      case 'bye': return { variant: 'outline' as const, label: 'B' }
      case 'no_show': return { variant: 'outline' as const, label: 'N' }
      default: return { variant: 'outline' as const, label: '?' }
    }
  }

  function getOverallResult(round: Round): 'win' | 'loss' | 'tie' | 'other' {
    const games = round.games || []
    if (games.length === 0) return 'other'

    const wins = games.filter((g) => g.result === 'win').length
    const losses = games.filter((g) => g.result === 'loss').length
    const ties = games.filter((g) => g.result === 'tie').length

    if (wins > losses) return 'win'
    if (losses > wins) return 'loss'
    if (wins === losses && wins > 0) return 'tie'
    return 'other'
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <h2 className="text-lg font-medium">Rounds</h2>
        <AddRoundDialog
          nextRoundNumber={rounds.length + 1}
          onRoundAdded={handleRoundAdded}
          tournamentId={tournamentId}
        />
      </div>

      {rounds.length === 0 ? (
        <Empty className="border">
          <EmptyMedia variant="icon">
            <Trophy className="size-6" />
          </EmptyMedia>
          <EmptyDescription>
            No rounds recorded yet. Click "Add Round" to log your first round.
          </EmptyDescription>
        </Empty>
      ) : (
        <div className="grid gap-2">
          {rounds
            .sort((a, b) => a.round_number - b.round_number)
            .map((round) => (
              <EditRoundDialog
                key={round.id}
                round={round}
                onRoundUpdated={loadData}
              >
                <Card
                  className={cn(
                    "p-4 cursor-pointer transition-colors border-0 shadow-none ring-0",
                    getOverallResult(round) === "win" && "bg-emerald-500/10 hover:bg-emerald-500/20",
                    getOverallResult(round) === "loss" && "bg-red-500/10 hover:bg-red-500/20",
                    getOverallResult(round) === "tie" && "bg-yellow-500/10 hover:bg-yellow-500/20",
                    getOverallResult(round) === "other" && "bg-muted hover:bg-muted/80"
                  )}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Round {round.round_number}
                      </span>
                      <div className="flex items-center gap-0 ml-20 mr-auto">
                        <img
                          src={`/icons/${round.opponent_pokemon_1}.png`}
                          alt=""
                          className="h-12 w-12 shrink-0 object-contain sprite-icon"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                        <img
                          src={`/icons/${round.opponent_pokemon_2}.png`}
                          alt=""
                          className="h-12 w-12 shrink-0 object-contain sprite-icon"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      </div>
                      <div className="flex gap-1 w-full max-w-[6rem] justify-end">
                        {(round.games || []).map((game, index) => {
                          const badge = getResultBadge(game.result)
                          return (
                            <Badge
                              key={index}
                              variant={badge.variant}
                              className="h-7 w-7 p-0 text-sm font-semibold flex items-center justify-center"
                            >
                              {badge.label}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </EditRoundDialog>
            ))}
        </div>
      )}
    </div>
  )
}
