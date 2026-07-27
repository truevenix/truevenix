"use client"

import Link from "next/link"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { formatPrice, useCart } from "@/context/cart-context"

export default function CartDrawer() {
  const {
    items,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart()

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex h-full flex-col bg-white p-0">
        <SheetHeader className="border-b border-gray-100 p-5">
          <SheetTitle className="flex items-center gap-2 text-gray-900">
            <ShoppingBag size={20} />
            Cart
          </SheetTitle>
          <SheetDescription>
            {totalItems > 0 ? `${totalItems} item${totalItems === 1 ? "" : "s"} ready for checkout.` : "Your cart is empty."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-gray-500">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <ShoppingBag size={28} />
              </div>
              <div>
                <p className="font-bold text-gray-900">No products yet</p>
                <p className="mt-1 text-sm">Add products from the store to start an order.</p>
              </div>
              <Button asChild variant="outline" onClick={() => setIsCartOpen(false)}>
                <Link href="/shop">Browse products</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.id}-${item.imageColor}`} className="flex gap-3 border-b border-gray-100 pb-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain p-2" />
                    ) : (
                      <div className="h-full w-full bg-gray-100" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-bold text-gray-900">{item.name}</p>
                        <p className="mt-1 text-xs text-gray-500">{item.imageColor}</p>
                      </div>
                      <button
                        className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center rounded-full border border-gray-200">
                        <button
                          className="flex h-8 w-8 items-center justify-center text-gray-500 hover:text-gray-900"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label={`Decrease ${item.name}`}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          className="flex h-8 w-8 items-center justify-center text-gray-500 hover:text-gray-900"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label={`Increase ${item.name}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-sm font-black text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t border-gray-100 p-5">
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-xl font-black text-gray-900">{formatPrice(totalPrice)}</span>
              </div>
              <Button asChild className="w-full" onClick={() => setIsCartOpen(false)}>
                <Link href="/checkout">Checkout Now</Link>
              </Button>
              <Button variant="ghost" className="w-full" onClick={clearCart}>
                Clear cart
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
