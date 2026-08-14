"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay } from "swiper/modules"
import "swiper/css"
import {
  ShoppingCart, Star, Heart, Check, Zap, Package, Cpu, Smartphone,
  Headphones, Monitor,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCart, formatPrice, buildCartKey } from "@/context/cart-context"
import { toast } from "sonner"
import { CATEGORY_THEMES, useTheme, type ProductCategoryId } from "@/providers/theme-provider"
import { useWishlistIds, useToggleWishlist } from "@/hooks/use-wishlist"

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type CardProduct = {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number | null
  category: ProductCategoryId
  subCategory?: string
  brand: string | null
  inStock: boolean
  isFeatured?: boolean 
  badge: string | null
  avgRating?: number
  reviewCount?: number
  warranty?: string
  images: {
    id: string
    color: string
    colorCode: string
    image: string
  }[]
}

// ─────────────────────────────────────────────
// BADGE CONFIG
// ─────────────────────────────────────────────

const BADGE_STYLES: Record<string, string> = {
  new: "bg-blue-500 text-white",
  sale: "bg-red-500 text-white",
  hot: "bg-orange-500 text-white",
  bestseller: "bg-emerald-500 text-white",
  limited: "bg-purple-500 text-white",
}

const BADGE_LABELS: Record<string, string> = {
  new: "New",
  sale: "Sale",
  hot: "Hot",
  bestseller: "Best Seller",
  limited: "Limited",
}

// ─────────────────────────────────────────────
// CATEGORY ICONS
// ─────────────────────────────────────────────

const CATEGORY_ICONS: Record<ProductCategoryId, typeof Zap> = {
  gadgets:     Package,
  solar:       Zap,
  electronics: Cpu,
  phones:      Smartphone,
  computers:   Monitor,
  machinery:   Package,
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

type Props = {
  product: CardProduct
  delay?: number
}

export default function ProductCard({ product, delay = 0 }: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  const { addToCart, isInCart } = useCart()
  const [added, setAdded] = useState(false)

  const { activeTab } = useTheme()
  const theme = CATEGORY_THEMES[activeTab] ?? CATEGORY_THEMES[product.category] ?? CATEGORY_THEMES.gadgets
  const CategoryIcon = CATEGORY_ICONS[product.category] ?? Package

  // wishlist
  const wishlistIds = useWishlistIds()
  const toggleWishlist = useToggleWishlist()
  const wished = wishlistIds.has(product.id)

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  const rating = product.avgRating ?? 0
  const reviewCount = product.reviewCount ?? 0
  const primaryImage = product.images[0]

  const badgeStyle = product.badge ? (BADGE_STYLES[product.badge] ?? "bg-gray-500 text-white") : ""
  const badgeLabel = product.badge
    ? product.badge === "sale" && discount
      ? `${discount}% Off`
      : (BADGE_LABELS[product.badge] ?? product.badge)
    : ""

  const cartKey = buildCartKey(product.id)
  const alreadyInCart = isInCart(cartKey)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!product.inStock || !primaryImage) return

    addToCart({
      cartKey,
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      brand: product.brand ?? "",
      price: product.price,
      imageColor: primaryImage.color,
      imageColorCode: primaryImage.colorCode,
      imageUrl: primaryImage.image,
    })

    toast.success(`${product.name} added to cart`, {
      description: `${primaryImage.color} — ${formatPrice(product.price)}`,
      duration: 2000,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleWish = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!session?.user) {
      router.push("/login")
      return
    }

    toggleWishlist.mutate(product.id, {
      onSuccess: (data) => {
        toast.success(data.wishlisted ? "Added to wishlist" : "Removed from wishlist")
      },
      onError: () => {
        toast.error("Could not update wishlist. Please try again.")
      },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3 }}
      className="group relative bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
      onClick={() => router.push(`/product/${product.id}`)}
    >
      {/* ── Image area ── */}
      <div className="relative h-36 md:h-48 overflow-hidden flex-shrink-0" style={{ background: theme.bg }}>
        {product.images.length > 0 ? (
          <Swiper
            modules={[Autoplay]}
            slidesPerView={1}
            loop={product.images.length > 1}
            autoplay={{ delay: 2800, disableOnInteraction: false }}
            className="h-full w-full"
          >
            {product.images.map((img, idx) => (
              <SwiperSlide key={img.id ?? idx}>
                <div className="relative w-full h-36 md:h-48">
                  <Image
                    src={img.image || "/placeholder.png"}
                    alt={`${product.name} — ${img.color}`}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CategoryIcon size={48} style={{ color: theme.primary }} className="opacity-30" />
          </div>
        )}

        {/* Badge */}
        {product.badge && badgeStyle && (
          <span className={`absolute top-2 left-2 z-10 text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${badgeStyle}`}>
            {badgeLabel}
          </span>
        )}

        {/* Discount badge (shown when no named badge) */}
        {discount && !product.badge && (
          <span className="absolute top-2 left-2 z-10 text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-red-500 text-white">
            -{discount}%
          </span>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white px-2 py-1 rounded-full border border-gray-200 shadow-sm">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWish}
          disabled={toggleWishlist.isPending}
          className="absolute top-2 right-2 z-20 w-6 h-6 md:w-7 md:h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform disabled:opacity-60"
        >
          <Heart
            size={11}
            className={
              wished
                ? "fill-red-500 text-red-500"
                : "text-gray-400"
            }
          />
        </button>

        {/* In-cart indicator */}
        {alreadyInCart && (
          <div
            className="absolute bottom-2 left-2 z-10 flex items-center gap-1 text-white rounded-full px-2 py-0.5"
            style={{ background: theme.primary }}
          >
            <Check size={9} />
            <span className="text-[9px] font-bold">In cart</span>
          </div>
        )}
      </div>

      {/* ── Details ── */}
      <div className="flex flex-col gap-1 p-2.5 md:p-3.5 flex-1">
        {/* Brand & category pill */}
        <div className="flex items-center gap-2 flex-wrap">
          {product.brand && (
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              {product.brand}
            </span>
          )}
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize"
            style={{ background: theme.primaryLight, color: theme.primary }}
          >
            {product.category}
          </span>
        </div>

        {/* Name */}
        <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
          {product.name}
        </p>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={9}
                  className={
                    s <= Math.round(rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-200 fill-gray-200"
                  }
                />
              ))}
            </div>
            <span className="text-[9px] md:text-[10px] text-gray-400 leading-none">({reviewCount})</span>
          </div>
        )}

        {/* Warranty */}
        {product.warranty && (
          <span className="text-[10px] text-gray-400">{product.warranty} warranty</span>
        )}

        {/* Price row */}
        <div className="flex items-baseline gap-1 mt-auto pt-1">
          <span
            className="text-sm md:text-base font-extrabold leading-none"
            style={{ color: theme.primary }}
          >
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] md:text-xs text-gray-400 line-through leading-none">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full mt-1.5 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold flex items-center justify-center gap-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-white"
          style={{
            background: added || alreadyInCart ? theme.primaryHover : theme.primary,
          }}
        >
          <ShoppingCart size={11} className="md:w-3.5 md:h-3.5" />
          {added ? "Added ✓" : alreadyInCart ? "In Cart" : "Add to Cart"}
        </motion.button>
      </div>
    </motion.div>
  )
}