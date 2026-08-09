// app/page.tsx
// Server component — Navbar is in layout.tsx, not here.

import { Suspense } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BadgePercent,
  ShieldCheck,
  Truck,
  Headphones,
  RefreshCw,
} from "lucide-react"
import HomeTabs        from "@/components/sections/Hometab"
import ShopByBrand     from "@/components/Shopbybrand"
import { db }          from "@/lib/db"
import { type CardProduct }       from "@/components/products/ProductCard"
import { type ProductCategoryId } from "@/providers/theme-provider"
import ShopByCategory from "@/components/ShopByCategory"
import Navbar from "@/components/layout/Navbar"


export const revalidate = 60

function StoreStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "OnlineStore",
          name: "truevenix",
          url: "https://www.truevenix.com",
        }), 
      }}
    />
  )
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type DBProduct = {
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
  isFeatured: boolean
  images: { id: string; color: string; colorCode: string; image: string }[]
}

// ─────────────────────────────────────────────
// CATEGORY CONFIG
// Must stay in sync with ProductCategoryId in theme-provider.tsx
// ─────────────────────────────────────────────

const PRODUCT_CATEGORIES: ProductCategoryId[] = [
  "gadgets",
  "solar",
  "electronics",
  "phones",
  "computers",
]

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function dbProductToCardProduct(p: DBProduct): CardProduct {
  return {
    id:           p.id,
    name:         p.name,
    description:  p.description,
    price:        p.price,
    originalPrice: p.originalPrice,
    category:     p.category as ProductCategoryId,
    subCategory:  p.subCategory ?? undefined,
    brand:        p.brand,
    inStock:      p.inStock,
    badge:        p.badge,
    images:
      p.images.length > 0
        ? p.images
        : [{ id: p.id, color: "Default", colorCode: "#0e1521", image: "" }],
  }
}


// ─────────────────────────────────────────────
// TRUST STRIP
// ─────────────────────────────────────────────

const TRUST_ITEMS = [
  { icon: Truck,       title: "Free Delivery",    desc: "On orders above ₦50,000", color: "#1a5c38", bg: "#EAF3DE" },
  { icon: ShieldCheck, title: "Genuine Products",  desc: "100% authentic guarantee", color: "#1E40AF", bg: "#EFF6FF" },
  { icon: RefreshCw,   title: "Easy Returns",      desc: "7-day return policy",      color: "#C0392B", bg: "#FDF0EF" },
  { icon: Headphones,  title: "24/7 Support",      desc: "Always here to help you",  color: "#7C3AED", bg: "#F5F3FF" },
]

function TrustStrip() {
  return (
    <div className="mx-3 md:mx-6 my-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TRUST_ITEMS.map(({ icon: Icon, title, desc, color, bg }) => (
          <div
            key={title}
            className="flex items-center gap-3 rounded-xl p-3 md:p-4 border"
            style={{ background: bg, borderColor: `${color}30` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}18` }}
            >
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-xs md:text-sm leading-tight">{title}</p>
              <p className="text-gray-500 text-[10px] md:text-xs leading-tight">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// BRANDS STRIP
// ─────────────────────────────────────────────

const BRANDS = [
  { name: "Samsung",  logo: "/brands/samsung.svg"  },
  { name: "Apple",    logo: "/brands/apple.svg"    },
  { name: "Tecno",    logo: "/brands/tecno.svg"    },
  { name: "Infinix",  logo: "/brands/infinix.svg"  },
  { name: "HP",       logo: "/brands/hp.svg"       },
  { name: "Felicity", logo: "/brands/felicity.svg" },
  { name: "JBL",      logo: "/brands/jbl.svg"      },
  { name: "Dell",     logo: "/brands/dell.svg"     },
]

function BrandsStrip() {
  return (
    <div className="mx-3 md:mx-6 my-6">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">
        Top Brands We Carry
      </p>
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-1">
        {BRANDS.map((brand) => (
          <Link
            key={brand.name}
            href={`/shop?brand=${brand.name.toLowerCase()}`}
            className="flex-shrink-0 flex items-center justify-center h-12 px-5 bg-white border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all"
            title={brand.name}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.logo}
              alt={brand.name}
              className="h-6 w-auto object-contain grayscale hover:grayscale-0 transition-all"
            />
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// SKELETON (shown while ProductsSection awaits)
// Matches the hero + tab + grid shape so there's no layout shift
// ─────────────────────────────────────────────

function HomeTabsSkeleton() {
  return (
    <div className="w-full animate-pulse">
      {/* Hero placeholder */}
      <div className="h-[160px] sm:h-[210px] md:h-[260px] lg:h-[320px] w-full bg-gray-200" />

      {/* Tab buttons placeholder */}
      <div className="px-3 py-4 md:px-6">
        <div className="flex gap-2 md:grid md:grid-cols-7 md:gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 rounded-2xl bg-gray-100 min-w-[80px] md:min-w-0 h-[80px] md:h-[100px]"
            />
          ))}
        </div>
      </div>

      {/* Product grid placeholder */}
      <div className="px-3 md:px-6 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-100 h-[320px]" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// PRODUCTS SECTION (async server component)
// ─────────────────────────────────────────────

async function ProductsSection() {
  let rows: DBProduct[] = []

  try {
    rows = await db.product.findMany({
      select: {
        id:            true,
        name:          true,
        description:   true,
        price:         true,
        originalPrice: true,
        category:      true,
        subCategory:   true,
        brand:         true,
        inStock:       true,
        badge:         true,
        isFeatured:    true,
        images: {
          select: { id: true, color: true, colorCode: true, image: true },
          take: 3,
        },
      },
      orderBy: { createdAt: "desc" },
    })
  } catch (err) {
    console.error("❌ ProductsSection DB error:", err)
    // Renders something instead of a frozen skeleton
    return (
      <div className="p-8 text-center text-sm text-red-500">
        Failed to load products. Please refresh.
      </div>
    )
  }


  // Initialise every category bucket as an empty array
  const products = Object.fromEntries(
    PRODUCT_CATEGORIES.map((cat) => [cat, [] as CardProduct[]])
  ) as Record<ProductCategoryId, CardProduct[]>

  // Flat list of all products — passed to ShopByBrand
  const allProducts: CardProduct[] = []

  for (const row of rows) {
    const cat = row.category.toLowerCase() as ProductCategoryId
    const card = dbProductToCardProduct(row)

    allProducts.push(card)

    if (PRODUCT_CATEGORIES.includes(cat)) {
      products[cat].push(card)
    } else {
      console.warn(
        `⚠️ Product "${row.name}" dropped from tabs — unknown category: "${row.category}"`
      )
    }
  }

  return (
    <>
      <HomeTabs products={products} />
      <ShopByBrand allProducts={allProducts} />
    </>
  )
}

// ─────────────────────────────────────────────
// PAGE
// Order: HomeTabs (hero + tabs + products) → TrustStrip → ShopByBrand (inside ProductsSection)
// ─────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <Navbar/>
    <main className="min-h-screen bg-gray-50">

      {/* ① HomeTabs first — contains hero Swiper + category tabs + products */}
      {/* ShopByBrand is rendered inside ProductsSection after HomeTabs */}
      <Suspense fallback={<HomeTabsSkeleton />}>
        <ProductsSection />
      </Suspense>

      <TrustStrip />
      <ShopByCategory />
    </main>
    </>
  )
}