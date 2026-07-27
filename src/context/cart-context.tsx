"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface CartItem {
  cartKey: string // unique: "productId" or "productId:variantName"
  id: string // raw product ID (for the order payload)
  name: string
  description: string
  category: string
  brand: string
  price: number
  quantity: number
  imageColor: string
  imageColorCode: string
  imageUrl: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, "quantity">) => void
  removeFromCart: (cartKey: string) => void
  updateQuantity: (cartKey: string, quantity: number) => void
  clearCart: () => void
  isInCart: (cartKey: string) => boolean
  getItemQuantity: (cartKey: string) => number
  totalItems: number
  totalPrice: number

  deliveryFee: number
  isAbujaResident: boolean
  setIsAbujaResident: (value: boolean) => void

  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "truevenix-cart"
const DELIVERY_STORAGE_KEY = "truevenix-delivery"

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAbujaResident, setIsAbujaResident] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load cart and delivery preference
  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY)
    const storedDelivery = localStorage.getItem(DELIVERY_STORAGE_KEY)

    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart))
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY)
      }
    }

    if (storedDelivery) {
      try {
        setIsAbujaResident(JSON.parse(storedDelivery))
      } catch {
        localStorage.removeItem(DELIVERY_STORAGE_KEY)
      }
    }

    setIsHydrated(true)
  }, [])

  // Persist cart
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, isHydrated])

  // Persist Abuja delivery switch
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(
        DELIVERY_STORAGE_KEY,
        JSON.stringify(isAbujaResident)
      )
    }
  }, [isAbujaResident, isHydrated])

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.cartKey === item.cartKey)

      if (existing) {
        return prev.map((i) =>
          i.cartKey === item.cartKey
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }

      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (cartKey: string) => {
    setItems((prev) => prev.filter((i) => i.cartKey !== cartKey))
  }

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(cartKey)
      return
    }

    setItems((prev) =>
      prev.map((i) =>
        i.cartKey === cartKey
          ? { ...i, quantity }
          : i
      )
    )
  }

  const clearCart = () => setItems([])

  const isInCart = (cartKey: string) =>
    items.some((i) => i.cartKey === cartKey)

  const getItemQuantity = (cartKey: string) =>
    items.find((i) => i.cartKey === cartKey)?.quantity ?? 0

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const deliveryFee =
    isAbujaResident || totalPrice >= 50000 || totalPrice === 0
      ? 0
      : 2500

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        getItemQuantity,
        totalItems,
        totalPrice,

        deliveryFee,
        isAbujaResident,
        setIsAbujaResident,

        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }

  return context
}

export const formatPrice = (price: number) =>
  `₦ ${price.toLocaleString("en-NG")}`

// Builds the cart key — call this anywhere you need to derive the key
export function buildCartKey(
  productId: string,
  variantName?: string | null
): string {
  return variantName ? `${productId}:${variantName}` : productId
}