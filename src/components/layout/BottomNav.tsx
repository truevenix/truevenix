"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, PackageSearch, ReceiptText, ShoppingCart, User } from "lucide-react"
import { useCart } from "@/context/cart-context"

export const BottomNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: PackageSearch },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/orders", label: "Orders", icon: ReceiptText },
  { href: "/profile", label: "Account", icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { totalItems } = useCart()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 px-2 py-2 shadow-2xl backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {BottomNavItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold"
              style={{ color: active ? "var(--theme-primary)" : "#94a3b8" }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {href === "/cart" && totalItems > 0 ? (
                <span className="absolute right-4 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] text-white">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
