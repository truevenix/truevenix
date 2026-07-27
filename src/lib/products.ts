import type { CardProduct } from "@/components/products/ProductCard"
import type { ApiProduct } from "@/lib/api"
import type { ProductCategoryId } from "@/providers/theme-provider"

const VALID_CATEGORIES: ProductCategoryId[] = [
  "gadgets",
  "solar",
  "electronics",
  "phones",
  "computers",
]

export function toProductCategory(category: string): ProductCategoryId {
  const normalized = category.toLowerCase() as ProductCategoryId
  return VALID_CATEGORIES.includes(normalized) ? normalized : "gadgets"
}

export function toCardProduct(product: ApiProduct): CardProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    category: toProductCategory(product.category),
    subCategory: product.subCategory ?? undefined,
    brand: product.brand,
    inStock: product.inStock,
    badge: product.badge,
    warranty: product.warranty ?? undefined,
    images:
      product.images.length > 0
        ? product.images
        : [{ id: product.id, color: "Default", colorCode: "#475569", image: "" }],
  }
}
