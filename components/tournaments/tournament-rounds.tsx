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
          tournamentId={tournamentId}
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