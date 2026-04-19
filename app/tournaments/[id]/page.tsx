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
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mx-auto w-full max-w-3xl">
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
          <div className="mx-auto w-full max-w-3xl">
            <div>
              <h1 className="text-2xl font-bold">{tournament.name}</h1>
              {tournament.date && (
                <p className="text-sm text-muted-foreground mt-1">{tournament.date}</p>
              )}
            </div>
            <TournamentRounds tournamentId={id} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}