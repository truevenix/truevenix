// app/product.xml/route.ts
// Google Merchant Center / Shopping feed — auto-served at /product.xml
// Electronics-specific: no food/room fields, Firebase image URL normalisation,
// Google Product Taxonomy mapping, and hard skip of products with no valid image.

import { db } from "@/lib/db"

const BASE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://www.truevenix.com"
).replace(/\/$/, "") // strip trailing slash if any

// ── Google Product Taxonomy ────────────────────────────────────────────────────
// Full path strings are accepted by Google Merchant Center.
// Keep in sync with PRODUCT_CATEGORIES in app/page.tsx.

const GOOGLE_PRODUCT_CATEGORY: Record<string, string> = {
  gadgets:     "Electronics > Consumer Electronics",
  solar:       "Hardware > Electrical Equipment > Solar Energy Devices",
  electronics: "Electronics > Consumer Electronics",
  phones:      "Electronics > Communications > Telephony > Mobile Phones",
  accessories: "Electronics > Electronics Accessories",
  computers:   "Electronics > Computers",
  machinery:   "Hardware > Power & Electrical Supplies > Generators",
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeXML(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function parseKeyFeatures(value: unknown): string[] {
  if (Array.isArray(value))
    return value.filter(
      (v): v is string => typeof v === "string" && v.trim() !== ""
    )
  return []
}

function resolveImageUrl(raw: string): string | null {
  if (!raw || !raw.startsWith("http")) return null

  try {
    const u = new URL(raw)

    if (u.hostname === "firebasestorage.googleapis.com") {
      // Guarantee the response is the raw file, not a JSON metadata blob
      if (!u.searchParams.has("alt")) {
        u.searchParams.set("alt", "media")
      }
      // `new URL().toString()` re-encodes params correctly;
      // escapeXML() will then turn the & into &amp; for valid XML.
      return u.toString()
    }

    return raw
  } catch {
    // URL constructor threw — malformed string, skip it
    return null
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET() {
  const products = await db.product.findMany({
    include: {
      images: {
        take: 10,
        orderBy: { id: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const items = products
    .map((product) => {
      // ── Validate images first ──────────────────────────────────────────────
      // Resolve every image URL, discarding empty strings and bare Firebase
      // URLs that are missing ?alt=media.
      const validImages = product.images
        .map((img) => resolveImageUrl(img.image))
        .filter((u): u is string => u !== null)

      // Google requires at least one crawlable image per item.
      // Omit the product entirely rather than submitting a placeholder —
      // a placeholder that 404s worsens overall feed quality score.
      if (validImages.length === 0) return null

      const primaryImage     = escapeXML(validImages[0])
      const additionalImages = validImages.slice(1, 10) // Google max 10

      const productUrl = escapeXML(`${BASE_URL}/product/${product.id}`)

      // ── Pricing ────────────────────────────────────────────────────────────
      const hasSale =
        product.originalPrice !== null &&
        product.originalPrice > product.price

      // ── Product type path ──────────────────────────────────────────────────
      // Use subCategory for a more specific path, which helps Google Shopping
      // surface the product in narrower search queries.
      // e.g. "Solar > Inverters" rather than just "Solar"
      const productType = product.subCategory
        ? `${product.category} > ${product.subCategory}`
        : product.category

      // ── Google taxonomy ────────────────────────────────────────────────────
      const googleCategory =
        GOOGLE_PRODUCT_CATEGORY[product.category.toLowerCase()] ??
        "Electronics"

      // ── Key features ───────────────────────────────────────────────────────
      const keyFeatures = parseKeyFeatures(
        (product as Record<string, unknown>).keyFeatures
      )

      return `<item>
<g:id>${escapeXML(product.id)}</g:id>
<title>${escapeXML(product.name)}${product.brand ? ` by ${escapeXML(product.brand)}` : ""}</title>
<description>${escapeXML(product.description)}${keyFeatures.length > 0 ? ` | Features: ${escapeXML(keyFeatures.join(", "))}` : ""}</description>
<link>${productUrl}</link>
<g:image_link>${primaryImage}</g:image_link>
${additionalImages
  .map((img) => `<g:additional_image_link>${escapeXML(img)}</g:additional_image_link>`)
  .join("\n")}
<g:availability>${product.inStock ? "in stock" : "out of stock"}</g:availability>
${
  hasSale
    ? `<g:price>${product.originalPrice!.toFixed(2)} NGN</g:price>\n<g:sale_price>${product.price.toFixed(2)} NGN</g:sale_price>`
    : `<g:price>${product.price.toFixed(2)} NGN</g:price>`
}
<g:condition>new</g:condition>
<g:brand>${escapeXML(product.brand ?? "Truevenix")}</g:brand>
<g:google_product_category>${escapeXML(googleCategory)}</g:google_product_category>
<g:product_type>${escapeXML(productType)}</g:product_type>
<g:mpn>${escapeXML(product.id)}</g:mpn>
${product.isFeatured ? `<g:custom_label_0>featured</g:custom_label_0>` : ""}
${keyFeatures
  .map((f) => `<g:feature_description>${escapeXML(f)}</g:feature_description>`)
  .join("\n")}
</item>`
    })
    .filter(Boolean)
    .join("\n\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>Truevenix Electronics Products</title>
<link>${escapeXML(BASE_URL)}</link>
<description>Complete electronics catalog from Truevenix — solar, phones, gadgets, computers &amp; accessories in Nigeria</description>

${items}

</channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type":  "application/xml; charset=UTF-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
    },
  })
}