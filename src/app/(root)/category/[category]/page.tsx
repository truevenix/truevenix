//src/app/(root)/category/[category]/page.tsx
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toCardProduct } from "@/lib/products"
import CategoryProductsClient from "@/components/categories/CategoryProductsClient"

type Props = { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props) {
  const { category } = await params
  const decoded = decodeURIComponent(category)
  return {
    title: `${decoded} in Nigeria | Truevenix`,
    description: `Shop the best ${decoded} in Nigeria at Truevenix. Genuine products, fast delivery, warranty included.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const decoded = decodeURIComponent(category)

  // find which division this subcategory belongs to
  const sample = await db.product.findFirst({
    where: { subCategory: { equals: decoded, mode: "insensitive" } },
    select: { category: true },
  })

  if (!sample) notFound()

  const products = await db.product.findMany({
    where: { subCategory: { equals: decoded, mode: "insensitive" } },
    include: {
      images: { select: { id: true, color: true, colorCode: true, image: true } },
      sizeOptions: {
        select: { id: true, label: true, name: true, price: true, isDefault: true },
      },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  })

  // other subcategories in the same division
  const siblingsRaw = await db.product.findMany({
    where: {
      category: sample.category,
      subCategory: { not: decoded, mode: "insensitive" },
    },
    select: { subCategory: true },
    distinct: ["subCategory"],
  })

  const siblings = siblingsRaw
    .map((s) => s.subCategory)
    .filter(Boolean) as string[]

  const cardProducts = products.map(toCardProduct)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* header */}
      <section
        className="px-4 py-10 md:py-14"
        style={{ backgroundColor: "var(--theme-primary-hover)" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/category" className="hover:text-white transition-colors">
              Categories
            </Link>
            <span>/</span>
            <span className="text-white font-semibold">{decoded}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
            {decoded}
          </h1>
          <p className="text-white/60 text-sm mt-2">
            {products.length} product{products.length !== 1 ? "s" : ""} available
          </p>

          <Link
            href="/category"
            className="inline-flex items-center gap-2 mt-5 text-xs font-bold text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={13} />
            Back to categories
          </Link>
        </div>
      </section>

      {/* products */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <CategoryProductsClient products={cardProducts} category={decoded} />
      </section>

      {/* sibling categories in same division */}
      {siblings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 pb-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-black text-gray-900">
              More in this section
            </p>
            <Link
              href="/category"
              className="text-xs font-bold"
              style={{ color: "var(--theme-primary)" }}
            >
              View all
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {siblings.map((sub) => (
              <Link
                key={sub}
                href={`/category/${encodeURIComponent(sub)}`}
                className="px-4 py-2 rounded-full border text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors bg-white"
                style={{ borderColor: "var(--theme-border)" }}
              >
                {sub}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-14">
        <div
          className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: "var(--theme-bg)" }}
        >
          <p className="font-black text-gray-900">Discover more amazing products</p>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Can&apos;t find what you need in {decoded}? Browse our entire collection.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/shop"
              className="px-6 py-2.5 rounded-xl text-sm font-black text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--theme-primary)" }}
            >
              Browse all products
            </Link>
            <Link
              href="/category"
              className="px-6 py-2.5 rounded-xl text-sm font-black border hover:bg-gray-100 transition-colors"
              style={{ borderColor: "var(--theme-border)", color: "var(--theme-text)" }}
            >
              All categories
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}