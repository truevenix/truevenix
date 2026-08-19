// app/sitemap.ts
// Next.js App Router sitemap — auto-served at /sitemap.xml
// Covers: static pages, all products, brand pages, and category/subcategory pages.
// Priority and changeFrequency are tuned for an electronics e-commerce store.

import { MetadataRoute } from "next"
import { db } from "@/lib/db"

const BASE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://www.truevenix.com"
).replace(/\/$/, "") // strip trailing slash if any

// ── Helpers ───────────────────────────────────────────────────────────────────

type Frequency =
  | "always" | "hourly" | "daily"
  | "weekly" | "monthly" | "yearly" | "never"

function url(
  path: string,
  opts: {
    lastModified?: Date
    changeFrequency?: Frequency
    priority?: number
  } = {}
): MetadataRoute.Sitemap[number] {
  return {
    url:             `${BASE_URL}${path}`,
    lastModified:    opts.lastModified    ?? new Date(),
    changeFrequency: opts.changeFrequency ?? "weekly",
    priority:        opts.priority        ?? 0.7,
  }
}

// ── Product categories (divisions) — must stay in sync with page.tsx ─────────
const PRODUCT_CATEGORIES = [
  "gadgets",
  "solar",
  "electronics",
  "phones",
  "computers",
  "machinery",
] as const

// ── Main export ───────────────────────────────────────────────────────────────

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  // ── 1. Fetch all products from DB ─────────────────────────────────────────
  const products = await db.product.findMany({
    select: {
      id:         true,
      category:   true,
      inStock:    true,
      isFeatured: true,
      updatedAt:  true,
    },
    orderBy: { updatedAt: "desc" },
  })

  // ── 1b. Fetch distinct brands ──────────────────────────────────────────────
  // Only brands actually attached to a product are indexable — otherwise
  // /brands/[brand] 404s via notFound() and we'd be submitting dead URLs.
  const brandRows = await db.product.findMany({
    where: { brand: { not: null } },
    select: { brand: true, updatedAt: true },
    distinct: ["brand"],
    orderBy: { updatedAt: "desc" },
  })

  // ── 1c. Fetch distinct subcategories (with their parent division) ─────────
  // /category/[category] looks up by subCategory, not division, so that's
  // what needs to be enumerated here — matches CategoryPage's db.product.findFirst.
  const subCategoryRows = await db.product.findMany({
    where: { subCategory: { not: null } },
    select: { subCategory: true, updatedAt: true },
    distinct: ["subCategory"],
    orderBy: { updatedAt: "desc" },
  })

  // ── 2. Static pages ────────────────────────────────────────────────────────
  // Priority scale:
  //   1.0 = homepage
  //   0.9 = primary commercial page (shop)
  //   0.8 = supporting pages users frequently visit
  //   0.5 = informational pages (about, contact)
  //   0.3 = utility pages (search) — indexable but low value

  const staticPages: MetadataRoute.Sitemap = [

    // ── Homepage ──────────────────────────────────────────────────────────────
    url("/", {
      changeFrequency: "daily",
      priority:        1.0,
    }),

    // ── Primary commercial destination ────────────────────────────────────────
    url("/shop", {
      changeFrequency: "daily",
      priority:        0.9,
      lastModified:    products[0]?.updatedAt,
    }),

    // ── Supporting ────────────────────────────────────────────────────────────
    url("/categories", {
      changeFrequency: "weekly",
      priority:        0.8,
    }),
    url("/category", {
      changeFrequency: "weekly",
      priority:        0.8,
      lastModified:    subCategoryRows[0]?.updatedAt,
    }),
    url("/brands", {
      changeFrequency: "weekly",
      priority:        0.8,
      lastModified:    brandRows[0]?.updatedAt,
    }),
    url("/deals", {
      changeFrequency: "daily",
      priority:        0.8,
    }),

    // ── Informational ─────────────────────────────────────────────────────────
    url("/about-us", {
      changeFrequency: "monthly",
      priority:        0.5,
    }),
    url("/contact-us", {
      changeFrequency: "monthly",
      priority:        0.5,
    }),

    // ── Utility ───────────────────────────────────────────────────────────────
    // Search is indexable — Google can discover product names through it,
    // but it shouldn't compete with actual product pages in rankings.
    url("/search", {
      changeFrequency: "always",
      priority:        0.3,
    }),
  ]

  // ── 3. Product pages ───────────────────────────────────────────────────────
  // Featured + in-stock products get the highest priority (0.9).
  // Regular in-stock products get 0.8.
  // Out-of-stock products still get indexed (0.5) because they may come back
  // and we don't want to lose their accumulated link equity.

  const productPages: MetadataRoute.Sitemap = products.map(p => {
    const priority: number =
      p.isFeatured && p.inStock ? 0.9
      : p.inStock               ? 0.8
      :                           0.5

    const changeFrequency: Frequency = p.inStock ? "weekly" : "monthly"

    return url(`/product/${p.id}`, {
      lastModified: p.updatedAt,
      changeFrequency,
      priority,
    })
  })

  // ── 4. Category (division) landing pages ──────────────────────────────────
  // One URL per unique product category/division, e.g. /categories/solar
  // These are excellent landing pages for branded and intent-driven searches.
  // We use PRODUCT_CATEGORIES (the authoritative list from page.tsx) rather than
  // deriving from the DB — avoids exposing unknown/legacy category slugs.

  const categoryPages: MetadataRoute.Sitemap = PRODUCT_CATEGORIES.map(cat =>
    url(`/categories/${encodeURIComponent(cat)}`, {
      changeFrequency: "weekly",
      priority:        0.75,
    })
  )

  // ── 5. Subcategory pages ───────────────────────────────────────────────────
  // /category/[category] — one URL per distinct subCategory value.
  // These are strong long-tail SEO targets (e.g. /category/Power%20Banks).

  const subCategoryPages: MetadataRoute.Sitemap = subCategoryRows
    .filter(row => !!row.subCategory)
    .map(row =>
      url(`/category/${encodeURIComponent(row.subCategory as string)}`, {
        lastModified:    row.updatedAt,
        changeFrequency: "weekly",
        priority:        0.75,
      })
    )

  // ── 6. Brand pages ─────────────────────────────────────────────────────────
  // /brands/[brand] — one URL per distinct brand. High commercial intent:
  // shoppers frequently search "<brand> Nigeria" or "<brand> price".

  const brandPages: MetadataRoute.Sitemap = brandRows
    .filter(row => !!row.brand)
    .map(row =>
      url(`/brands/${encodeURIComponent(row.brand as string)}`, {
        lastModified:    row.updatedAt,
        changeFrequency: "weekly",
        priority:        0.8,
      })
    )

  // ── Combine — order matters: static first, then products (highest traffic),
  // then categories/subcategories/brands (landing/hub pages) ─────────────────
  return [
    ...staticPages,
    ...productPages,
    ...categoryPages,
    ...subCategoryPages,
    ...brandPages,
  ]
}