export type ProductListFilters = {
  q?: string
  category?: string
  brand?: string
  badge?: string
  inStock?: boolean
  minPrice?: number
  maxPrice?: number
  sortBy?: "createdAt" | "price" | "name"
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

export type ApiProduct = {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number | null
  category: string
  subCategory: string | null
  brand: string | null
  inStock: boolean
  stockCount: number
  badge: string | null
  isFeatured: boolean
  warranty: string | null
  images: Array<{
    id: string
    color: string
    colorCode: string
    image: string
  }>
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error || "Something went wrong. Please try again.")
  }

  return payload as T
}

function productQuery(filters: ProductListFilters) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value))
    }
  })

  const query = params.toString()
  return query ? `?${query}` : ""
}

export function getProducts(filters: ProductListFilters = {}) {
  return apiRequest<{
    products: ApiProduct[]
    pagination: { page: number; limit: number; total: number; pages: number }
  }>(`/products${productQuery(filters)}`)
}

export function getRelatedProducts(productId: string, category?: string) {
  return apiRequest<{ products: ApiProduct[] }>(
    `/products/${productId}/related${productQuery({ category, limit: 10 })}`
  )
}

export function getSubcategories() {
  return apiRequest<{ subcategories: Record<string, string[]> }>("/subcategories")
}