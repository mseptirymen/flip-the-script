"use client"

import * as React from "react"
import { format, parse } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerInputProps {
  id: string
  value: string
  onChange: (date: string) => void
  placeholder?: string
  className?: string
}

export function DatePickerInput({
  id,
  value,
  onChange,
  placeholder = "Select a date",
  className,
}: DatePickerInputProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value || "")

  const selectedDate = value ? new Date(value + "T12:00:00") : undefined

  function handleSelect(date: Date | undefined) {
    if (date) {
      const formatted = format(date, "yyyy-MM-dd")
      onChange(formatted)
      setInputValue(formatted)
    }
    setOpen(false)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setInputValue(val)

    const parsed = parse(val, "yyyy-MM-dd", new Date())
    if (!isNaN(parsed.getTime())) {
      onChange(val)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(new Date(value + "T12:00:00"), "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
      <input type="hidden" id={id} value={value} />
    </Popover>
  )
}

interface DatePickerFieldProps {
  id: string
  label: string
  value: string
  onChange: (date: string) => void
  placeholder?: string
}

export function DatePickerField({ id, label, value, onChange, placeholder }: DatePickerFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <DatePickerInput
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  )
}