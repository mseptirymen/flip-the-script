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
