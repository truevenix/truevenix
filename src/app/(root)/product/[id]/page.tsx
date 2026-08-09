import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { db } from "@/lib/db"
import ProductDetailClient, { type ProductDetail } from "@/components/products/ProductDetailClient"
import {
  SITE_NAME,
  absoluteUrl,
  compactText,
  productMetaDescription,
  productMetaTitle,
  safeJsonLd,
} from "@/lib/seo"

type Props = {
  params: Promise<{ id: string }>
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function parseKeyFeatures(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string" && v.trim() !== "")
  return []
}

function parseSpecifications(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)])
  )
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getProduct(id: string): Promise<ProductDetail | null> {
  const product = await db.product.findUnique({
    where: { id },
    include: {
      images: true,
      sizeOptions: {
      orderBy: [{ isDefault: "desc" }, { price: "asc" }],
    },
      reviews: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdDate: "desc" },
      },
    },
  })

  if (!product) return null

  const aggregate = await db.review.aggregate({
    where: { productId: id },
    _avg: { rating: true },
    _count: { rating: true },
  })

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    descriptionP2: product.descriptionP2,
    descriptionP3: product.descriptionP3,
    price: product.price,
    originalPrice: product.originalPrice,
    brand: product.brand,
    category: product.category,
    subCategory: product.subCategory,
    inStock: product.inStock,
    stockCount: product.stockCount,
    badge: product.badge,
    warranty: product.warranty,
    specifications: product.specifications,
    keyFeatures: product.keyFeatures as unknown as string[] | null,
    images: product.images,
    sizeOptions:   product.sizeOptions,
    avgRating: aggregate._avg.rating ?? 0,
    reviewCount: aggregate._count.rating,
    reviews: product.reviews.map((review) => ({
      ...review,
      createdDate: review.createdDate.toISOString(),
    })),
  }
}

// ---------------------------------------------------------------------------
// SEO helpers
// ---------------------------------------------------------------------------

function productUrl(productId: string) {
  return absoluteUrl(`/product/${productId}`)
}

function productImages(product: Pick<ProductDetail, "images">) {
  const images = product.images
    .map((image) => absoluteUrl(image.image))
    .filter(Boolean)

  return images.length > 0 ? images : [absoluteUrl("/slide1.png")]
}

function productKeywords(product: ProductDetail) {
  // Flatten key features into individual keyword tokens
  const featureKeywords = parseKeyFeatures(product.keyFeatures).flatMap((f) =>
    f.split(",").map((k) => k.trim())
  )

  // Extract spec values (e.g. "40000mAh", "22.5W", "OPB-7400Q")
  const specKeywords = Object.values(parseSpecifications(product.specifications)).flatMap((v) =>
    v.split(",").map((k) => k.trim())
  )

  return Array.from(
    new Set(
      [
        product.name,
        product.brand,
        product.category,
        product.subCategory,
        "buy online",
        "truevenix",
        "electronics",
        "Nigeria",
        ...featureKeywords,
        ...specKeywords,
      ]
        .filter(Boolean)
        .map((keyword) => String(keyword))
    )
  )
}

/** Enriches the base description with top 3 key features + top 3 specs for meta/OG use */
function buildMetaDescription(product: ProductDetail): string {
  const base = productMetaDescription(product)

  const features = parseKeyFeatures(product.keyFeatures).slice(0, 3).join(" · ")

  const specs = Object.entries(parseSpecifications(product.specifications))
    .slice(0, 3)
    .map(([key, val]) => `${key.replaceAll("_", " ")}: ${val}`)
    .join(", ")

    const variantSummary = product.sizeOptions && product.sizeOptions.length > 0
    ? `Available in ${product.sizeOptions.length} variants: ${product.sizeOptions.map(o => o.name).join(", ")}`
    : null

  return [base, variantSummary, features, specs].filter(Boolean).join(" | ")
}

// ---------------------------------------------------------------------------
// Structured data
// ---------------------------------------------------------------------------

function ProductStructuredData({ product }: { product: ProductDetail }) {
  const url = productUrl(product.id)
  const images = productImages(product)
  const category = product.category.toLowerCase()
  const features = parseKeyFeatures(product.keyFeatures)
  const specs = parseSpecifications(product.specifications)

  // Merge key features into the JSON-LD description so Google indexes them
  const structuredDescription = [
    compactText(product.description, 4800),
    features.length > 0 ? `Features: ${features.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join(" | ")

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: structuredDescription,
    image: images,
    sku: product.id,
    category,
    url,
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "NGN",
      price: product.price.toFixed(2),
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
        url: absoluteUrl("/"),
      },
    },
  }

  // Specs as additionalProperty — Google uses these for rich result tech spec panels
  if (Object.keys(specs).length > 0) {
    productJsonLd.additionalProperty = Object.entries(specs).map(([key, val]) => ({
      "@type": "PropertyValue",
      name: key.replaceAll("_", " "),
      value: val,
    }))
  }

  if (product.reviewCount > 0 && product.avgRating > 0) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.avgRating.toFixed(1),
      reviewCount: product.reviewCount,
      bestRating: "5",
      worstRating: "1",
    }
  }

  if (product.reviews.length > 0) {
    productJsonLd.review = product.reviews.slice(0, 5).map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.user.name ?? "truevenix customer",
      },
      datePublished: review.createdDate,
      reviewBody: review.comment,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: "5",
        worstRating: "1",
      },
    }))
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: absoluteUrl("/shop"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category,
        item: absoluteUrl(`/shop?category=${category}`),
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: url,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  return (
    <>
      <ProductStructuredData product={product} />
      <ProductDetailClient product={product} />
    </>
  )
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await db.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { id: "asc" },
      },
      sizeOptions: { orderBy: [{ isDefault: "desc" }, { price: "asc" }] },
      reviews: {
        select: { rating: true },
      },
    },
  })

  if (!product) {
    return {
      title: "Product not found",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0

  const detail: ProductDetail = {
    id: product.id,
    name: product.name,
    description: product.description,
    descriptionP2: product.descriptionP2,
    descriptionP3: product.descriptionP3,
    price: product.price,
    originalPrice: product.originalPrice,
    brand: product.brand,
    category: product.category,
    subCategory: product.subCategory,
    inStock: product.inStock,
    stockCount: product.stockCount,
    badge: product.badge,
    warranty: product.warranty,
    specifications: product.specifications,
    keyFeatures: product.keyFeatures as unknown as string[] | null,
    sizeOptions: product.sizeOptions,
    images: product.images,
    avgRating,
    reviewCount: product.reviews.length,
    reviews: [],
  }

  const title = productMetaTitle(detail)
  // Enriched description: base + top 3 features + top 3 specs
  const description = buildMetaDescription(detail)
  const canonical = productUrl(product.id)
  const images = productImages(detail)
  const primaryImage = images[0]

  return {
    title,
    description,
    // Keywords: name + brand + category + feature tokens + spec value tokens
    keywords: productKeywords(detail),
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: canonical,
      images: images.map((image, index) => ({
        url: image,
        width: 1200,
        height: 630,
        alt: index === 0 ? product.name : `${product.name} product image ${index + 1}`,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [primaryImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    other: {
      "product:price:amount": product.price.toFixed(2),
      "product:price:currency": "NGN",
      "product:availability": product.inStock ? "in stock" : "out of stock",
      "og:price:amount": product.price.toFixed(2),
      "og:price:currency": "NGN",
    },
  }
}