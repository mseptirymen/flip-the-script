"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CardSearchResult {
  product_id: number
  name: string
  number: string
  image_url: string
  rarity: string
}

interface SearchCardItemProps {
  card: CardSearchResult
  onAdd: (card: CardSearchResult) => void
  disabled?: boolean
}

export function SearchCardItem({ card, onAdd, disabled }: SearchCardItemProps) {
  return (
    <Card
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-sm p-0 h-fit gap-0",
        disabled && "opacity-50 pointer-events-none"
      )}
      onClick={() => onAdd(card)}
    >
      <div className="w-full relative">
        {card.image_url && (
          <Image
            src={card.image_url}
            alt={card.name}
            width={200}
            height={267}
            sizes="200px"
            className="object-cover w-full"
          />
        )}
      </div>
      <div className="p-2">
        <p className="text-xs font-medium truncate">{card.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">
          #{card.number}
        </p>
      </div>
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <p className="text-xs text-white">Click to add</p>
      </div>
    </Card>
  )
}

interface DeckCardItemProps {
  card: {
    id: string
    name: string
    image_url: string | null
    quantity: number
    set_abbreviation: string
    collector_number: string
  }
  onRemove: (id: string) => void
}

export function DeckCardItem({ card, onRemove }: DeckCardItemProps) {
  return (
    <Card
      className="relative group cursor-pointer overflow-hidden"
      onClick={() => onRemove(card.id)}
    >
      {card.image_url && (
        <div className="relative w-full aspect-[5/7]">
          <Image
            src={card.image_url}
            alt={card.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="absolute top-1 right-1">
        {card.quantity > 1 && (
          <Badge className="bg-primary text-primary-foreground">
            {card.quantity}
          </Badge>
        )}
      </div>
      <div className="p-2">
        <p className="text-xs font-medium truncate">{card.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">
          {card.set_abbreviation} #{card.collector_number}
        </p>
      </div>
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <p className="text-xs text-white">Click to remove</p>
      </div>
    </Card>
  )
}

export type { CardSearchResult }