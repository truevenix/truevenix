"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Zap, Shield, Truck, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/providers/theme-provider"
import Link from "next/link"
import type { CategoryId } from "@/providers/theme-provider"

// ─────────────────────────────────────────────
// BANNER CONFIG — one entry per CategoryId
// ─────────────────────────────────────────────

const HERO_BANNERS: Record<CategoryId, {
  title: string
  subtitle: string
  description: string
  image: string
  cta: string
}> = {
  all: {
    title: "Everything Tech",
    subtitle: "One Store, All You Need",
    description: "Phones, laptops, solar, gadgets, accessories and more — Nigeria's most complete electronics destination.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    cta: "Shop All Products",
  },
  gadgets: {
    title: "Premium Gadgets",
    subtitle: "For Your Digital Lifestyle",
    description: "Discover cutting-edge gadgets, smart devices, and accessories that elevate your everyday experience.",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80",
    cta: "Shop Gadgets",
  },
  solar: {
    title: "Solar Energy",
    subtitle: "Power Your Future",
    description: "Sustainable solar panels, inverters, and batteries for homes and businesses. Go green today.",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80",
    cta: "Explore Solar",
  },
  electronics: {
    title: "Smart Electronics",
    subtitle: "Technology Redefined",
    description: "From home appliances to entertainment systems, find the electronics that match your needs.",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80",
    cta: "Browse Electronics",
  },
  phones: {
    title: "Latest Phones",
    subtitle: "Stay Connected",
    description: "Explore our collection of smartphones from top brands with the best deals and warranty.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
    cta: "View Phones",
  },
  computers: {
    title: "Laptops & Computers",
    subtitle: "Built to Perform",
    description: "HP, Dell, Lenovo and more — desktops, laptops, and monitors for work, study, and gaming.",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
    cta: "Shop Computers",
  },
  machinery: {
    title: "Industrial Machinery",
    subtitle: "Powerful Solutions",
    description: "Heavy-duty machinery and industrial equipment for businesses and manufacturing operations.",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    cta: "Shop Machinery",
  },
}

// ─────────────────────────────────────────────
// FEATURES STRIP
// ─────────────────────────────────────────────

const FEATURES = [
  { icon: Truck,      label: "Free Delivery",  desc: "On orders over ₦50,000" },
  { icon: Shield,     label: "Warranty",        desc: "1–2 year coverage"       },
  { icon: CreditCard, label: "Secure Payment",  desc: "100% protected"          },
  { icon: Zap,        label: "Fast Support",    desc: "24/7 assistance"         },
]

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function HeroSection() {
  const { activeTab, theme } = useTheme()
  const banner = HERO_BANNERS[activeTab] ?? HERO_BANNERS.all

  // "all" tab links to /shop with no category filter
  const shopHref = activeTab === "all" ? "/shop" : `/shop?category=${activeTab}`

  return (
    <section className="relative overflow-hidden">

      {/* ── Main hero ── */}
      <div
        className="relative min-h-[380px] md:min-h-[480px] flex items-center"
        style={{ background: `linear-gradient(135deg, ${theme.bg} 0%, white 100%)` }}
      >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(${theme.primary} 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">

            {/* ── Text content ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="space-y-5"
              >
                {/* Tag */}
                <span
                  className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase"
                  style={{ background: theme.primaryLight, color: theme.primary }}
                >
                  New Arrivals 2026
                </span>

                {/* Headline */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                  {banner.title}
                  <span className="block" style={{ color: theme.primary }}>
                    {banner.subtitle}
                  </span>
                </h1>

                {/* Description */}
                <p className="text-gray-600 text-base md:text-lg max-w-md leading-relaxed">
                  {banner.description}
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 pt-1">
                  <Link href={shopHref}>
                    <Button
                      size="lg"
                      className="gap-2 shadow-lg text-white"
                      style={{ background: theme.primary }}
                    >
                      {banner.cta}
                      <ArrowRight size={17} />
                    </Button>
                  </Link>
                  <Link href="/deals">
                    <Button
                      variant="outline"
                      size="lg"
                      style={{ borderColor: theme.border, color: theme.primary }}
                    >
                      View Deals
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex gap-8 pt-3">
                  {[
                    { value: "500+", label: "Products" },
                    { value: "10K+", label: "Customers" },
                    { value: "4.9★", label: "Rating" },
                  ].map(({ value, label }) => (
                    <div key={label}>
                      <p className="text-2xl md:text-3xl font-black" style={{ color: theme.primary }}>
                        {value}
                      </p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* ── Hero image ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-img`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="relative h-[280px] md:h-[380px] hidden md:block"
              >
                <div
                  className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
                  style={{ border: `4px solid ${theme.primary}25` }}
                >
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(45deg, ${theme.primary}18 0%, transparent 55%)`,
                    }}
                  />
                </div>

                {/* Floating discount badge */}
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -right-4 top-8 bg-white rounded-2xl shadow-xl p-4"
                  style={{ border: `2px solid ${theme.border}` }}
                >
                  <p className="text-[10px] text-gray-400 font-semibold">Up to</p>
                  <p className="text-2xl font-black" style={{ color: theme.primary }}>
                    40% OFF
                  </p>
                </motion.div>

                {/* Floating in-stock badge */}
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -left-4 bottom-8 bg-white rounded-2xl shadow-xl p-4"
                  style={{ border: `2px solid ${theme.border}` }}
                >
                  <p className="text-[10px] text-gray-400 font-semibold">In Stock</p>
                  <p className="text-2xl font-black text-gray-900">250+</p>
                </motion.div>
              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* ── Features strip ── */}
      <div className="bg-white border-y border-gray-100 py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                  style={{ background: theme.primaryLight }}
                >
                  <feature.icon size={20} style={{ color: theme.primary }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{feature.label}</p>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}