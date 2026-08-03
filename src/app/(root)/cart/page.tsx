"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight, MapPin, Minus, Plus, RotateCcw, Shield, ShoppingBag, ShoppingCart, Trash2, Truck } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { formatPrice, useCart } from "@/context/cart-context"

const trustItems = [
  { icon: Truck, label: "Delivery support", sub: "Clear order updates" },
  { icon: Shield, label: "Secure checkout", sub: "Card or pay on delivery" },
  { icon: RotateCcw, label: "Easy help", sub: "Support after purchase" },
]

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
    deliveryFee,
    isAbujaResident,
    setIsAbujaResident,
  } = useCart()

  const total = totalPrice + deliveryFee

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
        <div className="flex max-w-sm flex-col items-center gap-5 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[var(--theme-primary-light)]">
            <ShoppingCart size={40} className="text-[var(--theme-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Your cart is empty</h1>
            <p className="mt-2 text-sm text-gray-500">
              Add a product and it will appear here ready for checkout.
            </p>
          </div>
          <Button asChild>
            <Link href="/shop">
              <ShoppingBag size={16} />
              Browse products
            </Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gray-50 px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto w-full max-w-7xl min-w-0">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[var(--theme-primary)]">
              Shopping cart
            </p>
            <h1 className="mt-1 text-2xl font-black text-gray-900 md:text-3xl">
              {totalItems} item{totalItems === 1 ? "" : "s"} selected
            </h1>
          </div>
          <button
            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-600"
            onClick={clearCart}
          >
            <Trash2 size={15} />
            Clear
          </button>
        </div>

        <div className="grid w-full min-w-0 gap-6 lg:grid-cols-[1fr_360px]">

          {/* Items list */}
          <section className="min-w-0 overflow-hidden rounded-2xl bg-white px-5 shadow-sm">
            {items.map((item) => (
              <motion.div
                key={item.cartKey}
                layout
                className="flex min-w-0 gap-4 border-b border-gray-100 py-5 last:border-0"
              >
                <Link
                  href={`/product/${item.id}`}
                  className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100"
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : null}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="min-w-0">
                    <Link
                      href={`/product/${item.id}`}
                      className="line-clamp-2 break-words font-bold text-gray-900 hover:text-[var(--theme-primary)]"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 truncate text-xs text-gray-500">
                      {item.brand ? `${item.brand} · ` : ""}
                      {item.category} · {item.imageColor}
                    </p>
                  </div>

                  <div className="mt-4 flex min-w-0 flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center rounded-xl border border-gray-200">
                      <button
                        className="flex h-9 w-9 items-center justify-center text-gray-500 hover:text-gray-900"
                        onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-black">
                        {item.quantity}
                      </span>
                      <button
                        className="flex h-9 w-9 items-center justify-center text-gray-500 hover:text-gray-900"
                        onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex min-w-0 items-center gap-4">
                      <span className="truncate text-lg font-black text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        className="flex-shrink-0 rounded-full bg-gray-100 p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        onClick={() => removeFromCart(item.cartKey)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </section>

          {/* Sidebar */}
          <aside className="h-fit min-w-0 space-y-4">
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="font-black text-gray-900">Order summary</h2>

              <div className="mt-4 space-y-3 text-sm">
                {/* Subtotal */}
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">{formatPrice(totalPrice)}</span>
                </div>

                {/* Delivery row */}
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  <span className="font-bold text-gray-900">
                    {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                  </span>
                </div>

                {/* Abuja resident toggle */}
                <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="shrink-0 text-[var(--theme-primary)]" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-gray-700">I live in Abuja</span>
                      <span className="text-[11px] text-gray-400">Free delivery for Abuja residents</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAbujaResident(!isAbujaResident)}
                    className="relative ml-3 h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200"
                    style={{
                      backgroundColor: isAbujaResident ? "var(--theme-primary)" : "#d1d5db",
                    }}
                    aria-label="Toggle Abuja resident discount"
                  >
                    <span
                      className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
                      style={{
                        transform: isAbujaResident ? "translateX(20px)" : "translateX(0)",
                      }}
                    />
                  </button>
                </div>

                {/* Free delivery nudge — only show if not already free */}
                {deliveryFee > 0 && totalPrice < 50000 && (
                  <p className="text-xs text-gray-400">
                    Add {formatPrice(50000 - totalPrice)} more for free delivery, or toggle Abuja above.
                  </p>
                )}

                {/* Total */}
                <div className="flex justify-between border-t border-gray-100 pt-3 text-lg font-black">
                  <span>Total</span>
                  <span className="text-[var(--theme-primary)]">{formatPrice(total)}</span>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-gray-400">
                Have a promo code? Add it at checkout.
              </p>

              {/* CTA */}
              <Button asChild className="mt-3 w-full">
                <Link href="/checkout">
                  Proceed to checkout
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Link
                href="/shop"
                className="mt-4 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[var(--theme-primary)]"
              >
                <ArrowLeft size={14} />
                Continue shopping
              </Link>
            </section>

            {/* Trust badges */}
            {trustItems.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--theme-primary-light)] text-[var(--theme-primary)]">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{sub}</p>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </main>
  )
}