"use client"

import { useEffect, useState, use } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { getTournament, getRoundsForTournament } from "@/lib/db"
import type { Round, Tournament } from "@/lib/types"

interface TournamentDetailPageProps {
  params: Promise<{ id: string }>
}

export default function TournamentDetailPage({ params }: TournamentDetailPageProps) {
  const { id } = use(params)
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [rounds, setRounds] = useState<Round[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [record, setRecord] = useState({ wins: 0, losses: 0 })

  useEffect(() => {
    loadTournament()
  }, [id])

  async function loadTournament() {
    const [tournamentData, roundsData] = await Promise.all([
      getTournament(id),
      getRoundsForTournament(id),
    ])
    setTournament(tournamentData || null)
    setRounds(roundsData)
    setIsLoading(false)
  }

  function handleRecordUpdated(wins: number, losses: number) {
    setRecord({ wins, losses })
  }

  const totalWins = record.wins
  const totalLosses = record.losses

  if (isLoading) {
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
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mx-auto w-full max-w-xl">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex flex-col gap-2 mt-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

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
          <div className="mx-auto w-full max-w-xl">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{tournament.name}</h1>
                {tournament.date && (
                  <p className="text-sm text-muted-foreground mt-1">{tournament.date}</p>
                )}
              </div>
              {rounds.length > 0 && (
                <span className="text-lg font-medium">
                  {totalWins}-{totalLosses}
                </span>
              )}
            </div>
            <TournamentRounds tournamentId={id} className="mt-6" onRecordUpdated={handleRecordUpdated} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}