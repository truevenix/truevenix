"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { type CardProduct } from "@/components/products/ProductCard"
import SectionHeader from "@/components/SectionHeader"

const MIN_PRODUCTS_TO_SHOW = 1

export type BrandConfig = {
  displayName: string
  tagline: string
  accent: string
  bg: string
  text: string
  logo: string
  banner?: string
}

export const BRAND_CONFIG: Record<string, BrandConfig> = {
  oraimo: {
    displayName: "Oraimo",
    tagline: "Smart accessories for Africa",
    accent: "#9bce36",
    bg: "#EDFBF2",
    text: "#00431A",
    logo: "/brands/oraimo.jpg",
    banner: "/brands/oraimo-banner.jpg"
  },
  infinix: {
    displayName: "Infinix",
    tagline: "Performance you can feel",
    accent: "#000",
    bg: "#000",
    text: "#000",
    logo: "/brands/infinix.jpg",
    banner: "/brands/infinix-banner.jpg"
  },
  itel: {
    displayName: "Itel",
    tagline: "Enjoy better life",
    accent: "#e50510",
    bg: "#FFF0F3",
    text: "#7A0020",
    logo: "/brands/itel.jpg",
    banner: "/itel.jpg"
  },
  "new age": {
    displayName: "New Age",
    tagline: "Built for modern life",
    accent: "#f85301",
    bg: "#FFF4ED",
    text: "#7A2E00",
    logo: "/brands/newage.jpg",
    banner: "/brands/newage-banner.jpg"
  },
  jbl: {
    displayName: "JBL",
    tagline: "Pure bass. Louder world.",
    accent: "#f84d21",
    bg: "#FFF4ED",
    text: "#7A2E00",
    logo: "/brands/jbl.jpg",
    banner: "/brands/jbl-banner.jpg"
  },
  felicity: {
    displayName: "Felicity",
    tagline: "Solar energy for Africa",
    accent: "#fb5102",
    bg: "#FFF7ED",
    text: "#7A3D00",
    logo: "/brands/felicity.jpg",
    banner: "/brands/felicity-banner.jpg"
  },
  cworth: {
    displayName: "Cworth",
    tagline: "Reliable inverter solutions",
    accent: "#028ddd",
    bg: "#EBF3FF",
    text: "#003366",
    logo: "/brands/cworth.jpg",
    banner: "/brands/cworth-banner.jpg"
  },
  jinco: {
    displayName: "Jinko",
    tagline: "No.1 solar manufacturer",
    accent: "#14a548",
    bg: "#EBF0FF",
    text: "#b8e68e",
    logo: "/brands/jinko.jpg",
    banner: "/brands/jinko-banner.jpg"
  },
}

// ─── helpers ───────────────────────────────────────────────────────────────

function normalizeBrand(raw: string | null): string {
  return (raw ?? "").trim().toLowerCase()
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("")
}

type ResolvedBrand = BrandConfig & { key: string }

function getBrandConfig(raw: string | null): ResolvedBrand {
  const key = normalizeBrand(raw)
  const cfg = BRAND_CONFIG[key]
  if (cfg) return { ...cfg, key }

  const hue = [...key].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  const accent = `hsl(${hue}, 55%, 42%)`
  return {
    key,
    displayName: (raw ?? "Unknown").replace(/\b\w/g, (c) => c.toUpperCase()),
    tagline: "Quality products",
    accent,
    bg: `hsl(${hue}, 50%, 97%)`,
    text: `hsl(${hue}, 55%, 22%)`,
    logo: "",
  }
}

function buildColumns(
  items: Array<{ config: ResolvedBrand; products: CardProduct[] }>,
  numCols: number
) {
  const cols: Array<typeof items> = Array.from({ length: numCols }, () => [])
  items.forEach((item, i) => cols[i % numCols].push(item))
  return cols
}

// ─── brand card ────────────────────────────────────────────────────────────

type BrandCardProps = {
  config: ResolvedBrand
  onClick: () => void
}

function BrandCard({ config, onClick }: BrandCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full h-44 sm:h-48 lg:h-52 overflow-hidden rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-xl"
      style={{ backgroundColor: config.accent }}
    >
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200 pointer-events-none" />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        {config.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.logo}
            alt={`${config.displayName} logo`}
            className="h-full w-full object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <span className="text-2xl font-black tracking-tight text-white drop-shadow">
            {getInitials(config.displayName)}
          </span>
        )}
      </div>
    </button>
  )
}

// ─── animated column ───────────────────────────────────────────────────────

type ColumnProps = {
  items: Array<{ config: ResolvedBrand; products: CardProduct[] }>
  direction: "up" | "down"
  duration: number
  onSelect: (displayName: string) => void
}

function BrandColumn({ items, direction, duration, onSelect }: ColumnProps) {
  const repeated = [...items, ...items, ...items]

  return (
    <div className="relative flex-1 overflow-hidden">
      <motion.div
        className="flex flex-col gap-3"
        animate={{ y: direction === "up" ? [0, "-33.333%"] : ["-33.333%", 0] }}
        transition={{
          duration,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
        }}
      >
        {repeated.map(({ config }, idx) => (
          <BrandCard
            key={`${config.key}-${idx}`}
            config={config}
            onClick={() => onSelect(config.displayName)}
          />
        ))}
      </motion.div>
    </div>
  )
}

// ─── main ──────────────────────────────────────────────────────────────────

type Props = {
  allProducts: CardProduct[]
}

export default function ShopByBrand({ allProducts }: Props) {
  const router = useRouter()

  const brandMap = useMemo(() => {
    const map = new Map<string, { config: ResolvedBrand; products: CardProduct[] }>()
    for (const product of allProducts) {
      if (!product.brand) continue
      const key = normalizeBrand(product.brand)
      if (!key || !BRAND_CONFIG[key]) continue
      if (!map.has(key)) {
        map.set(key, { config: getBrandConfig(product.brand), products: [] })
      }
      map.get(key)!.products.push(product)
    }
    return [...map.entries()]
      .filter(([, v]) => v.products.length >= MIN_PRODUCTS_TO_SHOW)
      .sort((a, b) => b[1].products.length - a[1].products.length)
      .map(([, v]) => v)
  }, [allProducts])

  if (brandMap.length === 0) return null

  const mobileColumns = buildColumns(brandMap, 2)
  const tabletColumns = buildColumns(brandMap, 3)
  const desktopColumns = buildColumns(brandMap, 4)

  const DIRECTIONS: Array<"up" | "down"> = ["up", "down", "up", "down"]
  const DURATIONS = [22, 18, 26, 20]

  const maskStyle: React.CSSProperties = {
    height: "480px",
    maskImage:
      "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
    WebkitMaskImage:
      "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
  }

  function handleBrandClick(displayName: string) {
    router.push(`/brands/${encodeURIComponent(displayName)}`)
  }

  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeader
          title="Shop by Brand"
          subtitle="Explore products from the brands you trust"
        />

        {/* mobile: 2 animated columns */}
        <div className="flex sm:hidden gap-3 overflow-hidden" style={maskStyle}>
          {mobileColumns.map((col, i) => (
            <BrandColumn
              key={i}
              items={col}
              direction={DIRECTIONS[i]}
              duration={DURATIONS[i]}
              onSelect={handleBrandClick}
            />
          ))}
        </div>

        {/* tablet: 3 animated columns */}
        <div className="hidden sm:flex lg:hidden gap-3 overflow-hidden" style={maskStyle}>
          {tabletColumns.map((col, i) => (
            <BrandColumn
              key={i}
              items={col}
              direction={DIRECTIONS[i]}
              duration={DURATIONS[i]}
              onSelect={handleBrandClick}
            />
          ))}
        </div>

        {/* desktop: 4 animated columns */}
        <div className="hidden lg:flex gap-3 overflow-hidden" style={maskStyle}>
          {desktopColumns.map((col, i) => (
            <BrandColumn
              key={i}
              items={col}
              direction={DIRECTIONS[i]}
              duration={DURATIONS[i]}
              onSelect={handleBrandClick}
            />
          ))}
        </div>

        {/* bottom CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center sm:text-left">
            Looking for a specific brand? Browse the full lineup.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/brands"
              className="px-5 py-2.5 rounded-xl text-sm font-black border border-gray-200 text-gray-900 transition-colors hover:bg-gray-100"
            >
              All brands
            </Link>
            <Link
              href="/shop"
              className="px-5 py-2.5 rounded-xl text-sm font-black text-white transition-opacity hover:opacity-90 flex items-center gap-1.5"
              style={{ backgroundColor: "var(--theme-primary)" }}
            >
              Browse all products
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}