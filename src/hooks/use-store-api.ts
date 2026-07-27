"use client"

import { useQuery } from "@tanstack/react-query"
import {
  getProducts,
  getRelatedProducts,
  getSubcategories,
  type ProductListFilters,
} from "@/lib/api"

export function useProducts(filters: ProductListFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
    placeholderData: (previous) => previous,
  })
}

export function useRelatedProducts(productId: string, category?: string) {
  return useQuery({
    queryKey: ["products", "related", productId, category],
    queryFn: () => getRelatedProducts(productId, category),
    enabled: Boolean(productId),
  })
}

export function useSubcategories() {
  return useQuery({
    queryKey: ["subcategories"],
    queryFn: getSubcategories,
    staleTime: 5 * 60 * 1000,
  })
}