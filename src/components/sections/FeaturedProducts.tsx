"use client"
// components/sections/FeaturedProducts.tsx
//
// Horizontal "Featured Products" rail. Lives at the bottom of HomeTabs,
// below the active-tab product grid. Independent of the tab state —
// always shows the same isFeatured=true set regardless of which
// category tab is active.

import { useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import ProductCard, { type CardProduct } from "@/components/products/ProductCard"
import { useTheme } from "@/providers/theme-provider"
import SectionHeader from "../SectionHeader"

type Props = {
  products: CardProduct[]
}

export default function FeaturedProducts({ products }: Props) {
  const { theme } = useTheme()
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  if (!products || products.length === 0) return null

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollerRef.current
    if (!el) return
    const amount = el.clientWidth * 0.8
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
  }

  return (
    <section className="w-full px-3 md:px-6 pb-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div className="flex items-center gap-2.5">
          
          <SectionHeader
                  title="Featured Products"
                  subtitle="Hand-picked products we think you'll love"
                />
        </div>

        {/* Desktop arrows */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scrollBy("left")}
            aria-label="Scroll left"
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scrollBy("right")}
            aria-label="Scroll right"
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Horizontal rail */}
      <div
        ref={scrollerRef}
        className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-1"
      >
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className="snap-start flex-shrink-0 w-[46%] sm:w-[32%] md:w-[24%] lg:w-[19%]"
          >
            <ProductCard product={product} delay={0} />
          </motion.div>
        ))}
      </div>

      {/* View all CTA */}
      <div className="flex justify-center mt-6">
        <Link href="/shop?featured=true">
          <span
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-opacity hover:opacity-90"
            style={{ background: theme.primary }}
          >
            View all featured products
            <ArrowRight size={16} />
          </span>
        </Link>
      </div>
    </section>
  )
}