import {
  Cpu,
  Headphones,
  LayoutGrid,
  Monitor,
  Package,
  Smartphone,
  Wrench,
  Zap,
} from "lucide-react"

export type truevenixCategoryId =
  | "all"
  | "gadgets"
  | "solar"
  | "electronics"
  | "phones"
  | "computers"
  | "machinery"

export type ProductCategoryId = Exclude<truevenixCategoryId, "all">

export const CATEGORY_SLIDES: Array<{
  id: truevenixCategoryId
  image: string
  alt: string
  icon: typeof Zap
  labels: {
    heading: string
    name: string
    productName: string
  }
  color: string
  light: string
}> = [
  {
    id: "all",
    image: "/slide1.png",
    alt: "truevenix Electronics Store",
    icon: LayoutGrid,
    labels: { heading: "All Products", name: "All", productName: "Product" },
    color: "#111827",
    light: "#F3F4F6",
  },
  {
    id: "gadgets",
    image: "/slide1.png",
    alt: "Gadgets & Smart Devices",
    icon: Package,
    labels: { heading: "Gadgets", name: "Gadgets", productName: "Gadget" },
    color: "#C0392B",
    light: "#FDF0EF",
  },
  {
    id: "solar",
    image: "/slide1.png",
    alt: "Solar Panels & Inverters",
    icon: Zap,
    labels: { heading: "Solar Products", name: "Solar", productName: "Solar Product" },
    color: "#1a5c38",
    light: "#EAF3DE",
  },
  {
    id: "electronics",
    image: "/slide1.png",
    alt: "Smart Electronics",
    icon: Cpu,
    labels: { heading: "Smart Electronics", name: "Electronics", productName: "Electronic Item" },
    color: "#475569",
    light: "#F8FAFC",
  },
  {
    id: "phones",
    image: "/slide1.png",
    alt: "Latest Smartphones",
    icon: Smartphone,
    labels: { heading: "Phones", name: "Phones", productName: "Phone" },
    color: "#1E40AF",
    light: "#EFF6FF",
  },

  {
    id: "computers",
    image: "/slide1.png",
    alt: "Laptops & Computers",
    icon: Monitor,
    labels: { heading: "Laptops & Computers", name: "Computers", productName: "Computer" },
    color: "#0D9488",
    light: "#F0FDFA",
  },
  {
    id: "machinery",
    image: "/slide1.png",
    alt: "Industrial Machinery",
    icon: Wrench,
    labels: { heading: "Machinery", name: "Machinery", productName: "Machine" },
    color: "#D97706",
    light: "#FFFBEB",
  },
]

export const PRODUCT_CATEGORY_OPTIONS = CATEGORY_SLIDES.filter(
  (category): category is (typeof CATEGORY_SLIDES)[number] & { id: ProductCategoryId } =>
    category.id !== "all"
)

export function toApiCategory(category: ProductCategoryId) {
  return category.toUpperCase()
}

export function fromApiCategory(category?: string | null): ProductCategoryId {
  const normalized = (category ?? "").toLowerCase()
  return PRODUCT_CATEGORY_OPTIONS.some((item) => item.id === normalized)
    ? (normalized as ProductCategoryId)
    : "gadgets"
}