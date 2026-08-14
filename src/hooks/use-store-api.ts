"use client"

import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
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

// Same filters as useProducts, but paginates by accumulating pages instead
// of replacing them — used for infinite-scroll product grids (e.g. /shop).
// `page` is managed internally via pageParam; don't pass it in filters.
export function useInfiniteProducts(filters: Omit<ProductListFilters, "page">) {
  return useInfiniteQuery({
    queryKey: ["products", "infinite", filters],
    queryFn: ({ pageParam }) => getProducts({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.pages
        ? lastPage.pagination.page + 1
        : undefined,
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