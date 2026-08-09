// src/components/layout/Navbar.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ShoppingCart, User, Menu, X, Heart, MapPin, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/providers/theme-provider"
import { useCart } from "@/context/cart-context"
import Image from "next/image"
import { AddressModal, type AddressForm } from "@/components/AddressModal"
import { useDeliveryAddress } from "@/context/DeliveryAddressContext"
import { useSession } from "next-auth/react"
import { Space_Grotesk } from "next/font/google"

const brandFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["700"],
})

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Orders", href: "/orders" },
  { label: "About", href: "/about-us" },
  { label: "Contact", href: "/contact-us" },
  { label: "Account", href: "/profile" },
]

export const CATEGORY_LABELS: Record<string, string> = {
  GADGETS:     "Gadgets",
  SOLAR:       "Solar & Energy",
  ELECTRONICS: "Electronics",
  PHONES:      "Phones",  
  COMPUTERS:   "Computers",
  MACHINERY:   "Machinery",
}

type Props = {
  subcategories?: Record<string, string[]>
  // New mobile view props
  showSearch?: boolean
  title?: string
  showDeliverTo?: boolean
  showCart?: boolean
  showMobileMenu?: boolean
}

// ─── user avatar ───────────────────────────────────────────────────────────

function UserAvatar({ name, image, size = 32 }: { name?: string | null; image?: string | null; size?: number }) {
   const { theme } = useTheme()
  const initials = name
    ? name.split(" ").map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("")
    : "U"

  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? "User"}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-black text-xs"
      style={{ width: size, height: size, fontSize: size * 0.35, background: theme.primary }}
    >
      {initials}
    </div>
  )
}

export default function Navbar({ 
  subcategories = {}, 
  showSearch = true, 
  title,
  showDeliverTo = true,
  showCart = true,
  showMobileMenu = true
}: Props) {
  const { theme } = useTheme()
  const { totalItems, setIsCartOpen } = useCart()
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { activeAddress, pendingAddress, saveAddress, deleteAddress } = useDeliveryAddress()

  const savedAddress = activeAddress ?? pendingAddress
  const deliverToLabel = savedAddress ? `${savedAddress.town}, ${savedAddress.state}` : "Set location"

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [megaOpen, setMegaOpen] = useState(false)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const tickerRef = useRef<HTMLDivElement>(null)
const [trackWidth, setTrackWidth] = useState(0)

  // Mobile hide-on-scroll-down / show-on-scroll-up. Desktop header stays put.
  const [headerHidden, setHeaderHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    function handleScroll() {
      const isMobile = window.innerWidth < 768

      if (!isMobile) {
        // Desktop: header always visible, just keep the ref in sync.
        setHeaderHidden(false)
        lastScrollY.current = window.scrollY
        return
      }

    

      const currentScrollY = window.scrollY
      const scrolledDown = currentScrollY > lastScrollY.current
      const pastThreshold = currentScrollY > 80

      if (scrolledDown && pastThreshold) {
        setHeaderHidden(true)
      } else {
        setHeaderHidden(false)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

    useEffect(() => {
  if (tickerRef.current) {
    // content is duplicated x2, so one "track" is half the scrollWidth
    setTrackWidth(tickerRef.current.scrollWidth / 2)
  }
}, [])

  const megaRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<NodeJS.Timeout | null>(null)

  const parentCategories = Object.keys(CATEGORY_LABELS).filter(
    (key) => (subcategories?.[key]?.length ?? 0) > 0
  )

  function openMega() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setMegaOpen(true)
  }

  function scheduledClose() {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 180)
  }

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

  async function handleSaveAddress(data: AddressForm) {
    await saveAddress(data, savedAddress?.id)
    setAddressModalOpen(false)
  }

  async function handleDeleteAddress() {
    await deleteAddress(savedAddress?.id)
    setAddressModalOpen(false)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    router.push(`/shop?q=${encodeURIComponent(q)}`)
    setSearchQuery("")
  }

  const user = session?.user

  return (
    <>
      {/* Top bar */}
<div
  className="flex py-2 text-xs overflow-hidden"
  style={{ background: theme.primary, color: "white" }}
>
  <div className="container mx-auto px-4 flex justify-between items-center">

    {/* Moving delivery / info ticker */}
    <div className="relative flex-1 overflow-hidden">
      <motion.div
        ref={tickerRef}
        className="flex items-center whitespace-nowrap"
        animate={trackWidth ? { x: [0, -trackWidth] } : {}}
        transition={{ duration: trackWidth / 60, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-10 shrink-0 pr-10">
            <span className="font-bold">Free Delivery to any location in Abuja</span>
            <Link href="/orders" className="hover:underline">Track Order</Link>
            <Link href="/contact-us" className="hover:underline">Help Center</Link>
            <span>Call: +234 7016341256</span>
          </div>
        ))}
      </motion.div>
    </div>
  </div>
</div>

      {/* Main header */}
      <motion.header
        className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm"
        ref={megaRef}
        animate={{ y: headerHidden ? "-100%" : "0%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo + Deliver To */}
            <div className="flex items-center gap-1 md:gap-2 -ml-3 md:-ml-3 min-w-0">
              <Link href="/" className="flex items-center gap-1 md:gap-2 shrink-0">
                <Image
                  src={theme.logo}
                  alt="Truevenix logo"
                  width={367}
                  height={532}
                  className="h-12 w-12 md:h-14 md:w-14 object-contain"
                  unoptimized
                />
                <span
                  className={`${brandFont.className} text-2xl md:text-3xl font-bold tracking-tight whitespace-nowrap`}
                  style={{ color: theme.primary }}
                >
                 {title ? truncateText(title, 17) : "TRUEVENIX"}
                </span>
              </Link>

             {/* Deliver To - hidden on mobile if showDeliverTo is false */}
             <button
  onClick={() => setAddressModalOpen(true)}
  className={`items-center gap-1.5 pl-2 pr-3 py-2 rounded-full hover:bg-gray-100 transition-colors text-left ${
    showDeliverTo ? 'flex' : 'hidden md:flex'
  }`}
>
  <div className="leading-tight min-w-0">
    <div className="flex items-center gap-1 whitespace-nowrap">
      <span className="text-xs md:text-base font-bold text-gray-500">
        Deliver to
      </span>
      <ChevronDown size={14} className="text-gray-500 shrink-0" />
    </div>

    <p className="text-xs md:text-sm font-semibold text-gray-800 max-w-[120px] truncate">
      {deliverToLabel}
    </p>
  </div>
</button>
            </div>

            {/* Search — desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for gadgets, solar panels, phones..."
                  className="pl-12 pr-4 h-12 rounded-full border-2 focus-visible:ring-0 bg-white"
                  style={{ borderColor: theme.border }}
                />
                <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Search size={20} style={{ color: theme.primary }} />
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center -mr-4 md:gap-3 shrink-0">
              <Link href="/wishlist" className="hidden md:block">
                <Button variant="ghost" size="icon">
                  <Heart size={20} />
                </Button>
              </Link>

              {/* Cart - hidden on mobile if showCart is false */}
              {showCart && (
                <Button
                  variant="ghost"
                  size="nav"
                  className="relative"
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingCart size={24} />
                  {totalItems > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                      style={{ background: theme.primary }}
                    >
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </Button>
              )}

              {/* Auth area — desktop */}
              {user ? (
                <Link href="/profile" className="hidden md:flex items-center gap-2 group">
                  <div
                    className="ring-2 ring-offset-1 rounded-full transition-all group-hover:ring-offset-2"
                    style={{ "--tw-ring-color": theme.primary } as React.CSSProperties}
                  >
                    <UserAvatar
                      name={user.name}
                      image={user.image}
                      size={36}
                    />
                  </div>
                  <div className="leading-tight hidden lg:block">
                    <p className="text-[10px] text-gray-400 font-medium">Hello,</p>
                    <p className="text-xs font-black text-gray-900 max-w-[90px] truncate">
                      {user.name?.split(" ")[0] ?? "User"}
                    </p>
                  </div>
                </Link>
              ) : (
                <Link href="/auth/login" className="hidden md:block">
                  <Button variant="outline" size="sm" className="gap-2 font-semibold">
                    <User size={16} />
                    Sign In
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Button - hidden if showMobileMenu is false */}
              {showMobileMenu && (
                <Button
                  variant="ghost"
                  size="nav"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen((o) => !o)}
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={24} />}
                </Button>
              )}
            </div>
          </div>

          {/* Mobile search — hidden if showSearch is false */}
          {showSearch && (
            <div className="md:hidden pb-3">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="pl-10 pr-4 h-11 rounded-full border-2 focus-visible:ring-0"
                  style={{ borderColor: theme.border }}
                />
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Search size={18} style={{ color: theme.primary }} />
                </button>
              </form>
            </div>
          )}

          {/* Secondary nav row — desktop only */}
          <div className="hidden md:flex items-center gap-1 pb-3">
            <button
              onMouseEnter={openMega}
              onMouseLeave={scheduledClose}
              onClick={() => setMegaOpen((o) => !o)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Menu size={15} />
              All Categories
              <ChevronDown
                size={14}
                className="transition-transform duration-200"
                style={{ transform: megaOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            <div className="w-px h-5 bg-gray-200 ml-auto mr-1" />

          {NAV_LINKS.map((link) => {
  const isActive =
    link.href === "/"
      ? pathname === "/"
      : pathname.startsWith(link.href)

  return (
    <Link
      key={link.href}
      href={link.href}
      className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
      style={{
        background: isActive ? theme.primary : "transparent",
        color: isActive ? "#fff" : "#4B5563",
      }}
    >
      {link.label}
    </Link>
  )
})}
          </div>
        </div>

        {/* Mega dropdown */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 z-40 hidden md:block"
              onMouseEnter={cancelClose}
              onMouseLeave={scheduledClose}
            >
              <div className="bg-white border-t border-gray-100 shadow-2xl">
                <div className="container mx-auto px-6 py-8">
                  {parentCategories.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No categories available yet.
                    </p>
                  ) : (
                    <div
                      className="grid gap-8"
                      style={{
                        gridTemplateColumns: `repeat(${Math.min(parentCategories.length, 5)}, minmax(0, 1fr))`,
                      }}
                    >
                      {parentCategories.map((parentKey) => {
                        const subs = subcategories[parentKey] ?? []
                        return (
                          <div key={parentKey}>
                            <Link
                              href={`/shop?category=${parentKey}`}
                              onClick={() => setMegaOpen(false)}
                              className="group block mb-3 pb-2 border-b border-gray-100"
                            >
                              <span
                                className="text-xs font-black uppercase tracking-widest group-hover:underline"
                                style={{ color: theme.primary }}
                              >
                                {CATEGORY_LABELS[parentKey] ?? parentKey}
                              </span>
                            </Link>
                            <ul className="space-y-2">
                              {subs.map((sub) => (
                                <li key={sub}>
                                  <Link
                                    href={`/shop?category=${parentKey}&q=${encodeURIComponent(sub)}`}
                                    onClick={() => setMegaOpen(false)}
                                    className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                  >
                                    {sub}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween" }}
              className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
  {user ? (
    <Link
      href="/profile"
      onClick={() => setMobileMenuOpen(false)}
      className="flex items-center gap-3"
    >
      <div className="mr-1">
        <UserAvatar name={user.name} image={user.image} size={40} />
      </div>

      <div className="leading-tight flex flex-col justify-center">
        <p className="text-xs text-gray-400">Signed in as</p>
        <p className="text-sm font-black text-gray-900 truncate max-w-[160px]">
          {user.name ?? user.email}
        </p>
      </div>
    </Link>
  ) : (
    <p className="font-black text-lg text-gray-900">Menu</p>
  )}

  <Button
    variant="ghost"
    size="icon"
    onClick={() => setMobileMenuOpen(false)}
  >
    <X size={20} />
  </Button>
</div>

              {/* Nav links */}
             <div className="p-4 space-y-2">
  {NAV_LINKS.map((link) => {
    const isActive =
      link.href === "/"
        ? pathname === "/"
        : pathname.startsWith(link.href)

    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => setMobileMenuOpen(false)}
        className="block px-4 py-3 rounded-xl font-semibold transition-all"
        style={{
          background: isActive ? theme.primary : "transparent",
          color: isActive ? "#fff" : "#374151",
        }}
      >
        {link.label}
      </Link>
    )
  })}
</div>

              {/* Subcategories */}
              {parentCategories.length > 0 && (
                <div className="p-4 border-t border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                    Shop by category
                  </p>
                  <div className="space-y-5">
                    {parentCategories.map((parentKey) => {
                      const subs = subcategories[parentKey] ?? []
                      return (
                        <div key={parentKey}>
                          <Link
                            href={`/shop?category=${parentKey}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-xs font-black uppercase tracking-wider mb-2"
                            style={{ color: theme.primary }}
                          >
                            {CATEGORY_LABELS[parentKey] ?? parentKey}
                          </Link>
                          <div className="flex flex-wrap gap-2">
                            {subs.map((sub) => (
                              <Link
                                key={sub}
                                href={`/shop?category=${parentKey}&q=${encodeURIComponent(sub)}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                              >
                                {sub}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Auth */}
              <div className="p-4 border-t border-gray-100 space-y-2">
                {!user && (
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      className="w-full gap-2 text-white"
                      size="lg"
                      style={{ background: theme.primary }}
                    >
                      <User size={18} />
                      Sign In / Register
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address modal */}
      {addressModalOpen && (
        <AddressModal
          address={savedAddress}
          onClose={() => setAddressModalOpen(false)}
          onSave={handleSaveAddress}
          onDelete={savedAddress ? handleDeleteAddress : undefined}
        />
      )}
    </>
  )
}