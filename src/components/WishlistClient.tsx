"use client"

import { motion } from "framer-motion"
import { Heart, Trash2 } from "lucide-react"
import ProductCard from "@/components/products/ProductCard"
import { useTheme } from "@/providers/theme-provider"
import { useWishlist, useToggleWishlist, WishlistItem } from "@/hooks/use-wishlist"
import { toCardProduct } from "@/lib/products"
import { ApiProduct } from "@/lib/api"



function ProductSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="h-44 bg-gray-100" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 rounded bg-gray-100" />
        <div className="h-4 w-3/4 rounded bg-gray-100" />
        <div className="h-10 rounded-xl bg-gray-100" />
      </div>
    </div>
  )
}

export default function WishlistClient() {
  const { theme } = useTheme()
  const wishlistQuery = useWishlist()
  const toggleWishlist = useToggleWishlist()

  const items: WishlistItem[] = wishlistQuery.data?.items ?? []
  const products = items.map((i) => toCardProduct(i.product as ApiProduct))

  const handleClearAll = () => {
    items.forEach((i) =>
      toggleWishlist.mutate(i.product.id)
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* header */}
      <section
        className="px-4 py-10 md:px-6 md:py-14"
        style={{ backgroundColor: theme.primaryHover }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <Heart size={20} className="text-white fill-white" />
            </div>
            <p
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: theme.border }}
            >
              Your wishlist
            </p>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mt-2 leading-tight">
            Saved Products
          </h1>
          <p className="text-white/60 text-sm mt-2">
            {wishlistQuery.isPending
              ? "Loading your wishlist..."
              : items.length === 0
              ? "You have not saved any products yet"
              : `${items.length} product${items.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>
      </section>

      {/* content */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-10">
        {wishlistQuery.isPending ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl bg-white py-24 text-center shadow-sm"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <Heart size={28} style={{ color: theme.primary }} />
            </div>
            <p className="font-black text-gray-900 text-lg">
              Your wishlist is empty
            </p>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
              Browse our store and tap the heart icon on any product to save it here.
            </p>
            <a
              href="/shop"
              className="mt-6 px-6 py-2.5 rounded-xl text-sm font-black text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: theme.primary }}
            >
              Browse products
            </a>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-gray-500">
                {products.length} saved product{products.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={handleClearAll}
                disabled={toggleWishlist.isPending}
                className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                <Trash2 size={13} />
                Clear all
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              {products.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  delay={idx * 0.03}
                />
              ))}
            </motion.div>
          </>
        )}
      </section>
    </main>
  )
}