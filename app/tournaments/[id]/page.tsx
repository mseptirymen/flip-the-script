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
import { getTournament } from "@/lib/db"
import type { Tournament } from "@/lib/types"

interface TournamentDetailPageProps {
  params: Promise<{ id: string }>
}

export default function TournamentDetailPage({ params }: TournamentDetailPageProps) {
  const { id } = use(params)
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTournament()
  }, [id])

  async function loadTournament() {
    const data = await getTournament(id)
    setTournament(data || null)
    setIsLoading(false)
  }

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
          <div className="flex flex-1 items-center justify-center p-4 pt-0">
            <p className="text-sm text-muted-foreground">Loading...</p>
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