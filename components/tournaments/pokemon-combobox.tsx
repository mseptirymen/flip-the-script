"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PokemonOption {
  id: number
  name: string
}

interface PokemonComboboxProps {
  value: number | null
  onChange: (id: number) => void
  className?: string
}

export function PokemonCombobox({ value, onChange, className }: PokemonComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<PokemonOption[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDisplay, setSelectedDisplay] = useState<PokemonOption | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (value === null) {
      setSelectedDisplay(null)
      return
    }
    setSelectedDisplay({ id: value, name: "" })
  }, [value])

  useEffect(() => {
    if (!search.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    clearTimeout(debounceRef.current ?? undefined)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/pokemon/search?q=${encodeURIComponent(search)}`
        )
        const data = await res.json()
        const allResults = data.results || []
        const filtered = allResults.filter((p: { name: string }) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        )
        const options = filtered.slice(0, 10).map((p: { id: number; name: string }) => {
          return { id: p.id, name: p.name }
        }).filter((p: PokemonOption) => p.id > 0)
        setResults(options)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(debounceRef.current ?? undefined)
  }, [search])

  function handleSelect(pokemon: PokemonOption) {
    onChange(pokemon.id)
    setSearch("")
    setResults([])
    setOpen(false)
  }

  function handleClear() {
    onChange(0)
    setSelectedDisplay(null)
  }

  return (
    <div className={cn("relative", className)}>
      {value !== null && value > 0 ? (
        <div className="flex items-center gap-2">
          <img
            src={`/icons/${value}.png`}
            alt=""
            className="h-10 w-10 shrink-0 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
          />
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              setOpen(true)
              inputRef.current?.focus()
            }}
            className="flex w-full items-center justify-between border rounded-md px-3 py-2 text-sm"
          >
            <span className="text-muted-foreground">Select Pokemon</span>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {open && (
            <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-md max-h-60 overflow-auto">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Pokemon..."
                className="w-full px-3 py-2 text-sm border-b"
                autoFocus
              />
              {results.length === 0 && !loading && search && (
                <div className="px-3 py-2 text-sm text-muted-foreground">No Pokemon found</div>
              )}
              {results.map((pokemon) => (
                <button
                  key={pokemon.id}
                  type="button"
                  onClick={() => handleSelect(pokemon)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                >
                  <img
                    src={`/icons/${pokemon.id}.png`}
                    alt=""
                    className="h-6 w-6 object-contain sprite-icon"
                    onError={(e) => e.currentTarget.style.display = "none"}
                  />
                  <span className="capitalize">{pokemon.name.replace(/-/g, " ")}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {open && <div className="fixed inset-0" onClick={() => setOpen(false)} />}
    </div>
  )
}