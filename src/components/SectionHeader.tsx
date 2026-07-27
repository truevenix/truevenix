// components/SectionHeader.tsx
import type { ReactNode } from "react"

type Props = {
  title: ReactNode
  subtitle?: ReactNode
  className?: string
}

export default function SectionHeader({ title, subtitle, className = "" }: Props) {
  return (
    <div className={`text-center mb-10 md:mb-14 ${className}`}>
      <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
        <span
          className="h-[3px] w-8 sm:w-16 md:w-24 rounded-full shrink-0"
          style={{
            background: "linear-gradient(to right, transparent, var(--theme-primary))",
          }}
        />
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight whitespace-nowrap"
          style={{ color: "var(--theme-primary)" }}
        >
          {title}
        </h2>
        <span
          className="h-[3px] w-8 sm:w-16 md:w-24 rounded-full shrink-0"
          style={{
            background: "linear-gradient(to left, transparent, var(--theme-primary))",
          }}
        />
      </div>

      {subtitle && (
        <p className="text-sm md:text-base text-gray-500 mt-3 max-w-xl mx-auto px-4">
          {subtitle}
        </p>
      )}
    </div>
  )
}