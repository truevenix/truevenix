import { db } from "@/lib/db"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { BRAND_CONFIG } from "@/components/Shopbybrand"

export const metadata = {
  title: "Shop by Brand | Truevenix Nigeria",
  description:
    "Browse all brands available on Truevenix Nigeria — Oraimo, Itel, JBL, New Age, Jinko, Felicity and more.",
}

async function getBrandsWithCount() {
  const rows = await db.product.findMany({
    where: { brand: { not: null } },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  })

  const brands = rows.map((r) => r.brand).filter(Boolean) as string[]

  const brandsWithCount = await Promise.all(
    brands.map(async (brand) => ({
      brand,
      count: await db.product.count({
        where: { brand: { equals: brand, mode: "insensitive" } },
      }),
      config: BRAND_CONFIG[brand.trim().toLowerCase()],
    }))
  )

  return brandsWithCount
}

export default async function BrandsPage() {
  const brandsWithCount = await getBrandsWithCount()

  return (
    <main className="min-h-screen bg-gray-50">
      {/* header */}
      <section
        className="px-4 py-10 md:py-16"
        style={{ backgroundColor: "var(--theme-primary-hover)" }}
      >
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white font-semibold">Brands</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Shop by Brand
          </h1>
          <p className="text-white/60 text-sm mt-3 max-w-xl">
            Browse products from all the trusted brands available on Truevenix Nigeria.
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

      {/* brands grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {brandsWithCount.map(({ brand, count, config }) => {
            const logo = config?.logo ?? ""
            const initials = brand
              .split(/\s+/)
              .map((w) => w[0]?.toUpperCase() ?? "")
              .slice(0, 2)
              .join("")

            return (
              <Link
                key={brand}
                href={`/brands/${encodeURIComponent(brand)}`}
                className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-xl"
                style={{ backgroundColor: "var(--theme-primary)" }}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200 pointer-events-none" />

                {/* logo */}
                <div className="flex items-center justify-center px-5 py-7">
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logo}
                      alt={`${brand} logo`}
                      className="max-h-14 w-auto object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-3xl font-black text-white drop-shadow">
                      {initials}
                    </span>
                  )}
                </div>

                {/* bottom label */}
                <div
                  className="px-3 py-2.5 text-center"
                  style={{ backgroundColor: "var(--theme-primary-hover)" }}
                >
                  <p className="text-xs font-black text-white leading-none truncate">
                    {brand}
                  </p>
                  <p className="text-[10px] text-white/70 mt-0.5">
                    {count} product{count !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-14">
        <div
          className="rounded-2xl p-8 md:p-12 text-center"
          style={{ backgroundColor: "var(--theme-bg)" }}
        >
          <p className="text-lg md:text-2xl font-black text-gray-900">
            Can&apos;t find your preferred brand?
          </p>
          <p className="text-sm text-gray-500 mt-2 mb-6">
            Browse our entire collection of products across all brands.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/shop"
              className="px-6 py-2.5 rounded-xl text-sm font-black text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--theme-primary)" }}
            >
              All products
            </Link>
            <Link
              href="/category"
              className="px-6 py-2.5 rounded-xl text-sm font-black border transition-colors hover:bg-gray-100"
              style={{ borderColor: "var(--theme-border)", color: "var(--theme-text)" }}
            >
              Shop by category
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}