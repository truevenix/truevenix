import Link from "next/link"
import { Search } from "lucide-react"
import ProductCard, { type CardProduct } from "@/components/products/ProductCard"
import { db } from "@/lib/db"
import { toProductCategory } from "@/lib/products"

type Props = {
  searchParams: Promise<{ q?: string }>
}

function toCardProduct(row: {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number | null
  category: string
  subCategory: string | null
  brand: string | null
  inStock: boolean
  badge: string | null
  warranty: string | null
  images: { id: string; color: string; colorCode: string; image: string }[]
}): CardProduct {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    originalPrice: row.originalPrice,
    category: toProductCategory(row.category),
    subCategory: row.subCategory ?? undefined,
    brand: row.brand,
    inStock: row.inStock,
    badge: row.badge,
    warranty: row.warranty ?? undefined,
    images:
      row.images.length > 0
        ? row.images
        : [{ id: row.id, color: "Default", colorCode: "#475569", image: "" }],
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams
  const query = q.trim()
  const keywords = [...new Set(query.split(/\s+/).filter(Boolean))]

  const rows = query
    ? await db.product.findMany({
        where: {
          OR: keywords.flatMap((keyword) => [
            { name: { contains: keyword, mode: "insensitive" } },
            { description: { contains: keyword, mode: "insensitive" } },
            { brand: { contains: keyword, mode: "insensitive" } },
            { subCategory: { contains: keyword, mode: "insensitive" } },
          ]),
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          originalPrice: true,
          category: true,
          subCategory: true,
          brand: true,
          inStock: true,
          badge: true,
          warranty: true,
          images: { select: { id: true, color: true, colorCode: true, image: true }, take: 3 },
        },
        take: 40,
      })
    : []

  const products = rows.map(toCardProduct)

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <Search size={17} className="text-[var(--theme-primary)]" />
            <p className="text-xs font-black uppercase tracking-widest text-[var(--theme-primary)]">Search results</p>
          </div>
          <h1 className="text-2xl font-black text-gray-900 md:text-3xl">
            {query ? `"${query}"` : "Search truevenix"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {query
              ? products.length === 0
                ? "No matching products found."
                : `${products.length} product${products.length === 1 ? "" : "s"} found.`
              : "Use the search bar to find products, brands, and categories."}
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} delay={index * 0.02} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="font-black text-gray-900">Nothing here yet</p>
            <p className="mt-1 text-sm text-gray-500">Try a different phrase or browse the full catalog.</p>
            <Link href="/shop" className="mt-5 inline-flex rounded-xl bg-[var(--theme-primary)] px-5 py-3 text-sm font-black text-white">
              Browse shop
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

export async function generateMetadata({ searchParams }: Props) {
  const { q = "" } = await searchParams
  return {
    title: q ? `"${q}" | truevenix Search` : "Search | truevenix",
  }
}
