"use client"

// src/components/ui/action-menu.tsx
// A generic three-dot action menu. Not tied to orders — drop it next to any
// row/card that needs a compact list of actions (edit, delete, update, etc).

import { useEffect, useRef, useState } from "react"
import { MoreVertical, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type ActionMenuItem = {
  label: string
  icon?: LucideIcon
  onSelect: () => void
  destructive?: boolean
  disabled?: boolean
}

type Props = {
  items: ActionMenuItem[]
  align?: "left" | "right"
  triggerLabel?: string
}

export function ActionMenu({ items, align = "right", triggerLabel = "Open actions" }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-30 mt-1.5 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false)
                  item.onSelect()
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  item.destructive
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                {Icon && <Icon size={15} className={item.destructive ? "text-red-500" : "text-slate-400"} />}
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
