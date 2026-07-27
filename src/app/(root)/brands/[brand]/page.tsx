import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BRAND_CONFIG } from "@/components/Shopbybrand"
import { toCardProduct } from "@/lib/products"
import BrandProductsClient from "@/components/BrandProductsClient"

type Props = { params: Promise<{ brand: string }> }

export async function generateMetadata({ params }: Props) {
  const { brand } = await params
  const decoded = decodeURIComponent(brand)
  const config = BRAND_CONFIG[decoded.trim().toLowerCase()]
  return {
    title: `${decoded} Products in Nigeria | Truevenix`,
    description: `Shop all ${decoded} products in Nigeria at the best prices on Truevenix. Fast delivery, genuine products, warranty included.`,
    openGraph: {
      title: `${decoded} Products in Nigeria | Truevenix`,
      description: `Shop all ${decoded} products in Nigeria at the best prices on Truevenix.`,
      images: config?.banner ? [{ url: config.banner }] : [],
    },
  }
}

export default async function BrandPage({ params }: Props) {
  const { brand } = await params
  const decoded = decodeURIComponent(brand)

  const brandKey = decoded.trim().toLowerCase()
  const config =
    BRAND_CONFIG[brandKey] ??
    BRAND_CONFIG[
      Object.keys(BRAND_CONFIG).find(
        (key) => BRAND_CONFIG[key].displayName.toLowerCase() === brandKey
      ) ?? ""
    ]

  const banner = config?.banner ?? null

  const products = await db.product.findMany({
    where: { brand: { equals: decoded, mode: "insensitive" } },
    include: {
      images: { select: { id: true, color: true, colorCode: true, image: true } },
      sizeOptions: {
        select: { id: true, label: true, name: true, price: true, isDefault: true },
      },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  })

  if (products.length === 0) notFound()

  const otherBrands = await db.product.findMany({
    where: { brand: { not: decoded, mode: "insensitive" } },
    select: { brand: true },
    distinct: ["brand"],
    take: 6,
  })

  const cardProducts = products.map(toCardProduct)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── header ── */}
      {banner ? (
        // with banner — fixed height so absolute image fills correctly
        <section className="relative overflow-hidden h-[280px] md:h-[360px]">
          {/* banner image — absolutely fills the fixed-height container */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner}
            alt={`${decoded} banner`}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* gradient overlay for text readability */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.10) 100%)",
            }}
          />

          {/* content sits at the bottom of the fixed height */}
          <div className="absolute inset-0 flex flex-col justify-end max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10 w-full">
            <nav className="flex items-center gap-2 text-xs text-white/60 mb-5">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link href="/brands" className="hover:text-white transition-colors">Brands</Link>
              <span>/</span>
              <span className="text-white font-semibold">{decoded}</span>
            </nav>

            <div className="flex items-center gap-4 mb-4">
              {config?.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={config.logo}
                  alt={decoded}
                  className="h-14 md:h-16 w-auto object-contain drop-shadow-lg"
                />
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight drop-shadow">
                  {decoded}
                </h1>
                {config?.tagline && (
                  <p className="text-white/80 text-sm mt-0.5 font-medium">
                    {config.tagline}
                  </p>
                )}
                <p className="text-white/60 text-xs mt-1">
                  {products.length} product{products.length !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>

            <Link
              href="/brands"
              className="inline-flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition-colors w-fit"
            >
              <ArrowLeft size={13} />
              Back to brands
            </Link>
          </div>
        </section>
      ) : (
        // no banner — solid theme color header
        <section
          className="relative px-4 py-10 md:py-14"
          style={{ backgroundColor: "var(--theme-primary-hover)" }}
        >
          <div className="max-w-7xl mx-auto">
            <nav className="flex items-center gap-2 text-xs text-white/60 mb-5">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link href="/brands" className="hover:text-white transition-colors">Brands</Link>
              <span>/</span>
              <span className="text-white font-semibold">{decoded}</span>
            </nav>

            <div className="flex items-center gap-4 mb-4">
              {config?.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={config.logo}
                  alt={decoded}
                  className="h-14 md:h-16 w-auto object-contain drop-shadow-lg"
                />
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight drop-shadow">
                  {decoded}
                </h1>
                {config?.tagline && (
                  <p className="text-white/80 text-sm mt-0.5 font-medium">
                    {config.tagline}
                  </p>
                )}
                <p className="text-white/60 text-xs mt-1">
                  {products.length} product{products.length !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>

            <Link
              href="/brands"
              className="inline-flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition-colors w-fit"
            >
              <ArrowLeft size={13} />
              Back to brands
            </Link>
          </div>
        </section>
      )}

      {/* ── products ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-black text-gray-900">
            All {decoded} products
          </p>
          <span className="text-xs font-semibold text-gray-400">
            {products.length} result{products.length !== 1 ? "s" : ""}
          </span>
        </div>
        <BrandProductsClient products={cardProducts} brand={decoded} />
      </section>

      {/* ── other brands ── */}
      {otherBrands.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 pb-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-black text-gray-900">Explore other brands</p>
            <Link
              href="/brands"
              className="text-xs font-bold"
              style={{ color: "var(--theme-primary)" }}
            >
              View all
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {otherBrands.map(
              (b) =>
                b.brand && (
                  <Link
                    key={b.brand}
                    href={`/brands/${encodeURIComponent(b.brand)}`}
                    className="px-4 py-2 rounded-full border text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors bg-white"
                    style={{ borderColor: "var(--theme-border)" }}
                  >
                    {b.brand}
                  </Link>
                )
            )}
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-14">
        <div
          className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: "var(--theme-bg)" }}
        >
          <p className="font-black text-gray-900">Discover more amazing products</p>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Can&apos;t find what you need from {decoded}? Browse our entire collection.
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
              href="/brands"
              className="px-6 py-2.5 rounded-xl text-sm font-black border hover:bg-gray-100 transition-colors"
              style={{ borderColor: "var(--theme-border)", color: "var(--theme-text)" }}
            >
              All brands
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}