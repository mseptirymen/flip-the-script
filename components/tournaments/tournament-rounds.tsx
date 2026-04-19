"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddRoundDialog } from "@/components/tournaments/add-round-dialog"
import { getRoundsForTournament, deleteRound, getTournament } from "@/lib/db"
import type { Round, Tournament } from "@/lib/types"

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

  async function handleDeleteRound(roundId: string) {
    await deleteRound(roundId)
    await loadData()
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>
  }

  if (!tournament) {
    return <p className="text-sm text-muted-foreground">Tournament not found.</p>
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
          {rounds
            .sort((a, b) => a.round_number - b.round_number)
            .map((round) => (
              <Card key={round.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-end gap-3">
                      <span className="text-sm font-medium">
                        Round {round.round_number}
                      </span>
                      <div className="flex items-center gap-1">
                        <img
                          src={`/icons/${round.opponent_pokemon_1}.png`}
                          alt=""
                          className="h-8 w-8 shrink-0 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                        <img
                          src={`/icons/${round.opponent_pokemon_2}.png`}
                          alt=""
                          className="h-8 w-8 shrink-0 object-contain"
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
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}