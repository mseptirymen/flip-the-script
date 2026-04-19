"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AddTournamentDialog } from "@/components/tournaments/add-tournament-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TrophyIcon } from "lucide-react"
import { deleteTournament, getAllTournaments } from "@/lib/db"
import type { Tournament } from "@/lib/types"

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

  async function handleDelete(id: string) {
    await deleteTournament(id)
    await loadTournaments()
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
            <div className="grid gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : tournaments.length === 0 ? (
            <Empty className="border max-h-48">
              <EmptyMedia variant="icon">
                <TrophyIcon />
              </EmptyMedia>
              <EmptyTitle>No tournaments yet</EmptyTitle>
              <EmptyDescription>
                Click "Add Tournament" to log your first one.
              </EmptyDescription>
            </Empty>
          ) : (
            <div className="grid gap-4">
              {tournaments.map((tournament) => (
                <div key={tournament.id} className="group relative">
                  <Link href={`/tournaments/${tournament.id}`}>
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{tournament.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {tournament.date && <span>{tournament.date}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Tournament?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{tournament.name}" and all its rounds.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(tournament.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
