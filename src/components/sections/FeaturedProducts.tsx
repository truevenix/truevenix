"use client"
// components/sections/FeaturedProducts.tsx
//
// "Featured Products" section. Rendered on the homepage after
// ShopByCategory, fed by its own isFeatured=true DB query in page.tsx.
// Laid out as a normal product grid, same as the tab-driven grid in
// HomeTabs — just a fixed, curated set of up to 16 products.

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import ProductCard, { type CardProduct } from "@/components/products/ProductCard"
import { useTheme } from "@/providers/theme-provider"
import SectionHeader from "../SectionHeader"

type Props = {
  products: CardProduct[]
}

export default function FeaturedProducts({ products }: Props) {
  const { theme } = useTheme()

  if (!products || products.length === 0) return null

  const displayProducts = products.slice(0, 16)

  return (
    <section className="w-full px-3 md:px-6 pb-10">
      <SectionHeader
        title="Featured Products"
        subtitle="Hand-picked products we think you'll love"
      />

      {/* Product grid — same shape as the HomeTabs grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {displayProducts.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
          >
            <ProductCard product={product} delay={0} />
          </motion.div>
        ))}
      </div>

      {/* View all CTA */}
      <div className="flex justify-center mt-8">
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