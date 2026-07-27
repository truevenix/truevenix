export const SITE_NAME = "truevenix"
export const DEFAULT_SITE_DESCRIPTION =
  "Shop authentic Accessories, Gadgets, electronics, gadgets, solar products, phones, computers, and accessories from truevenix."

export function getSiteUrl() {
  const rawUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://truevenix.com"

  return rawUrl.replace(/\/$/, "")
}

export function absoluteUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return `${getSiteUrl()}/`

  try {
    return new URL(pathOrUrl).toString()
  } catch {
    return new URL(
      pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`,
      getSiteUrl()
    ).toString()
  }
}

export function compactText(value: string, maxLength: number) {
  const text = value.replace(/\s+/g, " ").trim()
  if (text.length <= maxLength) return text

  const clipped = text.slice(0, maxLength - 1)
  const lastSpace = clipped.lastIndexOf(" ")

  return `${clipped
    .slice(0, lastSpace > 80 ? lastSpace : clipped.length)
    .trim()}...`
}

// -----------------------------------------------------------------------------
// PRODUCT HELPERS (FEATURES + SPECIFICATIONS ADDED)
// -----------------------------------------------------------------------------

export function parseKeyFeatures(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (v): v is string => typeof v === "string" && v.trim() !== ""
    )
  }
  return []
}

export function parseSpecifications(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)])
  )
}

// -----------------------------------------------------------------------------

export function productMetaTitle(product: {
  name: string
  brand?: string | null
  category?: string | null
}) {
  const brand = product.brand ? `${product.brand} ` : ""
  const category = product.category
    ? ` ${product.category.toLowerCase()}`
    : ""

  return compactText(
    `${brand}${product.name}${category} | Buy Online at ${SITE_NAME}`,
    60
  )
}

export function productMetaDescription(product: {
  name: string
  description: string
  brand?: string | null
  price?: number
  inStock?: boolean
  keyFeatures?: unknown
  specifications?: unknown
}) {
  const features = parseKeyFeatures(product.keyFeatures)
    .slice(0, 3)
    .join(" • ")

  const specs = Object.entries(parseSpecifications(product.specifications))
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ")

  const parts = [
    product.brand ? `${product.brand} ${product.name}` : product.name,
    product.description,
    features,
    specs,
    product.price
      ? `Price: ${new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
          maximumFractionDigits: 0,
        }).format(product.price)}.`
      : "",
    product.inStock
      ? "Available from truevenix."
      : "Currently out of stock at truevenix.",
  ]

  return compactText(parts.filter(Boolean).join(" "), 155)
}

export function safeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}