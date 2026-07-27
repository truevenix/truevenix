import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

export type WishlistItem = {
  id: string
  productId: string
  product: { id: string }
}

async function fetchWishlist() {
  const res = await fetch("/api/v1/wishlist")
  if (!res.ok) throw new Error("Failed to fetch wishlist")
  return res.json() as Promise<{ items: WishlistItem[] }>
}

async function toggleWishlist(productId: string) {
  const res = await fetch(`/api/v1/wishlist/${productId}`, { method: "POST" })
  if (!res.ok) throw new Error("Failed to toggle wishlist")
  return res.json() as Promise<{ wishlisted: boolean }>
}

export function useWishlist() {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
    enabled: !!session?.user,
  })
}

export function useWishlistIds(): Set<string> {
  const { data } = useWishlist()
  return new Set((data?.items ?? []).map((i) => i.product.id))
}

export function useToggleWishlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] })
    },
  })
}