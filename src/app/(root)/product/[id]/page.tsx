//src/components/products/ProductDetailClient.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Zap,
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import ProductCard from "@/components/products/ProductCard"
import { buildCartKey, formatPrice, useCart } from "@/context/cart-context"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useRelatedProducts } from "@/hooks/use-store-api"
import { toCardProduct, toProductCategory } from "@/lib/products"
import {
  ALLOWED_INSTALLMENT_COUNTS,
  computeInstallmentAmounts,
  installmentDurationLabel,
  INSTALLMENT_TERMS_URL,
} from "@/lib/installments"
import ProductAskAI from "@/components/products/ProductAskAI"
import Image from "next/image"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProductImage = {
  id: string
  color: string
  colorCode: string
  image: string
}

type Review = {
  id: string
  rating: number
  comment: string
  createdDate: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}
type SizeOption = {
  id:        string
  label:     string
  name:      string
  price:     number
  imageUrl:   string | null
  isDefault: boolean
}

export type ProductDetail = {
  id: string
  name: string
  description: string
  descriptionP2: string | null
  descriptionP3: string | null
  price: number
  originalPrice: number | null
  brand: string | null
  category: string
  subCategory: string | null
  inStock: boolean
  stockCount: number
  badge: string | null
  warranty: string | null
  specifications: unknown
  keyFeatures?: string[] | null
  sizeOptions: SizeOption[]
  images: ProductImage[]
  reviews: Review[]
  avgRating: number
  reviewCount: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------



// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseKeyFeatures(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string" && v.trim() !== "")
  return []
}

function renderSpecifications(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([, item]) => item !== null && item !== undefined && item !== ""
  )
  if (entries.length === 0) return null
  return entries.map(([key, item]) => (
    <div key={key} className="flex gap-4 border-b border-gray-100 py-3 text-sm last:border-0">
      <span className="w-36 flex-shrink-0 font-bold capitalize text-gray-400">
        {key.replaceAll("_", " ")}
      </span>
      <span className="font-semibold text-gray-700">{String(item)}</span>
    </div>
  ))
}

function parseSpecificationsForAI(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)])
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h2 className="text-lg font-black text-gray-900">{children}</h2>
      <div className="h-px flex-1 bg-gray-100" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProductDetailClient({ product }: { product: ProductDetail }) {
  const { addToCart, isInCart } = useCart()
  const user = useCurrentUser()
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(product.images[0])
  const [quantity, setQuantity] = useState(1)
  const [wished, setWished] = useState(false)
  const [installmentCount, setInstallmentCount] = useState<2 | 3 | 4>(3)
  const [buyingWithInstallments, setBuyingWithInstallments] = useState(false)
  const defaultSize = product.sizeOptions?.find(s => s.isDefault)
  ?? product.sizeOptions?.[0]
  ?? null
const [selectedSize, setSelectedSize] = useState<SizeOption | null>(defaultSize)

// Price shown — size option price wins when one is selected
const displayPrice = selectedSize?.price ?? product.price
  const relatedQuery = useRelatedProducts(product.id, product.category)
  const related = (relatedQuery.data?.products ?? []).map(toCardProduct)
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  const category = toProductCategory(product.category)
  const keyFeatures = parseKeyFeatures(product.keyFeatures)
  const specs = renderSpecifications(product.specifications)

// derive the cart key for the currently selected state
const cartKey = buildCartKey(product.id, selectedSize?.name ?? null)
const alreadyInCart = isInCart(cartKey)

const handleAddToCart = () => {
  if (!product.inStock) return
  const price    = selectedSize?.price ?? product.price
  const itemName = selectedSize
  ? `${product.name} (${selectedSize.label} — ${selectedSize.name})`
  : product.name

  Array.from({ length: quantity }).forEach(() => {
    addToCart({
      cartKey,                                  // ← composite key
      id:             product.id,               // ← raw product ID for order payload
      name:           itemName,
      description:    product.description,
      category,
      brand:          product.brand ?? "",
      price,
      imageColor:     selectedImage?.color     ?? "Default",
      imageColorCode: selectedImage?.colorCode ?? "#475569",
      imageUrl:       selectedImage?.image     ?? "",
    })
  })

  toast.success(`${itemName} added to cart`, {
    description: `${quantity} item${quantity === 1 ? "" : "s"} — ${formatPrice(price * quantity)}`,
  })
}

// "Buy with installments" adds the current selection to the cart (same as
// Add to cart, silently — no toast, since we're navigating away immediately)
// then deep-links into checkout with the installment method + count
// pre-selected. If the shopper isn't signed in, we still go — checkout's
// installment section already shows a "sign in to continue" prompt inline.
const handleBuyWithInstallments = () => {
  if (!product.inStock || buyingWithInstallments) return
  setBuyingWithInstallments(true)

  const price = selectedSize?.price ?? product.price
  const itemName = selectedSize
    ? `${product.name} (${selectedSize.label} — ${selectedSize.name})`
    : product.name

  Array.from({ length: quantity }).forEach(() => {
    addToCart({
      cartKey,
      id: product.id,
      name: itemName,
      description: product.description,
      category,
      brand: product.brand ?? "",
      price,
      imageColor: selectedImage?.color ?? "Default",
      imageColorCode: selectedImage?.colorCode ?? "#475569",
      imageUrl: selectedImage?.image ?? "",
    })
  })

  router.push(`/checkout?method=installment&count=${installmentCount}`)
}

  return (
    <main className="min-h-screen bg-gray-50 pb-20 md:pb-0">

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 text-xs font-semibold text-gray-400 md:px-6">
          <Link href="/" className="flex items-center gap-1 hover:text-[var(--theme-primary)]">
            <ChevronLeft size={13} />
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[var(--theme-primary)]">Shop</Link>
          <span>/</span>
          <Link
            href={`/shop?category=${category}`}
            className="capitalize hover:text-[var(--theme-primary)]"
          >
            {product.category.toLowerCase()}
          </Link>
          <span>/</span>
          <span className="truncate text-gray-700">{product.name}</span>
        </div>
      </div>

      {/* Hero: image + purchase panel */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-6 md:grid-cols-2 md:px-6 md:py-10">

        {/* Images */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-square overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
          >
            {selectedImage?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <Image
                src={selectedImage.image}
                alt={product.name}
                className="h-full w-full object-contain p-6"
                fill
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">No image</div>
            )}
            {discount ? (
              <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white">
                {discount}% off
              </span>
            ) : null}
            <button
              onClick={() => setWished((c) => !c)}
              className="absolute right-4 top-4 rounded-full bg-white p-3 shadow-md"
              aria-label="Add to wishlist"
            >
              <Heart
                size={17}
                className={wished ? "fill-red-500 text-red-500" : "text-gray-400"}
              />
            </button>
          </motion.div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.slice(0, 5).map((image) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(image)}
                  className="aspect-square overflow-hidden rounded-xl border-2 bg-white"
                  style={{
                    borderColor:
                      selectedImage?.id === image.id ? "var(--theme-primary)" : "#e5e7eb",
                  }}
                  title={image.color}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <Image
                    src={image.image}
                    alt={image.color}
                    className="h-full w-full object-contain p-2"
                    fill
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase panel */}
        <div className="space-y-5">
          <div>
          
            <h1 className="mt-2 text-2xl font-black leading-tight text-gray-900 ">
              {product.name}
            </h1>
            {product.brand && (
              <p className="mt-2 text-sm font-semibold text-gray-500">{product.brand}</p>
            )}
          </div>

          {/* Rating + stock */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={15}
                  className={
                    star <= Math.round(product.avgRating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200"
                  }
                />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-700">
              {product.avgRating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
            <span
              className={`ml-auto rounded-full px-3 py-1 text-xs font-black ${
                product.inStock
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {product.inStock ? "In stock" : "Out of stock"}
            </span>
          </div>

          {/* Price */}
          <div className="flex flex-wrap items-end gap-3 border-y border-gray-100 py-4">
            <span className="text-3xl font-black text-[var(--theme-primary)]">
              {formatPrice(displayPrice)}
            </span>
            {product.originalPrice && (
              <span className="text-lg font-bold text-gray-300 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {product.warranty && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
                {product.warranty} warranty
              </span>
            )}
          </div>

          {/* Variant picker */}
          {product.images.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-black text-gray-700">
                Variant:{" "}
                <span className="font-semibold text-gray-500">{selectedImage?.color}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.images.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(image)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border-2"
                    style={{
                      borderColor:
                        selectedImage?.id === image.id ? "var(--theme-primary)" : "#e5e7eb",
                      background: image.colorCode,
                    }}
                    title={image.color}
                  >
                    {selectedImage?.id === image.id && (
                      <Check size={15} className="text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
              {/* Size / Variant Options */}
{/* Size / Variant Options */}
{product.sizeOptions && product.sizeOptions.length > 0 && (
  <div>
    <p className="mb-2 text-sm font-black text-gray-700">
      {product.sizeOptions[0]?.label.replace(/[A-Z0-9]+\d*/g, "").trim() || "Variant"}:{" "}
      <span className="font-semibold text-gray-500">
        {selectedSize ? `${selectedSize.label} — ${selectedSize.name}` : "None selected"}
      </span>
    </p>
    <div className="flex flex-wrap gap-2">
      {product.sizeOptions.map((option) => {
        const isSelected = selectedSize?.id === option.id
        return (
          <button
            key={option.id}
            onClick={() => setSelectedSize(option)}
            className={[
              "rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all text-left",
              isSelected
                ? "border-[var(--theme-primary)] bg-[var(--theme-primary)] text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-700 hover:border-[var(--theme-primary)]/60",
            ].join(" ")}
          >
            <span className="block text-[10px] font-black uppercase tracking-wider opacity-70">
              {option.label}
            </span>
            <span className="block">{option.name}</span>
            <span className={["text-xs font-semibold", isSelected ? "text-white/80" : "text-gray-400"].join(" ")}>
              {formatPrice(option.price)}
            </span>
          </button>
        )
      })}
    </div>
  </div>
)}
          {/* Quantity */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-xl border border-gray-200 bg-white">
              <button
                className="flex h-11 w-11 items-center justify-center text-gray-500"
                onClick={() => setQuantity((c) => Math.max(1, c - 1))}
              >
                <Minus size={15} />
              </button>
              <span className="w-12 text-center font-black">{quantity}</span>
              <button
                className="flex h-11 w-11 items-center justify-center text-gray-500"
                onClick={() => setQuantity((c) => c + 1)}
              >
                <Plus size={15} />
              </button>
            </div>
            <span className="text-sm font-semibold text-gray-500">
              Total{" "}
              <span className="text-gray-900">{formatPrice(displayPrice * quantity)}</span>
            </span>
          </div>

          {/* CTA */}
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[var(--theme-primary)] px-6 py-4 text-sm font-black text-white shadow-lg disabled:opacity-50"
            >
              <ShoppingCart size={17} />
              {alreadyInCart ? "Add more" : "Add to cart"}
            </button>
            <Link
              href="/checkout"
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[var(--theme-primary)] px-6 py-4 text-sm font-black text-[var(--theme-primary)]"
            >
              <Zap size={17} />
              Checkout
            </Link>
          </div>

          {/* Pay in installments — lets a shopper see + start a BNPL
              checkout right from the product page, without adding to cart
              and navigating to checkout first to discover the option. */}
          <div
            className="rounded-2xl border-2 border-dashed p-4"
            style={{
              borderColor: "color-mix(in srgb, var(--theme-primary) 35%, transparent)",
              backgroundColor: "color-mix(in srgb, var(--theme-primary) 5%, white)",
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Calendar size={16} style={{ color: "var(--theme-primary)" }} />
              <p className="text-sm font-black text-gray-800">Pay in installments</p>
            </div>

            <div className="mb-3 grid grid-cols-4 gap-2">
              {ALLOWED_INSTALLMENT_COUNTS.map((n) => {
                const selected = installmentCount === n
                const amounts = computeInstallmentAmounts(displayPrice * quantity, n)
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setInstallmentCount(n)}
                    className="flex flex-col items-center gap-0.5 rounded-xl border-2 py-2 transition-all"
                    style={{
                      borderColor: selected ? "var(--theme-primary)" : "#e5e7eb",
                      backgroundColor: selected
                        ? "color-mix(in srgb, var(--theme-primary) 10%, white)"
                        : "white",
                    }}
                  >
                    <span className="text-xs font-extrabold text-gray-800">{n}x</span>
                    <span className="text-[10px] text-gray-500">{formatPrice(amounts[0])}</span>
                  </button>
                )
              })}
            </div>

            <p className="mb-3 text-center text-[11px] font-medium text-gray-600">
              {installmentDurationLabel(installmentCount)}
            </p>

            <button
              onClick={handleBuyWithInstallments}
              disabled={!product.inStock || buyingWithInstallments}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: "var(--theme-primary)" }}
            >
              <CreditCard size={15} />
              {buyingWithInstallments
                ? "Redirecting…"
                : `Buy now — ${formatPrice(computeInstallmentAmounts(displayPrice * quantity, installmentCount)[0])} today`}
            </button>

            <p className="mt-2 text-center text-[11px] text-gray-500">
              {user
                ? "First payment today via Paystack. Pay the rest anytime from your profile."
                : "You'll need to sign in at checkout to use installments."}
            </p>

            <a
              href={INSTALLMENT_TERMS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-center text-[11px] font-semibold underline"
              style={{ color: "var(--theme-primary)" }}
            >
              Read our terms for installment payment
            </a>
          </div>

        </div>
      </section>

      {/* ── Below-the-fold content ──────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl space-y-6 px-4 pb-12 md:px-6">

        {/* AI Ask — placed first for mobile shoppers */}
        <ProductAskAI
          product={{
            name:           product.name,
            brand:          product.brand,
            category:       product.category,
            subCategory:    product.subCategory,
            price:          product.price,
            originalPrice:  product.originalPrice,
            warranty:       product.warranty,
            inStock:        product.inStock,
            description:    product.description,
            keyFeatures:    parseKeyFeatures(product.keyFeatures),
            specifications: parseSpecificationsForAI(product.specifications),
          }}
        />

        {/* Description */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <SectionHeading>About this product</SectionHeading>

          {/* <p className="max-w-3xl text-sm leading-7 text-gray-600">{product.description}</p>
        */}
        <div className="max-w-3xl space-y-4">
  {[product.description, product.descriptionP2, product.descriptionP3]
    .filter(Boolean)
    .map((para, i) => (
      <p key={i} className="text-sm leading-7 text-gray-600">{para}</p>
    ))}
</div>
        </div>

        {/* Key features */}
        {keyFeatures.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <SectionHeading>Key features</SectionHeading>
            <ul className="grid gap-3 sm:grid-cols-2">
              {keyFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ background: "var(--theme-primary-light)" }}
                  >
                    <ChevronRight size={12} style={{ color: "var(--theme-primary)" }} />
                  </span>
                  <span className="text-sm font-semibold text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Specifications */}
        {specs && (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <SectionHeading>Specifications</SectionHeading>
            <div className="max-w-3xl">{specs}</div>
          </div>
        )}


 {product.reviews.length > 0 && (
   <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <SectionHeading>
            Customer reviews
            {product.reviewCount > 0 && (
              <span className="ml-2 text-sm font-semibold text-gray-400">
                ({product.reviewCount})
              </span>
            )}
          </SectionHeading>

          {product.reviews.length > 0 ? (
            <>
              {/* Summary bar */}
              <div className="mb-6 flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
                <div className="text-center">
                  <p className="text-4xl font-black text-gray-900">
                    {product.avgRating.toFixed(1)}
                  </p>
                  <div className="mt-1 flex justify-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={13}
                        className={
                          star <= Math.round(product.avgRating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 text-gray-200"
                        }
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {product.reviewCount} review{product.reviewCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="h-16 w-px bg-gray-200" />
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = product.reviews.filter((r) => r.rating === star).length
                    const pct = product.reviews.length
                      ? Math.round((count / product.reviews.length) * 100)
                      : 0
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="w-3 text-right text-xs font-bold text-gray-400">
                          {star}
                        </span>
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-7 text-xs text-gray-400">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {product.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-gray-100 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {review.user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={review.user.image}
                            alt={review.user.name ?? "Customer"}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-black text-gray-400">
                            {(review.user.name ?? "C").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <p className="font-black text-gray-900">
                          {review.user.name ?? "Customer"}
                        </p>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={
                              star <= review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-gray-200 text-gray-200"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{review.comment}</p>
                    <p className="mt-2 text-xs text-gray-300">
                      {new Date(review.createdDate).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              No reviews yet — be the first to share your experience.
            </p>
          )}
        </div>
         )}

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[var(--theme-primary)]">
                  Related picks
                </p>
                <h2 className="mt-1 text-2xl font-black text-gray-900">
                  More from this category
                </h2>
              </div>
              <Link
                href={`/shop?category=${category}`}
                className="text-sm font-black text-[var(--theme-primary)]"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {related.slice(0, 5).map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}