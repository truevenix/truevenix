//src/app/(root)/category/page.tsx
import { db } from "@/lib/db"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import CategoryIcon from "@/components/categories/CategoryIcon"
import Navbar from "@/components/layout/Navbar"

export const metadata = {
  title: "Shop by Category | Truevenix Nigeria",
  description: "Browse all product categories on Truevenix Nigeria — Power Banks, Earbuds, Solar Panels, Inverters, Cables and more.",
}

const DIVISION_LABELS: Record<string, string> = {
  GADGETS: "Gadgets",
  SOLAR: "Solar & Energy",
  ELECTRONICS: "Electronics",
  PHONES: "Phones",
  COMPUTERS: "Computers",
  MACHINERY: "Machinery",
}

async function getSubcategories() {
  const rows = await db.product.findMany({
    where: { subCategory: { not: null } },
    select: { category: true, subCategory: true },
    distinct: ["category", "subCategory"],
    orderBy: [{ category: "asc" }, { subCategory: "asc" }],
  })

  const grouped: Record<string, { subCategory: string; count: number }[]> = {}

  for (const row of rows) {
    if (!row.subCategory) continue
    const key = row.category as string
    if (!grouped[key]) grouped[key] = []

    const count = await db.product.count({
      where: {
        category: row.category,
        subCategory: row.subCategory,
      },
    })

    grouped[key].push({ subCategory: row.subCategory, count })
  }

  return grouped
}

export default async function CategoryPage() {
  const grouped = await getSubcategories()
  const divisions = Object.keys(grouped).filter((k) => grouped[k].length > 0)

  return (
    <>
        <Navbar/>
    <main className="min-h-screen bg-gray-50">
      {/* header */}
      <section
        className="px-4 py-10 md:py-16"
        style={{ backgroundColor: "var(--theme-primary-hover)" }}
      >
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white font-semibold">Categories</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Shop by Category
          </h1>
          <p className="text-white/60 text-sm mt-3 max-w-xl">
            Discover our wide range of products organised by category. Find exactly what you are looking for.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl text-sm font-black text-white border border-white/30 hover:bg-white/10 transition-colors"
          >
            View all products
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* categories grouped by division */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14 space-y-12">
        {divisions.map((divisionKey) => {
          const divisionLabel = DIVISION_LABELS[divisionKey] ?? divisionKey
          const subcats = grouped[divisionKey]

          return (
            <div key={divisionKey}>
              {/* division heading */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-1 h-6 rounded-full"
                  style={{ backgroundColor: "var(--theme-primary)" }}
                />
                <Link
                  href={`/shop?category=${divisionKey}`}
                  className="text-lg font-black hover:underline"
                  style={{ color: "var(--theme-text)" }}
                >
                  {divisionLabel}
                </Link>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "var(--theme-primary-light)",
                    color: "var(--theme-primary)",
                  }}
                >
                  {subcats.length} categor{subcats.length !== 1 ? "ies" : "y"}
                </span>
              </div>

              {/* subcategory cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {subcats.map(({ subCategory, count }) => {
                  const slug = encodeURIComponent(subCategory)
                  return (
                    <Link
                      key={subCategory}
                      href={`/category/${slug}`}
                      className="group relative overflow-hidden rounded-2xl border p-4 md:p-5 bg-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                      style={{ borderColor: "var(--theme-border)" }}
                    >
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                        style={{ boxShadow: "inset 0 0 0 1.5px var(--theme-primary)" }}
                      />

                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{ backgroundColor: "var(--theme-primary-light)" }}
                      >
                        <CategoryIcon
                          src={`/icons/${divisionKey.toLowerCase()}.svg`}
                          alt={subCategory}
                          className="w-5 h-5 object-contain"
                        />
                      </div>

                      <p
                        className="text-sm font-black leading-tight mb-1"
                        style={{ color: "var(--theme-text)" }}
                      >
                        {subCategory}
                      </p>
                      <p className="text-[11px] text-gray-400 mb-3">
                        {count} product{count !== 1 ? "s" : ""}
                      </p>

                      <div
                        className="inline-flex items-center gap-1 text-[11px] font-black"
                        style={{ color: "var(--theme-primary)" }}
                      >
                        Explore
                        <ArrowRight
                          size={11}
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-14">
        <div
          className="rounded-2xl p-8 md:p-12 text-center"
          style={{ backgroundColor: "var(--theme-bg)" }}
        >
          <p className="text-lg md:text-2xl font-black text-gray-900">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <p className="text-sm text-gray-500 mt-2 mb-6">
            Browse our entire collection or search for specific items.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/shop"
              className="px-6 py-2.5 rounded-xl text-sm font-black text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--theme-primary)" }}
            >
              All products
            </Link>
            <Link
              href="/brands"
              className="px-6 py-2.5 rounded-xl text-sm font-black border hover:bg-gray-100 transition-colors"
              style={{ borderColor: "var(--theme-border)", color: "var(--theme-text)" }}
            >
              Shop by brand
            </Link>
          </div>
        </div>
      </section>
    </main>
    </>
  )
}