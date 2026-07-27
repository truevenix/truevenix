"use client"

import Link from "next/link"

type Props = {
  href: string
  label: string
  primary: string
  textColor: string
}

export default function CategoryPill({ href, label, primary, textColor }: Props) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-full border text-sm font-semibold transition-all duration-200 hover:shadow-sm"
      style={{
        borderColor: `${primary}40`,
        color: textColor,
        backgroundColor: `${primary}08`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = primary
        e.currentTarget.style.color = "#ffffff"
        e.currentTarget.style.borderColor = primary
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = `${primary}08`
        e.currentTarget.style.color = textColor
        e.currentTarget.style.borderColor = `${primary}40`
      }}
    >
      {label}
    </Link>
  )
}